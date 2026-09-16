import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Sun,
  Coffee,
  AlertCircle,
} from 'lucide-react';
import { HEBREW_DAYS, formatHebrewDate } from '../utils/dateUtils';
import { DaySchedule } from '../types';

export const WorkingHoursView: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [workingHours, setWorkingHours] = useState(settings.workingHours);
  const [vacationDates, setVacationDates] = useState(settings.vacationDates || []);
  const [newVacationDate, setNewVacationDate] = useState('');

  const handleDayToggle = (dayIndex: number) => {
    setWorkingHours((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        isOpen: !prev[dayIndex].isOpen,
      },
    }));
  };

  const handleTimeChange = (
    dayIndex: number,
    field: keyof DaySchedule,
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }));
  };

  const handleAddVacation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVacationDate || vacationDates.includes(newVacationDate)) return;

    const updated = [...vacationDates, newVacationDate].sort();
    setVacationDates(updated);
    setNewVacationDate('');
  };

  const handleRemoveVacation = (dateStr: string) => {
    setVacationDates((prev) => prev.filter((d) => d !== dateStr));
  };

  const handleSaveAll = () => {
    updateSettings({
      workingHours,
      vacationDates,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Save Action */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-600" />
            הגדרת שעות עבודה, הפסקות וחופשות
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            השעות שתגדירי כאן ישפיעו על זמינות התורים ביומן ועל מניעת קביעות בשעות סגורות
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#c783b9]/40 hover:shadow-lg transition-all active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>שמירת כל ההגדרות</span>
        </button>
      </div>

      {/* Days of Week Schedule Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            ימי פעילות קבועים
          </span>
          <span className="text-xs text-stone-500">
            הפעילי או כבי ימים לפי לוח הזמנים שלך
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {HEBREW_DAYS.map((dayName, dayIndex) => {
            const daySchedule = workingHours[dayIndex] || {
              isOpen: false,
              start: '09:00',
              end: '18:00',
            };

            return (
              <div
                key={dayIndex}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                  daySchedule.isOpen ? 'bg-white' : 'bg-stone-50/50 opacity-75'
                }`}
              >
                {/* Day Switcher & Name */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <input
                    type="checkbox"
                    id={`day-toggle-${dayIndex}`}
                    checked={daySchedule.isOpen}
                    onChange={() => handleDayToggle(dayIndex)}
                    className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                  />
                  <label
                    htmlFor={`day-toggle-${dayIndex}`}
                    className="font-extrabold text-stone-900 text-sm cursor-pointer select-none"
                  >
                    יום {dayName}
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      daySchedule.isOpen
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {daySchedule.isOpen ? 'פעיל' : 'סגור'}
                  </span>
                </div>

                {/* Operating Hours & Break times if open */}
                {daySchedule.isOpen ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    
                    {/* Opening & Closing */}
                    <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                      <span className="font-semibold text-stone-600">שעות פתיחה:</span>
                      <input
                        type="time"
                        value={daySchedule.start}
                        onChange={(e) => handleTimeChange(dayIndex, 'start', e.target.value)}
                        className="px-2 py-1 rounded bg-white border border-stone-200 font-mono text-xs text-stone-800"
                      />
                      <span>עד</span>
                      <input
                        type="time"
                        value={daySchedule.end}
                        onChange={(e) => handleTimeChange(dayIndex, 'end', e.target.value)}
                        className="px-2 py-1 rounded bg-white border border-stone-200 font-mono text-xs text-stone-800"
                      />
                    </div>

                    {/* Break Time */}
                    <div className="flex items-center gap-2 bg-amber-50/60 p-2 rounded-xl border border-amber-200/70">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold text-amber-900">הפסקה:</span>
                      <input
                        type="time"
                        value={daySchedule.breakStart || ''}
                        onChange={(e) => handleTimeChange(dayIndex, 'breakStart', e.target.value)}
                        placeholder="שעת התחלה"
                        className="px-2 py-1 rounded bg-white border border-stone-200 font-mono text-xs text-stone-800"
                      />
                      <span>עד</span>
                      <input
                        type="time"
                        value={daySchedule.breakEnd || ''}
                        onChange={(e) => handleTimeChange(dayIndex, 'breakEnd', e.target.value)}
                        placeholder="שעת סיום"
                        className="px-2 py-1 rounded bg-white border border-stone-200 font-mono text-xs text-stone-800"
                      />
                    </div>

                  </div>
                ) : (
                  <div className="text-xs text-stone-400 italic">
                    העסק סגור ביום זה, לא יתאפשר לתאם תורים
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vacations & Closed Dates Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              ימי חופשה וסגירה מיוחדים ({vacationDates.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              בימים אלו לא ניתן לקבוע תורים כלל
            </p>
          </div>
        </div>

        {/* Add vacation date form */}
        <form onSubmit={handleAddVacation} className="flex items-center gap-3 max-w-md">
          <input
            type="date"
            value={newVacationDate}
            onChange={(e) => setNewVacationDate(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <button
            type="submit"
            disabled={!newVacationDate}
            className="px-4 py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs active:scale-95"
          >
            + הוספת תאריך חופשה
          </button>
        </form>

        {/* List of vacation dates */}
        {vacationDates.length === 0 ? (
          <p className="text-xs text-stone-400 italic pt-2">
            לא מוגדרים ימי חופשה קרובים.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {vacationDates.map((dateStr) => (
              <div
                key={dateStr}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900"
              >
                <span>{formatHebrewDate(dateStr, true)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveVacation(dateStr)}
                  className="text-rose-400 hover:text-rose-700 p-0.5 rounded transition-colors"
                  title="הסר חופשה"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
