/**
 * ============================================================================
 * LANG TRACKER - Supabase Client & Database Service
 * ============================================================================
 * 
 * Supabase entegrasyonu: Authentication, Database, Realtime
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client - Eğer env vars yoksa null döner
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Supabase bağlantısı var mı kontrol et
export const isSupabaseConfigured = () => !!supabase;

/**
 * ============================================================================
 * AUTHENTICATION
 * ============================================================================
 */
export const AuthService = {
    /**
     * Email/Password ile kayıt ol
     */
    async signUp(email, password, userName) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    user_name: userName,
                }
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Email/Password ile giriş yap
     */
    async signIn(email, password) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * OAuth ile giriş (Google, GitHub)
     */
    async signInWithOAuth(provider) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider, // 'google' | 'github'
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Çıkış yap
     */
    async signOut() {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Mevcut kullanıcıyı al
     */
    async getUser() {
        if (!supabase) return null;

        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Session al
     */
    async getSession() {
        if (!supabase) return null;

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * Auth state değişikliklerini dinle
     */
    onAuthStateChange(callback) {
        if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };

        return supabase.auth.onAuthStateChange(callback);
    }
};

/**
 * ============================================================================
 * DATABASE - PROFILES
 * ============================================================================
 */
export const ProfileService = {
    /**
     * Kullanıcı profili oluştur/güncelle
     */
    async upsertProfile(userId, profileData) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Kullanıcı profilini al
     */
    async getProfile(userId) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
};

/**
 * ============================================================================
 * DATABASE - USER SERIES
 * ============================================================================
 */
export const SeriesService = {
    /**
     * Kullanıcının tüm dizilerini al
     */
    async getUserSeries(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('user_series')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Yeni dizi ekle (veya mevcut olanı güncelle)
     */
    async addSeries(userId, seriesData) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('user_series')
            .upsert({
                user_id: userId,
                tvmaze_id: seriesData.tvmazeId,
                name: seriesData.name,
                image_url: seriesData.imageUrl,
                genres: seriesData.genres,
                rotation_strategy: seriesData.rotationStrategy,
                language_config: seriesData.languageConfig,
                schedule_data: seriesData.schedule,
                episodes_data: seriesData.episodes,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,tvmaze_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Dizi güncelle
     */
    async updateSeries(seriesId, updates) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('user_series')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', seriesId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Dizi sil
     */
    async deleteSeries(seriesId) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { error } = await supabase
            .from('user_series')
            .delete()
            .eq('id', seriesId);

        if (error) throw error;
    }
};

/**
 * ============================================================================
 * DATABASE - PROGRESS
 * ============================================================================
 */
export const ProgressService = {
    /**
     * Kullanıcının tüm ilerlemesini al
     */
    async getUserProgress(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    },

    /**
     * Bir dizinin ilerlemesini al
     */
    async getSeriesProgress(userId, seriesId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('series_id', seriesId);

        if (error) throw error;
        return data || [];
    },

    /**
     * İlerleme kaydet/güncelle
     * @param {string} userId - User UUID
     * @param {number} tvMazeId - TVMaze series ID (not internal DB id)
     * @param {Object} progressData - Progress data
     */
    async upsertProgress(userId, tvMazeId, progressData) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        // First, get the internal series_id from user_series table
        const { data: seriesRow, error: lookupError } = await supabase
            .from('user_series')
            .select('id')
            .eq('user_id', userId)
            .eq('tvmaze_id', tvMazeId)
            .single();

        if (lookupError || !seriesRow) {
            console.error('Series lookup error:', lookupError);
            throw new Error('Dizi bulunamadı');
        }

        const internalSeriesId = seriesRow.id;

        // Build payload with only defined fields
        const payload = {
            user_id: userId,
            series_id: internalSeriesId,
            context_id: progressData.contextId,
            episode_id: progressData.episodeId,
            subtitle_mode: progressData.subtitleMode,
            completed: progressData.completed,
            completed_at: progressData.completed ? (progressData.completedAt || new Date().toISOString()) : null
        };

        // Add optional fields only if defined
        if (progressData.season !== undefined) payload.season = progressData.season;
        if (progressData.episodeNumber !== undefined) payload.episode_number = progressData.episodeNumber;
        if (progressData.tour !== undefined) payload.tour = progressData.tour;

        const { data, error } = await supabase
            .from('progress')
            .upsert(payload, {
                onConflict: 'user_id,series_id,context_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Toplu ilerleme kaydet
     */
    async bulkUpsertProgress(progressArray) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('progress')
            .upsert(progressArray, {
                onConflict: 'user_id,series_id,context_id'
            })
            .select();

        if (error) throw error;
        return data;
    }
};

/**
 * ============================================================================
 * DATABASE - VOCABULARY
 * ============================================================================
 */
export const VocabularyService = {
    /**
     * Kullanıcının tüm kelimelerini al
     */
    async getUserVocabulary(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('vocabulary')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Bir bölümün kelimelerini al
     */
    async getEpisodeVocabulary(userId, seriesId, episodeId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('vocabulary')
            .select('*')
            .eq('user_id', userId)
            .eq('series_id', seriesId)
            .eq('episode_id', episodeId);

        if (error) throw error;
        return data || [];
    },

    /**
     * Kelime ekle
     */
    async addVocabulary(userId, seriesId, episodeId, word, meaning, context = null) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('vocabulary')
            .insert({
                user_id: userId,
                series_id: seriesId,
                episode_id: episodeId,
                word,
                meaning,
                context,
                mastery_level: 0
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Kelime güncelle (mastery level vb.)
     */
    async updateVocabulary(vocabId, updates) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('vocabulary')
            .update(updates)
            .eq('id', vocabId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Kelime sil
     */
    async deleteVocabulary(vocabId) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { error } = await supabase
            .from('vocabulary')
            .delete()
            .eq('id', vocabId);

        if (error) throw error;
    }
};

/**
 * ============================================================================
 * DATABASE - NOTES
 * ============================================================================
 */
export const NotesService = {
    /**
     * Kullanıcının tüm notlarını al
     */
    async getUserNotes(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Not ekle
     */
    async addNote(userId, noteData) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: userId,
                series_id: noteData.seriesId || null,
                episode_id: noteData.episodeId || null,
                title: noteData.title,
                content: noteData.content,
                tags: noteData.tags || []
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Not güncelle
     */
    async updateNote(noteId, updates) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('notes')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', noteId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Not sil
     */
    async deleteNote(noteId) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) throw error;
    }
};

/**
 * ============================================================================
 * DATABASE - WATCHLIST
 * ============================================================================
 */
export const WatchlistService = {
    /**
     * Kullanıcının izleme listesini al
     */
    async getUserWatchlist(userId) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * İzleme listesine ekle
     */
    async addToWatchlist(userId, show) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { data, error } = await supabase
            .from('watchlist')
            .insert({
                user_id: userId,
                tvmaze_id: show.id,
                name: show.name,
                image_url: show.image?.medium || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * İzleme listesinden çıkar
     */
    async removeFromWatchlist(userId, tvmazeId) {
        if (!supabase) throw new Error('Supabase yapılandırılmamış');

        const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('tvmaze_id', tvmazeId);

        if (error) throw error;
    }
};

/**
 * ============================================================================
 * DATABASE - ACTIVITY HISTORY
 * ============================================================================
 */
export const ActivityService = {
    /**
     * Aktivite loglarını al
     */
    async getUserActivity(userId, limit = 20) {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Aktivite logla
     */
    async logActivity(userId, type, description) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('activity_log')
            .insert({
                user_id: userId,
                type,
                description
            })
            .select()
            .single();

        if (error) {
            console.error('Activity log error:', error);
            return null;
        }
        return data;
    }
};

/**
 * ============================================================================
 * SYNC HELPER - localStorage ile senkronizasyon
 * ============================================================================
 */
export const SyncService = {
    /**
     * localStorage'dan Supabase'e veri aktar (migration)
     */
    async migrateFromLocalStorage(userId) {
        const localData = localStorage.getItem('langTracker_v4_seasons');
        if (!localData) return { migrated: false, reason: 'Yerel veri bulunamadı' };

        try {
            const parsed = JSON.parse(localData);

            // Dizileri aktar
            for (const series of parsed.series || []) {
                await SeriesService.addSeries(userId, {
                    tvmazeId: parseInt(series.id),
                    name: series.name,
                    imageUrl: series.image?.original,
                    genres: series.genres,
                    rotationStrategy: series.rotationStrategy || 'CLASSIC',
                    languageConfig: series.languageConfig,
                    schedule: series.schedule,
                    episodes: series.episodes
                });
            }

            // İzleme listesini aktar
            for (const item of parsed.watchlist || []) {
                await WatchlistService.addToWatchlist(userId, {
                    id: item.id,
                    name: item.name,
                    image: item.image
                });
            }

            // Notları aktar
            for (const note of parsed.notes || []) {
                await NotesService.addNote(userId, {
                    title: note.title,
                    content: note.content,
                    tags: note.tags
                });
            }

            return { migrated: true, count: parsed.series?.length || 0 };
        } catch (error) {
            console.error('Migration error:', error);
            return { migrated: false, reason: error.message };
        }
    },

    /**
     * Supabase'den localStorage'a yedekle
     */
    async backupToLocalStorage(userId) {
        try {
            const [series, watchlist, notes] = await Promise.all([
                SeriesService.getUserSeries(userId),
                WatchlistService.getUserWatchlist(userId),
                NotesService.getUserNotes(userId)
            ]);

            const backup = {
                series: series.map(s => ({
                    id: s.tvmaze_id.toString(),
                    name: s.name,
                    image: { original: s.image_url },
                    genres: s.genres,
                    schedule: s.schedule_data,
                    episodes: s.episodes_data,
                    rotationStrategy: s.rotation_strategy
                })),
                watchlist,
                notes,
                userData: {} // Progress ayrı tabloda
            };

            localStorage.setItem('langTracker_v4_seasons_backup', JSON.stringify(backup));
            return true;
        } catch (error) {
            console.error('Backup error:', error);
            return false;
        }
    }
};

export default supabase;
