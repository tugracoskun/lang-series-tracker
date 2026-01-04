import React from 'react';
import { Plus, Trash2, Menu, Search, Loader, Clock, Sparkles, GraduationCap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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

const Dashboard = ({
    onSeriesClick,
    onAddClick,
    onDeleteSeries,
    onStartWatching,
    onAddToWatchlist
}) => {
    const { series, userData, watchlist, setSidebarOpen, cefrLevel } = useAppStore();
    const onMenuClick = () => setSidebarOpen(true);
    const [showFullRecs, setShowFullRecs] = React.useState(false);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
            {/* Mobile Menu Button - Only visible on small screens */}
            <div className="absolute top-6 left-6 z-50 lg:hidden">
                <button
                    onClick={onMenuClick}
                    className="p-3 bg-[#13161C] border border-white/10 text-slate-400 hover:text-white rounded-xl shadow-xl transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="cinematic-bg" style={{
                backgroundImage: series[0]?.image?.original ? `url(${series[0].image.original})` : 'none',
                opacity: 0.2
            }}></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                <div className="relative">
                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-3xl" />
                    <h1 className="text-6xl md:text-8xl font-codon font-bold text-white tracking-[0.2em] drop-shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-float">
                        LANG<span className="text-transparent bg-clip-text bg-[linear-gradient(to_right,#6366f1,#a855f7,#ec4899,#6366f1)] bg-[length:200%_auto] animate-shimmer-slow">TRACKER</span>
                    </h1>
                </div>
            </header>

            {/* Styled FAB for Add Series - Only show if user has series */}
            {series.length > 0 && (
                <button
                    onClick={onAddClick}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 group flex items-center justify-center p-1 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-500 hover:scale-110 active:scale-95"
                >
                    <div className="bg-[#0F1218] rounded-full p-4 flex items-center gap-3 transition-all group-hover:bg-transparent">
                        <Plus size={32} className="text-white group-hover:rotate-90 transition-transform duration-500" />
                        <span className="hidden group-hover:inline-block font-bold text-white whitespace-nowrap pr-2 animate-fade-in">
                            YENİ DİZİ EKLE
                        </span>
                    </div>
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {series.map(s => {
                    const total = s.schedule
                        ?.flatMap(sch => sch.tours)
                        ?.flatMap(t => t.weeks)
                        ?.flatMap(w => w.days)
                        ?.filter(d => d.epId).length || 0;

                    const completed = Object.keys(userData[s.id]?.completed || {}).length;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const difficulty = estimateDifficulty(s);

                    return (
                        <motion.button
                            key={s.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => onSeriesClick(s.id)}
                            className="glass-panel text-left rounded-[2rem] p-8 cursor-pointer border-white/5 hover:border-indigo-500/50 transition-all h-[450px] flex flex-col justify-end relative overflow-hidden group outline-none"
                        >
                            {s.image?.original && (
                                <div className="absolute inset-0">
                                    <img src={s.image.original} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110" alt={s.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/20 to-transparent"></div>
                                </div>
                            )}
                            <div className="relative z-10 w-full">
                                <div className="absolute top-[-320px] right-[-10px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-4">
                                    <span className={`liquid-badge ${getDifficultyBadgeClass(difficulty.id)}`}>
                                        {difficulty.text}
                                    </span>
                                </div>
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDeleteSeries(e, s.id); }}
                                        className="p-3 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-white/5 active:scale-90"
                                        aria-label="Diziyi Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h3 className="text-4xl font-display font-black text-white mb-4 tracking-tight">{s.name}</h3>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                                    <span>İlerleme</span>
                                    <span className="text-indigo-400">%{pct}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    />
                                </div>
                            </div>
                        </motion.button>
                    );
                })}

                {series.length === 0 && !showFullRecs && (
                    <InitialSetupView
                        onAddClick={onAddClick}
                        cefrLevel={cefrLevel}
                        onStartWatching={onStartWatching}
                        onAddToWatchlist={onAddToWatchlist}
                        watchlist={watchlist}
                        onShowAll={() => setShowFullRecs(true)}
                    />
                )}
            </div>

            {/* Discover Section Trigger */}
            {(series.length > 0 || showFullRecs) && (
                <div className="mt-20 border-t border-white/5 pt-12 text-center">
                    {!showFullRecs ? (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-300 mb-4">Yeni bir şeyler mi arıyorsun?</h3>
                            <button
                                onClick={() => setShowFullRecs(true)}
                                className="group inline-flex items-center gap-3 px-8 py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl text-indigo-400 transition-all"
                            >
                                <Sparkles size={20} className="group-hover:animate-spin" />
                                <span className="font-bold">Tüm Dizi Önerilerini Keşfet</span>
                            </button>
                        </div>
                    ) : (
                        <div className="relative animate-fade-in text-left">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Sparkles className="text-indigo-400" />
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
                </div>
            )}
        </div>
    );
};

