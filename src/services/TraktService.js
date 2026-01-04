/**
 * ============================================================================
 * LANG TRACKER - Trakt.tv Entegrasyon Servisi
 * ============================================================================
 * 
 * Trakt.tv OAuth entegrasyonu ile izleme geçmişi senkronizasyonu.
 * Bölüm izlendiğinde Trakt.tv'ye scrobble gönderir.
 * 
 * NOT: Client ID public key olarak kod içinde tutulabilir.
 * Kullanıcılar kendi uygulamalarını oluşturmak isterse .env ile override edebilir.
 */

// Trakt.tv API Configuration
const TRAKT_API_URL = 'https://api.trakt.tv';

// Default Client ID - LangTracker official app (users can override via .env)
// Create your own app at https://trakt.tv/oauth/applications/new if self-hosting
const TRAKT_CLIENT_ID = import.meta.env.VITE_TRAKT_CLIENT_ID || 'YOUR_TRAKT_CLIENT_ID_HERE';
const TRAKT_CLIENT_SECRET = import.meta.env.VITE_TRAKT_CLIENT_SECRET || '';
const TRAKT_REDIRECT_URI = import.meta.env.VITE_TRAKT_REDIRECT_URI || `${window.location.origin}/trakt-callback`;

class TraktServiceClass {
    constructor() {
        this.accessToken = localStorage.getItem('trakt_access_token') || null;
        this.refreshToken = localStorage.getItem('trakt_refresh_token') || null;
        this.expiresAt = localStorage.getItem('trakt_expires_at') || null;
    }

    /**
     * Trakt.tv yapılandırılmış mı kontrol et
     */
    isConfigured() {
        return !!TRAKT_CLIENT_ID && !!TRAKT_CLIENT_SECRET;
    }

    /**
     * Kullanıcı bağlı mı kontrol et
     */
    isConnected() {
        return !!this.accessToken && this.expiresAt > Date.now();
    }

