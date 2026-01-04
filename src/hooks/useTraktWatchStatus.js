import { useState, useEffect, useCallback } from 'react';
import { TraktService } from '../services/TraktService';

/**
 * Hook to check Trakt.tv watch status for a series
 * Returns a map of contextId -> isWatchedOnTrakt
 */
export const useTraktWatchStatus = (series, enabled = true) => {
    const [traktWatched, setTraktWatched] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled || !series || !TraktService.isConnected()) {
            return;
        }

        const fetchTraktStatus = async () => {
            setLoading(true);
            try {
                // Get watched episodes from Trakt for this show
                const response = await TraktService._apiRequest('/users/me/watched/shows');
                if (!response.ok) {
                    setLoading(false);
                    return;
                }

                const watchedShows = await response.json();

                // Find this show
                const show = watchedShows.find(s => {
                    // Match by name (case insensitive)
                    if (s.show.title?.toLowerCase() === series.name?.toLowerCase()) return true;
                    // Also try matching by external IDs if available
                    return false;
                });

                if (!show) {
                    setLoading(false);
                    return;
                }

                // Build a map of watched episodes
                const watchedMap = {};
                show.seasons?.forEach(season => {
                    season.episodes?.forEach(ep => {
                        // Create multiple possible context IDs
                        const episodeData = series.episodes?.find(
                            e => e.season === season.number && e.number === ep.number
                        );
                        if (episodeData) {
                            // Mark all tour variations as watched on Trakt
                            for (let tour = 1; tour <= 5; tour++) {
                                const contextId = `s${season.number}-t${tour}-d${episodeData.id}`;
                                watchedMap[contextId] = true;
                            }
                        }
                    });
                });

                setTraktWatched(watchedMap);
            } catch (error) {
                console.error('Failed to fetch Trakt status:', error);
            }
            setLoading(false);
        };

        fetchTraktStatus();
    }, [series?.id, enabled]);

    // Function to manually mark an episode as watched (for real-time updates)
    const markAsWatched = useCallback((contextId) => {
        setTraktWatched(prev => ({
            ...prev,
            [contextId]: true
        }));
    }, []);

    // Function to refetch Trakt status
    const refetch = useCallback(() => {
        if (!series || !TraktService.isConnected()) return;
        // Trigger re-fetch by updating a dependency
        setTraktWatched({});
    }, [series]);

    return { traktWatched, loading, markAsWatched, refetch };
};
