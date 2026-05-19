// Cloudflare Workers 联系表单处理脚本
// 部署为独立的 Worker，绑定到 contact-form.xinda56.workers.dev

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
      const data = await request.json();

      // 验证必填字段
      if (!data.name || !data.phone) {
        return new Response(JSON.stringify({ error: '请填写联系人和手机号' }), { status: 400 });
      }

      // 检查是否配置了邮件转发
      if (env.SENDGRID_API_KEY) {
        // 通过 SendGrid 或 Email Routing 发送通知
        // 这里可以根据实际使用的邮件服务来配置
      }

      return new Response(JSON.stringify({ success: true, message: '提交成功' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
    }
  },
};
