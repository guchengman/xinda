# xinda56.cn DNS 迁移到阿里云云解析

> 执行日期：2026-11-27　状态：**已完成**（NS 已切换，全网生效中）

## 一、为什么要迁

站点已经在阿里云 ECS（8.163.60.184）上跑，HTTPS 证书也是服务器自己签的。Cloudflare 处在
"仅 DNS"（灰云）状态，不代理流量、不缓存、不做防护，实际只剩一个境外权威解析的角色。
国内访客解析要绕国际链路，且此前 mail/pop3/smtp 三条记录被误设为橙云，导致自定义域名的
SMTP/IMAP 客户端连不上。迁回阿里云云解析可以一并解决。

## 二、前置事实核对

| 项 | 结果 |
|---|---|
| 域名注册商 | 阿里云计算有限公司（万网） |
| 域名持有者 | 已过户为「赣州开发区新大货运部」|
| 注册 / 到期 | 2011-04-20 / 2028-04-20 |
| 迁移前 NS | `asa.ns.cloudflare.com`、`marek.ns.cloudflare.com` |
| DNSSEC | **未启用**（无 DS 记录）→ 迁移无需先删除 DS，少一个坑 |
| 云解析归属账号 | **不是**最初登录的个人账号（该账号只有 smallhome.top / toolcompare.top / xiaoyue.shop），需切到货运部账号 |

## 三、记录迁移

Cloudflare 上共 **25 条**记录，用 **Import/Export → 下载 zone 文件**的思路手工整理成
BIND 格式，通过云解析的「导入/导出 → 上传 zone 文件」一次性导入。

导入文件：`dns-import.zone`（纯 ASCII、无 BOM、每条记录显式 TTL 600）

导入策略选「跳过重复记录，仅导入新数据」。

导入后总数为 26 条 = 新导入 25 条 + 原有 1 条手写记录
（`zengxiao A 115.150.69.44`，2026-11-20 创建，与 Cloudflare 上的 `115.150.69.127` 不同）。
该条会造成双 A 轮询，**已删除**，最终 25 条，与 Cloudflare 完全一致。

迁移中修正的关键项：

- `mail.xinda56.cn` → `mail.mxhichina.com`
- `pop3.xinda56.cn` → `pop3.mxhichina.com`
- `smtp.xinda56.cn` → `smtp.mxhichina.com`

这三条在 Cloudflare 上是**橙云（已代理）**，DNS 层面会被扁平化成 Cloudflare 的边缘 IP，
邮件客户端连过去必然失败。迁移时还原为真实 CNAME。

## 四、NS 切换

域名控制台 → xinda56.cn → DNS 修改 → 填阿里云分配的两条：

```
dns21.hichina.com
dns22.hichina.com
```

提交时触发短信验证（159*****260），由用户本人完成。

## 五、验证结果

| 检查项 | 结果 |
|---|---|
| NS @223.5.5.5 | `dns21.hichina.com`、`dns22.hichina.com` ✅ |
| NS @8.8.8.8 | 同上 ✅ |
| apex A @权威 | `8.163.60.184` TTL 600 ✅ |
| www | CNAME → xinda56.cn → `8.163.60.184` ✅ |
| mail | → mail.mxhichina.com → qiye.aliyun.com → `106.11.x` / `59.82.x` ✅ |
| pop3 | → pop.mxhichina.com → `58.221.74.x` ✅ |
| smtp | → smtp.mxhichina.com → `59.82.x` ✅ |
| MX | `mxn.mxhichina.com`(5)、`mxw.mxhichina.com`(10) ✅ |
| DMARC | `v=DMARC1; p=none; rua=mailto:zengxiao@xinda56.cn` ✅ |
| Resend DKIM | `resend._domainkey` 公钥完整 ✅ |
| send 子域 SPF | `v=spf1 include:amazonses.com ~all` ✅ |
| 站点 | https://www.xinda56.cn 200，标题/备案号 `赣ICP备2026032493号` 正常 ✅ |

`1.1.1.1` 查询返回空，与迁移前一致（本机到 Cloudflare DNS 的连通性问题，非解析故障）。

## 六、遗留项

1. **家里 DDNS 更新脚本仍指向 Cloudflare**
   `zengxiao.xinda56.cn` 及其 11 个 CNAME 子域（cd2 / clash / cloudsaver / ddns / files /
   ha / istore / jellyfin / kuma / router / tv）解析到 `115.150.69.127`。
   NS 已在阿里云，继续往 Cloudflare API 写记录**不再生效**，家宽 IP 一变这些子域就失联。
   需把 DDNS 客户端改为阿里云（DDNS-GO 支持阿里云 AccessKey，或用阿里云 SDK 自写）。

2. **主域缺 SPF**
   apex 目前没有 SPF 记录。阿里云企业邮箱发信时，建议补：
   `xinda56.cn  TXT  "v=spf1 include:spf.mxhichina.com ~all"`
   Resend 的 SPF 在 `send.` 子域，两者不冲突。

3. **Cloudflare zone 保留**
   不删。它是唯一一份现成的完整备份，回滚时把 NS 改回
   `asa.ns.cloudflare.com` / `marek.ns.cloudflare.com` 即可（24–48 小时生效）。

4. **公安联网备案**仍未办理，截止约 2026-12-27。

## 七、回滚

云解析里记录不可用时，最快的回滚是域名控制台 DNS 修改，换回 Cloudflare 的两条 NS。
Cloudflare 上的记录保持原样（apex A 8.163.60.184、www CNAME），回滚后解析结果与当前一致。
