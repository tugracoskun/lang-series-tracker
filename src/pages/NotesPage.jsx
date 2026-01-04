import React, { useState, useMemo } from 'react';
import { Search, Plus, FileText, Clock, Book, ChevronRight, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAppStore } from '../store/useAppStore';

const NotesPage = ({ onAdd, onUpdate, onDelete }) => {
    const { series, notes: allNotes } = useAppStore();
    const notes = allNotes || [];
    const [selectedNotebook, setSelectedNotebook] = useState(null); // 'general' or seriesId
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('ALL');
    const [editingNote, setEditingNote] = useState(null); // null = list view, object = editor view
    const [isCreating, setIsCreating] = useState(false);

    // Filter notes based on selection
    const filteredNotes = useMemo(() => {
        let nList = notes;

        // Notebook filter
        if (selectedNotebook) {
            if (selectedNotebook === 'general') {
                nList = nList.filter(n => !n.seriesId);
            } else {
                nList = nList.filter(n => n.seriesId === selectedNotebook);
            }
        }

        // Search filter
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            nList = nList.filter(n =>
                n.title.toLowerCase().includes(lowerQ) ||
                n.content.toLowerCase().includes(lowerQ)
            );
        }

        // Tag filter
        if (selectedTag !== 'ALL') {
            nList = nList.filter(n => n.tag === selectedTag);
        }

        return nList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [notes, selectedNotebook, searchQuery, selectedTag]);

    let activeNotebookName = 'Tüm Notlar';
    if (selectedNotebook === 'general') {
        activeNotebookName = 'Genel Notlar';
    } else if (selectedNotebook) {
        activeNotebookName = series.find(s => s.id === selectedNotebook)?.name || 'Bilinmeyen Dizi';
    }

    const handleCreateNew = () => {
        setEditingNote({
            title: '',
            content: '',
            tag: 'General',
            seriesId: selectedNotebook === 'general' ? null : selectedNotebook
        });
        setIsCreating(true);
    };

    const handleSave = (note) => {
        if (isCreating) {
            onAdd(note);
        } else {
            onUpdate(note.id, note);
        }
        setEditingNote(null);
        setIsCreating(false);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sidebar / Notebook Shelf */}
            <div className="w-64 flex flex-col gap-4">
                <div className="glass-panel p-4 rounded-2xl flex-1 flex flex-col overflow-hidden">
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">Defterler</h2>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                        {/* All Notes */}
                        <NotebookItem
                            active={selectedNotebook === null}
                            onClick={() => setSelectedNotebook(null)}
                            label="Tüm Notlar"
                            count={notes.length}
                            icon={<FileText size={16} />}
                        />
                        {/* General Notes */}
                        <NotebookItem
                            active={selectedNotebook === 'general'}
                            onClick={() => setSelectedNotebook('general')}
                            label="Genel Notlar"
                            count={notes.filter(n => !n.seriesId).length}
                            icon={<Book size={16} />}
                        />
                        {/* Series Notebooks */}
                        {series.map(s => (
                            <NotebookItem
                                key={s.id}
                                active={selectedNotebook === s.id}
                                onClick={() => setSelectedNotebook(s.id)}
                                label={s.name}
                                count={notes.filter(n => n.seriesId === s.id).length}
                                image={s.image?.medium}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {editingNote ? (
                        <NoteEditor
                            key="editor"
                            initialNote={editingNote}
                            seriesList={series}
                            onSave={handleSave}
                            onCancel={() => { setEditingNote(null); setIsCreating(false); }}
                        />
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Header & Filters */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-white mb-1">{activeNotebookName}</h2>
                                    <p className="text-slate-400 text-sm">{filteredNotes.length} not bulundu</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="glass-input rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateNew}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-indigo-500/20"
                                    >
                                        <Plus size={18} />
                                        Yeni Not
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                {['ALL', 'Vocabulary', 'Grammar', 'Plot', 'Question', 'General'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTag === tag
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                            : 'bg-white/5 border-transparent text-slate-400 hover:border-white/10'
                                            }`}
                                    >
                                        {tag === 'ALL' ? 'Tümü' : tag}
                                    </button>
                                ))}
                            </div>

                            {/* Notes Grid */}
                            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start pr-2 custom-scrollbar">
                                {filteredNotes.map(note => (
                                    <button
                                        key={note.id}
                                        onClick={() => setEditingNote(note)}
                                        className="glass-panel border-white/5 rounded-[1.5rem] p-5 cursor-pointer hover:border-indigo-500/30 transition-all group text-left"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTagColor(note.tag)}`}>
                                                {note.tag}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                                                className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="text-white font-bold mb-2 line-clamp-1">{note.title}</h3>
                                        <p className="text-slate-400 text-sm line-clamp-3 mb-4 font-light leading-relaxed">
                                            {note.content}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-auto">
                                            <Clock size={12} />
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))}
                                {filteredNotes.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-500 italic">
                                        Henüz not bulunmuyor.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Sub-components
const NotebookItem = ({ active, onClick, label, count, icon, image }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${active ? 'bg-white/10' : 'bg-white/5 border border-white/5'}`}>
            {image ? <img src={image} className="w-full h-full object-cover" alt={label} /> : icon}
        </div>
        <span className="flex-1 text-left text-sm font-medium truncate">{label}</span>
        {count > 0 && (
            <span className={`liquid-badge ${active ? 'bg-white/10 text-white border-white/20' : 'liquid-badge-indigo'}`}>
                {count}
            </span>
        )}
    </button>
);

const NoteEditor = ({ initialNote, seriesList, onSave, onCancel }) => {
    const [note, setNote] = useState({ ...initialNote });

    const handleKey = (key, value) => setNote(prev => ({ ...prev, [key]: value }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col h-full"
        >
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <button onClick={onCancel} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ChevronRight className="rotate-180" size={20} />
                    Geri
                </button>
                <button
                    onClick={() => onSave(note)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full flex items-center gap-2 font-medium transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Save size={18} />
                    Kaydet
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Not Başlığı"
                        value={note.title}
                        onChange={e => handleKey('title', e.target.value)}
                        className="w-full bg-transparent text-4xl font-display font-bold text-white placeholder:text-slate-700 outline-none mb-2"
                    />
                    <div className="flex items-center gap-4">
                        <select
                            value={note.tag}
                            onChange={e => handleKey('tag', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-indigo-300 outline-none focus:border-indigo-500"
                        >
                            <option value="General">Genel</option>
                            <option value="Vocabulary">Kelime</option>
                            <option value="Grammar">Gramer</option>
                            <option value="Plot">Dizi Özeti</option>
                            <option value="Question">Soru</option>
                        </select>
                        <select
                            value={note.seriesId || ''}
                            onChange={e => handleKey('seriesId', e.target.value || null)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 outline-none focus:border-indigo-500"
                        >
                            <option value="">Genel Not (Dizisiz)</option>
                            {seriesList.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <textarea
                value={note.content}
                onChange={e => handleKey('content', e.target.value)}
                placeholder="Notunuzu buraya yazın..."
                className="flex-1 w-full bg-slate-900/30 border border-white/5 rounded-2xl p-6 text-slate-300 text-lg leading-relaxed focus:bg-slate-900/50 outline-none resize-none custom-scrollbar"
            />
        </motion.div>
    );
};

const getTagColor = (tag) => {
    switch (tag) {
        case 'Vocabulary': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        case 'Grammar': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        case 'Plot': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
        case 'Question': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
};

NotesPage.propTypes = {
    onAdd: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

NotebookItem.propTypes = {
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    icon: PropTypes.node,
    image: PropTypes.string
};

NoteEditor.propTypes = {
    initialNote: PropTypes.object.isRequired,
    seriesList: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default NotesPage;
