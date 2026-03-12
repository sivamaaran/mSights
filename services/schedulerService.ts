import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type MaintenanceType =
  | 'A-Check'
  | 'B-Check'
  | 'C-Check'
  | 'D-Check'
  | 'Line Maintenance'
  | 'Engine Change'
  | 'AOG'
  | 'Other';

export type ScheduleStatus =
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

export interface MaintenanceSchedule {
  id?: string;
  aircraftId: string;
  aircraftReg: string;
  aircraftType: string;
  hangarId: string;
  hangarName: string;
  slotId: string;
  slotNumber: string;
  maintenanceType: MaintenanceType;
  status: ScheduleStatus;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  estimatedManHours: number;
  actualManHours?: number;
  assignedTeam: string;
  leadTechnician: string;
  description: string;
  workOrderNumber: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

const SCHEDULES_COLLECTION = 'schedules';

export const addSchedule = async (
  schedule: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, SCHEDULES_COLLECTION), {
    ...schedule,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateSchedule = async (
  id: string,
  data: Partial<MaintenanceSchedule>
): Promise<void> => {
  await updateDoc(doc(db, SCHEDULES_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, SCHEDULES_COLLECTION, id));
};

export const subscribeToSchedules = (
  callback: (schedules: MaintenanceSchedule[]) => void
): Unsubscribe => {
  return onSnapshot(
    query(collection(db, SCHEDULES_COLLECTION), orderBy('startDate', 'desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceSchedule)))
  );
};

export const subscribeToSchedulesByHangar = (
  hangarId: string,
  callback: (schedules: MaintenanceSchedule[]) => void
): Unsubscribe => {
  return onSnapshot(
    query(
      collection(db, SCHEDULES_COLLECTION),
      where('hangarId', '==', hangarId),
      orderBy('startDate', 'desc')
    ),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceSchedule)))
  );
};

export const subscribeToActiveSchedules = (
  callback: (schedules: MaintenanceSchedule[]) => void
): Unsubscribe => {
  return onSnapshot(
    query(
      collection(db, SCHEDULES_COLLECTION),
      where('status', 'in', ['scheduled', 'in-progress']),
      orderBy('startDate', 'asc')
    ),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceSchedule)))
  );
};
