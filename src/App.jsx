import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Database, X, Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import SeriesDetail from './components/SeriesDetail';
import Sidebar from './components/Sidebar';
import VocabularyPage from './components/VocabularyPage';
import FlashcardsPage from './components/FlashcardsPage';
import LoadingScreen from './components/LoadingScreen';
import ConfirmationModal from './components/ConfirmationModal';
import WatchlistPage from './components/WatchlistPage';
import NotesPage from './components/NotesPage';
import { TVMazeService } from './services/TVMazeService';
import { generateSeasonSchedule } from './utils/schedule';

const STORAGE_KEY = 'langTracker_v4_seasons';

// Difficulty Estimation Helper
const estimateDifficulty = (show) => {
    const genres = show.genres || [];
    if (genres.includes('Children') || genres.includes('Anime') || genres.includes('Animation')) return { level: 'Elementary', color: 'bg-emerald-500', text: 'A1-A2' };
    if (genres.includes('Family') || genres.includes('Comedy') || genres.includes('Music') || genres.includes('Reality')) return { level: 'Intermediate', color: 'bg-indigo-500', text: 'B1-B2' };
    if (genres.includes('Drama') || genres.includes('Romance') || genres.includes('Adventure')) return { level: 'Upper Int.', color: 'bg-purple-500', text: 'B2-C1' };
    if (genres.includes('Science-Fiction') || genres.includes('Legal') || genres.includes('Medical') || genres.includes('Thriller') || genres.includes('Crime') || genres.includes('Mystery')) return { level: 'Advanced', color: 'bg-rose-500', text: 'C1-C2' };
    return { level: 'Standard', color: 'bg-slate-500', text: 'Genel' };
};

