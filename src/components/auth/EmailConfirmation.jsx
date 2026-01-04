import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/SupabaseService';

/**
 * Email Onaylama Callback Sayfası
 * Supabase email confirm linkine tıklandığında bu sayfa gösterilir
 */
const EmailConfirmation = ({ onComplete }) => {
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Email adresin doğrulanıyor...');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // URL'den hash parametrelerini al
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                // Eğer email confirmation ise
                if (type === 'email' || type === 'signup' || type === 'recovery') {
                    if (accessToken && refreshToken) {
                        // Session'ı set et
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (error) throw error;

                        setStatus('success');
                        setMessage('Email adresin başarıyla doğrulandı!');

                        // URL'yi temizle
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        // Token yoksa ama type varsa, muhtemelen zaten doğrulanmış
                        setStatus('success');
                        setMessage('Email zaten doğrulanmış görünüyor.');
                    }
                } else if (hashParams.get('error')) {
                    throw new Error(hashParams.get('error_description') || 'Doğrulama hatası');
                } else {
                    // Hash parametresi yoksa, normal sayfa yüklemesi
                    setStatus('success');
                    setMessage('Hoş geldin!');
                }
            } catch (error) {
                console.error('Email confirmation error:', error);
                setStatus('error');
                setMessage(error.message || 'Doğrulama sırasında bir hata oluştu.');
            }
        };

        // Hash parametreleri varsa işle
        if (window.location.hash) {
            handleEmailConfirmation();
        } else {
            // Hash yoksa direkt complete
            onComplete?.();
        }
    }, []);

    // Başarılı ise countdown ile yönlendir
    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            onComplete?.();
        }
    }, [status, countdown, onComplete]);

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-[150]" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md mx-4 transform overflow-hidden rounded-3xl">
                                {/* Animated Background */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                                </div>

                                <div className="glass-panel p-8 text-center relative z-10">
                                    {/* Status Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${status === 'verifying' ? 'bg-indigo-500/20' :
                                            status === 'success' ? 'bg-emerald-500/20' :
                                                'bg-rose-500/20'
                                            }`}
                                    >
                                        {status === 'verifying' && (
                                            <Loader2 size={40} className="text-indigo-400 animate-spin" />
                                        )}
                                        {status === 'success' && (
                                            <CheckCircle size={40} className="text-emerald-400" />
                                        )}
                                        {status === 'error' && (
                                            <XCircle size={40} className="text-rose-400" />
                                        )}
                                    </motion.div>

                                    {/* Title */}
                                    <Dialog.Title
                                        as="h2"
                                        className={`text-2xl font-display font-bold mb-2 ${status === 'verifying' ? 'text-white' :
                                            status === 'success' ? 'text-emerald-300' :
                                                'text-rose-300'
                                            }`}
                                    >
                                        {status === 'verifying' && 'Doğrulanıyor...'}
                                        {status === 'success' && 'Başarılı!'}
                                        {status === 'error' && 'Hata!'}
                                    </Dialog.Title>

                                    {/* Message */}
                                    <p className="text-slate-400 mb-6">
                                        {message}
                                    </p>

                                    {/* Actions based on status */}
                                    {status === 'success' && (
                                        <div className="space-y-4">
                                            <div className="text-sm text-slate-500">
                                                {countdown > 0 ? (
                                                    <span>Yönlendiriliyorsun... ({countdown})</span>
                                                ) : (
                                                    <span>Yönlendiriliyor...</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onComplete?.()}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                            >
                                                Devam Et
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                                            >
                                                <RefreshCw size={18} />
                                                Tekrar Dene
                                            </button>
                                            <button
                                                onClick={() => onComplete?.()}
                                                className="block w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                Ana sayfaya dön
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

/**
 * Email Gönderildi Modalı
 * Kayıt sonrası email onay bekleme ekranı
 */
export const EmailSentModal = ({ isOpen, email, onClose, onResend }) => {
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResending(true);
        try {
            await onResend?.();
            setResendCooldown(60); // 60 saniye bekleme
        } catch (error) {
            console.error('Resend error:', error);
        }
        setResending(false);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0F1218] text-left align-middle shadow-xl transition-all">
                                <div className="glass-panel p-8 text-center">
                                    {/* Mail Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/20 flex items-center justify-center"
                                    >
                                        <Mail size={40} className="text-indigo-400" />
                                    </motion.div>

                                    <Dialog.Title as="h2" className="text-2xl font-display font-bold text-white mb-2">
                                        Email'ini Kontrol Et!
                                    </Dialog.Title>

                                    <div className="mt-2">
                                        <p className="text-slate-400 mb-2">
                                            Hesabını aktifleştirmek için
                                        </p>
                                        <p className="text-indigo-400 font-medium mb-6">
                                            {email}
                                        </p>
                                        <p className="text-slate-400 text-sm mb-6">
                                            adresine bir onay linki gönderdik. Lütfen email'ini kontrol et ve linke tıkla.
                                        </p>
                                    </div>

                                    {/* Spam Warning */}
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
                                        <p className="text-amber-400 text-sm">
                                            💡 Email'i bulamıyor musun? Spam/Junk klasörünü kontrol et.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleResend}
                                            disabled={resending || resendCooldown > 0}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {resending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <RefreshCw size={18} />
                                            )}
                                            {resendCooldown > 0 ? `Tekrar gönder (${resendCooldown}s)` : 'Tekrar Gönder'}
                                        </button>

                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 text-slate-400 hover:text-white transition-colors"
                                        >
                                            Tamam, kontrol edeceğim
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EmailConfirmation;
