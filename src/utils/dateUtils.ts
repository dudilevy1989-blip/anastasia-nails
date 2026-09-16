// Helper functions for dates, times, Hebrew day names, collision checks

/**
 * Helper to get formatted dates relative to today (YYYY-MM-DD)
 */
export const getRelativeDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const HEBREW_DAYS_SHORT = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

/**
 * Formats YYYY-MM-DD into readable Hebrew date
 * e.g., "יום שלישי, 15 בספטמבר 2026"
 */
export const formatHebrewDate = (dateStr: string, includeDayName: boolean = true): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const dayName = HEBREW_DAYS[date.getDay()];
  const monthName = HEBREW_MONTHS[month - 1];
  
  if (includeDayName) {
    return `יום ${dayName}, ${day} ב${monthName}`;
  }
  return `${day} ב${monthName} ${year}`;
};

/**
 * Calculates end time based on start time (HH:mm) and duration in minutes
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};

/**
 * Converts HH:mm to minutes from midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Checks if two time intervals overlap on the same date:
 * [startA, endA) and [startB, endB)
 */
export const isTimeOverlapping = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const startAMin = timeToMinutes(startA);
  const endAMin = timeToMinutes(endA);
  const startBMin = timeToMinutes(startB);
  const endBMin = timeToMinutes(endB);

  return Math.max(startAMin, startBMin) < Math.min(endAMin, endBMin);
};

/**
 * Checks if an appointment collides with existing appointments
 */
export const checkCollision = (
  date: string,
  startTime: string,
  endTime: string,
  existingAppointments: Array<{ id: string; date: string; startTime: string; endTime: string; status: string }>,
  excludeAppointmentId?: string
): { hasCollision: boolean; conflictingAppointment?: any } => {
  const matchingDateAppointments = existingAppointments.filter(
    (apt) => apt.date === date && apt.id !== excludeAppointmentId && apt.status !== 'cancelled'
  );

  for (const apt of matchingDateAppointments) {
    if (isTimeOverlapping(startTime, endTime, apt.startTime, apt.endTime)) {
      return { hasCollision: true, conflictingAppointment: apt };
    }
  }

  return { hasCollision: false };
};

/**
 * Generate WhatsApp Web/App redirect link with predefined encoded message
 */
export const createWhatsAppUrl = (phone: string, text: string): string => {
  // Clean phone number: remove dashes, spaces, convert 05X to 9725X
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '972' + cleanPhone.substring(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Computes all available start time slots for a given date and service duration,
 * respecting business working hours, breaks, vacations, and existing appointments.
 */
export const getAvailableSlotsForDate = (
  dateStr: string,
  durationMinutes: number,
  existingAppointments: Array<{ id: string; date: string; startTime: string; endTime: string; status: string }>,
  workingHours: { [dayOfWeek: number]: { isOpen: boolean; start: string; end: string; breakStart?: string; breakEnd?: string } },
  vacationDates: string[] = []
): string[] => {
  if (!dateStr) return [];

  // Check if date is vacation
  if (vacationDates.includes(dateStr)) {
    return [];
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();

  const schedule = workingHours[dayOfWeek];
  if (!schedule || !schedule.isOpen) {
    return [];
  }

  const workStartMin = timeToMinutes(schedule.start);
  const workEndMin = timeToMinutes(schedule.end);
  const breakStartMin = schedule.breakStart ? timeToMinutes(schedule.breakStart) : null;
  const breakEndMin = schedule.breakEnd ? timeToMinutes(schedule.breakEnd) : null;

  const slots: string[] = [];
  // Generate slots every 30 minutes
  const stepMinutes = 30;

  for (let current = workStartMin; current + durationMinutes <= workEndMin; current += stepMinutes) {
    const slotEnd = current + durationMinutes;

    // Check collision with break
    if (breakStartMin !== null && breakEndMin !== null) {
      if (Math.max(current, breakStartMin) < Math.min(slotEnd, breakEndMin)) {
        continue;
      }
    }

    const slotStartHours = Math.floor(current / 60);
    const slotStartMins = current % 60;
    const startTimeStr = `${String(slotStartHours).padStart(2, '0')}:${String(slotStartMins).padStart(2, '0')}`;
    const endTimeStr = calculateEndTime(startTimeStr, durationMinutes);

    // Check collision with appointments on this date
    const collision = checkCollision(dateStr, startTimeStr, endTimeStr, existingAppointments);
    if (!collision.hasCollision) {
      slots.push(startTimeStr);
    }
  }

  return slots;
};

/**
 * Formats price in Israeli New Shekel
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('he-IL')} ₪`;
};

/**
 * Get color and label for appointment status
 */
export const getStatusDetails = (status: string) => {
  switch (status) {
    case 'confirmed':
      return {
        label: 'מאושר',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'pending':
      return {
        label: 'ממתין לאישור',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'completed':
      return {
        label: 'בוצע',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'cancelled':
      return {
        label: 'בוטל',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'no_show':
      return {
        label: 'לא הגיעה',
        bg: 'bg-stone-100',
        text: 'text-stone-600',
        border: 'border-stone-200',
        dot: 'bg-stone-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-stone-50',
        text: 'text-stone-700',
        border: 'border-stone-200',
        dot: 'bg-stone-400',
      };
  }
};
