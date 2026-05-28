# 出海工具站 SOP

## 目标

这份文档用来沉淀一次完整的出海工具站搭建流程，方便后续新项目直接复用。范围覆盖：

- 选题与定位
- 代码与项目初始化
- GitHub 仓库
- 域名购买
- Cloudflare 配置
- 部署上线
- SEO 基础设施
- Search Console / GA4
- 日常运营跟踪

本文档不是单个项目说明，而是后续做新网站时可以照着执行的高层流程。

## 一、先定项目方向

先回答 4 个问题：

1. 这个站解决什么具体问题
- 不要做泛工具站定位
- 要用一句话说清楚，例如：
  - `Compress PDF for upload`
  - `Make scanned PDF smaller`
  - `Reduce resume PDF size`

2. 用户为什么会搜索它
- 优先选有明确搜索意图的场景词
- 不要只想产品功能，要想用户会怎么搜

3. 当前版本先做 MVP 还是做完整产品
- 优先做 MVP
- 先跑通页面、核心功能、上线、收录
- 不要在 0 阶段追求功能完美

4. 变现路径大概是什么
- 广告
- 会员
- API
- 工具矩阵导流

## 二、代码与项目初始化

建议默认方案：

- 框架：`Next.js`
- 语言：`TypeScript`
- 部署目标：`Cloudflare Workers`
- Git：`GitHub`

基本步骤：

1. 建项目目录
2. 初始化前端项目
3. 做首页和最小可用功能
4. 先跑通本地开发和生产构建

最低要求：

- `npm run dev` 能跑
- `npm run build` 能过
- 首页可访问
- 至少 1 个核心功能页可访问

注意：

- 不要一开始就做复杂架构
- 不要先追求后台、账户系统、支付系统
- 先把站点本身跑通

## 三、GitHub 仓库

标准动作：

1. 本地 git 初始化
2. 创建 GitHub 仓库
3. 关联 `origin`
4. 首次提交并推送

建议：

- 仓库名和项目功能一致
- 默认直接用公开仓库即可，方便后续自动部署

需要记录：

- 仓库地址
- 默认分支名
- 本地项目目录

## 四、域名购买

建议原则：

- 优先短、直白、可理解
- 优先和问题场景相关
- 不要追求太复杂品牌名

本次实践里使用的平台：

- Namecheap
- Porkbun 也可作为备选

建议步骤：

1. 先确认主关键词和品牌方向
2. 买域名
3. 明确主域名是否使用 apex

建议：

- 优先使用根域名作为主站：
  - `filesmaller.space`
- `www` 作为跳转或备用

## 五、Cloudflare 接管域名

推荐做法：

- 域名在注册商购买
- DNS 和站点接管放到 Cloudflare

标准流程：

1. 在 Cloudflare 添加站点
2. 选择 `Connect existing domain`
3. 拿到 Cloudflare nameserver
4. 回到注册商修改 nameserver
5. 等待 Cloudflare 接管生效

重要点：

- 主域能开不代表 `www` 一定已经生效
- `www` 需要单独 DNS 记录或单独 Worker 自定义域名
- 很多问题本质上是 DNS 传播，不是配置逻辑错

## 六、部署上线

本次实践的部署方案：

- 平台：Cloudflare Workers
- 构建适配：`@opennextjs/cloudflare`
- 自动部署：GitHub Actions

建议流程：

1. 本地先确认：
- `npm run build`
- `npm run cf:build`

2. 配置 Cloudflare 所需文件
- `wrangler.jsonc`
- `open-next.config.ts`

3. 配置 GitHub Actions 自动部署
- push 到 `master` 自动触发

4. 配 GitHub Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

5. 验证线上默认地址
- `*.workers.dev`

再做正式域名绑定：

1. Worker 绑定主域名
2. 主域名成功打开
3. 再处理 `www`

### `www` 的标准做法

两种方案：

1. `www` 也绑定到同一个 Worker
2. `www` 做 301 跳转到主域

更推荐：

- 主域名做主站
- `www` 301 跳到主域

Cloudflare 里需要：

- `A` 记录：`www -> 192.0.2.0`
- `Proxy status`: `Proxied`
- `Redirect Rule`：
  - `http*://www.domain.com/*`
  - 跳转到 `https://domain.com/${1}`

## 七、SEO 基础设施

上线后最优先做的不是堆功能，而是把 SEO 基础设施补齐。

必须有：

1. 每页独立 `title`
2. 每页独立 `description`
3. `canonical`
4. `robots.txt`
5. `sitemap.xml`
6. 内链结构
7. FAQ 结构化数据

