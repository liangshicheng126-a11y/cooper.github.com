# Playwright + Chrome 配置说明

## 已完成（自动）

1. **Google Chrome** 已通过 winget 安装  
   路径：`C:\Users\L\AppData\Local\Google\Chrome\Application\chrome.exe`
2. **Playwright 浏览器**：已识别系统 Chrome（`npx playwright install chrome`）
3. **Cursor MCP** 已更新（`C:\Users\L\.cursor\mcp.json`）：
   - `playwright`：独立 Chrome 窗口（`--browser=chrome`），配置目录 `X:\A\1\.playwright-mcp-profile`（避免 `C:\Users\L\.playwright-mcp` 无写入权限）
   - `playwright-extension`：连接**你已登录的 Chrome 标签页**（Boss/猎聘/51job/58）

## 你需要手动完成（约 2 分钟）

### 步骤 1：安装 Playwright Chrome 扩展

在 Chrome 中打开并点击「添加至 Chrome」：

https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm

### 步骤 2：复制扩展 Token（可选，免每次点批准）

1. 安装后点击浏览器工具栏中的 **Playwright** 扩展图标  
2. 复制页面上显示的 `PLAYWRIGHT_MCP_EXTENSION_TOKEN`  
3. 打开 `C:\Users\L\.cursor\mcp.json`，在 `playwright-extension` → `env` 中加入：

```json
"PLAYWRIGHT_MCP_EXTENSION_TOKEN": "粘贴你的token"
```

### 步骤 3：重启 Cursor MCP

1. `Cursor Settings` → `MCP`  
2. 对 `playwright` 和 `playwright-extension` 点 **Restart**（或重启 Cursor）  
3. 确保两个服务状态为绿色

### 步骤 4：连接已登录的招聘网站

1. 在 Chrome 中打开并登录：Boss直聘、猎聘、智联、58同城  
2. 在 Cursor 对话中让我使用 **playwright-extension** 检索时  
3. 扩展会弹出「选择要连接的标签页」→ 选中对应网站标签 → 确认

## 两种模式怎么选

| 模式 | MCP 名称 | 适用场景 |
|------|----------|----------|
| 独立浏览器 | `playwright` | 无需登录的公开页、测试、截图 |
| 扩展桥接 | `playwright-extension` | **已登录** Boss/猎聘/51job/58，复用你的 Cookie |

## 验证是否成功

配置完成后对我说：「用 playwright-extension 打开 Boss 直聘当前标签页并截图」，若能看到岗位列表即表示可用。

## 故障排除

- **报错 Chrome not found**：确认 `chrome.exe` 路径存在，重启 Cursor  
- **扩展连不上**：检查扩展是否启用、是否选了正确标签页  
- **验证码**：招聘平台出现验证码时需你手动完成，我再继续检索
