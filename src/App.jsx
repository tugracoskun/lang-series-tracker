import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Database, X } from 'lucide-react';
import SeriesDetail from './components/SeriesDetail';
import { TVMazeService } from './services/TVMazeService';
import { generateSeasonSchedule } from './utils/schedule';

const STORAGE_KEY = 'langTracker_v4_seasons';

// Cinematic Loader Component
const CinematicLoader = ({ status }) => (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center font-mono">
        <div className="scan-line top-1/2"></div>
        <div className="text-2xl font-bold text-white mb-4 animate-pulse uppercase tracking-[0.2em]">
            Sistem İnşa Ediliyor
        </div>
        <div className="text-xs text-indigo-400 max-w-xs text-center leading-relaxed opacity-80">
            {status || "Nöral ağlar bağlanıyor..."}<br />
            Rotasyon matrisi hesaplanıyor...<br />
            Sezon verileri işleniyor...
        </div>
        <div className="mt-8 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-[scan_1s_ease-in-out_infinite]"></div>
        </div>
    </div>
);

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
                    {results.map(show => (
                        <div key={show.id} onClick={() => onSelect(show)}
                            className="group relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-indigo-500 transition-all hover:scale-[1.02]">
                            {show.image?.medium ? (
                                <img src={show.image.medium} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-600">Poster Yok</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                                <h3 className="font-bold text-white text-sm">{show.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function App() {
    const [db, setDb] = useState({ series: [], userData: {} });
    const [activeSeriesId, setActiveSeriesId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loadingState, setLoadingState] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setDb(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (db.series.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }, [db]);

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
                schedule: schedule
            };

            setDb(prev => ({
                ...prev,
                series: [newSeries, ...prev.series],
                userData: { ...prev.userData, [newSeries.id]: { completed: {}, notes: {} } }
            }));
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
    };

    const handleDelete = (e, seriesId) => {
        e.stopPropagation();
        if (confirm("Bu diziyi silmek istediğine emin misin?")) {
            setDb(prev => ({
                ...prev,
                series: prev.series.filter(s => s.id !== seriesId)
            }));
        }
    };

    return (
        <div className="min-h-screen text-slate-200 font-sans">
            {loadingState && <CinematicLoader status={loadingState} />}

            {activeSeriesId ? (
                <SeriesDetail
                    series={db.series.find(s => s.id === activeSeriesId)}
                    data={db.userData[activeSeriesId] || {}}
                    onBack={() => setActiveSeriesId(null)}
                    onUpdate={handleUpdate}
                />
            ) : (
                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                    <div className="cinematic-bg" style={{
                        backgroundImage: db.series[0]?.image?.original ? `url(${db.series[0].image.original})` : 'none',
                        opacity: 0.2
                    }}></div>

                    <header className="flex justify-between items-end mb-16">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tighter">
                                LANG<span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600">TRACKER</span>
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg">Sezon Bazlı Rotasyon Protokolü</p>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                            <Plus size={24} /> YENİ GÖREV
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {db.series.map(series => {
                            const total = series.schedule.reduce((acc, s) => acc + s.tours.reduce((ta, t) => ta + t.weeks.reduce((wa, w) => wa + w.days.filter(d => d.epId).length, 0), 0), 0);
                            const completed = Object.keys(db.userData[series.id]?.completed || {}).length;
                            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
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
                                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDelete(e, series.id)} className="p-2 bg-black/50 rounded-full hover:bg-rose-500 hover:text-white transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="text-3xl font-display font-bold text-white mb-2">{series.name}</h3>
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
                                <p className="text-slate-400 max-w-md mx-auto">Sistem boşta. Öğrenme protokolünü başlatmak için "Yeni Görev" butonunu kullanın.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <AddSeriesModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSelect={handleSeriesSelect} />
        </div>
    );
}

export default App;
