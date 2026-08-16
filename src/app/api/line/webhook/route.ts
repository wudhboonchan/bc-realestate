import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    for (const event of events) {
      if (event.type === 'follow' || event.type === 'message') {
        const replyToken = event.replyToken;
        const lineUserId = event.source?.userId;
        const userText = event.message?.text?.trim() || '';

        if (replyToken && channelAccessToken && lineUserId) {
          const domain = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'bc-apartment.vercel.app';
          const hostUrl = domain.startsWith('http') ? domain : `https://${domain}`;
          
          // Personalized link with auto-embedded line_user_id
          const bindUrl = `${hostUrl}/liff/bind?line_user_id=${lineUserId}`;

          let replyTextMessage = `ยินดีต้อนรับสู่ระบบหอพักตาลเดี่ยว! 🏢\n\nกรุณากดลิงก์ด้านล่างนี้เพื่อผูกบัญชี LINE กับห้องพักของคุณ (ระบบจะดึงรหัส LINE อัตโนมัติ ไม่ต้องกรอกรหัสยุ่งยากครับ):\n\n🔗 ${bindUrl}`;

          // Check if user typed room number directly e.g. "A1", "B2", "C3"
          if (userText && userText.length <= 10) {
            replyTextMessage = `ขอบคุณที่ติดต่อหอพักตาลเดี่ยวค่ะ 🏢\n\nหากท่านต้องการผูกบัญชีเพื่อรับใบแจ้งหนี้ค่าเช่าประจำเดือน กรุณากดลิงก์ด้านล่างนี้ได้เลยค่ะ (ไม่ต้องกรอกรหัส LINE ID):\n\n🔗 ${bindUrl}`;
          }

          const replyMessage = {
            replyToken: replyToken,
            messages: [
              {
                type: 'text',
                text: replyTextMessage,
              },
            ],
          };

          const res = await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify(replyMessage),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error('LINE Reply API Failed:', res.status, errText);
          }
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
