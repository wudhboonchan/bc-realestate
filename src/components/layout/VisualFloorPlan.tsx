'use client';

import React, { useState, useEffect } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Room, MonthlyBill } from '@/types';
import { Home, FileText, X } from 'lucide-react';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

export function VisualFloorPlan() {
  const { rooms, tenants, bills, selectedMonth, updateBillStatus } = useProperty();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalBill, setModalBill] = useState<MonthlyBill | null>(null);

  // Handle ESC key press to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRoom(null);
      }
    };
    if (selectedRoom) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRoom]);

  const getRoomBill = (roomId: string) => {
    return bills.find((b) => b.roomId === roomId && b.monthYear === selectedMonth);
  };

  const renderRoomBox = (roomNumber: string) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber) || {
      id: `r-${roomNumber.toLowerCase()}`,
      roomNumber,
      rentPrice: roomNumber === 'A1' ? 10000 : 1300,
      status: 'vacant' as const,
      zoneCode: roomNumber[0],
      waterMeterPrevious: 0,
      elecMeterPrevious: 0,
      buildingType: 'new' as const,
      floor: 1,
      propertyId: 'tan-deaw',
      zoneId: 'zone-b',
    };

    const tenant = tenants.find((t) => t.id === room.currentTenantId || t.assignedRoomId === room.id);
    const hasTenant = Boolean(tenant);
    const bill = hasTenant ? getRoomBill(room.id) : null;

    let borderStyle = 'border border-stone-200 bg-[#FAF7F2] text-stone-500 hover:border-stone-400';
    let statusBadge = (
      <span className="text-[9px] font-medium text-stone-400">ว่าง</span>
    );

    if (hasTenant) {
      if (bill?.status === 'paid') {
        borderStyle = 'border-2 border-emerald-600 bg-emerald-50/90 text-emerald-950 shadow-2xs hover:border-emerald-700 font-semibold';
        statusBadge = (
          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded">
            ✓ จ่ายแล้ว
          </span>
        );
      } else {
        borderStyle = 'border-2 border-[#963720] bg-[#FAF0ED] text-[#782816] shadow-2xs hover:border-[#822E1A] font-semibold';
        statusBadge = (
          <span className="text-[9px] font-bold text-[#963720] bg-[#F4DCD6] px-1.5 py-0.2 rounded">
            ✕ ค้างจ่าย
          </span>
        );
      }
    }

    return (
      <button
        key={room.id}
        onClick={() => setSelectedRoom(room)}
        className={`px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center justify-between text-left cursor-pointer h-11 w-full ${borderStyle}`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
          <span className="font-mono font-bold text-sm shrink-0">{room.roomNumber}</span>
          {tenant && (
            <span
              className="text-[11px] truncate font-medium text-stone-800"
              title={`${tenant.firstName} ${tenant.lastName}`}
            >
              {tenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'} {tenant.firstName} {tenant.lastName}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {hasTenant && bill && (
            <span className="font-mono text-[10px] text-stone-700 font-semibold">
              ฿{bill.totalAmount.toLocaleString()}
            </span>
          )}
          {statusBadge}
        </div>
      </button>
    );
  };

  const selectedBill = selectedRoom ? getRoomBill(selectedRoom.id) : null;
  const selectedTenant = selectedRoom ? tenants.find((t) => t.id === selectedRoom.currentTenantId) : null;

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E2DDD5] p-5 shadow-2xs space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2DDD5]">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2 font-serif">
            <Home className="w-4 h-4 text-stone-700" />
            <span>ผังตำแหน่งห้องพักจริง</span>
          </h3>
          <p className="text-[11px] text-stone-500">คลิกที่กล่องห้องพักเพื่อเปิดดูใบแจ้งหนี้ หรือสลับสถานะชำระเงิน</p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center space-x-2 text-[11px] font-medium">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>ชำระแล้ว</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#F4DCD6] text-[#963720] border border-[#D8C7B5]">
            <span className="w-2 h-2 rounded-full bg-[#963720]"></span>
            <span>ค้างชำระ</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-stone-200/80 text-stone-600 border border-stone-300">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span>
            <span>ห้องว่าง</span>
          </span>
        </div>
      </div>

      {/* COMPACT ARCHITECTURAL LAYOUT */}
      <div className="space-y-5 p-4 bg-white border border-[#E2DDD5] rounded-xl shadow-2xs">
        {/* SECTION 1: ZONE A */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-[#963720] uppercase tracking-wider">
            [ โซน A ] ร้านค้าหน้าถนน
          </div>
          {renderRoomBox('A1')}
        </div>

        {/* SECTION 2: NEW BUILDING (B1-B7 / C1-C4) */}
        <div className="space-y-2 pt-3 border-t border-dashed border-stone-300">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-900 uppercase">🏢 ตึกใหม่</span>
            <div className="space-x-3 text-[10px]">
              <span className="text-blue-800 font-semibold">← ชั้นล่าง (B1-B7)</span>
              <span className="text-purple-800 font-semibold">ชั้นบน (C1-C4) →</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 items-start">
            {/* Column 1: B1 to B7 */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-600 text-center bg-stone-100 py-0.5 rounded border border-stone-200">
                ชั้นล่าง (B1 - B7)
              </div>
              {renderRoomBox('B1')}
              {renderRoomBox('B2')}
              {renderRoomBox('B3')}
              {renderRoomBox('B4')}
              {renderRoomBox('B5')}
              {renderRoomBox('B6')}
              {renderRoomBox('B7')}
            </div>

            {/* Column 2: C1 to C4 (Offset aligned with B4) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-purple-900 text-center bg-purple-100/70 py-0.5 rounded border border-purple-200">
                ชั้นบน (C1 - C4)
              </div>
              <div className="h-11 invisible" />
              <div className="h-11 invisible" />
              <div className="h-11 invisible" />
              {renderRoomBox('C1')}
              {renderRoomBox('C2')}
              {renderRoomBox('C3')}
              {renderRoomBox('C4')}
            </div>
          </div>
        </div>

        {/* SECTION 3: OLD BUILDING (D1-D7 / E1-E5) */}
        <div className="space-y-2 pt-3 border-t border-dashed border-stone-300">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-900 uppercase">🏛️ ตึกเก่า</span>
            <div className="space-x-3 text-[10px]">
              <span className="text-blue-800 font-semibold">← ชั้นล่าง (D1-D7)</span>
              <span className="text-purple-800 font-semibold">ชั้นบน (E1-E5) →</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 items-start">
            {/* Column 1: D1 to D7 */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-600 text-center bg-stone-100 py-0.5 rounded border border-stone-200">
                ชั้นล่าง (D1 - D7)
              </div>
              {renderRoomBox('D1')}
              {renderRoomBox('D2')}
              {renderRoomBox('D3')}
              {renderRoomBox('D4')}
              {renderRoomBox('D5')}
              {renderRoomBox('D6')}
              {renderRoomBox('D7')}
            </div>

            {/* Column 2: E1 to E5 (Offset aligned with D3) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-purple-900 text-center bg-purple-100/70 py-0.5 rounded border border-purple-200">
                ชั้นบน (E1 - E5)
              </div>
              <div className="h-11 invisible" />
              <div className="h-11 invisible" />
              {renderRoomBox('E1')}
              {renderRoomBox('E2')}
              {renderRoomBox('E3')}
              {renderRoomBox('E4')}
              {renderRoomBox('E5')}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ROOM INSPECTOR POPUP MODAL */}
      {selectedRoom && (
        <div
          onClick={() => setSelectedRoom(null)}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] w-full max-w-md rounded-2xl shadow-xl border border-[#E2DDD5] p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#963720] text-white font-mono font-bold flex items-center justify-center text-base shadow-xs">
                  {selectedRoom.roomNumber}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm font-serif">
                    ห้อง {selectedRoom.roomNumber} (โซน {selectedRoom.zoneCode})
                  </h3>
                  <p className="text-xs text-stone-500">
                    ค่าเช่า ฿{selectedRoom.rentPrice.toLocaleString()}/เดือน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#EAE1D5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tenant Info */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DDD5] space-y-2 text-xs">
              <span className="text-stone-400 uppercase font-semibold text-[10px] block tracking-wider">
                ข้อมูลผู้เช่าประจำห้อง
              </span>
              {selectedTenant ? (
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                    <span>{selectedTenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'}</span>
                    <span>{selectedTenant.firstName} {selectedTenant.lastName}</span>
                  </div>
                  <p className="text-stone-500">โทร: {selectedTenant.phone}</p>
                  <p className="text-stone-500">
                    ค่าประกันแรกเข้า: {selectedTenant.hasSecurityDeposit ? `฿${selectedTenant.securityDepositAmount} (ชำระแล้ว ✓)` : 'ยังไม่ชำระ'}
                  </p>
                </div>
              ) : (
                <p className="text-stone-400 italic">ไม่มีผู้เช่า (ห้องว่าง)</p>
              )}
            </div>

            {/* Bill Summary (Only if occupied) */}
            {selectedTenant && selectedBill ? (
              <div className="p-4 rounded-xl border border-[#E2DDD5] space-y-2 text-xs bg-white">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-stone-700">ยอดบิลประจำเดือน {selectedMonth}:</span>
                  <span className="font-mono text-base font-bold text-[#963720]">
                    ฿{selectedBill.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 space-y-0.5">
                  <p>ค่าน้ำ ({selectedBill.waterUnits} หน่วย): ฿{selectedBill.waterAmount}</p>
                  <p>ค่าไฟ ({selectedBill.elecUnits} หน่วย): ฿{selectedBill.elecAmount}</p>
                  <p>ค่าขยะ: ฿{selectedBill.garbageFee}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateBillStatus(
                        selectedBill.id,
                        selectedBill.status === 'paid' ? 'pending' : 'paid'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      selectedBill.status === 'paid'
                        ? 'bg-stone-100 text-stone-700 border-stone-300'
                        : 'bg-[#963720] text-white border-[#822E1A]'
                    }`}
                  >
                    {selectedBill.status === 'paid' ? 'เปลี่ยนเป็นยังไม่ชำระ' : 'ทำเป็นชำระเงินแล้ว ✓'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalBill(selectedBill);
                    }}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-medium flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>เปิดใบแจ้งหนี้ ({selectedBill.receiptLanguage})</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-2">
                ยังไม่มีการจดมิเตอร์ออกบิลประจำเดือน {selectedMonth}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal bill={modalBill} onClose={() => setModalBill(null)} />
    </div>
  );
}
