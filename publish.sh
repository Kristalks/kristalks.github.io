#!/bin/bash
# 一键发布：把所有改动上传到 GitHub，1–2 分钟后网站自动更新
# 用法：./publish.sh            （自动写更新说明）
#      ./publish.sh "新文章：xxx" （自己写更新说明）

cd "$(dirname "$0")" || exit 1

git add -A
if git diff --cached --quiet; then
  echo "没有新的改动，不用发布。"
  exit 0
fi

echo "将要发布的改动："
git diff --cached --stat
echo

msg="${1:-更新博客 $(date '+%Y-%m-%d %H:%M')}"
if git commit -q -m "$msg" && git push -q; then
  echo "✓ 已发布！1–2 分钟后生效：https://kristalks.github.io"
else
  echo "✗ 发布失败，请把上面的报错发给 Claude 看看。"
  exit 1
fi
