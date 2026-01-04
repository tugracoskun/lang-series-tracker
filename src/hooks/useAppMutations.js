import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SeriesService,
    ProgressService,
    NotesService,
    WatchlistService,
    VocabularyService,
    ActivityService,
    ProfileService
} from '../services/SupabaseService';

export const useAppMutations = (userId) => {
    const queryClient = useQueryClient();
    const queryKey = ['userData', userId];

    const invalidate = () => {
        if (userId) {
            queryClient.invalidateQueries(queryKey);
        }
    };

    // --- SERIES ---
    const addSeries = useMutation({
        mutationFn: (data) => SeriesService.addSeries(userId, data),
        onSuccess: invalidate
    });

    const updateSeries = useMutation({
        mutationFn: ({ id, updates }) => SeriesService.updateSeries(id, updates),
        onSuccess: invalidate
    });

    const deleteSeries = useMutation({
        mutationFn: (dbId) => SeriesService.deleteSeries(dbId),
        onSuccess: invalidate
    });

    // --- PROGRESS ---
    const updateProgress = useMutation({
        mutationFn: ({ seriesId, data }) => ProgressService.upsertProgress(userId, seriesId, data),
        onMutate: async ({ seriesId, data }) => {
            await queryClient.cancelQueries(queryKey);
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old) return old;
                const newUserData = { ...old.userData };
                if (!newUserData[seriesId]) newUserData[seriesId] = { completed: {}, vocabulary: {}, notes: {} };
                if (!newUserData[seriesId].completed) newUserData[seriesId].completed = {};

                if (data.completed) {
                    newUserData[seriesId].completed[data.contextId] = new Date().toISOString();
                } else {
                    delete newUserData[seriesId].completed[data.contextId];
                }

                return { ...old, userData: newUserData };
            });

            return { previousData };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
        onSettled: invalidate
    });

    // --- NOTES ---
    const addNote = useMutation({
        mutationFn: (note) => NotesService.addNote(userId, note),
        onSettled: invalidate
    });

    const updateNote = useMutation({
        mutationFn: ({ id, updates }) => NotesService.updateNote(id, updates),
        onSettled: invalidate
    });

    const deleteNote = useMutation({
        mutationFn: (id) => NotesService.deleteNote(id),
        onSettled: invalidate
    });

    // --- WATCHLIST ---
    const addToWatchlist = useMutation({
        mutationFn: (show) => WatchlistService.addToWatchlist(userId, show),
        onSettled: invalidate
    });

    const removeFromWatchlist = useMutation({
        mutationFn: (showId) => WatchlistService.removeFromWatchlist(userId, showId),
        onSettled: invalidate
    });

    // --- VOCABULARY ---
    const addVocabulary = useMutation({
        mutationFn: ({ seriesId, episodeId, word, meaning }) =>
            VocabularyService.addVocabulary(userId, seriesId, episodeId, word, meaning),
        onMutate: async ({ seriesId, episodeId, word, meaning }) => {
            await queryClient.cancelQueries(queryKey);
            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old) return old;
                const newUserData = { ...old.userData };
                if (!newUserData[seriesId]) newUserData[seriesId] = { completed: {}, vocabulary: {}, notes: {} };
                if (!newUserData[seriesId].vocabulary) newUserData[seriesId].vocabulary = {};
                if (!newUserData[seriesId].vocabulary[episodeId]) newUserData[seriesId].vocabulary[episodeId] = [];

                newUserData[seriesId].vocabulary[episodeId] = [
                    ...(newUserData[seriesId].vocabulary[episodeId] || []),
                    {
                        id: 'temp-' + Date.now(),
                        word,
                        meaning,
                        context: '',
                        date: new Date().toISOString(),
                        masteryLevel: 'NEW',
                        isOptimistic: true
                    }
                ];
                return { ...old, userData: newUserData };
            });

            return { previousData };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
        onSettled: invalidate
    });

    const deleteVocabulary = useMutation({
        mutationFn: (id) => VocabularyService.deleteVocabulary(id),
        onSettled: invalidate
    });

    // --- PROFILE ---
    const updateProfile = useMutation({
        mutationFn: (updates) => ProfileService.upsertProfile(userId, updates),
        onSettled: invalidate
    });

    // --- ACTIVITY ---
    const logActivity = useMutation({
        mutationFn: ({ type, description }) => ActivityService.logActivity(userId, type, description),
        onSettled: invalidate
    });

    return {
        addSeries,
        updateSeries,
        deleteSeries,
        updateProgress,
        addNote,
        updateNote,
        deleteNote,
        addToWatchlist,
        removeFromWatchlist,
        addVocabulary,
        deleteVocabulary,
        updateProfile,
        logActivity
    };
};
