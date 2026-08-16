import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceFlexMessage } from '@/lib/line/flexTemplates';
import { MonthlyBill, Tenant, LineDeliveryLog } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bills, tenants, propertyName = 'หอพักตาลเดี่ยว', channelAccessToken: bodyToken } = body as {
      bills: MonthlyBill[];
      tenants: Tenant[];
      propertyName?: string;
      channelAccessToken?: string;
    };

    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรายการใบแจ้งหนี้ที่ต้องการส่ง' },
        { status: 400 }
      );
    }

    const rawToken = bodyToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN || '';
    const channelAccessToken = rawToken.replace(/^["']|["']$/g, '').trim();
    const origin = request.headers.get('origin') || request.headers.get('host') || 'bc-apartment.vercel.app';
    const protocol = origin.includes('localhost') ? 'http' : 'https';
    const baseUrl = origin
      ? origin.startsWith('http')
        ? origin
        : `${protocol}://${origin}`
      : 'https://bc-apartment.vercel.app';

    const deliveryLogs: LineDeliveryLog[] = [];
    const updatedBillStatuses: { billId: string; status: 'sent' | 'failed'; sentAt: string; error?: string }[] = [];

    for (const bill of bills) {
      // Find tenant
      const tenant = tenants?.find(
        (t) => t.id === bill.tenantId || t.assignedRoomId === bill.roomId
      );

      const lineUserId = tenant?.lineUserId || (bill as any).lineUserId;
      const tenantLanguage = bill.receiptLanguage || tenant?.preferredLanguage || 'TH';

      if (!lineUserId) {
        deliveryLogs.push({
          id: `log-${Date.now()}-${bill.id}`,
          billId: bill.id,
          tenantId: bill.tenantId,
          roomNumber: bill.roomNumber,
          lineUserId: '',
          language: tenantLanguage,
          status: 'skipped_no_line',
          sentAt: new Date().toISOString(),
          errorMessage: 'ผู้เช่ายังไม่ได้ผูกบัญชี LINE OA',
        });
        continue;
      }

      // Generate Flex Message JSON Template
      const flexMsg = generateInvoiceFlexMessage(
        { ...bill, receiptLanguage: tenantLanguage },
        propertyName,
        baseUrl
      );

      if (channelAccessToken) {
        // Send real LINE Push Message via LINE Messaging API
        try {
          // Attempt Flex Message first
          let res = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
              to: lineUserId,
              messages: [flexMsg],
            }),
          });

          // Fallback to rich Text Message if Flex structure returns error
          if (!res.ok) {
            const errFlexText = await res.text();
            console.warn('Flex push failed, sending Text fallback:', errFlexText);

            const isBurmese = tenantLanguage === 'MY' || tenantLanguage === 'MM';
            const textInvoice = isBurmese
              ? `📄 ${propertyName}\nလစဉ် ဘေလ်စာရင်း (${bill.monthYear})\nห้อง: ${bill.roomNumber}\nผู้เช่า: ${bill.tenantName}\n\n• ค่าเช่า: ฿${(bill.rentAmount || 0).toLocaleString()}\n• ค่าน้ำ: ฿${(bill.waterAmount || 0).toLocaleString()}\n• ค่าไฟ: ฿${(bill.elecAmount || 0).toLocaleString()}\n• ค่าขยะ: ฿${(bill.garbageFee || 0).toLocaleString()}\n\n💰 ยอดรวม: ฿${(bill.totalAmount || 0).toLocaleString()}\n⏰ กำหนดชำระ: ${bill.dueDate}\n\n🔗 ดูรายละเอียดบิล/ชำระเงิน:\n${baseUrl}/invoice/${bill.id}`
              : `📄 ${propertyName}\nใบแจ้งหนี้ค่าเช่าประจำเดือน (${bill.monthYear})\nห้อง: ${bill.roomNumber}\nผู้เช่า: ${bill.tenantName}\n\n• ค่าเช่าห้อง: ฿${(bill.rentAmount || 0).toLocaleString()}\n• ค่าน้ำประปา: ฿${(bill.waterAmount || 0).toLocaleString()}\n• ค่าไฟฟ้า: ฿${(bill.elecAmount || 0).toLocaleString()}\n• ค่าบริการขยะ: ฿${(bill.garbageFee || 0).toLocaleString()}\n\n💰 ยอดรวมสุทธิ: ฿${(bill.totalAmount || 0).toLocaleString()}\n⏰ กำหนดชำระเงิน: ${bill.dueDate}\n\n🔗 เปิดดูบิลและสแกน QR ชำระเงิน:\n${baseUrl}/invoice/${bill.id}`;

            res = await fetch('https://api.line.me/v2/bot/message/push', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
              },
              body: JSON.stringify({
                to: lineUserId,
                messages: [{ type: 'text', text: textInvoice }],
              }),
            });
          }

          if (res.ok) {
            const now = new Date().toISOString();
            deliveryLogs.push({
              id: `log-${Date.now()}-${bill.id}`,
              billId: bill.id,
              tenantId: bill.tenantId,
              roomNumber: bill.roomNumber,
              lineUserId,
              language: tenantLanguage,
              status: 'success',
              sentAt: now,
            });
            updatedBillStatuses.push({
              billId: bill.id,
              status: 'sent',
              sentAt: now,
            });
          } else {
            const errData = await res.json().catch(() => ({ message: res.statusText }));
            const now = new Date().toISOString();
            const errMsg = errData.message || `LINE API Error ${res.status}`;

            deliveryLogs.push({
              id: `log-${Date.now()}-${bill.id}`,
              billId: bill.id,
              tenantId: bill.tenantId,
              roomNumber: bill.roomNumber,
              lineUserId,
              language: tenantLanguage,
              status: 'failed',
              sentAt: now,
              errorMessage: errMsg,
            });
            updatedBillStatuses.push({
              billId: bill.id,
              status: 'failed',
              sentAt: now,
              error: errMsg,
            });
          }
        } catch (err: any) {
          const now = new Date().toISOString();
          deliveryLogs.push({
            id: `log-${Date.now()}-${bill.id}`,
            billId: bill.id,
            tenantId: bill.tenantId,
            roomNumber: bill.roomNumber,
            lineUserId,
            language: tenantLanguage,
            status: 'failed',
            sentAt: now,
            errorMessage: err.message || 'Network error sending Push Message',
          });
          updatedBillStatuses.push({
            billId: bill.id,
            status: 'failed',
            sentAt: now,
            error: err.message,
          });
        }
      } else {
        // Dev Simulation Mode (when LINE_CHANNEL_ACCESS_TOKEN is not set)
        const now = new Date().toISOString();
        deliveryLogs.push({
          id: `log-${Date.now()}-${bill.id}`,
          billId: bill.id,
          tenantId: bill.tenantId,
          roomNumber: bill.roomNumber,
          lineUserId,
          language: tenantLanguage,
          status: 'success',
          sentAt: now,
          errorMessage: '[Dev Simulation] ส่งบิลสำเร็จ (ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN สำหรับการส่งจริง)',
        });
        updatedBillStatuses.push({
          billId: bill.id,
          status: 'sent',
          sentAt: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      logs: deliveryLogs,
      updatedBills: updatedBillStatuses,
      message: `ประมวลผลการส่งใบแจ้งหนี้เสร็จสิ้น (${deliveryLogs.filter((l) => l.status === 'success').length} สำเร็จ)`,
    });
  } catch (error: any) {
    console.error('Send Invoice Push API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการส่งใบแจ้งหนี้ผ่าน LINE' },
      { status: 500 }
    );
  }
}
