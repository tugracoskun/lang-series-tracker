import React from 'react';
import { Play, Trash2, Bookmark, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const WatchlistPage = ({ watchlist, onStartWatching, onRemove, onAddClick }) => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                        <Bookmark className="text-indigo-400" size={32} />
                        İzleme Listesi
                    </h1>
                    <p className="text-slate-400 text-lg">Daha sonra izlemeyi planladığınız içerikler.</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10"
                >
                    <Plus size={20} />
                    Listeye Ekle
                </button>
            </header>

            {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                    <Bookmark size={64} className="text-white/20 mb-6" />
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Listeniz Boş</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">Henüz izleme listenize bir dizi eklemediniz.</p>
                    <button
                        onClick={onAddClick}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        İlk Dizini Ekle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchlist.map(show => (
                        <div key={show.id} className="glass-panel group relative aspect-[2/3] rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all">
                            {show.image?.original ? (
                                <img
                                    src={show.image.original}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                                    alt={show.name}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                                    Poster Yok
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{show.name}</h3>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onStartWatching(show)}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                                    >
                                        <Play size={14} fill="currentColor" /> Başla
                                    </button>
                                    <button
                                        onClick={() => onRemove(show.id)}
                                        className="p-2 bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-lg transition-colors border border-white/5"
                                        title="Listeden Kaldır"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Hover Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-indigo-400 border border-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                PLANLANDI
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
