# FileSmaller 部署文档

## 架构

| 层 | 技术 |
|---|------|
| 框架 | Next.js 15 (App Router) |
| 部署 | Cloudflare Workers (via opennextjs-cloudflare) |
| CI/CD | GitHub Actions |
| 构建产物 | `.open-next/` → Cloudflare Worker + Assets |

## 自动部署（推荐）

推送 `master` 分支自动触发部署，无需手动操作。

```bash
git add .
git commit -m "fix: some changes"
git push origin master
```

GitHub Actions workflow: `.github/workflows/deploy-cloudflare.yml`

**触发条件：** push to `master`

**部署流程：**
1. Checkout 代码
2. 安装 Node.js 22 + 依赖
3. 运行 `npm run release:ci-check`（构建检查）
4. 运行 `npm run cf:deploy`（构建并部署到 Cloudflare）

**所需 Secrets（在 GitHub → Settings → Secrets and variables → Actions）：**
- `CLOUDFLARE_API_TOKEN` — Cloudflare Workers API 令牌
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 账户 ID

## 手动部署

要求：macOS 13.5+（Cloudflare Workers runtime 限制）

```bash
# 1. 安装依赖
npm ci

# 2. 构建检查
npm run release:ci-check

# 3. 部署到 Cloudflare
npm run cf:deploy     # 等价于 opennextjs-cloudflare deploy
```

其他可用命令：

```bash
npm run dev           # 本地开发 (next dev)
npm run build         # Next.js 构建
npm run cf:preview    # wrangler dev 本地预览
```

## 配置文件

| 文件 | 用途 |
|------|------|
| `wrangler.jsonc` | Cloudflare Worker 配置（name, assets, observability） |
| `next.config.ts` | Next.js 配置 |
| `.github/workflows/deploy-cloudflare.yml` | CI/CD 自动部署流程 |

## 环境变量

项目依赖 Cloudflare Worker secrets 和环境变量，配置在 `wrangler.jsonc` 或 Cloudflare Dashboard 中管理。

## 验证部署

1. 访问 https://filesmaller.space 确认页面正常
2. 检查 GitHub Actions 日志确认无报错
3. `curl -I https://filesmaller.space` 检查响应头

## 常见问题

### macOS 版本不兼容
Cloudflare Workers runtime (workerd) 要求 macOS 13.5+。如果本地版本过低，使用 GitHub Actions 部署（推送到 master 即可）。

### 手动触发部署
在 GitHub → Actions → Deploy to Cloudflare → Run workflow 可手动触发。
