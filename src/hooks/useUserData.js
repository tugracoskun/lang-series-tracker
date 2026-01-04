import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SeriesService,
    ProgressService,
    NotesService,
    WatchlistService,
    ActivityService,
    VocabularyService,
    ProfileService
} from '../services/SupabaseService';

export const useUserData = (userId) => {
    return useQuery({
        queryKey: ['userData', userId],
        queryFn: async () => {
            if (!userId) return null;

            const [series, progress, notes, watchlist, activity, vocabulary, profile] = await Promise.all([
                SeriesService.getUserSeries(userId),
                ProgressService.getUserProgress(userId),
                NotesService.getUserNotes(userId),
                WatchlistService.getUserWatchlist(userId),
                ActivityService.getUserActivity(userId),
                VocabularyService.getUserVocabulary(userId),
                ProfileService.getProfile(userId)
            ]);

            // userData structure for local state compatibility
            const userDataMap = {};

            // Create a lookup map: internal DB id -> TVMaze ID
            const seriesIdToTvMaze = {};
            series.forEach(s => {
                seriesIdToTvMaze[s.id] = s.tvmaze_id.toString();
            });

            // Progress sync - map internal series_id to TVMaze ID
            progress.forEach(p => {
                const tvMazeId = seriesIdToTvMaze[p.series_id];
                if (!tvMazeId) return; // Skip if series not found

                if (!userDataMap[tvMazeId]) userDataMap[tvMazeId] = { completed: {}, vocabulary: {}, notes: {} };
                userDataMap[tvMazeId].completed[p.context_id] = p.completed_at;
            });

            // Vocabulary sync - also use TVMaze ID
            vocabulary.forEach(v => {
                const tvMazeId = seriesIdToTvMaze[v.series_id];
                if (!tvMazeId) return; // Skip if series not found

                const eId = v.episode_id;
                if (!userDataMap[tvMazeId]) userDataMap[tvMazeId] = { completed: {}, vocabulary: {}, notes: {} };
                if (!userDataMap[tvMazeId].vocabulary) userDataMap[tvMazeId].vocabulary = {};
                if (!userDataMap[tvMazeId].vocabulary[eId]) userDataMap[tvMazeId].vocabulary[eId] = [];

                userDataMap[tvMazeId].vocabulary[eId].push({
                    id: v.id,
                    word: v.word,
                    meaning: v.meaning,
                    context: v.context,
                    date: v.created_at,
                    masteryLevel: v.mastery_level
                });
            });

            return {
                series: series.map(s => ({
                    id: s.tvmaze_id.toString(),
                    name: s.name,
                    image: { original: s.image_url },
                    genres: s.genres,
                    schedule: s.schedule_data,
                    episodes: s.episodes_data,
                    rotationStrategy: s.rotation_strategy,
                    languageConfig: s.language_config,
                    dbId: s.id
                })),
                userData: userDataMap,
                notes: notes.map(n => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    tags: n.tags,
                    seriesId: n.series_id,
                    episodeId: n.episode_id,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                })),
                watchlist: watchlist.map(w => ({
                    id: w.tvmaze_id,
                    name: w.name,
                    image: { medium: w.image_url },
                    addedAt: w.added_at
                })),
                history: activity.map(a => ({
                    id: a.id,
                    type: a.type,
                    description: a.description,
                    timestamp: a.created_at
                })),
                profile
            };
        },
        enabled: !!userId,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
