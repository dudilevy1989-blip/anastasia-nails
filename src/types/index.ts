export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  totalSpent: number;
  totalVisits: number;
  lastVisit?: string;
  nextAppointment?: string;
  avatarColor?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  durationMinutes: number; // in minutes (e.g. 45, 60, 90)
  price: number; // in ILS
  description?: string;
  colorTag: string; // e.g. '#f43f5e', '#ec4899', '#d946ef', etc.
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "10:00")
  endTime: string; // HH:mm (e.g. "11:00")
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  reminderSent?: boolean;
  createdAt: string;
}

export interface DaySchedule {
  isOpen: boolean;
  start: string; // e.g. "09:00"
  end: string;   // e.g. "19:00"
  breakStart?: string; // e.g. "13:00"
  breakEnd?: string;   // e.g. "13:30"
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address?: string;
  currency: string; // '₪'
  workingHours: {
    [dayOfWeek: number]: DaySchedule; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  };
  vacationDates: string[]; // ['YYYY-MM-DD']
  reminderTemplate24h: string;
  reminderTemplate2h: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  user: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    photoURL?: string;
  } | null;
}

export type ActiveTab = 'dashboard' | 'calendar' | 'clients' | 'services' | 'schedule' | 'reminders' | 'reports';

export type AppMode = 'admin' | 'client';

export interface ClientSession {
  phone: string;
  name: string;
  clientId?: string;
  email?: string;
  photoURL?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
