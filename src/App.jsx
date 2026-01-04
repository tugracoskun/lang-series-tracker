import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useUserData } from './hooks/useUserData';
import { useAppMutations } from './hooks/useAppMutations';
import { useAppStore } from './store/useAppStore';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import SeriesDetail from './pages/SeriesDetail';

import VocabularyPage from './pages/VocabularyPage';
import FlashcardsPage from './pages/FlashcardsPage';
import LoadingScreen from './components/ui/LoadingScreen';
import ConfirmationModal from './components/modals/ConfirmationModal';
import WatchlistPage from './pages/WatchlistPage';
import NotesPage from './pages/NotesPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import OnboardingModal from './components/auth/OnboardingModal';
import AuthModal from './components/auth/AuthModal';
import EmailConfirmation from './components/auth/EmailConfirmation';
import SettingsPage from './pages/Settings';
import LoginRequired from './components/auth/LoginRequired';
import AddSeriesModal from './components/modals/AddSeriesModal';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import TraktCallback from './components/auth/TraktCallback';
import {
    AuthService,
    isSupabaseConfigured,
    ActivityService,
    ProfileService
} from './services/SupabaseService';

import { useSeriesManager } from './hooks/useSeriesManager';
import { useNoteManager } from './hooks/useNoteManager';
import { useWatchlistManager } from './hooks/useWatchlistManager';

const STORAGE_KEY = 'langTracker_v4_seasons';



