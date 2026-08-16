'use client';

import React, { useState } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { VisualFloorPlan } from '@/components/layout/VisualFloorPlan';
import { LandlordExpenseModal } from '@/components/expenses/LandlordExpenseModal';
import {
  Gauge,
  FileText,
  PieChart,
  Users,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { property, rooms, tenants, bills, selectedMonth, landlordExpenses } = useProperty();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) =>
    tenants.some((t) => t.assignedRoomId === r.id || t.id === r.currentTenantId)
  );
  const vacantRooms = rooms.filter(
    (r) => !tenants.some((t) => t.assignedRoomId === r.id || t.id === r.currentTenantId)
  );

  const thaiTenantsCount = tenants.filter((t) => t.nationality === 'TH').length;
  const burmeseTenantsCount = tenants.filter((t) => t.nationality === 'MM').length;

  const currentBills = bills.filter(
    (b) =>
      b.monthYear === selectedMonth &&
      tenants.some((t) => t.assignedRoomId === b.roomId || t.id === b.tenantId)
  );
  const paidBills = currentBills.filter((b) => b.status === 'paid');
  const pendingBills = currentBills.filter((b) => b.status === 'pending');
  const overdueBills = currentBills.filter((b) => b.status === 'overdue');

  const totalCollectedRevenue = paidBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPendingRevenue = pendingBills.reduce((acc, b) => acc + b.totalAmount, 0) + overdueBills.reduce((acc, b) => acc + b.totalAmount, 0);

  const currentLandlordExp = landlordExpenses.find((e) => e.monthYear === selectedMonth);
  const totalLandlordUtilityCost = (currentLandlordExp?.actualWaterBill || 0) + (currentLandlordExp?.actualElecBill || 0) + (currentLandlordExp?.actualGarbageBill || 0);

  const totalMeterUtilityCollected = currentBills.reduce((acc, b) => acc + b.waterAmount + b.elecAmount + b.garbageFee, 0);
  const utilityProfitLoss = totalMeterUtilityCollected - totalLandlordUtilityCost;

  return (
    <div className="space-y-6">
      {/* OVERVIEW TOP BANNER WITH MAIN EXPENSE BUTTON */}
      <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
              OVERVIEW · ภาพรวมหอพักประจำเดือน
            </span>
            <div className="flex items-baseline space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
                {selectedMonth}
              </h1>
            </div>
            <span className="text-xs text-stone-500 block">
              {property.name} • {property.address}
            </span>
          </div>

          {/* Clean Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>🧾 บันทึกบิลหลวง (การประปา / PEA)</span>
            </button>

            <Link
              href="/meter-reading"
              className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>✓ จดมิเตอร์เดือนนี้</span>
            </Link>

            <Link
              href="/invoices"
              className="bg-white hover:bg-stone-50 text-stone-800 border border-[#E2DDD5] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <span>📄 ใบแจ้งหนี้สองภาษา</span>
            </Link>
          </div>
        </div>

        {/* JOINED 4-METRIC GRID WITH VERTICAL DIVIDERS */}
        <div className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-stone-200">
          {/* Card 1: Total Rooms */}
          <div className="p-5 space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              ห้องพักทั้งหมด
            </span>
            <div className="text-3xl font-bold tracking-tight text-stone-900">
              {totalRooms}
            </div>
            <span className="text-[11px] text-stone-500 block">
              เข้าพัก {occupiedRooms.length} / ว่าง {vacantRooms.length} ห้อง
            </span>
          </div>

          {/* Card 2: Paid Collected Revenue (Green) */}
          <div className="p-5 space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              ยอดชำระแล้ว
            </span>
            <div className="text-3xl font-bold tracking-tight text-[#15803D]">
              {totalCollectedRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-stone-500 block">
              บาท ({paidBills.length} ห้อง)
            </span>
          </div>

          {/* Card 3: Pending Overdue Revenue (Terracotta Red) */}
          <div className="p-5 space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              ยอดค้างชำระ
            </span>
            <div className="text-3xl font-bold tracking-tight text-[#963720]">
              {totalPendingRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-stone-500 block">
              บาท ({pendingBills.length + overdueBills.length} ห้องค้างจ่าย)
            </span>
          </div>

          {/* Card 4: Utility Profit/Loss */}
          <div className="p-5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                กำไรน้ำ-ไฟ สุทธิ
              </span>
              <div
                className={`text-3xl font-bold tracking-tight ${utilityProfitLoss >= 0 ? 'text-[#15803D]' : 'text-rose-700'
                  }`}
              >
                {utilityProfitLoss >= 0
                  ? `${utilityProfitLoss.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                  : `${utilityProfitLoss.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
              </div>
            </div>
            <span className="text-[11px] text-stone-500 block pt-1 border-t border-stone-100">
              จัดเก็บ ฿{totalMeterUtilityCollected.toLocaleString()} vs จ่ายจริง ฿{totalLandlordUtilityCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* LOWER TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Architectural Visual Floor Plan */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
              PROGRESS · ผังตำแหน่งห้องพักจริง
            </span>
          </div>
          <VisualFloorPlan />
        </div>

        {/* Right Column (1 Col): Status & System Summary Cards */}
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-4">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
              STATUS · สถานะการจัดเก็บ
            </span>

            <div className="space-y-3 text-xs divide-y divide-stone-200">
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-600 font-medium">อัตราค่าน้ำประปา</span>
                <span className="font-mono font-bold text-stone-900">
                  {property.waterRatePerUnit}.00 ฿ / หน่วย
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-600 font-medium">อัตราค่าไฟฟ้า</span>
                <span className="font-mono font-bold text-stone-900">
                  {property.elecRatePerUnit}.00 ฿ / หน่วย
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-600 font-medium">ค่าขยะส่วนกลาง</span>
                <span className="font-mono font-bold text-stone-900">
                  {property.garbageFeePerRoom}.00 ฿ / ห้อง
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-600 font-medium">บิลค่าน้ำรวมหลวง</span>
                <span className="font-mono text-stone-900 font-semibold">
                  ฿{(currentLandlordExp?.actualWaterBill || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-600 font-medium">บิลค่าไฟรวม PEA</span>
                <span className="font-mono text-stone-900 font-semibold">
                  ฿{(currentLandlordExp?.actualElecBill || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-600 font-medium">บิลค่าขยะรวม อบต.</span>
                <span className="font-mono text-stone-900 font-semibold">
                  ฿{(currentLandlordExp?.actualGarbageBill || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Nationality Breakdown Card */}
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-4">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
              NATIONALITY · สัญชาติผู้เช่า
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#E2DDD5] rounded-xl text-center shadow-2xs">
                <span className="text-lg block mb-0.5">🇹🇭</span>
                <span className="font-bold text-stone-900 text-sm">{thaiTenantsCount} คน</span>
                <span className="text-[10px] text-stone-500 block font-medium">คนไทย</span>
              </div>

              <div className="p-3 bg-white border border-[#E2DDD5] rounded-xl text-center shadow-2xs">
                <span className="text-lg block mb-0.5">🇲🇲</span>
                <span className="font-bold text-stone-900 text-sm">{burmeseTenantsCount} คน</span>
                <span className="text-[10px] text-stone-500 block font-medium">ชาวพม่า</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-3">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
              SHORTCUTS · ทางลัดระบบ
            </span>

            <div className="space-y-2">
              <Link
                href="/meter-reading"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE1D5] transition-colors text-xs font-medium text-stone-800 border border-[#E2DDD5]"
              >
                <span>บันทึกเลขมิเตอร์น้ำ-ไฟ</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/financial-summary"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE1D5] transition-colors text-xs font-medium text-stone-800 border border-[#E2DDD5]"
              >
                <span>งบสรุปกำไร/ขาดทุน มิเตอร์</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>
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
