import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  Tag,
} from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';
import { ServiceItem } from '../types';

export const ServicesView: React.FC = () => {
  const { services, addService, updateService, deleteService } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(130);
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState('#f43f5e');

  const COLOR_PALETTE = [
    '#f43f5e', // rose-500
    '#ec4899', // pink-500
    '#d946ef', // fuchsia-500
    '#a855f7', // purple-500
    '#6366f1', // indigo-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
  ];

  const handleOpenNew = () => {
    setEditingService(null);
    setName('');
    setDurationMinutes(60);
    setPrice(140);
    setDescription('');
    setColorTag('#f43f5e');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setDurationMinutes(srv.durationMinutes);
    setPrice(srv.price);
    setDescription(srv.description || '');
    setColorTag(srv.colorTag || '#f43f5e');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description: description.trim() || undefined,
        colorTag,
      });
    } else {
      addService({
        name: name.trim(),
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description: description.trim() || undefined,
        colorTag,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            ניהול שירותים ומחירון ({services.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            הגדירי את מגוון הטיפולים, משך הזמן והמחירים של העסק שלך
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#c783b9]/40 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>הוספת שירות חדש</span>
        </button>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100/80 hover:border-rose-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: srv.colorTag || '#f43f5e' }}
                  />
                  <h3 className="font-extrabold text-stone-900 text-base">
                    {srv.name}
                  </h3>
                </div>

                <div className="text-left shrink-0">
                  <span className="font-black text-stone-900 text-base">
                    {formatCurrency(srv.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {srv.description && (
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {srv.description}
                </p>
              )}

              {/* Timing badge */}
              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-700 bg-rose-50/70 border border-rose-100 px-2.5 py-1 rounded-lg w-fit">
                <Clock className="w-3.5 h-3.5" />
                <span>משך טיפול: {srv.durationMinutes} דקות</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateService(srv.id, { isActive: !srv.isActive })}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    srv.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {srv.isActive ? 'פעיל במחירון' : 'מושהה'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
                  title="עריכת שירות"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`האם את בטוחה שברצונך למחוק את השירות "${srv.name}"?`)) {
                      deleteService(srv.id);
                    }
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="מחיקת שירות"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-stone-900 text-base">
                  {editingService ? 'עריכת שירות' : 'הוספת שירות חדש'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  שם הטיפול / השירות *
                </label>
                <input
                  type="text"
                  placeholder="לדוגמה: לק ג'ל טבעי, בנייה בגל..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    משך טיפול (דקות) *
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות (שעה)</option>
                    <option value={75}>75 דקות</option>
                    <option value={90}>90 דקות (שעה וחצי)</option>
                    <option value={105}>105 דקות</option>
                    <option value={120}>120 דקות (שעתיים)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    מחיר (₪) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  תיאור קצר (אופציונלי)
                </label>
                <textarea
                  rows={2}
                  placeholder="מה הטיפול כולל..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                />
              </div>

              {/* Color Tag picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  צבע תגית ליומן
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorTag(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        colorTag === c ? 'scale-125 ring-2 ring-stone-900 shadow-xs' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white text-xs font-bold shadow-md shadow-[#c783b9]/40 active:scale-95 transition-all"
                >
                  {editingService ? 'שמירת שינויים' : 'הוספת שירות'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
