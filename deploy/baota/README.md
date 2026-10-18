# 部署到宝塔面板（Ubuntu）

> 目标：一台装好宝塔的 Ubuntu 服务器，30–40 分钟上线。
> 全程只需要一个 Node 进程 + 一个 PostgreSQL + Nginx，不需要 Docker、Redis、PHP。

---

## 0. 前置检查

| 项 | 要求 |
|---|---|
| 系统 | Ubuntu 22.04 / 24.04 |
| 内存 | 2G 以上（2G 建议加 2G swap） |
| 磁盘 | 40G 起（图片会占用空间） |
| 域名 | 已解析到服务器 IP |

在宝塔「软件商店」安装：

1. **Nginx**（一般已装）
2. **Node.js 版本管理器** → 安装 **Node 22**
3. **PostgreSQL 管理器** → 安装 **PostgreSQL 16**
4. （可选）**进程守护管理器**

---

## 1. 建站点与 SSL

宝塔 → 网站 → 添加站点：

- 域名：`shelfry.app`
- PHP 版本：**纯静态**
- 数据库：不勾选（下一步单独建 PG）

建好后进入站点设置 → SSL → **Let's Encrypt** 申请证书 → 开启「强制 HTTPS」。

---

## 2. 建数据库

宝塔 → 数据库 → PostgreSQL → 添加数据库：

- 数据库名：`shelfry`
- 用户名：`shelfry`
- 密码：生成一个强密码，记下来
- 访问权限：**本地服务器**

---

## 3. 上传代码

推荐用 Git（方便后续更新）：

```bash
cd /www/wwwroot
git clone <你的仓库地址> shelfry
cd shelfry
```

也可以本地打包 zip 上传后在宝塔文件管理器解压到 `/www/wwwroot/shelfry`。

---

## 4. 配置环境变量

```bash
cd /www/wwwroot/shelfry
cp .env.example .env
```

编辑 `.env`：

```env
DATABASE_URI=postgres://shelfry:你的密码@127.0.0.1:5432/shelfry
PAYLOAD_SECRET=用 openssl rand -hex 32 生成
NEXT_PUBLIC_SITE_URL=https://shelfry.app
CRON_SECRET=用 openssl rand -hex 24 生成
SEED_SECRET=用 openssl rand -hex 24 生成

# 强烈建议填，否则匿名配额只有 60 次/小时
GITHUB_TOKEN=ghp_xxx

# 可选：不填就只用规则化摘要，不调用大模型
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=deepseek-chat
```

生成密钥：

```bash
openssl rand -hex 32   # PAYLOAD_SECRET
openssl rand -hex 24   # CRON_SECRET / SEED_SECRET
```

---

## 5. 安装、建表、构建

```bash
cd /www/wwwroot/shelfry
bash deploy/baota/install.sh
```

脚本会依次执行：

```bash
npm ci --include=dev      # 必须在 Linux 上装，sharp 是平台相关二进制
npm run generate:types    # 生成 src/payload-types.ts（未提交到 Git）
npm run generate:importmap# 生成后台组件映射（未提交到 Git）
npm run migrate           # 建表
npm run build
mkdir -p uploads logs
```

> `payload-types.ts` 和 `importMap.js` 是构建产物，仓库里没有提交。**每次部署都必须先执行这两条生成命令**，否则 `npm run build` 会报模块缺失。

> 首次构建约 2–4 分钟。2G 内存如果卡住，先加 swap：
> `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

---

## 6. 启动 Node 项目

宝塔 → 网站 → **Node 项目** → 添加项目：

| 项 | 填写 |
|---|---|
| 项目目录 | `/www/wwwroot/shelfry` |
| 启动命令 | `npm run start` |
| 项目端口 | `3000` |
| Node 版本 | `22` |
| 运行用户 | `www` |
| PM2 守护 | ✅ 开启 |

启动后访问 `http://服务器IP:3000` 应该能看到首页（此时还没有数据）。

> 不要开放 3000 端口到公网。宝塔「安全」里只放行 80/443。

