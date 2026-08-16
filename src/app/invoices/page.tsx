'use client';

import React, { useState } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { MonthlyBill, LineDeliveryLog } from '@/types';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';
import {
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  SendHorizontal,
  History,
  AlertCircle,
  MessageSquare,
  X,
  RefreshCw,
} from 'lucide-react';

export default function InvoicesPage() {
  const {
    bills,
    tenants,
    selectedMonth,
    updateBillStatus,
    sendInvoiceViaLine,
    sendAllInvoicesViaLine,
    lineDeliveryLogs,
  } = useProperty();

  const [selectedBill, setSelectedBill] = useState<MonthlyBill | null>(null);
  const [sendingLine, setSendingLine] = useState<string | null>(null); // billId or 'all'
  const [sendingStatus, setSendingStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Filter & deduplicate bills for current selected month
  const rawBills = bills.filter((b) => b.monthYear === selectedMonth);
  const currentBillsMap = new Map<string, MonthlyBill>();
  rawBills.forEach((b) => {
    if (b && b.roomNumber) {
      currentBillsMap.set(b.roomNumber, b);
    }
  });
  const currentBills = Array.from(currentBillsMap.values());

  const handleSendSingleLine = async (bill: MonthlyBill) => {
    setSendingLine(bill.id);
    setSendingStatus(null);
    try {
      const res = await sendInvoiceViaLine(bill.id);
      if (res.success) {
        setSendingStatus({ type: 'success', message: `ส่งใบแจ้งหนี้ห้อง ${bill.roomNumber} ผ่าน LINE เรียบร้อยแล้ว!` });
      } else {
        setSendingStatus({ type: 'error', message: res.message || 'ส่งใบแจ้งหนี้ล้มเหลว' });
      }
    } catch (err: any) {
      setSendingStatus({ type: 'error', message: err.message || 'เกิดข้อผิดพลาด' });
    } finally {
      setSendingLine(null);
    }
  };

  const handleSendAllLine = async () => {
    if (!confirm(`คุณต้องการส่งใบแจ้งหนี้ประจำเดือน ${selectedMonth} ทั้งหมด (${currentBills.length} ห้อง) ผ่าน LINE หรือไม่?`)) {
      return;
    }

    setSendingLine('all');
    setSendingStatus(null);
    try {
      const res = await sendAllInvoicesViaLine(selectedMonth);
      if (res.success) {
        setSendingStatus({
          type: 'success',
          message: res.message || `ส่งใบแจ้งหนี้ทั้งหมดเสร็จสิ้น (${res.count} ห้องที่ผูก LINE)`,
        });
      } else {
        setSendingStatus({ type: 'error', message: res.message || 'เกิดข้อผิดพลาดในการส่งใบแจ้งหนี้แบบกลุ่ม' });
      }
    } catch (err: any) {
      setSendingStatus({ type: 'error', message: err.message || 'เกิดข้อผิดพลาดในการส่ง' });
    } finally {
      setSendingLine(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
            INVOICES & LINE BOT · ใบแจ้งหนี้และระบบส่ง LINE อัตโนมัติ
          </span>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif flex items-center space-x-2 mt-0.5">
            <FileText className="w-5 h-5 text-[#963720]" />
            <span>รายการใบแจ้งหนี้ประจำเดือน {selectedMonth} ({currentBills.length} ใบ)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            พิมพ์ใบแจ้งหนี้ หรือกดส่งบิลผ่าน LINE Official Account รายห้อง/ส่งทั้งหมด 2 ภาษา (ไทย 🇹🇭 / พม่า 🇲🇲)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="flex-1 md:flex-none px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            title="ดูประวัติการส่งข้อความย้อนหลัง"
          >
            <History className="w-4 h-4 text-stone-600" />
            <span>ประวัติการส่ง ({lineDeliveryLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={handleSendAllLine}
            disabled={sendingLine === 'all' || currentBills.length === 0}
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {sendingLine === 'all' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizontal className="w-4 h-4" />
            )}
            <span>ส่งบิลทั้งหมดผ่าน LINE</span>
          </button>
        </div>
      </div>

      {/* Sending Status Alert Banner */}
      {sendingStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-2xs ${
            sendingStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {sendingStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{sendingStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSendingStatus(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-stone-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE INVOICE CARDS (< md breakpoint) */}
      <div className="space-y-3 md:hidden">
        {currentBills.map((bill, index) => {
          const tenant = tenants.find((t) => t.id === bill.tenantId || t.assignedRoomId === bill.roomId);
          const hasLineId = Boolean(tenant?.lineUserId || (bill as any).lineUserId);
          const tenantLang = bill.receiptLanguage || tenant?.preferredLanguage || 'TH';

          return (
            <div
              key={`mob-${bill.id}-${index}`}
              className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-3 text-xs"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-stone-900 text-xs bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                    ห้อง {bill.roomNumber}
                  </span>
                  <span className="font-bold text-stone-900 text-xs">
                    {tenantLang === 'MY' || tenantLang === 'MM' ? '🇲🇲' : '🇹🇭'} {bill.tenantName}
                  </span>
                </div>

                {/* Status Payment Button */}
                <button
                  type="button"
                  onClick={() =>
                    updateBillStatus(
                      bill.id,
                      bill.status === 'paid' ? 'pending' : 'paid'
                    )
                  }
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    bill.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#F4DCD6] text-[#963720] border-[#D8C7B5]'
                  }`}
                >
                  {bill.status === 'paid' ? '✓ จ่ายแล้ว' : '✕ ค้างจ่าย'}
                </button>
              </div>

              {/* Bill Details Breakdown Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-stone-600 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E2DDD5]">
                <div>ค่าเช่าห้อง: <span className="font-bold text-stone-800">฿{bill.rentAmount.toLocaleString()}</span></div>
                <div>ค่าน้ำ ({bill.waterUnits} u): <span className="font-bold text-stone-800">฿{bill.waterAmount}</span></div>
                <div>ค่าไฟฟ้า ({bill.elecUnits} u): <span className="font-bold text-stone-800">฿{bill.elecAmount}</span></div>
                <div>ค่าขยะ: <span className="font-bold text-stone-800">฿{bill.garbageFee}</span></div>
              </div>

              {/* Total & LINE Delivery Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block font-semibold">ยอดรวมสุทธิ</span>
                  <span className="font-mono text-base font-bold text-[#963720]">
                    ฿{bill.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  {bill.lineSentStatus === 'sent' ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>ส่งแล้ว</span>
                    </span>
                  ) : bill.lineSentStatus === 'failed' ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>ส่งไม่สำเร็จ</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
                      <span>ยังไม่ส่ง</span>
                    </span>
                  )}
                  {hasLineId ? (
                    <span className="text-[9px] text-emerald-700 font-medium block mt-0.5">✓ ผูก LINE แล้ว</span>
                  ) : (
                    <span className="text-[9px] text-stone-400 block mt-0.5">⚪ ยังไม่ผูก LINE</span>
                  )}
                </div>
              </div>

              {/* Mobile Card Actions */}
              <div className="flex gap-2 pt-1 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleSendSingleLine(bill)}
                  disabled={sendingLine === bill.id}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 disabled:opacity-50 cursor-pointer"
                >
                  {sendingLine === bill.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>ส่ง LINE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBill(bill)}
                  className="flex-1 py-2 bg-[#963720] hover:bg-[#822E1A] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ดูใบแจ้งหนี้</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoices List Table (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] border-b border-[#E2DDD5] text-stone-700 font-bold uppercase">
              <tr>
                <th className="p-3">เลขที่ใบแจ้งหนี้</th>
                <th className="p-3">ห้องพัก</th>
                <th className="p-3">ผู้เช่า</th>
                <th className="p-3 text-right">ค่าน้ำ</th>
                <th className="p-3 text-right">ค่าไฟ</th>
                <th className="p-3 text-right">ค่าขยะ</th>
                <th className="p-3 text-right">ค่าเช่า</th>
                <th className="p-3 text-right font-bold text-stone-900">ยอดรวม</th>
                <th className="p-3 text-center">สถานะชำระ</th>
                <th className="p-3 text-center">สถานะส่ง LINE</th>
                <th className="p-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD5] text-stone-800 font-sans">
              {currentBills.map((bill, index) => {
                const tenant = tenants.find((t) => t.id === bill.tenantId || t.assignedRoomId === bill.roomId);
                const hasLineId = Boolean(tenant?.lineUserId || (bill as any).lineUserId);
                const tenantLang = bill.receiptLanguage || tenant?.preferredLanguage || 'TH';

                return (
                  <tr key={`${bill.id}-${bill.roomNumber}-${index}`} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-900">#{bill.id}</td>
                    <td className="p-3 font-mono font-bold text-stone-900">ห้อง {bill.roomNumber}</td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-stone-900 block">
                          {tenantLang === 'MY' || tenantLang === 'MM' ? '🇲🇲' : '🇹🇭'} {bill.tenantName}
                        </span>
                        {hasLineId ? (
                          <span className="text-[10px] text-emerald-700 font-medium block">
                            ✓ ผูก LINE แล้ว ({tenantLang === 'MY' || tenantLang === 'MM' ? 'ภาษาพม่า' : 'ภาษาไทย'})
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 block">⚪ ยังไม่ได้ผูก LINE</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-stone-600">฿{bill.waterAmount}</td>
                    <td className="p-3 text-right font-mono text-stone-600">฿{bill.elecAmount}</td>
                    <td className="p-3 text-right font-mono text-stone-600">฿{bill.garbageFee}</td>
                    <td className="p-3 text-right font-mono font-semibold text-stone-900">฿{bill.rentAmount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#963720] text-sm">
                      ฿{bill.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateBillStatus(
                            bill.id,
                            bill.status === 'paid' ? 'pending' : 'paid'
                          )
                        }
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          bill.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-[#F4DCD6] text-[#963720] border-[#D8C7B5]'
                        }`}
                      >
                        {bill.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>จ่ายแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#963720]" />
                            <span>ค้างจ่าย</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* LINE Delivery Status */}
                    <td className="p-3 text-center">
                      {bill.lineSentStatus === 'sent' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>ส่งแล้ว</span>
                        </span>
                      ) : bill.lineSentStatus === 'failed' ? (
                        <span
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                          title={bill.lineDeliveryError || 'ส่งไม่สำเร็จ'}
                        >
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>ล้มเหลว</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
                          <span>ยังไม่ส่ง</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendSingleLine(bill)}
                          disabled={sendingLine === bill.id}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          title="ส่งใบแจ้งหนี้เข้า LINE ของผู้เช่าคนนี้"
                        >
                          {sendingLine === bill.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>ส่ง LINE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedBill(bill)}
                          className="px-2.5 py-1.5 bg-[#963720] hover:bg-[#822E1A] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>ดูบิล</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELIVERY LOGS HISTORY MODAL */}
      {showLogsModal && (
        <div
          onClick={() => setShowLogsModal(false)}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 border border-stone-200 cursor-default max-h-[85vh] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2 font-serif">
                <History className="w-4 h-4 text-[#963720]" />
                <span>ประวัติการส่งใบแจ้งหนี้ผ่าน LINE Official Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border border-stone-200 rounded-2xl">
              {lineDeliveryLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  ยังไม่มีประวัติการส่งข้อความในระบบ
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-700 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="p-3">วัน-เวลา</th>
                      <th className="p-3">ห้อง</th>
                      <th className="p-3">ภาษา</th>
                      <th className="p-3">LINE User ID</th>
                      <th className="p-3 text-center">สถานะ</th>
                      <th className="p-3">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {lineDeliveryLogs.map((log, i) => (
                      <tr key={`${log.id}-${i}`} className="hover:bg-stone-50">
                        <td className="p-3 font-mono text-stone-600">
                          {new Date(log.sentAt).toLocaleString('th-TH')}
                        </td>
                        <td className="p-3 font-bold text-stone-900">ห้อง {log.roomNumber}</td>
                        <td className="p-3">
                          {log.language === 'MY' || log.language === 'MM' ? '🇲🇲 พม่า' : '🇹🇭 ไทย'}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-stone-600">
                          {log.lineUserId ? log.lineUserId.substring(0, 12) + '...' : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {log.status === 'success' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              สำเร็จ
                            </span>
                          ) : log.status === 'skipped_no_line' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                              ข้าม (ไม่มี LINE ID)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ล้มเหลว
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-stone-500 text-[11px]">
                          {log.errorMessage || 'ส่งข้อความเรียบร้อย'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
              <span>รวม {lineDeliveryLogs.length} รายการ</span>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt/Invoice Modal */}
      <ReceiptModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </div>
  );
}
