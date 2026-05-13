import React from 'react';
import { Plus, Trash2, Menu, Search, Loader, Sparkles, GraduationCap, CheckCircle, ArrowRight, ChevronRight, BookOpen, Flame, TrendingUp, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import RecommendationsSection from '../components/features/RecommendationsSection';
import { estimateDifficulty } from '../utils/seriesUtils';
import { RECOMMENDATIONS, CEFR_LEVELS } from '../data/recommendations';
import { useAppStore } from '../store/useAppStore';
import { TVMazeService } from '../services/TVMazeService';
import { getSmartRecommendations } from '../utils/recommendationUtils';

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
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 30 }
    }
};

const Dashboard = ({
    onSeriesClick,
    onAddClick,
    onDeleteSeries,
    onStartWatching,
    onAddToWatchlist
}) => {
    const { series, userData, watchlist, setSidebarOpen, cefrLevel, userName, showRecommendations } = useAppStore();
    const onMenuClick = () => setSidebarOpen(true);
    const [showFullRecs, setShowFullRecs] = React.useState(true);

    // Calculate overall stats
    const stats = React.useMemo(() => {
        let totalEpisodes = 0;
        let completedEpisodes = 0;
        let totalSeries = series.length;
        let totalVocabulary = 0;
        let totalHoursWatched = 0;

        series.forEach(s => {
            const total = s.schedule
                ?.flatMap(sch => sch.tours)
                ?.flatMap(t => t.weeks)
                ?.flatMap(w => w.days)
                ?.filter(d => d.epId).length || 0;

            const completed = Object.keys(userData[s.id]?.completed || {}).length;
            const vocabEntries = Object.values(userData[s.id]?.vocabulary || {});
            const vocabCount = vocabEntries.reduce((sum, words) => sum + (Array.isArray(words) ? words.length : 0), 0);

            totalEpisodes += total;
            completedEpisodes += completed;
            totalVocabulary += vocabCount;
            totalHoursWatched += completed * 0.7; // ~42 min per episode
        });

        return {
            totalSeries,
            totalEpisodes,
            completedEpisodes,
            totalVocabulary,
            totalHoursWatched: Math.round(totalHoursWatched),
            overallProgress: totalEpisodes > 0 ? Math.round((completedEpisodes / totalEpisodes) * 100) : 0
        };
    }, [series, userData]);

    // Smart Recommendations Calculation
    const smartRecs = React.useMemo(() => {
        return getSmartRecommendations(series, cefrLevel);
    }, [series, cefrLevel]);

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">

                {/* Professional Header */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-5"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{getGreeting()}</p>
                                {cefrLevel && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                                        {cefrLevel}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {userName ? <>{userName}<span className="text-slate-600 font-normal mx-1.5">·</span></> : ''}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    izlemeye devam et
                                </span>
                            </h1>
                        </div>

                        <button
                            onClick={onAddClick}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium rounded-lg transition-all border border-white/10 hover:border-indigo-500/40"
                        >
                            <Plus size={16} />
                            <span>Dizi Ekle</span>
                        </button>
                    </div>
                </motion.header>

                {/* Rich Stats Bar */}
                {series.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08, duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
                    >
                        <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border-white/5">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                <Play size={16} className="text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-bold text-white leading-none">{stats.totalSeries}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Aktif Dizi</p>
                            </div>
                        </div>
                        <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border-white/5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Eye size={16} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-bold text-white leading-none">{stats.completedEpisodes}<span className="text-xs text-slate-600 font-normal">/{stats.totalEpisodes}</span></p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Bölüm</p>
                            </div>
                        </div>
                        <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border-white/5">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen size={16} className="text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-bold text-white leading-none">{stats.totalVocabulary}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Kelime</p>
                            </div>
                        </div>
                        <div className="glass-panel rounded-xl px-4 py-3 border-white/5">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">İlerleme</span>
                                <span className="text-sm font-bold text-white">%{stats.overallProgress}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.overallProgress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Series Grid */}
                {series.length > 0 ? (
                    <>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dizilerim</h2>
                        <span className="text-[10px] text-slate-600 font-mono">{stats.completedEpisodes} / {stats.totalEpisodes} bölüm izlendi</span>
                    </div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
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
                            className="group aspect-[3/4] rounded-2xl border border-dashed border-white/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/[0.02]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                                <Plus size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <span className="text-slate-600 group-hover:text-slate-400 text-xs font-medium transition-colors">Dizi Ekle</span>
                        </motion.button>
                    </motion.div>
                    </>
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

                {/* Discover Section - Controlled by settings */}
                {series.length > 0 && showRecommendations && (
                    <div className="mt-6">
                        <RecommendationsSection
                            onStart={onStartWatching}
                            onWatchlist={onAddToWatchlist}
                            watchlist={watchlist}
                            smartRecs={smartRecs}
                            isExpanded={showFullRecs}
                            onToggle={() => setShowFullRecs(!showFullRecs)}
                        />
                    </div>
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
    const vocabCount = Object.values(userData[s.id]?.vocabulary || {}).reduce((sum, words) => sum + (Array.isArray(words) ? words.length : 0), 0);
    const primaryGenre = s.genres?.[0];

    return (
        <motion.div
            variants={itemVariants}
            className="group relative"
        >
            <button
                onClick={() => onSeriesClick(s.id)}
                className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 border border-white/5 hover:border-indigo-500/30 transition-all duration-300"
            >
                {/* Background Image */}
                {s.image?.original && (
                    <div className="absolute inset-0">
                        <img
                            src={s.image.original}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={s.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded backdrop-blur-md border uppercase tracking-widest ${getDifficultyBadgeClass(difficulty.id)}`}>
                                {difficulty.text}
                            </span>
                            {primaryGenre && (
                                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-md text-slate-300 border border-white/10 uppercase tracking-wide">
                                    {primaryGenre}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDeleteSeries(e, s.id); }}
                            className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all border border-white/10"
                            aria-label="Diziyi Sil"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>

                    {/* Bottom Info */}
                    <div>
                        <h3 className="text-base font-bold text-white mb-2 text-left line-clamp-2 leading-snug">{s.name}</h3>

                        {/* Micro Stats Row */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] text-slate-300 font-mono bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded">
                                {completed}/{total}
                            </span>
                            {vocabCount > 0 && (
                                <span className="text-[9px] text-purple-300 font-mono bg-purple-500/15 backdrop-blur-sm px-1.5 py-0.5 rounded border border-purple-500/20">
                                    {vocabCount} kelime
                                </span>
                            )}
                            {s.rating?.average && (
                                <span className="text-[9px] text-amber-300 font-mono bg-amber-500/15 backdrop-blur-sm px-1.5 py-0.5 rounded border border-amber-500/20 ml-auto">
                                    ★ {s.rating.average}
                                </span>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 font-medium">İlerleme</span>
                                <span className="text-white font-bold tabular-nums">%{pct}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 }}
                                    className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                />
                            </div>
                        </div>

                        {/* Hover CTA */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                                <ArrowRight size={12} />
                                <span>Görüntüle</span>
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
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Tüm <span className="text-indigo-400">Öneriler</span>
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
            {/* Hero Section - Minimal */}
            <div className="max-w-xl mx-auto text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Hadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">başlayalım</span>
                </h2>
                <p className="text-slate-500 mb-6">
                    İzlemek istediğin diziyi bul
                </p>

                {/* Search Button */}
                <button
                    onClick={onAddClick}
                    className="group inline-flex items-center gap-3 px-6 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl text-slate-400 transition-all hover:border-indigo-500/50 hover:text-white hover:bg-white/[0.05]"
                >
                    <Search size={18} className="text-indigo-400" />
                    <span className="font-medium">Dizi ara...</span>
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
