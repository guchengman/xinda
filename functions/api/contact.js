// Cloudflare Pages Function — 联系表单提交 (生产环境)
// 本地开发使用 src/pages/api/contact.ts
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, phone, cargo, message } = data;

    if (!name || !phone) {
      return new Response(
        JSON.stringify({ error: '请填写联系人和手机号' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const text = [
      `联系人: ${name}`,
      `手机号: ${phone}`,
      `货物描述: ${cargo || '未填写'}`,
      `留言: ${message || '未填写'}`,
      `---`,
      `时间: ${new Date().toLocaleString('zh-CN')}`,
      `来源: 新大物流官网联系表单`,
    ].join('\n');

    let emailResult = { sent: false, reason: 'RESEND_API_KEY not configured' };

    if (env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM || 'noreply@xinda56.cn',
            to: [env.EMAIL_TO || 'zengxiao@xinda56.cn'],
            subject: `新询价 - ${name} - ${phone}`,
            text,
          }),
        });

        const resBody = await res.text();
        emailResult = { sent: res.ok, status: res.status, body: resBody, to: env.EMAIL_TO || 'zengxiao@xinda56.cn', from: env.EMAIL_FROM || 'noreply@xinda56.cn' };

        if (!res.ok) {
          console.error('Resend API error:', res.status, resBody);
        }
      } catch (fetchErr) {
        emailResult = { sent: false, error: fetchErr.message };
        console.error('Resend fetch error:', fetchErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: '提交成功', email: emailResult }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '服务器错误，请直接致电我们', detail: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
