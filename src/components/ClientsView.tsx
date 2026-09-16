import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Edit2,
  Trash2,
  X,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import {
  formatCurrency,
  formatHebrewDate,
  createWhatsAppUrl,
  getStatusDetails,
} from '../utils/dateUtils';
import { Client } from '../types';

export const ClientsView: React.FC = () => {
  const {
    clients,
    appointments,
    addClient,
    updateClient,
    deleteClient,
    openNewAppointmentModal,
    viewingClientId,
    openClientModal,
    closeClientModal,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Editing notes state inside client modal
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Filter clients
  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const viewingClient = clients.find((c) => c.id === viewingClientId) || null;

  // Appointments for this viewing client
  const clientAppointments = viewingClient
    ? appointments
        .filter((a) => a.clientId === viewingClient.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) return;

    addClient({
      fullName: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim() || undefined,
      notes: newClientNotes.trim() || undefined,
    });

    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientNotes('');
    setIsAddClientModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header & Search */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            ניהול לקוחות ({clients.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            מאגר הלקוחות, היסטוריית טיפולים והעדפות אישיות
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="חיפוש לפי שם או טלפון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            />
          </div>

          {/* Add Client Button */}
          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#c783b9]/40 hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>לקוחה חדשה</span>
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">לא נמצאו לקוחות מתאימות</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            נסי לחפש שם אחר או הוסיפי לקוחה חדשה למאגר.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            // Compute next upcoming appointment for client
            const nextApt = appointments.find(
              (a) =>
                a.clientId === client.id &&
                a.date >= new Date().toISOString().split('T')[0] &&
                a.status !== 'cancelled'
            );

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100/80 hover:border-rose-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center ${
                          client.avatarColor || 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {client.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-base hover:text-rose-600 transition-colors">
                          {client.fullName}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono mt-0.5" dir="ltr">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-[11px] text-stone-400 block">סך הוצאות:</span>
                      <span className="font-extrabold text-stone-900">
                        {formatCurrency(client.totalSpent || 0)}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-[11px] text-stone-400 block">ביקורים:</span>
                      <span className="font-extrabold text-stone-900">
                        {client.totalVisits || 0} טיפולים
                      </span>
                    </div>
                  </div>

                  {/* Next Appointment Alert */}
                  <div className="mt-3 text-xs">
                    {nextApt ? (
                      <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-900 flex items-center justify-between">
                        <span className="font-semibold">תור הבא:</span>
                        <span className="font-bold">
                          {nextApt.date} ב-{nextApt.startTime}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-stone-50 text-stone-400 text-center">
                        אין תור עתידי מתוכנן
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => openClientModal(client.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold transition-all shadow-xs text-center"
                  >
                    כרטיס לקוחה מלא
                  </button>

                  <a
                    href={createWhatsAppUrl(
                      client.phone,
                      `היי ${client.fullName}! 💅 מה שלומך? פונה אלייך מ-${settings.businessName || 'Anastasia Nails'} לגבי התור הבא שלך.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                    title="שליחת הודעה בוואטסאפ"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <a
                    href={`tel:${client.phone}`}
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

      {/* Individual Client Details Modal (כרטיס לקוחה אישי) */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50/60 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center ${
                    viewingClient.avatarColor || 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {viewingClient.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900">
                    {viewingClient.fullName}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono" dir="ltr">
                    {viewingClient.phone} {viewingClient.email ? `• ${viewingClient.email}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={closeClientModal}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-sm">
              
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-center">
                  <span className="text-xs text-stone-500 block">סך הוצאות מצטבר</span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(viewingClient.totalSpent || 0)}
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-center">
                  <span className="text-xs text-stone-500 block">סך כל הטיפולים</span>
                  <span className="text-lg font-black text-stone-900">
                    {viewingClient.totalVisits || 0}
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-center">
                  <span className="text-xs text-stone-500 block">ביקור אחרון</span>
                  <span className="text-sm font-bold text-stone-700">
                    {viewingClient.lastVisit || 'טרם התבצע'}
                  </span>
                </div>
              </div>

              {/* Personal Notes (עריכת העדפות אישיות) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    הערות אישיות והעדפות לקוחה
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => {
                        setEditedNotes(viewingClient.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
                    >
                      עריכת הערה
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateClient(viewingClient.id, { notes: editedNotes.trim() });
                        setIsEditingNotes(false);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      שמירת הערה ✓
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={3}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="הזיני העדפות לקוחה (למשל: סוג מבנה ציפורן, רגישויות, צבעים אהובים...)"
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {viewingClient.notes || 'אין הערות אישיות מיוחדות ללקוחה זו.'}
                  </p>
                )}
              </div>

              {/* Direct Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    closeClientModal();
                    openNewAppointmentModal();
                  }}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>קביעת תור חדש</span>
                </button>

                <a
                  href={createWhatsAppUrl(
                    viewingClient.phone,
                    `היי ${viewingClient.fullName}! 💅 מה שלומך?`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${viewingClient.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>חיוג</span>
                </a>

                <button
                  onClick={() => {
                    if (confirm(`האם את בטוחה שברצונך למחוק את הלקוחה ${viewingClient.fullName}?`)) {
                      deleteClient(viewingClient.id);
                    }
                  }}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="מחיקת לקוחה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Appointments & Treatments History */}
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  היסטוריית טיפולים ותורים ({clientAppointments.length})
                </h4>

                {clientAppointments.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-center text-xs text-stone-500">
                    טרם נרשמו תורים ללקוחה זו.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {clientAppointments.map((apt) => {
                      const st = getStatusDetails(apt.status);
                      return (
                        <div
                          key={apt.id}
                          className="p-3 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-stone-900">{apt.serviceName}</div>
                            <div className="text-stone-500 text-[11px] mt-0.5">
                              {formatHebrewDate(apt.date)} • {apt.startTime} ({apt.durationMinutes} דק׳)
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-stone-900">
                              {formatCurrency(apt.price)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}
                            >
                              {st.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-stone-900 text-base">הוספת לקוחה חדשה למאגר</h3>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  שם מלא *
                </label>
                <input
                  type="text"
                  placeholder="לדוגמה: שני כהן"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  מספר טלפון *
                </label>
                <input
                  type="tel"
                  placeholder="05X-XXXXXXX"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  כתובת אימייל (אופציונלי)
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  הערות / העדפות אישיות
                </label>
                <textarea
                  rows={2}
                  placeholder="העדפות ציפורניים, סוג עור, צבעים מועדפים..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold shadow-md shadow-[#c783b9]/40 active:scale-95 transition-all"
                >
                  שמירת לקוחה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