    /**
     * OAuth yetkilendirme URL'i oluştur
     */
    getAuthUrl() {
        if (!this.isConfigured()) {
            throw new Error('Trakt.tv API anahtarları yapılandırılmamış');
        }

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: TRAKT_CLIENT_ID,
            redirect_uri: TRAKT_REDIRECT_URI
        });

        return `https://trakt.tv/oauth/authorize?${params.toString()}`;
    }

    /**
     * OAuth callback'ten gelen code ile token al
     */
    async exchangeCode(code) {
        if (!this.isConfigured()) {
            throw new Error('Trakt.tv API anahtarları yapılandırılmamış');
        }

        const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code,
                client_id: TRAKT_CLIENT_ID,
                client_secret: TRAKT_CLIENT_SECRET,
                redirect_uri: TRAKT_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Token alma başarısız');
        }

        const data = await response.json();
        this._saveTokens(data);
        return data;
    }

    /**
     * Token'ı yenile
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('Refresh token bulunamadı');
        }

        const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh_token: this.refreshToken,
                client_id: TRAKT_CLIENT_ID,
                client_secret: TRAKT_CLIENT_SECRET,
                redirect_uri: TRAKT_REDIRECT_URI,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            this.disconnect();
            throw new Error('Token yenileme başarısız');
        }

        const data = await response.json();
        this._saveTokens(data);
        return data;
    }

    /**
     * Token'ları kaydet
     */
    _saveTokens(data) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresAt = Date.now() + (data.expires_in * 1000);

        localStorage.setItem('trakt_access_token', this.accessToken);
        localStorage.setItem('trakt_refresh_token', this.refreshToken);
        localStorage.setItem('trakt_expires_at', this.expiresAt.toString());
    }

    /**
     * Bağlantıyı kes
     */
    disconnect() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;

        localStorage.removeItem('trakt_access_token');
        localStorage.removeItem('trakt_refresh_token');
        localStorage.removeItem('trakt_expires_at');
    }

    /**
     * API isteği yap (otomatik token yenileme ile)
     */
    async _apiRequest(endpoint, options = {}) {
        if (!this.isConnected()) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            } else {
                throw new Error('Trakt.tv bağlantısı gerekli');
            }
        }

        const response = await fetch(`${TRAKT_API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
                'trakt-api-version': '2',
                'trakt-api-key': TRAKT_CLIENT_ID,
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token süresi dolmuş, yenilemeyi dene
            await this.refreshAccessToken();
            return this._apiRequest(endpoint, options);
        }

        return response;
    }

    /**
     * Kullanıcı profilini getir
     */
    async getProfile() {
        const response = await this._apiRequest('/users/me');
        if (!response.ok) {
            throw new Error('Profil alınamadı');
        }
        return response.json();
    }

    /**
     * Bölümü izlendi olarak işaretle (scrobble)
     * @param {Object} episode - Bölüm bilgileri
     * @param {string} episode.showTitle - Dizi adı
     * @param {number} episode.season - Sezon numarası
     * @param {number} episode.number - Bölüm numarası
     * @param {string} episode.imdbId - IMDB ID (opsiyonel)
     * @param {string} episode.tvdbId - TVDB ID (opsiyonel)
     */
    async scrobbleEpisode(episode) {
        const body = {
            shows: [{
                title: episode.showTitle,
                ids: {}
            }]
        };

        // ID'leri ekle
        if (episode.imdbId) body.shows[0].ids.imdb = episode.imdbId;
        if (episode.tvdbId) body.shows[0].ids.tvdb = episode.tvdbId;

        // Bölümü ekle
        body.shows[0].seasons = [{
            number: episode.season,
            episodes: [{
                number: episode.number,
                watched_at: episode.watchedAt || new Date().toISOString()
            }]
        }];

        const response = await this._apiRequest('/sync/history', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Scrobble başarısız');
        }

        const result = await response.json();
        return {
            success: result.added?.episodes > 0,
            added: result.added,
            notFound: result.not_found
        };
    }

    /**
     * Bölümün izlenip izlenmediğini kontrol et
     * @param {Object} episode - Bölüm bilgileri
     */
    async isEpisodeWatched(episode) {
        try {
            // Kullanıcının izleme geçmişini kontrol et
            const response = await this._apiRequest(
                `/users/me/watched/shows`
            );

            if (!response.ok) return false;

            const watchedShows = await response.json();

            // Diziyi bul
            const show = watchedShows.find(s => {
                if (episode.imdbId && s.show.ids?.imdb === episode.imdbId) return true;
                if (episode.tvdbId && s.show.ids?.tvdb === parseInt(episode.tvdbId)) return true;
                if (s.show.title?.toLowerCase() === episode.showTitle?.toLowerCase()) return true;
                return false;
            });

            if (!show) return false;

            // Sezonu bul
            const season = show.seasons?.find(s => s.number === episode.season);
            if (!season) return false;

            // Bölümü bul
            const ep = season.episodes?.find(e => e.number === episode.number);
            return !!ep;
        } catch (error) {
            console.error('Trakt watch check error:', error);
            return false;
        }
    }

    /**
     * TVMaze ID'den Trakt bilgilerini al
     */
    async lookupByTvMaze(tvMazeId) {
        try {
            // Önce TVMaze'den IMDB ID al
            const tvMazeResponse = await fetch(`https://api.tvmaze.com/shows/${tvMazeId}`);
            const tvMazeData = await tvMazeResponse.json();
            const imdbId = tvMazeData.externals?.imdb;

            if (!imdbId) return null;

            // Trakt'ta ara
            const response = await this._apiRequest(`/search/imdb/${imdbId}`);
            if (!response.ok) return null;

            const results = await response.json();
            return results[0]?.show || null;
        } catch (error) {
            console.error('Trakt lookup error:', error);
            return null;
        }
    }
}

// Singleton instance
export const TraktService = new TraktServiceClass();

/**
 * Trakt bağlantı durumu hook'u için helper
 */
export const getTraktConnectionStatus = () => ({
    isConfigured: TraktService.isConfigured(),
    isConnected: TraktService.isConnected()
});
