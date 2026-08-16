'use client';

import React, { useState } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { LandlordExpenseModal } from '@/components/expenses/LandlordExpenseModal';
import { PieChart, PlusCircle, CheckCircle2, Clock } from 'lucide-react';

export default function FinancialSummaryPage() {
  const { bills, landlordExpenses, selectedMonth } = useProperty();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const currentBills = bills.filter((b) => b.monthYear === selectedMonth);
  const currentExpense = landlordExpenses.find((e) => e.monthYear === selectedMonth);

  // Collected Utility Revenue from Tenants
  const tenantWaterCollected = currentBills.reduce((acc, b) => acc + b.waterAmount, 0);
  const tenantElecCollected = currentBills.reduce((acc, b) => acc + b.elecAmount, 0);
  const tenantGarbageCollected = currentBills.reduce((acc, b) => acc + b.garbageFee, 0);
  const tenantTotalUtilityCollected = tenantWaterCollected + tenantElecCollected + tenantGarbageCollected;

  // Landlord Expenses Paid to PEA / Water Authority
  const actualWaterBill = currentExpense?.actualWaterBill || 0;
  const waterPaidStatus = currentExpense?.waterPaidStatus || 'paid';
  const waterPaidDate = currentExpense?.waterPaidDate;

  const actualElecBill = currentExpense?.actualElecBill || 0;
  const elecPaidStatus = currentExpense?.elecPaidStatus || 'paid';
  const elecPaidDate = currentExpense?.elecPaidDate;

  const actualGarbageBill = currentExpense?.actualGarbageBill || 0;
  const garbagePaidStatus = currentExpense?.garbagePaidStatus || 'paid';
  const garbagePaidDate = currentExpense?.garbagePaidDate;

  const landlordTotalUtilityCost = actualWaterBill + actualElecBill + actualGarbageBill;

  // Net Profit / Loss Margins
  const netWaterMargin = tenantWaterCollected - actualWaterBill;
  const netElecMargin = tenantElecCollected - actualElecBill;
  const netGarbageMargin = tenantGarbageCollected - actualGarbageBill;
  const netTotalMargin = tenantTotalUtilityCollected - landlordTotalUtilityCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
            FINANCIAL P&L SUMMARY · สรุปบัญชีสาธารณูปโภค
          </span>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif flex items-center space-x-2 mt-0.5">
            <PieChart className="w-5 h-5 text-stone-700" />
            <span>สรุปกำไร-ขาดทุน ค่าน้ำ ค่าไฟ ค่าขยะ ประจำเดือน {selectedMonth}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            เปรียบเทียบยอดจัดเก็บจากผู้เช่า (7 บ./หน่วย) กับยอดบิลที่จ่ายจริงให้การไฟฟ้า PEA และการประปา (แยกสถานะจ่ายบิลหลวง)
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>บันทึกบิลหลวง (แยกตามบิลจริง)</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Utility Collected */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-2">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            ยอดจัดเก็บรวมจากผู้เช่า
          </span>
          <div className="text-3xl font-bold tracking-tight text-emerald-800 font-mono">
            ฿{tenantTotalUtilityCollected.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-stone-500 block">
            จากมิเตอร์ 24 ห้อง (น้ำ ฿{tenantWaterCollected} + ไฟ ฿{tenantElecCollected})
          </span>
        </div>

        {/* Total Paid to Authorities */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-2">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            บิลรวมจ่ายจริงให้หลวง (PEA/ประปา)
          </span>
          <div className="text-3xl font-bold tracking-tight text-rose-800 font-mono">
            ฿{landlordTotalUtilityCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-stone-500 block">
            บิลการประปา ฿{actualWaterBill} + ไฟฟ้า PEA ฿{actualElecBill}
          </span>
        </div>

        {/* Net Margin */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-2">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            กำไรสุทธิ (ส่วนต่างมิเตอร์)
          </span>
          <div
            className={`text-3xl font-bold tracking-tight font-mono ${
              netTotalMargin >= 0 ? 'text-[#15803D]' : 'text-rose-700'
            }`}
          >
            {netTotalMargin >= 0 ? `+฿${netTotalMargin.toLocaleString()}` : `-฿${Math.abs(netTotalMargin).toLocaleString()}`}
          </div>
          <span className="text-[11px] text-stone-500 block">
            {netTotalMargin >= 0 ? 'ผลประกอบการกำไรส่วนต่าง' : 'ผลประกอบการขาดทุน'}
          </span>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden shadow-2xs space-y-4 p-6">
        <h3 className="text-base font-bold text-stone-900 font-serif border-b border-[#E2DDD5] pb-3">
          ตารางเปรียบเทียบกำไร-ขาดทุน และสถานะชำระบิลหลวงรายรายการ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] border-b border-[#E2DDD5] text-stone-700 font-bold uppercase">
              <tr>
                <th className="p-3">รายการบิลหลวง</th>
                <th className="p-3 text-center">สถานะชำระบิลหลวง</th>
                <th className="p-3 text-right">ยอดจัดเก็บจากผู้เช่า</th>
                <th className="p-3 text-right">ยอดจ่ายบิลจริง (หลวง)</th>
                <th className="p-3 text-right font-bold text-stone-900">ส่วนต่างกำไร/ขาดทุน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD5] text-stone-800 font-sans">
              {/* Row 1: Water */}
              <tr>
                <td className="p-3 font-semibold text-stone-900">💧 ค่าน้ำประปา (การประปา)</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      waterPaidStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-[#F4DCD6] text-[#963720] border-[#D8C7B5]'
                    }`}
                  >
                    {waterPaidStatus === 'paid' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ชำระแล้ว {waterPaidDate ? `(${waterPaidDate})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-[#963720]" />
                        <span>ยังไม่ชำระ</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-stone-800">฿{tenantWaterCollected.toLocaleString()}</td>
                <td className="p-3 text-right font-mono text-stone-600">฿{actualWaterBill.toLocaleString()}</td>
                <td className={`p-3 text-right font-mono font-bold text-sm ${netWaterMargin >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {netWaterMargin >= 0 ? `+฿${netWaterMargin.toLocaleString()}` : `-฿${Math.abs(netWaterMargin).toLocaleString()}`}
                </td>
              </tr>

              {/* Row 2: Electricity */}
              <tr>
                <td className="p-3 font-semibold text-stone-900">⚡ ค่าไฟฟ้า (การไฟฟ้า PEA)</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      elecPaidStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-[#F4DCD6] text-[#963720] border-[#D8C7B5]'
                    }`}
                  >
                    {elecPaidStatus === 'paid' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ชำระแล้ว {elecPaidDate ? `(${elecPaidDate})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-[#963720]" />
                        <span>ยังไม่ชำระ</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-stone-800">฿{tenantElecCollected.toLocaleString()}</td>
                <td className="p-3 text-right font-mono text-stone-600">฿{actualElecBill.toLocaleString()}</td>
                <td className={`p-3 text-right font-mono font-bold text-sm ${netElecMargin >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {netElecMargin >= 0 ? `+฿${netElecMargin.toLocaleString()}` : `-฿${Math.abs(netElecMargin).toLocaleString()}`}
                </td>
              </tr>

              {/* Row 3: Garbage */}
              <tr>
                <td className="p-3 font-semibold text-stone-900">🗑 ค่าขยะส่วนกลาง (อบต.)</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      garbagePaidStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-[#F4DCD6] text-[#963720] border-[#D8C7B5]'
                    }`}
                  >
                    {garbagePaidStatus === 'paid' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ชำระแล้ว {garbagePaidDate ? `(${garbagePaidDate})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-[#963720]" />
                        <span>ยังไม่ชำระ</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-stone-800">฿{tenantGarbageCollected.toLocaleString()}</td>
                <td className="p-3 text-right font-mono text-stone-600">฿{actualGarbageBill.toLocaleString()}</td>
                <td className={`p-3 text-right font-mono font-bold text-sm ${netGarbageMargin >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {netGarbageMargin >= 0 ? `+฿${netGarbageMargin.toLocaleString()}` : `-฿${Math.abs(netGarbageMargin).toLocaleString()}`}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[#FAF7F2] border-t border-[#E2DDD5]">
              <tr>
                <td colSpan={2} className="p-3 text-right font-bold text-stone-900 text-sm">รวมทั้งสิ้น</td>
                <td className="p-3 text-right font-mono font-bold text-stone-900 text-sm">฿{tenantTotalUtilityCollected.toLocaleString()}</td>
                <td className="p-3 text-right font-mono font-bold text-stone-700 text-sm">฿{landlordTotalUtilityCost.toLocaleString()}</td>
                <td className={`p-3 text-right font-mono font-bold text-base ${netTotalMargin >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {netTotalMargin >= 0 ? `+฿${netTotalMargin.toLocaleString()}` : `-฿${Math.abs(netTotalMargin).toLocaleString()}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Landlord Expense Modal */}
      <LandlordExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
}
