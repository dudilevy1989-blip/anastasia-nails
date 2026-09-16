import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Calendar,
  XCircle,
  Users,
  Award,
  DollarSign,
} from 'lucide-react';
import { formatCurrency, getRelativeDate } from '../utils/dateUtils';

export const ReportsView: React.FC = () => {
  const { appointments, services, clients } = useApp();

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const todayStr = getRelativeDate(0);
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Filter appointments according to selected timeframe
  const filteredAppointments = appointments.filter((apt) => {
    if (timeframe === 'today') {
      return apt.date === todayStr;
    }
    if (timeframe === 'week') {
      const aptDate = new Date(apt.date);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return aptDate >= startOfWeek && aptDate <= endOfWeek;
    }
    if (timeframe === 'month') {
      return apt.date.startsWith(currentMonthStr);
    }
    return true; // 'all'
  });

  const activeAppointments = filteredAppointments.filter((a) => a.status !== 'cancelled');
  const cancelledAppointments = filteredAppointments.filter((a) => a.status === 'cancelled');
  const noShowAppointments = filteredAppointments.filter((a) => a.status === 'no_show');

  // Revenue metrics
  const totalRevenue = activeAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
  const avgRevenuePerTreatment = activeAppointments.length > 0
    ? Math.round(totalRevenue / activeAppointments.length)
    : 0;

  // Compute popularity of services
  const serviceStatsMap: Record<string, { name: string; count: number; revenue: number }> = {};

  services.forEach((s) => {
    serviceStatsMap[s.id] = { name: s.name, count: 0, revenue: 0 };
  });

  activeAppointments.forEach((apt) => {
    if (!serviceStatsMap[apt.serviceId]) {
      serviceStatsMap[apt.serviceId] = { name: apt.serviceName, count: 0, revenue: 0 };
    }
    serviceStatsMap[apt.serviceId].count += 1;
    serviceStatsMap[apt.serviceId].revenue += (apt.price || 0);
  });

  const sortedServices = Object.values(serviceStatsMap)
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  // New clients acquired this month
  const newClientsThisMonth = clients.filter((c) =>
    c.createdAt.startsWith(currentMonthStr)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Timeframe Tabs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            דוחות עסקיים וניתוח ביצועים
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            מעקב אחר הכנסות, רווחיות, טיפולים מבוקשים וביטולים
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === 'today'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            היום
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === 'week'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            השבוע
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === 'month'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            החודש
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeframe === 'all'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            הכל
          </button>
        </div>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-white to-emerald-50/40 p-5 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">סה״כ הכנסות בטווח</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ₪
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            ממוצע לטיפול: {formatCurrency(avgRevenuePerTreatment)}
          </p>
        </div>

        {/* Treatments Count */}
        <div className="bg-gradient-to-br from-white to-rose-50/40 p-5 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">כמות טיפולים</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {activeAppointments.length}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {activeAppointments.filter(a => a.status === 'completed').length} כבר הושלמו
          </p>
        </div>

        {/* New Clients */}
        <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">לקוחות חדשות</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900">
            {newClientsThisMonth}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            הצטרפו החודש למאגר
          </p>
        </div>

        {/* Cancellations & No Shows */}
        <div className="bg-gradient-to-br from-white to-stone-50 p-5 rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">ביטולים ואי-הגעה</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {cancelledAppointments.length + noShowAppointments.length}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {cancelledAppointments.length} ביטולים • {noShowAppointments.length} לא הגיעו
          </p>
        </div>

      </div>

      {/* Popular Services Breakdown */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              השירותים הפופולריים והרווחיים ביותר
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              פילוח כמות ביצוע והכנסה לפי סוג טיפול
            </p>
          </div>
        </div>

        {sortedServices.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 italic">
            אין נתוני טיפולים בטווח התאריכים שנבחר.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedServices.map((service, index) => {
              const maxCount = sortedServices[0]?.count || 1;
              const percentage = Math.round((service.count / maxCount) * 100);

              return (
                <div
                  key={service.name}
                  className="p-3.5 rounded-2xl border border-stone-100 bg-stone-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-extrabold text-stone-900">
                        {service.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-stone-500">
                        <strong className="text-stone-900">{service.count}</strong> טיפולים
                      </span>
                      <span className="font-extrabold text-emerald-700">
                        {formatCurrency(service.revenue)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
