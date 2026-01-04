import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { LayoutDashboard, BookOpen, Settings, User, X, Zap, Clock, Activity, PlusCircle, Trash2, CheckCircle, Bookmark, FileText, LogIn, LogOut, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { AuthService } from '../services/SupabaseService';

/**
 * Responsive Sidebar
 * - Mobil (< lg): Drawer olarak çalışır, isOpen ile kontrol edilir
 * - Desktop (lg+): Her zaman görünür, sabit panel
 */
const Sidebar = () => {
    const {
        isSidebarOpen, setSidebarOpen,
        sidebarCollapsed, setSidebarCollapsed,
        user, userName, history, series, notes,
        setShowAuthModal,
        cefrLevel
    } = useAppStore();

    const [isDesktop, setIsDesktop] = useState(false);
    const location = useLocation();

    const onClose = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

    const onShowAuth = () => {
        setShowAuthModal(true);
        if (!isDesktop) onClose();
    };

    const onSignOut = async () => {
        await AuthService.signOut();
        if (!isDesktop) onClose();
    };

    // Map current path to active view ID
    const getActiveView = () => {
        const path = location.pathname;
        if (path === '/') return 'dashboard';
        if (path === '/vocab') return 'vocab';
        if (path === '/flashcards') return 'flashcards';
        if (path === '/watchlist') return 'watchlist';
        if (path === '/notes') return 'notes';
        if (path === '/settings') return 'settings';
        if (path === '/history') return 'activity_history';
        return '';
    };

    const activeView = getActiveView();

    // Ekran boyutunu takip et
    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(globalThis.innerWidth >= 1024); // lg breakpoint
        };

        checkScreenSize();
        globalThis.addEventListener('resize', checkScreenSize);
        return () => globalThis.removeEventListener('resize', checkScreenSize);
    }, []);

    // Escape tuşu ile kapat (sadece mobilde)
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isDesktop) onClose();
        };
        globalThis.addEventListener('keydown', handleEsc);
        return () => globalThis.removeEventListener('keydown', handleEsc);
    }, [onClose, isDesktop]);

    const commonProps = {
        user,
        userName,
        history,
        series,
        notes,
        cefrLevel,
        activeView,
        onClose,
        onSignOut,
        onShowAuth,
        isDesktop
    };

    // Desktop: Sabit sidebar
    if (isDesktop) {
        return (
            <div className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
                {/* Background */}
                <div className="absolute inset-0 bg-[#05070a]/40 backdrop-blur-3xl border-r border-white/5" />

                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

                {/* Content */}
                <div className="relative h-full overflow-hidden">
                    <SidebarContent {...commonProps} showHeader={false} compact={sidebarCollapsed} />
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#13161C] border border-white/10 rounded-r-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-50"
                    aria-label={sidebarCollapsed ? "Genişlet" : "Daralt"}
                >
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        );
    }

    // Mobile: Drawer sidebar
    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        className="fixed top-0 right-0 h-full w-80 z-50 lg:hidden"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-[#05070a]/60 backdrop-blur-3xl border-l border-white/10 shadow-2xl" />

                        {/* Decorative gradients */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                        {/* Content */}
                        <div className="relative h-full overflow-hidden">
                            <SidebarContent {...commonProps} showHeader={true} compact={false} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- Sub-components ---

const SidebarContent = ({
    showHeader = true,
    compact = false,
    user,
    userName,
    history,
    series,
    notes,
    cefrLevel,
    activeView,
    onClose,
    onSignOut,
    onShowAuth,
    isDesktop
}) => {
    const navigate = useNavigate();

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

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { id: 'vocab', label: 'Kelime Defteri', icon: BookOpen, path: '/vocab' },
        { id: 'flashcards', label: 'Flashcards', icon: Zap, path: '/flashcards' },
        { id: 'watchlist', label: 'İzleme Listesi', icon: Bookmark, path: '/watchlist' },
        { id: 'notes', label: 'Notlar', icon: FileText, path: '/notes' },
        { id: 'history', label: 'Aktivite Geçmişi', icon: Clock, path: '/history' },
        { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header / Branding */}
            <div className={`p-6 border-b border-white/5 flex items-center justify-center ${compact ? 'flex-col gap-4' : 'justify-between'}`}>
                <button
                    className="flex items-center gap-3 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 text-left"
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-white font-black font-codon text-xl">L</span>
                    </div>
                    {!compact && (
                        <div>
                            <h1 className="text-lg font-codon font-black text-white tracking-widest">LANG<span className="text-indigo-400">TRACKER</span></h1>
                        </div>
                    )}
                </button>
                {showHeader && !compact && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
                        aria-label="Kapat"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
                {/* User Profile Card */}
                <div className="mb-6">
                    <div className="relative group overflow-hidden rounded-xl p-[1px] bg-gradient-to-br from-white/10 to-transparent hover:from-indigo-500/50 hover:to-purple-500/50 transition-all duration-500">
                        <div className="relative bg-[#0F1218]/40 backdrop-blur-md p-4 rounded-xl transition-colors group-hover:bg-[#181B24]/60">
                            <div className={`flex items-center ${compact ? 'justify-center' : 'gap-3'}`}>
                                <div className="relative">
                                    <div className={`${compact ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-base'} rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 font-black font-codon ${user
                                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                                        : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                                        }`}>
                                        {userName?.charAt(0).toUpperCase() || <User size={compact ? 16 : 20} />}
                                    </div>
                                    {/* CEFR Badge on Avatar */}
                                    {user && (
                                        <div className="absolute -bottom-1 -right-1 bg-[#13161C] border border-white/10 rounded-md px-1 py-0.5 text-[8px] font-black text-indigo-400">
                                            {cefrLevel || 'B1'}
                                        </div>
                                    )}
                                </div>
                                {!compact && (
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-bold truncate">
                                            {userName || (user?.email?.split('@')[0]) || 'Misafir'}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {user ? user.email : 'Giriş yapılmadı'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Login/Logout Button */}
                            {!compact && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    {user ? (
                                        <button
                                            onClick={onSignOut}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Çıkış Yap
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onShowAuth}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        >
                                            <LogIn size={16} />
                                            Giriş Yap
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(item.path);
                                    if (!isDesktop) onClose();
                                }}
                                className={`w-full flex items-center ${compact ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                                title={compact ? item.label : undefined}
                            >
                                <Icon size={20} />
                                {!compact && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Internal Stats Header (Only when not collapsed) */}
                {!compact && (
                    <div className="mt-8 px-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 hover:bg-white/[0.04] transition-colors">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Diziler</div>
                                <div className="text-xl font-codon text-white">{series?.length || 0}</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 hover:bg-white/[0.04] transition-colors">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Notlar</div>
                                <div className="text-xl font-codon text-white">{notes?.length || 0}</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-3 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">Mevcut Seviye</div>
                                <div className="text-lg font-black text-white font-codon leading-none">{cefrLevel || 'B1'}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                                <GraduationCap size={20} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity Section */}
                {!compact && history && history.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={12} className="text-indigo-500" />
                                Canlı Akış
                            </h3>
                            <button
                                onClick={() => navigate('/history')}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors"
                            >
                                Hepsi
                            </button>
                        </div>
                        <div className="space-y-3">
                            {history.slice(0, 3).map(log => (
                                <div key={log.id} className="group flex gap-3 items-center p-2 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        {getActionIcon(log.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-slate-300 truncate font-medium">
                                            {log.description}
                                        </div>
                                        <div className="text-[10px] text-slate-600 font-mono">
                                            {getRelativeTime(log.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
                <div className="text-center text-[10px] text-slate-800 font-mono tracking-widest">
                    v1.0.0
                </div>
            </div>
        </div>
    );
};

SidebarContent.propTypes = {
    showHeader: PropTypes.bool,
    compact: PropTypes.bool,
    user: PropTypes.shape({
        email: PropTypes.string,
        id: PropTypes.string,
        confirmed_at: PropTypes.string,
        email_confirmed_at: PropTypes.string,
        created_at: PropTypes.string,
        last_sign_in_at: PropTypes.string
    }),
    userName: PropTypes.string,
    history: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        description: PropTypes.string,
        timestamp: PropTypes.string
    })),
    series: PropTypes.arrayOf(PropTypes.object),
    notes: PropTypes.arrayOf(PropTypes.object),
    cefrLevel: PropTypes.string,
    activeView: PropTypes.string,
    onClose: PropTypes.func,
    onSignOut: PropTypes.func,
    onShowAuth: PropTypes.func,
    isDesktop: PropTypes.bool
};

export default Sidebar;
