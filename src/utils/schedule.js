/**
 * ============================================================================
 * LANG TRACKER - Bilimsel Temelli İzleme Metodolojisi
 * ============================================================================
 * 
 * Bu sistem, İkinci Dil Edinimi (SLA) araştırmalarına dayanmaktadır:
 * - İkili Kodlama Kuramı (Paivio)
 * - Bilişsel Yük Kuramı (Sweller)
 * - Fark Etme Hipotezi (Schmidt)
 * - Yapı İskelesi (Scaffolding) Prensibi
 * 
 * ÖĞRENME AŞAMALARI (Her bölüm için):
 * 1. HAZIRLIK (Priming): Bölümdeki zor kelimeler önceden gösterilir
 * 2. 1. İZLEME (Altyazısız): Aktif dinleme, ana fikri anla
 * 3. 2. İZLEME (Çift Altyazı EN+TR): Detaylı form-anlam eşleşmesi
 * 4. 3. İZLEME (Altyazısız - Opsiyonel): Pekiştirme ve doğrulama
 * 
 * SEVİYEYE GÖRE MODLAR:
 * - Başlangıç (A1-A2): Önce destekli → Sonra bağımsız (Standart İskele)
 * - Orta (B1-B2): Meydan okuma → Destek → Pekiştirme (Ters İskele)
 * - İleri (C1-C2): Minimal destek, bağımsız çalışma
 */

// Altyazı modları - Dinamik dil desteği
// L1 = Ana dil (native), L2 = Hedef dil (target)
export const SUBTITLE_MODES = {
    NONE: null,           // Altyazısız - Aktif dinleme
    L2: 'L2',             // Sadece hedef dil altyazısı (öğrenilen dil)
    L1: 'L1',             // Sadece ana dil altyazısı (kullanıcının dili)
    DUAL: 'DUAL',         // Çift altyazı (L2 + L1) - Maksimum form-anlam eşleşmesi
};

// Varsayılan dil ayarları
export const DEFAULT_LANGUAGE_CONFIG = {
    nativeLanguage: 'tr',   // Ana dil (L1)
    targetLanguage: 'en',   // Hedef dil (L2)
};

// Kullanıcının dil ayarlarını al
export const getLanguageConfig = () => {
    const saved = localStorage.getItem('langTracker_languageConfig');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return DEFAULT_LANGUAGE_CONFIG;
        }
    }
    return DEFAULT_LANGUAGE_CONFIG;
};

// Kullanıcının dil ayarlarını kaydet
export const setLanguageConfig = (config) => {
    localStorage.setItem('langTracker_languageConfig', JSON.stringify({
        ...DEFAULT_LANGUAGE_CONFIG,
        ...config
    }));
};

// Öğrenme aşamaları
export const LEARNING_PHASES = {
    PREP: {
        id: 'PREP',
        name: 'Hazırlık',
        icon: 'Library',
        description: 'Bölümdeki zor kelimeler ve kavramlar',
        color: 'purple'
    },
    WATCH_1: {
        id: 'WATCH_1',
        name: '1. İzleme',
        icon: 'Headphones',
        subtitle: null,
        description: 'Altyazısız dinle, ana fikri anla',
        color: 'slate'
    },
    WATCH_2: {
        id: 'WATCH_2',
        name: '2. İzleme',
        icon: 'BookOpen',
        subtitle: 'DUAL',
        description: 'Çift altyazı ile detaylı çalışma',
        color: 'indigo'
    },
    WATCH_3: {
        id: 'WATCH_3',
        name: '3. İzleme',
        icon: 'CheckCircle',
        subtitle: null,
        description: 'Altyazısız pekiştirme (Opsiyonel)',
        color: 'emerald',
        optional: true
    }
};

