import React from 'react';
import { Plus, Trash2, Menu, Search, Loader, Clock, Sparkles, GraduationCap, CheckCircle, Play, TrendingUp, BookOpen, Target, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import RecommendationsSection from '../components/features/RecommendationsSection';
import { estimateDifficulty } from '../utils/seriesUtils';
import { RECOMMENDATIONS, CEFR_LEVELS } from '../data/recommendations';
import { useAppStore } from '../store/useAppStore';
import { TVMazeService } from '../services/TVMazeService';

const getDifficultyBadgeClass = (id) => {
    switch (id) {
        case 'EASY': return 'liquid-badge-emerald';
        case 'MEDIUM': return 'liquid-badge-amber';
        case 'HARD': return 'liquid-badge-rose';
        default: return 'liquid-badge-indigo';
    }
};

// Stagger animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const Dashboard = ({
    onSeriesClick,
    onAddClick,
    onDeleteSeries,
    onStartWatching,
    onAddToWatchlist
}) => {
    const { series, userData, watchlist, setSidebarOpen, cefrLevel, userName } = useAppStore();
    const onMenuClick = () => setSidebarOpen(true);
    const [showFullRecs, setShowFullRecs] = React.useState(false);

    // Calculate overall stats
    const stats = React.useMemo(() => {
        let totalEpisodes = 0;
        let completedEpisodes = 0;
        let totalSeries = series.length;

        series.forEach(s => {
            const total = s.schedule
                ?.flatMap(sch => sch.tours)
                ?.flatMap(t => t.weeks)
                ?.flatMap(w => w.days)
                ?.filter(d => d.epId).length || 0;

            const completed = Object.keys(userData[s.id]?.completed || {}).length;
            totalEpisodes += total;
            completedEpisodes += completed;
        });

        return {
            totalSeries,
            totalEpisodes,
            completedEpisodes,
            overallProgress: totalEpisodes > 0 ? Math.round((completedEpisodes / totalEpisodes) * 100) : 0
        };
    }, [series, userData]);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'İyi günler';
        return 'İyi akşamlar';
    };

    return (
        <div className="min-h-screen">
            {/* Mobile Menu Button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <button
                    onClick={onMenuClick}
                    className="p-3 bg-[#13161C]/80 backdrop-blur-xl border border-white/10 text-slate-400 hover:text-white rounded-xl shadow-xl transition-all"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Cinematic Background */}
            <div className="cinematic-bg" style={{
                backgroundImage: series[0]?.image?.original ? `url(${series[0].image.original})` : 'none',
                opacity: 0.15
            }}></div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">

                {/* Compact Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{getGreeting()}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                {userName ? `${userName}, ` : ''}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                    izlemeye devam et
                                </span>
                            </h1>
                        </div>

                        {/* Quick Add Button - Desktop */}
                        <button
                            onClick={onAddClick}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
                        >
                            <Plus size={18} />
                            <span>Dizi Ekle</span>
                        </button>
                    </div>
                </motion.header>

                {/* Stats Bar - Only show if user has series */}
                {series.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
                    >
                        <StatCard
                            icon={<BookOpen size={18} />}
                            label="Aktif Dizi"
                            value={stats.totalSeries}
                            color="indigo"
                        />
                        <StatCard
                            icon={<Target size={18} />}
                            label="Toplam Bölüm"
                            value={stats.totalEpisodes}
                            color="purple"
                        />
                        <StatCard
                            icon={<CheckCircle size={18} />}
                            label="İzlenen"
                            value={stats.completedEpisodes}
                            color="emerald"
                        />
                        <StatCard
                            icon={<TrendingUp size={18} />}
                            label="Genel İlerleme"
                            value={`%${stats.overallProgress}`}
                            color="pink"
                            highlight
                        />
                    </motion.div>
                )}

                {/* Series Grid */}
                {series.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {series.map((s, index) => (
                            <SeriesCard
                                key={s.id}
                                series={s}
                                userData={userData}
                                onSeriesClick={onSeriesClick}
                                onDeleteSeries={onDeleteSeries}
                                index={index}
                            />
                        ))}

                        {/* Add New Series Card */}
                        <motion.button
                            variants={itemVariants}
                            onClick={onAddClick}
                            className="group aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/[0.02]"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                                <Plus size={24} className="text-indigo-400" />
                            </div>
                            <span className="text-slate-500 group-hover:text-white font-medium transition-colors">Yeni Dizi Ekle</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    <InitialSetupView
                        onAddClick={onAddClick}
                        cefrLevel={cefrLevel}
                        onStartWatching={onStartWatching}
                        onAddToWatchlist={onAddToWatchlist}
                        watchlist={watchlist}
                        onShowAll={() => setShowFullRecs(true)}
                        showFullRecs={showFullRecs}
                    />
                )}

                {/* Discover Section */}
                {series.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12"
                    >
                        {!showFullRecs ? (
                            <button
                                onClick={() => setShowFullRecs(true)}
                                className="group w-full p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Sparkles size={20} className="text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-white font-semibold">Yeni Diziler Keşfet</h3>
                                        <p className="text-slate-500 text-sm">Seviyene uygun öneriler</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </button>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Sparkles className="text-indigo-400" size={20} />
                                        Keşif Modu
                                    </h2>
                                    <button
                                        onClick={() => setShowFullRecs(false)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                                    >
                                        Kapat
                                    </button>
                                </div>
                                <RecommendationsSection onStart={onStartWatching} onWatchlist={onAddToWatchlist} watchlist={watchlist} />
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Mobile FAB */}
            <button
                onClick={onAddClick}
                className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-transform"
            >
                <Plus size={24} className="text-white" />
            </button>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color, highlight }) => {
    const colorClasses = {
        indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
    };

    return (
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm ${highlight ? 'ring-1 ring-white/5' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-white/90'}`}>{value}</p>
        </div>
    );
};

StatCard.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    color: PropTypes.string.isRequired,
    highlight: PropTypes.bool
};

// Series Card Component
const SeriesCard = ({ series: s, userData, onSeriesClick, onDeleteSeries, index }) => {
    const total = s.schedule
        ?.flatMap(sch => sch.tours)
        ?.flatMap(t => t.weeks)
        ?.flatMap(w => w.days)
        ?.filter(d => d.epId).length || 0;

    const completed = Object.keys(userData[s.id]?.completed || {}).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const difficulty = estimateDifficulty(s);

    return (
        <motion.div
            variants={itemVariants}
            className="group relative"
        >
            <button
                onClick={() => onSeriesClick(s.id)}
                className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative outline-none"
            >
                {/* Background Image */}
                {s.image?.original && (
                    <div className="absolute inset-0">
                        <img
                            src={s.image.original}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={s.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    {/* Top Actions */}
                    <div className="flex justify-between items-start">
                        <span className={`liquid-badge ${getDifficultyBadgeClass(difficulty.id)} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {difficulty.text}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDeleteSeries(e, s.id); }}
                            className="p-2 bg-black/40 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all border border-white/10"
                            aria-label="Diziyi Sil"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Bottom Info */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-3 text-left line-clamp-2">{s.name}</h3>

                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{completed} / {total} bölüm</span>
                                <span className="text-white font-bold">%{pct}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Hover Action */}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <div className="flex items-center justify-center gap-2 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white text-sm font-medium">
                                <Play size={14} fill="currentColor" />
                                <span>Devam Et</span>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        </motion.div>
    );
};

SeriesCard.propTypes = {
    series: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    onSeriesClick: PropTypes.func.isRequired,
    onDeleteSeries: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired
};

// Initial Setup View
const InitialSetupView = ({ onAddClick, cefrLevel, onStartWatching, onAddToWatchlist, watchlist, onShowAll, showFullRecs }) => {
    const currentLevelRecs = RECOMMENDATIONS.find(r => r.level === cefrLevel) || RECOMMENDATIONS[2];

    if (showFullRecs) {
        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-indigo-400" size={20} />
                        Tüm Öneriler
                    </h2>
                    <button
                        onClick={onShowAll}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        Geri
                    </button>
                </div>
                <RecommendationsSection onStart={onStartWatching} onWatchlist={onAddToWatchlist} watchlist={watchlist} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
        >
            {/* Hero Section */}
            <div className="max-w-2xl mx-auto text-center mb-12">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
                >
                    <Sparkles size={14} />
                    Dil öğrenme yolculuğuna başla
                </motion.div>

                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    İlk dizini <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">seç</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                    Seviyene uygun içeriklerle pratik yapmaya başla
                </p>

                {/* Search Button */}
                <button
                    onClick={onAddClick}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl text-slate-400 transition-all hover:border-indigo-500/50 hover:text-white hover:bg-white/[0.05]"
                >
                    <Search size={20} className="text-indigo-400" />
                    <span className="font-medium">Dizi ara veya keşfet...</span>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
            </div>

            {/* Recommendations */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Senin İçin Öneriler</h3>
                            <p className="text-sm text-slate-500">{CEFR_LEVELS[cefrLevel]?.name} seviyesi</p>
                        </div>
                    </div>
                    <button
                        onClick={onShowAll}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        Tümünü gör
                        <ChevronRight size={16} />
                    </button>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                >
                    {currentLevelRecs.items.slice(0, 6).map(item => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <SimplifiedRecCard
                                id={item.id}
                                onStart={onStartWatching}
                                onWatchlist={onAddToWatchlist}
                                watchlist={watchlist}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

InitialSetupView.propTypes = {
    onAddClick: PropTypes.func.isRequired,
    cefrLevel: PropTypes.string.isRequired,
    onStartWatching: PropTypes.func.isRequired,
    onAddToWatchlist: PropTypes.func.isRequired,
    watchlist: PropTypes.arrayOf(PropTypes.object).isRequired,
    onShowAll: PropTypes.func.isRequired,
    showFullRecs: PropTypes.bool.isRequired
};

// Simplified Recommendation Card
const SimplifiedRecCard = ({ id, onStart, onWatchlist, watchlist }) => {
    return (
        <div className="aspect-[2/3] group relative rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
            <RecommendationItemLoader id={id} onStart={onStart} onWatchlist={onWatchlist} watchlist={watchlist} />
        </div>
    );
};

SimplifiedRecCard.propTypes = {
    id: PropTypes.number.isRequired,
    onStart: PropTypes.func.isRequired,
    onWatchlist: PropTypes.func.isRequired,
    watchlist: PropTypes.arrayOf(PropTypes.object).isRequired
};

// Recommendation Item Loader
const RecommendationItemLoader = ({ id, onStart, onWatchlist, watchlist }) => {
    const [show, setShow] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;
        TVMazeService.getShowDetails(id).then(data => {
            if (isMounted) {
                setShow(data);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader size={18} className="animate-spin text-slate-600" />
            </div>
        );
    }
    if (!show) return null;

    const isInWatchlist = watchlist?.some(item => item.id === show.id);

    return (
        <>
            {show.image?.medium && (
                <img
                    src={show.image.medium}
                    alt={show.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent group-hover:via-black/50 transition-all flex flex-col justify-end p-3">
                <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2 text-left">{show.name}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(show); }}
                        className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                    >
                        Başla
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onWatchlist(show); }}
                        className={`p-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors ${isInWatchlist ? 'bg-emerald-500/20 text-emerald-400' : 'text-white'}`}
                    >
                        {isInWatchlist ? <CheckCircle size={14} /> : <Plus size={14} />}
                    </button>
                </div>
            </div>
        </>
    );
};

RecommendationItemLoader.propTypes = {
    id: PropTypes.number.isRequired,
    onStart: PropTypes.func.isRequired,
    onWatchlist: PropTypes.func.isRequired,
    watchlist: PropTypes.arrayOf(PropTypes.object).isRequired
};

Dashboard.propTypes = {
    onSeriesClick: PropTypes.func.isRequired,
    onAddClick: PropTypes.func.isRequired,
    onDeleteSeries: PropTypes.func.isRequired,
    onStartWatching: PropTypes.func.isRequired,
    onAddToWatchlist: PropTypes.func.isRequired
};

export default Dashboard;
