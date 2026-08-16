'use client';

import React, { useState } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Room, MonthlyBill } from '@/types';
import { LandlordExpenseModal } from '@/components/expenses/LandlordExpenseModal';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';
import {
  Save,
  FileText,
  Table,
  Receipt,
  AlertTriangle,
} from 'lucide-react';

export default function MeterReadingPage() {
  const {
    rooms,
    tenants,
    zones,
    property,
    meterReadings,
    bills,
    selectedMonth,
    saveMeterReading,
  } = useProperty();

  const [activeZone, setActiveZone] = useState<string>('all');
  const [meterInputs, setMeterInputs] = useState<
    Record<
      string,
      {
        waterPrevious: number;
        waterCurrent: number | string;
        elecPrevious: number;
        elecCurrent: number | string;
      }
    >
  >({});
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [previewBill, setPreviewBill] = useState<MonthlyBill | null>(null);

  // Filter rooms by active zone filter tab
  const filteredRooms =
    activeZone === 'all' ? rooms : rooms.filter((r) => r.zoneId === activeZone);

  // Helper to get current input values or fallback to default
  const getRoomInput = (room: Room) => {
    const existingReading = meterReadings.find(
      (m) => m.roomId === room.id && m.monthYear === selectedMonth
    );

    if (meterInputs[room.id] !== undefined) {
      return meterInputs[room.id];
    }

    const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
    const hasTenant = Boolean(tenant);

    return {
      waterPrevious: existingReading?.waterPrevious ?? room.waterMeterPrevious,
      waterCurrent: existingReading?.waterCurrent ?? (room.waterMeterPrevious + (hasTenant ? 10 : 0)),
      elecPrevious: existingReading?.elecPrevious ?? room.elecMeterPrevious,
      elecCurrent: existingReading?.elecCurrent ?? (room.elecMeterPrevious + (hasTenant ? 80 : 0)),
    };
  };

  const handleInputChange = (
    roomId: string,
    field: 'waterCurrent' | 'elecCurrent',
    rawVal: string
  ) => {
    // Keep only numeric characters
    const cleanDigits = rawVal.replace(/[^0-9]/g, '');
    // Remove leading zeros unless it's just '0'
    const formatted = cleanDigits === '' ? '' : cleanDigits.replace(/^0+(?=\d)/, '');

    setMeterInputs((prev) => {
      const room = rooms.find((r) => r.id === roomId);
      const tenant = tenants.find((t) => t.id === room?.currentTenantId || t.assignedRoomId === room?.id);
      const hasTenant = Boolean(tenant);

      const current = prev[roomId] || {
        waterPrevious: room?.waterMeterPrevious || 0,
        waterCurrent: (room?.waterMeterPrevious || 0) + (hasTenant ? 10 : 0),
        elecPrevious: room?.elecMeterPrevious || 0,
        elecCurrent: (room?.elecMeterPrevious || 0) + (hasTenant ? 80 : 0),
      };

      return {
        ...prev,
        [roomId]: {
          ...current,
          [field]: formatted,
        },
      };
    });
  };

  const handleSaveSingleRoom = (room: Room) => {
    const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
    const hasTenant = Boolean(tenant);

    const input = getRoomInput(room);
    const waterCurrNum = input.waterCurrent === '' ? input.waterPrevious : Number(input.waterCurrent);
    const elecCurrNum = input.elecCurrent === '' ? input.elecPrevious : Number(input.elecCurrent);

    const waterUnits = Math.max(0, waterCurrNum - input.waterPrevious);
    const elecUnits = Math.max(0, elecCurrNum - input.elecPrevious);

    const waterAmount = waterUnits * property.waterRatePerUnit;
    const elecAmount = elecUnits * property.elecRatePerUnit;

    // For vacant rooms: Rent = 0, Garbage = 0!
    const garbageFee = hasTenant ? property.garbageFeePerRoom : 0;
    const rentAmount = hasTenant ? room.rentPrice : 0;
    const totalBill = rentAmount + waterAmount + elecAmount + garbageFee;

    saveMeterReading({
      propertyId: property.id,
      roomId: room.id,
      monthYear: selectedMonth,
      waterPrevious: input.waterPrevious,
      waterCurrent: waterCurrNum,
      waterUnits,
      waterRate: property.waterRatePerUnit,
      waterAmount,
      elecPrevious: input.elecPrevious,
      elecCurrent: elecCurrNum,
      elecUnits,
      elecRate: property.elecRatePerUnit,
      elecAmount,
      garbageFee,
      rentAmount,
      totalBill,
    });
  };

  const handleOpenInvoice = (room: Room) => {
    // Save current input values first
    handleSaveSingleRoom(room);

    const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
    const hasTenant = Boolean(tenant);

    const input = getRoomInput(room);
    const waterCurrNum = input.waterCurrent === '' ? input.waterPrevious : Number(input.waterCurrent);
    const elecCurrNum = input.elecCurrent === '' ? input.elecPrevious : Number(input.elecCurrent);

    const waterUnits = Math.max(0, waterCurrNum - input.waterPrevious);
    const elecUnits = Math.max(0, elecCurrNum - input.elecPrevious);
    const waterAmount = waterUnits * property.waterRatePerUnit;
    const elecAmount = elecUnits * property.elecRatePerUnit;

    const garbageFee = hasTenant ? property.garbageFeePerRoom : 0;
    const rentAmount = hasTenant ? room.rentPrice : 0;
    const totalAmount = rentAmount + waterAmount + elecAmount + garbageFee;

    const cleanMonth = (selectedMonth || '2026-08').replace('-', '');
    const billId = `INV-${cleanMonth}${room.roomNumber}`;

    const currentBill: MonthlyBill = {
      id: billId,
      propertyId: property.id,
      roomId: room.id,
      roomNumber: room.roomNumber,
      zoneCode: room.zoneCode,
      tenantId: tenant?.id || '',
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'ผู้เช่าชั่วคราว',
      tenantNationality: tenant?.nationality || 'TH',
      monthYear: selectedMonth,
      rentAmount,
      waterUnits,
      waterAmount,
      elecUnits,
      elecAmount,
      garbageFee,
      totalAmount,
      status: 'pending',
      receiptLanguage: tenant?.preferredLanguage || 'TH',
      dueDate: `${selectedMonth}-05`,
      issuedAt: new Date().toISOString().split('T')[0],
    };

    setPreviewBill(currentBill);
  };

  const handleSaveAllMeters = () => {
    filteredRooms.forEach((room) => {
      handleSaveSingleRoom(room);
    });
    alert(`บันทึกเลขมิเตอร์ทั้งหมด (${filteredRooms.length} ห้อง) ประจำเดือน ${selectedMonth} เรียบร้อยแล้ว!`);
  };

  // Helper for distinct Zone Pill colors
  const getZoneColorStyle = (zoneCode: string) => {
    switch (zoneCode) {
      case 'A':
        return 'bg-amber-800 text-amber-50 border-amber-900';
      case 'B':
        return 'bg-blue-800 text-blue-50 border-blue-900';
      case 'C':
        return 'bg-emerald-800 text-emerald-50 border-emerald-900';
      case 'D':
        return 'bg-indigo-800 text-indigo-50 border-indigo-900';
      case 'E':
        return 'bg-[#963720] text-rose-50 border-[#822E1A]';
      default:
        return 'bg-stone-900 text-white border-stone-800';
    }
  };

  // Grand totals calculation for bottom summary row
  let grandTotalWaterUnits = 0;
  let grandTotalWaterAmount = 0;
  let grandTotalElecUnits = 0;
  let grandTotalElecAmount = 0;
  let grandTotalGarbageAmount = 0;
  let grandTotalRentAmount = 0;
  let grandTotalBillAmount = 0;

  filteredRooms.forEach((room) => {
    const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
    const hasTenant = Boolean(tenant);

    const input = getRoomInput(room);
    const waterCurrNum = input.waterCurrent === '' ? input.waterPrevious : Number(input.waterCurrent);
    const elecCurrNum = input.elecCurrent === '' ? input.elecPrevious : Number(input.elecCurrent);

    const waterUnits = Math.max(0, waterCurrNum - input.waterPrevious);
    const elecUnits = Math.max(0, elecCurrNum - input.elecPrevious);
    const waterAmount = waterUnits * property.waterRatePerUnit;
    const elecAmount = elecUnits * property.elecRatePerUnit;

    const garbageFee = hasTenant ? property.garbageFeePerRoom : 0;
    const rentAmount = hasTenant ? room.rentPrice : 0;
    const totalBill = rentAmount + waterAmount + elecAmount + garbageFee;

    grandTotalWaterUnits += waterUnits;
    grandTotalWaterAmount += waterAmount;
    grandTotalElecUnits += elecUnits;
    grandTotalElecAmount += elecAmount;
    grandTotalGarbageAmount += garbageFee;
    grandTotalRentAmount += rentAmount;
    grandTotalBillAmount += totalBill;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
            METER ENTRY · ตารางบันทึกมิเตอร์แบบ SPREADSHEET
          </span>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif flex items-center space-x-2 mt-0.5">
            <Table className="w-5 h-5 text-stone-700" />
            <span>จดมิเตอร์น้ำ-ไฟประจำเดือน {selectedMonth}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            กรอกเลขมิเตอร์ครั้งนี้ในตารางรวดเร็วทันใจ (กด Tab เลื่อนช่อง) แล้วกดปุ่มบันทึกรวมปุ่มเดียวสำหรับทุกห้อง
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>🧾 บันทึกบิลหลวง (การประปา / PEA)</span>
          </button>

          <button
            onClick={handleSaveAllMeters}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>💾 บันทึกมิเตอร์ทั้งหมด ({filteredRooms.length} ห้อง)</span>
          </button>
        </div>
      </div>

      {/* Zone Filters Bar */}
      <div className="flex items-center space-x-2 text-xs bg-[#FAF7F2] p-2 rounded-xl border border-[#E2DDD5] shadow-2xs">
        <span className="text-stone-500 font-semibold px-2">เลือกโซน:</span>
        <button
          onClick={() => setActiveZone('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeZone === 'all'
              ? 'bg-[#963720] text-white shadow-2xs font-semibold'
              : 'text-stone-600 hover:bg-[#EAE1D5]'
          }`}
        >
          ทุกห้อง ({rooms.length})
        </button>
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeZone === z.id
                ? 'bg-[#963720] text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:bg-[#EAE1D5]'
            }`}
          >
            โซน {z.code} ({rooms.filter((r) => r.zoneId === z.id).length})
          </button>
        ))}
      </div>

      {/* MOBILE CARD VIEW FOR SMARTPHONES (< md breakpoint) */}
      <div className="space-y-3 md:hidden">
        {filteredRooms.map((room) => {
          const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
          const hasTenant = Boolean(tenant);
          const input = getRoomInput(room);
          const waterCurrNum = input.waterCurrent === '' ? input.waterPrevious : Number(input.waterCurrent);
          const elecCurrNum = input.elecCurrent === '' ? input.elecPrevious : Number(input.elecCurrent);
          const waterUnits = Math.max(0, waterCurrNum - input.waterPrevious);
          const elecUnits = Math.max(0, elecCurrNum - input.elecPrevious);
          const waterAmount = waterUnits * property.waterRatePerUnit;
          const elecAmount = elecUnits * property.elecRatePerUnit;
          const garbageFee = hasTenant ? property.garbageFeePerRoom : 0;
          const rentAmount = hasTenant ? room.rentPrice : 0;
          const totalBill = rentAmount + waterAmount + elecAmount + garbageFee;

          return (
            <div
              key={room.id}
              className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-3 text-xs"
            >
              {/* Room & Tenant Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${getZoneColorStyle(room.zoneCode)}`}>
                    {room.roomNumber}
                  </span>
                  <span className="font-bold text-stone-900 text-xs truncate max-w-[140px]">
                    {hasTenant && tenant ? `${tenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'} ${tenant.firstName} ${tenant.lastName}` : 'ห้องว่าง'}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-[#963720]">
                  ฿{totalBill.toLocaleString()}
                </span>
              </div>

              {/* Water & Elec Meter Input Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Water Meter Box */}
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                  <span className="font-bold text-blue-900 text-[11px] block">💧 มิเตอร์น้ำ</span>
                  <div className="text-[10px] text-stone-500">ก่อน: <span className="font-mono font-bold text-stone-800">{input.waterPrevious}</span></div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">ครั้งนี้:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={input.waterCurrent}
                      onChange={(e) => handleInputChange(room.id, 'waterCurrent', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full text-center py-1.5 px-2 bg-white border border-blue-400 rounded-lg font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 text-stone-900"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="font-bold text-blue-900">{waterUnits} หน่วย</span>
                    <span className="font-semibold text-stone-700">฿{waterAmount}</span>
                  </div>
                </div>

                {/* Elec Meter Box */}
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                  <span className="font-bold text-amber-900 text-[11px] block">⚡ มิเตอร์ไฟ</span>
                  <div className="text-[10px] text-stone-500">ก่อน: <span className="font-mono font-bold text-stone-800">{input.elecPrevious}</span></div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">ครั้งนี้:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={input.elecCurrent}
                      onChange={(e) => handleInputChange(room.id, 'elecCurrent', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full text-center py-1.5 px-2 bg-white border border-amber-400 rounded-lg font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-600 text-stone-900"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="font-bold text-amber-900">{elecUnits} หน่วย</span>
                    <span className="font-semibold text-stone-700">฿{elecAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {hasTenant && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSaveSingleRoom(room)}
                    className="flex-1 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกห้องนี้</span>
                  </button>
                  <button
                    onClick={() => handleOpenInvoice(room)}
                    className="flex-1 py-2 bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ใบแจ้งหนี้</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SPREADSHEET ENTRY TABLE (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse table-fixed min-w-[980px]">
            {/* Explicit Balanced Column Width Allocation */}
            <colgroup><col className="w-[50px]" /><col className="w-[160px]" /><col className="w-[55px]" /><col className="w-[70px]" /><col className="w-[45px]" /><col className="w-[55px]" /><col className="w-[55px]" /><col className="w-[70px]" /><col className="w-[45px]" /><col className="w-[55px]" /><col className="w-[50px]" /><col className="w-[70px]" /><col className="w-[80px]" /><col className="w-[110px]" /></colgroup>

            <thead className="bg-[#FAF7F2] border-b border-[#E2DDD5] text-stone-700 font-bold uppercase select-none text-[11px]">
              <tr>
                <th className="p-2 border-r border-[#E2DDD5] text-center">ห้อง</th>
                <th className="p-2 border-r border-[#E2DDD5]">ชื่อ-นามสกุลผู้เช่า</th>
                
                {/* Water Header Group */}
                <th className="p-2 border-r border-[#E2DDD5] bg-blue-50/80 text-blue-900 text-center" colSpan={4}>
                  💧 มิเตอร์น้ำประปา (7 บ.)
                </th>

                {/* Electricity Header Group */}
                <th className="p-2 border-r border-[#E2DDD5] bg-amber-50/80 text-amber-900 text-center" colSpan={4}>
                  ⚡ มิเตอร์ไฟฟ้า (7 บ.)
                </th>

                <th className="p-2 border-r border-[#E2DDD5] text-right">ขยะ</th>
                <th className="p-2 border-r border-[#E2DDD5] text-right">ค่าเช่า</th>
                <th className="p-2 border-r border-[#E2DDD5] text-right bg-[#EAE1D5]/60">ยอดรวม</th>
                <th className="p-2 text-center text-[#963720]">ใบแจ้งหนี้</th>
              </tr>
              <tr className="bg-[#EFECE6]/50 border-b border-[#E2DDD5] text-[10px] text-stone-600 font-semibold">
                <th className="p-1.5 border-r border-[#E2DDD5] text-center">เลข</th>
                <th className="p-1.5 border-r border-[#E2DDD5]">ชื่อเต็มผู้เช่า</th>

                {/* Water Sub-headers */}
                <th className="p-1.5 border-r border-[#E2DDD5] bg-blue-50/40 text-center">ก่อน</th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-blue-100 text-center font-bold text-blue-950">
                  ครั้งนี้ *
                </th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-blue-50/40 text-center">หน่วย</th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-blue-50/40 text-right">บาท</th>

                {/* Elec Sub-headers */}
                <th className="p-1.5 border-r border-[#E2DDD5] bg-amber-50/40 text-center">ก่อน</th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-amber-100 text-center font-bold text-amber-950">
                  ครั้งนี้ *
                </th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-amber-50/40 text-center">หน่วย</th>
                <th className="p-1.5 border-r border-[#E2DDD5] bg-amber-50/40 text-right">บาท</th>

                <th className="p-1.5 border-r border-[#E2DDD5] text-right">ขยะ</th>
                <th className="p-1.5 border-r border-[#E2DDD5] text-right">ค่าเช่า</th>
                <th className="p-1.5 border-r border-[#E2DDD5] text-right bg-[#EAE1D5]/60">รวม</th>
                <th className="p-1.5 text-center text-[#963720]">เปิดใบแจ้ง</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2DDD5] text-stone-800 font-sans text-xs">
              {filteredRooms.map((room) => {
                const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
                const hasTenant = Boolean(tenant);
                const existingReading = meterReadings.find(
                  (m) => m.roomId === room.id && m.monthYear === selectedMonth
                );

                const input = getRoomInput(room);
                const waterCurrNum = input.waterCurrent === '' ? input.waterPrevious : Number(input.waterCurrent);
                const elecCurrNum = input.elecCurrent === '' ? input.elecPrevious : Number(input.elecCurrent);

                const waterUnits = Math.max(0, waterCurrNum - input.waterPrevious);
                const elecUnits = Math.max(0, elecCurrNum - input.elecPrevious);

                const waterAmount = waterUnits * property.waterRatePerUnit;
                const elecAmount = elecUnits * property.elecRatePerUnit;

                // For vacant rooms: Rent = 0, Garbage = 0!
                const garbageFee = hasTenant ? property.garbageFeePerRoom : 0;
                const rentAmount = hasTenant ? room.rentPrice : 0;
                const totalBill = rentAmount + waterAmount + elecAmount + garbageFee;

                // Anomaly detection: Utility consumed while room is vacant!
                const isVacantUtilityAnomaly = !hasTenant && (waterUnits > 0 || elecUnits > 0);

                return (
                  <tr
                    key={room.id}
                    className={`transition-colors ${
                      isVacantUtilityAnomaly
                        ? 'bg-amber-100/90 font-medium hover:bg-amber-200/80 border-y border-amber-300'
                        : existingReading
                        ? 'bg-emerald-50/30 hover:bg-[#FAF7F2]'
                        : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {/* Room Number Only with Zone Color Badge */}
                    <td className="p-1.5 border-r border-[#E2DDD5] text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-xs shadow-2xs border ${getZoneColorStyle(
                          room.zoneCode
                        )}`}
                      >
                        {room.roomNumber}
                      </span>
                    </td>

                    {/* Tenant Info */}
                    <td className="p-1.5 border-r border-[#E2DDD5]">
                      {hasTenant && tenant ? (
                        <div className="font-medium text-stone-900 text-xs leading-tight">
                          <span>{tenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'} </span>
                          <span>{tenant.firstName} {tenant.lastName}</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-stone-400 italic text-[11px] block">ห้องว่าง</span>
                          {isVacantUtilityAnomaly && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] bg-amber-300 text-amber-950 font-bold border border-amber-400">
                              <AlertTriangle className="w-3 h-3 text-amber-900 shrink-0" />
                              <span>ใช้น้ำ/ไฟขณะห้องว่าง!</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Water Previous */}
                    <td className="p-1.5 border-r border-[#E2DDD5] bg-blue-50/20 text-center font-mono text-stone-600 font-medium text-xs">
                      {input.waterPrevious}
                    </td>

                    {/* Water Current INPUT */}
                    <td className="p-1 border-r border-[#E2DDD5] bg-blue-100/40 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={input.waterCurrent === '' ? '' : input.waterCurrent}
                        onChange={(e) =>
                          handleInputChange(room.id, 'waterCurrent', e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        className={`w-full text-center py-1 px-1 bg-white border rounded font-mono font-bold text-xs focus:ring-2 outline-none ${
                          isVacantUtilityAnomaly && waterUnits > 0
                            ? 'border-amber-600 bg-amber-50 text-amber-950 focus:ring-amber-600 font-extrabold'
                            : 'border-blue-400 text-stone-900 focus:ring-blue-600 focus:bg-blue-50'
                        }`}
                      />
                    </td>

                    {/* Water Units */}
                    <td className={`p-1.5 border-r border-[#E2DDD5] text-center font-mono font-bold text-xs ${
                      isVacantUtilityAnomaly && waterUnits > 0
                        ? 'bg-amber-200 text-amber-950 font-extrabold'
                        : 'bg-blue-50/20 text-blue-900'
                    }`}>
                      {waterUnits}
                    </td>

                    {/* Water Amount */}
                    <td className="p-1.5 border-r border-[#E2DDD5] bg-blue-50/20 text-right font-mono text-stone-800 text-xs font-semibold">
                      ฿{waterAmount.toLocaleString()}
                    </td>

                    {/* Elec Previous */}
                    <td className="p-1.5 border-r border-[#E2DDD5] bg-amber-50/20 text-center font-mono text-stone-600 font-medium text-xs">
                      {input.elecPrevious}
                    </td>

                    {/* Elec Current INPUT */}
                    <td className="p-1 border-r border-[#E2DDD5] bg-amber-100/40 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={input.elecCurrent === '' ? '' : input.elecCurrent}
                        onChange={(e) =>
                          handleInputChange(room.id, 'elecCurrent', e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        className={`w-full text-center py-1 px-1 bg-white border rounded font-mono font-bold text-xs focus:ring-2 outline-none ${
                          isVacantUtilityAnomaly && elecUnits > 0
                            ? 'border-amber-600 bg-amber-50 text-amber-950 focus:ring-amber-600 font-extrabold'
                            : 'border-amber-400 text-stone-900 focus:ring-amber-600 focus:bg-amber-50'
                        }`}
                      />
                    </td>

                    {/* Elec Units */}
                    <td className={`p-1.5 border-r border-[#E2DDD5] text-center font-mono font-bold text-xs ${
                      isVacantUtilityAnomaly && elecUnits > 0
                        ? 'bg-amber-200 text-amber-950 font-extrabold'
                        : 'bg-amber-50/20 text-amber-900'
                    }`}>
                      {elecUnits}
                    </td>

                    {/* Elec Amount */}
                    <td className="p-1.5 border-r border-[#E2DDD5] bg-amber-50/20 text-right font-mono text-stone-800 text-xs font-semibold">
                      ฿{elecAmount.toLocaleString()}
                    </td>

                    {/* Garbage Fee (0 for vacant rooms) */}
                    <td className="p-1.5 border-r border-[#E2DDD5] text-right font-mono text-xs">
                      {hasTenant ? (
                        <span className="text-stone-600">฿{garbageFee}</span>
                      ) : (
                        <span className="text-stone-400">฿0</span>
                      )}
                    </td>

                    {/* Room Rent (0 for vacant rooms) */}
                    <td className="p-1.5 border-r border-[#E2DDD5] text-right font-mono text-xs">
                      {hasTenant ? (
                        <span className="font-semibold text-stone-900">฿{rentAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-stone-400">฿0</span>
                      )}
                    </td>

                    {/* Total Bill */}
                    <td className={`p-1.5 border-r border-[#E2DDD5] text-right font-mono font-bold text-xs ${
                      isVacantUtilityAnomaly
                        ? 'bg-amber-200/80 text-amber-950 font-extrabold'
                        : hasTenant
                        ? 'bg-[#EAE1D5]/40 text-[#963720]'
                        : 'text-stone-400'
                    }`}>
                      ฿{totalBill.toLocaleString()}
                    </td>

                    {/* Invoice Action Button (Disabled for vacant rooms) */}
                    <td className="p-1 text-center">
                      {hasTenant ? (
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(room)}
                          className="w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-[#963720] hover:bg-[#822E1A] text-white transition-colors flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                          title={`เปิดดูใบแจ้งหนี้ห้อง ${room.roomNumber}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ใบแจ้งหนี้</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-400 border border-stone-200 opacity-60 cursor-not-allowed flex items-center justify-center space-x-1 select-none"
                          title="ห้องว่าง - ไม่สามารถออกใบแจ้งหนี้ได้"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-300" />
                          <span>ห้องว่าง</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* SPREADSHEET BOTTOM TOTALS ROW */}
            <tfoot className="bg-stone-900 text-white font-bold text-xs select-none">
              <tr>
                <td colSpan={2} className="p-2 border-r border-stone-800 font-semibold text-center">
                  รวม ({filteredRooms.length} ห้อง)
                </td>

                <td className="p-2 border-r border-stone-800 text-center font-mono text-stone-400">-</td>
                <td className="p-2 border-r border-stone-800 text-center font-mono text-stone-400">-</td>
                <td className="p-2 border-r border-stone-800 text-center font-mono text-blue-300 font-bold">
                  {grandTotalWaterUnits}
                </td>
                <td className="p-2 border-r border-stone-800 text-right font-mono text-blue-300 font-bold">
                  ฿{grandTotalWaterAmount.toLocaleString()}
                </td>

                <td className="p-2 border-r border-stone-800 text-center font-mono text-stone-400">-</td>
                <td className="p-2 border-r border-stone-800 text-center font-mono text-stone-400">-</td>
                <td className="p-2 border-r border-stone-800 text-center font-mono text-amber-300 font-bold">
                  {grandTotalElecUnits}
                </td>
                <td className="p-2 border-r border-stone-800 text-right font-mono text-amber-300 font-bold">
                  ฿{grandTotalElecAmount.toLocaleString()}
                </td>

                <td className="p-2 border-r border-stone-800 text-right font-mono text-stone-300">
                  ฿{grandTotalGarbageAmount.toLocaleString()}
                </td>
                <td className="p-2 border-r border-stone-800 text-right font-mono text-stone-300">
                  ฿{grandTotalRentAmount.toLocaleString()}
                </td>
                <td className="p-2 border-r border-stone-800 text-right font-mono text-emerald-400 font-bold text-sm">
                  ฿{grandTotalBillAmount.toLocaleString()}
                </td>
                <td className="p-1 text-center">
                  <button
                    onClick={handleSaveAllMeters}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                    title="บันทึกมิเตอร์ทุกห้องประจำเดือน"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกทั้งหมด</span>
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Landlord Utility Bills Modal */}
      <LandlordExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* Printable Receipt/Invoice Modal */}
      <ReceiptModal bill={previewBill} onClose={() => setPreviewBill(null)} />
    </div>
  );
}
