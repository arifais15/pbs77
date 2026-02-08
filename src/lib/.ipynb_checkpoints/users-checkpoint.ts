
export interface User {
  id: string; // Document ID from Firestore
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}
