import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Hangar {
  id?: string;
  name: string;
  code: string;
  station: string;
  totalSlots: number;
  description: string;
  status: 'operational' | 'maintenance' | 'closed';
  createdAt?: any;
  updatedAt?: any;
}

export interface HangarSlot {
  id?: string;
  hangarId: string;
  slotNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  maxAircraftType: string;
  notes: string;
  createdAt?: any;
  updatedAt?: any;
}

const HANGARS_COLLECTION = 'hangars';
const SLOTS_COLLECTION = 'slots';

export const addHangar = async (hangar: Omit<Hangar, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, HANGARS_COLLECTION), {
    ...hangar,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateHangar = async (id: string, data: Partial<Hangar>): Promise<void> => {
  await updateDoc(doc(db, HANGARS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteHangar = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, HANGARS_COLLECTION, id));
};

export const getHangars = async (): Promise<Hangar[]> => {
  const snap = await getDocs(query(collection(db, HANGARS_COLLECTION), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Hangar));
};

export const subscribeToHangars = (callback: (hangars: Hangar[]) => void): Unsubscribe => {
  return onSnapshot(
    query(collection(db, HANGARS_COLLECTION), orderBy('name')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Hangar)))
  );
};

export const addSlot = async (slot: Omit<HangarSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, SLOTS_COLLECTION), {
    ...slot,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateSlot = async (id: string, data: Partial<HangarSlot>): Promise<void> => {
  await updateDoc(doc(db, SLOTS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToSlots = (hangarId: string, callback: (slots: HangarSlot[]) => void): Unsubscribe => {
  const { where } = require('firebase/firestore');
  return onSnapshot(
    query(collection(db, SLOTS_COLLECTION), where('hangarId', '==', hangarId)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as HangarSlot)))
  );
};
