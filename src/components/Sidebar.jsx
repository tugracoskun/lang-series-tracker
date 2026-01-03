import { useRef, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Settings, User, X, Database, Zap, Sparkles, Clock, Activity, PlusCircle, Trash2, CheckCircle, Bookmark, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, onNavigate, activeView, history }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } }
    };

    const sidebarVariants = {
        hidden: { x: '100%', opacity: 0.5 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            x: '100%',
            opacity: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Az önce";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}s önce`;
        return `${Math.floor(diffInSeconds / 86400)}g önce`;
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'ADD': return <PlusCircle size={12} className="text-emerald-400" />;
            case 'DELETE': return <Trash2 size={12} className="text-rose-400" />;
            case 'WATCH': return <CheckCircle size={12} className="text-indigo-400" />;
            default: return <Activity size={12} className="text-slate-400" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        onClick={onClose}
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        className="fixed top-0 right-0 h-full w-80 z-50 overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={sidebarVariants}
                    >
                        {/* Glassmorphism Background Layer */}
                        <div className="absolute inset-0 bg-[#0F1218]/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl" />

                        {/* Artistic Gradients/Noise */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

                        {/* Content Container */}
                        <div className="relative h-full flex flex-col z-10">

                            {/* Header */}
                            <div className="p-8 flex items-center justify-between">
                                <div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400"
                                    >
                                        Menü
                                    </motion.h2>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-6"
                                >
                                    {/* User Profile Card */}
                                    <motion.div variants={itemVariants}>
                                        <div className="relative group overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-transparent hover:from-indigo-500/50 hover:to-purple-500/50 transition-all duration-500">
                                            <div className="relative bg-[#13161C] p-4 rounded-2xl flex items-center gap-4 transition-colors group-hover:bg-[#181B24]">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold group-hover:text-indigo-200 transition-colors">Kullanıcı</div>
                                                    <div className="text-xs text-slate-400 group-hover:text-indigo-300/80 transition-colors">Seviye: Başlangıç</div>
                                                </div>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Sparkles size={14} className="text-amber-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Divider */}
                                    <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                    {/* Navigation Links */}
                                    <motion.div variants={containerVariants} className="space-y-2">
                                        <MenuLink
                                            icon={<LayoutDashboard size={20} />}
                                            label="Dashboard"
                                            active={activeView === 'dashboard'}
                                            onClick={() => onNavigate('dashboard')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<Bookmark size={20} />}
                                            label="İzleme Listesi"
                                            active={activeView === 'watchlist'}
                                            onClick={() => onNavigate('watchlist')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<BookOpen size={20} />}
                                            label="Kelimelerim"
                                            badge="Yeni"
                                            active={activeView === 'vocab'}
                                            onClick={() => onNavigate('vocab')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<Zap size={20} />}
                                            label="Flashcards"
                                            active={activeView === 'flashcards'}
                                            onClick={() => onNavigate('flashcards')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<FileText size={20} />}
                                            label="Notlarım"
                                            active={activeView === 'notes'}
                                            onClick={() => onNavigate('notes')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<Database size={20} />}
                                            label="Veri Yöneticisi"
                                            badge="YAKINDA"
                                            active={activeView === 'data-manager'}
                                            onClick={() => onNavigate('data-manager')}
                                            variants={itemVariants}
                                        />
                                        <MenuLink
                                            icon={<Settings size={20} />}
                                            label="Ayarlar"
                                            active={activeView === 'settings'}
                                            onClick={() => onNavigate('settings')}
                                            variants={itemVariants}
                                        />
                                    </motion.div>

                                    {/* Recent Activity Section */}
                                    <motion.div variants={itemVariants} className="pt-6 border-t border-white/5">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clock size={12} />
                                            Son Aktiviteler
                                        </h3>
                                        <div className="space-y-3">
                                            {history && history.length > 0 ? (
                                                <>
                                                    {history.slice(0, 3).map(log => (
                                                        <div key={log.id} className="flex gap-3 items-start group">
                                                            <div className="mt-1 p-1 rounded-full bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                                {getActionIcon(log.type)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs text-slate-300 leading-relaxed font-medium">
                                                                    {log.description}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                                    {getRelativeTime(log.timestamp)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {history.length > 3 && (
                                                        <button
                                                            onClick={() => onNavigate('activity_history')}
                                                            className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 flex items-center justify-center gap-2"
                                                        >
                                                            <Clock size={12} />
                                                            TÜMÜNÜ GÖR ({history.length})
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-xs text-slate-600 italic pl-1">
                                                    Henüz aktivite kaydı yok.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="p-8 border-t border-white/5"
                            >
                                <div className="text-center">
                                    <div className="text-[10px] tracking-widest text-slate-500 uppercase font-bold mb-1">LangTracker v2.0</div>
                                    <div className="text-[10px] text-slate-600 font-mono">Season Mastery Protocol</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuLink = ({ icon, label, badge, active, onClick, variants }) => (
    <motion.button
        variants={variants}
        onClick={onClick}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
            : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
            }`}
    >
        {active && (
            <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-indigo-500/10 blur-md rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}

        <div className="flex items-center gap-4 relative z-10">
            <span className={`transition-colors duration-300 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-white"}`}>
                {icon}
            </span>
            <span className={`font-medium tracking-wide ${active ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                {label}
            </span>
        </div>

        {badge && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border relative z-10 ${active
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'bg-white/5 text-slate-500 border-white/5 group-hover:border-white/10'
                }`}>
                {badge}
            </span>
        )}
    </motion.button>
);

export default Sidebar;
