'use client';

import React, { useState, useEffect, use } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { MonthlyBill, LanguageOption } from '@/types';
import { generatePromptPayDataURL } from '@/lib/promptpay';
import { FileText, Printer, CheckCircle2, Clock, Globe, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function TenantPublicInvoicePage({ params }: InvoicePageProps) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;
  const { bills, property } = useProperty();

  const [bill, setBill] = useState<MonthlyBill | null>(null);
  const [lang, setLang] = useState<LanguageOption>('TH');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Find bill matching ID
    const found = bills.find((b) => b.id === invoiceId || b.id.toLowerCase() === invoiceId.toLowerCase());
    if (found) {
      setBill(found);
      setLang(found.receiptLanguage || 'TH');
    }
  }, [bills, invoiceId]);

  useEffect(() => {
    if (bill && property?.promptPayId) {
      generatePromptPayDataURL(property.promptPayId, bill.totalAmount).then((url) => {
        setQrCodeUrl(url);
      });
    }
  }, [bill, property]);

  const isBurmese = lang === 'MY' || lang === 'MM';

  if (!bill) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-stone-700 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#E2DDD5] shadow-xs text-center max-w-md w-full space-y-4">
          <FileText className="w-12 h-12 text-[#963720] mx-auto opacity-50" />
          <h1 className="text-lg font-bold text-stone-900 font-serif">ไม่พบข้อมูลใบแจ้งหนี้ #{invoiceId}</h1>
          <p className="text-xs text-stone-500">
            ใบแจ้งหนี้นี้อาจถูกลบหรือไม่มีอยู่ในระบบ กรุณาติดต่อผู้ดูแลหอพัก
          </p>
          <Link
            href="/invoices"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าจัดการใบแจ้งหนี้</span>
          </Link>
        </div>
      </div>
    );
  }

  // Multi-language text dictionary
  const labels = isBurmese
    ? {
        title: 'လစဉ် ဘေလ်စာရင်း',
        subTitle: 'ใบแจ้งหนี้ค่าเช่าประจำเดือน',
        invoiceNo: 'ဘေလ်နံပါတ် / เลขที่:',
        date: 'ရက်စွဲ / วันที่:',
        dueDate: 'ပေးရန်ရက် / กำหนดชำระ:',
        room: 'အခန်း / ห้อง:',
        tenant: 'အိမ်ငှား / ผู้เช่า:',
        description: 'အကြောင်းအရာ / รายการ',
        units: 'ယူနစ် / หน่วย',
        amount: 'ကျသင့်ငွေ / จำนวนเงิน (บาท)',
        rent: 'အခန်းခ (ค่าเช่าห้องพัก)',
        water: 'ရေဖိုး (ค่าน้ำประปา)',
        elec: 'မီးဖိုး (ค่าไฟฟ้า)',
        garbage: 'အမှိုက်ခ (ค่าบริการขยะ/อื่นๆ)',
        total: 'စုစုပေါင်း (ยอดรวมสุทธิ)',
        statusPaid: 'ငွေပေးချေပြီး (จ่ายแล้ว)',
        statusPending: 'ပေးရန်ကျန် (ค้างจ่าย)',
        scanToPay: 'สแกน QR Code เพื่อชำระเงินผ่าน PromptPay',
        accName: 'ชื่อบัญชี:',
        accNo: 'เลขที่บัญชี PromptPay:',
        print: 'พิมพ์ใบแจ้งหนี้ (Print / PDF)',
      }
    : {
        title: 'ใบแจ้งหนี้ค่าเช่าประจำเดือน',
        subTitle: 'MONTHLY INVOICE & UTILITY BILL',
        invoiceNo: 'เลขที่ใบแจ้งหนี้:',
        date: 'วันที่ออกเอกสาร:',
        dueDate: 'กำหนดชำระเงินภายใน:',
        room: 'ห้องพักเลขที่:',
        tenant: 'ชื่อผู้เช่า:',
        description: 'รายการค่าใช้จ่าย',
        units: 'หน่วยที่ใช้',
        amount: 'จำนวนเงิน (บาท)',
        rent: 'ค่าเช่าห้องพัก',
        water: 'ค่าน้ำประปา',
        elec: 'ค่าไฟฟ้า',
        garbage: 'ค่าบริการขยะ/อื่นๆ',
        total: 'ยอดรวมสุทธิที่ต้องชำระ',
        statusPaid: 'ชำระเงินเรียบร้อยแล้ว',
        statusPending: 'รอการชำระเงิน',
        scanToPay: 'สแกน QR Code เพื่อชำระเงินผ่าน PromptPay',
        accName: 'ชื่อบัญชี:',
        accNo: 'เลขที่ PromptPay:',
        print: 'พิมพ์ใบแจ้งหนี้ (Print / PDF)',
      };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-white p-3 px-4 rounded-2xl border border-[#E2DDD5] shadow-2xs print:hidden">
          <Link
            href="/invoices"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้ารายการ</span>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Language switch */}
            <div className="bg-[#FAF7F2] p-1 rounded-xl border border-[#E2DDD5] flex items-center space-x-1 text-xs">
              <button
                onClick={() => setLang('TH')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  !isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🇹🇭 ไทย
              </button>
              <button
                onClick={() => setLang('MY')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🇲🇲 မြန်မာ
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{labels.print}</span>
            </button>
          </div>
        </div>

        {/* Printable Invoice Card */}
        <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-8 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E2DDD5] pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#963720]">
                <Building2 className="w-6 h-6" />
                <h1 className="text-xl font-bold font-serif tracking-tight text-stone-900">
                  {property?.name || 'หอพักตาลเดี่ยว'}
                </h1>
              </div>
              <p className="text-xs text-stone-500 max-w-xs">{property?.address}</p>
            </div>

            <div className="text-left sm:text-right space-y-1 font-mono text-xs">
              <div className="inline-block px-3 py-1 bg-[#FAF7F2] border border-[#E2DDD5] rounded-xl font-bold text-stone-900">
                #{bill.id}
              </div>
              <p className="text-stone-500 pt-1">
                {labels.date} <span className="font-semibold text-stone-800">{bill.issuedAt}</span>
              </p>
              <p className="text-stone-500">
                {labels.dueDate} <span className="font-semibold text-rose-700">{bill.dueDate}</span>
              </p>
            </div>
          </div>

          {/* Title Banner & Status */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">{labels.title}</h2>
              <p className="text-xs text-[#963720] font-semibold">{labels.subTitle}</p>
            </div>

            <div>
              {bill.status === 'paid' ? (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{labels.statusPaid}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F4DCD6] text-[#963720] border border-[#D8C7B5]">
                  <Clock className="w-4 h-4 text-[#963720]" />
                  <span>{labels.statusPending}</span>
                </span>
              )}
            </div>
          </div>

          {/* Tenant & Room Info */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 text-xs">
            <div>
              <span className="text-stone-500 block">{labels.room}</span>
              <span className="text-base font-mono font-bold text-stone-900">ห้อง {bill.roomNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block">{labels.tenant}</span>
              <span className="text-sm font-bold text-stone-900">{bill.tenantName}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] border-y border-[#E2DDD5] text-stone-700 font-bold uppercase">
                <tr>
                  <th className="p-3">{labels.description}</th>
                  <th className="p-3 text-center">{labels.units}</th>
                  <th className="p-3 text-right">{labels.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                <tr>
                  <td className="p-3 font-medium text-stone-900">{labels.rent}</td>
                  <td className="p-3 text-center font-mono text-stone-500">-</td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    ฿{bill.rentAmount.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-medium text-stone-900">
                    {labels.water}
                    {bill.waterPrevious !== undefined && bill.waterCurrent !== undefined && (
                      <span className="block text-[10px] text-stone-500 font-mono">
                        (เลขมิเตอร์: {bill.waterPrevious} ➔ {bill.waterCurrent})
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono text-stone-700">{bill.waterUnits}</td>
                  <td className="p-3 text-right font-mono text-stone-800">
                    ฿{bill.waterAmount.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-medium text-stone-900">
                    {labels.elec}
                    {bill.elecPrevious !== undefined && bill.elecCurrent !== undefined && (
                      <span className="block text-[10px] text-stone-500 font-mono">
                        (เลขมิเตอร์: {bill.elecPrevious} ➔ {bill.elecCurrent})
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono text-stone-700">{bill.elecUnits}</td>
                  <td className="p-3 text-right font-mono text-stone-800">
                    ฿{bill.elecAmount.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-medium text-stone-900">{labels.garbage}</td>
                  <td className="p-3 text-center font-mono text-stone-500">-</td>
                  <td className="p-3 text-right font-mono text-stone-800">
                    ฿{bill.garbageFee.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-stone-800">
                <tr className="bg-[#FAF7F2]">
                  <td colSpan={2} className="p-4 font-bold text-sm text-[#963720]">
                    {labels.total}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-lg text-[#963720]">
                    ฿{bill.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PromptPay Payment QR Section */}
          <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#963720] block">
                {labels.scanToPay}
              </span>
              <p className="text-xs text-stone-600">
                {labels.accName} <span className="font-bold text-stone-900">{property?.promptPayName}</span>
              </p>
              <p className="text-xs text-stone-600 font-mono">
                {labels.accNo} <span className="font-bold text-stone-900">{property?.promptPayId}</span>
              </p>
              <p className="text-[11px] text-stone-400">
                สแกนผ่านแอป Mobile Banking ได้ทุกธนาคาร ยอดเงินจะตรงตามใบแจ้งหนี้อัตโนมัติ
              </p>
            </div>

            {qrCodeUrl ? (
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs shrink-0 text-center">
                {/* eslint-disable-next-html-snippet */}
                <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-36 h-36 object-contain mx-auto" />
                <span className="text-[10px] font-bold text-stone-600 block mt-1">PromptPay QR</span>
              </div>
            ) : (
              <div className="w-36 h-36 bg-stone-200 rounded-2xl flex items-center justify-center text-xs text-stone-500">
                กำลังสร้าง QR Code...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
