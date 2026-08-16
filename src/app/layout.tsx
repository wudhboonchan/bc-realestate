import type { Metadata } from 'next';
import './globals.css';
import { PropertyProvider } from '@/context/PropertyContext';
import { AppShell } from '@/components/layout/AppShell';
import { FirebaseErrorSuppressor } from '@/components/layout/FirebaseErrorSuppressor';

export const metadata: Metadata = {
  title: 'บุญจันทร์ เรียลเอสเตตท์ | หอพักตาลเดี่ยว',
  description: 'ระบบจัดการค่าเช่ารายเดือน จดมิเตอร์น้ำ-ไฟ ใบแจ้งหนี้ 2 ภาษา (ไทย/พม่า) สำหรับ หอพักตาลเดี่ยว',
  icons: {
    icon: [
      { url: '/logo.png?v=2', type: 'image/png' },
      { url: '/favicon.ico?v=2' },
    ],
    shortcut: '/logo.png?v=2',
    apple: '/logo.png?v=2',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="icon" href="/logo.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
      </head>
      <body className="font-sans bg-[#FAF9F6] text-stone-800 min-h-screen flex selection:bg-stone-800 selection:text-white">
        <FirebaseErrorSuppressor />
        <PropertyProvider>
          <AppShell>{children}</AppShell>
        </PropertyProvider>
      </body>
    </html>
  );
}