const InitialSetupView = ({ onAddClick, cefrLevel, onStartWatching, onAddToWatchlist, watchlist, onShowAll }) => {
    // Current level recommendations
    const currentLevelRecs = RECOMMENDATIONS.find(r => r.level === cefrLevel) || RECOMMENDATIONS[2];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-12"
        >
            {/* Search Prompt */}
            <div className="max-w-2xl mx-auto text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6">
                    <Sparkles size={16} />
                    YOLCULUĞUNA BAŞLA
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 leading-tight">
                    TAKİP ETMEK İSTEDİĞİN <span className="text-indigo-400">İLK DİZİYİ</span> SEÇ
                </h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                    Aradığın bir dizi var mı? Koleksiyona eklemek için ismini yazabilir veya seviyene uygun önerilerimizden seçim yapabilirsin.
                </p>

                <div className="relative group max-w-md mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <button
                        onClick={onAddClick}
                        className="relative w-full flex items-center gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-slate-400 transition-all group-hover:border-white/20 group-hover:text-white group-hover:bg-white/[0.05] outline-none"
                    >
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                            <Search size={24} />
                        </div>
                        <span className="text-xl font-medium">Dizini keşfetmeye başla...</span>
                    </button>
                </div>
            </div>

            {/* Curated Recommendations */}
            <div className="mt-20">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400`}>
                            <GraduationCap size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-2xl font-bold text-white">Seviyen İçin Önerilenler</h3>
                            <p className="text-sm text-slate-500">{CEFR_LEVELS[cefrLevel]?.name} seviyesine uygun başlangıç içerikleri.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {currentLevelRecs.items.slice(0, 6).map(item => (
                        <SimplifiedRecCard
                            key={item.id}
                            id={item.id}
                            onStart={onStartWatching}
                            onWatchlist={onAddToWatchlist}
                            watchlist={watchlist}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={onShowAll}
                        className="text-slate-500 hover:text-indigo-400 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
                    >
                        <span>TÜM SEVİYELERİ GÖR</span>
                        <Clock size={14} />
                    </button>
                </div>
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
    onShowAll: PropTypes.func.isRequired
};

// A more lightweight version of the recommendation card for the initial view
const SimplifiedRecCard = ({ id, onStart, onWatchlist, watchlist }) => {
    return (
        <div className="aspect-[2/3] group relative rounded-2xl overflow-hidden glass-panel border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer">
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

    if (loading) return <div className="h-full w-full flex items-center justify-center"><Loader size={20} className="animate-spin text-slate-700" /></div>;
    if (!show) return null;

    const isInWatchlist = watchlist?.some(item => item.id === show.id);

    return (
        <>
            {show.image?.medium && (
                <img src={show.image.medium} alt={show.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-black/60 transition-all flex flex-col justify-end p-4">
                <h4 className="text-white font-bold text-sm mb-2 group-hover:mb-3 transition-all truncate text-left">{show.name}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(show); }}
                        className="flex-1 bg-white text-black text-[10px] font-black py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                    >
                        BAŞLA
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
