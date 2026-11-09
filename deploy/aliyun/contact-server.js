// 新大物流官网联系表单 API（阿里云 ECS 部署版）
// 零依赖，使用 Node 18+ 内置 fetch 调用 Resend
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '127.0.0.1';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_TO = process.env.EMAIL_TO || 'zengxiao@xinda56.cn';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@xinda56.cn';

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, max || 1000);
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > (limitBytes || 32 * 1024)) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

async function sendMail(data) {
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
  const text = [
    '联系人: ' + clean(data.name, 50),
    '手机号: ' + clean(data.phone, 30),
    '货物描述: ' + clean(data.cargo, 500),
    '留言: ' + clean(data.message, 1000),
    '---',
    '时间: ' + time,
    '来源: 新大物流官网联系表单',
  ].join('\n');

  const from = '新大物流官网 <' + EMAIL_FROM + '>';
  const payload = {
    from: from,
    to: [EMAIL_TO],
    subject: '官网新询价｜' + clean(data.name, 50),
    text: text,
  };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const bodyText = await resp.text();
  return { sent: resp.ok, status: resp.status, body: bodyText, to: EMAIL_TO, from: from };
}

// 简易限流：同一 IP 每分钟最多 5 次提交，防止刷爆 Resend 免费配额
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 5;
const rateMap = new Map();

function allowByIp(ip) {
  const now = Date.now();
  let rec = rateMap.get(ip);
  if (!rec || now > rec.reset) {
    rec = { count: 0, reset: now + RATE_WINDOW_MS };
    rateMap.set(ip, rec);
  }
  rec.count += 1;
  if (rateMap.size > 5000) {
    for (const [k, v] of rateMap) {
      if (now > v.reset) rateMap.delete(k);
    }
  }
  return rec.count <= RATE_MAX;
}

function clientIp(req) {
  const xr = req.headers['x-real-ip'];
  if (xr) return String(xr);
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');

  if (url.pathname === '/health') {
    return sendJson(res, 200, { ok: true, node: process.version, rateClients: rateMap.size });
  }

  if (url.pathname !== '/api/contact' && url.pathname !== '/contact') {
    return sendJson(res, 404, { error: 'not found' });
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'method not allowed' });
  }

  let data;
  try {
    data = await readBody(req);
  } catch (e) {
    return sendJson(res, 400, { success: false, message: '请求格式有误' });
  }

  const name = clean(data.name, 50);
  const phone = clean(data.phone, 30);
  if (!name || !phone) {
    return sendJson(res, 400, { success: false, message: '姓名和手机号必填' });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY missing');
    return sendJson(res, 500, { success: false, message: '邮件服务未配置', email: { sent: false, reason: 'RESEND_API_KEY not configured' } });
  }

  const ip = clientIp(req);
  if (!allowByIp(ip)) {
    console.warn('rate limited', ip);
    return sendJson(res, 429, { success: false, message: '提交过于频繁，请稍后再试或直接电话联系' });
  }

  try {
    const email = await sendMail(data);
    if (!email.sent) {
      console.error('resend failed', email.status, email.body);
      // 发信失败必须如实返回失败，避免前端谎报成功导致客户询价静默丢失
      return sendJson(res, 502, { success: false, message: '发送失败，请直接电话联系', email: email });
    }
    return sendJson(res, 200, { success: true, message: '提交成功', email: email });
  } catch (e) {
    console.error('send error', e && e.message);
    return sendJson(res, 500, { success: false, message: '发送失败，请直接电话联系', email: { sent: false, error: String(e && e.message) } });
  }
});

server.listen(PORT, HOST, () => {
  console.log('[xinda56-api] listening on ' + HOST + ':' + PORT);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

