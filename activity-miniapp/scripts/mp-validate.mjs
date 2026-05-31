#!/usr/bin/env node
/**
 * 微信小程序静态校验（不依赖微信开发者工具模拟器）
 * - 解析 project.config.json / app.json / sitemap.json
 * - 校验页面、分包、TabBar、全局组件、资源路径
 * - 校验 miniprogram 目录下全部 JSON 可解析
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const errors = []
const warnings = []

function fail(msg) {
  errors.push(msg)
}

function warn(msg) {
  warnings.push(msg)
}

function readJson(filePath, label) {
  let raw
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (e) {
    fail(`${label}: 无法读取 ${filePath} (${e.message})`)
    return null
  }
  try {
    return JSON.parse(raw)
  } catch (e) {
    fail(`${label}: JSON 解析失败 ${filePath} (${e.message})`)
    return null
  }
}

function exists(relFromMp) {
  const p = path.join(MP_ROOT, relFromMp.replace(/^\//, ''))
  return fs.existsSync(p)
}

function collectPagePaths(appJson) {
  const pages = [...(appJson.pages || [])]
  for (const pack of appJson.subPackages || []) {
    const root = (pack.root || '').replace(/\/$/, '')
    for (const page of pack.pages || []) {
      const full = root ? `${root}/${page}` : page
      pages.push(full.replace(/\\/g, '/'))
    }
  }
  return pages
}

function checkPage(pagePath) {
  // app.json 中 "pages/index/index" → miniprogram/pages/index/index.{js,json,wxml,wxss}
  const normalized = pagePath.replace(/^\//, '').replace(/\\/g, '/')
  const slash = normalized.lastIndexOf('/')
  const pageDir = slash >= 0 ? normalized.slice(0, slash) : ''
  const pageName = slash >= 0 ? normalized.slice(slash + 1) : normalized
  const absDir = path.join(MP_ROOT, pageDir)

  for (const ext of ['json', 'wxml', 'js']) {
    const rel = pageDir ? `${pageDir}/${pageName}.${ext}` : `${pageName}.${ext}`
    const fp = path.join(absDir, `${pageName}.${ext}`)
    if (!fs.existsSync(fp)) {
      fail(`页面缺少文件: ${rel}`)
    }
  }

  const wxssRel = pageDir ? `${pageDir}/${pageName}.wxss` : `${pageName}.wxss`
  if (!fs.existsSync(path.join(absDir, `${pageName}.wxss`))) {
    warn(`页面无样式文件（可选）: ${wxssRel}`)
  }
}

function resolveComponentPath(fromDir, compPath) {
  if (compPath.startsWith('/')) {
    return path.join(MP_ROOT, compPath.slice(1))
  }
  return path.normalize(path.join(fromDir, compPath))
}

function checkUsingComponents(jsonPath, usingComponents = {}) {
  const fromDir = path.dirname(jsonPath)
  for (const [name, compPath] of Object.entries(usingComponents)) {
    if (typeof compPath !== 'string') continue
    const base = resolveComponentPath(fromDir, compPath)
    const candidates = [
      `${base}.json`,
      path.join(base, 'index.json'),
    ]
    if (!candidates.some((c) => fs.existsSync(c))) {
      fail(`组件路径无效 [${name}]: ${compPath}（来自 ${path.relative(ROOT, jsonPath)}）`)
    }
  }
}

function walkJsonFiles(dir, list = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue
      walkJsonFiles(full, list)
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      list.push(full)
    }
  }
  return list
}

let MP_ROOT = ''
let jsonFiles = []

const projectConfigPath = path.join(ROOT, 'project.config.json')
const projectConfig = readJson(projectConfigPath, 'project.config.json')
if (!projectConfig) {
  printReport()
  process.exit(1)
}

const mpRel = (projectConfig.miniprogramRoot || './miniprogram').replace(/^\.\//, '')
MP_ROOT = path.join(ROOT, mpRel)

if (!fs.existsSync(MP_ROOT)) {
  fail(`miniprogram 目录不存在: ${MP_ROOT}`)
  printReport()
  process.exit(1)
}

const appJsonPath = path.join(MP_ROOT, 'app.json')
const appJson = readJson(appJsonPath, 'app.json')

if (appJson) {
  const pages = collectPagePaths(appJson)
  const seen = new Set()
  for (const p of pages) {
    if (seen.has(p)) fail(`重复页面路径: ${p}`)
    seen.add(p)
    checkPage(p)
  }

  if (appJson.tabBar?.list) {
    for (const tab of appJson.tabBar.list) {
      if (!tab.pagePath) continue
      if (!pages.includes(tab.pagePath)) {
        fail(`TabBar 页面未在 pages/subPackages 中注册: ${tab.pagePath}`)
      }
      for (const key of ['iconPath', 'selectedIconPath']) {
        const icon = tab[key]
        if (icon && !exists(icon)) {
          fail(`TabBar 图标不存在: ${icon}`)
        }
      }
    }
  }

  if (appJson.tabBar?.custom) {
    const tabBarDir = path.join(MP_ROOT, 'custom-tab-bar')
    for (const file of ['index.js', 'index.json', 'index.wxml', 'index.wxss']) {
      if (!fs.existsSync(path.join(tabBarDir, file))) {
        fail(`自定义 TabBar 缺少: custom-tab-bar/${file}`)
      }
    }
  }

  checkUsingComponents(appJsonPath, appJson.usingComponents || {})

  const sitemapPath = path.join(MP_ROOT, appJson.sitemapLocation || 'sitemap.json')
  if (fs.existsSync(sitemapPath)) {
    readJson(sitemapPath, 'sitemap.json')
  } else {
    warn(`未找到 sitemap: ${sitemapPath}`)
  }
}

jsonFiles = walkJsonFiles(MP_ROOT)
for (const fp of jsonFiles) {
  const data = readJson(fp, path.relative(ROOT, fp))
  if (data?.usingComponents) {
    checkUsingComponents(fp, data.usingComponents)
  }
}

function printReport() {
  console.log(`\n[mp:validate] 根目录: ${ROOT}`)
  if (MP_ROOT) console.log(`[mp:validate] 小程序目录: ${MP_ROOT}\n`)
  if (warnings.length) {
    console.log(`警告 (${warnings.length}):`)
    warnings.forEach((w) => console.log(`  ⚠ ${w}`))
    console.log('')
  }
  if (errors.length) {
    console.log(`错误 (${errors.length}):`)
    errors.forEach((e) => console.log(`  ✖ ${e}`))
    console.log('\n[mp:validate] 未通过\n')
  } else {
    const jsonCount = jsonFiles.length ? `${jsonFiles.length} 个 JSON 文件，` : ''
    console.log(`[mp:validate] 通过（${jsonCount}0 错误）\n`)
  }
}

printReport()
process.exit(errors.length ? 1 : 0)
