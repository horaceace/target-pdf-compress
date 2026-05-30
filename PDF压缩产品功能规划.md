# PDF 压缩产品功能规划

## 目标

当前站点已经完成：

- 基础站点上线
- SEO 基础设施
- 程序化 SEO 页面
- Search Console / GA4 接入

下一阶段重点不再是继续堆页面，而是把产品能力做得更像一个真正可用的 PDF 压缩工具。

这份文档用于规划后续功能路线，核心原则是：

- 先把 `PDF 压缩` 这一个核心能力做强
- 再补围绕压缩流程的体验
- 然后再扩展相关 PDF 工具矩阵
- 最后再考虑高级能力和商业化

## 一、产品现状

当前已有能力：

- 浏览器上传 PDF
- 浏览器内执行 PDF 压缩
- `light / balanced / strong / extreme / scanned` 多压缩模式
- 目标大小提示：`500 KB / 1 MB / 2 MB / 5 MB`
- 拖拽上传和多文件批量压缩
- 单文件下载和批量 ZIP 下载
- 压缩前后体积、节省比例、页数、模式、文件画像展示
- 一键尝试更强压缩模式
- 错误提示和重试路径
- `Merge PDF / Split PDF / PDF to JPG / JPG to PDF / Rotate PDF / Remove PDF pages / Reorder PDF pages`
- 50+ 个 SEO 场景页

当前主要不足：

- 浏览器端压缩上限明显，遇到部分扫描件、大图片 PDF 仍可能压不动
- `scanned` 模式已有浏览器渲染重建路径，但还缺少更细的彩色/黑白/证件/表格识别策略
- 缺少一组固定样本的压缩效果基准测试，难以量化每次算法改动是否真的变强
- 缺少服务端强压模式，无法处理超大文件、极限目标大小、OCR 后压缩等高级需求
- 转化闭环还比较轻，尚未接入广告位、邮件收集、会员或 API 试探

## 二、功能规划原则

后续所有功能按以下优先级判断：

1. 是否直接增强压缩核心价值
2. 是否能提升用户完成一次压缩任务的成功率
3. 是否与现有 SEO 流量高度相关
4. 是否适合后续变现

不优先的事情：

- 登录注册
- 支付系统
- 复杂用户中心
- 太早扩到不相关工具
- 过早平台化

## 三、P1：核心压缩能力升级

这是最优先的一层。

### 1. 更强压缩模式

目标：

- 不只是“能压缩”
- 而是让用户明显感知到文件真的变小了

建议能力：

- 轻度压缩
- 标准压缩
- 强力压缩
- 极限压缩

预期价值：

- 适配不同文档类型
- 减少“压了但没什么变化”的感知

### 2. 扫描件压缩优化

目标：

- 专门提升扫描 PDF 的压缩效果

建议能力：

- 对图片页做更激进的降采样
- 针对彩色扫描和黑白扫描做不同策略
- 对超大图片做尺寸重采样

预期价值：

- 这类文件最痛、也最难压
- 做好了会显著提升工具价值

### 3. 图片重采样

目标：

- 针对 PDF 内嵌图片做尺寸和质量控制

建议能力：

- 统一缩放大图
- 调整图片质量
- 提供“更小体积 / 更好清晰度”的权衡说明

### 4. 结果信息更完整

压缩完成后展示：

- 原始大小
- 压缩后大小
- 节省比例
- 页数
- 当前使用模式

目标：

- 提升用户对结果的感知价值

## 四、P2：压缩流程体验升级

这一层不是改变产品方向，而是把主流程做顺。

### 1. 拖拽上传

目标：

- 让上传动作更自然

### 2. 多文件批量压缩

目标：

- 从单文件工具升级到可工作使用的工具

建议：

- 一次上传多个 PDF
- 每个文件独立压缩状态
- 支持全部下载

### 3. 上传限制和错误提示

需要补：

- 文件格式不支持提示
- 文件过大提示
- 压缩失败提示
- 浏览器兼容性提示

### 4. 压缩结果对比

建议：

- 用清晰的结果面板展示压缩前后
- 强调“更适合上传 / 更适合邮件 / 更适合申请材料”

