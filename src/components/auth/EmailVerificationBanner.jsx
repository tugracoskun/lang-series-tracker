import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Mail, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/SupabaseService';
import { useAppStore } from '../../store/useAppStore';

/**
 * Email Verification Banner
 * Kullanıcının emaili doğrulanmamışsa gösterilir
 */
const EmailVerificationBanner = ({ user }) => {
    const { sidebarCollapsed } = useAppStore();
    const [dismissed, setDismissed] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Email doğrulanmış mı kontrol et
    const isEmailVerified = user?.email_confirmed_at || user?.confirmed_at;

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Check localStorage for dismissal
    useEffect(() => {
        const dismissedUntil = localStorage.getItem('emailBannerDismissedUntil');
        if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
            setDismissed(true);
        }
    }, []);

    // User yoksa, email doğrulanmışsa veya kapatılmışsa gösterme
    if (!user || isEmailVerified || dismissed) {
        return null;
    }

    const handleResend = async () => {
        if (resendCooldown > 0 || !supabase || !user?.email) return;

        setResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });
            if (error) throw error;
            setResent(true);
            setResendCooldown(60);
            setTimeout(() => setResent(false), 5000);
        } catch (error) {
            console.error('Resend error:', error);
        }
        setResending(false);
    };

    const handleDismiss = () => {
        // 24 saat boyunca gösterme
        const dismissUntil = new Date();
        dismissUntil.setHours(dismissUntil.getHours() + 24);
        localStorage.setItem('emailBannerDismissedUntil', dismissUntil.toISOString());
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-72'}`}
            >
                <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Icon & Message */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <AlertTriangle size={16} className="text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-amber-200 font-medium truncate">
                                        Email adresinizi doğrulamanız gerekiyor
                                    </p>
                                    <p className="text-xs text-amber-400/70 truncate hidden sm:block">
                                        {user?.email} adresine gönderilen linke tıklayın
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {resent ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                        <CheckCircle size={14} />
                                        Gönderildi!
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={resending || resendCooldown > 0}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resending ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Mail size={12} />
                                        )}
                                        {resendCooldown > 0 ? `${resendCooldown}s` : 'Tekrar Gönder'}
                                    </button>
                                )}
                                <button
                                    onClick={handleDismiss}
                                    className="p-1.5 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                                    title="24 saat boyunca gizle"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmailVerificationBanner;

