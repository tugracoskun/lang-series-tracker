import React from 'react';
import { ArrowLeft, Clock, Calendar, CheckCircle, PlusCircle, Trash2, Activity, Tv } from 'lucide-react';

const ActivityHistoryPage = ({ history, onBack }) => {

    // Group history by date (YYYY-MM-DD)
    const groupedHistory = history.reduce((groups, item) => {
        const date = new Date(item.timestamp).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
        return groups;
    }, {});

    const getActionIcon = (type) => {
        switch (type) {
            case 'ADD': return <PlusCircle size={16} className="text-emerald-400" />;
            case 'DELETE': return <Trash2 size={16} className="text-rose-400" />;
            case 'WATCH': return <CheckCircle size={16} className="text-indigo-400" />;
            case 'ADD_WATCHLIST': return <Tv size={16} className="text-purple-400" />;
            default: return <Activity size={16} className="text-slate-400" />;
        }
    };

    const getActionColor = (type) => {
        switch (type) {
            case 'ADD': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
            case 'DELETE': return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
            case 'WATCH': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
            case 'ADD_WATCHLIST': return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
            default: return 'bg-slate-500/10 border-slate-500/20 text-slate-300';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in relative z-10 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-12">
                <button
                    onClick={onBack}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 ml-4">Aktivite Geçmişi</h1>
                    <p className="text-slate-400 ml-4 font-light">Tüm öğrenme ve izleme hareketleriniz</p>
                </div>
            </div>

            {/* Timeline Container - Strictly Left Aligned */}
            <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12 pl-8 md:pl-12 pb-20">
                {Object.entries(groupedHistory).map(([date, items], groupIndex) => (
                    <div key={date} className="relative animate-fade-in-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>

                        {/* Date Pill (Positioned on the left vertical line) */}
                        <div className="absolute -left-[2.75rem] md:-left-[3.75rem] top-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 bg-[#0F1218] shadow text-slate-500 z-10 transition-colors hover:border-indigo-500/50 hover:text-indigo-400">
                            <Calendar size={18} />
                        </div>

                        {/* Content Card (Strictly on the right of the line) */}
                        <div className="w-full bg-[#13161C] p-6 rounded-2xl border border-white/5 shadow-xl hover:border-indigo-500/30 transition-all duration-300 group">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                <span className="text-indigo-400 font-bold font-display text-sm uppercase tracking-wider">{date}</span>
                                <span className="bg-white/5 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{items.length} İşlem</span>
                            </div>

                            <div className="space-y-4">
                                {items.map((log, idx) => (
                                    <div key={log.id} className="flex gap-4 items-start relative">
                                        {/* Connector line inside the card */}
                                        {idx !== items.length - 1 && (
                                            <div className="absolute top-8 left-4 bottom-[-16px] w-px bg-white/5 -z-10 group-hover:bg-white/10 transition-colors"></div>
                                        )}

                                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${getActionColor(log.type)}`}>
                                            {getActionIcon(log.type)}
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                                {log.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={10} className="text-slate-600" />
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="text-center py-20">
                        <div className="absolute -left-[1.25rem] top-0 p-1 bg-[#0F1218]">
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        </div>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-600 mb-6">
                            <Activity size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz Aktivite Yok</h3>
                        <p className="text-slate-400">Yaptığınız işlemler burada zaman tüneli olarak görünür.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityHistoryPage;
