#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "==> 检查 Node 版本"
NODE_MAJOR="$(node -v | sed 's/v\([0-9]*\).*/\1/')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "需要 Node 20.18 以上，当前是 $(node -v)。请在宝塔的 Node 版本管理器里切换。"
  exit 1
fi

if [ ! -f .env ]; then
  echo "缺少 .env。请先执行 cp .env.example .env 并填写数据库、密钥。"
  exit 1
fi

echo "==> 安装依赖（包含构建所需的 devDependencies）"
npm ci --include=dev

echo "==> 生成 Payload 类型与后台组件映射"
npm run generate:types
npm run generate:importmap

echo "==> 生成数据库表结构"
npm run migrate

echo "==> 构建前端"
npm run build

mkdir -p uploads logs

echo "==> 完成"
echo "下一步：宝塔 → 网站 → Node 项目 → 添加"
echo "  项目目录：$ROOT"
echo "  启动命令：npm run start"
echo "  端口：3000   Node 版本：22   PM2 守护：开启"
echo "然后配置 Nginx 反向代理，详见 deploy/baota/README.md"
