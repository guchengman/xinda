#!/bin/bash
# 新大物流官网站点每日备份
# 用法：由 cron 每天 03:30 调用
set -u

BACKUP_DIR=/www/backup/site
KEEP_DAYS=14
DATE=$(date +%F)
LOG_TAG="[backup] $(date '+%F %T')"

mkdir -p "$BACKUP_DIR"

# 1) 站点主目录（静态站）
TAR="$BACKUP_DIR/xinda56-$DATE.tar.gz"
if tar -czf "$TAR" -C /www/wwwroot xinda56 2>/dev/null; then
  echo "$LOG_TAG site ok: $TAR ($(du -h "$TAR" | cut -f1))"
else
  echo "$LOG_TAG site FAILED: $TAR"
fi

# 2) 表单 API 服务文件（不含密钥，密钥在 /etc 下）
API_TAR="$BACKUP_DIR/xinda56-api-files-$DATE.tar.gz"
if tar -czf "$API_TAR" -C /www/wwwroot xinda56-api 2>/dev/null; then
  echo "$LOG_TAG api ok: $API_TAR"
else
  echo "$LOG_TAG api FAILED: $API_TAR"
fi

# 3) Nginx 站点配置
CONF_TAR="$BACKUP_DIR/xinda56-nginx-conf-$DATE.tar.gz"
mkdir -p /tmp/xinda-conf-bak
cp -a /www/server/panel/vhost/nginx/8.163.60.184.conf /tmp/xinda-conf-bak/ 2>/dev/null
cp -a /www/server/panel/vhost/nginx/extension/8.163.60.184/api.conf /tmp/xinda-conf-bak/ 2>/dev/null
if tar -czf "$CONF_TAR" -C /tmp/xinda-conf-bak . 2>/dev/null; then
  echo "$LOG_TAG conf ok: $CONF_TAR"
fi
rm -rf /tmp/xinda-conf-bak

# 4) 清理超期备份
find "$BACKUP_DIR" -name "xinda56-*.tar.gz" -mtime +$KEEP_DAYS -delete
echo "$LOG_TAG done, keep ${KEEP_DAYS}d"
