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

    // Support token from URL parameter e.g. /api/line/webhook?token=... or Vercel env variable
    const urlToken = request.nextUrl.searchParams.get('token') || request.nextUrl.searchParams.get('channelAccessToken');
    const channelAccessToken = urlToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      console.warn('LINE Webhook Warning: LINE_CHANNEL_ACCESS_TOKEN is missing in process.env and query params');
    }

    for (const event of events) {
      if (event.type === 'follow' || event.type === 'message') {
        const replyToken = event.replyToken;
        const lineUserId = event.source?.userId;

        if (replyToken && lineUserId && channelAccessToken) {
          const domain = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'bcapartment.vercel.app';
          const hostUrl = domain.startsWith('http') ? domain : `https://${domain}`;
          
          // Personalized link with auto-embedded line_user_id
          const bindUrl = `${hostUrl}/liff/bind?line_user_id=${lineUserId}`;

          // Bilingual greeting & binding link (Thai + Burmese)
          const replyTextMessage = `ขอบคุณที่ติดต่อหอพักบุญจันทร์ (ตาลเดี่ยว) ค่ะ 🏢
หากท่านต้องการผูกบัญชีเพื่อรับใบแจ้งหนี้ค่าเช่าประจำเดือน กรุณากดลิงก์ด้านล่างนี้ได้เลยค่ะ:

ဘုန်းဂျန်း အပါတ်မန့် (တန်ဒေ) သို့ ဆက်သွယ်ပေးပါသောကြောင့် ကျေးဇူးတင်ပါသည်။ 🏢
လစဉ် ဘေလ်စာရင်း လက်ခံရရှိရန် အောက်ပါလင့်ခ်ကို နှိပ်၍ အကောင့်ချိတ်ဆက်နိုင်ပါသည်:

🔗 ${bindUrl}`;

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
