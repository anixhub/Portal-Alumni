export interface AlumniRecord {
  id: string;
  nik: string;
  noKk?: string;
  nis: string;
  name: string;
  username?: string;
  gender: 'L' | 'P';
  gradYear: string;
  entryYear: string;
  jenjang: string;
  asramaDulu: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  kecamatan?: string;
  desa?: string;
  alamatLengkap?: string;
  coordinates?: { lat: number; lng: number } | null;
  occupation: string;
  institution: string;
  password: string; // default '1234'
  isPasswordChanged: boolean;
  source: 'hostinger_sync' | 'manual_admin';
  syncTime: string;
  bio?: string;
  photoUrl?: string;
  shareContact: boolean;
  status: 'alumni' | 'santri_aktif';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'pengurus_pondok';
  jabatan: string;
  avatar?: string;
}

export interface EventAgenda {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'reuni' | 'haul' | 'kajian' | 'korda';
  description: string;
  attendeesCount: number;
  userRsvp?: 'hadir' | 'belum_pasti' | 'tidak_hadir';
}

export type UserRole = 'alumni' | 'admin';

export interface ActiveSession {
  role: UserRole;
  alumniData?: AlumniRecord;
  adminData?: AdminUser;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  gradYear: string;
  majorOrProgram: string;
  password: string;
  confirmPassword: string;
}
