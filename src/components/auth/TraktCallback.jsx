import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Check, X, Tv } from 'lucide-react';
import { TraktService } from '../../services/TraktService';

/**
 * Trakt.tv OAuth Callback Handler
 * /trakt-callback?code=xxx route'unda render edilir
 */
const TraktCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setStatus('error');
            setError('Yetkilendirme kodu bulunamadı');
            return;
        }

        // Token değişimi yap
        TraktService.exchangeCode(code)
            .then(() => {
                setStatus('success');
                // 2 saniye sonra ayarlara yönlendir
                setTimeout(() => {
                    navigate('/settings');
                }, 2000);
            })
            .catch((err) => {
                setStatus('error');
                setError(err.message || 'Bağlantı başarısız');
            });
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ED1C24]/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-[2.5rem] p-10 text-center max-w-md relative z-10"
            >
                {/* Trakt Logo */}
                <div className="w-20 h-20 rounded-2xl bg-[#ED1C24] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#ED1C24]/20">
                    <Tv size={40} className="text-white" />
                </div>

                {status === 'loading' && (
                    <>
                        <Loader size={32} className="animate-spin text-[#ED1C24] mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Bağlanıyor...</h2>
                        <p className="text-slate-400">Trakt.tv hesabınız doğrulanıyor</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                        >
                            <Check size={32} className="text-emerald-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2">Bağlantı Başarılı!</h2>
                        <p className="text-slate-400">Trakt.tv hesabınız bağlandı. Ayarlara yönlendiriliyorsunuz...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                            <X size={32} className="text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Bağlantı Başarısız</h2>
                        <p className="text-rose-400 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/settings')}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                        >
                            Ayarlara Dön
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default TraktCallback;
