import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Info, CheckCircle2, Menu } from 'lucide-react';
import EpisodeModal from './EpisodeModal';
import Sidebar from './Sidebar';

const SeriesDetail = ({ series, data, onBack, onUpdate }) => {
    // Independent state for each season's expanded status and active tour
    const [expandedSeason, setExpandedSeason] = useState(series.schedule[0]?.season || 1);

    // We want to track active tour PER SEASON, but to keep it simpe we can just default to Tour 1.
    // Or we can verify the bug. The bug "Tour 2 not opening" might be because we used a single `activeTour` state
    // for ALL seasons. If I switch to Tour 2 in Season 1, then open Season 2, it might be confused or just show Tour 2.
    // The user said "Clicking Tour 2 not opening". This suggests the button wasn't updating the state.
    // I will use a simple state: activeTour. But wait, if I have Season 1 open with Tour 2, does it affect Season 2?
    // Let's keep it simple: One active tour selection per view is fine, as usually only one season is expanded.
    // But to be safe, let's reset it or use a better key.

    const [activeTour, setActiveTour] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const totalSlots = series.schedule.reduce((acc, s) =>
        acc + s.tours.reduce((tAcc, t) =>
            tAcc + t.weeks.reduce((wAcc, w) => wAcc + w.days.filter(d => d.epId).length, 0), 0), 0);

    const completedCount = Object.keys(data.completed || {}).length;
    const percentage = totalSlots > 0 ? Math.round((completedCount / totalSlots) * 100) : 0;

    const toggleDay = (dayId) => {
        const newCompleted = { ...(data.completed || {}) };
        if (newCompleted[dayId]) delete newCompleted[dayId];
        else newCompleted[dayId] = true;
        onUpdate(series.id, { completed: newCompleted });
    };

    const updateVocab = (epId, newVocabList) => {
        const newVocabulary = { ...(data.vocabulary || {}) };
        newVocabulary[epId] = newVocabList;
        onUpdate(series.id, { vocabulary: newVocabulary });
    };

    const openEpisode = (day, contextId) => {
        const fullEp = series.episodes.find(e => e.id === day.epId);
        setSelectedEpisode({
            episode: fullEp,
            context: { id: contextId, l: day.l }
        });
    };

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
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Background */}
            <div className="fixed inset-0 z-0">
                {series.image?.original && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
                        style={{ backgroundImage: `url(${series.image.original})` }}></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            <div className="relative z-10">

                {/* Header */}
                <div className="sticky top-0 z-30 bg-[#000]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

                        {/* Title & Progress & Back */}
                        <div className="flex items-center gap-6 flex-1">
                            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
                                <ArrowLeft className="text-slate-200" size={20} />
                            </button>

                            <div className="flex-1 max-w-xl">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <h1 className="text-2xl font-display font-bold text-white tracking-tight">{series.name}</h1>
                                    <span className="text-xs font-sans font-medium text-indigo-400 tracking-wide">%{percentage} TAMAMLANDI</span>
                                </div>

                                {/* Thin Progress Bar */}
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 background-animate"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center gap-3 text-[10px] font-sans font-medium text-slate-400 mt-2 tracking-wide">
                                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{series.episodes.length} BÖLÜM</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{series.schedule.length} SEZON</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
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

                        const sTotal = seasonData.tours.reduce((acc, t) => acc + t.weeks.reduce((wa, w) => wa + w.days.filter(d => d.epId).length, 0), 0);
                        const sDone = seasonData.tours.reduce((acc, t) => acc + t.weeks.reduce((wa, w) => wa + w.days.reduce((da, d) => da + (d.epId && data.completed?.[`s${seasonData.season}-t${t.id}-d${d.epId}`] ? 1 : 0), 0), 0), 0);
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
                                            <p className="text-sm text-slate-400 font-mono mt-1">{seasonData.tours[0].weeks.reduce((acc, w) => acc + w.days.filter(d => d.epId).length, 0)} Bölüm</p>
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
                                                const tTotal = tourObj.weeks.reduce((acc, w) => acc + w.days.filter(d => d.epId).length, 0);
                                                const tDone = tourObj.weeks.reduce((acc, w) => acc + w.days.filter(d => d.epId && data.completed?.[`s${seasonData.season}-t${tId}-d${d.epId}`]).length, 0);
                                                const tPct = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;

                                                return (
                                                    <button
                                                        key={tId}
                                                        onClick={(e) => { e.stopPropagation(); setActiveTour(tId); }}
                                                        className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex flex-col items-center gap-1 ${activeTour === tId ? 'text-white border-indigo-500 bg-white/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                                                        <span>{tId}. TUR</span>
                                                        <span className="text-[10px] opacity-60 font-mono">{tPct}% {tId === 1 ? '(Başlangıç)' : tId === 2 ? '(Pekiştirme)' : '(Ustalık)'}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <div className="p-6 animate-fade-in" key={activeTour}>
                                            <div className="mb-6 flex items-center gap-2 text-xs font-sans font-medium text-indigo-300 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 inline-block tracking-wide">
                                                <Info size={14} />
                                                ROTASYON: {currentTourData.pattern}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {currentTourData.weeks.map(week => (
                                                    <div key={week.week} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 px-1">HAFTA {week.week}</h4>
                                                        <div className="space-y-2">
                                                            {week.days.map((day, dIdx) => {
                                                                if (!day.epId) return null;
                                                                const id = `s${seasonData.season}-t${activeTour}-d${day.epId}`;
                                                                const isChecked = data.completed?.[id];
                                                                const hasVocab = data.vocabulary?.[day.epId]?.length > 0;

                                                                return (
                                                                    <div key={dIdx}
                                                                        onClick={() => openEpisode(day, id)}
                                                                        className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-300 border border-transparent ${isChecked ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'hover:bg-white/10 hover:border-white/20 bg-black/20'}`}>

                                                                        <div onClick={(e) => { e.stopPropagation(); toggleDay(id); }}
                                                                            className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all cursor-pointer hover:border-emerald-400 ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                                                            {isChecked && <Check size={10} className="text-white" />}
                                                                        </div>

                                                                        <div className="flex-1 min-w-0">
                                                                            <div className={`text-xs font-medium truncate ${isChecked ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                                                                                {day.number}. {day.epName}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                                {day.l ? (
                                                                                    <span className={`text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wider ${day.l === 'EN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                                        }`}>
                                                                                        {day.l}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                                                        ALTYAZISIZ
                                                                                    </span>
                                                                                )}
                                                                                {hasVocab && (
                                                                                    <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-px rounded border border-purple-500/20">
                                                                                        Kelime
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
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

export default SeriesDetail;
