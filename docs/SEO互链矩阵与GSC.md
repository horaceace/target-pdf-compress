# FileSmaller 互链矩阵 + GSC（FS-1 / FS-3 / FS-4）

## GSC 提交清单（FS-1）

1. 打开 [Google Search Console](https://search.google.com/search-console)  
2. 添加资源：`https://filesmaller.space`（域名级或 URL 前缀均可）  
3. 验证：HTML 标签 / DNS / Cloudflare（按现有 GA / 站点验证能力）  
4. **Sitemaps** → 提交：`https://filesmaller.space/sitemap.xml`  
5. 记录提交日期与「已发现」页数基线  

线上已具备：

- `app/robots.ts` → `Sitemap: https://filesmaller.space/sitemap.xml`  
- `app/sitemap.ts` 生产主机 URL  
- 场景页 + 核心工具 URL 收录规则  

## 互链矩阵（FS-3）最小集

代码落地：

| 层 | 位置 |
|----|------|
| 导航 / 页脚 | `components/site-shell.tsx` 全工具链 |
| 场景页 | `relatedSlugs` → `tool-page-template` / `split-page-template` |
| 核心工具页 | `components/core-tool-related.tsx` + 各 `app/[locale]/*/page.tsx` |

规则：

```
Compress ↔ Merge ↔ Split
Compress ↔ PDF to JPG / JPG to PDF
Organize：Rotate / Remove / Reorder 互链
Secure：Watermark / Page# / Unlock / Protect 与 Compress 互链
场景页 → 对应核心工具 + ≥1 相邻场景
```

## hreflang 审计（FS-4）

实现：`lib/metadata.ts` → `buildAlternates()`

| 检查项 | 状态（2026-07-10 线上抽检 compress-pdf） |
|--------|------------------------------------------|
| 绝对 URL | ✅ `https://filesmaller.space/...` |
| en / hi / id | ✅ |
| x-default | ✅ 指向英文默认路径 |
| 自指 + 互指 | ✅ 由同一函数生成 |

抽检命令：

```bash
curl -s https://filesmaller.space/compress-pdf | grep -i hreflang
curl -s https://filesmaller.space/hi/compress-pdf | grep -i hreflang
```

## 薄内容 / 重复 title（FS-5）

决策表模板见 `docs/SEO场景页质量闸门.md`。  
优先处理：GSC「已编入索引」但展示高、CTR 极低或 title 撞车的场景页。
