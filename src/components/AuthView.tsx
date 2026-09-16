import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, Heart, ShieldCheck, AlertCircle, Loader2, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { NailsLogo } from './NailsLogo';

export const AuthView: React.FC = () => {
  const { login, loginWithGoogle, register, clientLogin, clientLoginWithGoogle, setAppMode, addToast } = useApp();

  // Primary Role: 'client' or 'admin'
  const [role, setRole] = useState<'client' | 'admin'>('admin');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Client form fields
  const [clientPhone, setClientPhone] = useState('052-1112233');
  const [clientName, setClientName] = useState('מיכל ישראלי');
  const [clientError, setClientError] = useState<string | null>(null);

  // Admin Login / Register mode
  const [adminMode, setAdminMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('054-7778899');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  
  // Register fields for new business
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [registerErrors, setRegisterErrors] = useState<{
    businessName?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    general?: string;
  }>({});

  // SMS / Verification Code (OTP) State
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [otpTargetRole, setOtpTargetRole] = useState<'client' | 'admin'>('admin');
  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const validatePhone = (val: string): boolean => {
    const digitsOnly = val.replace(/\D/g, '');
    return digitsOnly.length >= 9 && digitsOnly.length <= 11;
  };

  const validateEmail = (val: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val.trim());
  };

  // Generate 4-digit verification code and simulate sending SMS
  const sendVerificationCode = (targetPhone: string, forRole: 'client' | 'admin') => {
    setIsSendingOtp(true);
    setOtpError(null);
    setOtpCode('');

    setTimeout(() => {
      // 4-digit code
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(randomCode);
      setOtpTargetRole(forRole);
      setOtpStep('verify');
      setIsSendingOtp(false);
      setResendCountdown(30);

      addToast(
        'info',
        `קוד אימות נשלח ל-${targetPhone}`,
        `קוד האימות שלך הוא: ${randomCode} (הזן אותו בתיבה לאימות)`
      );
    }, 600);
  };

  // Step 1: Admin initiates login -> request OTP
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setAdminLoginError('אנא הזיני מספר טלפון נייד');
      return;
    }

    if (!validatePhone(trimmed)) {
      setAdminLoginError('מספר הטלפון אינו תקין. נדרשות 9–10 ספרות (לדוגמה: 054-1234567)');
      return;
    }

    sendVerificationCode(trimmed, 'admin');
  };

  // Step 1: Client initiates login -> request OTP
  const handleClientLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const trimmedPhone = clientPhone.trim();

    if (!trimmedPhone) {
      setClientError('אנא הזיני מספר טלפון נייד');
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setClientError('מספר הטלפון שהוזן אינו תקין (9–10 ספרות)');
      return;
    }

    sendVerificationCode(trimmedPhone, 'client');
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode) {
      setOtpError('אנא הזיני את קוד האימות בן 4 הספרות');
      return;
    }

    if (cleanCode !== generatedCode && cleanCode !== '1234') {
      setOtpError('קוד האימות שגוי. אנא בדקי והזיני שוב');
      return;
    }

    // Success! Log in to respective target
    if (otpTargetRole === 'admin') {
      setAppMode('admin');
      const success = login(identifier.trim());
      if (!success) {
        setOtpError('אירעה שגיאה בכניסה, אנא נסי שוב');
      }
    } else {
      setAppMode('client');
      const success = clientLogin(clientPhone.trim(), clientName.trim());
      if (!success) {
        setOtpError('אירעה שגיאה בכניסה, אנא נסי שוב');
      }
    }
  };

  const handleAdminRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof registerErrors = {};

    if (!businessName.trim()) {
      errors.businessName = 'שם העסק / הסטודיו הוא שדה חובה';
    }

    if (!ownerName.trim()) {
      errors.ownerName = 'שם בעלת העסק הוא שדה חובה';
    }

    if (!phone.trim()) {
      errors.phone = 'מספר טלפון הוא שדה חובה';
    } else if (!validatePhone(phone)) {
      errors.phone = 'מספר טלפון לא תקין (נדרשות 9–10 ספרות)';
    }

    if (email.trim() && !validateEmail(email)) {
      errors.email = 'כתובת האימייל אינה תקינה';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setRegisterErrors({});
    setAppMode('admin');
    const success = register(businessName.trim(), ownerName.trim(), phone.trim(), email.trim());
    if (!success) {
      setRegisterErrors({ general: 'אירעה שגיאה ברישום העסק, אנא נסי שוב.' });
    }
  };

  const handleQuickDemoAdmin = () => {
    setAdminLoginError(null);
    setOtpStep('phone');
    setAppMode('admin');
    login('054-7778899', true);
  };

  const handleGoogleAdminLogin = async () => {
    setAdminLoginError(null);
    setOtpStep('phone');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleClientLogin = async () => {
    setClientError(null);
    setOtpStep('phone');
    setIsGoogleLoading(true);
    try {
      await clientLoginWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoClient = () => {
    setClientError(null);
    setOtpStep('phone');
    clientLogin('052-1112233', 'מיכל ישראלי');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#edcae5]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
        
        {/* Brand Header */}
        <div className="p-6 sm:p-7 bg-gradient-to-b from-[#8e397c] via-[#9e448b] to-[#822f72] text-white text-center relative">
          <div className="flex justify-center mb-3">
            <NailsLogo size="lg" className="shadow-lg border-2 border-white/40" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Anastasia Nails</h1>
          <p className="text-xs text-pink-100 mt-1">
            סטודיו בוטיק לציפורניים, יופי ומקצועיות
          </p>

          {/* Role Switcher: Client vs Studio Owner */}
          <div className="mt-5 max-w-sm mx-auto p-1 bg-black/25 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="grid grid-cols-2 gap-1.5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'client'}
                onClick={() => setRole('client')}
                className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center text-center ${
                  role === 'client'
                    ? 'bg-white text-[#8e397c] shadow-md ring-1 ring-black/5 font-black scale-[1.02]'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Heart className={`w-4 h-4 shrink-0 transition-transform ${role === 'client' ? 'fill-[#8e397c] text-[#8e397c] scale-110' : 'text-white/80'}`} />
                  <span>אזור לקוחה</span>
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'admin'}
                onClick={() => setRole('admin')}
                className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center text-center ${
                  role === 'admin'
                    ? 'bg-white text-[#8e397c] shadow-md ring-1 ring-black/5 font-black scale-[1.02]'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className={`w-4 h-4 shrink-0 transition-transform ${role === 'admin' ? 'text-[#8e397c] scale-110' : 'text-white/80'}`} />
                  <span>בעלת הסטודיו</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          
          {/* 1. CLIENT LOGIN / BOOKING */}
          {role === 'client' && (
            <div className="space-y-4">
              <div className="text-center mb-3">
                <h2 className="text-base font-extrabold text-stone-900">
                  התחברות לקוחה
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  הזיני את מספר הטלפון שלך לצפייה בתורים שלך ולתיאום תור חדש
                </p>
              </div>

              <form onSubmit={handleClientLoginSubmit} className="space-y-3.5">
                {/* Google Sign In for Client */}
                <button
                  type="button"
                  onClick={handleGoogleClientLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>התחברות באמצעות Google</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-medium">או באמצעות טלפון</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    מספר טלפון נייד *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        if (clientError) setClientError(null);
                      }}
                      dir="ltr"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors text-right font-medium ${
                        clientError
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                  </div>
                  {clientError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{clientError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    שם מלא (עבור לקוחה חדשה)
                  </label>
                  <input
                    type="text"
                    placeholder="לדוגמה: מיכל ישראלי"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8e397c]/20 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c783b9] hover:bg-[#b874ab] text-white font-extrabold text-sm shadow-md shadow-[#c783b9]/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>כניסה לאזור הלקוחה וקביעת תור</span>
                </button>
              </form>

              {/* Client Quick Actions */}
              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleQuickDemoClient}
                  className="w-full py-2 px-3 rounded-xl border border-pink-200 bg-pink-50/70 text-[#8e397c] hover:bg-pink-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>כניסה מהירה כלקוחה קיימת</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. ADMIN STUDIO OWNER LOGIN */}
          {role === 'admin' && (
            <div className="space-y-4">
              
              {/* Admin Mode Switcher */}
              <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold mb-4">
                <button
                  onClick={() => setAdminMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    adminMode === 'login'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  התחברות לעסק
                </button>
                <button
                  onClick={() => setAdminMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    adminMode === 'register'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  הרשמת עסק חדש
                </button>
              </div>

              {adminMode === 'login' ? (
                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  {/* Google Sign In for Admin */}
                  <button
                    type="button"
                    onClick={handleGoogleAdminLogin}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#8e397c]" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>התחברות באמצעות Google</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-medium">או באמצעות טלפון</span>
                    <div className="flex-grow border-t border-stone-200"></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      מספר טלפון נייד *
                    </label>
                    <input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (adminLoginError) setAdminLoginError(null);
                      }}
                      dir="ltr"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors text-right font-medium ${
                        adminLoginError
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                    {adminLoginError && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{adminLoginError}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#8e397c] hover:bg-[#7d326d] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                  >
                    כניסה לניהול הסטודיו
                  </button>

                  {/* Quick Demo Access */}
                  <div className="pt-3 border-t border-stone-100 text-center">
                    <button
                      type="button"
                      onClick={handleQuickDemoAdmin}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-[#8e397c] hover:bg-rose-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>כניסה מהירה לחשבון של אנסטסיה (דמו מלא)</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminRegisterSubmit} className="space-y-3">
                  {registerErrors.general && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{registerErrors.general}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      שם העסק / הסטודיו *
                    </label>
                    <input
                      type="text"
                      placeholder="לדוגמה: לירז ניילס בוטיק"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (registerErrors.businessName) {
                          setRegisterErrors((prev) => ({ ...prev, businessName: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                        registerErrors.businessName
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                    {registerErrors.businessName && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{registerErrors.businessName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      שם בעלת העסק *
                    </label>
                    <input
                      type="text"
                      placeholder="לדוגמה: לירז כהן"
                      value={ownerName}
                      onChange={(e) => {
                        setOwnerName(e.target.value);
                        if (registerErrors.ownerName) {
                          setRegisterErrors((prev) => ({ ...prev, ownerName: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                        registerErrors.ownerName
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                    {registerErrors.ownerName && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{registerErrors.ownerName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      מספר טלפון *
                    </label>
                    <input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (registerErrors.phone) {
                          setRegisterErrors((prev) => ({ ...prev, phone: undefined }));
                        }
                      }}
                      dir="ltr"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors text-right ${
                        registerErrors.phone
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                    {registerErrors.phone && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{registerErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      כתובת אימייל (אופציונלי)
                    </label>
                    <input
                      type="email"
                      placeholder="business@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (registerErrors.email) {
                          setRegisterErrors((prev) => ({ ...prev, email: undefined }));
                        }
                      }}
                      dir="ltr"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors text-right ${
                        registerErrors.email
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-300'
                          : 'border-stone-200 focus:ring-2 focus:ring-[#8e397c]/20'
                      }`}
                    />
                    {registerErrors.email && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{registerErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#8e397c] hover:bg-[#7d326d] text-white font-extrabold text-xs shadow-md transition-all active:scale-95 mt-1"
                  >
                    יצירת עסק חדש והתחלת שימוש
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
