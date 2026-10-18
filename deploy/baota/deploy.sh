#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "==> 拉取最新代码"
git pull --ff-only

echo "==> 安装依赖"
npm ci

echo "==> 执行数据库迁移"
npm run migrate

echo "==> 重新构建"
npm run build

echo "==> 重启服务"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload openshelf || pm2 start deploy/baota/ecosystem.config.cjs
fi

echo "==> 完成，用时约 2-3 分钟"
