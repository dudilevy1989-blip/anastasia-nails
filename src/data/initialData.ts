import { Client, ServiceItem, Appointment, BusinessSettings } from '../types';

// Helper to get formatted dates relative to today (YYYY-MM-DD)
export const getRelativeDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: "לק ג'ל טבעי",
    durationMinutes: 60,
    price: 130,
    description: "סידור וחיזוק הציפורן הטבעית במבנה אנטומי ומריחת לק ג'ל מושלמת",
    colorTag: '#f43f5e', // rose-500
    isActive: true,
  },
  {
    id: 'srv-2',
    name: "מילוי לק ג'ל / מבנה אנטומי",
    durationMinutes: 75,
    price: 150,
    description: 'מילוי שורש, חידוש ודיוק מבנה אנטומי וצבע גל לבחירה',
    colorTag: '#ec4899', // pink-500
    isActive: true,
  },
  {
    id: 'srv-3',
    name: 'בנייה בגל / אקריל',
    durationMinutes: 120,
    price: 250,
    description: 'הארכת ציפורניים מדויקת בטיפסים או תבניות לפי בחירת הלקוחה',
    colorTag: '#d946ef', // fuchsia-500
    isActive: true,
  },
  {
    id: 'srv-4',
    name: 'הסרת לק ג\'ל וטיפול משקם',
    durationMinutes: 45,
    price: 80,
    description: 'הסרה עדינה ומקצועית ללא פגיעה בלוחית הציפורן ומריחת חומר משקם',
    colorTag: '#a855f7', // purple-500
    isActive: true,
  },
  {
    id: 'srv-5',
    name: 'מניקור רוסי משולב',
    durationMinutes: 45,
    price: 100,
    description: 'ניקוי עור יסודי ועדין עם ראשי שיוף ומספריים מקצועיות',
    colorTag: '#f59e0b', // amber-500
    isActive: true,
  },
  {
    id: 'srv-6',
    name: 'מניקור + לק ג\'ל יוקרתי',
    durationMinutes: 75,
    price: 160,
    description: 'חבילת מניקור רוסי מלא, מבנה אנטומי ומריחת צבע צמודה לקוטיקולה',
    colorTag: '#e11d48', // rose-600
    isActive: true,
  },
  {
    id: 'srv-7',
    name: 'עיצוב ציפורניים / קישוטים (פרנץ\', אומברה, ציור ידני)',
    durationMinutes: 30,
    price: 50,
    description: 'תוספת קישוטי פרנץ\', אומברה יוקרתי, אבנים או עיטורים אמנותיים',
    colorTag: '#eab308', // yellow-500
    isActive: true,
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-1',
    fullName: 'נועה לוי',
    phone: '052-7654321',
    email: 'noa.levi@example.com',
    notes: 'אוהבת גווני ניוד עדינים ופרנץ\' דק. רגישה למים חמים ביום הראשון.',
    createdAt: '2024-01-10',
    totalSpent: 1250,
    totalVisits: 8,
    lastVisit: getRelativeDate(-14),
    nextAppointment: `${getRelativeDate(0)} 10:00`,
    avatarColor: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'cl-2',
    fullName: 'מאיה אברהם',
    phone: '054-9876543',
    email: 'maya.av@example.com',
    notes: 'מבנה ציפורן שביר, מעדיפה תמיד חיזוק ראבר בייס.',
    createdAt: '2024-02-15',
    totalSpent: 900,
    totalVisits: 6,
    lastVisit: getRelativeDate(-21),
    nextAppointment: `${getRelativeDate(0)} 11:30`,
    avatarColor: 'bg-pink-100 text-pink-700',
  },
  {
    id: 'cl-3',
    fullName: 'עדן כהן',
    phone: '050-1234567',
    email: 'eden.c@example.com',
    notes: 'מגיעה תמיד בזמן. אוהבת צבעים עזים ואדום קלאסי.',
    createdAt: '2023-11-05',
    totalSpent: 2100,
    totalVisits: 14,
    lastVisit: getRelativeDate(-3),
    nextAppointment: `${getRelativeDate(0)} 14:00`,
    avatarColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'cl-4',
    fullName: 'שיראל מזרחי',
    phone: '053-8889922',
    email: 'shirel.m@example.com',
    notes: 'מעדיפה צורת שקד קצרה.',
    createdAt: '2024-03-01',
    totalSpent: 650,
    totalVisits: 4,
    lastVisit: getRelativeDate(-28),
    nextAppointment: `${getRelativeDate(1)} 09:30`,
    avatarColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'cl-5',
    fullName: 'דניאל פרץ',
    phone: '058-4455667',
    email: 'daniel.p@example.com',
    notes: 'לקוחה קבועה פעם ב-3 שבועות בדיוק.',
    createdAt: '2023-09-12',
    totalSpent: 2800,
    totalVisits: 18,
    lastVisit: getRelativeDate(-7),
    nextAppointment: `${getRelativeDate(2)} 11:00`,
    avatarColor: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'cl-6',
    fullName: 'רוני אזולאי',
    phone: '052-3344556',
    email: 'roni.az@example.com',
    notes: 'סטודנטית, אוהבת עיצובים טרנדיים מפינטרסט.',
    createdAt: '2024-04-12',
    totalSpent: 480,
    totalVisits: 3,
    lastVisit: getRelativeDate(-10),
    avatarColor: 'bg-pink-100 text-pink-800',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientId: 'cl-1',
    clientName: 'נועה לוי',
    clientPhone: '052-7654321',
    serviceId: 'srv-6',
    serviceName: 'מניקור + לק ג\'ל יוקרתי',
    date: getRelativeDate(0), // Today
    startTime: '10:00',
    endTime: '11:15',
    durationMinutes: 75,
    price: 160,
    status: 'confirmed',
    notes: 'ביקשה פרנץ\' לבן עדין',
    reminderSent: true,
    createdAt: '2024-05-01T10:00:00.000Z',
  },
  {
    id: 'apt-2',
    clientId: 'cl-2',
    clientName: 'מאיה אברהם',
    clientPhone: '054-9876543',
    serviceId: 'srv-2',
    serviceName: 'מילוי לק ג\'ל / מבנה אנטומי',
    date: getRelativeDate(0), // Today
    startTime: '11:30',
    endTime: '12:45',
    durationMinutes: 75,
    price: 150,
    status: 'confirmed',
    notes: 'חיזוק בסיס מיוחד',
    reminderSent: true,
    createdAt: '2024-05-01T11:00:00.000Z',
  },
  {
    id: 'apt-3',
    clientId: 'cl-3',
    clientName: 'עדן כהן',
    clientPhone: '050-1234567',
    serviceId: 'srv-1',
    serviceName: 'לק ג\'ל טבעי',
    date: getRelativeDate(0), // Today
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    price: 130,
    status: 'pending',
    notes: 'רוצה לראות צבעי קיץ חדשים',
    reminderSent: false,
    createdAt: '2024-05-02T09:00:00.000Z',
  },
  {
    id: 'apt-4',
    clientId: 'cl-4',
    clientName: 'שיראל מזרחי',
    clientPhone: '053-8889922',
    serviceId: 'srv-3',
    serviceName: 'בנייה בגל / אקריל',
    date: getRelativeDate(1), // Tomorrow
    startTime: '09:30',
    endTime: '11:30',
    durationMinutes: 120,
    price: 250,
    status: 'confirmed',
    notes: 'סט ראשון של בנייה',
    reminderSent: true,
    createdAt: '2024-05-02T10:00:00.000Z',
  },
  {
    id: 'apt-5',
    clientId: 'cl-5',
    clientName: 'דניאל פרץ',
    clientPhone: '058-4455667',
    serviceId: 'srv-6',
    serviceName: 'מניקור + לק ג\'ל יוקרתי',
    date: getRelativeDate(2),
    startTime: '11:00',
    endTime: '12:15',
    durationMinutes: 75,
    price: 160,
    status: 'confirmed',
    notes: 'מילוי רגיל',
    reminderSent: false,
    createdAt: '2024-05-02T11:00:00.000Z',
  },
  {
    id: 'apt-6',
    clientId: 'cl-6',
    clientName: 'רוני אזולאי',
    clientPhone: '052-3344556',
    serviceId: 'srv-1',
    serviceName: 'לק ג\'ל טבעי',
    date: getRelativeDate(-1), // Yesterday
    startTime: '16:00',
    endTime: '17:00',
    durationMinutes: 60,
    price: 130,
    status: 'completed',
    notes: 'בוצע בהצלחה',
    reminderSent: true,
    createdAt: '2024-04-30T10:00:00.000Z',
  },
  {
    id: 'apt-7',
    clientId: 'cl-1',
    clientName: 'נועה לוי',
    clientPhone: '052-7654321',
    serviceId: 'srv-4',
    serviceName: 'הסרת לק ג\'ל וטיפול משקם',
    date: getRelativeDate(-4),
    startTime: '12:00',
    endTime: '12:45',
    durationMinutes: 45,
    price: 80,
    status: 'completed',
    notes: 'הסרה עדינה',
    reminderSent: true,
    createdAt: '2024-04-25T10:00:00.000Z',
  },
  {
    id: 'apt-8',
    clientId: 'cl-2',
    clientName: 'מאיה אברהם',
    clientPhone: '054-9876543',
    serviceId: 'srv-1',
    serviceName: 'לק ג\'ל טבעי',
    date: getRelativeDate(-2),
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    price: 130,
    status: 'cancelled',
    notes: 'הודיעה שהיא חולה',
    reminderSent: true,
    createdAt: '2024-04-28T09:00:00.000Z',
  },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  id: 'settings-1',
  businessName: 'Anastasia Nails',
  ownerName: 'אנסטסיה',
  phone: '054-7778899',
  email: 'anastasia.nails@gmail.com',
  address: 'שדרות רוטשילד 45, תל אביב',
  currency: '₪',
  workingHours: {
    0: { isOpen: true, start: '09:00', end: '19:00', breakStart: '13:00', breakEnd: '13:30' }, // Sunday
    1: { isOpen: true, start: '09:00', end: '19:00', breakStart: '13:00', breakEnd: '13:30' }, // Monday
    2: { isOpen: true, start: '09:00', end: '19:00', breakStart: '13:00', breakEnd: '13:30' }, // Tuesday
    3: { isOpen: true, start: '09:00', end: '19:00', breakStart: '13:00', breakEnd: '13:30' }, // Wednesday
    4: { isOpen: true, start: '09:00', end: '20:00', breakStart: '13:30', breakEnd: '14:00' }, // Thursday
    5: { isOpen: true, start: '08:30', end: '13:30' },                                          // Friday
    6: { isOpen: false, start: '09:00', end: '17:00' },                                         // Saturday (Closed)
  },
  vacationDates: [getRelativeDate(14), getRelativeDate(15)],
  reminderTemplate24h: 'היי {clientName}! 💅 מזכירה לך על התור שלך מחר ({date}) בשעה {time} ל{serviceName} ב-{businessName}. נתראה בקרוב!',
  reminderTemplate2h: 'היי {clientName}, מחכה לך עוד שעתיים ({time}) לתור ל{serviceName} ב-{businessName}! 💖',
};
