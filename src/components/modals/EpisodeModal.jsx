import React, { useState, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, CheckCircle2, Circle, Plus, Trash, Lock, Search, Loader2, Subtitles, Download, ExternalLink, Globe, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';
import { DictionaryService } from '../../services/DictionaryService';
import { SubtitleService, SUPPORTED_LANGUAGES } from '../../services/SubtitleService';
import { getSubtitleDisplay } from '../../utils/schedule';
import { toast } from 'sonner';
import { TraktService } from '../../services/TraktService';


const EpisodeModal = ({ isOpen, onClose, episode, context, data, onToggle, onUpdateVocab, seriesId, seriesName, isTraktWatched }) => {
    const slugify = (text) => text?.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || '';

    const [word, setWord] = useState("");
    const [meaning, setMeaning] = useState("");
    const [isLoadingMeaning, setIsLoadingMeaning] = useState(false);

    // Altyazı state'leri
    const [subtitles, setSubtitles] = useState([]);
    const [isLoadingSubtitles, setIsLoadingSubtitles] = useState(false);
    const [subtitleLanguage, setSubtitleLanguage] = useState('en');
    const [showSubtitleSection, setShowSubtitleSection] = useState(false);

    // Trakt state
    const [isTraktSyncing, setIsTraktSyncing] = useState(false);
    const traktConnected = TraktService.isConnected();

    const handleTraktSync = async () => {
        if (!traktConnected) {
            toast.error('Trakt.tv bağlı değil. Ayarlardan bağlayın.');
            return;
        }

        setIsTraktSyncing(true);
        try {
            const result = await TraktService.scrobbleEpisode({
                showTitle: seriesName,
                season: episode.season,
                number: episode.number,
                // We can fetch external IDs from props if available, 
                // but for now relying on showTitle/season/number is standard fallback
            });

            if (result.success) {
                toast.success('Trakt.tv\'ye başarıyla eklendi!');
            } else {
                if (result.notFound) {
                    toast.error('Bölüm Trakt.tv\'de bulunamadı.');
                } else {
                    toast.error('Senkronizasyon başarısız oldu.');
                }
            }
        } catch (error) {
            console.error('Manual Trakt sync error:', error);
            toast.error('Hata: ' + error.message);
        } finally {
            setIsTraktSyncing(false);
        }
    };

    const handleDownload = (sub) => {
        if (!sub.fileId) {
            window.open(`https://www.opensubtitles.org/en/search/sublanguageid-${sub.language}/searchonlymovies-on/moviename-${encodeURIComponent(seriesName || '')}`, '_blank');
            return;
        }

        SubtitleService.downloadSubtitle(sub.fileId)
            .then(result => {
                if (result?.downloadLink) {
                    window.open(result.downloadLink, '_blank');
                }
            })
            .catch(err => {
                toast.error('İndirme hatası: ' + err.message);
            });
    };

    // Dialog closes when isOpen becomes false, but we need to handle internal logic if episode is null
    if (!episode) return null;

    const vocabList = data.vocabulary?.[episode.id] || [];
    const isWatched = data.completed?.[context.id];

    // Altyazıları ara
    const searchSubtitles = async (lang = subtitleLanguage) => {
        setIsLoadingSubtitles(true);
        try {
            const results = await SubtitleService.searchSubtitles({
                query: seriesName || 'Unknown',
                season: episode.season,
                episode: episode.number,
                language: lang
            });
            setSubtitles(results);
        } catch (error) {
            console.error('Subtitle search error:', error);
            setSubtitles([]);
        }
        setIsLoadingSubtitles(false);
    };

    // Dil değiştiğinde yeniden ara
    const handleLanguageChange = (lang) => {
        setSubtitleLanguage(lang);
        searchSubtitles(lang);
    };

    const handleLookup = async () => {
        if (!word.trim()) return;
        setIsLoadingMeaning(true);
        const def = await DictionaryService.lookup(word);
        if (def) setMeaning(def);
        setIsLoadingMeaning(false);
    };

    const handleAddVocab = async () => {
        if (!word.trim() || !meaning.trim()) return;

        const newVocabItem = { id: Date.now(), word, meaning, date: new Date().toISOString() };
        const newVocab = [...vocabList, newVocabItem];
        onUpdateVocab(episode.id, newVocab);
        setWord("");
        setMeaning("");
    };

    const removeVocab = (vocabId) => {
        const newVocab = vocabList.filter(v => v.id !== vocabId);
        onUpdateVocab(episode.id, newVocab);
    };

    const cleanSummary = episode.summary?.replaceAll(/<[^>]*>?/gm, '') || "Özet bulunamadı.";

    const subtitleInfo = getSubtitleDisplay(context.l);
    const getSubtitleColorClass = () => {
        switch (subtitleInfo.color) {
            case 'blue': return 'text-blue-400';
            case 'amber': return 'text-amber-400';
            case 'indigo': return 'text-indigo-400';
            default: return 'text-slate-200';
        }
    };

    const renderSubtitleContent = () => {
        if (isLoadingSubtitles) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                    <span className="ml-3 text-slate-400">Altyazılar aranıyor...</span>
                </div>
            );
        }

        if (subtitles.length > 0) {
            return (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {subtitles.map((sub, idx) => (
                        <div
                            key={sub.id || idx}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-200 truncate">
                                    {sub.releaseInfo || sub.fileName}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                    <span>⬇ {sub.downloadCount?.toLocaleString() || '?'}</span>
                                    {sub.rating && <span>★ {sub.rating}</span>}
                                    <span className="uppercase">{sub.language}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {sub.isMock ? (
                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                                        Demo
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleDownload(sub)}
                                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                                    >
                                        <Download size={14} className="text-indigo-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
                <Subtitles size={24} className="mx-auto mb-2 opacity-50" />
                <p>Bu bölüm için altyazı bulunamadı.</p>
                <a
                    href={`https://www.opensubtitles.org/en/search/sublanguageid-${subtitleLanguage}/searchonlymovies-on/moviename-${encodeURIComponent(seriesName || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    OpenSubtitles'da Ara <ExternalLink size={12} />
                </a>
            </div>
        );
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 md:p-8 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className={`glass-panel w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] relative flex flex-col overflow-hidden text-left align-middle shadow-2xl transition-all ${isWatched ? 'watched' : ''}`}>
                                {/* Header Image Area */}
                                <div className="relative h-48 md:h-64 flex-shrink-0">
                                    {episode.image?.original ? (
                                        <img src={episode.image.original} className="w-full h-full object-cover" alt={episode.name} />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-slate-500">Görsel Yok</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] to-transparent"></div>

                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm outline-none focus:ring-2 focus:ring-white/50"
                                    >
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
                                        <DialogTitle as="h2" className="text-2xl md:text-3xl font-display font-bold text-white leading-tight shadow-black drop-shadow-lg">
                                            {episode.name}
                                        </DialogTitle>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-transparent">

                                    {/* Action & Summary */}
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <p className="text-slate-300 leading-relaxed text-sm">{cleanSummary}</p>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col gap-3 min-w-[140px]">
                                            <button
                                                onClick={() => onToggle(context.id)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${isWatched ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'}`}>
                                                {isWatched ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                {isWatched ? "İZLENDİ" : "İZLEDİM OLARAK İŞARETLE"}
                                            </button>

                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                                <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">İzleme Modu</div>
                                                <div className={`text-sm font-bold ${getSubtitleColorClass()}`}>
                                                    {subtitleInfo.fullLabel}
                                                </div>
                                                <div className="text-[9px] text-slate-500 mt-1">
                                                    {subtitleInfo.description}
                                                </div>
                                            </div>

                                            {/* Trakt Manual Sync */}
                                            {traktConnected && (
                                                <div className="p-3 bg-[#ED1C24]/10 rounded-xl border border-[#ED1C24]/20 text-center">
                                                    <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-wider">Trakt.tv</div>

                                                    {isTraktWatched ? (
                                                        <div className="space-y-2">
                                                            <div className="w-full py-1.5 px-3 bg-[#ED1C24]/20 text-[#ED1C24] text-xs font-bold rounded flex items-center justify-center gap-2 border border-[#ED1C24]/30">
                                                                <CheckCircle2 size={12} />
                                                                EKLENDİ
                                                            </div>
                                                            <a
                                                                href={`https://trakt.tv/shows/${slugify(seriesName)}/seasons/${episode.season}/episodes/${episode.number}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium rounded transition-colors border border-white/5"
                                                            >
                                                                TRAKT'TA GÖRÜNTÜLE <ExternalLink size={10} />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={handleTraktSync}
                                                            disabled={isTraktSyncing}
                                                            className="w-full py-1.5 px-3 bg-[#ED1C24] hover:bg-[#d41920] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            {isTraktSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                                            {isTraktSyncing ? 'EKLENİYOR...' : 'SENKRONİZE ET'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vocabulary Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h3 className="text-lg font-bold text-white font-display">Kelime Defteri</h3>
                                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">{vocabList.length}</span>
                                        </div>

                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-4">
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            className="w-full bg-transparent border-b border-slate-700 py-2 pl-2 pr-8 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-colors"
                                                            placeholder="Kelime (örn. Distinct)"
                                                            value={word}
                                                            onChange={e => setWord(e.target.value)}
                                                            onBlur={handleLookup}
                                                            onKeyDown={e => e.key === 'Enter' && handleLookup()}
                                                        />
                                                        <div className="absolute right-2 top-2 text-slate-500">
                                                            {isLoadingMeaning ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <Search size={16} />}
                                                        </div>
                                                    </div>
                                                    <input
                                                        className="w-full bg-transparent border-b border-slate-700 py-2 px-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-colors"
                                                        placeholder="Anlamı (Otomatik gelir)"
                                                        value={meaning}
                                                        onChange={e => setMeaning(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddVocab()}
                                                    />
                                                </div>
                                                <button onClick={handleAddVocab} className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg transition-colors h-full flex items-center justify-center">
                                                    <Plus size={20} />
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

                                    {/* Subtitle Section */}
                                    <div>
                                        <button
                                            onClick={() => {
                                                setShowSubtitleSection(!showSubtitleSection);
                                                if (!showSubtitleSection && subtitles.length === 0) {
                                                    searchSubtitles();
                                                }
                                            }}
                                            className="flex items-center justify-between w-full mb-4 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-white font-display">Altyazılar</h3>
                                                <Subtitles size={18} className="text-indigo-400" />
                                            </div>
                                            <span className={`text-xs text-slate-400 transition-transform ${showSubtitleSection ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>

                                        {showSubtitleSection && (
                                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-4">
                                                {/* Dil Seçici */}
                                                <div className="flex items-center gap-3">
                                                    <Globe size={16} className="text-slate-400" />
                                                    <select
                                                        value={subtitleLanguage}
                                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"
                                                    >
                                                        {Object.values(SUPPORTED_LANGUAGES).slice(0, 15).map(lang => (
                                                            <option key={lang.code} value={lang.code}>
                                                                {lang.flag} {lang.name} ({lang.nativeName})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => searchSubtitles()}
                                                        disabled={isLoadingSubtitles}
                                                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                                                    >
                                                        {isLoadingSubtitles ? (
                                                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                                                        ) : (
                                                            <RefreshCw size={16} className="text-indigo-400" />
                                                        )}
                                                    </button>
                                                </div>

                                                {renderSubtitleContent()}

                                                {/* API Key Uyarısı */}
                                                {!SubtitleService.hasApiKey() && (
                                                    <div className="text-[10px] text-amber-400/80 bg-amber-500/10 px-3 py-2 rounded-lg">
                                                        💡 Demo modudasın. Gerçek altyazılara erişmek için{' '}
                                                        <a href="https://www.opensubtitles.com/" target="_blank" rel="noopener noreferrer" className="underline">
                                                            OpenSubtitles API Key
                                                        </a>{' '}alabilirsin.
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

EpisodeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    episode: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        season: PropTypes.number,
        number: PropTypes.number,
        name: PropTypes.string,
        summary: PropTypes.string,
        airdate: PropTypes.string,
        runtime: PropTypes.number,
        image: PropTypes.shape({
            original: PropTypes.string,
            medium: PropTypes.string
        })
    }),
    context: PropTypes.shape({
        id: PropTypes.string.isRequired,
        l: PropTypes.string
    }).isRequired,
    data: PropTypes.shape({
        vocabulary: PropTypes.object,
        completed: PropTypes.object
    }).isRequired,
    onToggle: PropTypes.func.isRequired,
    onUpdateVocab: PropTypes.func.isRequired,
    seriesId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    seriesName: PropTypes.string,
    isTraktWatched: PropTypes.bool
};

export default EpisodeModal;
