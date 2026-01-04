import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop, Transition, TransitionChild } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, GraduationCap, ChevronRight, ChevronLeft, Sparkles, Check, RotateCcw } from 'lucide-react';
import PropTypes from 'prop-types';
import { SUPPORTED_LANGUAGES } from '../../services/SubtitleService';
import { ROTATION_STRATEGIES, setLanguageConfig } from '../../utils/schedule';

const STEPS = [
    { id: 'welcome', title: 'Hoş Geldin!', icon: Sparkles },
    { id: 'profile', title: 'Profil', icon: User },
    { id: 'languages', title: 'Diller', icon: Globe },
    { id: 'level', title: 'Seviye', icon: GraduationCap },
    { id: 'strategy', title: 'Strateji', icon: RotateCcw },
];

const CEFR_LEVELS = [
    { id: 'A1', name: 'A1 - Başlangıç', description: 'Temel kelimeler ve basit cümleler', color: 'emerald' },
    { id: 'A2', name: 'A2 - Temel', description: 'Günlük konuşmaları anlama', color: 'green' },
    { id: 'B1', name: 'B1 - Orta Alt', description: 'Genel konuları takip etme', color: 'blue' },
    { id: 'B2', name: 'B2 - Orta Üst', description: 'Karmaşık tartışmaları anlama', color: 'indigo' },
    { id: 'C1', name: 'C1 - İleri', description: 'Akıcı ve doğal iletişim', color: 'purple' },
    { id: 'C2', name: 'C2 - Ustalık', description: 'Anadil seviyesine yakın', color: 'rose' },
];