// Seviye bazlı öğrenme modları
export const LEARNING_LEVELS = {
    BEGINNER: {
        id: 'BEGINNER',
        name: 'Başlangıç',
        cefr: 'A1-A2',
        description: 'Önce destekli izleme, sonra bağımsız pratik',
        icon: 'Sprout',
        // Başlangıç için: Önce çift altyazı → L2 altyazı → Altyazısız
        phases: [
            { ...LEARNING_PHASES.PREP },
            { ...LEARNING_PHASES.WATCH_2, name: '1. İzleme', description: 'Çift altyazı ile izle ve anla' },
            { ...LEARNING_PHASES.WATCH_1, name: '2. İzleme', subtitle: 'L2', description: 'Sadece hedef dil altyazısı ile izle' },
            { ...LEARNING_PHASES.WATCH_3, name: '3. İzleme', description: 'Altyazısız test et (Opsiyonel)' }
        ]
    },
    INTERMEDIATE: {
        id: 'INTERMEDIATE',
        name: 'Orta Seviye',
        cefr: 'B1-B2',
        description: 'Meydan okuma → Destek → Pekiştirme (Ters İskele)',
        icon: 'Leaf',
        // Orta için: Altyazısız → Çift altyazı → Altyazısız
        phases: [
            { ...LEARNING_PHASES.PREP },
            { ...LEARNING_PHASES.WATCH_1 },
            { ...LEARNING_PHASES.WATCH_2 },
            { ...LEARNING_PHASES.WATCH_3 }
        ]
    },
    ADVANCED: {
        id: 'ADVANCED',
        name: 'İleri Seviye',
        cefr: 'C1-C2',
        description: 'Minimal destek, bağımsız çalışma',
        icon: 'TreeDeciduous',
        // İleri için: Altyazısız → L2 altyazı (sadece kontrol)
        phases: [
            { ...LEARNING_PHASES.PREP },
            { ...LEARNING_PHASES.WATCH_1 },
            { ...LEARNING_PHASES.WATCH_1, name: '2. İzleme', subtitle: 'L2', description: 'Sadece hedef dil altyazısı ile kontrol' },
        ]
    }
};

// Kullanıcının seçebileceği rotasyon stratejileri
export const ROTATION_STRATEGIES = {
    // Klasik rotasyon - Altyazısız ile başla
    CLASSIC: {
        id: 'CLASSIC',
        name: 'Klasik Rotasyon',
        description: 'Altyazısız başla, destek ekle, pekiştir',
        icon: 'RotateCcw',
        recommended: 'B1-B2',
        pattern: [
            SUBTITLE_MODES.NONE,  // Altyazısız - aktif dinleme
            SUBTITLE_MODES.L2,    // Hedef dil altyazısı
            SUBTITLE_MODES.L1,    // Ana dil altyazısı
            SUBTITLE_MODES.DUAL   // Çift altyazı
        ],
        tourOffsets: [0, 1, 3] // Her turda kaydırma miktarı
    },

    // Destekli başlangıç - Yeni başlayanlar için
    SCAFFOLDED: {
        id: 'SCAFFOLDED',
        name: 'Destekli Başlangıç',
        description: 'Çift altyazı ile başla, desteği azalt',
        icon: 'GraduationCap',
        recommended: 'A1-A2',
        pattern: [
            SUBTITLE_MODES.DUAL,  // Çift altyazı - maksimum destek
            SUBTITLE_MODES.L2,    // Hedef dil altyazısı
            SUBTITLE_MODES.L1,    // Ana dil altyazısı
            SUBTITLE_MODES.NONE   // Altyazısız - test
        ],
        tourOffsets: [0, 1, 2]
    },

    // Tam daldırma - İleri seviye
    IMMERSION: {
        id: 'IMMERSION',
        name: 'Tam Daldırma',
        description: 'Maksimum altyazısız, minimal destek',
        icon: 'Flame',
        recommended: 'C1-C2',
        pattern: [
            SUBTITLE_MODES.NONE,  // Altyazısız
            SUBTITLE_MODES.NONE,  // Altyazısız (tekrar)
            SUBTITLE_MODES.L2,    // Sadece kontrol için L2
            SUBTITLE_MODES.NONE   // Altyazısız - pekiştirme
        ],
        tourOffsets: [0, 0, 1]
    },

    // L2 Odaklı - Hedef dilde kalma
    L2_FOCUSED: {
        id: 'L2_FOCUSED',
        name: 'Hedef Dil Odaklı',
        description: 'Ana dil altyazısı yok, sadece hedef dil veya altyazısız',
        icon: 'Target',
        recommended: 'B2-C1',
        pattern: [
            SUBTITLE_MODES.NONE,  // Altyazısız
            SUBTITLE_MODES.L2,    // Hedef dil altyazısı
            SUBTITLE_MODES.L2,    // Hedef dil altyazısı (tekrar)
            SUBTITLE_MODES.NONE   // Altyazısız
        ],
        tourOffsets: [0, 1, 2]
    },

    // Analiz Odaklı - Detaylı çalışma
    ANALYSIS: {
        id: 'ANALYSIS',
        name: 'Analiz Modu',
        description: 'Çift altyazı ağırlıklı, form-anlam odaklı',
        icon: 'BookOpenCheck',
        recommended: 'A2-B1',
        pattern: [
            SUBTITLE_MODES.DUAL,  // Çift altyazı
            SUBTITLE_MODES.DUAL,  // Çift altyazı (tekrar)
            SUBTITLE_MODES.L2,    // Hedef dil altyazısı
            SUBTITLE_MODES.NONE   // Altyazısız
        ],
        tourOffsets: [0, 2, 3]
    },

    // Serbest - Kullanıcı her bölümde kendisi seçer
    MANUAL: {
        id: 'MANUAL',
        name: 'Manuel Seçim',
        description: 'Her bölüm için altyazıyı kendin seç',
        icon: 'SlidersHorizontal',
        recommended: 'Tüm seviyeler',
        pattern: null, // Otomatik rotasyon yok
        tourOffsets: null
    }
};

