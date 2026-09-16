import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceItem, Appointment, DaySchedule } from '../types';
import { NailsLogo } from './NailsLogo';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  MessageCircle,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  Share2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  formatHebrewDate,
  formatCurrency,
  getAvailableSlotsForDate,
  calculateEndTime,
} from '../utils/dateUtils';

export const ClientPortalView: React.FC = () => {
  const {
    settings,
    services,
    appointments,
    addAppointment,
    deleteAppointment,
    clientSession,
    clientLogin,
    clientLogout,
    setAppMode,
    addToast,
  } = useApp();

  // Login form state (if not logged in)
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isNewClientForm, setIsNewClientForm] = useState(false);

  // Tabs for portal: 'book' | 'my-appointments' | 'about'
  const [activeTab, setActiveTab] = useState<'book' | 'my-appointments' | 'about'>('book');

  // Booking Flow State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); // 1: service, 2: date/time, 3: confirm
  const [lastBookedApt, setLastBookedApt] = useState<Appointment | null>(null);

  // Client's appointments
  const myAppointments = useMemo(() => {
    if (!clientSession?.phone) return [];
    const cleanPhone = clientSession.phone.replace(/\D/g, '');
    return appointments
      .filter((a) => a.clientPhone.replace(/\D/g, '') === cleanPhone)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [appointments, clientSession]);

  const upcomingAppointments = myAppointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'no_show'
  );
  const pastAppointments = myAppointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  // Available slots for selected date & service
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    return getAvailableSlotsForDate(
      selectedDate,
      selectedService.durationMinutes,
      appointments,
      settings.workingHours,
      settings.vacationDates
    );
  }, [selectedDate, selectedService, appointments, settings]);

  // Handle client identification
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      addToast('error', 'שגיאה', 'אנא הזיני מספר טלפון תקין');
      return;
    }
    clientLogin(phoneInput, nameInput || 'לקוחה');
  };

  const handleQuickDemoClient = (phone: string, name: string) => {
    setPhoneInput(phone);
    setNameInput(name);
    clientLogin(phone, name);
  };

  // Confirm booking
  const handleConfirmBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      addToast('error', 'שגיאה', 'אנא מלאי את כל פרטי התור');
      return;
    }

    if (!clientSession) {
      addToast('error', 'הזדהות חסרה', 'אנא הזיני את שמך ומספר הטלפון לקביעת התור');
      return;
    }

    const endTime = calculateEndTime(selectedTime, selectedService.durationMinutes);

    const res = addAppointment({
      clientId: clientSession.clientId || `cl-${Date.now()}`,
      clientName: clientSession.name,
      clientPhone: clientSession.phone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      status: 'pending', // client bookings start as pending until business confirms
      notes: bookingNotes,
      reminderSent: false,
    });

    if (res.success && res.appointment) {
      setLastBookedApt(res.appointment);
      setBookingStep(1);
      setSelectedService(null);
      setSelectedTime('');
      setBookingNotes('');
      addToast('success', 'התור נקבע בהצלחה! ✨', 'מחכים לראותך בסטודיו');
    }
  };

  // Copy shareable link for clients
  const handleCopyClientLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=client`;
    navigator.clipboard?.writeText(url);
    addToast('success', 'הקישור הועתק ללוח!', 'תוכלי לשלוח ללקוחות או לשים בביו');
  };

  // WhatsApp quick contact
  const handleWhatsAppContact = () => {
    const cleanPhone = (settings.phone || '054-7778899').replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `היי ${settings.ownerName || 'אנסטסיה'}, אשמח לברר פרטים לגבי תור בסטודיו ✨`
    );
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#edcae5] pb-24 text-stone-900">
      
      {/* Top Admin Switcher Bar (Banner to return to Admin or copy link) */}
      <div className="bg-stone-900 text-white px-3 sm:px-6 py-2.5 text-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold">תצוגת לקוחה (פורטל זימון תורים אונליין)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClientLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              title="העתקת הקישור לשיתוף עם לקוחות"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">העתקת קישור ללקוחות</span>
            </button>
            <button
              onClick={() => setAppMode('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c783b9] hover:bg-[#b874ab] text-white font-bold transition-all shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">בעלת הסטודיו (חזרה לניהול)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Boutique Studio Brand Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-right">
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <NailsLogo size="xl" className="shadow-lg shadow-rose-300/30 ring-4 ring-rose-200/60" />
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    {settings.businessName || 'Anastasia Nails'}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border border-amber-300/60 rounded-full">
                    בוטיק יוקרתי
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  בהנהלת {settings.ownerName || 'אנסטסיה'} • עיצוב, שיקום ומבנה אנטומי ברמה הגבוהה ביותר
                </p>
                {settings.address && (
                  <p className="text-xs text-stone-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{settings.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick WhatsApp & Call Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsAppContact}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>וואטסאפ</span>
              </button>
              <a
                href={`tel:${settings.phone || '054-7778899'}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-stone-600" />
                <span>חיוג לסטודיו</span>
              </a>
            </div>

          </div>

          {/* Client Identity Ribbon */}
          <div className="mt-6 pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/50 p-3 rounded-2xl">
            {clientSession ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#c783b9] text-white flex items-center justify-center font-bold text-sm">
                    {clientSession.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-stone-900">
                      שלום, {clientSession.name} ✨
                    </div>
                    <div className="text-[11px] text-stone-500" dir="ltr">
                      {clientSession.phone}
                    </div>
                  </div>
                </div>
                <button
                  onClick={clientLogout}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  החלפת לקוחה / יציאה
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
                <div className="text-xs text-stone-600 text-center sm:text-right">
                  <span className="font-bold text-stone-800">היי לקוחה יקרה!</span> הזדהי במספר טלפון לצפייה בתורים שלך ולשמירת התור בקלות.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewClientForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-50 shadow-2xs"
                  >
                    התחברות / רישום מהיר
                  </button>
                  <button
                    onClick={() => handleQuickDemoClient('052-1112233', 'מיכל ישראלי')}
                    className="px-3 py-1.5 rounded-xl bg-pink-100 text-pink-900 text-xs font-bold hover:bg-pink-200"
                    title="כניסה כלקוחה קיימת לדוגמה"
                  >
                    כניסה כמיכל (דמו)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Portal Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'book'
                  ? 'bg-[#c783b9] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-rose-100'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>קביעת תור אונליין</span>
            </button>

            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'my-appointments'
                  ? 'bg-[#c783b9] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-rose-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>התורים שלי</span>
              {upcomingAppointments.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                  {upcomingAppointments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'about'
                  ? 'bg-[#c783b9] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-rose-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>אודות ומחירון</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Client Login Modal (if prompted or not logged in during booking) */}
        {isNewClientForm && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 relative">
              <button
                onClick={() => setIsNewClientForm(false)}
                className="absolute top-4 left-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-stone-900">הזדהות לקוחה</h3>
                <p className="text-xs text-stone-500 mt-1">
                  הזיני מספר טלפון כדי שנוכל לזהות אותך ולשלוח תזכורת
                </p>
              </div>

              <form onSubmit={(e) => { handleClientLogin(e); setIsNewClientForm(false); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    מספר טלפון נייד *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05X-XXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    שם מלא (עבור לקוחות חדשות)
                  </label>
                  <input
                    type="text"
                    placeholder="לדוגמה: יעל לוי"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  המשך לזימון תור
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 1. BOOKING TAB */}
        {activeTab === 'book' && (
          <div className="space-y-6">

            {/* Success Banner if just booked */}
            {lastBookedApt && (
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                      התור נרשם במערכת! 🎉
                    </div>
                    <h3 className="text-lg font-black text-stone-900">
                      תודה {lastBookedApt.clientName}, התור שלך ל{lastBookedApt.serviceName} נרשם בהצלחה
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      תאריך: <span className="font-bold">{formatHebrewDate(lastBookedApt.date, true)}</span> • שעה: <span className="font-bold">{lastBookedApt.startTime}</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      נשלח אליך תזכורת בוואטסאפ לקראת מועד הטיפול.
                    </p>

                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `היי ${settings.ownerName || 'אנסטסיה'}, קבעתי כרגע תור ל${lastBookedApt.serviceName} בתאריך ${lastBookedApt.date} בשעה ${lastBookedApt.startTime} ✨`
                          );
                          const cleanPhone = (settings.phone || '054-7778899').replace(/\D/g, '');
                          const intl = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
                          window.open(`https://wa.me/${intl}?text=${text}`, '_blank');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>שליחת אישור בוואטסאפ לסטודיו</span>
                      </button>
                      <button
                        onClick={() => {
                          setLastBookedApt(null);
                          setActiveTab('my-appointments');
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                      >
                        צפייה בכל התורים שלי
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Progress Bar */}
            <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <div className={`flex items-center gap-2 ${bookingStep >= 1 ? 'text-[#8e397c]' : 'text-stone-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${bookingStep >= 1 ? 'bg-[#c783b9] text-white' : 'bg-stone-100'}`}>
                    1
                  </span>
                  <span>בחירת שירות</span>
                </div>
                <div className="w-8 sm:w-16 h-0.5 bg-stone-200"></div>
                <div className={`flex items-center gap-2 ${bookingStep >= 2 ? 'text-[#8e397c]' : 'text-stone-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${bookingStep >= 2 ? 'bg-[#c783b9] text-white' : 'bg-stone-100'}`}>
                    2
                  </span>
                  <span>תאריך ושעה</span>
                </div>
                <div className="w-8 sm:w-16 h-0.5 bg-stone-200"></div>
                <div className={`flex items-center gap-2 ${bookingStep >= 3 ? 'text-[#8e397c]' : 'text-stone-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${bookingStep >= 3 ? 'bg-[#c783b9] text-white' : 'bg-stone-100'}`}>
                    3
                  </span>
                  <span>אישור תור</span>
                </div>
              </div>
            </div>

            {/* STEP 1: SERVICE SELECTION */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-stone-900">בחרי את הטיפול המבוקש</h2>
                  <span className="text-xs text-stone-500">כל השירותים כוללים חיטוי וסטריליזציה ברמה רפואית</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {services.filter((s) => s.isActive).map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          setBookingStep(2);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-[#8e397c] bg-[#dfa8d3]/20 shadow-md'
                            : 'border-white hover:border-rose-200 bg-white shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-stone-900 text-base">{srv.name}</h3>
                            {srv.description && (
                              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                                {srv.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-3 text-xs text-stone-600 font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-rose-500" />
                                {srv.durationMinutes} דקות
                              </span>
                              <span className="text-stone-300">•</span>
                              <span className="text-sm font-black text-rose-700">
                                {formatCurrency(srv.price)}
                              </span>
                            </div>
                          </div>
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{ backgroundColor: `${srv.colorTag}15`, borderColor: srv.colorTag, color: srv.colorTag }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME SELECTION */}
            {bookingStep === 2 && selectedService && (
              <div className="space-y-5 bg-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-xs">
                
                {/* Selected service summary pill */}
                <div className="flex items-center justify-between p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#c783b9] text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-stone-900">{selectedService.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {selectedService.durationMinutes} דקות • {formatCurrency(selectedService.price)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingStep(1)}
                    className="text-xs text-[#8e397c] hover:underline font-bold"
                  >
                    החלפת טיפול
                  </button>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    בחרי תאריך הגעה
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    {formatHebrewDate(selectedDate, true)}
                  </p>
                </div>

                {/* Available Slots */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    שעות פנויות ביום זה ({availableSlots.length} משבצות זמינות)
                  </label>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                              isSelected
                                ? 'bg-[#c783b9] text-white shadow-md scale-105'
                                : 'bg-stone-50 hover:bg-rose-50 text-stone-800 border border-stone-200 hover:border-rose-300'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-rose-50/50 rounded-2xl border border-rose-100 text-stone-500 text-xs">
                      <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-1" />
                      <p className="font-bold text-stone-700">אין שעות פנויות בתאריך זה</p>
                      <p className="mt-1">הסטודיו מלא או סגור ביום זה. אנא בחרי תאריך אחר.</p>
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    חזרה לשירותים
                  </button>
                  <button
                    disabled={!selectedTime}
                    onClick={() => {
                      if (!clientSession) {
                        setIsNewClientForm(true);
                      } else {
                        setBookingStep(3);
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all ${
                      selectedTime
                        ? 'bg-[#c783b9] hover:bg-[#b874ab] active:scale-95'
                        : 'bg-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <span>המשך לפרטי אישור</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: CONFIRMATION & DETAILS */}
            {bookingStep === 3 && selectedService && selectedTime && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs space-y-5">
                <div className="text-center pb-4 border-b border-stone-100">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                    שלב אחרון
                  </span>
                  <h2 className="text-xl font-extrabold text-stone-900 mt-2">אישור וסיכום התור</h2>
                  <p className="text-xs text-stone-500 mt-1">בדקי שכל הפרטים מדויקים לפני האישור הסופי</p>
                </div>

                {/* Details Card */}
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">שם הלקוחה:</span>
                    <span className="font-extrabold text-stone-900">{clientSession?.name || 'אורחת'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">טלפון ליצירת קשר:</span>
                    <span className="font-extrabold text-stone-900" dir="ltr">{clientSession?.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">הטיפול שנבחר:</span>
                    <span className="font-extrabold text-rose-900">{selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">תאריך:</span>
                    <span className="font-extrabold text-stone-900">{formatHebrewDate(selectedDate, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">שעה משוערת:</span>
                    <span className="font-extrabold text-stone-900">{selectedTime} ({selectedService.durationMinutes} דק')</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-200/60 font-black">
                    <span className="text-stone-700">סכום לתשלום במקום:</span>
                    <span className="text-base text-rose-700">{formatCurrency(selectedService.price)}</span>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    הערות או בקשות מיוחדות (ציור, פרנץ', קישוטים, הסרת לק ישן וכו')
                  </label>
                  <textarea
                    rows={2}
                    placeholder="לדוגמה: יש לי לק ג'ל ישן שצריך להסיר, אשמח לעיצוב פרנץ' עדין"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    חזרה לבחירת שעה
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-sm shadow-lg shadow-[#c783b9]/40 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>אישור וקביעת התור סופית</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 2. MY APPOINTMENTS TAB */}
        {activeTab === 'my-appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">התורים שלי</h2>
                <p className="text-xs text-stone-500 mt-0.5">מעקב אחר תורים עתידיים והיסטוריית טיפולים בסטודיו</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('book');
                  setBookingStep(1);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold shadow-xs"
              >
                + קביעת תור חדש
              </button>
            </div>

            {/* If no user session */}
            {!clientSession ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-rose-100 shadow-2xs">
                <User className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                <h3 className="font-extrabold text-stone-900 text-base">הזדהות לצפייה בתורים</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                  אנא הזיני את מספר הטלפון שלך כדי שנוכל להציג את התורים האישיים שנקבעו עבורך.
                </p>
                <button
                  onClick={() => setIsNewClientForm(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#c783b9] text-white font-extrabold text-xs shadow-md"
                >
                  הזנת מספר טלפון
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Upcoming */}
                <div>
                  <h3 className="text-xs font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                    <CalendarCheck2 className="w-4 h-4 text-rose-600" />
                    תורים קרובים ({upcomingAppointments.length})
                  </h3>

                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              <span>{apt.startTime}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-stone-900 text-base">{apt.serviceName}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  apt.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {apt.status === 'confirmed' ? 'מאושר ביומן' : 'ממתין לאישור'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 mt-1">
                                📅 {formatHebrewDate(apt.date, true)} • {apt.durationMinutes} דקות
                              </p>
                              {apt.notes && (
                                <p className="text-xs text-stone-400 mt-1 italic">
                                  הערה: {apt.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                            <div className="text-sm font-black text-stone-900 sm:text-left pl-3">
                              {formatCurrency(apt.price)}
                            </div>
                            <button
                              onClick={() => {
                                const text = encodeURIComponent(
                                  `היי ${settings.ownerName || 'אנסטסיה'}, רציתי לשאול לגבי התור שלי ל${apt.serviceName} בתאריך ${apt.date}`
                                );
                                const cleanPhone = (settings.phone || '054-7778899').replace(/\D/g, '');
                                const intl = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
                                window.open(`https://wa.me/${intl}?text=${text}`, '_blank');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              <span>וואטסאפ לסטודיו</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('האם את בטוחה שברצונך לבטל תור זה?')) {
                                  deleteAppointment(apt.id);
                                  addToast('info', 'התור בוטל');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold"
                            >
                              ביטול תור
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-rose-100 text-stone-500 text-xs">
                      אין לך תורים עתידיים כרגע. מוזמנת לקבוע תור חדש!
                    </div>
                  )}
                </div>

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 mb-2">היסטוריית טיפולים קודמים</h3>
                    <div className="bg-white rounded-2xl divide-y divide-stone-100 border border-stone-100">
                      {pastAppointments.map((apt) => (
                        <div key={apt.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-800">{apt.serviceName}</span>
                            <span className="text-stone-400 mx-2">•</span>
                            <span className="text-stone-500">{formatHebrewDate(apt.date)}</span>
                          </div>
                          <span className="text-stone-400 font-semibold">{formatCurrency(apt.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* 3. ABOUT & PRICING TAB */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs">
              <h2 className="text-xl font-extrabold text-stone-900 mb-2">
                אודות הסטודיו של {settings.ownerName || 'אנסטסיה'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                סטודיו בוטיק המתמחה במניקור מקצועי, מבנה אנטומי מושלם, שיקום ציפורניים טבעיות והארכות.
                כל הטיפולים מתבצעים עם חומרי הפרימיום המובילים בעולם תחת הקפדה יתרה על יופי ומקצועיות ללא פשרות.
              </p>

              {/* Working Hours Display */}
              <div className="mt-6 pt-5 border-t border-stone-100">
                <h3 className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  שעות פעילות הסטודיו
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(settings.workingHours).map(([dayIdx, rawSched]) => {
                    const sched = rawSched as DaySchedule;
                    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                    const dayName = days[Number(dayIdx)] || '';
                    return (
                      <div key={dayIdx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="font-bold text-stone-800">יום {dayName}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {sched.isOpen ? `${sched.start} - ${sched.end}` : 'סגור'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Full Services & Pricing */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs">
              <h3 className="text-lg font-extrabold text-stone-900 mb-4">מחירון שירותים מלא</h3>
              <div className="divide-y divide-rose-50">
                {services.map((srv) => (
                  <div key={srv.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">{srv.name}</div>
                      {srv.description && (
                        <p className="text-xs text-stone-500 mt-0.5">{srv.description}</p>
                      )}
                      <span className="text-[11px] text-rose-500 font-semibold">{srv.durationMinutes} דקות</span>
                    </div>
                    <div className="text-base font-black text-stone-900 shrink-0">
                      {formatCurrency(srv.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
