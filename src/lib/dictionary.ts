import { LanguageOption } from '@/types';

const burmeseDict = {
    receiptTitle: 'ကျသင့်ငွေတောင်းခံလွှာ (Invoice)',
    parentBrand: 'ဘွန်ချန် အိမ်ခြံမြေ',
    subBrand: 'တန်ဒေအိမ်ရာ (Tan Deaw)',
    invoiceNo: 'တောင်းခံလွှာအမှတ်',
    date: 'ထုတ်ပေးသည့်ရက်',
    dueDate: 'ပေးရန်နောက်ဆုံးရက်',
    roomNo: 'အခန်း',
    tenantName: 'အငှားနေသူအမည်',
    nationality: 'နိုင်ငံသား',
    billingPeriod: 'လ/နှစ်',
    itemDescription: 'အမျိုးအမည်',
    previousMeter: 'ယခင်မီတာ',
    currentMeter: 'ယခုမီတာ',
    unitsUsed: 'သုံးစွဲယူနစ်',
    pricePerUnit: 'တစ်ယူနစ်နှုန်း',
    amount: 'ကျသင့်ငွေ (ဘတ်)',
    roomRent: 'အခန်းခ',
    waterFee: 'ရေဖိုး',
    elecFee: 'မီးဖိုး',
    garbageFee: 'အမှိုက်ခ',
    totalAmount: 'စုစုပေါင်းကျသင့်ငွေ',
    status: 'အခြေအနေ',
    paidStatus: 'ပေးပြီးပါပြီ',
    pendingStatus: 'မပေးရသေးပါ',
    overdueStatus: 'ရက်လွန်နေသည်',
    paymentAccount: 'ငွေပေးချေရန်ဘဏ်အကောင့်',
    bankName: 'ပရုမ်းပေး (PromptPay)',
    accountNumber: '3-1902-0035604-0',
    accountName: 'ကနော့ကချကိုန်း ကီယာတီဝီရဆာကုန်း (Kanokkotchakorn)',
    thankYouMessage: 'တန်ဒေအိမ်ရာကို ရွေးချယ်သည့်အတွက် ကျေးဇူးတင်ပါသည်။',
    authorizedSignature: 'ထုတ်ပေးသူ လက်မှတ်',
    printButton: 'တောင်းခံလွှာထုတ်ယူရန် (Print/PDF)',
    lineShareButton: 'LINE မှတဆင့် ပို့ရန်',
    thaiTenant: 'ထိုင်း',
    burmeseTenant: 'မြန်မာ',
    zone: 'ဇုန်',
    meter: 'မီတာ',
};

export const dictionary: Record<LanguageOption, Record<string, string>> = {
  TH: {
    receiptTitle: 'ใบแจ้งหนี้',
    parentBrand: 'บุญจันทร์ เรียลเอสเตตท์',
    subBrand: 'หอพักตาลเดี่ยว',
    invoiceNo: 'เลขที่ใบแจ้งหนี้',
    date: 'วันที่ออกใบแจ้งหนี้',
    dueDate: 'วันครบกำหนดชำระ',
    roomNo: 'ห้องพัก',
    tenantName: 'ชื่อผู้เช่า',
    nationality: 'สัญชาติ',
    billingPeriod: 'ประจำเดือน',
    itemDescription: 'รายการ',
    previousMeter: 'มิเตอร์ครั้งก่อน',
    currentMeter: 'มิเตอร์ครั้งนี้',
    unitsUsed: 'หน่วยที่ใช้',
    pricePerUnit: 'ราคา/หน่วย',
    amount: 'จำนวนเงิน (บาท)',
    roomRent: 'ค่าเช่าห้องพัก',
    waterFee: 'ค่าน้ำประปา',
    elecFee: 'ค่าไฟฟ้า',
    garbageFee: 'ค่าจัดเก็บขยะส่วนกลาง',
    totalAmount: 'ยอดรวมทั้งสิ้น',
    status: 'สถานะการชำระ',
    paidStatus: 'ชำระเงินเรียบร้อยแล้ว',
    pendingStatus: 'รอการชำระเงิน',
    overdueStatus: 'เกินกำหนดชำระ',
    paymentAccount: 'ช่องทางการชำระเงิน',
    bankName: 'พร้อมเพย์ (PromptPay)',
    accountNumber: '3-1902-0035604-0',
    accountName: 'กนกกชกร เกียรติวีระสกุล',
    thankYouMessage: 'ขอบคุณที่ใช้บริการ หอพักตาลเดี่ยว',
    authorizedSignature: 'ผู้ออกใบแจ้งหนี้ / เจ้าของหอพัก',
    printButton: 'พิมพ์ใบแจ้งหนี้ (Print/PDF)',
    lineShareButton: 'ส่งใบแจ้งหนี้ทาง LINE',
    thaiTenant: 'คนไทย',
    burmeseTenant: 'ชาวพม่า',
    zone: 'โซน',
    meter: 'มิเตอร์',
  },
  MM: burmeseDict,
  MY: burmeseDict,
};

export function getTranslation(lang: LanguageOption, key: string): string {
  return dictionary[lang]?.[key] || dictionary['TH'][key] || key;
}

// Helper to format YYYY-MM-DD to dd-mm-yyyy e.g. "2026-08-05" -> "05-08-2026"
export function formatDateDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  return dateStr;
}
