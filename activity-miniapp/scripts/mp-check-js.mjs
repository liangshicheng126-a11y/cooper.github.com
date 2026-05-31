#!/usr/bin/env node
/**
 * 校验 miniprogram 下全部 .js 文件语法（node --check）
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const projectConfig = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'project.config.json'), 'utf8'),
)
const mpRel = (projectConfig.miniprogramRoot || './miniprogram').replace(/^\.\//, '')
const MP_ROOT = path.join(ROOT, mpRel)

function walkJs(dir, list = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue
      walkJs(full, list)
    } else if (ent.isFile() && ent.name.endsWith('.js')) {
      list.push(full)
    }
  }
  return list
}

const files = walkJs(MP_ROOT)
const failed = []

for (const file of files) {
  const rel = path.relative(ROOT, file)
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) {
    const msg = (result.stderr || result.stdout || '').trim()
    failed.push({ rel, msg })
  }
}

console.log(`\n[mp:check:js] 检查 ${files.length} 个 JS 文件\n`)

if (failed.length) {
  failed.forEach(({ rel, msg }) => {
    console.log(`  ✖ ${rel}`)
    if (msg) console.log(`    ${msg.split('\n')[0]}`)
  })
  console.log(`\n[mp:check:js] 未通过（${failed.length} 个文件）\n`)
  process.exit(1)
}

console.log('[mp:check:js] 全部通过\n')
process.exit(0)
