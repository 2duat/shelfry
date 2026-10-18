# Shelfry

一个 macOS 风格的开源软件 / AI 工具目录站。人工策展 + GitHub 自动同步，后台粘贴一个仓库地址就能自动补全信息。

![首页](docs/screenshots/home-light.png)

![详情页](docs/screenshots/detail-light.png)

![后台登录](docs/screenshots/admin-login.png)

![后台仪表盘](docs/screenshots/admin-dashboard.png)

---

## 能做什么

**前台**

- 首页：精选推荐、按平台浏览、编辑精选、本周上升、最新收录、合集
- 列表页：`/macos` `/windows` `/ai` `/plugins` 与分类页，支持平台 / 类型 / 收费 / 星标筛选和四种排序
- 详情页：窗口式头部、安装命令一键复制、**README 阅读区（固定高度、内部滚动、相对图片自动补全）**、截图灯箱、功能清单、元信息、相似推荐
- 搜索：`⌘K` 命令面板 + `/search` 页面，中文子串匹配
- 合集：编辑整理的清单，如「新 Mac 必装」
- 投稿：`/submit` 提交 GitHub 地址，进入后台审核
- SEO：SSR/ISR、JSON-LD、sitemap、robots、RSS、动态 OG 元信息

**后台（Payload CMS）**

- 仪表盘：总项目、已发布、今日新增/更新、草稿、待审投稿、近 7 天趋势、分类与平台分布、最近同步状态
- 快捷入口合并为一个模块：条目 / 分类 / 标签 / 合集 / 投稿 / 同步记录 / 媒体 / 管理员 / 设置，带数量
- 软件条目 CRUD，字段分区（内容 / 链接与图片 / GitHub 数据 / SEO + 右侧发布栏）
- **列表页一键导入**：粘贴 GitHub 地址 → 选择草稿/直接发布 → 自动抓取并生成条目
- **标签自动生成**：抓取后自动创建并关联标签；没有 Topics 时用类型 / 平台 / 语言兜底
- **分类自动判断**：优先用 AI 给出的分类匹配，匹配不到按类型兜底（CLI→终端工具、AI→AI 与智能等）
- **编辑页减负**：常用字段一屏可见，发布状态与推荐位在右侧栏，自动字段折叠收起
- 也支持在新建页粘贴地址保存后自动补全：星标、协议、语言、Topics、图标、封面、中文简介、标签、功能清单、安装命令
- 勾选「重新抓取」可强制刷新单个条目
- 分类、标签、合集、投稿、同步记录、站点设置
- 管理员账号 + 权限，后台中文界面

**自动化**

- `refresh`：定时刷新已发布条目的星标 / 最后提交 / 最新版本
- `enrich`：给草稿补全中文介绍、标签、封面
- `readme`：给历史条目补抓 README
- `discover`：按 GitHub 搜索规则自动发现新项目，进草稿箱
- 没有 LLM Key 时退化为规则抽取；没有 GitHub Token 时退化为页面解析，仍然可用

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router / RSC / ISR） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 后台 | Payload CMS 3.91（与前台同一个 Node 进程） |
| 数据库 | PostgreSQL 16 |
| 图标 / 动效 | lucide-react、motion |
| 运行环境 | Node 22 LTS |
| 部署 | Ubuntu + 宝塔面板 + Nginx + PM2 |

---

## 本地开发

```bash
# 1. 依赖
npm install

# 2. 环境变量
cp .env.example .env
# 修改 DATABASE_URI 指向你的 PostgreSQL，并填 PAYLOAD_SECRET

# 3. 建库（示例）
createdb shelfry

# 4. 启动（首次启动 Payload 会自动建表）
npm run dev

# 5. 写入示例数据（可选）
npm run seed
```

打开：

- 前台 <http://localhost:3000>
- 后台 <http://localhost:3000/admin>

`npm run seed` 会创建管理员 `admin@shelfry.app` / `admin123456`，**上线前务必改密码**。

---

## 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `DATABASE_URI` | ✅ | `postgres://user:pass@127.0.0.1:5432/shelfry` |
| `PAYLOAD_SECRET` | ✅ | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 站点地址，用于 SEO / sitemap |
| `CRON_SECRET` | ✅ | 定时任务调用凭证 |
| `SEED_SECRET` | ✅ | 初始化接口凭证 |
| `GITHUB_TOKEN` | 建议 | 只读 Token，匿名配额只有 60 次/小时 |
| `LLM_BASE_URL` | 可选 | OpenAI 兼容接口，如 `https://api.deepseek.com/v1` |
| `LLM_API_KEY` | 可选 | 不填则使用规则化摘要 |
| `LLM_MODEL` | 可选 | 如 `deepseek-chat` |

---

## 后台怎么用

### 导入一个 GitHub 项目

1. 打开 `/admin` → 软件条目 → 新建
2. 只填「GitHub 地址」，例如 `https://github.com/ollama/ollama`
3. 直接点保存
4. 系统会抓取仓库信息，生成中文介绍、标签、功能清单、安装命令
5. 检查后把状态改成「已发布」

已有条目的信息过时了，勾选「重新抓取 GitHub」再保存即可。

### 自动发现

后台 → 站点设置 → 采集与 AI，添加搜索规则，例如：

```
topic:macos-app stars:>1500 pushed:>2025-01-01
topic:mcp-server stars:>500
```

开启「自动发布」后，超过星标阈值的项目会直接发布，其余进草稿箱。

---

## 定时任务

接口：`GET /api/cron/sync?task=refresh|enrich|discover`，请求头 `x-cron-secret: $CRON_SECRET`。

宝塔计划任务配置见 [`deploy/baota/crontab.txt`](deploy/baota/crontab.txt)。

---

## 目录结构

```
src/
  app/
    (site)/              前台页面（首页 / 平台 / 分类 / 详情 / 搜索 / 合集 / 投稿）
    (payload)/           Payload 后台与 REST/GraphQL 路由
    api/                 自定义接口（search / seed / submit / cron / health）
  collections/           Payload 集合定义
  globals/Settings.ts    站点配置
  components/            前台组件 + 后台品牌组件
  lib/                   GitHub 抓取、AI 富化、查询、评分
scripts/                 seed / sync 辅助脚本
deploy/baota/            宝塔部署脚本、Nginx、PM2、计划任务、图文手册
docs/screenshots/        截图
```

---

## 部署

详见 **[deploy/baota/README.md](deploy/baota/README.md)**：从装 Node/PG 到上线、备份、更新的完整步骤。

---

## 内容与合规

- 元数据来自 GitHub 公开 API 与 README，中文介绍为改写摘要，不整篇搬运。
- 图标、截图、商标归原作者所有，页面标注来源并提供下架入口（`/dmca`）。
- 建议配置 GitHub Token，既提升配额也避免触发匿名限流。

---

## License

代码可用于个人或商业项目。收录内容的版权归各项目作者所有。