---

## 7. 配置 Nginx 反向代理

站点设置 → 反向代理 → 添加：

- 代理名称：`shelfry`
- 目标 URL：`http://127.0.0.1:3000`
- 发送域名：`$host`

然后打开站点「配置文件」，把 `deploy/baota/nginx.conf` 里的内容合并进去
（静态资源直出 + `/media/` 指向 uploads + 超时 180s）。

保存后重载 Nginx。

---

## 8. 初始化数据

```bash
cd /www/wwwroot/shelfry
npm run seed
```

会创建：

- 管理员：`admin@shelfry.local` / `admin123456`（**登录后立刻改密码**）
- 10 个分类、7 个标签
- 15 个真实开源项目（自动抓取 GitHub 数据）
- 3 个编辑合集

如果不想导入示例项目，也可以只访问 `/admin` 手动创建。

---

## 9. 计划任务

宝塔 → 计划任务 → 添加任务 → Shell 脚本，按 `deploy/baota/crontab.txt` 建三条：

```bash
# 每 10 分钟：刷新星标 / 最后提交 / 版本
*/10 * * * * curl -s -m 120 -H "x-cron-secret: 你的CRON_SECRET" "http://127.0.0.1:3000/api/cron/sync?task=refresh" >/dev/null 2>&1

# 每 30 分钟：给草稿补全介绍 / 标签 / 封面
*/30 * * * * curl -s -m 180 -H "x-cron-secret: 你的CRON_SECRET" "http://127.0.0.1:3000/api/cron/sync?task=enrich" >/dev/null 2>&1

# 每 6 小时：按规则从 GitHub 搜索发现新项目
0 */6 * * * curl -s -m 180 -H "x-cron-secret: 你的CRON_SECRET" "http://127.0.0.1:3000/api/cron/sync?task=discover" >/dev/null 2>&1
```

> 执行记录在后台「同步记录」里可以看到。

---

## 10. 备份

宝塔 → 计划任务 → 添加「备份数据库」+「备份目录」：

- 数据库：选 `shelfry`，每天 03:10
- 目录：`/www/wwwroot/shelfry/uploads` 和 `.env`，每天 03:20
- 存储：在宝塔「云存储」里挂阿里云 OSS / 腾讯云 COS，备份自动上传

恢复：宝塔备份列表点「恢复」，再解压 uploads 即可。

---

## 日常维护

| 场景 | 操作 |
|---|---|
| 加软件 | `/admin` → 软件条目 → 新建 → 粘贴 GitHub 地址 → 保存 |
| 改文案 | `/admin` → 条目编辑，右侧可预览 |
| 看采集结果 | `/admin` → 同步记录 |
| 重启服务 | 宝塔 Node 项目 → 重启 |
| 更新代码 | `bash deploy/baota/deploy.sh` |
| 看日志 | `logs/dev.log`（开发）、`logs/pm2-*.log`、宝塔 Node 项目日志 |
| 健康检查 | `https://shelfry.app/api/health` |

---

## 常见问题

**502 Bad Gateway**
Node 进程没起来。看宝塔 Node 项目日志 / `pm2 logs shelfry`，多半是 `.env` 里数据库连不上。

**安装依赖时报 sharp 相关错误**
不要在 Mac 上 `npm ci` 再上传 `node_modules`。必须在服务器上执行 `npm ci`。

**后台能打开但保存时报错**
检查 `PAYLOAD_SECRET` 是否设置、数据库用户是否有建表权限。

**采集一直失败 / 429**
GitHub 匿名配额耗尽。填 `GITHUB_TOKEN`（只读即可），重启 Node 项目。

**上传图片 413**
Nginx 配置里加 `client_max_body_size 20m;` 并重载。

**时区不对**
PM2 启动环境里加 `TZ=Asia/Shanghai`，或系统执行 `timedatectl set-timezone Asia/Shanghai`。

**内存占用高**
Next.js 常驻约 300–400MB，PostgreSQL 约 150MB。2G 机器建议加 swap，或升级到 4G。
