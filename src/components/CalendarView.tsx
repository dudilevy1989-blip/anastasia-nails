import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import {
  formatHebrewDate,
  formatCurrency,
  getRelativeDate,
  getStatusDetails,
  HEBREW_DAYS,
  createWhatsAppUrl,
} from '../utils/dateUtils';
import { Appointment } from '../types';

type CalendarMode = 'day' | 'week' | 'month';

export const CalendarView: React.FC = () => {
  const {
    appointments,
    openNewAppointmentModal,
    openEditAppointmentModal,
    updateAppointmentStatus,
    deleteAppointment,
    openClientModal,
    settings,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<string>(getRelativeDate(0));
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fallback to 'day' view if calendarMode is 'week' on small screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && calendarMode === 'week') {
        setCalendarMode('day');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calendarMode]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (calendarMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (calendarMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(getRelativeDate(0));
  };

  // Hours to show for daily schedule (e.g. 08:00 to 20:00)
  const HOURS_OF_DAY = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  // Daily appointments
  const dayAppointments = appointments
    .filter((a) => a.date === currentDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute week days (Sunday to Saturday of the selected week)
  const getWeekDays = (baseDateStr: string) => {
    const base = new Date(baseDateStr);
    const sunday = new Date(base);
    sunday.setDate(sunday.getDate() - sunday.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: d.getDate(),
        dayName: HEBREW_DAYS[i],
        isToday: dateStr === getRelativeDate(0),
        isSelected: dateStr === currentDate,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Compute month days for the month view
  const getMonthDays = (baseDateStr: string) => {
    const [year, month] = baseDateStr.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const totalDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    // Padding before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dateStr: '', dayNumber: 0, isCurrentMonth: false });
    }
    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === getRelativeDate(0),
        isSelected: dateStr === currentDate,
      });
    }
    return days;
  };

  const monthDays = getMonthDays(currentDate);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Calendar Header Controls */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Date Title & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-start min-w-0">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-stone-700 transition-colors"
              title="קודם"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold hover:bg-white text-stone-800 transition-colors"
            >
              היום
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-stone-700 transition-colors"
              title="הבא"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-lg font-extrabold text-stone-900 truncate">
            {formatHebrewDate(currentDate, calendarMode === 'day')}
          </h2>
        </div>

        {/* View Switcher (Day, Week, Month) + New Apt Button */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCalendarMode('day')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                calendarMode === 'day'
                  ? 'bg-white text-[#8e397c] font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              יומי
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`hidden md:inline-block px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                calendarMode === 'week'
                  ? 'bg-white text-[#8e397c] font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              שבועי
            </button>
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                calendarMode === 'month'
                  ? 'bg-white text-[#8e397c] font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              חודשי
            </button>
          </div>

          <button
            onClick={() => openNewAppointmentModal(currentDate)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>תור חדש</span>
          </button>

        </div>
      </div>

      {/* 1. DAILY VIEW */}
      {calendarMode === 'day' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-sm text-stone-900">
                לוח זמנים לשעות העבודה ({dayAppointments.length} תורים רשומים)
              </span>
            </div>
            <div className="text-xs text-stone-500">
              לחצי על שעה פנויה כדי לקבוע תור
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {HOURS_OF_DAY.map((hour) => {
              // Find if any appointment is scheduled at this hour
              const matchingApts = dayAppointments.filter(
                (a) => a.startTime === hour || (a.startTime <= hour && a.endTime > hour)
              );
              // Only consider an appointment matching directly as the starter block
              const directApt = dayAppointments.find((a) => a.startTime === hour);

              return (
                <div
                  key={hour}
                  className="flex items-stretch min-h-[52px] group hover:bg-stone-50/50 transition-colors"
                >
                  {/* Hour label */}
                  <div className="w-20 sm:w-24 p-3 text-center shrink-0 border-l border-stone-100 text-xs font-bold text-stone-500 bg-stone-50/30 flex items-center justify-center">
                    {hour}
                  </div>

                  {/* Slot content */}
                  <div className="flex-1 p-2 flex items-center">
                    {directApt ? (
                      <div
                        onClick={() => setSelectedAppointment(directApt)}
                        className="w-full p-2.5 sm:p-3 rounded-xl border bg-white shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        style={{ borderRight: `4px solid #f43f5e` }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              getStatusDetails(directApt.status).bg
                            } ${getStatusDetails(directApt.status).text} ${
                              getStatusDetails(directApt.status).border
                            }`}
                          >
                            {getStatusDetails(directApt.status).label}
                          </span>
                          <div>
                            <span className="font-bold text-stone-900 text-sm">
                              {directApt.clientName}
                            </span>
                            <span className="text-xs text-stone-500 mr-2">
                              • {directApt.serviceName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-semibold text-rose-700">
                            {directApt.startTime} - {directApt.endTime} ({directApt.durationMinutes} דק׳)
                          </span>
                          <span className="font-bold text-stone-900">
                            {formatCurrency(directApt.price)}
                          </span>
                        </div>
                      </div>
                    ) : matchingApts.length > 0 ? (
                      // Continuous block of an ongoing appointment
                      <div className="w-full py-1.5 px-3 rounded-lg bg-rose-50/30 border border-rose-100/50 text-[11px] text-rose-700/70 italic">
                        המשך טיפול: {matchingApts[0].clientName} ({matchingApts[0].serviceName})
                      </div>
                    ) : (
                      // Empty slot
                      <button
                        onClick={() => openNewAppointmentModal(currentDate, hour)}
                        className="w-full h-full min-h-[32px] rounded-lg border border-dashed border-transparent hover:border-rose-300 hover:bg-rose-50/40 text-stone-300 hover:text-rose-600 text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          קביעת תור ב-{hour}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEKLY VIEW */}
      {calendarMode === 'week' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Days header */}
            <div className="grid grid-cols-7 border-b border-rose-100 bg-rose-50/30">
              {weekDays.map((day) => (
                <div
                  key={day.dateStr}
                  onClick={() => {
                    setCurrentDate(day.dateStr);
                    setCalendarMode('day');
                  }}
                  className={`p-3 text-center cursor-pointer transition-colors border-l border-rose-100/60 last:border-l-0 ${
                    day.isSelected ? 'bg-rose-100/50 font-bold' : 'hover:bg-rose-50/50'
                  }`}
                >
                  <div className="text-xs text-stone-500">{day.dayName}</div>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold mt-1 ${
                      day.isToday
                        ? 'bg-rose-600 text-white'
                        : 'text-stone-900'
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div className="grid grid-cols-7 min-h-[400px] divide-x divide-x-reverse divide-stone-100">
              {weekDays.map((day) => {
                const dayApts = appointments
                  .filter((a) => a.date === day.dateStr && a.status !== 'cancelled')
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={day.dateStr} className="p-2 space-y-2 bg-stone-50/20 flex flex-col">
                    {dayApts.map((apt) => {
                      const st = getStatusDetails(apt.status);
                      return (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-2 rounded-xl bg-white border border-rose-100 shadow-xs hover:shadow-md cursor-pointer text-xs space-y-1 transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-rose-800">
                            <span>{apt.startTime}</span>
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                          </div>
                          <div className="font-bold text-stone-900 truncate">
                            {apt.clientName}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {apt.serviceName}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => openNewAppointmentModal(day.dateStr)}
                      className="mt-auto py-2 rounded-lg border border-dashed border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-[11px] font-medium text-stone-400 hover:text-rose-700 text-center transition-colors"
                    >
                      + תור ליום זה
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTHLY VIEW */}
      {calendarMode === 'month' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs p-4 sm:p-5">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {HEBREW_DAYS.map((dayName) => (
              <div
                key={dayName}
                className="text-center text-xs font-bold text-stone-500 py-1.5"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[70px] sm:min-h-[90px] rounded-xl bg-stone-50/40 p-1 opacity-40"
                  />
                );
              }

              const dayApts = appointments.filter(
                (a) => a.date === cell.dateStr && a.status !== 'cancelled'
              );

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    setCurrentDate(cell.dateStr);
                    setCalendarMode('day');
                  }}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isSelected
                      ? 'border-rose-400 bg-rose-50/50 shadow-xs'
                      : cell.isToday
                      ? 'border-rose-200 bg-white shadow-xs'
                      : 'border-stone-100 bg-white hover:border-rose-200 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-5 h-5 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-rose-600 text-white'
                          : 'text-stone-800'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 px-1 bg-rose-50 rounded">
                        {dayApts.length}
                      </span>
                    )}
                  </div>

                  {/* Little indicators of appointments */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayApts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 truncate"
                      >
                        {a.startTime} {a.clientName}
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <div className="text-[9px] text-stone-400 font-bold px-1">
                        +{dayApts.length - 2} נוספים
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Detail Popup Modal (When clicking an appointment) */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-800">
                  {formatHebrewDate(selectedAppointment.date, true)}
                </div>
                <h3 className="font-extrabold text-lg text-stone-900 mt-0.5">
                  {selectedAppointment.clientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details body */}
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <div>
                  <span className="text-xs text-stone-500 block">סוג טיפול:</span>
                  <span className="font-bold text-stone-900">{selectedAppointment.serviceName}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-stone-500 block">מחיר:</span>
                  <span className="font-extrabold text-stone-900">
                    {formatCurrency(selectedAppointment.price)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                  <span className="text-xs text-stone-500 block">שעה ומשך:</span>
                  <span className="font-bold text-stone-800">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime} ({selectedAppointment.durationMinutes} דק׳)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                  <span className="text-xs text-stone-500 block">סטטוס:</span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                      getStatusDetails(selectedAppointment.status).bg
                    } ${getStatusDetails(selectedAppointment.status).text}`}
                  >
                    {getStatusDetails(selectedAppointment.status).label}
                  </span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">הערות: </span>
                  {selectedAppointment.notes}
                </div>
              )}

              {/* Status Update Quick Buttons */}
              <div>
                <label className="text-xs font-bold text-stone-600 mb-1.5 block">
                  שינוי סטטוס מהיר:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['confirmed', 'completed', 'cancelled', 'no_show'] as const).map((st) => {
                    const dt = getStatusDetails(st);
                    const isCurrent = selectedAppointment.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, st);
                          setSelectedAppointment({ ...selectedAppointment, status: st });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? `${dt.bg} ${dt.text} ring-2 ring-stone-900/10 shadow-xs`
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {dt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct WhatsApp and Phone */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <a
                  href={createWhatsAppUrl(
                    selectedAppointment.clientPhone,
                    `היי ${selectedAppointment.clientName}! 💅 מזכירה לך על התור שלך ב-${formatHebrewDate(selectedAppointment.date)} בשעה ${selectedAppointment.startTime} ל${selectedAppointment.serviceName}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>שליחת תזכורת ב-WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedAppointment.clientPhone}`}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="חיוג"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Action buttons: Edit, Delete */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => {
                    const aptToEdit = selectedAppointment;
                    setSelectedAppointment(null);
                    openEditAppointmentModal(aptToEdit);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50 transition-colors text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>עריכת תור</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('האם את בטוחה שברצונך למחוק תור זה לצמיתות?')) {
                      deleteAppointment(selectedAppointment.id);
                      setSelectedAppointment(null);
                    }
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="מחיקת תור"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
