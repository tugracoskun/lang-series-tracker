/**
 * ============================================================================
 * LANG TRACKER - Altyazı Servisi
 * ============================================================================
 * 
 * OpenSubtitles API entegrasyonu ile otomatik altyazı arama ve indirme.
 * Desteklenen kaynaklar: OpenSubtitles, Subscene (fallback)
 */

// Desteklenen diller listesi
export const SUPPORTED_LANGUAGES = {
    // Hedef Diller (Öğrenilen)
    en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },

    // Ana Diller (Kullanıcının dili)
    tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
    cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
    hu: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
    ro: { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
    th: { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    ms: { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
    fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
    da: { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
    no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
    uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
    bg: { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
    hr: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
    sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
    sl: { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
};

// Popüler dil çiftleri (öneriler için)
export const POPULAR_LANGUAGE_PAIRS = [
    { native: 'tr', target: 'en', label: 'Türkçe → İngilizce' },
    { native: 'es', target: 'en', label: 'Español → English' },
    { native: 'pt', target: 'en', label: 'Português → English' },
    { native: 'fr', target: 'en', label: 'Français → English' },
    { native: 'de', target: 'en', label: 'Deutsch → English' },
    { native: 'ja', target: 'en', label: '日本語 → English' },
    { native: 'ko', target: 'en', label: '한국어 → English' },
    { native: 'zh', target: 'en', label: '中文 → English' },
    { native: 'ru', target: 'en', label: 'Русский → English' },
    { native: 'tr', target: 'de', label: 'Türkçe → Deutsch' },
    { native: 'en', target: 'es', label: 'English → Español' },
    { native: 'en', target: 'fr', label: 'English → Français' },
];

/**
 * OpenSubtitles API Wrapper
 * Not: OpenSubtitles REST API kullanımı için API key gereklidir.
 * Ücretsiz kullanım için günlük limit vardır.
 */
class SubtitleServiceClass {
    constructor() {
        // OpenSubtitles API endpoints
        this.OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';
        this.OPENSUBTITLES_USER_AGENT = 'LangTracker v1.0';

        // API Key (kullanıcı tarafından sağlanabilir)
        this.apiKey = localStorage.getItem('opensubtitles_api_key') || null;
        this.token = localStorage.getItem('opensubtitles_token') || null;
    }

    /**
     * API Key ayarla
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('opensubtitles_api_key', key);
    }

    /**
     * API Key'in geçerli olup olmadığını kontrol et
     */
    hasApiKey() {
        return !!this.apiKey;
    }

    /**
     * OpenSubtitles'a login ol
     */
    async login(username, password) {
        if (!this.apiKey) {
            throw new Error('API Key gerekli. opensubtitles.com\'dan ücretsiz alabilirsiniz.');
        }

        try {
            const response = await fetch(`${this.OPENSUBTITLES_API}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': this.apiKey,
                    'User-Agent': this.OPENSUBTITLES_USER_AGENT
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
            }

            const data = await response.json();
            this.token = data.token;
            localStorage.setItem('opensubtitles_token', data.token);
            return data;
        } catch (error) {
            console.error('OpenSubtitles login error:', error);
            throw error;
        }
    }

    /**
     * Dizi/Film için altyazı ara
     * @param {Object} params - Arama parametreleri
     * @param {string} params.imdbId - IMDB ID (örn: "tt0944947")
     * @param {string} params.query - Dizi/film adı
     * @param {number} params.season - Sezon numarası
     * @param {number} params.episode - Bölüm numarası
     * @param {string} params.language - Dil kodu (örn: "en", "tr")
     */
    async searchSubtitles({ imdbId, query, season, episode, language }) {
        if (!this.apiKey) {
            // API key yoksa örnek veri döndür
            return this._getMockSubtitles(query, language);
        }

        try {
            const params = new URLSearchParams();
            if (imdbId) params.append('imdb_id', imdbId);
            if (query) params.append('query', query);
            if (season) params.append('season_number', season);
            if (episode) params.append('episode_number', episode);
            if (language) params.append('languages', language);
            params.append('order_by', 'download_count');
            params.append('order_direction', 'desc');

            const response = await fetch(`${this.OPENSUBTITLES_API}/subtitles?${params}`, {
                headers: {
                    'Api-Key': this.apiKey,
                    'User-Agent': this.OPENSUBTITLES_USER_AGENT
                }
            });

            if (!response.ok) {
                throw new Error('Altyazı araması başarısız.');
            }

            const data = await response.json();
            return data.data.map(sub => ({
                id: sub.id,
                language: sub.attributes.language,
                downloadCount: sub.attributes.download_count,
                rating: sub.attributes.ratings,
                releaseInfo: sub.attributes.release,
                uploadDate: sub.attributes.upload_date,
                fileId: sub.attributes.files[0]?.file_id,
                fileName: sub.attributes.files[0]?.file_name
            }));
        } catch (error) {
            console.error('Subtitle search error:', error);
            return this._getMockSubtitles(query, language);
        }
    }

    /**
     * Altyazı dosyasını indir
     * @param {string} fileId - Dosya ID'si
     */
    async downloadSubtitle(fileId) {
        if (!this.apiKey || !this.token) {
            throw new Error('Altyazı indirmek için giriş yapmalısınız.');
        }

        try {
            const response = await fetch(`${this.OPENSUBTITLES_API}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': this.apiKey,
                    'Authorization': `Bearer ${this.token}`,
                    'User-Agent': this.OPENSUBTITLES_USER_AGENT
                },
                body: JSON.stringify({ file_id: fileId })
            });

            if (!response.ok) {
                throw new Error('Altyazı indirme başarısız.');
            }

            const data = await response.json();
            return {
                downloadLink: data.link,
                fileName: data.file_name,
                remaining: data.remaining
            };
        } catch (error) {
            console.error('Subtitle download error:', error);
            throw error;
        }
    }

    /**
     * TVMaze ID'den IMDB ID'ye dönüştür
     */
    async getImdbIdFromTvMaze(tvMazeId) {
        try {
            const response = await fetch(`https://api.tvmaze.com/shows/${tvMazeId}`);
            const data = await response.json();
            return data.externals?.imdb || null;
        } catch (error) {
            console.error('IMDB ID fetch error:', error);
            return null;
        }
    }

    /**
     * Bir bölüm için tüm dillerde altyazı durumunu kontrol et
     */
    async checkSubtitleAvailability(tvMazeId, season, episode, languages = ['en', 'tr']) {
        const imdbId = await this.getImdbIdFromTvMaze(tvMazeId);
        if (!imdbId) return {};

        const availability = {};
        for (const lang of languages) {
            const subs = await this.searchSubtitles({
                imdbId,
                season,
                episode,
                language: lang
            });
            availability[lang] = {
                available: subs.length > 0,
                count: subs.length,
                bestMatch: subs[0] || null
            };
        }
        return availability;
    }

    /**
     * API key olmadan örnek veri döndür (demo mod)
     */
    _getMockSubtitles(query, language) {
        return [
            {
                id: 'mock-1',
                language: language,
                downloadCount: 15420,
                rating: 8.5,
                releaseInfo: `${query}.S01E01.720p.WEB-DL`,
                uploadDate: new Date().toISOString(),
                fileId: null,
                fileName: `${query}_${language}.srt`,
                isMock: true
            },
            {
                id: 'mock-2',
                language: language,
                downloadCount: 8230,
                rating: 7.8,
                releaseInfo: `${query}.S01E01.1080p.BluRay`,
                uploadDate: new Date().toISOString(),
                fileId: null,
                fileName: `${query}_${language}_alt.srt`,
                isMock: true
            }
        ];
    }
}

// Singleton instance
export const SubtitleService = new SubtitleServiceClass();

/**
 * Dil yardımcı fonksiyonları
 */
export const getLanguageByCode = (code) => SUPPORTED_LANGUAGES[code] || null;
export const getLanguageName = (code) => SUPPORTED_LANGUAGES[code]?.name || code;
export const getLanguageNativeName = (code) => SUPPORTED_LANGUAGES[code]?.nativeName || code;
export const getLanguageFlag = (code) => SUPPORTED_LANGUAGES[code]?.flag || '🌐';

/**
 * Dil listesini alfabetik sırala
 */
export const getSortedLanguages = () => {
    return Object.values(SUPPORTED_LANGUAGES).sort((a, b) =>
        a.name.localeCompare(b.name)
    );
};

/**
 * Popüler hedef dilleri getir
 */
export const getPopularTargetLanguages = () => {
    return ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'].map(code =>
        SUPPORTED_LANGUAGES[code]
    ).filter(Boolean);
};
