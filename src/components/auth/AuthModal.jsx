import React, { useState, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, LogIn, UserPlus, Github, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthService, supabase } from '../../services/SupabaseService';
export { EmailSentModal } from './EmailConfirmation';

const AuthHeader = ({ mode, onClose }) => (
    <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
            <DialogTitle as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                {mode === 'login' ? <LogIn size={20} className="text-indigo-400" /> : <UserPlus size={20} className="text-indigo-400" />}
                {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
                {mode === 'login' ? 'Kaldığın yerden devam et' : 'Dil öğrenme yolculuğuna başla'}
            </p>
        </div>
        <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            aria-label="Kapat"
        >
            <X size={20} />
        </button>
    </div>
);

AuthHeader.propTypes = {
    mode: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

const OAuthButtons = ({ loading, onOAuth }) => (
    <div className="grid grid-cols-2 gap-3 mb-6">
        <button
            type="button"
            onClick={() => onOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
        </button>
        <button
            type="button"
            onClick={() => onOAuth('github')}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
            <Github size={18} />
            GitHub
        </button>
    </div>
);

OAuthButtons.propTypes = {
    loading: PropTypes.bool,
    onOAuth: PropTypes.func.isRequired
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showEmailSent, setShowEmailSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userName: '',
        confirmPassword: ''
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Şifreler eşleşmiyor');
        }
        if (formData.password.length < 6) {
            throw new Error('Şifre en az 6 karakter olmalı');
        }
        if (!formData.userName.trim()) {
            throw new Error('Kullanıcı adı gerekli');
        }

        const result = await AuthService.signUp(
            formData.email,
            formData.password,
            formData.userName
        );

        if (result.user?.identities?.length === 0) {
            throw new Error('Bu email zaten kayıtlı');
        }

        if (result.user && !result.user.confirmed_at) {
            setRegisteredEmail(formData.email);
            setShowEmailSent(true);
        } else {
            setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
            setTimeout(() => setMode('login'), 2000);
        }
    };

    const handleLogin = async () => {
        const result = await AuthService.signIn(formData.email, formData.password);
        if (result.user) {
            onAuthSuccess?.(result.user);
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'register') {
                await handleRegister();
            } else {
                await handleLogin();
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        setLoading(true);
        setError(null);
        try {
            await AuthService.signInWithOAuth(provider);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!supabase || !registeredEmail) return;

        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: registeredEmail,
            });
            if (resendError) throw resendError;
        } catch (err) {
            console.error('Resend error:', err);
            throw err;
        }
    };

    if (showEmailSent) {
        return (
            <EmailSentModal
                isOpen={true}
                email={registeredEmail}
                onClose={() => {
                    setShowEmailSent(false);
                    setMode('login');
                }}
                onResend={handleResendEmail}
            />
        );
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="relative w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-[#05070a]/60 backdrop-blur-3xl border border-white/10 text-left align-middle shadow-2xl transition-all">
                                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" />
                                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
                                </div>

                                <div className="relative z-10">
                                    <AuthHeader mode={mode} onClose={onClose} />

                                    <div className="p-6 pt-0">
                                        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                                            <button
                                                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'login'
                                                    ? 'bg-indigo-500 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                Giriş Yap
                                            </button>
                                            <button
                                                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'register'
                                                    ? 'bg-indigo-500 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                Kayıt Ol
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <OAuthButtons loading={loading} onOAuth={handleOAuth} />

                                            <div className="relative flex items-center">
                                                <div className="flex-grow border-t border-white/5"></div>
                                                <span className="flex-shrink mx-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Veya devam et</span>
                                                <div className="flex-grow border-t border-white/5"></div>
                                            </div>

                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
                                                    >
                                                        <AlertCircle size={16} />
                                                        {error}
                                                    </motion.div>
                                                )}
                                                {success && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"
                                                    >
                                                        <CheckCircle size={16} />
                                                        {success}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {mode === 'register' && (
                                                <div>
                                                    <label htmlFor="auth-username" className="block text-xs font-medium text-slate-400 mb-1.5">
                                                        Kullanıcı Adı
                                                    </label>
                                                    <div className="relative">
                                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            id="auth-username"
                                                            type="text"
                                                            value={formData.userName}
                                                            onChange={(e) => updateField('userName', e.target.value)}
                                                            placeholder="Adınız"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                                                            required={mode === 'register'}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label htmlFor="auth-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        id="auth-email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => updateField('email', e.target.value)}
                                                        placeholder="ornek@email.com"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="auth-password" className="block text-xs font-medium text-slate-400 mb-1.5">
                                                    Şifre
                                                </label>
                                                <div className="relative">
                                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        id="auth-password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.password}
                                                        onChange={(e) => updateField('password', e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                                                        required
                                                        minLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {mode === 'register' && (
                                                <div>
                                                    <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-slate-400 mb-1.5">
                                                        Şifre Tekrar
                                                    </label>
                                                    <div className="relative">
                                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            id="auth-confirm-password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                                                            placeholder="••••••••"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                                                            required={mode === 'register'}
                                                            minLength={6}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        {mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt olunuyor...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                                                        {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <div className="mt-6 px-6 pb-6 text-center">
                                            <p className="text-xs text-slate-500">
                                                Giriş yaparak{' '}
                                                <button type="button" className="text-indigo-400 hover:underline">Kullanım Şartları</button>
                                                {' '}ve{' '}
                                                <button type="button" className="text-indigo-400 hover:underline">Gizlilik Politikası</button>
                                                {' '}kabul etmiş olursunuz.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

AuthModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAuthSuccess: PropTypes.func
};

export default AuthModal;