### 5. 一键再压一次

目标：

- 如果当前结果还不够小，允许直接继续压

建议：

- `Try stronger compression`
- `Try balanced mode`

## 五、P3：压缩相关工具矩阵

这一层开始扩产品矩阵，但仍然围绕当前用户需求。

建议顺序：

1. `Merge PDF`
2. `Split PDF`
3. `PDF to JPG`
4. `JPG to PDF`
5. `Rotate PDF`
6. `Remove PDF pages`
7. `Reorder PDF pages`

为什么是这些：

- 和压缩用户高度重合
- 容易做站内内链
- 容易继续扩 SEO 页面
- 对后续广告和会员更友好

不建议现在就做的：

- Word / Excel / PPT 大量格式转换矩阵
- 电子签名
- 在线编辑器
- PDF 注释协作

## 六、P4：高级功能和变现准备

等有自然流量后再做。

### 1. 指定目标大小压缩

例如：

- `Compress PDF to 1MB`
- `Compress PDF to 500KB`

说明：

- 这类需求存在
- 但当前阶段不如“最大化压缩”更重要

### 2. 服务端强压模式

目标：

- 解决浏览器压不动的大文件和扫描件

适合：

- 超大 PDF
- 多图片扫描件
- 严格上传限制场景

### 3. OCR 后再压缩

适合：

- 扫描表单
- 证件材料
- 归档文档

### 4. API

适合：

- 有稳定需求的开发者或企业用户

### 5. 会员和额度机制

适合：

- 批量任务
- 更高单文件上限
- 更强压缩模式

## 七、推荐开发顺序

截至 2026-05-29，原规划中的 `P2` 主流程体验和 `P3` PDF 工具矩阵已经提前完成第一版。后续不再按旧顺序从头推进，而是进入 `P1.5` 和运营验证阶段。

### 已完成阶段

- `P1 v1`：压缩模式、目标大小提示、结果信息、扫描件模式第一版
- `P2 v1`：拖拽上传、批量压缩、任务列表、全部下载、错误重试、一键再压
- `P3 v1`：7 个相关 PDF 工具矩阵和对应 SEO 页面
- 首页结构：8 个核心工具入口、Tools 下拉菜单、50+ 场景页入口

### 下一阶段：P1.5 压缩效果验证和增强

目标：

- 不继续盲目堆 SEO 页面
- 先建立压缩效果基准
- 找出当前算法在哪些 PDF 类型上弱
- 再针对扫描件和图片型 PDF 做增强

建议顺序：

1. 建立本地压缩样本集和测试记录
2. 增加压缩效果基准脚本，输出原始大小、压缩后大小、节省比例、页数、模式
3. 用样本跑 `light / balanced / strong / extreme / scanned`，确认每种模式真实差异
4. 根据结果优化扫描件渲染重建参数
5. 再决定是否进入服务端强压模式

### 后续阶段：运营和变现验证

- Search Console 数据观察：收录、曝光、点击、Top queries
- GA4 Measurement ID 配置和事件验证
- 首页和工具页增加更明确的站内转化路径
- 有流量后再测试广告位、邮件收集或高级压缩入口

## 八、当前最值得优先做的 3 件事

如果只能选 3 个，当前建议是：

1. 建立压缩效果基准测试
- 先量化每种模式到底能压多少，否则算法优化没有判断标准

2. 加强扫描件和图片型 PDF 压缩
- 这是当前工具价值的最大短板，也是用户最容易感知“有没有用”的地方

3. 配置并验证 GA4 事件
- 需要知道用户是否上传、是否压缩成功、是否下载、在哪一步流失

## 九、阶段判断标准

什么时候该继续扩功能，什么时候该先停？

如果出现下面情况，可以优先做功能：

- SEO 已经开始带来访问
- 用户进入上传流程但压缩效果不够好
- 用户需求明显集中在扫描件、大文件、批量场景

如果出现下面情况，应先继续运营和 SEO：

- 还没有明显流量
- 还没有用户使用数据
- 还不清楚用户最痛的是哪一类 PDF

