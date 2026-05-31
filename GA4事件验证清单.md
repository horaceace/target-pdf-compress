# GA4 事件验证清单

## 当前配置

- 默认 Measurement ID：`G-4H9D216586`
- 可用环境变量覆盖：`NEXT_PUBLIC_GA_MEASUREMENT_ID`
- GA4 加载组件：`components/analytics.tsx`
- 事件 helper：`lib/analytics/events.ts`
- 所有自定义事件自动携带：
  - `page_path`
  - `page_title`

## 发布后验证顺序

1. 打开 GA4 DebugView 或实时报告。
2. 访问 `https://filesmaller.space/`。
3. 触发下面事件，每触发一组后确认 GA4 中出现事件名和关键参数。
4. 如果事件没有出现，先检查生产环境是否加载了 `gtag/js?id=G-4H9D216586` 或环境变量中的 ID。

## 工具入口事件

| Event | 触发动作 | 关键参数 |
| --- | --- | --- |
| `tool_switch_clicked` | 首页右侧工具 tab 切换 | `source`, `tool`, `label`, `page_path`, `page_title` |
| `tool_switch_clicked` | 首页 hero 工具入口点击 | `source`, `tool`, `label`, `page_path`, `page_title` |
| `tool_switch_clicked` | 首页核心工具卡片点击 | `source`, `tool`, `label`, `page_path`, `page_title` |
| `tool_switch_clicked` | header `Tools` 下拉工具点击 | `source`, `tool`, `label`, `page_path`, `page_title` |
| `tool_switch_clicked` | footer `Tools` 链接点击 | `source`, `tool`, `label`, `page_path`, `page_title` |
| `site_link_clicked` | 首页长尾/场景页入口点击 | `source`, `tool`, `label`, `page_path`, `page_title` |

## 压缩主流程事件

| Event | 触发动作 | 关键参数 |
| --- | --- | --- |
| `file_selected` | 选择或拖拽 PDF | `file_count`, `total_size`, `mode`, `target_size`, `page_path`, `page_title` |
| `compression_mode_changed` | 切换压缩模式 | `mode`, `target_size`, `page_path`, `page_title` |
| `target_size_changed` | 切换目标大小 | `mode`, `target_size`, `page_path`, `page_title` |
| `compression_started` | 点击压缩单个或批量任务 | `mode`, `target_size`, `file_size`, `page_path`, `page_title` |
| `compression_success` | 压缩成功 | `mode`, `target_size`, `original_size`, `compressed_size`, `reduction_percent`, `document_profile`, `page_count`, `page_path`, `page_title` |
| `compression_failed` | 压缩失败 | `mode`, `target_size`, `error`, `page_path`, `page_title` |
| `target_size_met` | 压缩结果低于所选目标大小 | `mode`, `target_size`, `compressed_size`, `page_path`, `page_title` |
| `browser_limit_reached` | Scanned/Extreme 后仍未达目标或收益很低 | `mode`, `target_size`, `compressed_bytes`, `reduction_percent`, `document_profile`, `compression_path`, `page_path`, `page_title` |
| `try_stronger_clicked` | 单个结果点击更强压缩 | `mode`, `target_size`, `next_mode`, `page_path`, `page_title` |
| `download_clicked` | 下载单个压缩结果 | `mode`, `target_size`, `compressed_size`, `page_path`, `page_title` |
| `download_zip_clicked` | 批量下载 ZIP | `file_count`, `compressed_total_size`, `page_path`, `page_title` |

## 批量流程事件

| Event | 触发动作 | 关键参数 |
| --- | --- | --- |
| `queue_filter_changed` | 切换 All / Needs action / Done / Issues | `filter`, `result_count`, `page_path`, `page_title` |
| `bulk_try_stronger_clicked` | 点击 `Try stronger needs action` | `file_count`, `next_mode`, `page_path`, `page_title` |
| `bulk_retry_issues_clicked` | 点击 `Retry issues` | `file_count`, `page_path`, `page_title` |

## 预览事件

| Event | 触发动作 | 关键参数 |
| --- | --- | --- |
| `preview_clicked` | 点击 `Compare first page` | `mode`, `target_size`, `page_path`, `page_title` |
| `preview_success` | 原始/压缩后第一页渲染成功 | `mode`, `target_size`, `page_path`, `page_title` |
| `preview_failed` | 预览渲染失败 | `mode`, `target_size`, `error`, `page_path`, `page_title` |

## 最小验证路径

按下面动作走一遍，应该能覆盖核心事件：

1. 首页点击 `Merge` tab，确认 `tool_switch_clicked`。
2. header `Tools` 下拉点击 `PDF to JPG`，确认 `tool_switch_clicked`。
3. 回到 `/compress-pdf`，上传 2-3 个 fixture PDF，确认 `file_selected`。
4. 切换 `Scanned PDF` 和 `Under 500 KB`，确认 `compression_mode_changed` 和 `target_size_changed`。
5. 点击 `Compress remaining`，确认 `compression_started` 和 `compression_success`。
6. 如果 Scanned/Extreme 后仍未达目标，确认 `browser_limit_reached`。
7. 点击 `Compare first page`，确认 `preview_clicked` 和 `preview_success`。
8. 点击 `Download ZIP`，确认 `download_zip_clicked`。
