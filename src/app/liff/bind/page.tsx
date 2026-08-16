'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageSquare, Building2, Phone, ShieldCheck, AlertCircle, Globe, Check } from 'lucide-react';
import { LanguageOption } from '@/types';
import { useProperty } from '@/context/PropertyContext';

function LineBindForm() {
  const searchParams = useSearchParams();
  const { tenants, rooms, bindTenantLineUser } = useProperty();

  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageOption>('TH');
  const [uiLanguage, setUiLanguage] = useState<LanguageOption>('TH');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlLineId = searchParams.get('line_user_id') || searchParams.get('userId');
    if (urlLineId) {
      setLineUserId(urlLineId);
    }
  }, [searchParams]);

  const isBurmese = uiLanguage === 'MY' || uiLanguage === 'MM';

  const labels = isBurmese
    ? {
        title: 'LINE Official Account အကောင့်ချိတ်ဆက်ရန်',
        subtitle: 'တန်ဒေအိမ်ရာ · လစဉ် ဘေလ်စာရင်း လက်ခံရရှိရေး စနစ်',
        formTitle: 'အိမ်ငှား အချက်အလက် အတည်ပြုရန်',
        formSub: 'ကျေးဇူးပြု၍ အခန်းနံပါတ်နှင့် ဖုန်းနံပါတ် ထည့်သွင်းပါ (LINE ID ရိုက်ထည့်ရန် မလိုပါ)',
        roomLabel: 'အခန်းနံပါတ် (Room Number) *',
        roomPlaceholder: 'ဥပမာ A1, B1, C2',
        phoneLabel: 'ဖုန်းနံပါတ် (Phone Number) *',
        phonePlaceholder: '08x-xxx-xxxx',
        langLabel: 'ဘေလ်စာရင်း လက်ခံလိုသော ဘာသာစကား',
        lineIdDetected: '✓ သင်၏ LINE အကောင့် စနစ်မှ အလိုအလျောက် တွေ့ရှိပြီးပါပြီ',
        submitBtn: 'အခန်းနှင့် LINE အကောင့် ချိတ်ဆက်မည်',
        submittingBtn: 'ချိတ်ဆက်နေပါသည်...',
        successTitle: 'အကောင့် ချိတ်ဆက်မှု အောင်မြင်ပါသည်!',
        registeredInfo: '✓ မှတ်ပုံတင်ထားသော အချက်အလက်များ:',
        successFooter: 'လစဉ် ဘေလ်စာရင်းများကို LINE မှတဆင့် တိုက်ရိုက် ပေးပို့သွားမည် ဖြစ်ပါသည်။',
        errNoRoom: 'ကျေးဇူးပြု၍ အခန်းနံပါတ် ထည့်သွင်းပါ (ဥပမာ A1, B1)',
        errNoPhone: 'ကျေးဇူးပြု၍ ဖုန်းနံပါတ် ထည့်သွင်းပါ',
        errNotFound: 'ထည့်သွင်းထားသော အခန်း သို့မဟုတ် ဖုန်းနံပါတ် မတွေ့ရှိပါ။',
      }
    : {
        title: 'ผูกบัญชี LINE Official Account',
        subtitle: 'หอพักตาลเดี่ยว · ระบบรับใบแจ้งหนี้ค่าเช่าอัตโนมัติ',
        formTitle: 'ยืนยันข้อมูลผู้เช่าเพื่อผูกบัญชี',
        formSub: 'กรอกเฉพาะเลขห้องพักและเบอร์โทรศัพท์ (ระบบดึงรหัส LINE อัตโนมัติ ไม่ต้องกรอกเอง)',
        roomLabel: 'เลขห้องพัก (Room Number) *',
        roomPlaceholder: 'เช่น A1, B1, C2, D3',
        phoneLabel: 'เบอร์โทรศัพท์ผู้เช่า (Phone Number) *',
        phonePlaceholder: '08x-xxx-xxxx',
        langLabel: 'ภาษาสำหรับรับบิลใบแจ้งหนี้ (Preferred Language)',
        lineIdDetected: '✓ ตรวจพบรหัส LINE ของคุณอัตโนมัติเรียบร้อยแล้ว',
        submitBtn: 'ผูกบัญชี LINE กับห้องพัก',
        submittingBtn: 'กำลังยืนยันการผูกบัญชี...',
        successTitle: 'ผูกบัญชีเรียบร้อยแล้ว!',
        registeredInfo: '✓ ข้อมูลการลงทะเบียน:',
        successFooter: 'ท่านจะได้รับใบแจ้งหนี้ประจำเดือนผ่านทาง LINE OA นี้ทันทีเมื่อถึงกำหนดออกบิล',
        errNoRoom: 'กรุณาระบุเลขห้องพัก (เช่น A1, B1, C2)',
        errNoPhone: 'กรุณากรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับหอพัก',
        errNotFound: 'ไม่พบข้อมูลผู้เช่าตรงกับห้องและเบอร์โทรศัพท์นี้',
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanRoomNum = roomNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!cleanRoomNum) {
      setErrorMessage(labels.errNoRoom);
      return;
    }

    if (!cleanPhone) {
      setErrorMessage(labels.errNoPhone);
      return;
    }

    // Auto-fallback lineUserId if not passed
    const targetLineId = lineUserId.trim() || `auto_bind_${cleanRoomNum}_${Date.now()}`;

    setLoading(true);

    try {
      // Find matching room & tenant in client state
      const targetRoom = rooms.find((r) => r.roomNumber.toUpperCase() === cleanRoomNum);
      const targetTenant = tenants.find(
        (t) =>
          (targetRoom && (t.assignedRoomId === targetRoom.id || t.id === targetRoom.currentTenantId)) ||
          t.phone.replace(/[^0-9]/g, '') === cleanPhone
      );

      if (targetTenant) {
        bindTenantLineUser(targetTenant.id, targetLineId, preferredLanguage);
      }

      // Call API endpoint
      const res = await fetch('/api/line/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: cleanRoomNum,
          phone: cleanPhone,
          lineUserId: targetLineId,
          preferredLanguage,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message || `${labels.successTitle} (${cleanRoomNum})`);
      } else {
        if (targetTenant) {
          setSuccessMessage(`${labels.successTitle} (${cleanRoomNum})`);
        } else {
          setErrorMessage(data.error || labels.errNotFound);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full mx-auto space-y-4 pt-2">
        {/* Language Switcher Bar */}
        <div className="flex justify-end items-center">
          <div className="bg-white p-1 rounded-xl border border-[#E2DDD5] shadow-2xs flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setUiLanguage('TH')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                !isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              type="button"
              onClick={() => setUiLanguage('MY')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇲🇲 မြန်မာ
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#963720] text-white p-6 rounded-3xl shadow-md text-center space-y-2">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
            <MessageSquare className="w-7 h-7 text-emerald-300" />
          </div>
          <h1 className="text-xl font-bold font-serif tracking-tight">
            {labels.title}
          </h1>
          <p className="text-xs text-stone-200">
            {labels.subtitle}
          </p>
        </div>

        {/* Success Card */}
        {successMessage ? (
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{labels.successTitle}</h2>
              <p className="text-xs text-stone-600 mt-1">{successMessage}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-500 text-left space-y-1 border border-stone-200">
              <p className="font-semibold text-stone-700">{labels.registeredInfo}</p>
              <p>• {labels.roomLabel.replace(' *', '')}: <span className="font-bold text-stone-900">{roomNumber.toUpperCase()}</span></p>
              <p>• {labels.langLabel}: <span className="font-bold text-stone-900">{preferredLanguage === 'MY' || preferredLanguage === 'MM' ? 'မြန်မာစာ' : 'ภาษาไทย'}</span></p>
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              {labels.successFooter}
            </p>
          </div>
        ) : (
          /* Form Card */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-[#E2DDD5] shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">{labels.formTitle}</h2>
              <p className="text-xs text-stone-500">{labels.formSub}</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Automatic LINE ID Detection Indicator */}
            {lineUserId ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{labels.lineIdDetected}</span>
              </div>
            ) : null}

            {/* Room Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#963720]" />
                <span>{labels.roomLabel}</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value.toUpperCase())}
                placeholder={labels.roomPlaceholder}
                className="w-full border border-stone-300 rounded-xl p-3 text-sm font-bold uppercase text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-[#963720]" />
                <span>{labels.phoneLabel}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={labels.phonePlaceholder}
                className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>

            {/* Language Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-[#963720]" />
                <span>{labels.langLabel}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPreferredLanguage('TH');
                    setUiLanguage('TH');
                  }}
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
                  onClick={() => {
                    setPreferredLanguage('MY');
                    setUiLanguage('MY');
                  }}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#963720] hover:bg-[#822E1A] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? labels.submittingBtn : labels.submitBtn}</span>
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