## 十、结论

后续产品方向不要跑偏。

正确路线是：

1. 先把 PDF 压缩本身做强
2. 再把上传和下载体验做顺
3. 然后扩相关 PDF 工具矩阵
4. 最后再考虑高级能力和商业化

短期最优先：

- 压缩效果基准测试
- 扫描件和图片型 PDF 压缩增强
- GA4 事件和 Search Console 运营观察

## 十一、当前阶段状态

截至当前版本，可以这样判断：

### P2 状态

- `P2` 本轮基本完成

已具备：

- 拖拽上传
- 多文件批量上传
- 手动点击开始压缩
- 批量任务列表
- 清空列表
- 全部下载
- 错误重试
- 更强模式再压一次
- 列表滚动，不会无限拉长右侧面板

结论：

- 从上传、压缩、下载的主流程体验来看，`P2` 已达到可用版本

### P1 状态

- `P1` 本轮完成第一版

已具备：

- `light / balanced / strong / extreme / scanned` 模式
- 模式之间已有压缩结果差异
- `strong / extreme / scanned` 比基础模式更激进
- 结果区有 warning 和 recommendation
- 模式差异已有解释层

仍未完成的部分：

- 扫描件专项优化仍然不够深
- 浏览器内压缩的上限依然明显
- 还没有更细粒度的文件类型识别和针对性策略

结论：

- `P1` 当前应标记为 `v1 done`
- 后续仍可继续做 `P1.5`，重点加强扫描件和更强压缩能力

## 十二、下一步行动安排

### A. 立即做：压缩效果基准

状态：

- `v1 基础设施已完成，闭环已跑通`
- 已新增 `npm run benchmark:compression`
- 已新增 `npm run fixtures:compression`
- 已新增 `scripts/benchmark-compression.mjs`
- 已新增 `scripts/create-compression-fixtures.mjs`
- 已新增 `test-fixtures/pdf-compression/` 样本目录说明
- 真实 PDF 样本和 benchmark 输出默认不提交，避免误提交敏感文件
- 已用合成样本跑通 benchmark 输出：Markdown / JSON 均可生成
- 已升级合成样本，包含嵌入位图的 `image-heavy` PDF
- 已继续升级合成样本，新增 `sample-scanned-color.pdf` 和 `sample-scanned-bw.pdf`，用于覆盖彩色扫描和黑白/灰度扫描场景
- 当前本地 synthetic fixture 共 6 个：clean office、mixed content、image-heavy、scanned-like、scanned-color、scanned-bw
- 当前结果显示：`pdf-lib` pass 对图片型 PDF 基本无法压缩，8.5 MB 图片型样本在 Node benchmark 中约 `0%` 缩小
- 已用本地浏览器手工验证 `Scanned PDF` 渲染重建路径：8.5 MB 图片型样本可压到约 776 KB，约 `91%` 缩小
- 已新增本地开发页 `/dev/compression-benchmark`，可在浏览器中自动跑真实压缩路径
- 已用该页面验证：同一 8.5 MB 图片型样本中，`Light / Balanced / Strong / Extreme` 约 `0%`，`Scanned PDF` 约 `91%`
- `/dev/compression-benchmark` 已支持导出 JSON 和 Markdown，方便沉淀浏览器 benchmark 结果
- 已新增 dev-only 本地 fixture suite：`/dev/compression-benchmark/fixtures` 读取 `test-fixtures/pdf-compression/` 下的本地 PDF，开发页可一键跑完所有 fixture 的浏览器真实压缩路径
- 已优化 `Scanned PDF` 浏览器路径：增加 grayscale scan / portal grayscale scan 候选；用户显式选择 `Scanned PDF` 时，即使文件体积不满足 image-heavy 阈值，也会让渲染重建候选和结构压缩候选一起比大小，最终选择更小结果
- 已用 6 个本地 fixture 跑通浏览器 suite：`sample-image-heavy.pdf` 最佳模式为 `Scanned PDF`，约 `97%` 缩小，8.5 MB -> 265 KB；`sample-scanned-color.pdf` 最佳模式为 `Scanned PDF`，约 `98%` 缩小，8.1 MB -> 190 KB；`sample-scanned-bw.pdf` 最佳模式为 `Scanned PDF`，约 `67%` 缩小，614 KB -> 203 KB；`sample-scanned-like.pdf` 最佳模式为 `Scanned PDF`，约 `57%` 缩小，214 KB -> 92 KB；小型 office/mixed fixture 基本无明显压缩空间
- 浏览器 suite 当前支持导出 Markdown 汇总，可沉淀每个样本的最佳模式、scanned 结果和 scanned 参数说明
- 浏览器 suite 已补充完整明细导出：Markdown 包含 `Summary` 和 `Full mode results`，JSON 包含每个 fixture 的 5 个模式结果、耗时、profile、压缩细节和错误信息，便于后续版本间对比
- `Scanned PDF` 已升级为多候选策略，会尝试不同 render scale / JPEG quality，并自动选择最小结果
- 当前 browser benchmark：8.5 MB 图片型样本可压到约 97 KB，约 `99%` 缩小，选择 `portal limit scan: scale 0.82, JPEG quality 0.44`
- 已增加质量保护：无目标大小时默认不启用最激进的 `portal limit scan`
- 当前验证结果：默认 `Scanned PDF` 路径约 8.5 MB -> 265 KB，选择 `smallest scan: scale 0.95, JPEG quality 0.52`
- 当前验证结果：选择 `Under 500 KB` 目标时启用 `portal limit scan`，约 8.5 MB -> 97 KB，并显示目标已达成
- 结果区已增加清晰度提示：默认扫描路径提示“Balanced scan reduction”，目标极限路径提示“Smallest upload-first result”并提醒提交前打开检查
- 结果区已增加按需第一页预览：用户可点击 `Preview first page` 渲染压缩后 PDF 的第一页，辅助判断清晰度
- 预览已升级为原始/压缩后并排对比：用户可点击 `Compare first page` 同时查看原始第一页和压缩后第一页

