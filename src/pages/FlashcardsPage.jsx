import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const FlashcardsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="pb-20">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ArrowLeft className="text-slate-200" size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white">Flashcards</h1>
                    <p className="text-slate-400 mt-1">Spaced Repetition Sistemi</p>
                </div>
            </div>

            <div className="glass-panel text-center py-32 rounded-[2.5rem] border-white/5">
                <div className="w-28 h-28 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 animate-pulse">
                    <BrainCircuit size={48} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Hazırlanıyor...</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Kelimelerinizi hafızanıza kazıyacak akıllı kart sistemi geliştirme aşamasında.
                </p>
            </div>
        </div>
    );
};

export default FlashcardsPage;
