# DNS 切换方案：xinda56.cn → 阿里云 ECS

> 盘点时间：2026-11-09　目标服务器：8.163.60.184　当前托管：Cloudflare
> 前置硬门槛：**ICP 备案通过**（未通过前不得切）

---

## 一、当前 DNS 现状（Cloudflare 控制台 13 条记录，逐条核对）

| # | 名称 | 类型 | 内容 | 代理状态 | TTL | 处置 |
|---|---|---|---|---|---|---|
| 1 | `xinda56.cn` | CNAME | `xinda-89t.pages.dev` | 已代理（橙） | 自动 | **改** |
| 2 | `www.xinda56.cn` | CNAME | `xinda56.cn` | 已代理（橙） | 自动 | **改** |
| 3 | `mail.xinda56.cn` | CNAME | `mail.mxhichina.com` | 已代理（橙） | 自动 | 保留＊ |
| 4 | `pop3.xinda56.cn` | CNAME | `pop3.mxhichina.com` | 已代理（橙） | 自动 | 保留＊ |
| 5 | `smtp.xinda56.cn` | CNAME | `smtp.mxhichina.com` | 已代理（橙） | 自动 | 保留＊ |
| 6 | `rsend.xinda56.cn` | CNAME | `send.forge.rmta.net` | 仅 DNS | 1 小时 | 保留 |
| 7 | `send.xinda56.cn` | MX | `feedback-smtp.us-east-1.amazonses.com`（10） | 仅 DNS | 1 小时 | 保留 |
| 8 | `xinda56.cn` | MX | `mxw.mxhichina.com`（10） | 仅 DNS | 自动 | 保留（企业邮） |
| 9 | `xinda56.cn` | MX | `mxn.mxhichina.com`（5） | 仅 DNS | 自动 | 保留（企业邮） |
| 10 | `send.xinda56.cn` | TXT | `v=spf1 include:amazonses.com ~all` | 仅 DNS | 1 小时 | 保留 |
| 11 | `resend._domainkey.xinda56.cn` | TXT | `p=MIGf…`（DKIM） | 仅 DNS | 1 小时 | 保留 |
| 12 | `_dmarc.xinda56.cn` | TXT | `v=DMARC1; p=none; rua=mailto:zengxiao@xinda56.cn` | 仅 DNS | 5 分钟 | 保留 |
| 13 | `xinda56.cn` | TXT | `google-site-verification=IGIDWWaZ…` | 仅 DNS | 1 小时 | 保留 |

- 无 `CAA` 记录 → 证书签发无 CA 限制，Let's Encrypt 可正常申请
- 无 `AAAA` 记录 → 切到 ECS 后不会有 IPv6 指向问题
- ＊ 第 3–5 条是阿里云企业邮箱的客户端入口域名，被 Cloudflare 代理（橙云）其实不规范：
  Cloudflare 只代理 HTTP/HTTPS 端口，IMAP/POP3/SMTP 连不上会失败。日常用 `qiye.aliyun.com`
  网页版收发不受影响，但**如果要让手机/Outlook 用 `smtp.xinda56.cn` 收发，必须改成「仅 DNS」**。
  切换时可顺手一起改，属于低风险改进。

**关键结论：切站只需要改 2 条记录（第 1、2 条），其余 11 条一律不动。**

---

## 二、关键风险核查（已实测）

| 检查项 | 实测结果 | 对切换的影响 |
|---|---|---|
| **HSTS** | **未启用**（控制台无 max-age/preload 配置，按钮仍是「启用 HSTS」） | 切到 ECS 时即使暂无 HTTPS，浏览器也不会被强制中断 ✅ |
| **始终使用 HTTPS** | **关闭**（开关 aria-checked=false） | CF 侧不会强制把 http 跳 https，切后 http 直达 ECS ✅ |
| 自动 HTTPS 重写 | 关闭 | 无影响 |
| 随机加密 / TLS 1.3 | 开启（仅 CF 边缘生效） | 灰云后自动失效，无影响 |
| Universal SSL 证书 | 有效至 2026-12-13 | 灰云后不再生效，需在 ECS 上签 |
| CAA 记录 | 无 | 申请证书无障碍 ✅ |
| DNS 设置模式 | 完全（Full） | 无影响 |

> 这三条是本次检查的核心：**HSTS 和「始终 HTTPS」都没开，所以"先切 DNS、再配证书"这个顺序是安全的**，不会出现用户浏览器被 HSTS 强制 https 而打不开站的死结。

---

## 三、切换动作（只动 2 条，Cloudflare 控制台操作）

### Step 1 — apex 记录
```
现在：xinda56.cn    CNAME  xinda-89t.pages.dev   已代理（橙）
改为：xinda56.cn    A      8.163.60.184          仅 DNS（灰）
```
操作：DNS → 记录 → `xinda56.cn` 行点「编辑」→ 类型改 **A** → 内容填 **8.163.60.184**
→ 代理状态点成灰云（关闭）→ 保存。

### Step 2 — www 记录
```
现在：www.xinda56.cn  CNAME  xinda56.cn      已代理（橙）
改为：www.xinda56.cn  A      8.163.60.184   仅 DNS（灰）
```
操作同上。

> 也可以保留 www 为 CNAME → xinda56.cn（apex 变 A 后依然有效），但两条都写 A 更直观、少一层解析。
> **两条必须都改成灰云**，只要有一条留在橙云，那条就还在 Cloudflare 上，备案核查会不通过。

