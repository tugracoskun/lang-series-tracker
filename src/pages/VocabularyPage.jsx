import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAppStore } from '../store/useAppStore';

const VocabularyPage = () => {
    const navigate = useNavigate();
    const { series, userData } = useAppStore();

    // Aggregate words from all series and seasons
    const allWords = useMemo(() => {
        let words = [];
        Object.keys(userData).forEach(seriesId => {
            const vocabData = userData[seriesId]?.vocabulary || {};
            // loose comparison for id (string vs number)
            const seriesObj = series.find(s => s.id == seriesId);

            Object.keys(vocabData).forEach(epId => {
                const epWords = vocabData[epId];
                if (!Array.isArray(epWords)) return;

                // Try to find episode info if possible
                const episode = seriesObj?.episodes?.find(e => e.id == epId);

                epWords.forEach(w => {
                    words.push({
                        ...w,
                        seriesId: seriesId,
                        seriesName: seriesObj?.name || "Bilinmeyen Dizi",
                        episodeCode: episode ? `S${episode.season}E${episode.number}` : "??",
                        episodeName: episode?.name
                    });
                });
            });
        });
        // Sort by date desc
        return words.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [series, userData]);

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Geri Dön"
                >
                    <ArrowLeft className="text-slate-200" size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white">Kelimelerim</h1>
                    <p className="text-slate-400 mt-1">Toplam {allWords.length} kelime koleksiyonda</p>
                </div>
            </div>

            {/* Content using 'Tureng Style' Table Mockup */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 bg-white/5 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <div className="col-span-4 md:col-span-3">Kelime (İngilizce)</div>
                    <div className="col-span-4 md:col-span-4">Anlamı (Türkçe)</div>
                    <div className="col-span-4 md:col-span-3 text-right md:text-left">Kategori/Kaynak</div>
                    <div className="hidden md:block col-span-2 text-right">İşlem</div>
                </div>

                <div className="divide-y divide-white/5">
                    {allWords.map((word, idx) => (
                        <div key={`${word.word}-${word.seriesId}-${idx}`} className="grid grid-cols-12 p-4 items-center hover:bg-white/5 transition-colors group">

                            {/* Word & Sound Icon */}
                            <div className="col-span-4 md:col-span-3 font-bold text-indigo-300 flex items-center gap-2">
                                {word.word}
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400" aria-label={`Play sound for ${word.word}`}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                </button>
                            </div>

                            {/* Meaning */}
                            <div className="col-span-4 md:col-span-4 text-slate-200 font-medium">
                                {word.meaning}
                            </div>

                            {/* Source/Category */}
                            <div className="col-span-4 md:col-span-3 text-right md:text-left text-xs text-slate-500 font-mono">
                                <div className="truncate">{word.seriesName}</div>
                                <div className="opacity-60">{word.episodeCode}</div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-12 md:col-span-2 flex justify-end mt-2 md:mt-0">
                                <a
                                    href={`https://tureng.com/tr/turkce-ingilizce/${encodeURIComponent(word.word)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-rose-900/40 text-rose-200 text-xs font-bold rounded hover:bg-rose-900/60 transition-colors flex items-center gap-2 border border-rose-500/20"
                                >
                                    <span className="hidden md:inline">TURENG</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}

                    {allWords.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Henüz kelime eklenmemiş.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

VocabularyPage.propTypes = {
    onSeriesClick: PropTypes.func
};

export default VocabularyPage;
