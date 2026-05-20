# 新大物流官网 — xinda56.cn

赣州新大物流有限公司官方网站，赣州↔广东专线 · 当天发货 · 次日到达。

## 技术栈

- **框架**：[Astro](https://astro.build) 6（静态站点 + API 端点）
- **适配器**：`@astrojs/cloudflare`（部署到 Cloudflare Pages）
- **样式**：Tailwind CSS 4（`@tailwindcss/vite`）
- **地图**：高德地图 JSAPI（联系页网点导航）
- **邮件**：Resend API（联系表单通知）
- **部署**：Cloudflare Pages + Pages Functions

## 目录结构

```
├── src/
│   ├── components/       # UI 组件 (Header, Footer, HomePage...)
│   ├── consts/           # 公司信息、服务项目、网点等常量
│   │   └── company.ts
│   ├── content/          # 新闻内容 (Astro Content Collections)
│   ├── layouts/          # 页面布局
│   │   └── Layout.astro
│   ├── pages/            # 页面路由
│   │   ├── api/          # API 端点 (本地开发)
│   │   │   └── contact.ts
│   │   ├── news/         # 新闻动态
│   │   ├── services/     # 服务详情
│   │   ├── index.astro   # 首页
│   │   ├── about.astro   # 关于我们
│   │   ├── contact.astro # 联系方式
│   │   └── services.astro# 服务范围
│   └── styles/
├── functions/            # Cloudflare Pages Functions (生产环境)
│   └── api/
│       └── contact.js
├── public/               # 静态资源
├── astro.config.mjs
├── start.bat             # Windows 开发启动脚本
└── package.json
```

## 本地开发

```bash
# 方式 1: 直接启动
npm run dev

# 方式 2: 使用启动脚本 (Windows)
start.bat
```

打开 `http://localhost:4321`

### 环境变量

创建 `.env` 文件（已 gitignored）：

```env
RESEND_API_KEY=re_xxxxx
EMAIL_TO=zengxiao@xinda56.cn
EMAIL_FROM=onboarding@resend.dev
```

## 联系表单

本地开发和生产的 API 路由各一个，逻辑一致：

| 环境 | 文件 | 环境变量来源 |
|------|------|-------------|
| 本地 (`astro dev`) | `src/pages/api/contact.ts` | `.env` → `import.meta.env` |
| 生产 (Cloudflare) | `functions/api/contact.js` | Pages secrets → `env.*` |

### 生产环境变量 (Cloudflare Secrets)

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name xinda
npx wrangler pages secret put EMAIL_TO --project-name xinda
```

## 构建与部署

```bash
# 构建
npm run build

# 部署到 Cloudflare Pages
cp -r functions dist/client/
npx wrangler pages deploy dist/client --project-name xinda --branch master
```
