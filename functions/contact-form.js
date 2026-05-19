// Cloudflare Workers 联系表单处理
// 部署命令: npx wrangler deploy functions/contact-form.js --name contact-form-xinda56
//
// 环境变量 (wrangler.toml 或 Cloudflare Dashboard):
//   EMAIL_TO: 接收通知的邮箱地址 (如 zengxiao@xinda56.cn)
//   EMAIL_FROM: 发件地址 (需在 Cloudflare Email Routing 中验证)
//   SENDGRID_API_KEY: (可选) SendGrid API 密钥

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://www.xinda56.cn',
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

      // 验证必填字段
      if (!name || !phone) {
        return new Response(
          JSON.stringify({ error: '请填写联系人和手机号' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 构建通知内容
      const text = [
        `联系人: ${name}`,
        `手机号: ${phone}`,
        `货物描述: ${cargo || '未填写'}`,
        `留言: ${message || '未填写'}`,
        `---`,
        `时间: ${new Date().toLocaleString('zh-CN')}`,
        `来源: 新大物流官网联系表单`,
      ].join('\n');

      // 尝试通过 Email Routing 发送 (绑定 send_email)
      if (env.SEND_EMAIL) {
        try {
          await env.SEND_EMAIL.send({
            from: env.EMAIL_FROM || 'noreply@xinda56.cn',
            to: env.EMAIL_TO || 'zengxiao@xinda56.cn',
            subject: `新询价 - ${name} - ${phone}`,
            text,
          });
        } catch (emailErr) {
          console.error('Email send failed:', emailErr);
        }
      }

      // 备选: 通过 SendGrid API 发送
      if (env.SENDGRID_API_KEY) {
        try {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{
                to: [{ email: env.EMAIL_TO || 'zengxiao@xinda56.cn' }],
                subject: `新询价 - ${name} - ${phone}`,
              }],
              from: { email: env.EMAIL_FROM || 'noreply@xinda56.cn' },
              content: [{ type: 'text/plain', value: text }],
            }),
          });
        } catch (sendgridErr) {
          console.error('SendGrid send failed:', sendgridErr);
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
  },
};
