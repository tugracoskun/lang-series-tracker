import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_ROTATION_STRATEGY } from '../utils/schedule';

export const useAppStore = create(
    persist(
        (set, get) => ({
            // --- AUTH STATE ---
            user: null,
            userName: '',
            isAuthLoading: true,
            setUser: (user) => set({ user, isAuthLoading: false }),
            setUserName: (userName) => set({ userName }),
            setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),
            showAuthModal: false,
            setShowAuthModal: (show) => set({ showAuthModal: show }),

            // --- DATA STATE (The "DB") ---
            series: [],
            userData: {},
            history: [],
            watchlist: [],
            notes: [],

            // Allow full DB replace (for sync)
            setDb: (newDb) => set((state) => ({
                ...state,
                ...newDb
            })),

            // Granular updates
            updateSeries: (seriesList) => set({ series: seriesList }),
            updateUserData: (data) => set({ userData: data }),
            updateHistory: (history) => set({ history }),
            addToHistory: (log) => set((state) => ({
                history: [log, ...state.history].slice(0, 20)
            })),
            updateWatchlist: (watchlist) => set({ watchlist }),
            updateNotes: (notes) => set({ notes }),

            // --- UI STATE ---
            isSidebarOpen: false,
            sidebarCollapsed: false,
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarCollapsed: (isCollapsed) => set({ sidebarCollapsed: isCollapsed }),
            toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            loadingState: null,
            setLoadingState: (state) => set({ loadingState: state }),

            // --- SETTINGS STATE ---
            rotationStrategy: DEFAULT_ROTATION_STRATEGY,
            setRotationStrategy: (strategy) => set({ rotationStrategy: strategy }),
            cefrLevel: 'B1',
            setCefrLevel: (level) => set({ cefrLevel: level }),
        }),
        {
            name: 'langTracker_v4_storage', // Shared storage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist these fields to localStorage automatically
                series: state.series,
                userData: state.userData,
                history: state.history,
                watchlist: state.watchlist,
                notes: state.notes,
                userName: state.userName,
                rotationStrategy: state.rotationStrategy,
                cefrLevel: state.cefrLevel,
                sidebarCollapsed: state.sidebarCollapsed
            }),
        }
    )
);
