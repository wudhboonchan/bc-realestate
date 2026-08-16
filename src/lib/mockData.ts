import {
  Property,
  RoomZone,
  Room,
  Tenant,
  MeterReading,
  MonthlyBill,
  LandlordUtilityExpense,
} from '@/types';

export const initialProperty: Property = {
  id: 'tan-deaw',
  name: 'หอพักตาลเดี่ยว',
  code: 'BC',
  address: '75 หมู่ 2 ถ.สุดบรรทัด ต.ตาลเดี่ยว อ.แก่งคอย จ.สระบุรี 18110',
  waterRatePerUnit: 7,
  elecRatePerUnit: 7,
  garbageFeePerRoom: 15,
  promptPayId: '3190200356040',
  promptPayName: 'กนกกชกร เกียรติวีระสกุล',
  peaCaNumber: '020019283746',
  description: 'หอพักคุณภาพ บรรยากาศเงียบสงบ ปลอดภัย ใกล้แหล่งชุมชน',
};

export const initialZones: RoomZone[] = [
  {
    id: 'zone-a',
    propertyId: 'tan-deaw',
    code: 'A',
    name: 'ห้องเช่าร้านค้าหน้าถนน (ห้องใหญ่)',
    description: 'เหมาะสำหรับทำธุรกิจ ร้านค้า ทำเลติดถนนใหญ่',
    baseRent: 10000,
  },
  {
    id: 'zone-b',
    propertyId: 'tan-deaw',
    code: 'B',
    name: 'ห้องเช่าชั้นล่าง (ตึกใหม่)',
    description: 'ตึกใหม่ สภาพดี สะดวกสบาย ชั้น 1',
    baseRent: 1300,
  },
  {
    id: 'zone-c',
    propertyId: 'tan-deaw',
    code: 'C',
    name: 'ห้องเช่าชั้นบน (ตึกใหม่)',
    description: 'ตึกใหม่ ลมถ่ายเทสะดวก ชั้น 2',
    baseRent: 1300,
  },
  {
    id: 'zone-d',
    propertyId: 'tan-deaw',
    code: 'D',
    name: 'ห้องเช่าชั้นล่าง (ตึกเก่า)',
    description: 'ตึกดั้งเดิม ชั้น 1 ราคาประหยัด',
    baseRent: 1300,
  },
  {
    id: 'zone-e',
    propertyId: 'tan-deaw',
    code: 'E',
    name: 'ห้องเช่าชั้นบน (ตึกเก่า)',
    description: 'ตึกดั้งเดิม ชั้น 2 เงียบสงบ',
    baseRent: 1300,
  },
];

export const initialTenants: Tenant[] = [
  {
    id: 't-a1',
    firstName: 'สมชาย',
    lastName: 'สายชล',
    nationality: 'TH',
    phone: '081-234-5678',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    idCardPhotoFileName: 'id_somchai.jpg',
    hasSecurityDeposit: true,
    securityDepositAmount: 10000,
    assignedRoomId: 'r-a1',
    preferredLanguage: 'TH',
    lineUserId: 'U10a9b8c7d6e5f4a3b2c1d0',
    lineBoundAt: '2026-08-01T10:00:00.000Z',
    createdAt: '2026-01-15',
  },
];