目的：

- 解决“自己测不出来压缩效果”的问题
- 建立一套可重复跑的本地样本和结果表
- 后续每次改压缩算法，都能判断是否真的变强

建议实现：

- 新建 `test-fixtures/pdf-compression/` 存放样本 PDF，目录不提交真实敏感文件
- 新建 `scripts/benchmark-compression.mjs`
- 对每个样本跑 5 个模式：`light / balanced / strong / extreme / scanned`
- 输出 Markdown 或 JSON 结果：文件名、页数、原始大小、压缩后大小、节省比例、耗时、推荐模式
- 当前 Node benchmark 覆盖共享的 `pdf-lib` 压缩 pass；`scanned` 的浏览器渲染强压路径需要后续补 Playwright benchmark

下一步：

- 补 3-6 个真实但非敏感 PDF 样本，覆盖扫描件、图片型 PDF、文本型 PDF、简历类 PDF、表格类 PDF
- 继续补充真实样本后，用 dev benchmark suite 跑真实 `scanned` 渲染路径输出结果表
- 根据真实样本结果决定继续优化 `scanned`、`strong` 还是 `extreme`
- 当前合成样本主要用于验证流程，不足以代表真实扫描件或大图片 PDF

### B. 第二步：扫描件参数优化

目的：

- 提升 `scanned` 模式对图片型 PDF 的实际压缩效果

建议方向：

- 增加多档 JPEG 质量和渲染 scale 候选
- 对同一个扫描件生成多个候选结果，自动选择最小且不过度失真的版本
- 增加黑白/灰度扫描件的低质量路径
- 对超过目标大小的文件优先尝试更激进参数

### C. 第三步：GA4 和 Search Console 运营闭环

目的：

- 判断真实用户是否使用工具、在哪一步流失、哪些 SEO 页面有潜力

状态：

