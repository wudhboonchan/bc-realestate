'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Building2, Phone, ShieldCheck, AlertCircle, Globe } from 'lucide-react';
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
        formSub: 'ကျေးဇူးပြု၍ အခန်းနံပါတ်နှင့် ဖုန်းနံပါတ် ထည့်သွင်းပါ',
        roomLabel: 'အခန်းနံပါတ် (Room Number) *',
        roomPlaceholder: 'ဥပမာ A1, B1, C2',
        roomHint: 'စာလုံး 1 လုံး + ဂဏန်း 1 လုံး (ဥပမာ A1)',
        phoneLabel: 'ဖုန်းနံပါတ် (Phone Number) *',
        phonePlaceholder: '08xxxxxxxx (10 လုံး)',
        phoneHint: 'ဖုန်းနံပါတ် 10 လုံး ပြည့်အောင် ထည့်သွင်းပါ',
        langLabel: 'ဘေလ်စာရင်း လက်ခံလိုသော ဘာသာစကား',
        submitBtn: 'အခန်းနှင့် LINE အကောင့် ချိတ်ဆက်မည်',
        submittingBtn: 'ချိတ်ဆက်နေပါသည်...',
        successTitle: 'အကောင့် ချိတ်ဆက်မှု အောင်မြင်ပါသည်!',
        registeredInfo: '✓ မှတ်ပုံတင်ထားသော အချက်အလက်များ:',
        successFooter: 'လစဉ် ဘေလ်စာရင်းများကို LINE မှတဆင့် တိုက်ရိုက် ပေးပို့သွားမည် ဖြစ်ပါသည်။',
        errFormatRoom: 'အခန်းနံပါတ်ကို 1 စာလုံး + 1 ဂဏန်း ပုံစံဖြင့်သာ ထည့်သွင်းပါ (ဥပမာ A1, B1)',
        errFormatPhone: 'ဖုန်းနံပါတ် 10 လုံး ပြည့်အောင် ထည့်သွင်းပါ (ဥပမာ 0812345678)',
        errNotFound: 'ထည့်သွင်းထားသော အခန်း သို့မဟုတ် ဖုန်းနံပါတ် မတွေ့ရှိပါ။',
      }
    : {
        title: 'ผูกบัญชี LINE Official Account',
        subtitle: 'หอพักตาลเดี่ยว · ระบบรับใบแจ้งหนี้ค่าเช่าอัตโนมัติ',
        formTitle: 'ยืนยันข้อมูลผู้เช่าเพื่อผูกบัญชี',
        formSub: 'กรอกเฉพาะเลขห้องพักและเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับหอพัก',
        roomLabel: 'เลขห้องพัก (Room Number) *',
        roomPlaceholder: 'เช่น A1, B1, C2, D3',
        roomHint: 'ตัวอักษร 1 ตัว + ตัวเลข 1 ตัว (เช่น A1)',
        phoneLabel: 'เบอร์โทรศัพท์ผู้เช่า (Phone Number) *',
        phonePlaceholder: '08xxxxxxxx (10 หลัก)',
        phoneHint: 'กรอกตัวเลข 10 หลัก (เช่น 0812345678)',
        langLabel: 'ภาษาสำหรับรับบิลใบแจ้งหนี้ (Preferred Language)',
        submitBtn: 'ผูกบัญชี LINE กับห้องพัก',
        submittingBtn: 'กำลังยืนยันการผูกบัญชี...',
        successTitle: 'ผูกบัญชีเรียบร้อยแล้ว!',
        registeredInfo: '✓ ข้อมูลการลงทะเบียน:',
        successFooter: 'ท่านจะได้รับใบแจ้งหนี้ประจำเดือนผ่านทาง LINE OA นี้ทันทีเมื่อถึงกำหนดออกบิล',
        errFormatRoom: 'เลขห้องพักต้องเป็นตัวอักษร 1 ตัว + ตัวเลข 1 ตัวเท่านั้น (เช่น A1, B1, C2, E5)',
        errFormatPhone: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น (ขึ้นต้นด้วย 0 เช่น 0812345678)',
        errNotFound: 'ไม่พบข้อมูลผู้เช่าตรงกับห้องและเบอร์โทรศัพท์นี้',
      };

  // Restrict Room Number input: Exactly 1 Letter + 1 Digit
  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (val.length === 1) {
      if (!/^[A-Z]$/.test(val)) return;
    } else if (val.length === 2) {
      if (!/^[A-Z][0-9]$/.test(val)) return;
    } else if (val.length > 2) {
      return;
    }
    setRoomNumber(val);
  };

  // Restrict Phone input: Exactly digits only, max 10 chars
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanRoomNum = roomNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Validate Room Number format: 1 Letter + 1 Digit (e.g. A1, B2)
    if (!/^[A-Z][0-9]$/.test(cleanRoomNum)) {
      setErrorMessage(labels.errFormatRoom);
      return;
    }

    // Validate Phone format: Exactly 10 digits starting with 0
    if (!/^0[0-9]{9}$/.test(cleanPhone)) {
      setErrorMessage(labels.errFormatPhone);
      return;
    }

    const targetLineId = lineUserId.trim() || `auto_bind_${cleanRoomNum}_${Date.now()}`;

    setLoading(true);

    try {
      const targetRoom = rooms.find((r) => r.roomNumber.toUpperCase() === cleanRoomNum);
      const targetTenant = tenants.find(
        (t) =>
          (targetRoom && (t.assignedRoomId === targetRoom.id || t.id === targetRoom.currentTenantId)) ||
          t.phone.replace(/[^0-9]/g, '') === cleanPhone
      );

      if (targetTenant) {
        bindTenantLineUser(targetTenant.id, targetLineId, preferredLanguage);
      }

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
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full my-auto space-y-4">
        {/* Language Switcher Bar */}
        <div className="flex justify-end items-center">
          <div className="bg-white p-1 rounded-2xl border border-[#E2DDD5] shadow-xs flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setUiLanguage('TH');
                setPreferredLanguage('TH');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                !isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              type="button"
              onClick={() => {
                setUiLanguage('MY');
                setPreferredLanguage('MY');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                isBurmese ? 'bg-[#963720] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🇲🇲 မြန်မာ
            </button>
          </div>
        </div>

        {/* Standalone Mobile Card */}
        <div className="bg-white rounded-3xl border border-[#E2DDD5] shadow-lg overflow-hidden">
          {/* Official LINE Header */}
          <div className="bg-[#963720] text-white p-6 text-center space-y-3 relative overflow-hidden">
            {/* Official LINE Logo Badge */}
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white/40">
              <svg className="w-10 h-10 fill-[#06C755]" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.412-.105-.531-.284l-2.072-3.136v2.763c0 .346-.282.63-.63.63-.346 0-.629-.284-.629-.63V8.108c0-.27.174-.51.432-.596.064-.021.133-.031.199-.031.211 0 .412.105.531.284l2.072 3.137V8.108c0-.345.282-.63.63-.63.346 0 .629.285.629.63v4.771zm-5.741 0c0 .346-.282.63-.63.63-.346 0-.629-.284-.629-.63V8.108c0-.345.283-.63.63-.63.348 0 .629.285.629.63v4.771zm-2.469.63H4.914c-.346 0-.63-.284-.63-.63V8.108c0-.345.284-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-bold font-serif tracking-tight">
                {labels.title}
              </h1>
              <p className="text-xs text-stone-200 mt-0.5">
                {labels.subtitle}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Success Card View */}
            {successMessage ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{labels.successTitle}</h2>
                  <p className="text-xs text-stone-600 mt-1">{successMessage}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-600 text-left space-y-1.5 border border-stone-200">
                  <p className="font-semibold text-stone-800">{labels.registeredInfo}</p>
                  <p>• {labels.roomLabel.replace(' *', '')}: <span className="font-bold text-stone-900">{roomNumber.toUpperCase()}</span></p>
                  <p>• {labels.langLabel}: <span className="font-bold text-stone-900">{preferredLanguage === 'MY' || preferredLanguage === 'MM' ? 'မြန်မာစာ (ภาษาพม่า)' : 'ภาษาไทย (Thai)'}</span></p>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  {labels.successFooter}
                </p>
              </div>
            ) : (
              /* Form Card View */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-stone-100 pb-3 text-center sm:text-left">
                  <h2 className="text-sm font-bold text-stone-900">{labels.formTitle}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">{labels.formSub}</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Room Number Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-[#963720]" />
                      <span>{labels.roomLabel}</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">{labels.roomHint}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={2}
                    value={roomNumber}
                    onChange={handleRoomInputChange}
                    placeholder={labels.roomPlaceholder}
                    autoCapitalize="characters"
                    className="w-full border border-stone-300 rounded-2xl p-3 text-lg font-mono font-bold tracking-widest text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none text-center"
                    required
                  />
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-[#963720]" />
                      <span>{labels.phoneLabel}</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">{labels.phoneHint}</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneInputChange}
                    placeholder={labels.phonePlaceholder}
                    className="w-full border border-stone-300 rounded-2xl p-3 text-base font-mono font-semibold tracking-wider text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none text-center"
                    required
                  />
                </div>

                {/* Preferred Language Selector */}
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
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        preferredLanguage === 'TH'
                          ? 'bg-[#963720] text-white border-[#963720] shadow-2xs'
                          : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>🇹🇭 ภาษาไทย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreferredLanguage('MY');
                        setUiLanguage('MY');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        preferredLanguage === 'MY' || preferredLanguage === 'MM'
                          ? 'bg-[#963720] text-white border-[#963720] shadow-2xs'
                          : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>🇲🇲 မြန်မာစာ</span>
                    </button>
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#963720] hover:bg-[#822E1A] text-white font-bold text-sm py-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{loading ? labels.submittingBtn : labels.submitBtn}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="text-center text-stone-400 text-[11px] pt-1">
          © 2026 หอพักตาลเดี่ยว · ระบบบริหารจัดการหอพักผ่าน LINE
        </footer>
      </div>
    </div>
  );
}

export default function LineBindPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8 text-center text-xs text-stone-500">กำลังโหลดระบบผูกบัญชี...</div>}>
      <LineBindForm />
    </Suspense>
  );
}