### Step 3（可选，顺手做）
`mail` / `pop3` / `smtp` 三条 CNAME 的代理状态从「已代理」点成「仅 DNS」。
好处：手机邮件客户端和 Outlook 能正常用自定义域名连 SMTP/IMAP，也不会让邮件流量绕道 Cloudflare。

---

## 四、生效时间

- 灰云后 Cloudflare 给的 TTL 是 **300 秒**
- 生效一般 1–10 分钟；个别运营商 LocalDNS 会缓存更久（原橙云记录的缓存）
- 建议切换后 10 分钟内反复验证，别只看一次

---

## 五、切换后验证清单（按顺序跑）

### 5.1 解析是否到位（本机 PowerShell）
```powershell
Resolve-DnsName -Name "xinda56.cn"      -Type A
Resolve-DnsName -Name "www.xinda56.cn"  -Type A
# 两条都应只返回 8.163.60.184
```

### 5.2 服务器侧站点是否正常（SSH 进服务器，必须带 Host）
```bash
curl -sS -o /dev/null -w "home=%{http_code} size=%{size_download}\n" -H "Host: www.xinda56.cn" http://127.0.0.1/
curl -sS -o /dev/null -w "bare=%{http_code} size=%{size_download}\n" -H "Host: xinda56.cn"     http://127.0.0.1/
curl -sS -o /dev/null -w "line=%{http_code}\n"  -H "Host: www.xinda56.cn" http://127.0.0.1/lines/ganzhou-foshan/
curl -sS -o /dev/null -w "news=%{http_code}\n"  -H "Host: www.xinda56.cn" http://127.0.0.1/news/
curl -sS -o /dev/null -w "404 =%{http_code}\n"  -H "Host: www.xinda56.cn" http://127.0.0.1/no-such-page/
curl -sS -o /dev/null -w "api =%{http_code}\n"  -H "Host: www.xinda56.cn" http://127.0.0.1/api/health
```
期望：`home=200 size=45665`、`404=404`、`api=200`
（不带 Host 会命中宝塔默认站返回 200/1326 字节，属正常陷阱）

### 5.3 外网访问
```powershell
# 浏览器直接打开 http://www.xinda56.cn/ 和 http://xinda56.cn/
```
期望：正常显示首页，标题「赣州到广东物流专线_当天发货次日达 - 新大物流」

### 5.4 表单真实发信
```powershell
$body = '{"name":"DNS切换验证","phone":"13907978888","cargo":"测试","message":"切换后测试"}'
Invoke-RestMethod -Uri "http://www.xinda56.cn/api/contact" -Method Post -Body $body -ContentType "application/json"
```
期望：返回 `sent: true`，并在邮箱收到「官网新询价｜DNS切换验证」

---

## 六、回滚方案（3 分钟回到 Cloudflare）

Cloudflare Pages 项目 `xinda` 一直保留，旧站随时可用。把两条记录改回去即可：

```
xinda56.cn    A/CNAME → 改回  CNAME  xinda-89t.pages.dev   代理：开（橙）
www.xinda56.cn          → 改回  CNAME  xinda56.cn          代理：开（橙）
```

回滚后等 5 分钟生效。期间若已签发 ECS 证书，不影响，仅停止使用。

**回滚触发条件**：切完 30 分钟内首页打不开、或大面积页面 404、或备案核查发现异常。

---

## 七、切换成功后立刻要做的三件事

1. **申请证书并开 443**（域名已指向 ECS，HTTP-01 可直接过）
   宝塔面板 → 网站 → 设置 → SSL → Let's Encrypt 一键申请
2. **强制 HTTPS**（ECS 侧配 301，注意不要和 CF 的「始终 HTTPS」叠加，CF 已关，安全）
3. **页脚挂 ICP 备案号**（备案号下发后，改 `src/layouts/Layout.astro` → build → 同步到服务器）
   另：备案通过后 30 日内需完成**公安联网备案**

---

## 八、备选方案：把 DNS 整体迁到阿里云云解析

如果备案核查明确要求"域名解析必须在境内/在阿里云"，则：

1. 阿里云云解析控制台建 `xinda56.cn`，逐条重建上面 13 条记录（A/MX/TXT/CNAME）
2. 域名控制台把 NS 从 `asa.ns.cloudflare.com` / `marek.ns.cloudflare.com` 改为阿里云分配的 NS
3. 代价：Resend 的 4 条记录、DMARC、Google 验证全部要重建；Cloudflare 侧的 Pages 域名绑定失效

**建议先走方案 A（CF 灰云）**，这是最常见的做法，备案核查只要求"能解析到备案服务器"，
不要求 NS 必须在境内。除非管局明确提要求，否则不必迁 NS。

---

## 九、服务器侧当前状态（已就绪，与 DNS 无关）

| 项目 | 状态 |
|---|---|
| Nginx vhost | `server_name 8.163.60.184 xinda56.cn www.xinda56.cn;` 已绑 |
| 站点根目录 | `/www/wwwroot/xinda56`（6.3M，32 个 HTML） |
| 表单 API | `xinda56-api` 服务 active+enabled，`/api/contact` 实测发信成功 |
| 443 | **未监听**，无证书（等域名指向后再签） |
| 自动备份 | 每天 03:30，保留 14 天 |
| 面板 | 8899，HTTPS+安全入口+仅赣州 IP+连接限速 |

---

## 十、切换当天的操作顺序（一句话版）

```
备案通过 → 改 apex A 灰云 → 改 www A 灰云 → 等 5 分钟
→ 解析验证 → 页面验证 → 表单发信验证
→ 签证书开 443 → 强制 https → 挂备案号
```

**任何一步验证不过，立即执行第六节回滚。**
