import { NextRequest, NextResponse } from 'next/server';
import { db, saveToFirestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Tenant, Room } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomNumber, phone, lineUserId } = body;

    if (!roomNumber || !phone || !lineUserId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลเลขห้อง, เบอร์โทรศัพท์ และ LINE User ID ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const cleanRoomNum = roomNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Fetch rooms and tenants from Firestore or return matching response
    let matchedTenant: Tenant | null = null;

    if (db) {
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      let targetRoomId: string | null = null;

      roomsSnap.forEach((doc) => {
        const data = doc.data() as Room;
        if (data.roomNumber.toUpperCase() === cleanRoomNum) {
          targetRoomId = data.id;
        }
      });

      const tenantsSnap = await getDocs(collection(db, 'tenants'));
      tenantsSnap.forEach((doc) => {
        const t = doc.data() as Tenant;
        const tenantCleanPhone = t.phone.replace(/[^0-9]/g, '');
        if (
          (t.assignedRoomId === targetRoomId || tenantCleanPhone === cleanPhone) &&
          (tenantCleanPhone === cleanPhone || !cleanPhone)
        ) {
          matchedTenant = t;
        }
      });
    }

    if (!matchedTenant) {
      // Return response so client local state can also handle binding if firestore is not populated yet
      return NextResponse.json({
        success: true,
        matchedInRemote: false,
        message: 'กรุณายืนยันการผูกบัญชีบนหน้าเว็บ',
        data: {
          roomNumber: cleanRoomNum,
          phone: cleanPhone,
          lineUserId,
          lineBoundAt: new Date().toISOString(),
        },
      });
    }

    const targetTenant = matchedTenant as Tenant;
    // Save update to Firestore
    const updatedTenant: Tenant = {
      ...targetTenant,
      lineUserId,
      lineBoundAt: new Date().toISOString(),
    };

    await saveToFirestore('tenants', updatedTenant);

    return NextResponse.json({
      success: true,
      matchedInRemote: true,
      message: `ผูกบัญชี LINE สำหรับห้อง ${cleanRoomNum} สำเร็จ!`,
      tenant: updatedTenant,
    });
  } catch (error: any) {
    console.error('LINE Binding API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการผูกบัญชี' },
      { status: 500 }
    );
  }
}
