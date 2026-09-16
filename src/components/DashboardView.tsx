import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  XCircle,
  Users,
} from 'lucide-react';
import {
  formatCurrency,
  formatHebrewDate,
  getRelativeDate,
  getStatusDetails,
  createWhatsAppUrl,
} from '../utils/dateUtils';

export const DashboardView: React.FC = () => {
  const {
    appointments,
    clients,
    settings,
    openNewAppointmentModal,
    openEditAppointmentModal,
    updateAppointmentStatus,
    openClientModal,
    setActiveTab,
  } = useApp();

  const todayStr = getRelativeDate(0);

  // Compute stats
  const todayAppointments = appointments
    .filter((a) => a.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeTodayApts = todayAppointments.filter((a) => a.status !== 'cancelled');

  // Next upcoming appointment today
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const nextApt = activeTodayApts.find((a) => {
    const [h, m] = a.startTime.split(':').map(Number);
    const aptMinutes = h * 60 + m;
    return aptMinutes >= currentMinutes && a.status !== 'completed';
  }) || activeTodayApts.find((a) => a.status !== 'completed') || null;

  // This week calculation
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday

  const weekAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.date);
    return aptDate >= startOfWeek && aptDate <= endOfWeek && a.status !== 'cancelled';
  });

  // Today income (completed or confirmed)
  const todayIncome = activeTodayApts.reduce((sum, a) => sum + (a.price || 0), 0);

  // Current month income
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const monthAppointments = appointments.filter(
    (a) => a.date.startsWith(currentMonthPrefix) && a.status !== 'cancelled'
  );
  const monthIncome = monthAppointments.reduce((sum, a) => sum + (a.price || 0), 0);

  // Total cancellations this month
  const monthCancellations = appointments.filter(
    (a) => a.date.startsWith(currentMonthPrefix) && a.status === 'cancelled'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-gradient-to-l from-[#8e397c] via-[#9e448b] to-[#822f72] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl shadow-[#8e397c]/25 relative overflow-hidden">
        {/* Subtle decorative gold/light sparkles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
          <div className="min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md border border-white/20 text-white inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                סטודיו פעיל
              </span>
              <span className="text-white/80 text-xs sm:text-sm">
                {formatHebrewDate(todayStr, true)}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight break-words">
              בוקר טוב, {settings.ownerName || 'אנסטסיה'} ✨
            </h2>
            <p className="text-pink-100 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
              {activeTodayApts.length > 0
                ? `יש לך היום ${activeTodayApts.length} תורים מתוכננים בהיקף של ${formatCurrency(todayIncome)}`
                : 'אין תורים מתוכננים להיום. הזמן להירגע או לקבוע תורים חדשים!'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => openNewAppointmentModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-black/10 border border-white/25 transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" />
              <span>קביעת תור חדש</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* Today's Appointments */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">תורים להיום</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-stone-900">
            {activeTodayApts.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate">
            מתוכם {activeTodayApts.filter(a => a.status === 'completed').length} בוצעו
          </p>
        </div>

        {/* Week's Appointments */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">תורים השבוע</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-stone-900">
            {weekAppointments.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate">
            בכל ימי השבוע
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">הכנסות היום</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-700">
            {formatCurrency(todayIncome)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate">
            לפי שירותי היום
          </p>
        </div>

        {/* Month Revenue */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">הכנסות החודש</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-stone-900">
            {formatCurrency(monthIncome)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate">
            {monthAppointments.length} טיפולים
          </p>
        </div>

        {/* Cancellations */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-300 transition-colors col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">ביטולים החודש</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-rose-600">
            {monthCancellations}
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1 truncate">
            תורים שבוטלו החודש
          </p>
        </div>

      </div>

      {/* Main Grid: Next Appointment Spotlight + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Appointment Spotlight Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              התור הבא
            </h3>
            {nextApt && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                {nextApt.startTime}
              </span>
            )}
          </div>

          {nextApt ? (
            <div className="bg-gradient-to-br from-white via-rose-50/40 to-pink-50/30 rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-md space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => openClientModal(nextApt.clientId)}
                    className="text-lg sm:text-xl font-black text-stone-900 hover:text-rose-600 transition-colors text-right block"
                  >
                    {nextApt.clientName}
                  </button>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    {nextApt.serviceName}
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-stone-900">
                    {formatCurrency(nextApt.price)}
                  </span>
                  <p className="text-[11px] text-stone-400">{nextApt.durationMinutes} דק׳</p>
                </div>
              </div>

              {/* Timing badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-rose-100 text-xs text-stone-700">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold">
                  שעה: {nextApt.startTime} - {nextApt.endTime}
                </span>
              </div>

              {nextApt.notes && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold">הערה: </span>
                  {nextApt.notes}
                </div>
              )}

              {/* Direct Actions: Call, WhatsApp, Complete */}
              <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between gap-2">
                <a
                  href={`tel:${nextApt.clientPhone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>חיוג</span>
                </a>

                <a
                  href={createWhatsAppUrl(
                    nextApt.clientPhone,
                    `היי ${nextApt.clientName}! 💅 מזכירה לך על התור שלך היום בשעה ${nextApt.startTime} ל${nextApt.serviceName}. נתראה בקרוב!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => updateAppointmentStatus(nextApt.id, 'completed')}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors border border-purple-200"
                  title="סמן כבוצע"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">אין תור קרוב להיום</h4>
              <p className="text-xs text-stone-500">
                כל התורים של היום הסתיימו או שעדיין לא נקבעו תורים נוספים.
              </p>
              <button
                onClick={() => openNewAppointmentModal()}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
              >
                לקביעת תור חדש
              </button>
            </div>
          )}

          {/* Quick client search shortcut */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-stone-900">מאגר הלקוחות</h4>
                <p className="text-[11px] text-stone-500">{clients.length} לקוחות רשומות</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>לרשימה</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Today's Full Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              לוח הזמנים להיום ({todayAppointments.length})
            </h3>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>מעבר ליומן המלא</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-base">היומן פנוי להיום</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  אין תורים מתוזמנים להיום. לחצי על הכפתור מטה כדי להוסיף תור ראשון.
                </p>
              </div>
              <button
                onClick={() => openNewAppointmentModal(todayStr)}
                className="px-5 py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold transition-all shadow-md shadow-[#c783b9]/40 active:scale-95"
              >
                + הוספת תור להיום
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((apt) => {
                const statusDetails = getStatusDetails(apt.status);
                const isCompleted = apt.status === 'completed';
                const isCancelled = apt.status === 'cancelled';

                return (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCancelled
                        ? 'bg-stone-50/60 border-stone-200/60 opacity-60'
                        : isCompleted
                        ? 'bg-purple-50/30 border-purple-100'
                        : 'bg-white border-rose-100/80 hover:border-rose-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Time & Client Info */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 text-center shrink-0">
                        <div className="font-extrabold text-stone-900 text-sm">{apt.startTime}</div>
                        <div className="text-[11px] text-stone-400">{apt.endTime}</div>
                      </div>

                      <div className="w-px h-8 bg-stone-200" />

                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openClientModal(apt.clientId)}
                            className="font-bold text-stone-900 hover:text-rose-600 transition-colors text-sm text-right"
                          >
                            {apt.clientName}
                          </button>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusDetails.bg} ${statusDetails.text} ${statusDetails.border}`}
                          >
                            {statusDetails.label}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {apt.serviceName} • {formatCurrency(apt.price)}
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                      
                      {/* WhatsApp Reminder Shortcut */}
                      <a
                        href={createWhatsAppUrl(
                          apt.clientPhone,
                          `היי ${apt.clientName}! 💅 מזכירה לך על התור שלך להיום בשעה ${apt.startTime} ל${apt.serviceName}. מחכה לך!`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="שליחת תזכורת בוואטסאפ"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* Phone call */}
                      <a
                        href={`tel:${apt.clientPhone}`}
                        className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
                        title="חיוג ללקוחה"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      {/* Fast status toggle: Mark completed */}
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                        >
                          סיימה טיפול ✓
                        </button>
                      )}

                      {/* Edit button */}
                      <button
                        onClick={() => openEditAppointmentModal(apt)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                      >
                        עריכה
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
