import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Client,
  ServiceItem,
  Appointment,
  BusinessSettings,
  UserSession,
  ActiveTab,
  ToastNotification,
  AppointmentStatus,
  AppMode,
  ClientSession,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { checkCollision } from '../utils/dateUtils';

function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

interface AppContextType {
  // Navigation & Session
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  session: UserSession;
  login: (phoneOrEmail: string, isDemo?: boolean) => boolean;
  loginWithGoogle: () => Promise<boolean>;
  register: (businessName: string, ownerName: string, phone: string, email: string) => boolean;
  logout: () => void;

  // Client Portal Session
  clientSession: ClientSession | null;
  clientLogin: (phone: string, name?: string) => boolean;
  clientLoginWithGoogle: () => Promise<boolean>;
  clientLogout: () => void;

  // Data
  clients: Client[];
  services: ServiceItem[];
  appointments: Appointment[];
  settings: BusinessSettings;

  // CRUD Operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalSpent' | 'totalVisits'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addService: (service: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => { success: boolean; error?: string; appointment?: Appointment };
  updateAppointment: (id: string, updates: Partial<Appointment>) => { success: boolean; error?: string };
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateSettings: (updates: Partial<BusinessSettings>) => void;

  // Appointment Modal state
  isAppointmentModalOpen: boolean;
  editingAppointment: Appointment | null;
  defaultDateForNewAppointment?: string;
  defaultTimeForNewAppointment?: string;
  openNewAppointmentModal: (defaultDate?: string, defaultTime?: string) => void;
  openEditAppointmentModal: (appointment: Appointment) => void;
  closeAppointmentModal: () => void;

