#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# 仓库已迁移到 shelfry/shelfry，旧地址会自动重定向；
# 这里按当前协议把 origin 统一到新地址，避免以后重定向失效。
CURRENT_REMOTE="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$CURRENT_REMOTE" == *"2duat/shelfry"* ]]; then
  if [[ "$CURRENT_REMOTE" == git@* || "$CURRENT_REMOTE" == ssh://* ]]; then
    git remote set-url origin git@github.com:shelfry/shelfry.git
  else
    git remote set-url origin https://github.com/shelfry/shelfry.git
  fi
  echo "==> 远端地址已更新为 $(git remote get-url origin)"
fi

echo "==> 拉取最新代码"
git pull --ff-only
echo "    当前版本：$(git log --oneline -1)"

echo "==> 安装依赖（包含构建所需的 devDependencies）"
npm ci --include=dev

echo "==> 重新生成 Payload 类型与后台组件映射"
npm run generate:types
npm run generate:importmap

echo "==> 执行数据库迁移"
npm run migrate

echo "==> 重新构建"
npm run build

echo "==> 重启服务"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload shelfry || pm2 start deploy/baota/ecosystem.config.cjs
fi

echo "==> 完成，用时约 2-3 分钟"
