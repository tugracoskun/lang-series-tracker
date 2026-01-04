import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ status }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => (prev < 95 ? prev + (Math.random() * 4) : prev));
        }, 120);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#000] flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "circIn" } }}
        >
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
                {/* Center Core Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>

                {/* Moving Light Streaks */}
                <motion.div
                    className="absolute top-0 left-[-50%] w-[200%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
                    animate={{ y: ['0vh', '100vh'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Ambient Particles (Mockup with multiple glowing dots) */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-indigo-400/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            y: [0, -100],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            {/* Central HUD / Interface */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-12">

                {/* Floating Logo/Icon Container */}
                <div className="relative mb-20 group">
                    {/* Pulsing Outer Ring */}
                    <motion.div
                        className="absolute inset-[-60px] border border-indigo-500/20 rounded-full"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-[-30px] border border-white/5 rounded-full"
                        animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    />

                    {/* The Visual Core */}
                    <motion.div
                        className="relative w-32 h-32 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        {/* Recursive Rectangles (Stylized L/T) */}
                        <motion.div
                            className="absolute w-full h-full border-2 border-indigo-500/30 rounded-3xl"
                            animate={{ rotate: 45 }}
                        />
                        <motion.div
                            className="absolute w-2/3 h-2/3 border border-white/20 rounded-2xl"
                            animate={{ rotate: -45 }}
                        />
                        <div className="text-white font-black text-4xl font-codon drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            L<span className="text-indigo-500">T</span>
                        </div>
                    </motion.div>
                </div>

                {/* Typography Block */}
                <div className="text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, tracking: "0.5em" }}
                        animate={{ opacity: 1, tracking: "1.2em" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    >
                        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[1.2em] mb-4 pl-[1.2em]">Öğrenme Protokolü</h2>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-7xl font-codon font-black text-white"
                        style={{ perspective: "1000px" }}
                    >
                        {["B", "A", "Ş", "L", "A", "T", "I", "L", "I", "Y", "O", "R"].map((char, i) => (
                            <motion.span
                                key={i}
                                className="inline-block"
                                initial={{ opacity: 0, rotateX: -90, y: 20 }}
                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.h1>
                </div>

                {/* Tech Dashboard Card */}
                <motion.div
                    className="w-full bg-[#0A0C10]/80 backdrop-blur-3xl rounded-[32px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                >
                    {/* Background Tech Patten */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">İşleniyor</span>
                            </div>
                            <h3 className="text-white font-medium text-xl tracking-tight">
                                {status || "Sistem çekirdeği yükleniyor..."}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-codon text-white">{Math.round(progress)}%</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Tamamlandı</span>
                        </div>
                    </div>

                    {/* Premium Progress Bar */}
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 30, damping: 10 }}
                        />
                    </div>

                    <div className="mt-8 flex justify-between items-center text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                        <div className="flex gap-6">
                            <span>Hash: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
                            <span>Region: Global</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400/50 italic">
                            Secure Handshake...
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Cinematic Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[101]">
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60"></div>
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%]"></div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
