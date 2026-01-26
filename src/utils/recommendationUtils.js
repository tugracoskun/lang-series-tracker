import { SERIES_DATABASE, CEFR_LEVELS } from '../data/recommendations';

// Türleri normalize etmek için haritalama
const GENRE_MAP = {
    'Drama': ['Drama', 'Dram', 'Period Drama', 'Dönem Draması', 'Politik Drama', 'Legal Drama', 'Hukuk Draması', 'Medical Drama', 'Tıbbi Drama', 'Suç Draması'],
    'Comedy': ['Comedy', 'Komedi', 'Sitcom', 'Dramedi', 'Dramedy', 'Kara Komedi', 'Mockumentary', 'Romantik Komedi', 'Kurumsal Hiciv', 'Politik Hiciv'],
    'Sci-Fi/Fantasy': ['Sci-Fi', 'Science Fiction', 'Bilim Kurgu', 'Fantasy', 'Fantastik', 'Supernatural', 'Doğaüstü', 'Korku', 'Horror'],
    'Action/Adventure': ['Action', 'Aksiyon', 'Adventure', 'Macera', 'Crime', 'Suç', 'Polisiye', 'Mystery', 'Gizem', 'Thriller', 'Gerilim'],
    'Animation': ['Animation', 'Animasyon', 'Anime', 'Cartoon'],
    'Kids': ['Kids', 'Children', 'Okul Öncesi', 'Eğitici']
};

/**
 * Verilen ham genre stringini ana kategorilere çevirir
 * @param {string} rawGenre 
 * @returns {string[]}
 */
const normalizeGenres = (rawGenre) => {
    if (!rawGenre) return [];
    const normalized = [];
    const lowerRaw = rawGenre.toLowerCase();

    for (const [mainGenre, subGenres] of Object.entries(GENRE_MAP)) {
        if (subGenres.some(sub => lowerRaw.includes(sub.toLowerCase()))) {
            normalized.push(mainGenre);
        }
    }

    return normalized.length > 0 ? normalized : ['Other'];
};

/**
 * Kullanıcının izleme geçmişine ve seviyesine göre akıllı öneriler sunar
 * @param {Array} userSeries - Kullanıcının takip ettiği diziler
 * @param {string} userLevel - Kullanıcının CEFR seviyesi (A1, B1 vs.)
 * @returns {Object} - { topPicks: [], byGenre: {} }
 */
export const getSmartRecommendations = (userSeries, userLevel) => {
    // 1. Kullanıcı Profili Oluştur (Tercih edilen türler)
    const genrePreferences = {};
    const watchedIds = new Set(userSeries.map(s => s.tvmazeId || s.id)); // ID'leri topla

    userSeries.forEach(series => {
        // Dizi genre'lerini al (TVMaze verisinden veya local db'den)
        let genres = series.genres || [];
        if (typeof genres === 'string') genres = [genres]; // Bazen string gelebilir

        // Eğer TVMaze genres yoksa, bizim DB'den bulmaya çalış
        if (genres.length === 0) {
            // ID ile bizim DB'de ara
            Object.values(SERIES_DATABASE).forEach(levelList => {
                const found = levelList.find(s => s.id.toString() === series.id.toString());
                if (found && found.genre) {
                    genres = normalizeGenres(found.genre);
                }
            });
        }

        genres.forEach(g => {
            // Ana kategoriye çevir
            const normalized = normalizeGenres(g);
            normalized.forEach(mainG => {
                genrePreferences[mainG] = (genrePreferences[mainG] || 0) + 1;
            });
        });
    });

    // En sevilen türleri belirle
    const topGenres = Object.entries(genrePreferences)
        .sort(([, a], [, b]) => b - a)
        .map(([g]) => g);

    // 2. Tüm Öneri Havuzunu Tara ve Puanla
    let scoredRecommendations = [];

    // Hedef seviyeler: Kullanıcının seviyesi ve bir üstü (i+1 kuralı)
    const levels = Object.keys(SERIES_DATABASE);
    const currentLevelIndex = levels.indexOf(userLevel);
    // Geniş bir aralıkta arayalım ama puanlamada öncelik verelim

    Object.entries(SERIES_DATABASE).forEach(([level, seriesList]) => {
        seriesList.forEach(recSeries => {
            // Zaten izleniyorsa atla
            if (watchedIds.has(recSeries.id) || watchedIds.has(recSeries.id.toString())) return;

            let score = 0;
            const recGenres = normalizeGenres(recSeries.genre);

            // KRİTER 1: Tür Uyumu
            recGenres.forEach(g => {
                if (genrePreferences[g]) {
                    score += genrePreferences[g] * 10; // İzlenen her dizi başına 10 puan
                }
            });

            // KRİTER 2: Seviye Uyumu
            if (level === userLevel) score += 50; // Tam seviye
            else if (levels.indexOf(level) === currentLevelIndex + 1) score += 30; // i+1 (Gelişim)
            else if (levels.indexOf(level) === currentLevelIndex - 1) score += 10; // Bir alt (Kolay/Tekrar)
            else score -= 20; // Çok uzak seviyeler

            // Rastgelelik (Çeşitlilik için ufak bir varyasyon)
            score += Math.random() * 5;

            scoredRecommendations.push({
                ...recSeries,
                level,
                score,
                matchedGenres: recGenres.filter(g => genrePreferences[g])
            });
        });
    });

    // 3. Sıralama ve Gruplama
    scoredRecommendations.sort((a, b) => b.score - a.score);

    // En iyi 5 öneri (Top Picks)
    const topPicks = scoredRecommendations.slice(0, 5);

    // Türe göre öneriler (Şayet kullanıcı Drama seviyorsa "Sizin İçin: Drama" başlığı için)
    const byGenre = {};
    if (topGenres.length > 0) {
        topGenres.slice(0, 3).forEach(genre => {
            byGenre[genre] = scoredRecommendations
                .filter(r => r.matchedGenres.includes(genre))
                .slice(0, 4);
        });
    }

    return {
        topPicks,
        byGenre,
        hasPreferences: userSeries.length > 0
    };
};
