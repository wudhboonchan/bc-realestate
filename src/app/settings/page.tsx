'use client';

import React, { useState, useEffect } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Settings, Save, Plus, QrCode } from 'lucide-react';

export default function SettingsPage() {
  const { property, updatePropertyRates, zones, addZone } = useProperty();

  const [waterRate, setWaterRate] = useState(property.waterRatePerUnit);
  const [elecRate, setElecRate] = useState(property.elecRatePerUnit);
  const [garbageFee, setGarbageFee] = useState(property.garbageFeePerRoom);

  const [promptPayId, setPromptPayId] = useState(property.promptPayId || '3190200356040');
  const [promptPayName, setPromptPayName] = useState(property.promptPayName || 'กนกกชกร เกียรติวีระสกุล');

  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneName, setNewZoneName] = useState('');

  useEffect(() => {
    if (property) {
      setWaterRate(property.waterRatePerUnit);
      setElecRate(property.elecRatePerUnit);
      setGarbageFee(property.garbageFeePerRoom);
      setPromptPayId(property.promptPayId || '3190200356040');
      setPromptPayName(property.promptPayName || 'กนกกชกร เกียรติวีระสกุล');
    }
  }, [property]);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updatePropertyRates({
      waterRatePerUnit: Number(waterRate),
      elecRatePerUnit: Number(elecRate),
      garbageFeePerRoom: Number(garbageFee),
      promptPayId,
      promptPayName,
    });
    alert('บันทึกอัตราค่าน้ำ ค่าไฟ ค่าขยะ และบัญชี PromptPay เรียบร้อยแล้ว!');
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneCode || !newZoneName) return;

    addZone({
      propertyId: property.id,
      code: newZoneCode.toUpperCase(),
      name: newZoneName,
      description: `โซน ${newZoneCode.toUpperCase()}`,
      baseRent: 1300,
    });

    setNewZoneCode('');
    setNewZoneName('');
    alert(`เพิ่มโซนใหม่ "${newZoneCode}" เรียบร้อยแล้ว!`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
          SYSTEM SETTINGS · ตั้งค่าระบบหอพัก
        </span>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif flex items-center space-x-2 mt-0.5">
          <Settings className="w-5 h-5 text-stone-700" />
          <span>การตั้งค่าอัตราค่าบริการและบัญชี PromptPay</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          กำหนดเรทค่าน้ำ-ไฟ-ขยะมาตรฐาน และตั้งค่า PromptPay ID สำหรับ Dynamic QR Code สแกนชำระเงิน
        </p>
      </div>

      {/* Standard Rates & PromptPay Card */}
      <form onSubmit={handleSaveRates} className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-2xs space-y-5">
        <h3 className="text-base font-bold text-stone-900 font-serif border-b border-[#E2DDD5] pb-3">
          1. อัตราค่าบริการมาตรฐาน (Standard Rates)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              ค่าน้ำประปา (บาท / หน่วย)
            </label>
            <input
              type="number"
              value={waterRate}
              onChange={(e) => setWaterRate(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E2DDD5] rounded-xl font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              ค่าไฟฟ้า (บาท / หน่วย)
            </label>
            <input
              type="number"
              value={elecRate}
              onChange={(e) => setElecRate(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E2DDD5] rounded-xl font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              ค่าขยะส่วนกลาง (บาท / ห้อง / เดือน)
            </label>
            <input
              type="number"
              value={garbageFee}
              onChange={(e) => setGarbageFee(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E2DDD5] rounded-xl font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
              required
            />
          </div>
        </div>

        {/* PromptPay Settings */}
        <div className="pt-3 border-t border-[#E2DDD5] space-y-3">
          <div className="flex items-center space-x-2 font-serif font-bold text-stone-900 text-sm">
            <QrCode className="w-4 h-4 text-[#963720]" />
            <span>2. ตั้งค่าบัญชี PromptPay รับเงิน (สำหรับ Dynamic QR Code)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                เบอร์โทรศัพท์ / เลขบัตรประชาชน / เลขผู้เสียภาษี PromptPay
              </label>
              <input
                type="text"
                value={promptPayId}
                onChange={(e) => setPromptPayId(e.target.value)}
                placeholder="เช่น 3190200356040"
                className="w-full p-2.5 border border-[#E2DDD5] rounded-xl font-mono font-bold text-[#963720] focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                ชื่อบัญชีรับเงิน (แสดงบนบิล)
              </label>
              <input
                type="text"
                value={promptPayName}
                onChange={(e) => setPromptPayName(e.target.value)}
                placeholder="เช่น กนกกชกร เกียรติวีระสกุล"
                className="w-full p-2.5 border border-[#E2DDD5] rounded-xl font-semibold text-stone-900 focus:ring-2 focus:ring-[#963720] outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
          </button>
        </div>
      </form>

      {/* Zone Management Card */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-serif border-b border-[#E2DDD5] pb-3">
          3. การขยายโซนห้องพัก (Future Zone Expansion)
        </h3>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-600 block">โซนปัจจุบันที่มีในระบบ:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {zones.map((z) => (
              <span
                key={z.id}
                className="px-3 py-1 bg-[#FAF7F2] border border-[#E2DDD5] rounded-xl font-semibold text-stone-800"
              >
                โซน {z.code}: {z.name}
              </span>
            ))}
          </div>
        </div>

        {/* Add Zone Form */}
        <form onSubmit={handleAddZone} className="pt-4 border-t border-[#E2DDD5] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">รหัสโซน (เช่น F)</label>
            <input
              type="text"
              value={newZoneCode}
              onChange={(e) => setNewZoneCode(e.target.value)}
              placeholder="F"
              className="w-full p-2 border border-[#E2DDD5] rounded-lg uppercase font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#963720]"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">ชื่อโซน</label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="โซนตึกขยายใหม่"
              className="w-full p-2 border border-[#E2DDD5] rounded-lg text-stone-900 outline-none focus:ring-2 focus:ring-[#963720]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-black text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มโซนใหม่</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
