import { MonthlyBill } from '@/types';

/**
 * Builds an official LINE Flex Message Payload for an Invoice in Thai or Burmese.
 * Strictly formatted to LINE Messaging API Flex Spec.
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
  const cleanBaseUrl = baseUrl
    ? baseUrl.startsWith('http')
      ? baseUrl
      : `https://${baseUrl}`
    : 'https://bc-apartment.vercel.app';
  const invoiceUrl = `${cleanBaseUrl}/invoice/${bill.id}`;

  const formattedMonth = bill.monthYear;
  const rentStr = `฿${(bill.rentAmount || 0).toLocaleString()}`;
  const waterStr = `฿${(bill.waterAmount || 0).toLocaleString()}`;
  const elecStr = `฿${(bill.elecAmount || 0).toLocaleString()}`;
  const garbageStr = `฿${(bill.garbageFee || 0).toLocaleString()}`;
  const totalStr = `฿${(bill.totalAmount || 0).toLocaleString()}`;

  // Multi-language text strings (Action label must be max 20 characters according to LINE API spec)
  const texts = isBurmese
    ? {
        altText: `လစဉ် ဘေလ်စာရင်း ${formattedMonth} - အခန်း ${bill.roomNumber}`,
        headerTitle: 'လစဉ် ဘေလ်စာရင်း',
        headerPeriod: `လအတွက်: ${formattedMonth}`,
        roomLabel: 'အခန်း:',
        tenantLabel: 'အိမ်ငှား:',
        rentLabel: 'အခန်းခ',
        waterLabel: `ရေဖိုး (${bill.waterUnits || 0} ယူနစ်)`,
        elecLabel: `မီးဖိုး (${bill.elecUnits || 0} ယူနစ်)`,
        garbageLabel: 'အမှိုက်ခ',
        totalLabel: 'စုစုပေါင်း ပေးရန်',
        dueDateLabel: 'ပေးရန်ရက်:',
        buttonLabel: 'ဘေလ်ကြည့်ရန် / ပေးရန်',
        tagLine: 'ကျေးဇူးတင်ပါသည်။',
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
        buttonLabel: 'เปิดดูบิล / ชำระเงิน',
        tagLine: 'กรุณาชำระเงินตามกำหนดเวลา ขอบคุณครับ',
      };

  const flexContainer = {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#963720',
      paddingAll: 'lg',
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
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: 'lg',
      backgroundColor: '#FAF7F2',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: texts.tenantLabel,
              size: 'xs',
              color: '#78716C',
            },
            {
              type: 'text',
              text: bill.tenantName,
              size: 'xs',
              color: '#1C1917',
              weight: 'bold',
              align: 'end',
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: '#E2DDD5',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: texts.rentLabel,
                  size: 'xs',
                  color: '#44403C',
                },
                {
                  type: 'text',
                  text: rentStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: texts.waterLabel,
                  size: 'xs',
                  color: '#44403C',
                },
                {
                  type: 'text',
                  text: waterStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: texts.elecLabel,
                  size: 'xs',
                  color: '#44403C',
                },
                {
                  type: 'text',
                  text: elecStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: texts.garbageLabel,
                  size: 'xs',
                  color: '#44403C',
                },
                {
                  type: 'text',
                  text: garbageStr,
                  size: 'xs',
                  color: '#1C1917',
                  weight: 'bold',
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
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          backgroundColor: '#FFFFFF',
          paddingAll: 'md',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: texts.totalLabel,
                  size: 'xs',
                  color: '#963720',
                  weight: 'bold',
                },
                {
                  type: 'text',
                  text: totalStr,
                  size: 'lg',
                  color: '#963720',
                  weight: 'bold',
                  align: 'end',
                },
              ],
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `${texts.dueDateLabel} ${bill.dueDate || ''}`,
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
      paddingAll: 'md',
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
