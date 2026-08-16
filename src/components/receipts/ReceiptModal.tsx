'use client';

import React, { useState, useEffect } from 'react';
import { MonthlyBill, LanguageOption } from '@/types';
import { getTranslation, formatDateDDMMYYYY } from '@/lib/dictionary';
import { X, Printer, Send, Globe, CheckCircle2, Clock, Building2, QrCode } from 'lucide-react';
import { useProperty } from '@/context/PropertyContext';
import { generatePromptPayDataURL } from '@/lib/promptpay';

interface ReceiptModalProps {
  bill: MonthlyBill | null;
  onClose: () => void;
}

export function ReceiptModal({ bill, onClose }: ReceiptModalProps) {
  const { updateBillLanguage, updateBillStatus, property, rooms, meterReadings } = useProperty();
  const [lang, setLang] = useState<LanguageOption>('TH');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (bill) {
      setLang(bill.receiptLanguage || 'TH');

      // Generate Dynamic PromptPay QR Code for exact bill amount
      const targetPromptPay = property.promptPayId || '3190200356040';
      generatePromptPayDataURL(targetPromptPay, bill.totalAmount).then((url) => {
        setQrCodeUrl(url);
      });
    }
  }, [bill, property.promptPayId]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (bill) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bill, onClose]);

  if (!bill) return null;

  const handleLanguageToggle = (newLang: LanguageOption) => {
    setLang(newLang);
    updateBillLanguage(bill.id, newLang);
  };

  const handlePrint = () => {
    window.print();
  };

  const accountIdRaw = property.promptPayId || '3190200356040';
  const formattedAccountNo =
    accountIdRaw === '3190200356040' ? '3-1902-0035604-0' : accountIdRaw;

  // Retrieve exact meter reading numbers (previous -> current)
  const room = rooms.find((r) => r.id === bill.roomId || r.roomNumber === bill.roomNumber);
  const meterReading = meterReadings.find(
    (m) => m.roomId === bill.roomId && m.monthYear === bill.monthYear
  );

  const waterPrev = bill.waterPrevious ?? meterReading?.waterPrevious ?? (room?.waterMeterPrevious || 0);
  const waterCurr = bill.waterCurrent ?? meterReading?.waterCurrent ?? (waterPrev + bill.waterUnits);

  const elecPrev = bill.elecPrevious ?? meterReading?.elecPrevious ?? (room?.elecMeterPrevious || 0);
  const elecCurr = bill.elecCurrent ?? meterReading?.elecCurrent ?? (elecPrev + bill.elecUnits);

  const formattedDueDate = formatDateDDMMYYYY(bill.dueDate);
  const formattedIssuedDate = formatDateDDMMYYYY(bill.issuedAt);

  const handleCopyLineMsg = () => {
    const isMM = lang === 'MM';
    const text = isMM
      ? `
📌 [${getTranslation('MM', 'subBrand')}] ${getTranslation('MM', 'receiptTitle')} (${bill.monthYear})
-----------------------------
${getTranslation('MM', 'roomNo')}: ${bill.roomNumber} (${bill.tenantName})
1. ${getTranslation('MM', 'roomRent')}: ${bill.rentAmount.toLocaleString()} ကျပ်/ဘတ်
2. ${getTranslation('MM', 'waterFee')} (မီတာ: ${waterPrev} ➔ ${waterCurr} = ${bill.waterUnits} ယူနစ် x 7): ${bill.waterAmount.toLocaleString()} ဘတ်
3. ${getTranslation('MM', 'elecFee')} (မီတာ: ${elecPrev} ➔ ${elecCurr} = ${bill.elecUnits} ယူနစ် x 7): ${bill.elecAmount.toLocaleString()} ဘတ်
4. ${getTranslation('MM', 'garbageFee')}: ${bill.garbageFee.toLocaleString()} ဘတ်
-----------------------------
💰 ${getTranslation('MM', 'totalAmount')}: ${bill.totalAmount.toLocaleString()} ဘတ်
${getTranslation('MM', 'dueDate')}: ${formattedDueDate}
📱 PromptPay: ${formattedAccountNo} (${property.promptPayName || 'กนกกชกร เกียรติวีระสกุล'})
`.trim()
      : `
📌 [${property.name}] ใบแจ้งหนี้ประจำเดือน ${bill.monthYear}
-----------------------------
ห้อง: ${bill.roomNumber} (${bill.tenantName})
1. ค่าเช่าห้อง: ${bill.rentAmount.toLocaleString()} บาท
2. ค่าน้ำ (มิเตอร์: ${waterPrev} ➔ ${waterCurr} = ${bill.waterUnits} หน่วย x 7 บาท): ${bill.waterAmount.toLocaleString()} บาท
3. ค่าไฟ (มิเตอร์: ${elecPrev} ➔ ${elecCurr} = ${bill.elecUnits} หน่วย x 7 บาท): ${bill.elecAmount.toLocaleString()} บาท
4. ค่าขยะส่วนกลาง: ${bill.garbageFee.toLocaleString()} บาท
-----------------------------
💰 ยอดรวมทั้งสิ้น: ${bill.totalAmount.toLocaleString()} บาท
กำหนดชำระ: ${formattedDueDate}
📱 พร้อมเพย์ / PromptPay: ${formattedAccountNo} (${property.promptPayName || 'กนกกชกร เกียรติวีระสกุล'})
`.trim();

    navigator.clipboard.writeText(text);
    alert(isMM ? 'คัดลอกข้อความสรุปใบแจ้งหนี้ภาษาพม่าสำหรับส่ง LINE เรียบร้อยแล้ว!' : 'คัดลอกข้อความสรุปใบแจ้งหนี้ภาษาไทยสำหรับส่ง LINE เรียบร้อยแล้ว!');
  };

  return (
    <div
      onClick={onClose}
      className="printable-modal-wrapper fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="printable-modal-card bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden border border-stone-200 flex flex-col cursor-default"
      >
        {/* Modal Toolbar (Fixed at top, Hidden during print) */}
        <div className="bg-stone-100 px-5 py-3 border-b border-stone-200 flex items-center justify-between shrink-0 print:hidden">
          {/* Language Switcher */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-semibold text-stone-700">เลือกภาษาใบแจ้งหนี้ / ဧည့်သည်ဘာသာစကား:</span>
            <div className="inline-flex rounded-lg bg-stone-200 p-1">
              <button
                type="button"
                onClick={() => handleLanguageToggle('TH')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'TH'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                🇹🇭 ภาษาไทย
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('MM')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'MM'
                    ? 'bg-[#963720] text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                🇲🇲 မြန်မာဘာသာ (ภาษาพม่า)
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            title="ปิดหน้าต่าง (หรือกดนอกกรอบ / กด ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT (Scrollable body) */}
        <div className="printable-content p-6 md:p-8 space-y-5 bg-white text-stone-800 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-stone-200 pb-5 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold tracking-wider uppercase mb-1">
                <Building2 className="w-4 h-4 text-stone-600" />
                <span>{getTranslation(lang, 'parentBrand')}</span>
              </div>
              <h1 className="text-2xl font-light tracking-tight text-stone-900 font-serif">
                {getTranslation(lang, 'subBrand')}
              </h1>
              <p className="text-xs text-stone-500 mt-1">{property.address}</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                {getTranslation(lang, 'receiptTitle')}
              </span>
              <div className="text-xs text-stone-500">
                <p>
                  {getTranslation(lang, 'invoiceNo')}: <span className="font-mono text-stone-800 font-medium">#{bill.id}</span>
                </p>
                <p>
                  {getTranslation(lang, 'date')}: <span className="text-stone-800">{formattedIssuedDate}</span>
                </p>
                <p>
                  {getTranslation(lang, 'dueDate')}: <span className="text-stone-800 font-medium">{formattedDueDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tenant & Room Info Cards */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 text-xs">
            <div>
              <span className="text-stone-400 font-medium uppercase tracking-wider block mb-0.5">
                {getTranslation(lang, 'roomNo')}
              </span>
              <div className="text-xl font-bold text-stone-900">{bill.roomNumber}</div>
              <span className="text-[11px] text-stone-500">{getTranslation(lang, 'zone')} {bill.zoneCode}</span>
            </div>

            <div>
              <span className="text-stone-400 font-medium uppercase tracking-wider block mb-0.5">
                {getTranslation(lang, 'tenantName')}
              </span>
              <div className="text-base font-semibold text-stone-900">{bill.tenantName}</div>
              <span className="text-[11px] text-stone-500">
                {getTranslation(lang, 'billingPeriod')}: {bill.monthYear}
              </span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">{getTranslation(lang, 'itemDescription')}</th>
                  <th className="p-2.5 text-center">{getTranslation(lang, 'unitsUsed')}</th>
                  <th className="p-2.5 text-right">{getTranslation(lang, 'pricePerUnit')}</th>
                  <th className="p-2.5 text-right">{getTranslation(lang, 'amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-2.5 text-stone-400">1</td>
                  <td className="p-2.5 font-medium text-stone-900">{getTranslation(lang, 'roomRent')}</td>
                  <td className="p-2.5 text-center text-stone-400">-</td>
                  <td className="p-2.5 text-right text-stone-400">-</td>
                  <td className="p-2.5 text-right font-semibold">{bill.rentAmount.toLocaleString()}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-stone-400">2</td>
                  <td className="p-2.5 font-medium text-stone-900">
                    <div>{getTranslation(lang, 'waterFee')}</div>
                    <div className="text-[11px] text-stone-500 font-mono font-normal">
                      ({getTranslation(lang, 'meter')}: {waterPrev} ➔ {waterCurr})
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-mono text-stone-800">{bill.waterUnits}</td>
                  <td className="p-2.5 text-right font-mono text-stone-600">7.00</td>
                  <td className="p-2.5 text-right font-semibold">{bill.waterAmount.toLocaleString()}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-stone-400">3</td>
                  <td className="p-2.5 font-medium text-stone-900">
                    <div>{getTranslation(lang, 'elecFee')}</div>
                    <div className="text-[11px] text-stone-500 font-mono font-normal">
                      ({getTranslation(lang, 'meter')}: {elecPrev} ➔ {elecCurr})
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-mono text-stone-800">{bill.elecUnits}</td>
                  <td className="p-2.5 text-right font-mono text-stone-600">7.00</td>
                  <td className="p-2.5 text-right font-semibold">{bill.elecAmount.toLocaleString()}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-stone-400">4</td>
                  <td className="p-2.5 font-medium text-stone-900">{getTranslation(lang, 'garbageFee')}</td>
                  <td className="p-2.5 text-center text-stone-400">1</td>
                  <td className="p-2.5 text-right font-mono text-stone-600">15.00</td>
                  <td className="p-2.5 text-right font-semibold">{bill.garbageFee.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-50 border-t border-stone-200">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right font-bold text-stone-800 text-sm">
                    {getTranslation(lang, 'totalAmount')}
                  </td>
                  <td className="p-2.5 text-right font-bold text-stone-900 text-base text-[#963720]">
                    ฿{bill.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* DYNAMIC PROMPTPAY QR CODE & BANK PAYMENT DETAILS CARD */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E2DDD5] grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Left: PromptPay Details */}
            <div className="text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-stone-900 font-bold">
                <span className="text-sm">🏦</span>
                <span>{getTranslation(lang, 'paymentAccount')}</span>
              </div>

              <div className="space-y-0.5 text-stone-700">
                <p className="font-semibold text-stone-900"> PromptPay / พร้อมเพย์</p>
                <p className="font-mono text-[#963720] font-bold text-base tracking-wide">
                  {formattedAccountNo}
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  {property.promptPayName || 'กนกกชกร เกียรติวีระสกุล'}
                </p>
              </div>

              <div className="pt-0.5 text-[10px] text-stone-500 leading-tight">
                {lang === 'MM' ? (
                  <span>📱 တိကျသော ပမာဏပါရှိသော QR စကင်ဖတ်၍ ငွေပေးချေပါ</span>
                ) : (
                  <span>📱 สแกน QR Code ด้วยแอปธนาคาร ยอดเงินระบุอัตโนมัติ ฿{bill.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </div>
            </div>

            {/* Right: Dynamic PromptPay QR Code */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-[#E2DDD5] shadow-2xs space-y-1">
              <div className="bg-[#002D62] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <QrCode className="w-3 h-3" />
                <span>PromptPay Dynamic QR</span>
              </div>

              {qrCodeUrl ? (
                /* eslint-disable-next-html-snippet */
                <img
                  src={qrCodeUrl}
                  alt="PromptPay QR Code"
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center text-stone-400 text-[10px]">
                  กำลังโหลด QR...
                </div>
              )}

              <span className="text-[11px] font-mono font-bold text-stone-900">
                ฿{bill.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="text-xs text-stone-500">
              สถานะ:
            </div>
            <div>
              {bill.status === 'paid' ? (
                <div className="inline-flex items-center space-x-1.5 px-4 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{getTranslation(lang, 'paidStatus')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-4 py-1 bg-[#F4DCD6] text-[#963720] border border-[#D8C7B5] rounded-full text-xs font-semibold">
                  <Clock className="w-4 h-4 text-[#963720]" />
                  <span>{getTranslation(lang, 'pendingStatus')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note & Signature */}
          <div className="pt-3 border-t border-dashed border-stone-200 flex justify-between items-end text-xs text-stone-500">
            <div>
              <p className="italic">{getTranslation(lang, 'thankYouMessage')}</p>
            </div>

            <div className="text-center w-40">
              <div className="h-9 border-b border-stone-300 border-dashed mb-1"></div>
              <p className="text-[11px] text-stone-600">{getTranslation(lang, 'authorizedSignature')}</p>
            </div>
          </div>
        </div>

        {/* Modal Action Bar (Fixed at bottom, Hidden during print) */}
        <div className="bg-stone-100 px-5 py-3 border-t border-stone-200 flex items-center justify-between shrink-0 print:hidden">
          {/* Quick Mark Paid Toggle */}
          <button
            type="button"
            onClick={() =>
              updateBillStatus(
                bill.id,
                bill.status === 'paid' ? 'pending' : 'paid'
              )
            }
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              bill.status === 'paid'
                ? 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
          >
            {bill.status === 'paid' ? 'ทำเป็นยังไม่ชำระ' : 'ทำเป็นชำระเงินแล้ว ✓'}
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleCopyLineMsg}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>คัดลอกส่ง LINE</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบแจ้งหนี้ (Print/PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
