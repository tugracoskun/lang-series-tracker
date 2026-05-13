import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const FlashcardsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ArrowLeft className="text-slate-200" size={18} />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Flashcards</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Spaced Repetition Sistemi</p>
                </div>
            </div>

            <div className="glass-panel text-center py-20 rounded-2xl border-white/5">
                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20 animate-pulse">
                    <BrainCircuit size={36} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Hazırlanıyor...</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Kelimelerinizi hafızanıza kazıyacak akıllı kart sistemi geliştirme aşamasında.
                </p>
            </div>
        </div>
    );
};

export default FlashcardsPage;
