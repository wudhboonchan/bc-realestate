'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Property,
  RoomZone,
  Room,
  Tenant,
  MeterReading,
  MonthlyBill,
  LandlordUtilityExpense,
  LanguageOption,
  LineDeliveryLog,
} from '@/types';
import {
  initialProperty,
  initialZones,
  initialRooms,
  initialTenants,
  initialMeterReadings,
  initialBills,
  initialLandlordExpenses,
} from '@/lib/mockData';
import { db, saveToFirestore } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface PropertyContextType {
  property: Property;
  zones: RoomZone[];
  rooms: Room[];
  tenants: Tenant[];
  meterReadings: MeterReading[];
  bills: MonthlyBill[];
  landlordExpenses: LandlordUtilityExpense[];
  lineDeliveryLogs: LineDeliveryLog[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  // Actions
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenant: (id: string, updated: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  bindTenantLineUser: (tenantId: string, lineUserId: string, preferredLanguage?: LanguageOption) => void;
  saveMeterReading: (reading: Omit<MeterReading, 'id' | 'recordedAt'>) => void;
  updateBillStatus: (billId: string, status: 'pending' | 'paid' | 'overdue', paidAt?: string) => void;
  updateBillLanguage: (billId: string, lang: LanguageOption) => void;
  saveLandlordExpense: (expense: Omit<LandlordUtilityExpense, 'id' | 'updatedAt'>) => void;
  addZone: (zone: Omit<RoomZone, 'id'>) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updatePropertyRates: (rates: {
    waterRatePerUnit: number;
    elecRatePerUnit: number;
    garbageFeePerRoom: number;
    peaCaNumber?: string;
    promptPayId?: string;
    promptPayName?: string;
    lineChannelAccessToken?: string;
    lineChannelSecret?: string;
  }) => void;
  sendInvoiceViaLine: (billId: string) => Promise<{ success: boolean; message: string }>;
  sendAllInvoicesViaLine: (monthYear?: string) => Promise<{ success: boolean; count: number; message: string }>;
  resetToDefaultData: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bc_realestate_state_v15';

const ALL_PREVIOUS_KEYS = [
  'bc_realestate_state_v15',
  'bc_realestate_state_v14',
  'bc_realestate_state_v13',
  'bc_realestate_state_v12',
  'bc_realestate_state_v11',
  'bc_realestate_state_v10',
  'bc_realestate_state_v9',
  'bc_realestate_state_v8',
  'bc_realestate_state_v7',
  'bc_realestate_state_v6',
  'bc_realestate_state_v5',
  'bc_realestate_state_v4',
  'bc_realestate_state_v3',
  'bc_realestate_state_v2',
  'bc_realestate_state_v1',
];

const REAL_ADDRESS = '75 หมู่ 2 ถ.สุดบรรทัด ต.ตาลเดี่ยว อ.แก่งคอย จ.สระบุรี 18110';
const REAL_ACCOUNT_NAME = 'กนกกชกร เกียรติวีระสกุล';
const REAL_PROMPTPAY_ID = '3190200356040';

// Helper to format invoice ID as INV-YYYYMMA1 e.g. INV-202608A1
function formatInvoiceId(monthYear: string, roomNumber: string): string {
  const cleanMonth = (monthYear || '2026-08').replace('-', '');
  return `INV-${cleanMonth}${roomNumber}`;
}

// Helper to format meter reading ID as MR-YYYYMMA1 e.g. MR-202608A1
function formatMeterReadingId(monthYear: string, roomNumber: string): string {
  const cleanMonth = (monthYear || '2026-08').replace('-', '');
  return `MR-${cleanMonth}${roomNumber}`;
}

// Strict Deduplication & Orphan Filter helper
function sanitizeBills(billsList: MonthlyBill[], tenantList: Tenant[]): MonthlyBill[] {
  const map = new Map<string, MonthlyBill>();
  for (const b of billsList) {
    if (!b || !b.roomNumber) continue;

    // STRICT CHECK: Only keep bill if associated with an existing active tenant in tenantList!
    const hasActiveTenant = tenantList.some(
      (t) => (t.id && t.id === b.tenantId) || t.assignedRoomId === b.roomId
    );
    if (!hasActiveTenant) continue; // Purge stale/vacant/orphan bills (e.g. E5)

    const cleanId = formatInvoiceId(b.monthYear, b.roomNumber);
    const key = `${b.roomNumber}-${b.monthYear}`;
    map.set(key, { ...b, id: cleanId });
  }
  return Array.from(map.values());
}

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [property, setProperty] = useState<Property>({
    ...initialProperty,
    address: REAL_ADDRESS,
    promptPayId: REAL_PROMPTPAY_ID,
    promptPayName: REAL_ACCOUNT_NAME,
    peaCaNumber: initialProperty.peaCaNumber || '',
  });
  const [zones, setZones] = useState<RoomZone[]>(initialZones);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(initialMeterReadings);
  const [bills, setBills] = useState<MonthlyBill[]>(sanitizeBills(initialBills, initialTenants));
  const [landlordExpenses, setLandlordExpenses] = useState<LandlordUtilityExpense[]>(initialLandlordExpenses);
  const [lineDeliveryLogs, setLineDeliveryLogs] = useState<LineDeliveryLog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial setup & LocalStorage load with safe migration and Firestore synchronization
  useEffect(() => {
    try {
      let loadedData: any = null;

      // Scan through current and all previous keys to recover user-saved state
      for (const key of ALL_PREVIOUS_KEYS) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            loadedData = JSON.parse(saved);
            break;
          } catch (err) {
            console.error(`Failed to parse storage key ${key}`, err);
          }
        }
      }

      if (loadedData) {
        if (loadedData.property) {
          setProperty((prev) => ({
            ...prev,
            ...loadedData.property,
            address: REAL_ADDRESS,
            promptPayId: loadedData.property.promptPayId || REAL_PROMPTPAY_ID,
            promptPayName: loadedData.property.promptPayName || REAL_ACCOUNT_NAME,
            peaCaNumber: loadedData.property.peaCaNumber !== undefined ? loadedData.property.peaCaNumber : (prev.peaCaNumber || ''),
          }));
        }
        if (loadedData.zones) setZones(loadedData.zones);
        if (loadedData.rooms) setRooms(loadedData.rooms);
        if (loadedData.tenants) setTenants(loadedData.tenants);
        if (loadedData.meterReadings) setMeterReadings(loadedData.meterReadings);
        if (loadedData.lineDeliveryLogs) setLineDeliveryLogs(loadedData.lineDeliveryLogs);
        if (loadedData.landlordExpenses) {
          const sanitizedExp = loadedData.landlordExpenses.map((exp: any) => {
            let elec = exp.actualElecBill;
            let water = exp.actualWaterBill;
            let garbage = exp.actualGarbageBill;
            if (elec === 560 || elec === 4800) elec = 0;
            if (water === 450) water = 0;
            if (garbage === 100) garbage = 0;
            return {
              ...exp,
              actualElecBill: elec,
              actualWaterBill: water,
              actualGarbageBill: garbage,
            };
          });
          setLandlordExpenses(sanitizedExp);
        }
        if (loadedData.selectedMonth) setSelectedMonth(loadedData.selectedMonth);

        const currentTenants = loadedData.tenants || initialTenants;
        if (loadedData.bills) {
          setBills(sanitizeBills(loadedData.bills, currentTenants));
        }
      }
    } catch (e) {
      console.error('Failed to load local storage state', e);
    } finally {
      setIsLoaded(true);
    }

    // Subscribe to live Firestore changes with error boundary guards
    try {
      if (db) {
        const unsubRooms = onSnapshot(
          collection(db, 'rooms'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteRooms: Room[] = [];
              snapshot.forEach((doc) => remoteRooms.push(doc.data() as Room));
              if (remoteRooms.some((r) => r.roomNumber === 'A1')) {
                setRooms(remoteRooms);
              }
            }
          },
          (error) => console.info('Rooms listener notice:', error.message)
        );

        const unsubTenants = onSnapshot(
          collection(db, 'tenants'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteTenants: Tenant[] = [];
              snapshot.forEach((doc) => remoteTenants.push(doc.data() as Tenant));
              setTenants(remoteTenants);
            }
          },
          (error) => console.info('Tenants listener notice:', error.message)
        );

        const unsubBills = onSnapshot(
          collection(db, 'bills'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteBills: MonthlyBill[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data() as MonthlyBill;
                if (data && data.roomNumber) {
                  const cleanId = formatInvoiceId(data.monthYear, data.roomNumber);
                  remoteBills.push({
                    ...data,
                    id: cleanId,
                  });
                }
              });
              setBills((prevBills) => sanitizeBills(remoteBills, tenants));
            }
          },
          (error) => console.info('Bills listener notice:', error.message)
        );

        return () => {
          unsubRooms();
          unsubTenants();
          unsubBills();
        };
      }
    } catch (e) {
      console.info('Firestore live listener notice:', e);
    }
  }, []);

  // Save state to LocalStorage (Always sanitized & preserved)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const cleanBills = sanitizeBills(bills, tenants);

      const stateToSave = {
        property: {
          ...property,
          address: REAL_ADDRESS,
          promptPayId: property.promptPayId || REAL_PROMPTPAY_ID,
          promptPayName: property.promptPayName || REAL_ACCOUNT_NAME,
        },
        zones,
        rooms,
        tenants,
        meterReadings,
        bills: cleanBills,
        landlordExpenses,
        lineDeliveryLogs,
        selectedMonth,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [property, zones, rooms, tenants, meterReadings, bills, landlordExpenses, lineDeliveryLogs, selectedMonth, isLoaded]);

  // Action Handlers
  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants((prev) => [...prev, newTenant]);
    saveToFirestore('tenants', newTenant);

    if (newTenant.assignedRoomId) {
      setRooms((prevRooms) =>
        prevRooms.map((r) => {
          if (r.id === newTenant.assignedRoomId) {
            const updatedRoom = { ...r, status: 'occupied' as const, currentTenantId: newId };
            saveToFirestore('rooms', updatedRoom);
            return updatedRoom;
          }
          return r;
        })
      );
    }
  };

  const updateTenant = (id: string, updated: Partial<Tenant>) => {
    let updatedTenantObj: Tenant | undefined;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTenantObj = { ...t, ...updated };
          saveToFirestore('tenants', updatedTenantObj);
          return updatedTenantObj;
        }
        return t;
      })
    );

    if (updated.assignedRoomId !== undefined) {
      setRooms((prevRooms) =>
        prevRooms.map((r) => {
          if (r.currentTenantId === id && r.id !== updated.assignedRoomId) {
            const updatedRoom = { ...r, status: 'vacant' as const, currentTenantId: undefined };
            saveToFirestore('rooms', updatedRoom);
            return updatedRoom;
          }
          if (r.id === updated.assignedRoomId) {
            const updatedRoom = { ...r, status: 'occupied' as const, currentTenantId: id };
            saveToFirestore('rooms', updatedRoom);
            return updatedRoom;
          }
          return r;
        })
      );
    }
  };

  const deleteTenant = (id: string) => {
    setTenants((prev) => {
      const nextTenants = prev.filter((t) => t.id !== id);
      setBills((prevBills) => sanitizeBills(prevBills.filter((b) => b.tenantId !== id), nextTenants));
      return nextTenants;
    });

    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.currentTenantId === id) {
          const updatedRoom = { ...r, status: 'vacant' as const, currentTenantId: undefined };
          saveToFirestore('rooms', updatedRoom);
          return updatedRoom;
        }
        return r;
      })
    );
  };

  const saveMeterReading = (readingData: Omit<MeterReading, 'id' | 'recordedAt'>) => {
    const targetRoom = rooms.find((r) => r.id === readingData.roomId);
    const roomNo = targetRoom?.roomNumber || '';

    const mrId = formatMeterReadingId(readingData.monthYear, roomNo);
    const newReading: MeterReading = {
      ...readingData,
      id: mrId,
      recordedAt: new Date().toISOString().split('T')[0],
    };

    setMeterReadings((prev) => {
      const idx = prev.findIndex((m) => m.roomId === readingData.roomId && m.monthYear === readingData.monthYear);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newReading;
        return next;
      }
      return [...prev, newReading];
    });

    saveToFirestore('meter_readings', newReading);

    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === readingData.roomId) {
          const updatedRoom = {
            ...r,
            waterMeterPrevious: readingData.waterCurrent,
            elecMeterPrevious: readingData.elecCurrent,
          };
          saveToFirestore('rooms', updatedRoom);
          return updatedRoom;
        }
        return r;
      })
    );

    const targetTenant = tenants.find((t) => t.id === targetRoom?.currentTenantId || t.assignedRoomId === targetRoom?.id);

    // Only create bill if room has an active tenant
    if (!targetTenant) return;

    const billId = formatInvoiceId(readingData.monthYear, roomNo);

    const newBill: MonthlyBill = {
      id: billId,
      propertyId: readingData.propertyId,
      roomId: readingData.roomId,
      roomNumber: roomNo,
      zoneCode: targetRoom?.zoneCode || '',
      tenantId: targetTenant.id,
      tenantName: `${targetTenant.firstName} ${targetTenant.lastName}`,
      tenantNationality: targetTenant.nationality || 'TH',
      monthYear: readingData.monthYear,
      rentAmount: readingData.rentAmount,
      waterPrevious: readingData.waterPrevious,
      waterCurrent: readingData.waterCurrent,
      waterUnits: readingData.waterUnits,
      waterAmount: readingData.waterAmount,
      elecPrevious: readingData.elecPrevious,
      elecCurrent: readingData.elecCurrent,
      elecUnits: readingData.elecUnits,
      elecAmount: readingData.elecAmount,
      garbageFee: readingData.garbageFee,
      totalAmount: readingData.totalBill,
      status: 'pending',
      receiptLanguage: targetTenant.preferredLanguage || 'TH',
      dueDate: `${readingData.monthYear}-05`,
      issuedAt: new Date().toISOString().split('T')[0],
    };

    setBills((prevBills) => {
      const idx = prevBills.findIndex((b) => b.roomNumber === roomNo && b.monthYear === readingData.monthYear);
      let updated: MonthlyBill[];
      if (idx >= 0) {
        updated = [...prevBills];
        updated[idx] = { ...updated[idx], ...newBill, id: billId, status: updated[idx].status };
      } else {
        updated = [...prevBills, newBill];
      }
      const cleaned = sanitizeBills(updated, tenants);
      saveToFirestore('bills', newBill);
      return cleaned;
    });
  };

  const updateBillStatus = (billId: string, status: 'pending' | 'paid' | 'overdue', paidAt?: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const updatedBill = {
            ...b,
            status,
            paidAt: status === 'paid' ? paidAt || new Date().toISOString().split('T')[0] : undefined,
          };
          saveToFirestore('bills', updatedBill);
          return updatedBill;
        }
        return b;
      })
    );
  };

  const updateBillLanguage = (billId: string, lang: LanguageOption) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const updatedBill = { ...b, receiptLanguage: lang };
          saveToFirestore('bills', updatedBill);
          return updatedBill;
        }
        return b;
      })
    );
  };

  const saveLandlordExpense = (expenseData: Omit<LandlordUtilityExpense, 'id' | 'updatedAt'>) => {
    const id = `exp-${expenseData.monthYear}`;
    const newExp: LandlordUtilityExpense = {
      ...expenseData,
      id,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setLandlordExpenses((prev) => {
      const idx = prev.findIndex((e) => e.monthYear === expenseData.monthYear);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newExp;
        return copy;
      }
      return [...prev, newExp];
    });

    saveToFirestore('landlord_expenses', newExp);
  };

  const addZone = (zoneData: Omit<RoomZone, 'id'>) => {
    const id = `zone-${Date.now()}`;
    const newZone: RoomZone = { ...zoneData, id };
    setZones((prev) => [...prev, newZone]);
    saveToFirestore('zones', newZone);
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const id = `r-${Date.now()}`;
    const newRoom: Room = { ...roomData, id };
    setRooms((prev) => [...prev, newRoom]);
    saveToFirestore('rooms', newRoom);
  };

  const updatePropertyRates = (rates: {
    waterRatePerUnit: number;
    elecRatePerUnit: number;
    garbageFeePerRoom: number;
    peaCaNumber?: string;
    promptPayId?: string;
    promptPayName?: string;
    lineChannelAccessToken?: string;
    lineChannelSecret?: string;
  }) => {
    setProperty((prev) => {
      const updated = {
        ...prev,
        ...rates,
        address: REAL_ADDRESS,
        promptPayId: rates.promptPayId || REAL_PROMPTPAY_ID,
        promptPayName: rates.promptPayName || REAL_ACCOUNT_NAME,
        peaCaNumber: rates.peaCaNumber !== undefined ? rates.peaCaNumber : (prev.peaCaNumber || ''),
        lineChannelAccessToken: rates.lineChannelAccessToken !== undefined ? rates.lineChannelAccessToken : (prev.lineChannelAccessToken || ''),
        lineChannelSecret: rates.lineChannelSecret !== undefined ? rates.lineChannelSecret : (prev.lineChannelSecret || ''),
      };
      saveToFirestore('properties', updated);
      return updated;
    });
  };

  const bindTenantLineUser = (tenantId: string, lineUserId: string, preferredLanguage?: LanguageOption) => {
    updateTenant(tenantId, {
      lineUserId,
      lineBoundAt: new Date().toISOString(),
      ...(preferredLanguage ? { preferredLanguage } : {}),
    });
  };

  const sendInvoiceViaLine = async (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) {
      return { success: false, message: 'ไม่พบใบแจ้งหนี้ที่ระบุ' };
    }

    try {
      const res = await fetch('/api/line/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bills: [targetBill],
          tenants,
          propertyName: property.name,
          channelAccessToken: property.lineChannelAccessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.logs && data.logs.length > 0) {
          setLineDeliveryLogs((prev) => [...data.logs, ...prev]);
        }
        if (data.updatedBills && data.updatedBills.length > 0) {
          const updateInfo = data.updatedBills[0];
          setBills((prev) =>
            prev.map((b) =>
              b.id === billId
                ? {
                    ...b,
                    lineSentStatus: updateInfo.status,
                    lineSentAt: updateInfo.sentAt,
                    lineDeliveryError: updateInfo.error,
                  }
                : b
            )
          );
        }
        return { success: true, message: data.message || 'ส่งใบแจ้งหนี้เรียบร้อยแล้ว' };
      } else {
        return { success: false, message: data.error || 'เกิดข้อผิดพลาดในการส่งใบแจ้งหนี้' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'ไม่สามารถเชื่อมต่อระบบส่งข้อความได้' };
    }
  };

  const sendAllInvoicesViaLine = async (monthYear?: string) => {
    const targetMonth = monthYear || selectedMonth;
    const currentBills = bills.filter((b) => b.monthYear === targetMonth);

    if (currentBills.length === 0) {
      return { success: false, count: 0, message: `ไม่พบใบแจ้งหนี้ประจำเดือน ${targetMonth}` };
    }

    try {
      const res = await fetch('/api/line/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bills: currentBills,
          tenants,
          propertyName: property.name,
          channelAccessToken: property.lineChannelAccessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.logs) {
          setLineDeliveryLogs((prev) => [...data.logs, ...prev]);
        }
        if (data.updatedBills) {
          const mapUpdates = new Map(data.updatedBills.map((u: any) => [u.billId, u]));
          setBills((prev) =>
            prev.map((b) => {
              if (mapUpdates.has(b.id)) {
                const u: any = mapUpdates.get(b.id);
                return {
                  ...b,
                  lineSentStatus: u.status,
                  lineSentAt: u.sentAt,
                  lineDeliveryError: u.error,
                };
              }
              return b;
            })
          );
        }
        const successCount = data.logs?.filter((l: any) => l.status === 'success').length || 0;
        return {
          success: true,
          count: successCount,
          message: data.message || `ส่งใบแจ้งหนี้เสร็จสิ้น ${successCount} จาก ${currentBills.length} ใบ`,
        };
      } else {
        return { success: false, count: 0, message: data.error || 'เกิดข้อผิดพลาดในการส่งบิล' };
      }
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' };
    }
  };

  const resetToDefaultData = () => {
    setProperty({
      ...initialProperty,
      address: REAL_ADDRESS,
      promptPayId: REAL_PROMPTPAY_ID,
      promptPayName: REAL_ACCOUNT_NAME,
      peaCaNumber: '',
    });
    setZones(initialZones);
    setRooms(initialRooms);
    setTenants(initialTenants);
    setMeterReadings(initialMeterReadings);
    setBills(sanitizeBills(initialBills, initialTenants));
    setLandlordExpenses(initialLandlordExpenses);
    setLineDeliveryLogs([]);
    setSelectedMonth('2026-08');
    for (const key of ALL_PREVIOUS_KEYS) {
      localStorage.removeItem(key);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        property: {
          ...property,
          address: REAL_ADDRESS,
          promptPayId: property.promptPayId || REAL_PROMPTPAY_ID,
          promptPayName: property.promptPayName || REAL_ACCOUNT_NAME,
          peaCaNumber: property.peaCaNumber ?? '',
        },
        zones,
        rooms,
        tenants,
        meterReadings,
        bills: sanitizeBills(bills, tenants),
        landlordExpenses,
        lineDeliveryLogs,
        selectedMonth,
        setSelectedMonth,
        addTenant,
        updateTenant,
        deleteTenant,
        bindTenantLineUser,
        saveMeterReading,
        updateBillStatus,
        updateBillLanguage,
        saveLandlordExpense,
        addZone,
        addRoom,
        updatePropertyRates,
        sendInvoiceViaLine,
        sendAllInvoicesViaLine,
        resetToDefaultData,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
