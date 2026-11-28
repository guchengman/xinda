#!/bin/bash
# 新大物流站点每日备份（官网 xinda56 + 内部工作台 workbench）
# 用法：由 cron 每天 03:30 调用
set -u
umask 077

BACKUP_DIR=/www/backup/site
KEEP_DAYS=14
UPLOAD_KEEP_DAYS=7
DATE=$(date +%F)
LOG_TAG="[backup] $(date '+%F %T')"

mkdir -p "$BACKUP_DIR"

# 1) 官网静态站
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

# 3) Nginx 站点配置（两个站 + 强制跳转 + 封禁规则）
CONF_TAR="$BACKUP_DIR/xinda56-nginx-conf-$DATE.tar.gz"
CONF_BAK=/tmp/xinda-conf-bak
rm -rf "$CONF_BAK"; mkdir -p "$CONF_BAK"
cp -a /www/server/panel/vhost/nginx/8.163.60.184.conf                 "$CONF_BAK/" 2>/dev/null
cp -a /www/server/panel/vhost/nginx/xinda56-https.conf                "$CONF_BAK/" 2>/dev/null
cp -a /www/server/panel/vhost/nginx/workbench.conf                    "$CONF_BAK/" 2>/dev/null
cp -a /www/server/panel/vhost/nginx/extension/8.163.60.184/api.conf          "$CONF_BAK/" 2>/dev/null
cp -a /www/server/panel/vhost/nginx/extension/8.163.60.184/https-redirect.conf "$CONF_BAK/" 2>/dev/null
cp -a /www/server/panel/vhost/nginx/extension/8.163.60.184/block-ip.conf       "$CONF_BAK/" 2>/dev/null
if tar -czf "$CONF_TAR" -C "$CONF_BAK" . 2>/dev/null; then
  echo "$LOG_TAG conf ok: $CONF_TAR"
fi
rm -rf "$CONF_BAK"

# 4) 内部工作台 workbench：代码与配置（排除 uploads 大目录）
WB_TAR="$BACKUP_DIR/workbench-$DATE.tar.gz"
if tar -czf "$WB_TAR" --exclude='workbench/uploads' -C /www/wwwroot workbench 2>/dev/null; then
  echo "$LOG_TAG workbench ok: $WB_TAR ($(du -h "$WB_TAR" | cut -f1))"
else
  echo "$LOG_TAG workbench FAILED: $WB_TAR"
fi

# 5) 内部工作台上传文件（业务数据，单独打包，保留周期更短）
UP_TAR="$BACKUP_DIR/workbench-uploads-$DATE.tar.gz"
if tar -czf "$UP_TAR" -C /www/wwwroot/workbench uploads 2>/dev/null; then
  echo "$LOG_TAG wb-uploads ok: $UP_TAR ($(du -h "$UP_TAR" | cut -f1))"
else
  echo "$LOG_TAG wb-uploads FAILED: $UP_TAR"
fi

# 6) 清理超期备份
find "$BACKUP_DIR" -name "xinda56-*.tar.gz"        -mtime +$KEEP_DAYS       -delete
find "$BACKUP_DIR" -name "workbench-20*.tar.gz"    -mtime +$KEEP_DAYS       -delete
find "$BACKUP_DIR" -name "workbench-uploads-*.tar.gz" -mtime +$UPLOAD_KEEP_DAYS -delete
echo "$LOG_TAG done, keep ${KEEP_DAYS}d / uploads ${UPLOAD_KEEP_DAYS}d"
