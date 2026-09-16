import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Clock,
  Send,
  BarChart3,
  MoreHorizontal,
  X,
  ChevronLeft,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, appointments } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { id: 'calendar', label: 'יומן תורים', icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'clients', label: 'לקוחות', icon: Users },
    { id: 'services', label: 'מחירון ושירותים', icon: Sparkles },
    { id: 'schedule', label: 'שעות עבודה', icon: Clock },
    { id: 'reminders', label: 'תזכורות', icon: Send },
    { id: 'reports', label: 'דוחות והכנסות', icon: BarChart3 },
  ];

  // Mobile bottom bar main tabs (4 primary + 1 more)
  const mobilePrimaryTabs: NavItem[] = [
    { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { id: 'calendar', label: 'יומן', icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'clients', label: 'לקוחות', icon: Users },
    { id: 'services', label: 'שירותים', icon: Sparkles },
  ];

  const moreTabs: NavItem[] = [
    { id: 'schedule', label: 'שעות עבודה וחופשות', icon: Clock },
    { id: 'reminders', label: 'תזכורות והודעות', icon: Send },
    { id: 'reports', label: 'דוחות ורווחים', icon: BarChart3 },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-rose-100/80 min-h-[calc(100vh-5rem)] p-4 shrink-0">
        <div className="space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-rose-800/60">
            תפריט ראשי
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#dfa8d3]/25 text-[#8e397c] font-bold shadow-xs border border-[#dfa8d3]/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#8e397c]' : 'text-stone-400 group-hover:text-stone-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Small luxury advice box at bottom of sidebar */}
        <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/50 border border-rose-100 text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            יומן פעיל בזמן אמת
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            מערכת אימות אוטומטית מונעת כפילויות של תורים בשעות מקבילות.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Sheet Modal for "More" */}
      {isMoreMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-5 border-t border-rose-100 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <span className="font-extrabold text-sm text-stone-900">תפריט נוסף</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#dfa8d3]/25 text-[#8e397c] font-bold border border-[#dfa8d3]/60'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#c783b9] text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (5 perfectly balanced touch targets) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100/90 px-1.5 py-1.5 shadow-lg shadow-black/5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          {mobilePrimaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setActiveTab(item.id);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                  isActive ? 'text-[#8e397c] font-bold' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#8e397c] mt-0.5"></span>}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isMoreActive ? 'text-[#8e397c] font-bold' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">עוד...</span>
            {isMoreActive && <span className="w-1.5 h-1.5 rounded-full bg-[#8e397c] mt-0.5"></span>}
          </button>
        </div>
      </nav>
    </>
  );
};
