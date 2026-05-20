// Pages Function — 联系表单提交
// 通过 Resend API 发送邮件通知
//
// 环境变量 (Pages project secrets):
//   RESEND_API_KEY: Resend API 密钥 (必填)
//   EMAIL_TO: 接收通知的邮箱地址
//   EMAIL_FROM: 发件地址 (需在 Resend 验证域名)

export async function onRequest(context) {
  const { request, env } = context;

  // CORS 预检
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

    if (env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [env.EMAIL_TO || 'zengxiao@xinda56.cn'],
          subject: `新询价 - ${name} - ${phone}`,
          text,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Resend API error:', res.status, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: '提交成功' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '服务器错误，请直接致电我们' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
