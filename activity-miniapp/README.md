# 活动报名管理微信小程序

一个功能完整的微信小程序，支持活动发布、报名统计、签到核销、AI海报生成等。

## 项目结构

```
activity-miniapp/
├── miniprogram/          # 微信小程序前端
│   ├── app.js/json/wxss  # 全局配置
│   ├── pages/
│   │   ├── index/        # 首页（活动列表、搜索）
│   │   ├── activity-detail/  # 活动详情
│   │   ├── create-activity/  # 发布活动（三步骤）
│   │   ├── register/         # 报名表单
│   │   ├── my/               # 我的页面
│   │   ├── admin/            # 管理后台（名单/分析/举报）
│   │   ├── checkin/          # 签到二维码
│   │   └── poster/           # AI 海报生成
│   ├── components/
│   │   ├── activity-card/    # 活动卡片（状态标签+进度条）
│   │   ├── privacy-modal/    # 隐私协议弹窗
│   │   └── custom-form/      # 动态报名表单
│   └── utils/
│       ├── request.js    # HTTP 封装（含 Token 刷新）
│       ├── crypto.js     # 前端脱敏工具
│       ├── date.js       # 日期工具（含冲突检测）
│       ├── i18n.js       # 中/英文国际化
│       ├── map.js        # 腾讯地图 SDK 封装
│       └── config.js     # 环境配置
├── backend/              # Node.js 后端
│   ├── src/
│   │   ├── app.js            # Express 入口
│   │   ├── config/           # 数据库/Redis 配置
│   │   ├── controllers/      # 控制器
│   │   ├── routes/           # 路由
│   │   ├── middleware/       # JWT/审计/校验中间件
│   │   ├── services/         # 微信/AI/地图服务
│   │   ├── jobs/             # 定时任务（提醒）
│   │   └── utils/            # 加密/日志工具
│   ├── package.json
│   └── .env.example
└── database/
    └── schema.sql        # MySQL 建表 SQL
```

## 核心功能

### 活动管理
- ✅ 多步骤创建活动（基本信息 → 时间地点 → 报名设置）
- ✅ 灵活的自定义报名字段（姓名/手机/身份证/自定义等）
- ✅ 子活动/平行场次管理
- ✅ 活动封面图上传（腾讯云 COS）
- ✅ 人数限制（可设置或不限）
- ✅ 活动状态标签：进行中（绿色脉冲）/ 已结束 / 已报满 / 未开始

### 报名功能
- ✅ 实时进度条（已报名/限制人数）
- ✅ 时间冲突检测（自动检测并允许强制报名）
- ✅ 防并发报名（数据库事务 + 行锁）
- ✅ 取消报名

### 安全与隐私
- ✅ 微信登录 + JWT 鉴权
- ✅ AES-256-GCM 加密敏感字段（姓名、手机、身份证、邮箱）
- ✅ 默认脱敏显示（138\*\*\*\*5678）
- ✅ 查看/导出时需短信验证码二次验证
- ✅ 审计日志记录所有查看/导出操作
- ✅ 隐私协议弹窗（首次使用必须同意）
- ✅ 用户数据下载与删除（账号注销）

### 通知提醒
- ✅ 活动前 24 小时和 1 小时自动推送微信订阅消息
- ✅ 活动信息变更一键通知所有报名者
- ✅ 生成群公告文字（一键复制）

### 内容安全
- ✅ 接入微信 msgSecCheck（文本审核）
- ✅ 接入微信 imgSecCheck（图片审核）
- ✅ 举报功能（举报后自动冻结 → 管理员审核）
- ✅ 管理员一键下架并填写理由

### 签到功能
- ✅ 生成活动专属二维码（基于 HMAC 时效 token）
- ✅ 扫码签到（小程序扫一扫）
- ✅ 实时签到名单展示

### 数据分析
- ✅ 报名人数趋势图
- ✅ 到场率、取消率统计
- ✅ 字段分布分析

