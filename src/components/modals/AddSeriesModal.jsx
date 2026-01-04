import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { TVMazeService } from '../../services/TVMazeService';
import { estimateDifficulty } from '../../utils/seriesUtils';

const getDifficultyBadgeClass = (id) => {
    switch (id) {
        case 'EASY': return 'liquid-badge-emerald';
        case 'MEDIUM': return 'liquid-badge-amber';
        case 'HARD': return 'liquid-badge-rose';
        default: return 'liquid-badge-indigo';
    }
};

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

    // Reset state when closing
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[#05070a]/60 backdrop-blur-2xl" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-5xl h-[85vh] transform overflow-hidden rounded-[2.5rem] bg-[#05070a]/40 backdrop-blur-3xl border border-white/10 p-10 text-left align-middle shadow-2xl transition-all relative flex flex-col glass-panel">
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors outline-none focus:ring-2 focus:ring-slate-500 rounded-full p-1"
                                >
                                    <X size={32} />
                                </button>

                                <DialogTitle as="h2" className="text-3xl font-display font-bold text-white mb-2">
                                    Yeni Kayıt Başlat
                                </DialogTitle>

                                <input
                                    type="text"
                                    className="w-full glass-input rounded-2xl px-6 py-5 text-white text-xl focus:outline-none mb-10 placeholder:text-slate-600 shadow-2xl"
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
                                            <button key={show.id} onClick={() => onSelect(show)}
                                                className="group relative aspect-[2/3] bg-white/[0.03] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all hover:scale-[1.02] text-left shadow-xl">
                                                {show.image?.medium ? (
                                                    <img src={show.image.medium} alt={show.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-600">Poster Yok</div>
                                                )}
                                                <div className="absolute top-3 right-3 z-10">
                                                    <span className={`liquid-badge ${getDifficultyBadgeClass(difficulty.id)}`}>
                                                        {difficulty.text}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/20 to-transparent flex items-end p-5">
                                                    <div className="w-full">
                                                        <h3 className="font-bold text-white text-base leading-tight mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{show.name}</h3>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] text-slate-400 font-bold tracking-wider">{difficulty.level}</span>
                                                            <span className="text-[10px] text-indigo-500/50 font-mono">#{show.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

AddSeriesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
};

export default AddSeriesModal;