// Add Series Modal
const AddSeriesModal = ({ isOpen, onClose, onSelect }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setSearching(true);
                try {
                    const shows = await TVMazeService.searchShows(query);
                    setResults(shows);
                } catch (e) { console.error(e); }
                setSearching(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="glass-panel w-full max-w-4xl h-[80vh] rounded-3xl p-8 relative flex flex-col overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                    <X size={32} />
                </button>
                <h2 className="text-3xl font-display font-bold text-white mb-2">Yeni Kayıt Başlat</h2>
                <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-8 placeholder:text-slate-600"
                    placeholder="Dizi adı girin (örn. Breaking Bad)..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 content-start pr-2 custom-scrollbar">
                    {searching && <div className="col-span-full text-center text-slate-500">Taranıyor...</div>}
                    {results.map(show => {
                        const difficulty = estimateDifficulty(show);
                        return (
                            <div key={show.id} onClick={() => onSelect(show)}
                                className="group relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-indigo-500 transition-all hover:scale-[1.02]">
                                {show.image?.medium ? (
                                    <img src={show.image.medium} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-600">Poster Yok</div>
                                )}
                                <div className="absolute top-2 right-2 z-10">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-lg text-white ${difficulty.color}`}>
                                        {difficulty.text}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                                    <div>
                                        <h3 className="font-bold text-white text-sm leading-tight mb-1">{show.name}</h3>
                                        <span className="text-[10px] text-slate-400">{difficulty.level}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

function App() {
    const [db, setDb] = useState({ series: [], userData: {}, history: [], watchlist: [], notes: [] });
    // ... existing state ...
    const [activeSeriesId, setActiveSeriesId] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loadingState, setLoadingState] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [seriesToDelete, setSeriesToDelete] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed.history) parsed.history = [];
            if (!parsed.watchlist) parsed.watchlist = [];
            if (!parsed.notes) parsed.notes = [];
            setDb(parsed);
        }
    }, []);

    useEffect(() => {
        if (db.series.length > 0 || db.notes.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }, [db]);

    // ... existing helper functions (logAction, notes CRUD) ...
    const logAction = (type, description) => {
        const newLog = {
            id: Date.now(),
            type,
            description,
            timestamp: new Date().toISOString()
        };
        setDb(prev => ({
            ...prev,
            history: [newLog, ...prev.history].slice(0, 20)
        }));
    };

    // --- NOTES CRUD ---
    const handleAddNote = (note) => {
        setDb(prev => ({
            ...prev,
            notes: [...prev.notes, { ...note, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
        }));
        logAction('ADD', `Yeni not eklendi: ${note.title}`);
    };

    const handleUpdateNote = (id, updates) => {
        setDb(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
        }));
    };

    const handleDeleteNote = (id) => {
        setDb(prev => ({
            ...prev,
            notes: prev.notes.filter(n => n.id !== id)
        }));
        logAction('DELETE', 'Bir not silindi');
    };

    // ... existing handleSeriesSelect with difficulty logging if desired ...
    const handleSeriesSelect = async (show) => {
        setShowAddModal(false);
        setLoadingState("Veri bağlantısı kuruluyor...");
        try {
            const details = await TVMazeService.getShowDetails(show.id);
            if (!details._embedded?.episodes) throw new Error("Bölümler alınamadı.");

            setLoadingState("Sezon matrisi oluşturuluyor...");
            await new Promise(r => setTimeout(r, 1000));

            const schedule = generateSeasonSchedule(details._embedded.episodes);

            const newSeries = {
                id: details.id.toString(),
                name: details.name,
                image: details.image,
                episodes: details._embedded.episodes,
                schedule: schedule,
                genres: details.genres // Ensure genres are saved
            };

            setDb(prev => ({
                ...prev,
                series: [newSeries, ...prev.series],
                userData: { ...prev.userData, [newSeries.id]: { completed: {}, notes: {} } }
            }));

            logAction('ADD', `${newSeries.name} takip listesine eklendi.`);
            setLoadingState(null);
        } catch (e) {
            alert("Hata: " + e.message);
            setLoadingState(null);
        }
    };

    const handleUpdate = (seriesId, newData) => {
        setDb(prev => ({
            ...prev,
            userData: { ...prev.userData, [seriesId]: { ...prev.userData[seriesId], ...newData } }
        }));
        const seriesName = db.series.find(s => s.id === seriesId)?.name || "Dizi";
        if (newData.completed) logAction('WATCH', `${seriesName} ilerlemesi güncellendi.`);
    };

    const handleDelete = (e, seriesId) => {
        e.stopPropagation();
        setSeriesToDelete(seriesId);
    };

    const confirmDelete = () => {
        if (seriesToDelete) {
            const seriesName = db.series.find(s => s.id === seriesToDelete)?.name || "Bir dizi";
            setDb(prev => ({
                ...prev,
                series: prev.series.filter(s => s.id !== seriesToDelete)
            }));
            logAction('DELETE', `${seriesName} silindi.`);
            setSeriesToDelete(null);
        }
    };

    // ... watchlist handlers ...
    const handleAddToWatchlist = (show) => {
        setShowAddModal(false);
        if (db.watchlist?.some(s => s.id === show.id) || db.series.some(s => s.id === show.id)) {
            alert("Bu dizi zaten listenizde veya takibinizde.");
            return;
        }
        const newWatchlistItem = { id: show.id, name: show.name, image: show.image, addedAt: new Date().toISOString() };
        setDb(prev => ({ ...prev, watchlist: [newWatchlistItem, ...prev.watchlist || []] }));
        logAction('ADD_WATCHLIST', `${show.name} izleme listesine eklendi.`);
    };

    const removeFromWatchlist = (showId) => setDb(prev => ({ ...prev, watchlist: (prev.watchlist || []).filter(s => s.id !== showId) }));

    const handleStartWatching = async (show) => {
        removeFromWatchlist(show.id);
        await handleSeriesSelect(show);
    };

    const navigateTo = (view) => {
        setActiveView(view);
        setActiveSeriesId(null);
        setSidebarOpen(false);
    };

    const onModalSelect = (show) => {
        if (activeView === 'watchlist') handleAddToWatchlist(show);
        else handleSeriesSelect(show);
    };

    return (
        <div className="min-h-screen text-slate-200 font-sans">
            <AnimatePresence>
                {loadingState && <LoadingScreen key="loader" status={loadingState} />}
                {seriesToDelete && (
                    <ConfirmationModal
                        key="confirm-modal"
                        isOpen={!!seriesToDelete}
                        title="Diziyi Sil"
                        message="Bu diziyi ve tüm ilerlemeni silmek istediğine emin misin? Bu işlem geri alınamaz."
                        onConfirm={confirmDelete}
                        onCancel={() => setSeriesToDelete(null)}
                    />
                )}
            </AnimatePresence>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={navigateTo}
                activeView={activeView}
                history={db.history}
            />

            {activeSeriesId ? (
                <SeriesDetail
                    series={db.series.find(s => s.id === activeSeriesId)}
                    data={db.userData[activeSeriesId] || {}}
                    onBack={() => setActiveSeriesId(null)}
                    onUpdate={handleUpdate}
                />
            ) : activeView === 'vocab' ? (
                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                    <VocabularyPage db={db} onBack={() => setActiveView('dashboard')} />
                </div>
            ) : activeView === 'flashcards' ? (
                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                    <FlashcardsPage onBack={() => setActiveView('dashboard')} />
                </div>
            ) : activeView === 'notes' ? (
                <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in relative z-10">
                    <NotesPage
                        db={db}
                        onAdd={handleAddNote}
                        onUpdate={handleUpdateNote}
                        onDelete={handleDeleteNote}
                        onBack={() => setActiveView('dashboard')}
                    />
                </div>
            ) : activeView === 'watchlist' ? (
                <WatchlistPage
                    watchlist={db.watchlist || []}
                    onStartWatching={handleStartWatching}
                    onRemove={removeFromWatchlist}
                    onAddClick={() => setShowAddModal(true)}
                />
            ) : (
                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                    <div className="absolute top-6 right-6 z-50">
                        <button onClick={() => setSidebarOpen(true)} className="p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                            <Menu size={32} />
                        </button>
                    </div>

                    <div className="cinematic-bg" style={{
                        backgroundImage: db.series[0]?.image?.original ? `url(${db.series[0].image.original})` : 'none',
                        opacity: 0.2
                    }}></div>

                    <header className="flex justify-between items-end mb-16">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-codon font-bold text-white tracking-widest drop-shadow-[0_0_25px_rgba(186,230,253,0.3)] animate-float">
                                LANG<span className="text-transparent bg-clip-text bg-[linear-gradient(to_right,#bae6fd,#e0f2fe,#a5f3fc,#bae6fd)] bg-[length:200%_auto] animate-shimmer-slow">TRACKER</span>
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg font-light tracking-wide">Watch, Learn, Track.</p>
                        </div>
                    </header>

                    {/* Styled FAB for Add Series */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 group flex items-center justify-center p-1 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-500 hover:scale-110 active:scale-95"
                    >
                        <div className="bg-[#0F1218] rounded-full p-4 flex items-center gap-3 transition-all group-hover:bg-transparent">
                            <Plus size={32} className="text-white group-hover:rotate-90 transition-transform duration-500" />
                            <span className="hidden group-hover:inline-block font-bold text-white whitespace-nowrap pr-2 animate-fade-in">
                                YENİ DİZİ EKLE
                            </span>
                        </div>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {db.series.map(series => {
                            const total = series.schedule.reduce((acc, s) => acc + s.tours.reduce((ta, t) => ta + t.weeks.reduce((wa, w) => wa + w.days.filter(d => d.epId).length, 0), 0), 0);
                            const completed = Object.keys(db.userData[series.id]?.completed || {}).length;
                            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                            const difficulty = estimateDifficulty(series); // Estimate for dashboard card

                            return (
                                <div key={series.id} onClick={() => setActiveSeriesId(series.id)}
                                    className="glass-panel rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all h-[400px] flex flex-col justify-end relative overflow-hidden group">
                                    {series.image?.original && (
                                        <div className="absolute inset-0">
                                            <img src={series.image.original} className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                        </div>
                                    )}
                                    <div className="relative z-10">
                                        <div className="absolute top-[-300px] right-[-10px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg text-white ${difficulty.color}`}>
                                                {difficulty.text}
                                            </span>
                                        </div>
                                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDelete(e, series.id)} className="p-2 bg-black/50 rounded-full hover:bg-rose-500 hover:text-white transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="text-3xl font-display font-bold text-white mb-2">{series.name}</h3>
                                        <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                                            <span>İlerleme</span>
                                            <span>%{pct}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {db.series.length === 0 && (
                            <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                                <Database size={64} className="mx-auto text-white/20 mb-6" />
                                <h3 className="text-2xl font-display font-bold text-white mb-2">Veri Akışı Yok</h3>
                                <p className="text-slate-400 max-w-md mx-auto">Sistem boşta. Öğrenme protokolünü başlatmak için sağ alttaki butonu kullanın.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <AddSeriesModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSelect={onModalSelect} />
        </div>
    );
}

export default App;