建议做法：

- 用动态配置生成程序化 SEO 页面
- 不要手写几十个页面
- 用统一模板 + 内容配置表扩页

每个落地页至少有：

- H1
- 场景说明
- 使用步骤
- FAQ
- 相关推荐内链

## 八、程序化 SEO 页面扩张

正确思路：

- 先做 1 套模板
- 再做关键词配置表
- 通过配置生成页面

优先顺序：

1. 通用词
- `compress pdf online`
- `reduce pdf size online`

2. 场景词
- `compress pdf for upload`
- `compress pdf for email`
- `compress resume pdf`

3. 长尾高意图词
- `reduce pdf size for visa application`
- `compress pdf for portal upload`
- `compress pdf for mobile upload`

注意：

- 不要只换标题
- 每页正文和 FAQ 要跟搜索意图一致

## 九、Search Console

站点上线后尽快接：

1. 进 Google Search Console
2. 添加 `Domain property`
3. 通过 DNS TXT 验证
4. 提交 sitemap

TXT 记录注意：

- 类型：`TXT`
- 代理：`DNS only`
- 内容里不要手动加多余引号

提交后不要急：

- 新站通常会显示：
  - `正在处理数据，请过 1 天左右再来查看`
- 这是正常状态

需要重点看：

- `Sitemaps`
- `Pages`
- `Performance`

## 十、Google Analytics 4

Search Console 负责看搜索表现，GA4 负责看访问和页面行为。

标准步骤：

1. 去 `analytics.google.com`
2. 创建账号
3. 创建 property
4. 新建 `Web` stream
5. 拿到 `Measurement ID`

格式示例：

- `G-XXXXXXXXXX`

前端接入方式：

- 在站点全局 layout 注入 `gtag.js`
- 用环境变量或固定 ID 配置

## 十一、文档沉淀

每个项目至少留 3 份文档：

1. 项目说明
- 域名在哪买
- 部署在哪里
- 代码在哪
- 当前功能是什么

2. 运营记录
- Search Console 每日变化
- impressions
- clicks
- top queries
- top pages

3. SOP / 流程文档
- 给未来新项目复用

## 十二、上线后每日动作

每天不要瞎改代码，先看数据。

建议每天记录：

- Indexed pages
- Discovered pages
- Crawled but not indexed
- Total impressions
- Total clicks
- Top queries
- Top pages
- Notes

如果出现：

- 有曝光没点击：改标题和描述
- 有点击没转化：改首页文案和入口
- 不收录：补内链和内容差异化
- 某类关键词起量：继续扩同类页

## 十三、当前阶段最常见的坑

1. 本地能跑，线上没部署成功
- 一定要检查：
  - GitHub Actions
  - Workers 部署状态
  - 线上 `sitemap.xml` / `robots.txt`

2. 域名主站能开，`www` 不通
- 先查 DNS
- 再查 Redirect Rule
- 最后考虑传播时间

3. Search Console 报错就以为是 DNS 错
- `401 Unauthorized` 多半是 Google 登录态问题
- `Verification failed` 才更像验证或 DNS 问题

4. 一开始就做太多功能
- 工具站早期增长往往先靠 SEO，不是功能复杂度

5. GitHub 推不出去
- 很多时候是本地网络或代理问题，不是仓库问题
- 如果当前机器已经配置了代理快捷命令，可先执行 `proxy on`
- 再执行 `git push`、`gh run list`、`gh workflow` 等 GitHub 相关命令
- 如果 `curl -I https://github.com` 都不通，就不要继续盲推

## 十四、推荐执行顺序

下次做新站，建议按这个顺序执行：

1. 定位和关键词方向
2. 搭代码和 MVP
3. 建 GitHub 仓库
4. 本地 build 跑通
5. 部署到 Cloudflare Workers
6. 买域名
7. 域名接入 Cloudflare
8. 绑定主域
9. 补 `robots.txt` / `sitemap.xml`
10. 做第一批 SEO 页面
11. 接 Search Console
12. 接 GA4
13. 每天看数据，再决定是否扩页或补功能

## 十五、这次项目的实际样本

本次项目对应：

- 站点：`filesmaller.space`
- 代码仓库：`https://github.com/horaceace/target-pdf-compress`
- 技术栈：`Next.js + Cloudflare Workers`
- 核心路线：先上线，再做 SEO，再接 Search Console / GA4

这个样本适合后续复制到其他出海工具站项目。