### AI 海报生成
- ✅ 调用豆包（火山方舟）图像生成 API
- ✅ 多风格选择（现代/炫彩/极简/自然/科技/复古）
- ✅ 颜色主题自定义
- ✅ 生成海报内容安全检测

### 导航与地图
- ✅ 腾讯地图 chooseLocation 选点
- ✅ 地图预览确认位置
- ✅ 一键导航（openLocation）

### 国际化
- ✅ 中/英文切换（i18n）

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入真实配置

npm install
# 初始化数据库
mysql -u root -p < ../database/schema.sql

# 已有库升级（补 moderation_status、微信群字段、学校名册表等）
cd ../database && mysql -u root -p activity_miniapp < migrate-all.sql

# 开发模式
npm run dev

# 生产模式
npm start
```

### 前端（微信小程序）

1. 用微信开发者工具打开项目根目录 `activity-miniapp/`（含 `project.config.json`，不要只打开 `miniprogram/` 子目录）
2. 修改 `miniprogram/utils/config.js` 中的 `API_BASE_URL` 和 `APP_ID`
3. 在根目录 `project.config.json` 中填入正确的小程序 AppID
4. 编译运行

#### 命令行校验（不依赖模拟器）

在项目根目录 `activity-miniapp/` 执行：

```bash
npm run mp:validate   # 校验 app.json、页面、分包、TabBar、组件与 JSON
npm run mp:check:js   # 校验全部 .js 语法
npm run mp:check      # 以上两项
npm run mp:build      # 与 mp:check 相同（发布前静态检查）
```

说明：原生小程序无 Webpack 打包产物；`mp:build` 表示发布前的静态检查，不能替代微信开发者工具的编译预览。模拟器异常时仍可用 `npm run mp:check` 验证工程完整性，并用「预览 / 真机调试」查看界面。

## 数据库设计

| 表名 | 说明 |
|------|------|
| `users` | 用户（openid、昵称、头像、加密手机号） |
| `activities` | 活动主表（含自定义字段 JSON） |
| `sub_activities` | 子活动/场次 |
| `registrations` | 报名记录（敏感字段 AES 加密） |
| `audit_logs` | 审计日志 |
| `reports` | 举报记录 |
| `verify_codes` | 短信验证码 |

## 需要配置的第三方服务

| 服务 | 用途 | 申请地址 |
|------|------|---------|
| 微信小程序 AppID + Secret | 登录、内容安全、订阅消息 | [mp.weixin.qq.com](https://mp.weixin.qq.com) |
| 腾讯云 COS | 图片存储 | [cloud.tencent.com](https://cloud.tencent.com) |
| 腾讯云 SMS | 导出验证码短信 | [cloud.tencent.com](https://cloud.tencent.com) |
| 腾讯地图 SDK | 选点/导航 | [lbs.qq.com](https://lbs.qq.com) |
| 豆包（火山方舟）| AI 海报生成 | [volcengine.com/ark](https://www.volcengine.com/product/ark) |
| 腾讯云 KMS（可选）| 密钥管理 | [cloud.tencent.com](https://cloud.tencent.com) |

## 安全要点

- 所有敏感字段（手机号/邮箱/身份证/姓名）使用 **AES-256-GCM** 加密存储
- 密钥存储于环境变量，建议生产环境使用腾讯云 KMS 管理
- 导出名单需短信验证码二次验证
- 所有查看/导出操作记录审计日志
- 前端展示时默认脱敏（138\*\*\*\*5678）
- 接入微信内容安全 API 防违规

## 小程序发布审核建议

1. **隐私协议**：首次启动强制弹出，不同意则退出
2. **权限说明**：`app.json` 中填写地理位置权限说明
3. **内容安全**：发布内容均经过微信 secCheck 审核
4. **测试违规内容**：提交审核前测试敏感词拦截

## License

MIT
