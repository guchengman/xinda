# DNS 切换后一键验证脚本
# 用法：powershell -File verify-after-dns-switch.ps1
# 说明：只做只读检查，不会修改任何东西；表单发信那一步会真的发一封邮件。

$Domain = "xinda56.cn"
$ExpectedIp = "8.163.60.184"
$results = New-Object System.Collections.Generic.List[string]

function Add-Line([string]$t) {
    $results.Add($t)
    Write-Host $t
}

Add-Line "===== 1. 解析检查 ====="
foreach ($h in @($Domain, "www.$Domain")) {
    try {
        $ips = (Resolve-DnsName -Name $h -Type A -ErrorAction Stop | Where-Object { $_.QueryType -eq 'A' } | ForEach-Object { $_.IPAddress }) -join ", "
        if ($ips -eq "") { Add-Line "$h -> 无 A 记录（可能仍是 CNAME）" }
        elseif ($ips -eq $ExpectedIp) { Add-Line "$h -> $ips  [OK]" }
        else { Add-Line "$h -> $ips  [待生效或异常]" }
    } catch {
        Add-Line "$h -> 查询失败: $($_.Exception.Message)"
    }
}

Add-Line ""
Add-Line "===== 2. 页面状态 ====="
$pages = @(
    "http://www.$Domain/",
    "http://$Domain/",
    "http://www.$Domain/lines/ganzhou-foshan/",
    "http://www.$Domain/news/",
    "http://www.$Domain/services/",
    "http://www.$Domain/about/",
    "http://www.$Domain/contact/",
    "http://www.$Domain/no-such-page/"
)
foreach ($u in $pages) {
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 0 -ErrorAction Stop
        Add-Line ("{0,-52} {1}  len={2}" -f $u, $r.StatusCode, $r.RawContentLength)
    } catch {
        $code = "ERR"
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        Add-Line ("{0,-52} {1}" -f $u, $code)
    }
}

Add-Line ""
Add-Line "===== 3. 表单 API 健康检查 ====="
try {
    $r = Invoke-RestMethod -Uri "http://www.$Domain/api/health" -TimeoutSec 20 -ErrorAction Stop
    Add-Line ("api/health -> ok={0} node={1}" -f $r.ok, $r.node)
} catch {
    Add-Line ("api/health -> 失败: " + $_.Exception.Message)
}

Add-Line ""
Add-Line "===== 4. 汇总 ====="
$okCount = ($results | Where-Object { $_ -match "\[OK\]" }).Count

$outFile = Join-Path $PSScriptRoot "dns-switch-verify-result.txt"
$results -join "`r`n" | Out-File -FilePath $outFile -Encoding utf8BOM
Add-Line "结果已保存: $outFile"
Add-Line ""
Add-Line "提示："
Add-Line "  - 解析未变更前，第 1 节会显示 Cloudflare 的 104.x/172.x 地址，属正常"
Add-Line "  - 若首页 200 但 len 约 1326，说明命中了服务器默认站（缺少 Host 头），需单独排查"
Add-Line "  - 若要真实测试发信，请另用 POST /api/contact，本脚本不主动发邮件"
