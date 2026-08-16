'use client';

import React, { useState, useEffect } from 'react';
import { Tenant, TenantNationality, LanguageOption } from '@/types';
import { useProperty } from '@/context/PropertyContext';
import { X, Upload, CheckCircle2 } from 'lucide-react';

interface TenantModalProps {
  isOpen: boolean;
  tenantToEdit?: Tenant | null;
  onClose: () => void;
}

export function TenantModal({ isOpen, tenantToEdit, onClose }: TenantModalProps) {
  const { rooms, addTenant, updateTenant } = useProperty();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationality, setNationality] = useState<TenantNationality>('TH');
  const [phone, setPhone] = useState('');
  const [idCardPhotoUrl, setIdCardPhotoUrl] = useState('');
  const [idCardPhotoFileName, setIdCardPhotoFileName] = useState('');
  const [hasSecurityDeposit, setHasSecurityDeposit] = useState(true);
  const [securityDepositAmount, setSecurityDepositAmount] = useState<number>(1300);
  const [assignedRoomId, setAssignedRoomId] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageOption>('TH');
  const [lineUserId, setLineUserId] = useState('');

  useEffect(() => {
    if (tenantToEdit) {
      setFirstName(tenantToEdit.firstName);
      setLastName(tenantToEdit.lastName);
      setNationality(tenantToEdit.nationality);
      setPhone(tenantToEdit.phone);
      setIdCardPhotoUrl(tenantToEdit.idCardPhotoUrl || '');
      setIdCardPhotoFileName(tenantToEdit.idCardPhotoFileName || '');
      setHasSecurityDeposit(tenantToEdit.hasSecurityDeposit);
      setSecurityDepositAmount(tenantToEdit.securityDepositAmount || 1300);
      setAssignedRoomId(tenantToEdit.assignedRoomId || '');
      setPreferredLanguage(tenantToEdit.preferredLanguage || 'TH');
      setLineUserId(tenantToEdit.lineUserId || '');
    } else {
      setFirstName('');
      setLastName('');
      setNationality('TH');
      setPhone('');
      setIdCardPhotoUrl('');
      setIdCardPhotoFileName('');
      setHasSecurityDeposit(true);
      setSecurityDepositAmount(1300);
      setAssignedRoomId('');
      setPreferredLanguage('TH');
      setLineUserId('');
    }
  }, [tenantToEdit, isOpen]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      alert('กรุณากรอกชื่อผู้เช่า');
      return;
    }

    if (tenantToEdit) {
      updateTenant(tenantToEdit.id, {
        firstName,
        lastName,
        nationality,
        phone,
        idCardPhotoUrl,
        idCardPhotoFileName,
        hasSecurityDeposit,
        securityDepositAmount: Number(securityDepositAmount),
        assignedRoomId: assignedRoomId || undefined,
        preferredLanguage,
        lineUserId: lineUserId.trim() || undefined,
      });
    } else {
      addTenant({
        firstName,
        lastName,
        nationality,
        phone,
        idCardPhotoUrl: idCardPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        idCardPhotoFileName: idCardPhotoFileName || 'id_card.jpg',
        hasSecurityDeposit,
        securityDepositAmount: Number(securityDepositAmount),
        assignedRoomId: assignedRoomId || undefined,
        preferredLanguage,
        lineUserId: lineUserId.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="bg-stone-100 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            {tenantToEdit ? 'แก้ไขข้อมูลผู้เช่า' : 'เพิ่มผู้เช่ารายใหม่'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Nationality & Preferred Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                สัญชาติผู้เช่า <span className="text-rose-500">*</span>
              </label>
              <select
                value={nationality}
                onChange={(e) => {
                  const val = e.target.value as TenantNationality;
                  setNationality(val);
                  if (val === 'MM') setPreferredLanguage('MM');
                  else setPreferredLanguage('TH');
                }}
                className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-stone-800 focus:ring-2 focus:ring-stone-400 outline-none"
              >
                <option value="TH">🇹🇭 คนไทย (Thai)</option>
                <option value="MM">🇲🇲 ชาวพม่า (Burmese)</option>
                <option value="OTHER">🌐 ต่างชาติอื่นๆ (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                ภาษาใบแจ้งหนี้ที่ต้องการ
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as LanguageOption)}
                className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-stone-800 focus:ring-2 focus:ring-stone-400 outline-none"
              >
                <option value="TH">🇹🇭 ภาษาไทย (Thai)</option>
                <option value="MY">🇲🇲 ภาษาพม่า (မြန်မာ)</option>
              </select>
            </div>
          </div>

          {/* LINE User ID Field */}
          <div>
            <label className="block text-stone-600 font-medium mb-1">
              LINE User ID (สำหรับรับใบแจ้งหนี้อัตโนมัติ)
            </label>
            <input
              type="text"
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              placeholder="เช่น U10a9b8c7d6e5f4... (หรือให้ผู้เช่าสแกนผูกบัญชีเอง)"
              className="w-full border border-stone-300 rounded-lg p-2.5 font-mono text-stone-900 focus:ring-2 focus:ring-stone-400 outline-none"
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                ชื่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="เช่น สมชาย หรือ Aung"
                className="w-full border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:ring-2 focus:ring-stone-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">นามสกุล</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="เช่น สายชล หรือ San Win"
                className="w-full border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:ring-2 focus:ring-stone-400 outline-none"
              />
            </div>
          </div>

          {/* Phone & Assigned Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 font-medium mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:ring-2 focus:ring-stone-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">ห้องที่เข้าพัก</label>
              <select
                value={assignedRoomId}
                onChange={(e) => setAssignedRoomId(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-stone-800 focus:ring-2 focus:ring-stone-400 outline-none"
              >
                <option value="">-- ยังไม่ระบุห้อง --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    ห้อง {r.roomNumber} ({r.zoneCode}) - ฿{r.rentPrice.toLocaleString()} [{r.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Deposit Section */}
          <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="depositCheck"
                checked={hasSecurityDeposit}
                onChange={(e) => setHasSecurityDeposit(e.target.checked)}
                className="w-4 h-4 rounded text-stone-800 focus:ring-stone-400 accent-stone-800 cursor-pointer"
              />
              <label htmlFor="depositCheck" className="text-xs font-semibold text-stone-800 cursor-pointer">
                ชำระค่าประกันแรกเข้าเรียบร้อยแล้ว
              </label>
            </div>

            {hasSecurityDeposit && (
              <div>
                <label className="block text-stone-500 font-medium mb-1">
                  จำนวนเงินค่าประกัน (บาท)
                </label>
                <input
                  type="number"
                  value={securityDepositAmount}
                  onChange={(e) => setSecurityDepositAmount(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg p-2 bg-white text-stone-900 font-semibold focus:ring-2 focus:ring-stone-400 outline-none"
                />
              </div>
            )}
          </div>

          {/* ID Card / Document Upload */}
          <div>
            <label className="block text-stone-600 font-medium mb-1">
              อัพโหลดบัตรประชาชน / พาสปอร์ต / ใบอนุญาตทำงาน
            </label>
            <div className="border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-4 text-center bg-stone-50/50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {idCardPhotoUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full h-28 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center relative border border-stone-200">
                    <img
                      src={idCardPhotoUrl}
                      alt="ID Card Document"
                      className="object-contain h-full"
                    />
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-700 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{idCardPhotoFileName || 'อัพโหลดรูปเอกสารเรียบร้อยแล้ว'}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">คลิกเพื่อเปลี่ยนรูป</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1 py-2 text-stone-500">
                  <Upload className="w-6 h-6 text-stone-400" />
                  <span className="text-xs font-medium">ลากไฟล์มาวาง หรือ คลิกอัพโหลดรูปบัตร</span>
                  <span className="text-[10px] text-stone-400">รองรับไฟล์ JPG, PNG, WEBP</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-medium shadow-sm transition-colors"
            >
              {tenantToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้เช่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
