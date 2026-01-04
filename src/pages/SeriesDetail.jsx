import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Info, Menu, BookOpen, RotateCcw, Lock, Clock, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import EpisodeModal from '../components/modals/EpisodeModal';
import { useAppStore } from '../store/useAppStore';
import { getSubtitleDisplay, ROTATION_STRATEGIES } from '../utils/schedule';
import { useTraktWatchStatus } from '../hooks/useTraktWatchStatus';

// --- Sub-components to reduce nesting ---

const DayItem = ({ day, seasonNumber, activeTour, data, openEpisode, toggleDay, traktWatched, metadata }) => {
    if (!day.epId) return null;
    const id = `s${seasonNumber}-t${activeTour}-d${day.epId}`;
    const completedAt = data.completed?.[id];
    const isChecked = !!completedAt;
    const hasVocab = data.vocabulary?.[day.epId]?.length > 0;
    const subtitleInfo = getSubtitleDisplay(day.l);
    const isOnTrakt = traktWatched?.[id];
    const { isLocked, deadline } = metadata || {};

    // Timer Logic for Countdown (to deadline)
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (isChecked || isLocked || !deadline) return;
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, [isChecked, isLocked, deadline]);

    let displayLabel = null;
    let isDeadlinePassed = false;
    let isNearDeadline = false;

    // 1. If Checked: Show Completed Time
    if (isChecked) {
        if (completedAt === true) {
            displayLabel = "Tamamlandı";
        } else {
            const date = new Date(completedAt);
            displayLabel = `İzlendi: ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
            // Optional: Add date if not today
        }
    }
    // 2. If Open (Not Checked, Not Locked, Has Deadline): Show Countdown
    else if (!isLocked && deadline) {
        const diff = deadline.getTime() - now;

        if (diff <= 0) {
            isDeadlinePassed = true;
            displayLabel = "Süre Doldu";
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            displayLabel = `Sıfırlanmaya: ${h}s ${m}d`;
            if (h < 2) isNearDeadline = true;
        }
    }

    return (
        <button
            onClick={() => !isLocked && openEpisode(day, id)}
            disabled={isLocked}
            className={`group w-full text-left flex items-start gap-3 p-2.5 rounded-lg transition-all duration-300 border 
                ${isLocked ? 'opacity-50 cursor-not-allowed bg-black/10 border-transparent' : 'cursor-pointer'}
                ${isDeadlinePassed ? 'bg-rose-500/10 border-rose-500/50 hover:bg-rose-500/20' :
                    isChecked ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]' :
                        !isLocked ? 'hover:bg-white/10 hover:border-white/20 bg-black/20 border-transparent' : ''}`}
        >
            <div className="relative group/check mt-1">
                {isLocked ? (
                    <Lock size={14} className="text-slate-600" />
                ) : isDeadlinePassed ? (
                    <AlertCircle size={14} className="text-rose-500 animate-pulse" />
                ) : (
                    <>
                        <input
                            type="checkbox"
                            checked={!!isChecked}
                            onChange={() => toggleDay(id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border border-slate-600 appearance-none checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer hover:border-emerald-400 transition-all focus:ring-2 focus:ring-emerald-500 outline-none"
                            id={`checkbox-${id}`}
                        />
                        {isChecked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Check size={10} className="text-white" />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className={`text-xs font-medium truncate ${isChecked ? 'text-slate-500 line-through' : isDeadlinePassed ? 'text-rose-300 font-bold' : isLocked ? 'text-slate-600' : 'text-slate-200 group-hover:text-white'}`}>
                        {day.number}. {day.epName}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wider border ${subtitleInfo.bgClass}`}>
                        {subtitleInfo.label}
                    </span>

                    {/* Status Badge */}
                    {displayLabel && (
                        <span className={`text-[9px] px-1.5 py-px rounded border flex items-center gap-1 font-mono
                            ${isChecked ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' :
                                isDeadlinePassed ? 'text-rose-300 bg-rose-500/10 border-rose-500/20 font-bold' :
                                    isNearDeadline ? 'text-amber-300 bg-amber-500/10 border-amber-500/20 animate-pulse' :
                                        'text-blue-300 bg-blue-500/10 border-blue-500/20'}`}>
                            <Clock size={8} /> {displayLabel}
                        </span>
                    )}

                    {hasVocab && (
                        <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-px rounded border border-purple-500/20">
                            Kelime
                        </span>
                    )}
                    {isOnTrakt && (
                        <span className="text-[9px] text-[#ED1C24] bg-[#ED1C24]/10 px-1.5 py-px rounded border border-[#ED1C24]/30 font-medium">
                            Trakt ✓
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

DayItem.propTypes = {
    day: PropTypes.object.isRequired,
    seasonNumber: PropTypes.number.isRequired,
    activeTour: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    openEpisode: PropTypes.func.isRequired,
    toggleDay: PropTypes.func.isRequired,
    traktWatched: PropTypes.object,
    metadata: PropTypes.shape({
        isLocked: PropTypes.bool,
        deadline: PropTypes.instanceOf(Date)
    })
};

const WeekCard = ({ week, seasonNumber, activeTour, data, openEpisode, toggleDay, traktWatched, getMetadata }) => {
    // Check if the week is locked by checking the first episode
    const firstDay = week.days.find(d => d.epId);
    const isWeekLocked = firstDay ? getMetadata(`s${seasonNumber}-t${activeTour}-d${firstDay.epId}`).isLocked : false;

    return (
        <div className={`rounded-xl p-4 border transition-all duration-300 relative overflow-hidden ${isWeekLocked ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-indigo-500/30'}`}>
            {isWeekLocked && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-xl">
                        <Lock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Kilitli</span>
                    </div>
                </div>
            )}

            <h4 className={`text-xs font-bold uppercase mb-3 px-1 ${isWeekLocked ? 'text-slate-600' : 'text-slate-500'}`}>HAFTA {week.week}</h4>
            <div className={`space-y-2 ${isWeekLocked ? 'pointer-events-none filter blur-[1px]' : ''}`}>
                {week.days.map((day, idx) => (
                    <DayItem
                        key={day.epId || idx}
                        day={day}
                        seasonNumber={seasonNumber}
                        activeTour={activeTour}
                        data={data}
                        openEpisode={openEpisode}
                        toggleDay={toggleDay}
                        traktWatched={traktWatched}
                        metadata={getMetadata(`s${seasonNumber}-t${activeTour}-d${day.epId}`)}
                    />
                ))}
            </div>
        </div>
    );
};

WeekCard.propTypes = {
    week: PropTypes.object.isRequired,
    seasonNumber: PropTypes.number.isRequired,
    activeTour: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    openEpisode: PropTypes.func.isRequired,
    toggleDay: PropTypes.func.isRequired,
    traktWatched: PropTypes.object,
    getMetadata: PropTypes.func.isRequired
};

// --- Main Component ---

const SeriesDetail = ({ seriesList, data: allUserData, onUpdate, onSeriesSettingsUpdate }) => {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const { setSidebarOpen } = useAppStore();

    const [expandedSeason, setExpandedSeason] = useState(1);
    const [activeTour, setActiveTour] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [showStrategyPicker, setShowStrategyPicker] = useState(false);

    const series = useMemo(() => seriesList?.find(s => s.id === seriesId), [seriesList, seriesId]);
    const data = useMemo(() => allUserData?.[seriesId] || {}, [allUserData, seriesId]);

    // Fetch Trakt.tv watch status for this series
    const { traktWatched, markAsWatched } = useTraktWatchStatus(series);

    useEffect(() => {
        if (series?.schedule?.[0]?.season) {
            setExpandedSeason(series.schedule[0].season);
        }
    }, [series]);

    const totalSlots = useMemo(() => {
        if (!series?.schedule) return 0;
        return series.schedule
            .flatMap(season => season.tours)
            .flatMap(tour => tour.weeks)
            .flatMap(week => week.days)
            .filter(day => day.epId).length;
    }, [series]);

    // Create an ordered list of all episode context IDs to handle sequential locking
    const orderedEpisodeIds = useMemo(() => {
        if (!series?.schedule) return [];
        return series.schedule
            .flatMap(season => season.tours.map(tour => ({ season, tour })))
            .flatMap(({ season, tour }) => tour.weeks.map(week => ({ season, tour, week })))
            .flatMap(({ season, tour, week }) => week.days.filter(d => d.epId).map(day =>
                `s${season.season}-t${tour.id}-d${day.epId}`
            ));
    }, [series]);

    // Check for expiration (24h limit)
    const checkExpiration = useCallback((completedAt) => {
        if (!completedAt) return true;
        // If boolean true (legacy data), consider it fresh? Or expired? Let's assume fresh to not break old users
        if (completedAt === true) return false;

        const diff = Date.now() - new Date(completedAt).getTime();
        const hours = diff / (1000 * 60 * 60);
        return hours >= 24;
    }, []);

    // Get extended metadata for an episode: locked status, deadline for loop reset
    const getEpisodeMetadata = useCallback((dayId) => {
        const index = orderedEpisodeIds.indexOf(dayId);

        let isLocked = false;
        let deadline = null;

        if (index > 0) {
            const prevId = orderedEpisodeIds[index - 1];
            const prevCompletedAt = data.completed?.[prevId];

            if (!prevCompletedAt) {
                isLocked = true; // Prev not done -> Locked
            } else {
                // Deadline is 24h after previous episode
                // If prevCompletedAt is just "true" (legacy), we assume infinite deadline (always unlocked)
                if (prevCompletedAt !== true) {
                    deadline = new Date(new Date(prevCompletedAt).getTime() + (24 * 60 * 60 * 1000));

                    // Check expiration
                    if (Date.now() > deadline.getTime()) {
                        isLocked = true; // Loop reset triggered (deadline passed)
                    }
                }
            }
        } else {
            // First episode is unlocked, no deadline
        }

        return { isLocked, deadline };
    }, [orderedEpisodeIds, data.completed]);

    const completedCount = useMemo(() => Object.keys(data.completed || {}).length, [data.completed]);
    const percentage = totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;

    const toggleDay = useCallback((dayId) => {
        const newCompleted = { ...data.completed };
        const isMarking = !newCompleted[dayId]; // Are we marking or unmarking?

        if (newCompleted[dayId]) delete newCompleted[dayId];
        else newCompleted[dayId] = true;

        onUpdate(series.id, { completed: newCompleted });

        // Optimistically update Trakt badge when marking as watched
        // The actual scrobble happens in useSeriesManager
        if (isMarking && markAsWatched) {
            // Small delay to let the scrobble complete
            setTimeout(() => markAsWatched(dayId), 1500);
        }
    }, [data.completed, onUpdate, series?.id, markAsWatched]);

    const updateVocab = useCallback((epId, newVocabList) => {
        const newVocabulary = { ...data.vocabulary };
        newVocabulary[epId] = newVocabList;
        onUpdate(series.id, { vocabulary: newVocabulary });
    }, [data.vocabulary, onUpdate, series?.id]);

    const openEpisode = useCallback((day, contextId) => {
        const fullEp = series.episodes.find(e => e.id === day.epId);
        setSelectedEpisode({
            episode: fullEp,
            context: { id: contextId, l: day.l }
        });
    }, [series]);

    if (!series) {
        return <div className="p-10 text-center text-slate-500">Dizi bulunamadı...</div>;
    }

    return (
        <div className="animate-fade-in pb-32 relative min-h-screen">
            <EpisodeModal
                isOpen={!!selectedEpisode}
                onClose={() => setSelectedEpisode(null)}
                episode={selectedEpisode?.episode}
                context={selectedEpisode?.context}
                data={data}
                onToggle={toggleDay}
                onUpdateVocab={updateVocab}
                seriesId={series.id}
                seriesName={series.name}
                isTraktWatched={selectedEpisode ? traktWatched?.[selectedEpisode.context?.id] : false}
            />

            <div className="fixed inset-0 z-0">
                {series.image?.original && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
                        style={{ backgroundImage: `url(${series.image.original})` }}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            <div className="relative z-10">
                <div className="sticky top-0 z-30 bg-[#000]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0" aria-label="Geri">
                                <ArrowLeft className="text-slate-200" size={20} />
                            </button>
                            <div className="flex-1 max-w-xl">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <h1 className="text-2xl font-display font-bold text-white tracking-tight">{series.name}</h1>
                                    <span className="text-xs font-sans font-medium text-indigo-400 tracking-wide">%{percentage} TAMAMLANDI</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 background-animate" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-sans font-medium text-slate-400 mt-2 tracking-wide">
                                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{series.episodes?.length || 0} BÖLÜM</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{series.schedule?.length || 0} SEZON</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button
                                    onClick={() => setShowStrategyPicker(!showStrategyPicker)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                                >
                                    <RotateCcw size={14} />
                                    <span className="hidden sm:inline">{ROTATION_STRATEGIES[series.rotationStrategy]?.name || 'Klasik'}</span>
                                    <ChevronDown size={14} className={`transition-transform ${showStrategyPicker ? 'rotate-180' : ''}`} />
                                </button>
                                {showStrategyPicker && (
                                    <>
                                        <button className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent" onClick={() => setShowStrategyPicker(false)} aria-label="Kapat" />
                                        <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                            <div className="p-3 border-b border-white/10">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rotasyon Stratejisi</h4>
                                                <p className="text-[10px] text-slate-500 mt-1">Bu dizi için altyazı rotasyonunu seç</p>
                                            </div>
                                            <div className="p-2 max-h-80 overflow-y-auto">
                                                {Object.values(ROTATION_STRATEGIES).map(strategy => {
                                                    const isActive = series.rotationStrategy === strategy.id;
                                                    return (
                                                        <button
                                                            key={strategy.id}
                                                            onClick={() => {
                                                                onSeriesSettingsUpdate?.(series.id, { rotationStrategy: strategy.id });
                                                                setShowStrategyPicker(false);
                                                            }}
                                                            className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${isActive ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-500/30' : 'bg-white/5'}`}>
                                                                <RotateCcw size={14} className={isActive ? 'text-indigo-300' : 'text-slate-500'} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>{strategy.name}</div>
                                                                <div className="text-[10px] text-slate-500 mt-0.5">{strategy.description}</div>
                                                                <div className="text-[9px] text-indigo-400/80 mt-1">Önerilen: {strategy.recommended}</div>
                                                            </div>
                                                            {isActive && <Check size={16} className="text-indigo-400 shrink-0 mt-1" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setSidebarOpen(true)} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
                    {series.schedule.map(seasonData => {
                        const isExpanded = expandedSeason === seasonData.season;
                        const currentTourData = seasonData.tours.find(t => t.id === activeTour);

                        // Calculate stats without deep nesting
                        const seasonEpisodes = seasonData.tours
                            .flatMap(t => t.weeks.map(w => ({ weeks: w, tourId: t.id })))
                            .flatMap(item => item.weeks.days.map(d => ({ ...d, tourId: item.tourId })))
                            .filter(d => d.epId);

                        const sTotal = seasonEpisodes.length;
                        const sDone = seasonEpisodes.filter(d =>
                            data.completed?.[`s${seasonData.season}-t${d.tourId}-d${d.epId}`]
                        ).length;

                        const sPct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;

                        return (
                            <div key={seasonData.season} className={`glass-panel rounded-2xl overflow-hidden transition-all duration-500 ${isExpanded ? 'bg-slate-900/40 border-indigo-500/30' : 'hover:border-white/20'}`}>
                                <button onClick={() => setExpandedSeason(isExpanded ? null : seasonData.season)} className="w-full flex items-center justify-between p-6 text-left group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${sPct === 100 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            {sPct === 100 ? <Check size={24} /> : seasonData.season}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{seasonData.season}. Sezon</h3>
                                            <p className="text-sm text-slate-400 font-mono mt-1">{seasonData.tours[0]?.weeks.reduce((acc, w) => acc + w.days.filter(d => d.epId).length, 0) || 0} Bölüm</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-xl font-bold font-display text-slate-500">{sPct}%</div>
                                        <ChevronDown className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-white/5 bg-black/20">
                                        <div className="flex border-b border-white/5">
                                            {[1, 2, 3].map(tId => {
                                                const tourObj = seasonData.tours.find(t => t.id === tId);
                                                const tourEpisodes = tourObj.weeks.flatMap(w => w.days).filter(d => d.epId);
                                                const tTotal = tourEpisodes.length;
                                                const tDone = tourEpisodes.filter(d =>
                                                    data.completed?.[`s${seasonData.season}-t${tId}-d${d.epId}`]
                                                ).length;

                                                const tPct = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;
                                                const tourLabels = {
                                                    1: '(Başlangıç)',
                                                    2: '(Pekiştirme)',
                                                    3: '(Ustalık)'
                                                };
                                                const tourLabel = tourLabels[tId] || '';

                                                return (
                                                    <button
                                                        key={tId}
                                                        onClick={(e) => { e.stopPropagation(); setActiveTour(tId); }}
                                                        className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex flex-col items-center gap-1 ${activeTour === tId ? 'text-white border-indigo-500 bg-white/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                                                        <span>{tId}. TUR</span>
                                                        <span className="text-[10px] opacity-60 font-mono">{tPct}% {tourLabel}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <div className="p-6 animate-fade-in" key={activeTour}>
                                            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                                                <div className="flex items-center gap-2 text-xs font-sans font-medium text-indigo-300 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 tracking-wide">
                                                    <Info size={14} />
                                                    <span>ROTASYON: {currentTourData.pattern}</span>
                                                </div>
                                                {currentTourData.methodology && (
                                                    <div className="flex items-center gap-2 text-xs font-sans font-medium text-purple-300 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 tracking-wide">
                                                        <BookOpen size={14} />
                                                        <span>{currentTourData.methodology}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {currentTourData.weeks.map(week => (
                                                    <WeekCard
                                                        key={week.week}
                                                        week={week}
                                                        seasonNumber={seasonData.season}
                                                        activeTour={activeTour}
                                                        data={data}
                                                        openEpisode={openEpisode}
                                                        toggleDay={toggleDay}
                                                        traktWatched={traktWatched}
                                                        getMetadata={getEpisodeMetadata}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

SeriesDetail.propTypes = {
    seriesList: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSeriesSettingsUpdate: PropTypes.func
};

export default SeriesDetail;
