export type TenantNationality = 'TH' | 'MM' | 'OTHER';
export type LanguageOption = 'TH' | 'MY' | 'MM';
export type RoomStatus = 'vacant' | 'occupied' | 'maintenance';
export type BillStatus = 'pending' | 'paid' | 'overdue';

export interface Property {
  id: string;
  name: string;
  code: string;
  address: string;
  waterRatePerUnit: number;
  elecRatePerUnit: number;
  garbageFeePerRoom: number;
  promptPayId?: string;
  promptPayName?: string;
  peaCaNumber?: string; // 12-digit PEA Customer Account Number for automatic billing fetch
  lineChannelAccessToken?: string;
  lineChannelSecret?: string;
  description?: string;
}

export interface RoomZone {
  id: string;
  propertyId: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  name: string;
  description: string;
  baseRent: number;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  nationality: TenantNationality;
  phone: string;
  idCardPhotoUrl: string; // Base64 or Firebase Storage URL
  idCardPhotoFileName?: string;
  hasSecurityDeposit: boolean;
  securityDepositAmount: number;
  assignedRoomId?: string;
  preferredLanguage: LanguageOption;
  lineUserId?: string; // LINE Official Account User ID bound to room
  lineBoundAt?: string; // ISO string timestamp of binding
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  propertyId: string;
  zoneId: string;
  zoneCode: string;
  floor: number;
  buildingType: 'new' | 'old' | 'storefront';
  rentPrice: number;
  status: RoomStatus;
  currentTenantId?: string;
  waterMeterPrevious: number;
  elecMeterPrevious: number;
}

export interface MeterReading {
  id: string;
  propertyId: string;
  roomId: string;
  monthYear: string; // "2026-08"
  waterPrevious: number;
  waterCurrent: number;
  waterUnits: number;
  waterRate: number;
  waterAmount: number;
  elecPrevious: number;
  elecCurrent: number;
  elecUnits: number;
  elecRate: number;
  elecAmount: number;
  garbageFee: number;
  rentAmount: number;
  totalBill: number;
  recordedAt: string;
}

export interface MonthlyBill {
  id: string;
  propertyId: string;
  roomId: string;
  roomNumber: string;
  zoneCode: string;
  tenantId: string;
  tenantName: string;
  tenantNationality: TenantNationality;
  monthYear: string;
  rentAmount: number;
  waterPrevious?: number;
  waterCurrent?: number;
  waterUnits: number;
  waterAmount: number;
  elecPrevious?: number;
  elecCurrent?: number;
  elecUnits: number;
  elecAmount: number;
  garbageFee: number;
  totalAmount: number;
  status: BillStatus;
  receiptLanguage: LanguageOption;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
  notes?: string;
  lineSentStatus?: 'sent' | 'failed' | 'not_sent';
  lineSentAt?: string;
  lineDeliveryError?: string;
}

export interface LineDeliveryLog {
  id: string;
  billId: string;
  tenantId: string;
  roomNumber: string;
  lineUserId: string;
  language: LanguageOption;
  status: 'success' | 'failed' | 'skipped_no_line';
  sentAt: string;
  errorMessage?: string;
}

export interface LandlordUtilityExpense {
  id: string;
  propertyId: string;
  monthYear: string;
  // Water
  actualWaterBill: number;
  waterPaidStatus?: 'paid' | 'pending';
  waterPaidDate?: string;
  // Electricity PEA
  actualElecBill: number;
  elecPaidStatus?: 'paid' | 'pending';
  elecPaidDate?: string;
  // Garbage
  actualGarbageBill: number;
  garbagePaidStatus?: 'paid' | 'pending';
  garbagePaidDate?: string;

  paidStatus?: 'paid' | 'pending'; // Legacy fallback
  notes?: string;
  documentUrl?: string;
  updatedAt: string;
}
