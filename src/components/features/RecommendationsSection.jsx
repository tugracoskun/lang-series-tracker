import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, PlusCircle, Info, Loader, Play, Clock,
    ImageOff, Check, CheckCircle, GraduationCap,
    Sprout, Leaf, TreeDeciduous, TreePine, Mountain, MountainSnow
} from 'lucide-react';
import { TVMazeService } from '../../services/TVMazeService';
import { RECOMMENDATIONS, CEFR_LEVELS } from '../../data/recommendations';

const SeriesCard = ({ id, onStart, onWatchlist, watchlist }) => {
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
                <button
                    onClick={(e) => { e.stopPropagation(); onWatchlist(show); }}
                    className={`p-1 rounded-full transition-colors ${isInWatchlist ? 'bg-emerald-500/80 hover:bg-emerald-600' : 'hover:bg-black/50'}`}
                    title={isInWatchlist ? "Listede Var" : "İzleme Listesine Ekle"}
                >
                    {isInWatchlist ? (
                        <Check className="text-white drop-shadow-md" size={24} />
                    ) : (
                        <PlusCircle className="text-white drop-shadow-md hover:text-indigo-400 transition-colors" size={24} />
                    )}
                </button>
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                    onClick={() => onStart(show)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                >
                    <Play size={14} fill="currentColor" /> BAŞLA
                </button>
                <button
                    onClick={() => onWatchlist(show)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 ${isInWatchlist
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                >
                    {isInWatchlist ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {isInWatchlist ? 'LİSTEDE' : 'LİSTE'}
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
        <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4 px-2">
                {/* CEFR Seviye Badge */}
                {levelInfo && (
                    <span className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black border backdrop-blur-xl shadow-2xl transition-all duration-500 scale-100 hover:scale-105 ${levelInfo.color === 'emerald' ? 'liquid-badge-emerald' : levelInfo.color === 'amber' ? 'liquid-badge-amber' : levelInfo.color === 'rose' ? 'liquid-badge-rose' : 'liquid-badge-indigo'}`}>
                        {LevelIcon && <LevelIcon size={18} />}
                        {level}
                    </span>
                )}
                <div>
                    <h3 className="text-xl font-display font-bold text-slate-200">{title}</h3>
                    <span className="text-sm text-slate-500 hidden md:inline-block">{description}</span>
                </div>
            </div>

            <div className="relative group/row">
                <button
                    onClick={() => scroll(-300)}
                    className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60"
                >
                    <ChevronLeft className="text-white" size={32} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-4 scrollbar-hide py-4 -my-4 px-2"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {items.map(item => (
                        <SeriesCard
                            key={item.id}
                            id={item.id}
                            onStart={onStart}
                            onWatchlist={onWatchlist}
                            watchlist={watchlist}
                        />
                    ))}
                </div>

                <button
                    onClick={() => scroll(300)}
                    className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent z-20 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60"
                >
                    <ChevronRight className="text-white" size={32} />
                </button>
            </div>
        </div>
    );
};

const RecommendationsSection = ({ onStart, onWatchlist, watchlist }) => {
    return (
        <div className="mt-16 border-t border-slate-800/50 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <GraduationCap className="text-indigo-400" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">CEFR Seviyelerine Göre Diziler</h2>
                    <p className="text-slate-400">A1'den C2'ye kadar dil seviyenize uygun içerikler. Toplam 60+ dizi.</p>
                </div>
            </div>

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
    );
};

export default RecommendationsSection;
