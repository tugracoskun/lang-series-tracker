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
        user, userName, history, series, notes, userData,
        setShowAuthModal,
        cefrLevel
    } = useAppStore();

    // Toplam kelime sayısı hesapla
    const totalVocabulary = Object.values(userData || {}).reduce((total, seriesData) => {
        const vocabEntries = Object.values(seriesData?.vocabulary || {});
        return total + vocabEntries.reduce((sum, words) => sum + (Array.isArray(words) ? words.length : 0), 0);
    }, 0);

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
        totalVocabulary,
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
            <div className={`fixed top-0 left-0 h-full z-40 transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
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
    totalVocabulary,
    cefrLevel,
    activeView,
    onClose,
    onSignOut,
    onShowAuth,
    isDesktop
}) => {
    const navigate = useNavigate();

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
            <div className={`p-5 border-b border-white/5 flex items-center ${compact ? 'justify-center' : 'justify-between'}`}>
                <button
                    className="flex items-center gap-2.5 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 text-left"
                    onClick={() => navigate('/')}
                >
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-white font-black font-codon text-base">L</span>
                    </div>
                    {!compact && (
                        <h1 className="text-base font-codon font-black text-white tracking-widest">LANG<span className="text-indigo-400">TRACKER</span></h1>
                    )}
                </button>
                {showHeader && !compact && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
                        aria-label="Kapat"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Scrollable Content - Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
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
                                className={`w-full flex items-center ${compact ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-300'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                title={compact ? item.label : undefined}
                            >
                                <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                                {!compact && <span className="font-medium text-sm">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile - Bottom with Stats */}
            <div className="border-t border-white/5 p-3">
                {/* Profile Row - Clickable */}
                <button
                    onClick={() => {
                        navigate('/settings');
                        if (!isDesktop) onClose();
                    }}
                    className={`w-full flex items-center ${compact ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-white/5 transition-colors group`}
                >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className={`${compact ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base'} rounded-xl flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105 ${user
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-tr from-slate-600 to-slate-700'
                            }`}>
                            {userName?.charAt(0).toUpperCase() || <User size={compact ? 16 : 18} />}
                        </div>
                    </div>

                    {!compact && (
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm text-white font-medium truncate">
                                {userName || (user?.email?.split('@')[0]) || 'Misafir'}
                            </div>
                            <div className="text-[10px] text-indigo-400 truncate font-medium">
                                Tasarım Modu
                            </div>
                        </div>
                    )}
                </button>

                {/* Mini Stats - Inside Profile Section */}
                {!compact && (
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 py-2 px-3 bg-white/[0.02] rounded-lg border border-white/5">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{series?.length || 0}</span>
                            <span>dizi</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-400">{totalVocabulary || 0}</span>
                            <span>kelime</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <GraduationCap size={10} className="text-indigo-400" />
                            <span className="font-bold text-indigo-400">{cefrLevel || 'B1'}</span>
                        </div>
                    </div>
                )}
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
    totalVocabulary: PropTypes.number,
    cefrLevel: PropTypes.string,
    activeView: PropTypes.string,
    onClose: PropTypes.func,
    onSignOut: PropTypes.func,
    onShowAuth: PropTypes.func,
    isDesktop: PropTypes.bool
};

export default Sidebar;
