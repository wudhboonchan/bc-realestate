'use client';

import React, { useState, useEffect } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { X, CheckCircle2, Clock, Receipt, Zap } from 'lucide-react';

interface LandlordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandlordExpenseModal({ isOpen, onClose }: LandlordExpenseModalProps) {
  const { selectedMonth, landlordExpenses, saveLandlordExpense, property } = useProperty();

  const currentExpense = landlordExpenses.find((e) => e.monthYear === selectedMonth);

  // Water State
  const [actualWaterBill, setActualWaterBill] = useState(currentExpense?.actualWaterBill ?? 0);
  const [waterPaidStatus, setWaterPaidStatus] = useState<'paid' | 'pending'>(currentExpense?.waterPaidStatus || 'pending');
  const [waterPaidDate, setWaterPaidDate] = useState(currentExpense?.waterPaidDate || `${selectedMonth}-10`);

  // Electricity State
  const [actualElecBill, setActualElecBill] = useState(currentExpense?.actualElecBill ?? 0);
  const [elecPaidStatus, setElecPaidStatus] = useState<'paid' | 'pending'>(currentExpense?.elecPaidStatus || 'pending');
  const [elecPaidDate, setElecPaidDate] = useState(currentExpense?.elecPaidDate || `${selectedMonth}-15`);

  // Garbage State
  const [actualGarbageBill, setActualGarbageBill] = useState(currentExpense?.actualGarbageBill ?? 0);
  const [garbagePaidStatus, setGarbagePaidStatus] = useState<'paid' | 'pending'>(currentExpense?.garbagePaidStatus || 'pending');
  const [garbagePaidDate, setGarbagePaidDate] = useState(currentExpense?.garbagePaidDate || `${selectedMonth}-01`);

  const [notes, setNotes] = useState(currentExpense?.notes || '');