const OnboardingModal = ({ isOpen, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        userName: '',
        nativeLanguage: 'tr',
        targetLanguage: 'en',
        cefrLevel: 'B1',
        rotationStrategy: 'CLASSIC',
    });

    const currentStepData = STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        // Ayarları kaydet
        localStorage.setItem('langTracker_userName', formData.userName);
        localStorage.setItem('langTracker_cefrLevel', formData.cefrLevel);
        localStorage.setItem('langTracker_rotationStrategy', formData.rotationStrategy);
        localStorage.setItem('langTracker_onboardingCompleted', 'true');

        // Dil ayarlarını kaydet
        setLanguageConfig({
            nativeLanguage: formData.nativeLanguage,
            targetLanguage: formData.targetLanguage
        });

        onComplete(formData);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderStepContent = () => {
        switch (currentStepData.id) {
            case 'welcome':
                return (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                        >
                            <Sparkles size={48} className="text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-display font-bold text-white mb-4">
                            LangTracker'a Hoş Geldin!
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                            Dizi izleyerek dil öğrenmenin en etkili yolu.
                            Bilimsel temelli altyazı rotasyonu ile İngilizce'ni geliştir.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Check size={16} className="text-emerald-400" />
                            <span>Kişiselleştirilmiş öğrenme planı</span>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Check size={16} className="text-emerald-400" />
                            <span>30+ dil desteği</span>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500">
                            <Check size={16} className="text-emerald-400" />
                            <span>Kelime defteri ve flashcards</span>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="py-6">
                        <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                            Seni Tanıyalım
                        </h2>
                        <p className="text-slate-400 text-center mb-8">
                            Adın nedir?
                        </p>
                        <div className="max-w-sm mx-auto">
                            <input
                                type="text"
                                value={formData.userName}
                                onChange={(e) => updateField('userName', e.target.value)}
                                placeholder="Adını gir..."
                                className="w-full glass-input rounded-xl px-4 py-4 text-lg text-white text-center focus:outline-none placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>
                    </div>
                );

            case 'languages':
                return (
                    <div className="py-6">
                        <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                            Dil Ayarları
                        </h2>
                        <p className="text-slate-400 text-center mb-8">
                            Hangi dili öğrenmek istiyorsun?
                        </p>
                        <div className="max-w-md mx-auto space-y-6">
                            {/* Ana Dil */}
                            <div>
                                <label htmlFor="native-language-select" className="block text-sm font-medium text-slate-400 mb-2">
                                    Ana Dilin (L1)
                                </label>
                                <select
                                    id="native-language-select"
                                    value={formData.nativeLanguage}
                                    onChange={(e) => updateField('nativeLanguage', e.target.value)}
                                    className="w-full glass-input rounded-xl px-4 py-3 text-white focus:outline-none"
                                >
                                    {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name} ({lang.nativeName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hedef Dil */}
                            <div>
                                <label htmlFor="target-language-select" className="block text-sm font-medium text-slate-400 mb-2">
                                    Öğrenmek İstediğin Dil (L2)
                                </label>
                                <select
                                    id="target-language-select"
                                    value={formData.targetLanguage}
                                    onChange={(e) => updateField('targetLanguage', e.target.value)}
                                    className="w-full glass-input rounded-xl px-4 py-3 text-white focus:outline-none"
                                >
                                    {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.name} ({lang.nativeName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Önizleme */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                                <span className="text-slate-400">Öğrenme yönün: </span>
                                <span className="text-white font-bold">
                                    {SUPPORTED_LANGUAGES[formData.nativeLanguage]?.flag} {SUPPORTED_LANGUAGES[formData.nativeLanguage]?.name}
                                </span>
                                <span className="text-indigo-400 mx-2">→</span>
                                <span className="text-white font-bold">
                                    {SUPPORTED_LANGUAGES[formData.targetLanguage]?.flag} {SUPPORTED_LANGUAGES[formData.targetLanguage]?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'level':
                return (
                    <div className="py-6">
                        <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                            Seviyeni Seç
                        </h2>
                        <p className="text-slate-400 text-center mb-6">
                            Şu anki {SUPPORTED_LANGUAGES[formData.targetLanguage]?.name} seviyen nedir?
                        </p>
                        <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
                            {CEFR_LEVELS.map(level => {
                                const isSelected = formData.cefrLevel === level.id;
                                return (
                                    <button
                                        key={level.id}
                                        onClick={() => updateField('cefrLevel', level.id)}
                                        className={`p-4 rounded-xl text-left transition-all ${isSelected
                                            ? 'bg-indigo-500/20 border-2 border-indigo-500'
                                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`text-lg font-bold ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                                            {level.id}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {level.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'strategy':
                return (
                    <div className="py-6">
                        <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">
                            Öğrenme Stratejisi
                        </h2>
                        <p className="text-slate-400 text-center mb-6">
                            Altyazı rotasyon stratejini seç
                        </p>
                        <div className="max-w-lg mx-auto space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {Object.values(ROTATION_STRATEGIES).map(strategy => {
                                const isSelected = formData.rotationStrategy === strategy.id;
                                return (
                                    <button
                                        key={strategy.id}
                                        onClick={() => updateField('rotationStrategy', strategy.id)}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${isSelected
                                            ? 'bg-indigo-500/20 border-2 border-indigo-500'
                                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                                                    {strategy.name}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {strategy.description}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                                                {strategy.recommended}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Transition show={isOpen}>
            <Dialog as="div" className="relative z-[100]" onClose={() => { /* Do not close on outside click */ }}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-[#05070a]/60 backdrop-blur-2xl" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        {/* Animated Background - placed behind the panel */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="relative w-full max-w-2xl mx-4 transform transition-all">
                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        {STEPS.map((step, idx) => {
                                            const StepIcon = step.icon;
                                            const isActive = idx === currentStep;
                                            const isCompleted = idx < currentStep;

                                            let stepClasses = 'bg-white/10 text-slate-500';
                                            if (isActive) stepClasses = 'bg-indigo-500 text-white scale-110';
                                            else if (isCompleted) stepClasses = 'bg-emerald-500 text-white';

                                            return (
                                                <div
                                                    key={step.id}
                                                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${stepClasses}`}
                                                >
                                                    {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Main Card */}
                                <div className="glass-panel rounded-3xl p-8 overflow-hidden text-left">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {renderStepContent()}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                                        <button
                                            onClick={handleBack}
                                            disabled={isFirstStep}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isFirstStep
                                                ? 'opacity-0 pointer-events-none'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <ChevronLeft size={18} />
                                            Geri
                                        </button>

                                        <button
                                            onClick={handleNext}
                                            disabled={currentStepData.id === 'profile' && !formData.userName.trim()}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLastStep ? (
                                                <>
                                                    Başla
                                                    <Sparkles size={18} />
                                                </>
                                            ) : (
                                                <>
                                                    Devam Et
                                                    <ChevronRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Skip Option */}
                                {!isLastStep && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={handleComplete}
                                            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            Atla ve varsayılan ayarlarla başla
                                        </button>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

OnboardingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onComplete: PropTypes.func.isRequired
};

export default OnboardingModal;
