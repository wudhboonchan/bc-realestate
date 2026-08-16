'use client';

import React, { useState } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Tenant } from '@/types';
import { TenantModal } from '@/components/tenants/TenantModal';
import {
  Users,
  UserPlus,
  Phone,
  ShieldCheck,
  Edit,
  Trash2,
  Search,
  LayoutGrid,
  ListFilter,
  Image as ImageIcon,
  X,
  MessageSquare,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';

export default function TenantsPage() {
  const { tenants, rooms, zones, deleteTenant } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);
  const [lineBindModal, setLineBindModal] = useState<{ tenant: Tenant; roomNumber: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredTenants = tenants.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm)
  );

  const handleOpenAddModal = (roomId?: string) => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    if (confirm(`คุณต้องการลบผู้เช่า "${tenant.firstName} ${tenant.lastName}" หรือไม่?`)) {
      deleteTenant(tenant.id);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest block">
            TENANTS DIRECTORY · ทะเบียนผู้เช่าตามผังห้อง
          </span>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif flex items-center space-x-2 mt-0.5">
            <Users className="w-5 h-5 text-stone-700" />
            <span>ผังรายชื่อผู้เช่าหอพัก ({tenants.length} คน)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            แสดงรายชื่อผู้เช่าเรียงตามผังห้องจริง 5 โซน (A1, B1-B7, C1-C4, D1-D7, E1-E5) สัญชาติไทย 🇹🇭 / พม่า 🇲🇲
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="bg-[#FAF7F2] p-1 rounded-xl border border-[#E2DDD5] flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${viewMode === 'diagram'
                  ? 'bg-[#963720] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ผังห้องพัก</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${viewMode === 'list'
                  ? 'bg-[#963720] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>รายการผู้เช่า</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="bg-[#963720] hover:bg-[#822E1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้เช่ารายใหม่</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E2DDD5] shadow-2xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาตามชื่อผู้เช่า, นามสกุล หรือเบอร์โทรศัพท์..."
          className="bg-transparent text-xs w-full text-stone-800 placeholder-stone-400 outline-none font-medium"
        />
      </div>

      {/* DIAGRAM LAYOUT VIEW (Grouped by Zones) */}
      {viewMode === 'diagram' ? (
        <div className="space-y-6">
          {zones.map((zone) => {
            const zoneRooms = rooms.filter((r) => r.zoneId === zone.id);

            return (
              <div
                key={zone.id}
                className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E2DDD5] shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shadow-2xs border ${getZoneColorStyle(
                        zone.code
                      )}`}
                    >
                      โซน {zone.code}
                    </span>
                    <h2 className="font-bold text-stone-900 text-sm font-serif">
                      {zone.name}
                    </h2>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    ({zoneRooms.filter((r) => tenants.some((t) => t.assignedRoomId === r.id || t.id === r.currentTenantId)).length} / {zoneRooms.length} ห้องมีผู้เช่า)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zoneRooms.map((room) => {
                    const tenant = tenants.find((t) => t.assignedRoomId === room.id || t.id === room.currentTenantId);

                    // Filter search matching
                    if (
                      searchTerm &&
                      tenant &&
                      !tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !tenant.phone.includes(searchTerm)
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={room.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${tenant
                            ? 'bg-white border-[#E2DDD5] shadow-2xs hover:border-stone-400'
                            : 'bg-stone-50/70 border-dashed border-stone-300 opacity-75'
                          }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-stone-900 text-sm bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                                ห้อง {room.roomNumber}
                              </span>
                              {tenant && (
                                <span className="text-xs">
                                  {tenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'}
                                </span>
                              )}
                            </div>

                            {tenant ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                                มีผู้เช่า
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                                ห้องว่าง
                              </span>
                            )}
                          </div>

                          {tenant ? (
                            <div className="space-y-1.5 pt-1">
                              <h3 className="font-bold text-stone-900 text-sm">
                                {tenant.firstName} {tenant.lastName}
                              </h3>

                              <div className="text-xs text-stone-600 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                                    <span>{tenant.phone}</span>
                                  </div>

                                  {/* LINE Binding Badge */}
                                  {tenant.lineUserId ? (
                                    <span
                                      className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-pointer"
                                      onClick={() => setLineBindModal({ tenant, roomNumber: room.roomNumber })}
                                      title={`LINE ID: ${tenant.lineUserId}`}
                                    >
                                      <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>ผูก LINE แล้ว ({tenant.preferredLanguage === 'MY' || tenant.preferredLanguage === 'MM' ? '🇲🇲 พม่า' : '🇹🇭 ไทย'})</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setLineBindModal({ tenant, roomNumber: room.roomNumber })}
                                      className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200 transition-colors cursor-pointer"
                                      title="กดเพื่อดู QR Code หรือคัดลอกลิงก์ผูก LINE OA ให้ผู้เช่า"
                                    >
                                      <QrCode className="w-2.5 h-2.5 text-stone-500" />
                                      <span>ยังไม่ผูก LINE</span>
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>
                                    ประกัน: ฿{tenant.securityDepositAmount.toLocaleString()} ({tenant.hasSecurityDeposit ? 'ชำระแล้ว ✓' : 'ยังไม่ชำระ'})
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 text-stone-400 italic text-xs">
                              ยังไม่มีผู้เช่าเข้าพัก
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            {tenant?.idCardPhotoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewingPhoto({
                                    url: tenant.idCardPhotoUrl!,
                                    title: `เอกสารแนบ: ${tenant.firstName} ${tenant.lastName} (ห้อง ${room.roomNumber})`,
                                  })
                                }
                                className="px-2 py-1 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                                title="เปิดดูรูปบัตรประชาชน / เอกสารแนบ"
                              >
                                <ImageIcon className="w-3 h-3 text-[#963720]" />
                                <span>ดูภาพบัตรประชาชน</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {tenant ? (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(tenant)}
                                  className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                                >
                                  <Edit className="w-3 h-3 text-stone-500" />
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(tenant)}
                                  className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>ลบ</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenAddModal(room.id)}
                                className="px-3 py-1 rounded-lg bg-stone-900 text-white hover:bg-black text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>เพิ่มผู้เช่าเข้าห้องนี้</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTenants.map((tenant) => {
            const room = rooms.find((r) => r.id === tenant.assignedRoomId);

            return (
              <div
                key={tenant.id}
                className="bg-white rounded-2xl border border-[#E2DDD5] p-5 shadow-2xs space-y-4 hover:border-stone-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#EAE1D5] text-[#963720] font-bold flex items-center justify-center text-sm border border-[#D8C7B5]">
                        {tenant.nationality === 'MM' ? '🇲🇲' : '🇹🇭'}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">
                          {tenant.firstName} {tenant.lastName}
                        </h3>
                        <span className="text-[11px] text-stone-500 block">
                          {tenant.nationality === 'MM' ? 'ชาวพม่า (Burmese)' : 'คนไทย (Thai)'}
                        </span>
                      </div>
                    </div>

                    {room ? (
                      <span className="px-3 py-1 bg-stone-900 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                        ห้อง {room.roomNumber}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-400 text-[10px] rounded-md border border-stone-200">
                        ยังไม่ระบุห้อง
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>โทร: {tenant.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        ประกันแรกเข้า: {tenant.hasSecurityDeposit ? `฿${tenant.securityDepositAmount.toLocaleString()} (ชำระแล้ว ✓)` : 'ยังไม่ชำระ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    {tenant.idCardPhotoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingPhoto({
                            url: tenant.idCardPhotoUrl!,
                            title: `เอกสารแนบ: ${tenant.firstName} ${tenant.lastName}`,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                        title="เปิดดูรูปบัตรประชาชน / เอกสารแนบ"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#963720]" />
                        <span>ดูภาพบัตรประชาชน</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(tenant)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleDelete(tenant)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-xl w-full shadow-2xl space-y-4 border border-stone-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#963720]" />
                <span>{viewingPhoto.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-100 rounded-xl overflow-hidden border border-stone-200 p-2 flex items-center justify-center min-h-[240px] max-h-[70vh]">
              {/* eslint-disable-next-html-snippet */}
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINE ACCOUNT BINDING QR & LINK MODAL */}
      {lineBindModal && (
        <div
          onClick={() => setLineBindModal(null)}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-stone-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>ลิงก์ผูกบัญชี LINE · ห้อง {lineBindModal.roomNumber}</span>
              </h3>
              <button
                type="button"
                onClick={() => setLineBindModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900 text-sm">
                  {lineBindModal.tenant.firstName} {lineBindModal.tenant.lastName}
                </p>
                <p className="text-stone-500">โทร: {lineBindModal.tenant.phone}</p>
                <p className="text-stone-500">
                  ภาษาบิล: {lineBindModal.tenant.preferredLanguage === 'MY' || lineBindModal.tenant.preferredLanguage === 'MM' ? '🇲🇲 ภาษาพม่า (မြန်မာ)' : '🇹🇭 ภาษาไทย'}
                </p>
              </div>

              {lineBindModal.tenant.lineUserId ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-1">
                  <span className="font-bold text-xs flex items-center space-x-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>ผูกบัญชี LINE OA เรียบร้อยแล้ว</span>
                  </span>
                  <p className="font-mono text-[10px] bg-white p-2 rounded border border-emerald-200 truncate">
                    ID: {lineBindModal.tenant.lineUserId}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-1">
                  <span className="font-bold text-xs">⚠️ ยังไม่ได้ผูกบัญชี LINE OA</span>
                  <p className="text-[11px] text-amber-800">
                    ส่งลิงก์ด้านล่างให้ผู้เช่า หรือเปิดบนมือถือผู้เช่าเพื่อยืนยันเบอร์โทรผูกบัญชี
                  </p>
                </div>
              )}

              {/* Binding URL Box */}
              <div className="space-y-1 pt-1">
                <label className="block text-stone-600 font-semibold">
                  ลิงก์สำหรับผู้เช่ากดผูกบัญชี:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/liff/bind`}
                    className="w-full border border-stone-300 rounded-xl p-2.5 text-xs font-mono bg-stone-50 text-stone-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/liff/bind`;
                      navigator.clipboard.writeText(link);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2.5 bg-[#963720] hover:bg-[#822E1A] text-white rounded-xl font-bold text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLineBindModal(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Create/Edit Modal */}
      <TenantModal
        isOpen={isModalOpen}
        tenantToEdit={editingTenant}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