function App() {
    // Router hooks
    const navigate = useNavigate();
    const location = useLocation();

    // Store - Destructure everything we need
    const {
        // Auth State & Actions
        user, setUser,
        setUserName,
        isAuthLoading, setAuthLoading,
        showAuthModal, setShowAuthModal,

        // Data State & Actions
        series, userData, history, watchlist, notes,
        setDb, addToHistory,

        // UI Actions
        loadingState, setLoadingState,

        // Settings State
        rotationStrategy, setRotationStrategy,
        setCefrLevel
    } = useAppStore();

    const [showAddModal, setShowAddModal] = useState(false);
    // Initial Load Check (Onboarding)
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('langTracker_onboardingCompleted');
    });

    // Auth State
    const [showEmailConfirmation, setShowEmailConfirmation] = useState(() => {
        // URL'de hash varsa email confirmation callback olabilir
        return globalThis.location.hash.includes('access_token') || globalThis.location.hash.includes('type=');
    });
    // Removed manual sidebar state
    const appMutations = useAppMutations(user?.id);

    // Supabase Auth Listener
    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setAuthLoading(false);
            return;
        }

        // Mevcut session'i kontrol et
        AuthService.getSession().then(session => {
            setUser(session?.user || null);
            if (session?.user) {
                setUserName(session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || '');
            }
            setAuthLoading(false);
        });


        // Auth değişikliklerini dinle
        const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                setUserName(session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || '');
            } else {
                setDb({ series: [], userData: {}, history: [], watchlist: [], notes: [] });
            }
            if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // React Query Data Fetching
    const { data: remoteData, isLoading: isUserDataLoading, error: userDataError } = useUserData(user?.id);

    // Sync remote data to local 'db' state
    useEffect(() => {
        if (remoteData) {
            // Profil ayarlarını ve user name'i güncelle
            const { profile } = remoteData;
            if (profile) {
                if (profile.user_name) setUserName(profile.user_name);
                if (profile.rotation_strategy) {
                    setRotationStrategy(profile.rotation_strategy);
                    localStorage.setItem('langTracker_rotationStrategy', profile.rotation_strategy);
                }
                if (profile.cefr_level) {
                    setCefrLevel(profile.cefr_level);
                }
                if (profile.language_config) {
                    localStorage.setItem('langTracker_languageConfig', JSON.stringify(profile.language_config));
                }
            }

            // DB state'ini güncelle
            const dbData = { ...remoteData };
            delete dbData.profile;
            // setDb from store automatically handles merging
            setDb(dbData);
        }
    }, [remoteData]);

    useEffect(() => {
        if (isUserDataLoading) setLoadingState("Verileriniz yükleniyor...");
        else setLoadingState(null);
    }, [isUserDataLoading]);

    useEffect(() => {
        if (userDataError) {
            console.error('Data fetch error:', userDataError);
            toast.error('Veriler yüklenirken bir hata oluştu');
        }
    }, [userDataError]);


    // Removed manual localStorage effects - Handled by Zustand persist middleware

    // ... existing helper functions (logAction, notes CRUD) ...
    const logAction = async (type, description) => {
        const newLog = {
            id: Date.now(),
            type,
            description,
            timestamp: new Date().toISOString()
        };
        addToHistory(newLog);

        if (user) {
            await ActivityService.logActivity(user.id, type, description);
        }
    };

    // --- HOOKS ---
    const {
        handleAddNote,
        handleUpdateNote,
        handleDeleteNote
    } = useNoteManager(user, { series, userData, history, watchlist, notes }, setDb, appMutations, logAction);

    const {
        handleAddToWatchlist,
        removeFromWatchlist
    } = useWatchlistManager(user, { series, userData, history, watchlist, notes }, setDb, appMutations, logAction);

    const {
        handleSeriesSelect,
        handleUpdate,
        handleSeriesSettingsUpdate,
        openDeleteConfirm: handleDelete,
        confirmDelete,
        seriesToDelete,
        setSeriesToDelete
    } = useSeriesManager(user, { series, userData, history, watchlist, notes }, setDb, appMutations, logAction, rotationStrategy);

    const handleStartWatching = async (show) => {
        // Only remove from watchlist if actually in watchlist
        const isInWatchlist = watchlist?.some(s => s.id === show.id);
        if (isInWatchlist) {
            removeFromWatchlist(show.id);
        }
        await handleSeriesSelect(show);
        navigate(`/series/${show.id}`);
    };

    const onModalSelect = (show) => {
        setShowAddModal(false);
        if (location.pathname === '/watchlist') handleAddToWatchlist(show);
        else {
            handleSeriesSelect(show);
            navigate(`/series/${show.id}`);
        }
    };



    const handleOnboardingComplete = async (formData) => {
        setShowOnboarding(false);
        setUserName(formData.userName);
        setRotationStrategy(formData.rotationStrategy);
        setCefrLevel(formData.cefrLevel);

        if (user) {
            try {
                await ProfileService.upsertProfile(user.id, {
                    user_name: formData.userName,
                    rotation_strategy: formData.rotationStrategy,
                    cefr_level: formData.cefrLevel,
                    language_config: {
                        nativeLanguage: formData.nativeLanguage,
                        targetLanguage: formData.targetLanguage
                    }
                });
            } catch (error) {
                console.error('Onboarding sync error:', error);
                toast.error('Profil oluşturulurken hata oluştu');
            }
        }

        logAction('WELCOME', `${formData.userName} LangTracker'a katıldı!`);
        toast.success('Kurulum tamamlandı!');
    };



    const handleAuthSuccess = async (authUser) => {
        setUser(authUser);
        setUserName(authUser.user_metadata?.user_name || authUser.email?.split('@')[0] || '');
        // Fetch handled by useQuery hook automatically when user changes
        logAction('LOGIN', `${authUser.email} giriş yaptı`);
        toast.success('Giriş başarılı');
    };

    return (
        <div className="min-h-screen text-slate-200 font-sans">
            {/* Onboarding Modal */}
            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            {/* Email Confirmation Callback */}
            {showEmailConfirmation && (
                <EmailConfirmation
                    onComplete={() => setShowEmailConfirmation(false)}
                />
            )}

            {/* Mandatory Login Check */}
            {!user && !isAuthLoading && !showEmailConfirmation && (
                <LoginRequired onShowAuth={() => setShowAuthModal(true)} />
            )}

            {user && (
                <>
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
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={
                                <Dashboard
                                    onSeriesClick={(id) => navigate(`/series/${id}`)}
                                    onAddClick={() => setShowAddModal(true)}
                                    // onDeleteSeries needs id param now if not passed directly. Dashboard passes (e, id) -> onDeleteSeries(e, id)
                                    onDeleteSeries={handleDelete}
                                    onStartWatching={handleStartWatching}
                                    onAddToWatchlist={handleAddToWatchlist}
                                />
                            } />

                            <Route path="/series/:seriesId" element={
                                <SeriesDetail
                                    seriesList={series}
                                    data={userData}
                                    onUpdate={handleUpdate}
                                    onSeriesSettingsUpdate={handleSeriesSettingsUpdate}
                                />
                            } />

                            <Route path="/vocab" element={
                                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                                    <VocabularyPage />
                                </div>
                            } />

                            <Route path="/flashcards" element={
                                <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in relative z-10">
                                    <FlashcardsPage />
                                </div>
                            } />

                            <Route path="/notes" element={
                                <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in relative z-10">
                                    <NotesPage
                                        onAdd={handleAddNote}
                                        onUpdate={handleUpdateNote}
                                        onDelete={handleDeleteNote}
                                    />
                                </div>
                            } />

                            <Route path="/watchlist" element={
                                <WatchlistPage
                                    onStartWatching={handleStartWatching}
                                    onRemove={removeFromWatchlist}
                                    onAddClick={() => setShowAddModal(true)}
                                />
                            } />

                            <Route path="/history" element={
                                <ActivityHistoryPage />
                            } />

                            <Route path="/settings" element={
                                <SettingsPage />
                            } />

                            <Route path="/trakt-callback" element={
                                <TraktCallback />
                            } />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>

                        <AddSeriesModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSelect={onModalSelect} />
                    </MainLayout>
                </>
            )}
        </div>
    );
}

export default App;