- GA4 加载组件已接入，当前默认 Measurement ID 为 `G-4H9D216586`，也可用 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 覆盖
- 事件 helper 已接入；自定义事件会自动携带 `page_path` 和 `page_title`
- 已接入上传、模式切换、目标大小切换、开始压缩、压缩成功、压缩失败、目标达成、下载、批量下载、Try stronger、预览点击、预览成功、预览失败
- 已接入工具入口点击事件：`tool_switch_clicked` 覆盖首页工具切换 tab、首页核心工具卡片、hero 工具入口、header Tools 下拉、footer Tools；长尾场景页入口使用 `site_link_clicked`
- 已修复 header Tools 下拉层级问题，避免下拉菜单被首页主内容覆盖导致无法点击
- 已新增 `GA4事件验证清单.md`，列出事件名、触发动作、关键参数和发布后的最小验证路径
- 最新 `npm run build` 已通过
- 最新 `npm run cf:build` 已通过，OpenNext Cloudflare bundle 可生成 `.open-next/worker.js`
- 本地 `/compress-pdf` 已验证：8.5 MB 图片型样本用 `Scanned PDF` 默认路径压到约 265 KB，约 `97%` 缩小；第一页原始/压缩对比可渲染；当前页面控制台无错误

建议事件：

- `file_selected`
- `compression_mode_changed`
- `target_size_changed`
- `compression_started`
- `compression_success`
- `compression_failed`
- `target_size_met`
- `download_clicked`
- `download_zip_clicked`
- `try_stronger_clicked`
- `preview_clicked`
- `preview_success`
- `preview_failed`
- `tool_switch_clicked`
- `site_link_clicked`

下一步：

- 发布后按 `GA4事件验证清单.md` 用 DebugView 或实时报告验证事件是否进入 GA4
- 后续根据 GA4 真实数据判断用户从首页、导航、footer、长尾场景页分别进入哪个工具

### D. 暂缓事项

这些不是现在最优先：

- 登录注册
- 支付会员
- 大量 Office 格式转换
- OCR
- API
- 服务端强压模式

服务端强压可以作为 `P4` 预研，但建议等压缩基准和用户数据出来后再决定投入。

## 十三、UI 风格、美观标准和竞品对照

### A. 整体页面风格

当前站点不适合做成重营销落地页，而应保持“工具站 + 工作流”的气质：

- 第一屏直接给可用工具，不做大段品牌故事
- 页面视觉保持干净、可信、低干扰
- 信息密度要比普通 SaaS 首页高，但不能像后台系统一样压迫
- 首页负责解释工具矩阵，工具页负责让用户快速完成任务
- 视觉重点应落在上传、模式选择、结果对比、下载动作上

建议风格关键词：

- `fast`
- `private`
- `browser-first`
- `task-focused`
- `clean utility`

不建议方向：

- 过多渐变和装饰图形
- 复杂 hero 营销话术
- 过重卡片堆叠
- 把工具页做成文章页
- 为了“好看”牺牲上传和下载路径

### B. 美观和可用性标准

每次做 UI 调整，都按下面标准检查：

1. 第一屏是否能立刻看到主要工具入口
2. 上传区域是否比说明文字更突出
3. 主按钮是否清晰，用户是否知道下一步点哪里
4. 模式、目标大小、结果对比是否一眼可扫
5. 移动端是否没有超长单列、文字溢出、按钮挤压
6. 首页工具入口是否完整，但不显得拥挤
7. SEO 长尾入口是否收纳得足够紧凑，不拖长页面

桌面端优先：

- 工具操作区和解释区并排
- 工具矩阵使用紧凑卡片或分组入口
- 结果区强调 before / after / saved

移动端优先：

- 上传、模式、开始按钮、结果列表垂直顺序清晰
- 两列只用于短标签或短链接
- 长说明文字尽量折叠或下沉

### C. 竞品对照

主要竞品可以分成三类：

1. `iLovePDF`
- 优势：工具矩阵完整，入口清晰，用户认知强
- 劣势：竞争极强，品牌壁垒高，免费/限制/隐私顾虑容易成为用户犹豫点
- 我们可学：工具矩阵、短路径、强任务入口
- 我们避免：页面过多干扰、同质化红色工具站视觉

