import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'online',
    service: 'BC RealEstate LINE Official Account Webhook API',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = body.events || [];

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const origin = request.headers.get('origin') || request.headers.get('host') || '';
    const protocol = origin.includes('localhost') ? 'http' : 'https';
    const baseUrl = origin ? (origin.startsWith('http') ? origin : `${protocol}://${origin}`) : '';

    for (const event of events) {
      if (event.type === 'follow' || event.type === 'message') {
        const replyToken = event.replyToken;
        const lineUserId = event.source?.userId;

        if (replyToken && channelAccessToken) {
          const bindUrl = `${baseUrl}/liff/bind?line_user_id=${lineUserId || ''}`;

          const replyMessage = {
            replyToken: replyToken,
            messages: [
              {
                type: 'text',
                text: 'ยินดีต้อนรับสู่ระบบหอพักตาลเดี่ยว! 🏢\n\nกรุณากดลิงก์ด้านล่างนี้เพื่อผูกบัญชี LINE กับห้องพักของคุณ เพื่อรับใบแจ้งหนี้อัตโนมัติในทุกๆ เดือนครับ',
              },
              {
                type: 'template',
                altText: 'ผูกบัญชีห้องพักหอพักตาลเดี่ยว',
                template: {
                  type: 'buttons',
                  text: 'กดปุ่มด้านล่างเพื่อผูกบัญชี LINE เข้ากับเลขห้องพักของคุณ',
                  actions: [
                    {
                      type: 'uri',
                      label: '🔗 ผูกบัญชีห้องพัก',
                      uri: bindUrl,
                    },
                  ],
                },
              },
            ],
          };

          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify(replyMessage),
          });
        }
      }
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error: any) {
    console.error('LINE Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
