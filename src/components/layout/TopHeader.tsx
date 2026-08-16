'use client';

import React from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Menu, Calendar } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function TopHeader() {
  const pathname = usePathname();
  const { selectedMonth, setSelectedMonth } = useProperty();

  const availableMonths = ['2026-08', '2026-07', '2026-06', '2026-05', '2026-04'];

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/meter-reading':
        return 'การจดมิเตอร์ประจำเดือน';
      case '/tenants':
        return 'รายชื่อผู้เช่า';
      case '/invoices':
        return 'ใบแจ้งหนี้';
      case '/financial-summary':
        return 'สรุปกำไร-ขาดทุน (น้ำ/ไฟ)';
      case '/settings':
        return 'ตั้งค่าระบบ';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-[#FAF7F2] border-b border-[#E2DDD5] px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Breadcrumb matching screenshot */}
      <div className="flex items-center space-x-3 text-xs">
        <Menu className="w-4 h-4 text-stone-600" />
        <div className="flex items-center space-x-1.5 font-medium">
          <span className="font-semibold text-stone-900">{getPageTitle()}</span>
          <span className="text-stone-400">/</span>
          <span className="text-stone-500 font-mono">{selectedMonth}</span>
        </div>
      </div>

      {/* Right: Month Selector Dropdown Pill */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2DDD5] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-semibold text-stone-800 outline-none cursor-pointer pr-1"
          >
            {availableMonths.map((m: string) => (
              <option key={m} value={m}>
                รอบเดือน {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
