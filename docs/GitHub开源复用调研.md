# GitHub 开源复用调研

更新日期：2026-05-31

本文只服务 `target-pdf-compress / FileSmaller`，目标是判断哪些开源项目可以直接利用，哪些只能参考，哪些暂时不上。星标数会变化，本文记录的是 2026-05-31 调研时的近似值。

## 结论

短期不建议直接 fork 一个大 PDF 平台替换当前项目。当前 FileSmaller 已经有 Next.js、Cloudflare Workers、SEO 页面、GA4、浏览器压缩和 8 个 PDF 工具入口，最划算的路线是继续保留现有项目，只把成熟 PDF 引擎作为能力补丁接进来。

优先级：

1. 继续用 `PDF.js`、`pdf-lib`、`jszip` 支撑现有浏览器路径。
2. 用真实样本验证 `qpdf` 和 `pdfcpu`，优先做外部命令/服务端 POC。
3. `qpdf-wasm` 只做浏览器/Worker 技术 spike，不按高 star 项目处理。
4. Ghostscript 只做压缩效果对比，授权和部署风险确认前不上生产。
5. Stirling-PDF、BentoPDF、Gotenberg 只参考产品/架构，不直接迁移当前项目。

## 可直接继续利用

| 项目 | GitHub 热度 | License | 当前/目标用途 | 决策 |
|---|---:|---|---|---|
| `mozilla/pdf.js` | 约 53k stars | Apache-2.0 | PDF 渲染、预览、扫描件 render-and-rebuild | 已在用，继续保留 |
| `Hopding/pdf-lib` | 约 8k stars | MIT | PDF 重写、合并、拆分、重排、图片转 PDF | 已在用，继续保留 |
| `jszip` | 已在项目依赖中 | MIT | 批量 ZIP 下载 | 已在用，继续保留 |

判断：这三类能力已经嵌入当前产品，替换成本高，且没有证据证明替换会改善压缩效果。短期应继续围绕它们补样本、补策略和补 UI 反馈。

## 优先验证接入

| 项目 | GitHub 热度 | License | 适配点 | 风险 | 决策 |
|---|---:|---|---|---|---|
| `qpdf/qpdf` | 约 5k stars | Apache-2.0 | 结构优化、线性化、对象流处理、文件修复 | 对图片/扫描件强压不一定有效 | P1 第一候选 |
| `pdfcpu/pdfcpu` | 约 8.7k stars | Apache-2.0 | Go CLI/API，批处理、优化、后端集成 | 项目自述仍提示 alpha，需要真实样本验证稳定性 | P1 第二候选 |
| Ghostscript / `ArtifexSoftware/ghostpdl` | 老牌项目，GitHub 为镜像 | AGPL / Commercial | 图片型、扫描型 PDF 强压效果对比 | 授权、二进制部署、画质回退风险 | 只做 benchmark，不直接上生产 |

执行方式：

- 不把这些二进制写死进业务代码。
- 先用 `npm run benchmark:external-setup` 确认可用性。
- 再用 `npm run benchmark:external-compressors` 对真实样本跑结果。
- 只有 `benchmark:decision-gate` 通过后，才允许做生产 POC。

## 技术 spike，不按高 star 直接采用

| 项目 | 目标 | 决策 |
|---|---|---|
| `qpdf-wasm` | 在浏览器或 Worker 环境复用 qpdf 能力 | 可以做 spike，但不能作为“成熟高 star 项目”直接押注 |

原因：`qpdf-wasm` 的价值来自背后的 `qpdf`，不是它自身社区规模。适合验证“是否能在浏览器/Worker 环境运行”，不适合绕过真实样本和质量门禁。

## 只参考，不直接迁移

| 项目 | GitHub 热度 | 参考价值 | 不直接拿来替换的原因 |
|---|---:|---|---|
| `Stirling-Tools/Stirling-PDF` | 约 70k stars | 功能地图、工具分类、强压/转换能力、服务端 PDF 工具站形态 | Java 自托管大平台，过重，会冲掉 FileSmaller 当前轻量 SEO 工具站定位 |
| `alam00000/bentopdf` | 约 5.5k stars | 隐私优先表达、纯前端/自托管 PDF 工具体验 | AGPL/商业授权模式，且部分能力依赖 AGPL 组件，不能无脑复制代码 |
| `gotenberg/gotenberg` | 约 10.6k stars | 文档转 PDF API、容器化服务模式 | 主能力是转换/生成 PDF，不是当前最急的压缩闭环；适合后期服务端文档转换，不进 P0/P1 |

## 暂不上

| 方向 | 暂缓原因 |
|---|---|
| 直接 fork Stirling-PDF 上线 | 功能太重，技术栈不一致，部署/运维复杂度上升 |
| 直接复制 BentoPDF | 授权不适合直接并入当前商业化项目 |
| 现在接 Gotenberg | 解决的是文档转换 API，不是当前压缩效果证据不足的问题 |
| 现在做 AI PDF / ChatPDF | 偏离 upload limit / file smaller 主线 |
| 自研底层 PDF 压缩算法 | 成本高、质量风险高，只有成熟引擎不能满足时才局部自研 |

## 下一步执行

当前不是缺开源项目，而是缺真实证据：

- 真实样本仍为 `0/8`
- 外部引擎仍为 `0/3`
- 引擎推荐应保持 `BLOCKED`

最短执行路径：

1. 安装 `qpdf`：
   ```bash
   brew install qpdf
   ```
2. 可选安装 `pdfcpu`：
   ```bash
   brew install pdfcpu
   ```
3. Ghostscript 暂时只作为对比：
   ```bash
   brew install ghostscript
   ```
4. 放入 8 类非敏感真实 PDF 样本。
5. 跑完整证据流水线：
   ```bash
   npm run benchmark:pipeline
   npm run benchmark:external-compressors
   npm run benchmark:engine-recommendation
   npm run benchmark:decision-gate
   ```

只有真实样本和外部引擎结果出来后，才能回答“哪个开源引擎最值得接入生产”。
