import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Sparkles, Zap, BookOpen, Globe, Shield } from 'lucide-react';
import PropTypes from 'prop-types';

const LoginRequired = ({ onShowAuth }) => {
    const features = [
        { icon: Globe, title: 'Bulut Senkronizasyonu', desc: 'Verileriniz tüm cihazlarınızda anlık olarak senkronize edilir.' },
        { icon: BookOpen, title: 'Kişisel Kelime Defteri', desc: 'Öğrendiğiniz kelimeleri ve notları güvenle saklayın.' },
        { icon: Zap, title: 'Akıllı İlerleme Takibi', desc: 'Dizi izleme alışkanlıklarınıza göre özelleştirilmiş öğrenme rotası.' },
        { icon: Shield, title: 'Güvenli Yedekleme', desc: 'Verileriniz Supabase altyapısı ile güvence altında.' }
    ];

    return (
        <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 z-10">
                {/* Left Side: Brand & Hero */}
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-6xl md:text-7xl font-codon font-bold text-white tracking-widest mb-4">
                            LANG<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">TRACKER</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-light tracking-wide max-w-lg">
                            Dizi izleyerek dil öğrenme yolculuğunuzu dijitalleştirin.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    >
                        {features.map((feature) => (
                            <div key={feature.title} className="flex gap-4">
                                <div className="mt-1 p-2 bg-white/5 rounded-lg text-indigo-400">
                                    <feature.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right Side: CTA Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm"
                >
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 pointer-events-none" />

                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                <LogIn size={32} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3">Devam Etmek İçin Giriş Yapın</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Tüm özelliklere erişmek ve verilerinizi senkronize etmek için bir hesap oluşturmanız veya giriş yapmanız gerekmektedir.
                            </p>

                            <button
                                onClick={onShowAuth}
                                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 group"
                            >
                                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                Hemen Başla
                            </button>

                            <p className="text-[10px] text-slate-500 mt-6 uppercase tracking-widest font-bold">
                                Güvenli • Ücretsiz • Hızlı
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-slate-600 text-xs tracking-widest uppercase font-bold">
                LangTracker Ecosystem &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
};

LoginRequired.propTypes = {
    onShowAuth: PropTypes.func.isRequired
};

export default LoginRequired;
