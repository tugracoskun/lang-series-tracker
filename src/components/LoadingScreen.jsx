import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ status }) => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }
    };

    const orbitVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const reverseOrbitVariants = {
        animate: {
            rotate: -360,
            transition: {
                duration: 12,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Background Neural Noise */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Central Animation Core */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Outer Ring */}
                <motion.div
                    className="absolute w-full h-full border border-indigo-500/30 rounded-full border-t-indigo-400 border-r-transparent"
                    variants={orbitVariants}
                    animate="animate"
                />

                {/* Middle Ring */}
                <motion.div
                    className="absolute w-48 h-48 border border-purple-500/30 rounded-full border-b-purple-400 border-l-transparent"
                    variants={reverseOrbitVariants}
                    animate="animate"
                />

                {/* Inner Core */}
                <motion.div
                    className="absolute w-32 h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center"
                    variants={pulseVariants}
                    animate="animate"
                >
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]"></div>
                </motion.div>

                {/* Orbiting Particles */}
                <motion.div
                    className="absolute w-56 h-56"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] absolute top-0 left-1/2 -translate-x-1/2"></div>
                </motion.div>
            </div>

            {/* Typography & Status */}
            <div className="relative z-10 text-center space-y-4">
                <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider">
                        SİSTEM İNŞA EDİLİYOR
                    </h2>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                </motion.div>

                <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-8 flex items-center justify-center"
                >
                    <p className="text-sm font-mono text-indigo-300/80">
                        {status || "Veri paketleri işleniyor..."}
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mt-8">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Footer Tech Details */}
            <div className="absolute bottom-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest flex gap-8">
                <span>Memory: Allocated</span>
                <span>Neural Net: Active</span>
                <span>Sync: Auto</span>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
