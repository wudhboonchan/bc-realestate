'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageSquare, Building2, Phone, ShieldCheck, AlertCircle, Globe } from 'lucide-react';
import { LanguageOption } from '@/types';

function LineBindForm() {
  const searchParams = useSearchParams();
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageOption>('TH');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlLineId = searchParams.get('line_user_id') || searchParams.get('userId');
    if (urlLineId) {
      setLineUserId(urlLineId);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!roomNumber.trim()) {
      setErrorMessage('กรุณาระบุเลขห้องพัก (เช่น A1, B1, C2)');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับหอพัก');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/line/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          phone: phone.trim(),
          lineUserId,
          preferredLanguage,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message || `ผูกบัญชี LINE สำหรับห้อง ${roomNumber.toUpperCase()} เรียบร้อยแล้ว!`);
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="bg-[#963720] text-white p-6 rounded-3xl shadow-md text-center space-y-2">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
            <MessageSquare className="w-7 h-7 text-emerald-300" />
          </div>
          <h1 className="text-xl font-bold font-serif tracking-tight">
            ผูกบัญชี LINE Official Account
          </h1>
          <p className="text-xs text-stone-200">
            หอพักตาลเดี่ยว · ระบบรับใบแจ้งหนี้ค่าเช่าอัตโนมัติ
          </p>
        </div>

        {/* Success Card */}
        {successMessage ? (
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">ผูกบัญชีเรียบร้อยแล้ว!</h2>
              <p className="text-xs text-stone-600 mt-1">{successMessage}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-500 text-left space-y-1 border border-stone-200">
              <p className="font-semibold text-stone-700">✓ ข้อมูลการลงทะเบียน:</p>
              <p>• ห้องพัก: <span className="font-bold text-stone-900">{roomNumber.toUpperCase()}</span></p>
              <p>• ภาษาข้อความ: <span className="font-bold text-stone-900">{preferredLanguage === 'MY' || preferredLanguage === 'MM' ? 'ภาษาพม่า (မြန်မာ)' : 'ภาษาไทย'}</span></p>
              <p>• LINE User ID: <span className="font-mono text-[10px] text-stone-600">{lineUserId}</span></p>
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              ท่านจะได้รับใบแจ้งหนี้ประจำเดือนผ่านทาง LINE OA นี้ทันทีเมื่อถึงกำหนดออกบิล
            </p>
          </div>
        ) : (
          /* Form Card */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-[#E2DDD5] shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">ยืนยันข้อมูลผู้เช่าเพื่อผูกบัญชี</h2>
              <p className="text-xs text-stone-500">กรุณากรอกเลขห้องพักและเบอร์โทรศัพท์ที่ให้ไว้กับหอพัก</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Room Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#963720]" />
                <span>เลขห้องพัก (Room Number) *</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value.toUpperCase())}
                placeholder="เช่น A1, B1, C2, D3"
                className="w-full border border-stone-300 rounded-xl p-3 text-sm font-bold uppercase text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-[#963720]" />
                <span>เบอร์โทรศัพท์ผู้เช่า (Phone Number) *</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>

            {/* Language Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-[#963720]" />
                <span>ภาษาสำหรับรับบิลใบแจ้งหนี้ (Preferred Language)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreferredLanguage('TH')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    preferredLanguage === 'TH'
                      ? 'bg-[#963720] text-white border-[#963720] shadow-2xs'
                      : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>🇹🇭 ภาษาไทย (TH)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredLanguage('MY')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    preferredLanguage === 'MY' || preferredLanguage === 'MM'
                      ? 'bg-[#963720] text-white border-[#963720] shadow-2xs'
                      : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>🇲🇲 မြန်မာစာ (Burmese)</span>
                </button>
              </div>
            </div>

            {/* LINE User ID Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#963720]" />
                <span>LINE User ID (รหัสรับใบแจ้งหนี้)</span>
              </label>
              <input
                type="text"
                value={lineUserId}
                onChange={(e) => setLineUserId(e.target.value)}
                placeholder="เช่น U10a9b8c7d6e5f4..."
                className="w-full border border-stone-300 rounded-xl p-3 text-xs font-mono text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none bg-white"
              />
              <span className="text-[10px] text-stone-400 block pt-0.5">
                (คุณสามารถคัดลอกรหัส LINE User ID มาพิมพ์ หรือวางในช่องนี้ได้เลยครับ)
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#963720] hover:bg-[#822E1A] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? 'กำลังยืนยันการผูกบัญชี...' : 'ผูกบัญชี LINE กับห้องพัก'}</span>
            </button>
          </form>
        )}
      </div>

      <footer className="text-center text-stone-400 text-[11px] py-4">
        © 2026 หอพักตาลเดี่ยว · ระบบบริหารจัดการหอพักและส่งใบแจ้งหนี้ผ่าน LINE
      </footer>
    </div>
  );
}

export default function LineBindPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">กำลังโหลดระบบผูกบัญชี LINE...</div>}>
      <LineBindForm />
    </Suspense>
  );
}