// Exact rooms matching user requirement: A1, B1-B7, C1-C4, D1-D7, E1-E5 (Total 24 rooms)
export const initialRooms: Room[] = [
  // Zone A: A1 (1 room, 10,000 THB)
  {
    id: 'r-a1',
    roomNumber: 'A1',
    propertyId: 'tan-deaw',
    zoneId: 'zone-a',
    zoneCode: 'A',
    floor: 1,
    buildingType: 'storefront',
    rentPrice: 10000,
    status: 'occupied',
    currentTenantId: 't-a1',
    waterMeterPrevious: 120,
    elecMeterPrevious: 1450,
  },

  // Zone B: B1-B7 (7 rooms, 1,300 THB)
  ...[1, 2, 3, 4, 5, 6, 7].map((num) => ({
    id: `r-b${num}`,
    roomNumber: `B${num}`,
    propertyId: 'tan-deaw',
    zoneId: 'zone-b',
    zoneCode: 'B',
    floor: 1,
    buildingType: 'new' as const,
    rentPrice: 1300,
    status: 'vacant' as const,
    currentTenantId: undefined,
    waterMeterPrevious: 35,
    elecMeterPrevious: 450,
  })),

  // Zone C: C1-C4 (4 rooms, 1,300 THB)
  ...[1, 2, 3, 4].map((num) => ({
    id: `r-c${num}`,
    roomNumber: `C${num}`,
    propertyId: 'tan-deaw',
    zoneId: 'zone-c',
    zoneCode: 'C',
    floor: 2,
    buildingType: 'new' as const,
    rentPrice: 1300,
    status: 'vacant' as const,
    currentTenantId: undefined,
    waterMeterPrevious: 45,
    elecMeterPrevious: 540,
  })),

  // Zone D: D1-D7 (7 rooms, 1,300 THB)
  ...[1, 2, 3, 4, 5, 6, 7].map((num) => ({
    id: `r-d${num}`,
    roomNumber: `D${num}`,
    propertyId: 'tan-deaw',
    zoneId: 'zone-d',
    zoneCode: 'D',
    floor: 1,
    buildingType: 'old' as const,
    rentPrice: 1300,
    status: 'vacant' as const,
    currentTenantId: undefined,
    waterMeterPrevious: 150,
    elecMeterPrevious: 2000,
  })),

  // Zone E: E1-E5 (5 rooms, 1,300 THB)
  ...[1, 2, 3, 4, 5].map((num) => ({
    id: `r-e${num}`,
    roomNumber: `E${num}`,
    propertyId: 'tan-deaw',
    zoneId: 'zone-e',
    zoneCode: 'E',
    floor: 2,
    buildingType: 'old' as const,
    rentPrice: 1300,
    status: 'vacant' as const,
    currentTenantId: undefined,
    waterMeterPrevious: 200,
    elecMeterPrevious: 3000,
  })),
];

export const initialMeterReadings: MeterReading[] = [
  {
    id: 'MR-202608A1',
    propertyId: 'tan-deaw',
    roomId: 'r-a1',
    monthYear: '2026-08',
    waterPrevious: 120,
    waterCurrent: 135,
    waterUnits: 15,
    waterRate: 7,
    waterAmount: 105,
    elecPrevious: 1450,
    elecCurrent: 1620,
    elecUnits: 170,
    elecRate: 7,
    elecAmount: 1190,
    garbageFee: 15,
    rentAmount: 10000,
    totalBill: 11310,
    recordedAt: '2026-08-01',
  },
];

export const initialBills: MonthlyBill[] = [
  {
    id: 'INV-202608A1',
    propertyId: 'tan-deaw',
    roomId: 'r-a1',
    roomNumber: 'A1',
    zoneCode: 'A',
    tenantId: 't-a1',
    tenantName: 'สมชาย สายชล',
    tenantNationality: 'TH',
    monthYear: '2026-08',
    rentAmount: 10000,
    waterPrevious: 120,
    waterCurrent: 135,
    waterUnits: 15,
    waterAmount: 105,
    elecPrevious: 1450,
    elecCurrent: 1620,
    elecUnits: 170,
    elecAmount: 1190,
    garbageFee: 15,
    totalAmount: 11310,
    status: 'paid',
    receiptLanguage: 'TH',
    dueDate: '2026-08-05',
    issuedAt: '2026-08-01',
    paidAt: '2026-08-03',
  },
];

export const initialLandlordExpenses: LandlordUtilityExpense[] = [
  {
    id: 'exp-2026-08',
    propertyId: 'tan-deaw',
    monthYear: '2026-08',
    actualWaterBill: 0,
    waterPaidStatus: 'pending',
    actualElecBill: 0,
    elecPaidStatus: 'pending',
    actualGarbageBill: 0,
    garbagePaidStatus: 'pending',
    paidStatus: 'pending',
    notes: 'ยังไม่มีการระบุยอดบิลหลวง',
    updatedAt: '2026-08-01',
  },
];
