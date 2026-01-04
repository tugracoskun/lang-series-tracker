import { useState } from 'react';
import { toast } from 'sonner';
import { TVMazeService } from '../services/TVMazeService';
import { TraktService } from '../services/TraktService';
import { generateSeasonSchedule } from '../utils/schedule';

export const useSeriesManager = (user, db, setDb, appMutations, logAction, rotationStrategy) => {
    const [loadingState, setLoadingState] = useState(null);
    const [seriesToDelete, setSeriesToDelete] = useState(null);

    const handleSeriesSelect = async (show) => {
        const showId = show.id.toString();
        if (db.series.some(s => s.id.toString() === showId)) {
            toast.info('Bu dizi zaten takip listenizde.');
            return;
        }

        setLoadingState("Veri bağlantısı kuruluyor...");
        try {
            const details = await TVMazeService.getShowDetails(show.id);
            if (!details._embedded?.episodes) throw new Error("Bölümler alınamadı.");

            setLoadingState("Sezon matrisi oluşturuluyor...");
            await new Promise(r => setTimeout(r, 1000));

            const schedule = generateSeasonSchedule(details._embedded.episodes, 'INTERMEDIATE', rotationStrategy);

            const seriesData = {
                tvmazeId: details.id,
                name: details.name,
                imageUrl: details.image?.original,
                genres: details.genres,
                rotationStrategy: rotationStrategy,
                languageConfig: null,
                schedule: schedule,
                episodes: details._embedded.episodes
            };

            let dbSeries = null;
            if (user) {
                dbSeries = await appMutations.addSeries.mutateAsync(seriesData);
            }

            const newSeries = {
                id: details.id.toString(),
                name: details.name,
                image: details.image,
                episodes: details._embedded.episodes,
                schedule: schedule,
                genres: details.genres,
                rotationStrategy: rotationStrategy,
                languageConfig: null,
                dbId: dbSeries?.id
            };

            setDb(prev => ({
                ...prev,
                series: [newSeries, ...prev.series],
                userData: { ...prev.userData, [newSeries.id]: { completed: {}, notes: {} } }
            }));

            logAction('ADD', `${newSeries.name} takip listesine eklendi.`);
            toast.success(`${newSeries.name} başarıyla eklendi`);
            setLoadingState(null);
        } catch (e) {
            toast.error("Hata: " + e.message);
            setLoadingState(null);
            throw e; // Re-throw to handle modal closing in UI if needed
        }
    };

    const handleUpdate = async (seriesId, newData) => {
        setDb(prev => ({
            ...prev,
            userData: { ...prev.userData, [seriesId]: { ...prev.userData[seriesId], ...newData } }
        }));

        const seriesName = db.series.find(s => s.id === seriesId)?.name || "Dizi";

        if (user) {
            // PROGRESS MODIFICATION
            if (newData.completed) {
                const entries = Object.entries(newData.completed);
                const latestEntry = entries[entries.length - 1];

                if (latestEntry) {
                    const [contextId, isCompleted] = latestEntry;
                    // Parse contextId format: "s1-t1-d40646" or "40646-L2" etc.
                    const parts = contextId.split('-');

                    // Find episode ID (part starting with 'd' or just a number)
                    let episodeId = null;
                    let subtitleMode = null;

                    for (const part of parts) {
                        if (part.startsWith('d') && !isNaN(parseInt(part.slice(1)))) {
                            episodeId = parseInt(part.slice(1));
                        } else if (part.startsWith('t')) {
                            subtitleMode = part;
                        } else if (!isNaN(parseInt(part))) {
                            episodeId = parseInt(part);
                        } else if (part.startsWith('L') || part.startsWith('l')) {
                            subtitleMode = part;
                        }
                    }

                    console.log('[DEBUG] Progress sync attempt:', {
                        seriesId,
                        contextId,
                        episodeId,
                        subtitleMode,
                        completed: isCompleted
                    });

                    try {
                        const completionDate = new Date().toISOString();

                        const result = await appMutations.updateProgress.mutateAsync({
                            seriesId,
                            data: {
                                contextId,
                                episodeId,
                                subtitleMode,
                                completed: isCompleted,
                                completedAt: completionDate
                            }
                        });

                        console.log('[DEBUG] Progress sync success:', result);

                        if (isCompleted) {
                            logAction('WATCH', `${seriesName} izlendi.`);

                            // Trakt.tv scrobble - if connected
                            if (TraktService.isConnected()) {
                                try {
                                    // Get series info for Trakt
                                    const series = db.series.find(s => s.id.toString() === seriesId.toString());
                                    if (series) {
                                        // Find episode details from series data
                                        const episode = series.episodes?.find(ep => ep.id === episodeId);

                                        const scrobbleResult = await TraktService.scrobbleEpisode({
                                            showTitle: series.name,
                                            season: episode?.season || 1,
                                            number: episode?.number || 1,
                                            watchedAt: completionDate, // Use same date
                                            // Try to get external IDs
                                            imdbId: series.externals?.imdb,
                                            tvdbId: series.externals?.thetvdb
                                        });

                                        if (scrobbleResult.success) {
                                            console.log('[DEBUG] Trakt scrobble success:', scrobbleResult);
                                            toast.success('Trakt.tv\'ye kaydedildi');
                                        } else {
                                            console.warn('[DEBUG] Trakt scrobble not found:', scrobbleResult.notFound);
                                        }
                                    }
                                } catch (traktError) {
                                    console.error('[DEBUG] Trakt scrobble error:', traktError);
                                    // Don't show error toast for Trakt - it's optional
                                }
                            }
                        } else {
                            logAction('WATCH_UNDO', `${seriesName} izleme durumu geri alındı.`);
                        }
                    } catch (error) {
                        console.error('[DEBUG] Progress sync error:', error);
                        console.error('[DEBUG] Error details:', error.message, error.stack);
                        toast.error('İlerleme senkronize edilemedi: ' + error.message);
                    }
                }
            }

            // VOCABULARY MODIFICATION
            if (newData.vocabulary) {
                const epId = Object.keys(newData.vocabulary)[0];
                const newList = newData.vocabulary[epId];
                const oldList = db.userData[seriesId]?.vocabulary?.[epId] || [];

                // Diffing
                const added = newList.filter(n => !oldList.some(o => o.word === n.word));
                const removed = oldList.filter(o => !newList.some(n => n.word === o.word));

                for (const item of added) {
                    try {
                        await appMutations.addVocabulary.mutateAsync({
                            seriesId,
                            episodeId: parseInt(epId),
                            word: item.word,
                            meaning: item.meaning
                        });
                        logAction('VOCAB', `${seriesName} için yeni kelime: ${item.word}`);
                    } catch (e) {
                        console.error('Vocab add error:', e);
                    }
                }

                for (const item of removed) {
                    try {
                        if (item.id) await appMutations.deleteVocabulary.mutateAsync(item.id);
                    } catch (e) {
                        console.error('Vocab remove error:', e);
                    }
                }
            }
        }
    };

    const handleSeriesSettingsUpdate = (seriesId, settings) => {
        const series = db.series.find(s => s.id === seriesId);

        setDb(prev => {
            const updatedSeries = prev.series.map(s => {
                if (s.id === seriesId) {
                    // Eğer rotasyon stratejisi değiştiyse, schedule'ı yeniden oluştur
                    let newSchedule = s.schedule;
                    if (settings.rotationStrategy && settings.rotationStrategy !== s.rotationStrategy) {
                        newSchedule = generateSeasonSchedule(
                            s.episodes,
                            'INTERMEDIATE',
                            settings.rotationStrategy
                        );
                    }
                    return {
                        ...s,
                        ...settings,
                        schedule: newSchedule
                    };
                }
                return s;
            });
            return { ...prev, series: updatedSeries };
        });

        // Sync to Supabase
        if (user && series?.dbId) {
            const updates = {};
            if (settings.rotationStrategy) updates.rotation_strategy = settings.rotationStrategy;
            if (settings.languageConfig) updates.language_config = settings.languageConfig;

            // Eğer schedule yeniden oluşturulduysa onu da kaydet
            if (settings.rotationStrategy) {
                const newSchedule = generateSeasonSchedule(series.episodes, 'INTERMEDIATE', settings.rotationStrategy);
                updates.schedule_data = newSchedule;
            }

            appMutations.updateSeries.mutateAsync({ id: series.dbId, updates }).catch(e => {
                console.error('Series update error:', e);
                toast.error('Ayarlar kaydedilemedi');
            });
        }

        const seriesName = series?.name || "Dizi";
        if (settings.rotationStrategy) {
            logAction('SETTINGS', `${seriesName} rotasyon stratejisi değiştirildi.`);
        }
    };

    const openDeleteConfirm = (e, seriesId) => {
        e.stopPropagation();
        setSeriesToDelete(seriesId);
    };

    const confirmDelete = async () => {
        if (seriesToDelete) {
            const series = db.series.find(s => s.id === seriesToDelete);
            const seriesName = series?.name || "Bir dizi";

            if (user && series?.dbId) {
                try {
                    await appMutations.deleteSeries.mutateAsync(series.dbId);
                } catch (error) {
                    console.error('Series delete error:', error);
                    toast.error('Silme işlemi başarısız oldu');
                    return;
                }
            }

            setDb(prev => ({
                ...prev,
                series: prev.series.filter(s => s.id !== seriesToDelete)
            }));
            logAction('DELETE', `${seriesName} silindi.`);
            toast.success(`${seriesName} silindi`);
            setSeriesToDelete(null);
        }
    };

    return {
        handleSeriesSelect,
        handleUpdate,
        handleSeriesSettingsUpdate,
        openDeleteConfirm,
        confirmDelete,
        seriesToDelete,
        setSeriesToDelete,
        loadingState,
        setLoadingState
    };
};
