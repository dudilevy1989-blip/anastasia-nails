import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, LogOut, Heart } from 'lucide-react';
import { formatHebrewDate, getRelativeDate } from '../utils/dateUtils';
import { NailsLogo } from './NailsLogo';

export const Navbar: React.FC = () => {
  const { session, settings, openNewAppointmentModal, logout, appointments, setActiveTab, setAppMode } = useApp();

  const todayStr = getRelativeDate(0);
  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr && a.status !== 'cancelled'
  );
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100/80 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          
          {/* Logo & Business Brand (Properly spaced so the name is never cut off on mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <NailsLogo size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-stone-900 text-sm sm:text-lg tracking-tight whitespace-nowrap">
                  {settings.businessName || 'Anastasia Nails'}
                </h1>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border border-amber-300/60 rounded-full shrink-0">
                  יוקרתי & בוטיק
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="hidden sm:inline">{formatHebrewDate(todayStr, true)} • </span>
                <span>{todayAppointments.length} תורים להיום</span>
              </p>
            </div>
          </div>

          {/* Actions & Quick Create */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* View Client Portal Button */}
            <button
              onClick={() => setAppMode('client')}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border border-[#c783b9]/40 bg-pink-50/90 hover:bg-pink-100 text-[#8e397c] text-xs font-bold transition-all shadow-xs"
              title="צפייה בפורטל הלקוחות ובדף זימון התורים"
            >
              <Heart className="w-3.5 h-3.5 text-[#8e397c] fill-[#8e397c] shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">אזור לקוחה (תור אונליין)</span>
              <span className="inline sm:hidden whitespace-nowrap text-[11px]">אזור לקוחה</span>
            </button>

            {/* Prominent "+ קביעת תור חדש" Button */}
            <button
              onClick={() => openNewAppointmentModal()}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span className="inline sm:hidden font-bold text-[11px]">תור חדש</span>
              <span className="hidden sm:inline font-bold">קביעת תור חדש</span>
            </button>

            {/* Logout / User Info */}
            {session.isLoggedIn && (
              <div className="flex items-center gap-1 sm:gap-2">
                {session.user?.photoURL ? (
                  <img
                    src={session.user.photoURL}
                    alt={session.user.ownerName || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-rose-200 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                    title={session.user.email}
                  />
                ) : (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8e397c] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    title={session.user?.email}
                  >
                    {(session.user?.ownerName || 'A').charAt(0)}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
                  title="התנתקות מהמערכת"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
