import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  MessageCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Edit2,
  Phone,
} from 'lucide-react';
import {
  formatHebrewDate,
  getRelativeDate,
  createWhatsAppUrl,
  getStatusDetails,
} from '../utils/dateUtils';
import { Appointment } from '../types';

export const RemindersView: React.FC = () => {
  const { appointments, updateAppointment, settings, updateSettings, addToast } = useApp();

  const todayStr = getRelativeDate(0);
  const tomorrowStr = getRelativeDate(1);

  // Reminders tab filter: upcoming today & tomorrow
  const [filterMode, setFilterMode] = useState<'all' | 'unnotified'>('all');
  const [template24h, setTemplate24h] = useState(settings.reminderTemplate24h);
  const [template2h, setTemplate2h] = useState(settings.reminderTemplate2h);

  const upcomingApts = appointments
    .filter(
      (a) =>
        (a.date === todayStr || a.date === tomorrowStr) &&
        a.status !== 'cancelled' &&
        a.status !== 'completed'
    )
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));

  const filteredApts = filterMode === 'unnotified'
    ? upcomingApts.filter((a) => !a.reminderSent)
    : upcomingApts;

  const buildReminderText = (apt: Appointment, type: '24h' | '2h') => {
    const template = type === '24h' ? template24h : template2h;
    return template
      .replace('{clientName}', apt.clientName)
      .replace('{date}', formatHebrewDate(apt.date, true))
      .replace('{time}', apt.startTime)
      .replace('{serviceName}', apt.serviceName)
      .replace('{businessName}', settings.businessName || 'Anastasia Nails');
  };

  const handleSendReminder = (apt: Appointment, type: '24h' | '2h') => {
    const msg = buildReminderText(apt, type);
    const url = createWhatsAppUrl(apt.clientPhone, msg);

    // Open WhatsApp
    window.open(url, '_blank');

    // Mark as reminder sent
    updateAppointment(apt.id, { reminderSent: true });
    addToast('success', 'תזכורת נשלחה', `נפתחה הודעת WhatsApp עבור ${apt.clientName}`);
  };

  const handleSaveTemplates = () => {
    updateSettings({
      reminderTemplate24h: template24h,
      reminderTemplate2h: template2h,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-rose-600" />
            מערכת תזכורות אוטומטית ב-WhatsApp
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            שלחי ללקוחות תזכורת 24 שעות או שעתיים לפני התור בלחיצה אחת
          </p>
        </div>

        {/* Filter */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            כל התורים הקרובים ({upcomingApts.length})
          </button>
          <button
            onClick={() => setFilterMode('unnotified')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'unnotified'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ממתינים לתזכורת ({upcomingApts.filter((a) => !a.reminderSent).length})
          </button>
        </div>
      </div>

      {/* Grid: Reminders queue & Customizable Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Queue of Appointments */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            תורים קרובים (היום ומחר)
          </h3>

          {filteredApts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">
                כל הלקוחות הקרובות כבר קיבלו תזכורת!
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                אין תורים הדורשים תזכורת מיידית להיום או למחר.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApts.map((apt) => {
                const isToday = apt.date === todayStr;
                return (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                            isToday
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isToday ? 'היום' : 'מחר'}
                        </span>
                        <span className="font-bold text-sm text-stone-900">
                          {apt.clientName}
                        </span>
                        {apt.reminderSent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            תזכורת נשלחה
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-500 mt-1">
                        {apt.serviceName} • שעה: {apt.startTime} ({apt.durationMinutes} דק׳)
                      </p>
                    </div>

                    {/* Send buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleSendReminder(apt, isToday ? '2h' : '24h')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {isToday ? 'תזכורת קרובה (שעתיים)' : 'תזכורת מראש (24 שעות)'}
                        </span>
                      </button>

                      <a
                        href={`tel:${apt.clientPhone}`}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="חיוג"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reminder Templates Editor */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-rose-600" />
            ניסוח תבניות התזכורת
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            הטקסט ימולא אוטומטית בשם הלקוחה, סוג הטיפול והשעה בעת השליחה.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                תבנית 24 שעות לפני (יום לפני התור)
              </label>
              <textarea
                rows={3}
                value={template24h}
                onChange={(e) => setTemplate24h(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                תבנית שעתיים לפני (ביום התור)
              </label>
              <textarea
                rows={3}
                value={template2h}
                onChange={(e) => setTemplate2h(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px] text-rose-900 space-y-1">
              <span className="font-bold block">תגיות זמינות לשימוש:</span>
              <p><code>{'{clientName}'}</code> - שם הלקוחה</p>
              <p><code>{'{time}'}</code> - שעת התור</p>
              <p><code>{'{serviceName}'}</code> - שם הטיפול</p>
              <p><code>{'{businessName}'}</code> - שם העסק</p>
            </div>

            <button
              type="button"
              onClick={handleSaveTemplates}
              className="w-full py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold transition-all shadow-md shadow-[#c783b9]/40 active:scale-95"
            >
              שמירת ניסוח התבניות
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