  useEffect(() => {
    if (currentExpense) {
      setActualWaterBill(currentExpense.actualWaterBill);
      setWaterPaidStatus(currentExpense.waterPaidStatus || 'pending');
      setWaterPaidDate(currentExpense.waterPaidDate || `${selectedMonth}-10`);

      setActualElecBill(currentExpense.actualElecBill);
      setElecPaidStatus(currentExpense.elecPaidStatus || 'pending');
      setElecPaidDate(currentExpense.elecPaidDate || `${selectedMonth}-15`);

      setActualGarbageBill(currentExpense.actualGarbageBill);
      setGarbagePaidStatus(currentExpense.garbagePaidStatus || 'pending');
      setGarbagePaidDate(currentExpense.garbagePaidDate || `${selectedMonth}-01`);

      setNotes(currentExpense.notes || '');
    } else {
      setActualWaterBill(0);
      setWaterPaidStatus('pending');
      setActualElecBill(0);
      setElecPaidStatus('pending');
      setActualGarbageBill(0);
      setGarbagePaidStatus('pending');
      setNotes('');
    }
  }, [currentExpense, selectedMonth]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    saveLandlordExpense({
      propertyId: property.id,
      monthYear: selectedMonth,
      actualWaterBill: Number(actualWaterBill),
      waterPaidStatus,
      waterPaidDate: waterPaidStatus === 'paid' ? waterPaidDate : undefined,

      actualElecBill: Number(actualElecBill),
      elecPaidStatus,
      elecPaidDate: elecPaidStatus === 'paid' ? elecPaidDate : undefined,

      actualGarbageBill: Number(actualGarbageBill),
      garbagePaidStatus,
      garbagePaidDate: garbagePaidStatus === 'paid' ? garbagePaidDate : undefined,

      paidStatus: (waterPaidStatus === 'paid' && elecPaidStatus === 'paid' && garbagePaidStatus === 'paid') ? 'paid' : 'pending',
      notes,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF7F2] w-full max-w-xl max-h-[85vh] rounded-2xl shadow-xl border border-[#E2DDD5] flex flex-col overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="bg-white px-5 py-3.5 border-b border-[#E2DDD5] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#963720] text-white flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                บันทึกบิลหลวง (การประปา / PEA / ขยะ อบต.)
              </h3>
              <p className="text-[11px] text-stone-500">ประจำเดือน {selectedMonth} (ระบุยอดเงินจ่ายจริง สถานะ และวันที่ชำระเงิน)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#EAE1D5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {/* SECTION 1: WATER BILL */}
          <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between font-bold text-blue-900 text-xs">
              <span className="flex items-center space-x-1.5">
                <span>💧</span>
                <span>1. ค่าน้ำประปารวม (จ่ายการประปา)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">ยอดบิลรวม (บาท)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold">฿</span>
                  <input
                    type="number"
                    value={actualWaterBill}
                    onChange={(e) => setActualWaterBill(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1 border border-stone-300 rounded-lg text-stone-900 font-bold font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">สถานะชำระ</label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setWaterPaidStatus('paid')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      waterPaidStatus === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>จ่ายแล้ว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterPaidStatus('pending')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      waterPaidStatus === 'pending'
                        ? 'bg-[#963720] text-white border-[#822E1A] shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>ยังไม่จ่าย</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">วันที่ชำระเงิน</label>
                <input
                  type="date"
                  disabled={waterPaidStatus !== 'paid'}
                  value={waterPaidDate}
                  onChange={(e) => setWaterPaidDate(e.target.value)}
                  className={`w-full py-1 px-2 border rounded-lg font-mono text-[11px] outline-none ${
                    waterPaidStatus === 'paid'
                      ? 'border-stone-300 text-stone-900 bg-white font-medium'
                      : 'border-stone-200 text-stone-400 bg-stone-100 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ELECTRICITY BILL (PEA) */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between font-bold text-amber-900 text-xs">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. ค่าไฟฟ้า PEA รวม (จ่ายการไฟฟ้า)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">ยอดบิลรวม (บาท)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold">฿</span>
                  <input
                    type="number"
                    value={actualElecBill}
                    onChange={(e) => setActualElecBill(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1 border border-stone-300 rounded-lg text-stone-900 font-bold font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">สถานะชำระ</label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setElecPaidStatus('paid')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      elecPaidStatus === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>จ่ายแล้ว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setElecPaidStatus('pending')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      elecPaidStatus === 'pending'
                        ? 'bg-[#963720] text-white border-[#822E1A] shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>ยังไม่จ่าย</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">วันที่ชำระเงิน</label>
                <input
                  type="date"
                  disabled={elecPaidStatus !== 'paid'}
                  value={elecPaidDate}
                  onChange={(e) => setElecPaidDate(e.target.value)}
                  className={`w-full py-1 px-2 border rounded-lg font-mono text-[11px] outline-none ${
                    elecPaidStatus === 'paid'
                      ? 'border-stone-300 text-stone-900 bg-white font-medium'
                      : 'border-stone-200 text-stone-400 bg-stone-100 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: GARBAGE BILL */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between font-bold text-stone-800 text-xs">
              <span className="flex items-center space-x-1.5">
                <span>🗑️</span>
                <span>3. ค่าขยะส่วนกลางรวม (จ่าย อบต.)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">ยอดบิลรวม (บาท)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold">฿</span>
                  <input
                    type="number"
                    value={actualGarbageBill}
                    onChange={(e) => setActualGarbageBill(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1 border border-stone-300 rounded-lg text-stone-900 font-bold font-mono text-xs focus:ring-2 focus:ring-stone-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">สถานะชำระ</label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setGarbagePaidStatus('paid')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      garbagePaidStatus === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>จ่ายแล้ว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGarbagePaidStatus('pending')}
                    className={`flex-1 py-1 rounded-lg font-semibold text-[10px] border flex items-center justify-center space-x-0.5 transition-all cursor-pointer ${
                      garbagePaidStatus === 'pending'
                        ? 'bg-[#963720] text-white border-[#822E1A] shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>ยังไม่จ่าย</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] uppercase font-semibold mb-1">วันที่ชำระเงิน</label>
                <input
                  type="date"
                  disabled={garbagePaidStatus !== 'paid'}
                  value={garbagePaidDate}
                  onChange={(e) => setGarbagePaidDate(e.target.value)}
                  className={`w-full py-1 px-2 border rounded-lg font-mono text-[11px] outline-none ${
                    garbagePaidStatus === 'paid'
                      ? 'border-stone-300 text-stone-900 bg-white font-medium'
                      : 'border-stone-200 text-stone-400 bg-stone-100 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={1}
              placeholder="ระบุหมายเหตุการจ่ายบิล..."
              className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 text-xs focus:ring-2 focus:ring-stone-400 outline-none bg-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-[#E2DDD5] bg-[#FAF7F2] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-[#EAE1D5] font-medium transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#963720] hover:bg-[#822E1A] text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              บันทึกข้อมูลบิลหลวง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