  // Client Details Modal state
  viewingClientId: string | null;
  openClientModal: (clientId: string) => void;
  closeClientModal: () => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'nail_studio_clients_v1',
  SERVICES: 'nail_studio_services_v1',
  APPOINTMENTS: 'nail_studio_appointments_v1',
  SETTINGS: 'nail_studio_settings_v1',
  SESSION: 'nail_studio_session_v1',
  APP_MODE: 'nail_studio_app_mode_v1',
  CLIENT_SESSION: 'nail_studio_client_session_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL parameters for direct client portal access (?mode=client or ?portal=client)
  const initialMode = (): AppMode => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'client' || params.get('portal') === 'client') {
        return 'client';
      }
      const savedMode = localStorage.getItem(STORAGE_KEYS.APP_MODE);
      if (savedMode === 'client' || savedMode === 'admin') return savedMode;
    } catch {
      // ignore
    }
    return 'admin';
  };

  const [appMode, setAppModeState] = useState<AppMode>(initialMode);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    localStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
  };

  // Client Portal Session
  const [clientSession, setClientSession] = useState<ClientSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (clientSession) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_SESSION, JSON.stringify(clientSession));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_SESSION);
    }
  }, [clientSession]);

  // Session State
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user && (parsed.user.businessName === 'Glam Nails Boutique' || !parsed.user.businessName)) {
          parsed.user.businessName = INITIAL_SETTINGS.businessName;
          parsed.user.ownerName = INITIAL_SETTINGS.ownerName;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      isLoggedIn: true, // Default to logged in so user sees app immediately
      user: {
        id: 'usr-1',
        businessName: INITIAL_SETTINGS.businessName,
        ownerName: INITIAL_SETTINGS.ownerName,
        email: INITIAL_SETTINGS.email,
        phone: INITIAL_SETTINGS.phone,
      },
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data with localStorage persistence
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CLIENTS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_APPOINTMENTS;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName === 'Glam Nails Boutique' || !parsed.businessName) {
          parsed.businessName = INITIAL_SETTINGS.businessName;
          parsed.ownerName = INITIAL_SETTINGS.ownerName;
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [defaultDateForNewAppointment, setDefaultDateForNewAppointment] = useState<string | undefined>();
  const [defaultTimeForNewAppointment, setDefaultTimeForNewAppointment] = useState<string | undefined>();
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Real-time Firestore synchronization across all devices
  useEffect(() => {
    const unsubApts = onSnapshot(
      collection(db, 'appointments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Appointment[];
          setAppointments(loaded);
        } else {
          INITIAL_APPOINTMENTS.forEach((apt) => {
            setDoc(doc(db, 'appointments', apt.id), sanitizeForFirestore(apt)).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, 'appointments')
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'appointments');
      }
    );

    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as ServiceItem[];
          setServices(loaded);
        } else {
          INITIAL_SERVICES.forEach((srv) => {
            setDoc(doc(db, 'services', srv.id), sanitizeForFirestore(srv)).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, 'services')
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'services');
      }
    );

    const unsubClients = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Client[];
          setClients(loaded);
        } else {
          INITIAL_CLIENTS.forEach((cl) => {
            setDoc(doc(db, 'clients', cl.id), sanitizeForFirestore(cl)).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, 'clients')
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'clients');
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          const loaded = snapshot.data() as BusinessSettings;
          setSettings(loaded);
        } else {
          setDoc(doc(db, 'settings', 'main'), sanitizeForFirestore(INITIAL_SETTINGS)).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, 'settings/main')
          );
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/main');
      }
    );

    return () => {
      unsubApts();
      unsubServices();
      unsubClients();
      unsubSettings();
    };
  }, []);

  // Toast Helpers
  const addToast = (type: ToastNotification['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth operations
  const login = (phoneOrEmail: string, isDemo: boolean = false): boolean => {
    if (isDemo) {
      setSession({
        isLoggedIn: true,
        user: {
          id: 'usr-1',
          businessName: settings.businessName || 'Anastasia Nails',
          ownerName: settings.ownerName || 'אנסטסיה',
          email: 'anastasia@nails.co.il',
          phone: '054-7778899',
        },
      });
      addToast('success', 'התחברת בהצלחה!', `ברוכה הבאה לעסק שלך`);
      return true;
    }

    const trimmed = phoneOrEmail.trim();
    if (!trimmed) {
      addToast('error', 'שגיאה בהתחברות', 'אנא הזיני מספר טלפון או כתובת אימייל');
      return false;
    }

    const isEmail = trimmed.includes('@');
    const digitsOnly = trimmed.replace(/\D/g, '');

    // Validate email format
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        addToast('error', 'כתובת אימייל לא תקינה', 'אנא הזיני כתובת אימייל בפורמט תקין');
        return false;
      }
    } else {
      // Validate phone length (Israeli phone: 9-10 digits)
      if (digitsOnly.length < 9 || digitsOnly.length > 11) {
        addToast('error', 'מספר טלפון שגוי', 'מספר הטלפון שהוזן אינו תקין (נדרשות 9-10 ספרות)');
        return false;
      }
    }

    setSession({
      isLoggedIn: true,
      user: {
        id: 'usr-1',
        businessName: settings.businessName || 'Anastasia Nails',
        ownerName: settings.ownerName || 'אנסטסיה',
        email: isEmail ? trimmed : (settings.email || 'anastasia@nails.co.il'),
        phone: !isEmail ? trimmed : (settings.phone || '054-7778899'),
      },
    });
    setActiveTab('dashboard');
    addToast('success', 'התחברת בהצלחה!', `ברוכה הבאה לעסק שלך`);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || settings.ownerName || 'אנסטסיה';
      const email = user.email || 'user@gmail.com';
      const photoURL = user.photoURL || undefined;

      setSession({
        isLoggedIn: true,
        user: {
          id: user.uid,
          businessName: settings.businessName || 'Anastasia Nails',
          ownerName: displayName,
          email: email,
          phone: user.phoneNumber || settings.phone || '054-7778899',
          photoURL,
        },
      });

      // Update settings email/owner if not already set
      if (!settings.email || settings.email.includes('example.com')) {
        setSettings((prev) => ({
          ...prev,
          email,
          ownerName: displayName,
        }));
      }

      setAppMode('admin');
      setActiveTab('dashboard');
      addToast('success', `התחברת בהצלחה עם Google! ✨`, `שלום ${displayName}, מועברת לדף הבית`);
      return true;
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        addToast('info', 'ההתחברות בוטלה', 'חלון ההתחברות נסגר על ידי המשתמש');
      } else {
        addToast('error', 'שגיאה בהתחברות עם Google', error?.message || 'אנא נסי שוב מאוחר יותר');
      }
      return false;
    }
  };

  const register = (businessName: string, ownerName: string, phone: string, email: string): boolean => {
    if (!businessName || !ownerName || !phone) {
      addToast('error', 'פרטים חסרים', 'אנא מלאי את כל שדות החובה');
      return false;
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      businessName,
      ownerName,
      phone,
      email,
    };
    setSession({
      isLoggedIn: true,
      user: newUser,
    });
    setSettings((prev) => ({
      ...prev,
      businessName,
      ownerName,
      phone,
      email,
    }));
    setActiveTab('dashboard');
    addToast('success', 'העסק נרשם בהצלחה!', `ברוכה הבאה, ${ownerName}`);
    return true;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setSession({ isLoggedIn: false, user: null });
    addToast('info', 'התנתקת מהמערכת', 'להתראות!');
  };

  const clientLoginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const displayName = user.displayName || 'לקוחה יקרה';
      const email = user.email || '';
      const phone = user.phoneNumber || '';

      // Check if client exists by email or phone
      let matchedClient = clients.find((c) => c.email && email && c.email.toLowerCase() === email.toLowerCase());
      if (!matchedClient && phone) {
        const digits = phone.replace(/\D/g, '');
        matchedClient = clients.find((c) => c.phone.replace(/\D/g, '') === digits);
      }

      let clientId = matchedClient?.id;
      if (!matchedClient) {
        const avatarColors = [
          'bg-rose-100 text-rose-700',
          'bg-pink-100 text-pink-700',
          'bg-amber-100 text-amber-800',
          'bg-purple-100 text-purple-700',
          'bg-emerald-100 text-emerald-700',
        ];
        const newClient: Client = {
          id: `cl-${Date.now()}`,
          fullName: displayName,
          phone: phone || '050-0000000',
          email: email,
          createdAt: new Date().toISOString().split('T')[0],
          totalSpent: 0,
          totalVisits: 0,
          avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
        };
        clientId = newClient.id;
        setClients((prev) => [newClient, ...prev]);
        setDoc(doc(db, 'clients', newClient.id), sanitizeForFirestore(newClient)).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, `clients/${newClient.id}`)
        );
      }

      const sess: ClientSession = {
        phone: matchedClient?.phone || phone || '050-0000000',
        name: displayName,
        clientId,
        email,
        photoURL: user.photoURL || undefined,
      };

      setClientSession(sess);
      setAppMode('client');
      addToast('success', `שלום ${displayName}! ✨`, 'התחברת בהצלחה עם Google');
      return true;
    } catch (error: any) {
      console.error('Client Google Sign In error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        addToast('info', 'ההתחברות בוטלה', 'חלון ההתחברות נסגר');
      } else {
        addToast('error', 'שגיאה בהתחברות עם Google', error?.message || 'אנא נסי שוב');
      }
      return false;
    }
  };

  const clientLogin = (phone: string, name?: string): boolean => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      addToast('error', 'מספר טלפון חסר', 'אנא הזיני מספר טלפון תקין');
      return false;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    const existing = clients.find((c) => c.phone.replace(/\D/g, '') === digitsOnly);
    if (existing) {
      const sess: ClientSession = {
        phone: existing.phone,
        name: existing.fullName,
        clientId: existing.id,
      };
      setClientSession(sess);
      setAppMode('client');
      addToast('success', `שלום ${existing.fullName}! ✨`, 'ברוכה הבאה לאזור האישי');
      return true;
    }

    const clientName = name?.trim() || 'לקוחה חדשה';
    const avatarColors = [
      'bg-rose-100 text-rose-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-800',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
    ];
    const newClient: Client = {
      fullName: clientName,
      phone: cleanPhone,
      id: `cl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalVisits: 0,
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };

    setClients((prev) => [newClient, ...prev]);
    setDoc(doc(db, 'clients', newClient.id), sanitizeForFirestore(newClient)).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `clients/${newClient.id}`)
    );

    const sess: ClientSession = {
      phone: cleanPhone,
      name: clientName,
      clientId: newClient.id,
    };
    setClientSession(sess);
    setAppMode('client');
    addToast('success', `ברוכה הבאה, ${clientName}! ✨`, 'הפרטים נשמרו, כעת ניתן לקבוע תור');
    return true;
  };

  const clientLogout = () => {
    setClientSession(null);
    addToast('info', 'התנתקת מאזור הלקוחה');
  };

  // Clients CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalSpent' | 'totalVisits'>): Client => {
    const avatarColors = [
      'bg-rose-100 text-rose-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-800',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
    ];
    const newClient: Client = {
      ...clientData,
      id: `cl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalVisits: 0,
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };
    setClients((prev) => [newClient, ...prev]);
    setDoc(doc(db, 'clients', newClient.id), sanitizeForFirestore(newClient)).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `clients/${newClient.id}`)
    );
    addToast('success', 'לקוחה נוספה בהצלחה', newClient.fullName);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    updateDoc(doc(db, 'clients', id), sanitizeForFirestore(updates)).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `clients/${id}`)
    );
    // Also update client name in appointments if name was changed
    if (updates.fullName || updates.phone) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.clientId === id
            ? {
                ...apt,
                clientName: updates.fullName || apt.clientName,
                clientPhone: updates.phone || apt.clientPhone,
              }
            : apt
        )
      );
    }
    addToast('success', 'פרטי הלקוחה עודכנו');
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    deleteDoc(doc(db, 'clients', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`)
    );
    if (viewingClientId === id) {
      setViewingClientId(null);
    }
    addToast('info', 'לקוחה נמחקה', client ? client.fullName : '');
  };

  // Services CRUD
  const addService = (serviceData: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);
    setDoc(doc(db, 'services', newService.id), sanitizeForFirestore(newService)).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `services/${newService.id}`)
    );
    addToast('success', 'שירות חדש נוסף', newService.name);
    return newService;
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    updateDoc(doc(db, 'services', id), sanitizeForFirestore(updates)).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `services/${id}`)
    );
    addToast('success', 'השירות עודכן בהצלחה');
  };

  const deleteService = (id: string) => {
    const srv = services.find((s) => s.id === id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'services', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`)
    );
    addToast('info', 'שירות נמחק מהמחירון', srv ? srv.name : '');
  };

  // Appointments CRUD with Collision Detection
  const addAppointment = (
    aptData: Omit<Appointment, 'id' | 'createdAt'>
  ): { success: boolean; error?: string; appointment?: Appointment } => {
    // 1. Collision check
    const collision = checkCollision(
      aptData.date,
      aptData.startTime,
      aptData.endTime,
      appointments
    );

    if (collision.hasCollision) {
      const conflicting = collision.conflictingAppointment;
      const errorMsg = `קיים כבר תור בשעה זו (${conflicting.startTime} - ${conflicting.endTime}) עבור ${conflicting.clientName}. אנא בחרי שעה אחרת.`;
      addToast('error', 'התנגשות בזמנים!', errorMsg);
      return { success: false, error: errorMsg };
    }

    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [...prev, newApt]);
    setDoc(doc(db, 'appointments', newApt.id), sanitizeForFirestore(newApt)).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `appointments/${newApt.id}`)
    );

    // Update client stats if client exists
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newApt.clientId) {
          const updatedClient = {
            ...c,
            nextAppointment: `${newApt.date} ${newApt.startTime}`,
          };
          updateDoc(doc(db, 'clients', c.id), sanitizeForFirestore({
            nextAppointment: updatedClient.nextAppointment
          })).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `clients/${c.id}`));
          return updatedClient;
        }
        return c;
      })
    );

    addToast('success', 'התור נקבע בהצלחה!', `${newApt.clientName} - ${newApt.startTime}`);
    return { success: true, appointment: newApt };
  };

  const updateAppointment = (
    id: string,
    updates: Partial<Appointment>
  ): { success: boolean; error?: string } => {
    const existing = appointments.find((a) => a.id === id);
    if (!existing) {
      return { success: false, error: 'התור לא נמצא' };
    }

    const targetDate = updates.date || existing.date;
    const targetStart = updates.startTime || existing.startTime;
    const targetEnd = updates.endTime || existing.endTime;

    // Check collision if date or time changed
    if (
      (updates.date && updates.date !== existing.date) ||
      (updates.startTime && updates.startTime !== existing.startTime) ||
      (updates.endTime && updates.endTime !== existing.endTime)
    ) {
      const collision = checkCollision(
        targetDate,
        targetStart,
        targetEnd,
        appointments,
        id
      );

      if (collision.hasCollision) {
        const conflicting = collision.conflictingAppointment;
        const errorMsg = `קיים כבר תור בשעה זו (${conflicting.startTime} - ${conflicting.endTime}) עבור ${conflicting.clientName}.`;
        addToast('error', 'התנגשות בשעות!', errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    updateDoc(doc(db, 'appointments', id), sanitizeForFirestore(updates)).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`)
    );

    // If status became completed, update client spent & visits
    if (updates.status === 'completed' && existing.status !== 'completed') {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === existing.clientId) {
            const updatedClient = {
              ...c,
              totalSpent: c.totalSpent + (existing.price || 0),
              totalVisits: c.totalVisits + 1,
              lastVisit: existing.date,
            };
            updateDoc(doc(db, 'clients', c.id), sanitizeForFirestore({
              totalSpent: updatedClient.totalSpent,
              totalVisits: updatedClient.totalVisits,
              lastVisit: updatedClient.lastVisit,
            })).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `clients/${c.id}`));
            return updatedClient;
          }
          return c;
        })
      );
    }

    addToast('success', 'התור עודכן בהצלחה');
    return { success: true };
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    deleteDoc(doc(db, 'appointments', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`)
    );
    addToast('info', 'התור הוסר מהיומן');
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const result = updateAppointment(id, { status });
    if (result.success) {
      const labels: Record<AppointmentStatus, string> = {
        pending: 'ממתין לאישור',
        confirmed: 'מאושר',
        completed: 'בוצע בהצלחה 🎉',
        cancelled: 'בוטל',
        no_show: 'סומן כלא הגיעה',
      };
      addToast('success', 'סטטוס תור עודכן', labels[status]);
    }
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setDoc(doc(db, 'settings', 'main'), sanitizeForFirestore(updates), { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, 'settings/main')
    );
    addToast('success', 'ההגדרות נשמרו בהצלחה');
  };

  // Modal controllers
  const openNewAppointmentModal = (defaultDate?: string, defaultTime?: string) => {
    setEditingAppointment(null);
    setDefaultDateForNewAppointment(defaultDate);
    setDefaultTimeForNewAppointment(defaultTime);
    setIsAppointmentModalOpen(true);
  };

  const openEditAppointmentModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setDefaultDateForNewAppointment(undefined);
    setDefaultTimeForNewAppointment(undefined);
    setIsAppointmentModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const openClientModal = (clientId: string) => {
    setViewingClientId(clientId);
  };

  const closeClientModal = () => {
    setViewingClientId(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        appMode,
        setAppMode,
        session,
        login,
        register,
        logout,
        clientSession,
        clientLogin,
        clientLogout,
        clients,
        services,
        appointments,
        settings,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        updateSettings,
        isAppointmentModalOpen,
        editingAppointment,
        defaultDateForNewAppointment,
        defaultTimeForNewAppointment,
        openNewAppointmentModal,
        openEditAppointmentModal,
        closeAppointmentModal,
        viewingClientId,
        openClientModal,
        closeClientModal,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
