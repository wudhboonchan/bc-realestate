'use client';

import React from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Menu, Calendar } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface TopHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function TopHeader({ onOpenMobileMenu }: TopHeaderProps) {
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
    <header className="bg-[#FAF7F2] border-b border-[#E2DDD5] px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Mobile Menu Button & Breadcrumb */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 text-xs">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-xl bg-stone-200/70 hover:bg-stone-300 text-stone-700 md:hidden transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-stone-800" />
        </button>

        <div className="flex items-center space-x-1.5 font-medium truncate">
          <span className="font-bold text-stone-900 text-xs sm:text-sm truncate">{getPageTitle()}</span>
          <span className="text-stone-400">/</span>
          <span className="text-stone-500 font-mono text-[11px] sm:text-xs">{selectedMonth}</span>
        </div>
      </div>

      {/* Right: Month Selector Dropdown Pill */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E2DDD5] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-[11px] sm:text-xs font-semibold text-stone-800 outline-none cursor-pointer pr-0.5"
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
