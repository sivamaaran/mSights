import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Aircraft {
  id?: string;
  registration: string;
  type: string;
  series: string;
  airline: string;
  manufacturer: string;
  yearOfManufacture: number;
  msn: string; // Manufacturer Serial Number
  engineType: string;
  status: 'active' | 'in-maintenance' | 'aog' | 'retired';
  lastMaintenance?: any;
  nextScheduledMaintenance?: any;
  totalFlightHours: number;
  totalCycles: number;
  notes: string;
  createdAt?: any;
  updatedAt?: any;
}

const AIRCRAFT_COLLECTION = 'aircraft';

export const addAircraft = async (
  aircraft: Omit<Aircraft, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, AIRCRAFT_COLLECTION), {
    ...aircraft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateAircraft = async (id: string, data: Partial<Aircraft>): Promise<void> => {
  await updateDoc(doc(db, AIRCRAFT_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteAircraft = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, AIRCRAFT_COLLECTION, id));
};

export const subscribeToAircraft = (callback: (aircraft: Aircraft[]) => void): Unsubscribe => {
  return onSnapshot(
    query(collection(db, AIRCRAFT_COLLECTION), orderBy('registration')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Aircraft)))
  );
};
