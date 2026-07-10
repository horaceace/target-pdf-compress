# FileSmaller 场景页质量闸门（FS-2）

> 强制门禁：不满足不新增；已有页进入改写 / 合并 / noindex 队列。  
> 对应方案：`ops/SEO四站优化方案-2026-07.md` §3.1

## 每页必须同时具备

| # | 要求 | 验收方式 |
|---|------|----------|
| 1 | **独立意图** — 与近义场景页可区分 | 人工：一句话说明「本页专解决什么，不是那页」 |
| 2 | **H1 含场景词**；title 约 50～60 字符 | 看 `content/tool-pages.ts` / `split-pages.ts` 的 `title`/`h1` |
| 3 | **工具入口** + 适用/不适用边界 | 页内有 Upload/工具卡；文案写清限制 |
| 4 | **≥3 条 FAQ**（非空答案） | FAQ 数组 length ≥ 3；线上 FAQPage JSON-LD |
| 5 | **≥2 条内链** → 相关工具或相关场景 | `relatedSlugs` ≥ 2 且 slug 可解析 |
| 6 | **信任信息** — 浏览器处理 / 限制 | intro 或 FAQ 含 browser / local / free 等 |

## 新增场景页流程

1. 在 `content/tool-pages.ts` 或 `split-pages.ts` 写配置  
2. 对照上表自检  
3. `relatedSlugs` 指向真实存在的 slug  
4. 跑 `npm run release:ci-check`（含 SEO 检查）  
5. 上线后在 GSC 观察展示与 CTR，低质进入 FS-5 队列  

## 反模式（禁止）

- 批量 AI 灌页、标题同质只换一词  
- 无工具入口的纯文案页  
- FAQ 复制粘贴且答案为空壳  
- 场景页互相无内链  

## 已有页审计字段（FS-5）

| 字段 | 说明 |
|------|------|
| slug | URL 路径 |
| intent_ok | 是否独立意图 |
| title_ok | title 长度与差异 |
| faq_count | FAQ 条数 |
| related_count | 有效内链数 |
| action | keep / rewrite / merge / noindex |