// Varsayılan rotasyon stratejisi
export const DEFAULT_ROTATION_STRATEGY = 'CLASSIC';

// Eski uyumluluk için METHODS
export const METHODS = [SUBTITLE_MODES.L2, SUBTITLE_MODES.L1, SUBTITLE_MODES.NONE];

/**
 * Sezon programı oluşturur
 * @param {Array} allEpisodes - Tüm bölümler
 * @param {string} levelId - Öğrenme seviyesi (BEGINNER, INTERMEDIATE, ADVANCED)
 * @param {string} rotationStrategyId - Rotasyon stratejisi ID'si
 * @returns {Array} Sezon programı
 */
export const generateSeasonSchedule = (allEpisodes, levelId = 'INTERMEDIATE', rotationStrategyId = DEFAULT_ROTATION_STRATEGY) => {
    // 1. Bölümleri sezonlara göre grupla
    const seasonsMap = {};
    allEpisodes.forEach(ep => {
        if (!seasonsMap[ep.season]) seasonsMap[ep.season] = [];
        seasonsMap[ep.season].push(ep);
    });

    const schedule = [];
    const level = LEARNING_LEVELS[levelId] || LEARNING_LEVELS.INTERMEDIATE;
    const strategy = ROTATION_STRATEGIES[rotationStrategyId] || ROTATION_STRATEGIES.CLASSIC;

    // Sezonları sırala
    Object.keys(seasonsMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach(seasonNum => {
        const episodes = seasonsMap[seasonNum];
        const tours = [];

        // Her tur için farklı rotasyon
        for (let t = 1; t <= 3; t++) {
            const weeks = [];
            let epCursor = 0;
            let weekCounter = 1;

            while (epCursor < episodes.length) {
                const days = [];

                // Pazartesi-Cumartesi: 6 gün aktif
                for (let d = 0; d < 6; d++) {
                    if (epCursor < episodes.length) {
                        const ep = episodes[epCursor];

                        let method = SUBTITLE_MODES.NONE; // Varsayılan

                        // Manuel mod değilse stratejiye göre rotasyon uygula
                        if (strategy.pattern && strategy.tourOffsets) {
                            const tourOffset = strategy.tourOffsets[t - 1] || 0;
                            const methodIndex = (epCursor + tourOffset) % strategy.pattern.length;
                            method = strategy.pattern[methodIndex];
                        }

                        days.push({
                            d: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"][d],
                            epId: ep.id,
                            epName: ep.name,
                            season: ep.season,
                            number: ep.number,
                            l: method,
                            airdate: ep.airdate,
                            runtime: ep.runtime,
                            image: ep.image,
                            summary: ep.summary,
                            // Öğrenme aşaması bilgisi
                            learningPhase: level.phases[1],
                            // Manuel modda kullanıcı değiştirebilir
                            isManualMode: strategy.id === 'MANUAL'
                        });
                        epCursor++;
                    }
                }

                // Pazar: Dinlenme ve analiz günü
                days.push({
                    d: "Pazar",
                    s: "Dinlenme & Haftalık Analiz",
                    isRestDay: true
                });

                weeks.push({ week: weekCounter, days });
                weekCounter++;
            }

            // Tur açıklamaları - strateji bazlı
            const getPatternDescription = (strat, tourNum) => {
                if (!strat.pattern) return "Manuel seçim aktif";
                const offset = strat.tourOffsets?.[tourNum - 1] || 0;
                const labels = strat.pattern.map((m, i) => {
                    const idx = (i + offset) % strat.pattern.length;
                    const mode = strat.pattern[idx];
                    if (mode === SUBTITLE_MODES.EN) return 'EN';
                    if (mode === SUBTITLE_MODES.TR) return 'TR';
                    if (mode === SUBTITLE_MODES.DUAL) return 'EN+TR';
                    return 'Altyazısız';
                });
                return labels.join(' → ');
            };

            tours.push({
                id: t,
                title: `${t}. Tur`,
                pattern: getPatternDescription(strategy, t),
                strategyName: strategy.name,
                strategyId: strategy.id,
                weeks
            });
        }

        schedule.push({
            season: parseInt(seasonNum),
            tours,
            levelId: levelId,
            levelInfo: level,
            rotationStrategy: strategy
        });
    });

    return schedule;
};

/**
 * Bölüm için ideal izleme akışını döndürür
 * @param {string} levelId - Öğrenme seviyesi
 * @returns {Array} İzleme aşamaları
 */
export const getWatchingFlow = (levelId = 'INTERMEDIATE') => {
    const level = LEARNING_LEVELS[levelId] || LEARNING_LEVELS.INTERMEDIATE;
    return level.phases;
};

/**
 * Altyazı modu için görüntüleme bilgisi döndürür
 * @param {string} mode - Altyazı modu
 * @param {Object} langConfig - Dil konfigürasyonu (opsiyonel)
 * @returns {Object} Görüntüleme bilgisi
 */
export const getSubtitleDisplay = (mode, langConfig = null) => {
    const config = langConfig || getLanguageConfig();
    const l2Code = config.targetLanguage?.toUpperCase() || 'L2';
    const l1Code = config.nativeLanguage?.toUpperCase() || 'L1';

    switch (mode) {
        case SUBTITLE_MODES.L2:
        case 'EN': // Geriye uyumluluk
            return {
                label: l2Code,
                fullLabel: `${l2Code} Altyazı`,
                color: 'blue',
                bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                description: 'Hedef dil altyazısı - Form-anlam eşleşmesi',
                languageCode: config.targetLanguage
            };
        case SUBTITLE_MODES.L1:
        case 'TR': // Geriye uyumluluk
            return {
                label: l1Code,
                fullLabel: `${l1Code} Altyazı`,
                color: 'amber',
                bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                description: 'Ana dil altyazısı - Anlam desteği',
                languageCode: config.nativeLanguage
            };
        case SUBTITLE_MODES.DUAL:
            return {
                label: `${l2Code}+${l1Code}`,
                fullLabel: 'Çift Altyazı',
                color: 'indigo',
                bgClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                description: 'Maksimum form-anlam eşleşmesi',
                languageCode: `${config.targetLanguage}+${config.nativeLanguage}`
            };
        case SUBTITLE_MODES.NONE:
        default:
            return {
                label: 'ALT YOK',
                fullLabel: 'Altyazısız',
                color: 'slate',
                bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                description: 'Aktif dinleme modu',
                languageCode: null
            };
    }
};
