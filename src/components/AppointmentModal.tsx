import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppointmentStatus } from '../types';
import { calculateEndTime, formatCurrency, getRelativeDate } from '../utils/dateUtils';
import { X, Calendar, Clock, User, Phone, Sparkles, AlertCircle, FileText } from 'lucide-react';

export const AppointmentModal: React.FC = () => {
  const {
    isAppointmentModalOpen,
    editingAppointment,
    defaultDateForNewAppointment,
    defaultTimeForNewAppointment,
    closeAppointmentModal,
    addAppointment,
    updateAppointment,
    clients,
    services,
    addClient,
  } = useApp();

  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [price, setPrice] = useState<number>(130);
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Synchronize on modal open or editingAppointment change
  useEffect(() => {
    if (!isAppointmentModalOpen) {
      setErrorMsg('');
      return;
    }

    if (editingAppointment) {
      // Editing existing appointment
      setClientMode('existing');
      setSelectedClientId(editingAppointment.clientId);
      setClientName(editingAppointment.clientName);
      setClientPhone(editingAppointment.clientPhone);
      setServiceId(editingAppointment.serviceId);
      setServiceName(editingAppointment.serviceName);
      setDate(editingAppointment.date);
      setStartTime(editingAppointment.startTime);
      setDurationMinutes(editingAppointment.durationMinutes);
      setPrice(editingAppointment.price);
      setStatus(editingAppointment.status);
      setNotes(editingAppointment.notes || '');
    } else {
      // Creating new appointment
      setClientMode(clients.length > 0 ? 'existing' : 'new');
      setSelectedClientId(clients.length > 0 ? clients[0].id : '');
      if (clients.length > 0) {
        setClientName(clients[0].fullName);
        setClientPhone(clients[0].phone);
      } else {
        setClientName('');
        setClientPhone('');
      }

      // Default service
      const defaultSrv = services[0] || { id: 'srv-1', name: "לק ג'ל טבעי", durationMinutes: 60, price: 130 };
      setServiceId(defaultSrv.id);
      setServiceName(defaultSrv.name);
      setDurationMinutes(defaultSrv.durationMinutes);
      setPrice(defaultSrv.price);

      // Default date & time
      setDate(defaultDateForNewAppointment || getRelativeDate(0));
      setStartTime(defaultTimeForNewAppointment || '10:00');
      setStatus('confirmed');
      setNotes('');
    }
    setErrorMsg('');
  }, [isAppointmentModalOpen, editingAppointment, defaultDateForNewAppointment, defaultTimeForNewAppointment, clients, services]);

  // Handle existing client select change
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.fullName);
      setClientPhone(client.phone);
    }
  };

  // Handle service change
  const handleServiceChange = (srvId: string) => {
    setServiceId(srvId);
    const srv = services.find((s) => s.id === srvId);
    if (srv) {
      setServiceName(srv.name);
      setDurationMinutes(srv.durationMinutes);
      setPrice(srv.price);
    }
  };

  if (!isAppointmentModalOpen) return null;

  const calculatedEndTime = calculateEndTime(startTime, durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim()) {
      setErrorMsg('אנא הזיני את שם הלקוחה');
      return;
    }
    if (!clientPhone.trim()) {
      setErrorMsg('אנא הזיני מספר טלפון');
      return;
    }
    if (!date) {
      setErrorMsg('אנא בחרי תאריך');
      return;
    }
    if (!startTime) {
      setErrorMsg('אנא בחרי שעת התחלה');
      return;
    }

    let finalClientId = selectedClientId;

    // If adding a new client on the fly
    if (clientMode === 'new' || !finalClientId) {
      const createdClient = addClient({
        fullName: clientName.trim(),
        phone: clientPhone.trim(),
        notes: notes ? `הערה מהתור הראשון: ${notes}` : '',
      });
      finalClientId = createdClient.id;
    }

    const payload = {
      clientId: finalClientId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId,
      serviceName,
      date,
      startTime,
      endTime: calculatedEndTime,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      status,
      notes: notes.trim(),
      reminderSent: editingAppointment ? editingAppointment.reminderSent : false,
    };

    if (editingAppointment) {
      const res = updateAppointment(editingAppointment.id, payload);
      if (res.success) {
        closeAppointmentModal();
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } else {
      const res = addAppointment(payload);
      if (res.success) {
        closeAppointmentModal();
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#dfa8d3]/40 bg-gradient-to-r from-[#dfa8d3]/40 via-[#edcae5]/20 to-[#dfa8d3]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c783b9]/20 text-[#8f367e] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900">
                {editingAppointment ? 'עריכת תור קיים' : 'קביעת תור חדש'}
              </h3>
              <p className="text-xs text-stone-500">
                {editingAppointment ? 'עדכני את פרטי התור' : 'מלאי את הפרטים, המערכת תבדוק זמינות אוטומטית'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAppointmentModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Client Selection / Creation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>פרטי הלקוחה *</span>
              </label>
              {!editingAppointment && (
                <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      clientMode === 'existing'
                        ? 'bg-[#c783b9] text-white font-bold shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    לקוחה קיימת
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode('new');
                      setSelectedClientId('');
                      setClientName('');
                      setClientPhone('');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      clientMode === 'new'
                        ? 'bg-[#c783b9] text-white font-bold shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    לקוחה חדשה +
                  </button>
                </div>
              )}
            </div>

            {clientMode === 'existing' && !editingAppointment ? (
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="שם מלא (לדוגמה: יעל כהן)"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="מספר טלפון (05X-XXXXXXX)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-right"
                    dir="ltr"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label className="text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>סוג הטיפול *</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} דק׳ - {formatCurrency(s.price)})
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>תאריך *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>שעת התחלה *</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              />
            </div>
          </div>

          {/* Duration, Calculated End Time, and Price */}
          <div className="grid grid-cols-3 gap-2.5 bg-rose-50/40 p-3 rounded-xl border border-rose-100">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                משך טיפול
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800"
              >
                <option value={30}>30 דק׳</option>
                <option value={45}>45 דק׳</option>
                <option value={60}>60 דק׳ (שעה)</option>
                <option value={75}>75 דק׳</option>
                <option value={90}>90 דק׳ (שעה וחצי)</option>
                <option value={105}>105 דק׳</option>
                <option value={120}>120 דק׳ (שעתיים)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                שעת סיום משוערת
              </label>
              <div className="px-2 py-1.5 rounded-lg bg-stone-100/80 text-xs font-bold text-stone-700 text-center">
                {calculatedEndTime || '--:--'}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                מחיר (₪)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-rose-700 text-center"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="text-xs font-bold text-stone-700 mb-1.5 block">
              סטטוס התור
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'pending', label: 'ממתין לאישור', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                { id: 'confirmed', label: 'מאושר', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                { id: 'completed', label: 'בוצע', color: 'border-purple-300 text-purple-800 bg-purple-50' },
                { id: 'cancelled', label: 'בוטל', color: 'border-rose-300 text-rose-800 bg-rose-50' },
                { id: 'no_show', label: 'לא הגיעה', color: 'border-stone-300 text-stone-700 bg-stone-100' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStatus(item.id as AppointmentStatus)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    status === item.id
                      ? `${item.color} font-bold ring-2 ring-stone-900/10 shadow-xs`
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>הערות לתור (אופציונלי)</span>
            </label>
            <textarea
              rows={2}
              placeholder="לדוגמה: מעוניינת בציור ידני של פרפר, ציפורניים רגישות..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={closeAppointmentModal}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-bold text-sm shadow-md shadow-[#c783b9]/40 transition-all active:scale-95"
            >
              {editingAppointment ? 'שמירת שינויים' : 'קביעת תור חדש'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
