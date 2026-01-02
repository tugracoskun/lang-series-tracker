import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Plus, Trash, Lock } from 'lucide-react';

const EpisodeModal = ({ isOpen, onClose, episode, context, data, onToggle, onUpdateVocab }) => {
    const [word, setWord] = useState("");
    const [meaning, setMeaning] = useState("");

    if (!isOpen || !episode) return null;

    const vocabList = data.vocabulary?.[episode.id] || [];
    const isWatched = data.completed?.[context.id];

    const handleAddVocab = () => {
        if (!word.trim() || !meaning.trim()) return;
        const newVocab = [...vocabList, { id: Date.now(), word, meaning, date: new Date().toISOString() }];
        onUpdateVocab(episode.id, newVocab);
        setWord("");
        setMeaning("");
    };

    const removeVocab = (vocabId) => {
        const newVocab = vocabList.filter(v => v.id !== vocabId);
        onUpdateVocab(episode.id, newVocab);
    };

    const cleanSummary = episode.summary?.replace(/<[^>]*>?/gm, '') || "Özet bulunamadı.";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl relative flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header Image Area */}
                <div className="relative h-48 md:h-64 flex-shrink-0">
                    {episode.image?.original ? (
                        <img src={episode.image.original} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">Görsel Yok</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm">
                        <X size={18} />
                    </button>

                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-500 px-2 py-0.5 rounded text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                                {episode.season}x{episode.number < 10 ? '0' + episode.number : episode.number}
                            </span>
                            {episode.airdate && <span className="text-slate-300 text-xs font-mono">{episode.airdate.substring(0, 4)}</span>}
                            {episode.runtime && <span className="text-slate-300 text-xs font-mono">{episode.runtime} dk</span>}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight shadow-black drop-shadow-lg">{episode.name}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0B0F17]">

                    {/* Action & Summary */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <p className="text-slate-300 leading-relaxed text-sm">{cleanSummary}</p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-3 min-w-[140px]">
                            <button
                                onClick={() => onToggle(context.id)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-lg ${isWatched ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                                {isWatched ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                {isWatched ? "İZLENDİ" : "İZLEDİM OLARAK İŞARETLE"}
                            </button>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">İzleme Modu</div>
                                <div className={`text-sm font-bold ${context.l === 'EN' ? 'text-blue-400' :
                                    context.l === 'TR' ? 'text-amber-400' : 'text-slate-200'
                                    }`}>
                                    {context.l ? `${context.l} ALTYAZI` : 'ALTYAZISIZ'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vocabulary Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-white font-display">Kelime Defteri</h3>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">{vocabList.length}</span>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-4">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-transparent border-b border-slate-700 py-2 px-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-colors"
                                    placeholder="Kelime"
                                    value={word}
                                    onChange={e => setWord(e.target.value)}
                                />
                                <input
                                    className="flex-1 bg-transparent border-b border-slate-700 py-2 px-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-colors"
                                    placeholder="Anlamı"
                                    value={meaning}
                                    onChange={e => setMeaning(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddVocab()}
                                />
                                <button onClick={handleAddVocab} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {vocabList.map(v => (
                                <div key={v.id} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                                    <div>
                                        <span className="font-bold text-indigo-300">{v.word}</span>
                                        <span className="mx-2 text-slate-600">•</span>
                                        <span className="text-slate-300">{v.meaning}</span>
                                    </div>
                                    <button onClick={() => removeVocab(v.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-all">
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                            {vocabList.length === 0 && (
                                <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
                                    Henüz kelime eklenmedi.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Flashcard Placeholder */}
                <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>BÖLÜM ID: {episode.id}</span>
                    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Lock size={12} />
                        <span>FLASHCARDS (YAKINDA)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpisodeModal;