2. `Adobe Acrobat Online`
- 优势：品牌信任强，压缩能力和 PDF 专业心智强
- 劣势：偏重账号、云端、商业产品导流，轻量用户可能觉得重
- 我们可学：压缩档位表达、可信感、结果质量说明
- 我们避免：把轻工具做得太像企业软件

3. `PDF24`
- 优势：工具数量多，免费心智强，覆盖长尾 PDF 任务
- 劣势：界面偏传统，视觉精致度和现代感有限
- 我们可学：免费工具矩阵、长尾任务覆盖
- 我们避免：工具入口过密导致页面显旧

### D. FileSmaller 的差异化定位

现阶段不要正面硬拼“大而全”。更适合的定位是：

- 浏览器优先，强调文件处理的轻量和即时
- 压缩结果解释清楚，降低用户不确定感
- 对上传限制、简历、邮件、扫描件等具体任务做深
- 页面更现代、更少广告感，减少用户对文件隐私的心理阻力
- 用 SEO 场景页承接搜索，用工具页承接转化

### E. UI 后续优化清单

优先级从高到低：

1. 结果区视觉增强
- 做成更清晰的 before / after / saved 对比
- 对“达到目标大小 / 未达到目标大小”使用明确状态
- 下载和 try stronger 保持同一结果卡片内闭环
- 状态：`v1 已完成`
- 已增加结果卡片顶部主指标：`Compressed result / % smaller / before to after / saved`
- 已增加目标状态条：无目标时显示 ready to download，有目标时显示达成或超出目标
- 已把文件画像、压缩路径、质量提示等技术说明收进 `Technical details` 折叠区
- 下载、Try stronger、预览动作现在位于技术细节之前，主流程更靠前
- 已增加批量队列操作栏：显示 total / done / waiting / issues，并提供 Compress remaining / Download ZIP / Clear
- 已用 3 个本地 fixture PDF 验证批量状态：上传后 `3 total / 0 done / 3 waiting`，压缩后 `3 total / 3 done / 0 waiting`
- 已修正 `Needs action` 口径：只统计已压缩完成但仍建议继续增强压缩的结果，不再把 waiting / issues 混入同一个状态
- 已增加多文件成功项 compact row：多文件队列中每个成功项只显示 reduction / after / saved 和 Download / Try stronger / Compare
- 桌面端 3 个成功结果可在列表中更紧凑展示，单文件仍保留完整结果卡片
- 移动端 compact row 保持 3 个指标横排、操作按钮单列，避免文字挤压
- 已增加批量结果筛选：`All / Needs action / Done / Issues`
- 上传和清空队列时筛选自动回到 `All`，避免停留在旧筛选状态
- 已在移动端验证：上传后 `All / Needs action` 可用，压缩后 `Done` 可用，`Issues` 为 0 时禁用
- 已增加批量动作：`Try stronger needs action` 和 `Retry issues`
- 已验证 `Try stronger needs action`：3 个 fixture 成功项可从 `Balanced` 批量推进到 `Strong`，随后单项建议变为 `Try Extreme`
- `Retry issues` 已接入错误项批量重试入口；当前 fixture 测试无错误项，所以按钮禁用状态通过验证
- 已增加批量动作完成后的轻量状态提示：上传、批量压缩、批量增强压缩、失败重试都会在队列栏内反馈当前动作结果
- 已在桌面和移动端本地验证，移动端无明显文字溢出或按钮重叠
- 后续可继续优化：批量结果排序、失败项聚合提示、耗时较长任务的进度细分

2. 首页工具入口继续收敛
- 保持 8 个核心工具完整可见
- Tools 下拉作为主导航，不让顶部菜单继续膨胀
- SEO 场景入口只放最核心组合，更多留给 sitemap 和内链

3. 工具页视觉一致性
- 各工具页统一上传区、操作区、结果区结构
- Merge / Split / Rotate / Remove / Reorder 的任务状态表现尽量一致

4. 信任感增强
- 在上传区附近轻量表达 browser-first / no install / common upload limits
- 不用大段说明，不做浮夸安全承诺

5. 竞品差异强化
- 不直接写“比某某更好”
- 用页面体验体现：更少干扰、更快进入任务、更清楚展示结果
