# One Template

## 简介
这是一个通用的前后端模板（Vue 3 + Vite 前端，NestJS 后端），包含常用的认证、验证、基础组件和开发流水线。该模板已从 haide 项目抽取通用模块并去除业务耦合，适合作为新项目的起点。

## 主要特性
- 前端：Vue 3、Pinia、Vite、基础 UI 组件（Avatar、InlineTooltip、InputSelector、SearchableSelect）
- 后端：NestJS、TypeORM、JWT 认证、中间件与拦截器（全局验证、审计日志）
- 用户注册与邮件验证（可选，基于 nodemailer）
- 已包含邮箱验证页面与“重发验证邮件”功能

## 先决条件
- Node.js >= 18
- 在需要邮件功能的环境中，请准备一个 SMTP 服务（或使用 Mailtrap / Ethereal 等测试服务）

## 仓库结构（重要路径）
- apps/server - NestJS 后端
  - src/lib/mail.ts        — 邮件发送工具（nodemailer，可选）
  - src/auth              — 认证控制器/服务（含注册/验证/重发逻辑）
  - src/users             — 用户实体与用户服务（包含 verificationToken、isVerified）
  - assets/               — 邮件模板与 logo（verify_zh.html、logo.svg）
  - config.json           — 运行时配置（位于仓库运行目录；见下文示例）
- apps/web - Vue 前端
  - src/views/EmailVerificationView.vue — 邮箱验证页
  - src/views/UserProfileView.vue       — 用户资料页（包含“重发验证邮件”按钮）
  - src/api, src/stores                   — API 封装与 Pinia store

## 快速开始（本地开发）
1. 克隆仓库并进入目录
   git clone <repo> && cd template

2. 安装依赖（根目录启用 workspace）
   npm install

   注意：server 包已在 package.json 中列出 nodemailer 作为依赖。如果希望将邮件功能保持可选，可不安装或在部署环境中移除。

3. 启动后端（开发模式）
   cd apps/server
   npm run start:dev

4. 启动前端（开发模式）
   cd apps/web
   npm run dev

5. 构建
   npm run build -w server
   npm run build -w web

## 配置（config.json）
后端从运行目录下的 config.json 读取配置（utils/config.ts 指向 process.cwd()/config.json）。示例（简化）:
```json
{
  "db": {
    "host": "127.0.0.1",
    "port": 3306,
    "username": "root",
    "password": "password",
    "database": "template_db",
    "entityPrefix": ""
  },
  "port": 7900,
  "jwtSecret": "your_jwt_secret",
  "salt": "your_password_salt",
  "github": {
    "clientId": "",
    "clientSecret": ""
  },
  "steam": {
    "apiKey": ""
  },
  "mail": {
    "host": "smtp.example.com",
    "port": 587,
    "secure": false,
    "user": "smtp-user@example.com",
    "pass": "smtp-password",
    "from": "no-reply@example.com"
  }
}
```

- mail 字段为可选：如果未配置，则邮件发送相关逻辑会被跳过或报错（取决于运行时调用处）。
- 可以通过环境变量设置服务器的域名/显示名：
  - DOMAIN：用于邮件中生成的验证链接（例如 http://localhost:3000）
  - NAME：邮件中展示的站点名称

## 邮件（SMTP）测试建议
- 推荐使用 Mailtrap、Ethereal 或真实 SMTP 服务进行端到端测试。
- mail 工具在 apps/server/src/lib/mail.ts 中暴露了 sendVerifyMail 和 verifyTransporter，可用于在调试脚本中验证连接。
- 如果未安装 nodemailer，构建不会失败（代码以动态 require 的方式引入），但在运行时尝试发送邮件会抛错提示安装依赖。默认情况下本模板在 package.json 中已将 nodemailer 列为后端依赖，运行 npm install 会安装它。

## 注册与邮箱验证流程
1. 前端在 /login 页面中的注册表单会 POST /auth/register
2. 后端 register 会创建用户并生成 verificationToken（用户记录包含 verificationToken、isVerified=false、lastVerifyMailTime）
3. 如果 mail 已配置，后端会向用户邮箱发送验证链接，链接示例：
   ${DOMAIN}/#/{username}/verification/?token={token}
4. 用户打开该链接后，前端的 EmailVerificationView 会 POST /auth/verification（包含 token），后端会校验并将用户 isVerified 标记为 true
5. 用户资料页（/:username）在发现当前用户为未验证且查看者为本人时，会显示“重发验证邮件”按钮，对应接口 POST /auth/resend-verification，后端有 1 小时的重发保护

## 前端路由
- /login                  — 登录/注册页
- /:username/verification — 邮箱验证页（查看 token 参数）
- /:username              — 用户资料页（包含重发验证邮件按钮）


