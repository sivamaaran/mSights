import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'planner' | 'technician' | 'viewer';
  station: string;
  createdAt: any;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserProfile['role'] = 'planner',
  station: string = ''
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const profile: UserProfile = {
    uid: credential.user.uid,
    email,
    displayName,
    role,
    station,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', credential.user.uid), profile);
  return credential.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};
