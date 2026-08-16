'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gauge,
  Users,
  FileText,
  PieChart,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useProperty } from '@/context/PropertyContext';

export function Sidebar() {
  const pathname = usePathname();
  const { property } = useProperty();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'การจดมิเตอร์ประจำเดือน', href: '/meter-reading', icon: Gauge },
    { name: 'รายชื่อผู้เช่า', href: '/tenants', icon: Users },
    { name: 'ใบแจ้งหนี้', href: '/invoices', icon: FileText },
    { name: 'สรุปกำไร-ขาดทุน (น้ำ/ไฟ)', href: '/financial-summary', icon: PieChart },
    { name: 'ตั้งค่าระบบ', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#EFECE6] border-r border-[#E2DDD5] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header with Watermark Style */}
      <div className="p-6 relative overflow-hidden border-b border-[#E2DDD5]/60 bg-[#E8E4DC]/40">
        <div className="relative z-10 space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-stone-900 font-serif">
            บุญจันทร์
          </h1>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-stone-500">
            REAL ESTATE SYSTEM
          </p>
        </div>

        {/* Decorative Seal Watermark Background */}
        <div className="absolute -right-3 -top-3 w-24 h-24 rounded-full border-4 border-stone-300/30 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-16 h-16 rounded-full border border-dashed border-stone-400 text-[8px] font-mono text-stone-500 flex items-center justify-center text-center leading-tight">
            BOONCHAN<br />ESTATE
          </div>
        </div>
      </div>

      {/* Sub-Property Selector Dropdown Card */}
      <div className="px-4 py-3 border-b border-[#E2DDD5]">
        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E2DDD5] shadow-2xs space-y-1">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
            หอพัก · อพาร์ตเมนต์
          </span>
          <div className="flex items-center justify-between text-xs font-bold text-[#963720] cursor-pointer">
            <span className="truncate">{property.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-[#EAE1D5] text-[#963720] font-semibold shadow-[#963720]/10 font-medium'
                  : 'text-stone-700 hover:bg-[#FAF7F2] hover:text-stone-900 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#963720]' : 'text-stone-500'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User Profile Card at Bottom */}
      <div className="p-3 border-t border-[#E2DDD5] bg-[#FAF7F2]">
        <div className="flex items-center justify-between p-2 rounded-xl border border-[#E2DDD5] bg-white text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#EAE1D5] text-[#963720] font-bold flex items-center justify-center text-xs border border-[#D8C7B5]">
              ก
            </div>
            <div>
              <span className="font-semibold text-stone-900 block text-xs">
                เจ้าของหอพัก
              </span>
              <span className="text-[10px] text-stone-400 block">admin</span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        </div>
      </div>
    </aside>
  );
}
