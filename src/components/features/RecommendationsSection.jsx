import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Clock, Loader, CalendarPlus,
    ImageOff, Check, GraduationCap, Sparkles,
    Sprout, Leaf, TreeDeciduous, TreePine, Mountain, MountainSnow
} from 'lucide-react';
import { TVMazeService } from '../../services/TVMazeService';
import { RECOMMENDATIONS, CEFR_LEVELS } from '../../data/recommendations';

const SeriesCard = ({ id, onStart, onWatchlist, watchlist, level }) => {
    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchShow = async () => {
            try {
                const data = await TVMazeService.getShowDetails(id);
                if (mounted) setShow(data);
            } catch (e) {
                console.error("Failed to fetch show", id, e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchShow();
        return () => { mounted = false; };
    }, [id]);

    if (loading) return <div className="min-w-[170px] h-[255px] bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse mx-2 flex items-center justify-center"><Loader size={20} className="animate-spin text-slate-700" /></div>;

    // Strict validation: Don't render if failed, or if name is "Not Found"
    if (!show || show.name === 'Not Found' || show.status === 404) return null;

    const hasImage = show.image?.medium && !imgError;
    // Check if series is in watchlist
    const isInWatchlist = watchlist?.some(item => item.id === show.id);

    return (
        <div
            className="group relative min-w-[170px] w-[170px] h-[255px] rounded-2xl overflow-hidden cursor-pointer mx-2 transition-all hover:shadow-2xl hover:shadow-indigo-500/20 glass-panel border-white/5"
        >
            {hasImage ? (
                <img
                    src={show.image.medium}
                    alt={show.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center justify-center p-4 text-center">
                    <ImageOff size={32} className="text-slate-600 mb-2" />
                    <span className="text-xs text-slate-500 font-medium line-clamp-2">{show.name}</span>
                </div>
            )}

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="relative group/tooltip">
                    <button
                        onClick={(e) => { e.stopPropagation(); onWatchlist(show); }}
                        className={`p-1.5 rounded-full transition-all duration-200 ${isInWatchlist
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                            : 'bg-black/40 hover:bg-indigo-600 backdrop-blur-sm'}`}
                    >
                        {isInWatchlist ? (
                            <Check className="text-white" size={18} />
                        ) : (
                            <Clock className="text-white" size={18} />
                        )}
                    </button>
                    {/* Custom Tooltip */}
                    <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 border border-white/10 shadow-xl">
                        {isInWatchlist ? '✓ Listede' : 'Daha Sonra İzle'}
                        <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900/95 border-l border-t border-white/10 transform rotate-45" />
                    </div>
                </div>
            </div>

            {/* Level Badge (Modern Compact Design) */}
            {level && (
                <div className="absolute top-2 left-2 z-20">
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg backdrop-blur-md border tracking-wide flex items-center justify-center min-w-[28px] ${['A1', 'A2'].includes(level) ? 'bg-emerald-500/80 text-white border-emerald-400/50 shadow-emerald-500/20' :
                        ['B1', 'B2'].includes(level) ? 'bg-indigo-500/80 text-white border-indigo-400/50 shadow-indigo-500/20' :
                            'bg-rose-500/80 text-white border-rose-400/50 shadow-rose-500/20'
                        }`}>
                        {level}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                    onClick={() => onStart(show)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                >
                    <CalendarPlus size={14} /> DİZİYE BAŞLA
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                <h4 className="text-white font-bold text-sm leading-tight text-shadow-sm truncate">{show.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-300 font-medium px-1.5 py-0.5 bg-white/10 rounded backdrop-blur-sm">
                        {show.rating?.average || 'N/A'}
                    </span>
                    {show.genres?.[0] && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                            {show.genres[0]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecommendationRow = ({ title, description, items, level, onStart, onWatchlist, watchlist }) => {
    const scrollRef = React.useRef(null);
    const levelInfo = CEFR_LEVELS[level];

    // İkon haritası
    const IconMap = {
        Sprout: Sprout,
        Leaf: Leaf,
        TreeDeciduous: TreeDeciduous,
        TreePine: TreePine,
        Mountain: Mountain,
        MountainSnow: MountainSnow
    };

    const LevelIcon = levelInfo ? IconMap[levelInfo.icon] : null;

    // Renk haritası
    const colorMap = {
        emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };

    const scroll = (offset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-14 animate-fade-in-up"> {/* Margin artırıldı (8 -> 14) */}
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        {title}
                        {levelInfo && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border tracking-tighter ${levelInfo.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                levelInfo.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    levelInfo.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                }`}>
                                {level}
                            </span>
                        )}
                    </h3>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{description}</span>
                </div>
            </div>

            {/* Slider Container */}
            <div className="relative group/row">
                {/* Left Button & Shadow */}
                <button
                    onClick={() => scroll(-400)}
                    className="absolute -left-2 top-0 bottom-0 w-20 bg-gradient-to-r from-[#05070a] via-[#05070a]/60 to-transparent z-30 flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
                    aria-label="Sola kaydır"
                >
                    <ChevronLeft className="text-white drop-shadow-2xl" size={48} />
                </button>

                {/* Scroll Area */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-4 pt-2 scrollbar-hide -mx-2 px-2 scroll-smooth"
                >
                    {items.map(item => (
                        <SeriesCard
                            key={item.id}
                            id={item.id}
                            onStart={onStart}
                            onWatchlist={onWatchlist}
                            watchlist={watchlist}
                            level={item.level || (levelInfo ? level : null)}
                        />
                    ))}
                </div>

                {/* Right Button & Shadow */}
                <button
                    onClick={() => scroll(400)}
                    className="absolute -right-2 top-0 bottom-0 w-20 bg-gradient-to-l from-[#05070a] via-[#05070a]/60 to-transparent z-30 flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
                    aria-label="Sağa kaydır"
                >
                    <ChevronRight className="text-white drop-shadow-2xl" size={48} />
                </button>
            </div>
        </div>
    );
};

const RecommendationsSection = ({ onStart, onWatchlist, watchlist, smartRecs, isExpanded = true, onToggle }) => {
    const [activeTab, setActiveTab] = useState(smartRecs?.hasPreferences ? 'foryou' : 'all');

    // Eğer kullanıcının tercihi yoksa (yeni kullanıcı), otomatik "all" sekmesine geç
    useEffect(() => {
        if (!smartRecs?.hasPreferences) {
            setActiveTab('all');
        } else {
            setActiveTab('foryou');
        }
    }, [smartRecs?.hasPreferences]);

    return (
        <div className="pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Dizi Önerileri</h2>
                    <p className="text-slate-400 text-sm font-medium">Dil seviyenize ve zevklerinize uygun içerikler.</p>
                </div>

                {/* Controls & Tabs Container */}
                <div className="flex bg-slate-800/50 p-1 rounded-xl self-start md:self-auto">
                    {/* Toggle Button */}
                    <button
                        onClick={onToggle}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-all hover:bg-white/5"
                    >
                        {isExpanded ? 'Gizle' : 'Göster'}
                    </button>

                    {/* Separator (only if tabs exist) */}
                    {smartRecs?.hasPreferences && <div className="w-px bg-white/10 my-1 mx-1" />}

                    {/* Tabs */}
                    {smartRecs?.hasPreferences && (
                        <>
                            <button
                                onClick={() => setActiveTab('foryou')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'foryou'
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-400 hover:text-white'}`}
                            >
                                Sana Özel
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all'
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-400 hover:text-white'}`}
                            >
                                Tüm Liste
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="min-h-[400px] animate-fade-in">
                    {activeTab === 'foryou' && smartRecs ? (
                        <div className="space-y-2">
                            {/* 1. En İyi Eşleşmeler */}
                            {smartRecs.topPicks.length > 0 && (
                                <RecommendationRow
                                    title="Sizin İçin Seçtiklerimiz"
                                    description="İzlediğiniz türlere ve seviyenize göre en iyi eşleşmeler."
                                    items={smartRecs.topPicks}
                                    level="TOP" // Özel stil için
                                    onStart={onStart}
                                    onWatchlist={onWatchlist}
                                    watchlist={watchlist}
                                />
                            )}

                            {/* 2. Türe Göre Öneriler */}
                            {Object.entries(smartRecs.byGenre).map(([genre, items]) => (
                                <RecommendationRow
                                    key={genre}
                                    title={`${genre} Severler İçin`}
                                    description={`Favori türlerinizden biri olan ${genre} kategorisinde öneriler.`}
                                    items={items}
                                    level="GENRE"
                                    onStart={onStart}
                                    onWatchlist={onWatchlist}
                                    watchlist={watchlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {RECOMMENDATIONS.map((cat, idx) => (
                                <RecommendationRow
                                    key={idx}
                                    title={cat.title}
                                    description={cat.description}
                                    items={cat.items}
                                    level={cat.level}
                                    onStart={onStart}
                                    onWatchlist={onWatchlist}
                                    watchlist={watchlist}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendationsSection;
