import { MonthlyBill, LanguageOption } from '@/types';

/**
 * Builds a LINE Flex Message Payload for an Invoice in Thai or Burmese.
 *
 * @param bill The monthly bill data
 * @param propertyName Dormitory name
 * @param baseUrl Base URL for the web app (for action links)
 * @returns Flex Message JSON payload object
 */
export function generateInvoiceFlexMessage(
  bill: MonthlyBill,
  propertyName: string = 'หอพักตาลเดี่ยว',
  baseUrl: string = ''
) {
  const isBurmese = bill.receiptLanguage === 'MY' || bill.receiptLanguage === 'MM';
  const cleanBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const invoiceUrl = `${cleanBaseUrl}/invoice/${bill.id}`;

  const formattedMonth = bill.monthYear;
  const rentStr = `฿${(bill.rentAmount || 0).toLocaleString()}`;
  const waterStr = `฿${(bill.waterAmount || 0).toLocaleString()}`;
  const elecStr = `฿${(bill.elecAmount || 0).toLocaleString()}`;
  const garbageStr = `฿${(bill.garbageFee || 0).toLocaleString()}`;
  const totalStr = `฿${(bill.totalAmount || 0).toLocaleString()}`;

  // Multi-language text strings
  const texts = isBurmese
    ? {
        altText: `လစဉ် ဘေလ်စာရင်း ${formattedMonth} - အခန်း ${bill.roomNumber}`,
        headerTitle: 'လစဉ် ဘေလ်စာရင်း',
        headerPeriod: `ประจำเดือน / လအတွက်: ${formattedMonth}`,
        roomLabel: 'အခန်း / ห้อง:',
        tenantLabel: 'အိမ်ငှား / ผู้เช่า:',
        rentLabel: 'အခန်းခ (ค่าเช่าห้อง)',
        waterLabel: `ရေဖိုး (ค่าน้ำ ${bill.waterUnits || 0} หน่วย)`,
        elecLabel: `မီးဖိုး (ค่าไฟ ${bill.elecUnits || 0} หน่วย)`,
        garbageLabel: 'အမှိုက်ခ (ค่าขยะ)',
        totalLabel: 'စုစုပေါင်း (ยอดรวมสุทธิ)',
        dueDateLabel: 'ပေးရန်ရက် / กำหนดชำระ:',
        buttonLabel: 'ဘေလ်အပြည့်အစုံကြည့်ရန် / ငွေပေးချေရန်',
        tagLine: 'ကျေးဇူးတင်ပါသည်။ / ขอบคุณครับ',
      }
    : {
        altText: `ใบแจ้งหนี้ประจำเดือน ${formattedMonth} - ห้อง ${bill.roomNumber}`,
        headerTitle: 'ใบแจ้งหนี้ค่าเช่าประจำเดือน',
        headerPeriod: `ประจำเดือน: ${formattedMonth}`,
        roomLabel: 'ห้องพัก:',
        tenantLabel: 'ผู้เช่า:',
        rentLabel: 'ค่าเช่าห้องพัก',
        waterLabel: `ค่าน้ำประปา (${bill.waterUnits || 0} หน่วย)`,
        elecLabel: `ค่าไฟฟ้า (${bill.elecUnits || 0} หน่วย)`,
        garbageLabel: 'ค่าบริการขยะ/อื่นๆ',
        totalLabel: 'ยอดรวมสุทธิที่ต้องชำระ',
        dueDateLabel: 'กำหนดชำระเงินภายใน:',
        buttonLabel: 'เปิดดูใบแจ้งหนี้ฉบับเต็ม / ชำระเงิน',
        tagLine: 'กรุณาชำระเงินตามกำหนดเวลา ขอบคุณครับ',
      };

  const flexContainer = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#963720',
      paddingAll: '20px',
      contents: [
        {
          type: 'text',
          text: propertyName,
          color: '#F4DCD6',
          size: 'xs',
          weight: 'bold',
        },
        {
          type: 'text',
          text: texts.headerTitle,
          color: '#FFFFFF',
          size: 'lg',
          weight: 'bold',
          margin: 'xs',
        },
        {
          type: 'text',
          text: `${texts.roomLabel} ${bill.roomNumber} (${texts.headerPeriod})`,
          color: '#FFFFFF',
          size: 'xs',
          margin: 'sm',
          opacity: 0.9,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '20px',
      backgroundColor: '#FAF7F2',
      contents: [
        // Tenant Name Row
        {
          type: 'box',
          layout: 'baseline',
          margin: 'none',
          contents: [
            {
              type: 'text',
              text: texts.tenantLabel,
              size: 'xs',
              color: '#78716C',
              flex: 3,
            },
            {
              type: 'text',
              text: bill.tenantName,
              size: 'xs',
              color: '#1C1917',
              weight: 'bold',
              flex: 7,
              align: 'end',
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: '#E2DDD5',
        },
        // Item breakdown
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          spacing: 'sm',
          contents: [
            // Rent
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: texts.rentLabel,
                  size: 'xs',
                  color: '#44403C',
                  flex: 7,
                },
                {
                  type: 'text',
                  text: rentStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  flex: 3,
                  align: 'end',
                },
              ],
            },
            // Water
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: texts.waterLabel,
                  size: 'xs',
                  color: '#44403C',
                  flex: 7,
                },
                {
                  type: 'text',
                  text: waterStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  flex: 3,
                  align: 'end',
                },
              ],
            },
            // Electricity
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: texts.elecLabel,
                  size: 'xs',
                  color: '#44403C',
                  flex: 7,
                },
                {
                  type: 'text',
                  text: elecStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  flex: 3,
                  align: 'end',
                },
              ],
            },
            // Garbage
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: texts.garbageLabel,
                  size: 'xs',
                  color: '#44403C',
                  flex: 7,
                },
                {
                  type: 'text',
                  text: garbageStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  flex: 3,
                  align: 'end',
                },
              ],
            },
          ],
        },
        {
          type: 'separator',
          margin: 'lg',
          color: '#D8C7B5',
        },
        // Total Amount Box
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          backgroundColor: '#FFFFFF',
          paddingAll: '12px',
          cornerRadius: '8px',
          borderWidth: '1px',
          borderColor: '#E2DDD5',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              contents: [
                {
                  type: 'text',
                  text: texts.totalLabel,
                  size: 'xs',
                  color: '#963720',
                  weight: 'bold',
                  flex: 6,
                },
                {
                  type: 'text',
                  text: totalStr,
                  size: 'lg',
                  color: '#963720',
                  weight: 'bold',
                  flex: 4,
                  align: 'end',
                },
              ],
            },
          ],
        },
        // Due Date
        {
          type: 'box',
          layout: 'baseline',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `${texts.dueDateLabel} ${bill.dueDate || 'ภายในวันที่ 5 ของเดือน'}`,
              size: 'xxs',
              color: '#78716C',
              align: 'center',
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      backgroundColor: '#FFFFFF',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: texts.buttonLabel,
            uri: invoiceUrl,
          },
          style: 'primary',
          color: '#963720',
          height: 'sm',
        },
        {
          type: 'text',
          text: texts.tagLine,
          size: 'xxs',
          color: '#A8A29E',
          align: 'center',
          margin: 'md',
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: texts.altText,
    contents: flexContainer,
  };
}
