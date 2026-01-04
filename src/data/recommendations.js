/**
 * ============================================================================
 * LANG TRACKER - CEFR Tabanlı Dizi Veritabanı
 * ============================================================================
 * 
 * Bu veritabanı, İkinci Dil Edinimi (SLA) araştırmalarına dayanmaktadır:
 * - Stephen Krashen'in "Girdi Hipotezi" (i+1)
 * - Görsel Fazlalık (Visual Redundancy) ilkesi
 * - Yakınsal Gelişim Alanı (Zone of Proximal Development)
 * 
 * SEVİYE STRATEJİSİ:
 * - A1/A2: Görsel Fazlalık (Animasyonlar, Eğitimsel içerik)
 * - B1: Öngörülebilirlik (Sitcomlar, Sabit mekanlar)
 * - B2: Alan Uzmanlığı (Tıp, Hukuk, Politik dramalar)
 * - C1: Hız ve İma (Zeka dolu dramediler, sarkazm)
 * - C2: Kültürel ve Akustik Gerçeklik (Diyalektler, mırıldanma)
 */

// Dil seviyesi tanımları
export const CEFR_LEVELS = {
    A1: {
        id: 'A1',
        name: 'Başlangıç',
        nameEn: 'Breakthrough',
        description: 'Görsel destek ve fonetik farkındalık',
        icon: 'Sprout',
        color: 'emerald',
        criteria: {
            speechRate: 'Dakikada 100 kelimenin altında',
            syntax: 'Basit SVO cümleleri, yan cümlecik yok',
            visualSupport: 'Ekrandaki eylem ile ses birebir örtüşür'
        }
    },
    A2: {
        id: 'A2',
        name: 'Temel',
        nameEn: 'Waystage',
        description: 'Hikaye akışı ve sosyal etkileşim',
        icon: 'Leaf',
        color: 'green',
        criteria: {
            speechRate: 'Dakikada 100-120 kelime',
            syntax: 'Lineer anlatım, basit çatışmalar',
            visualSupport: 'Görsel bağlam yüksek oranda destekleyici'
        }
    },
    B1: {
        id: 'B1',
        name: 'Eşik',
        nameEn: 'Threshold',
        description: 'Sitcom altın çağı ve standart dil',
        icon: 'TreeDeciduous',
        color: 'blue',
        criteria: {
            speechRate: 'Dakikada 120-140 kelime',
            syntax: 'Standart konuşmalar, öngörülebilir mekanlar',
            visualSupport: 'Stüdyo çekimi, net ses kalitesi'
        }
    },
    B2: {
        id: 'B2',
        name: 'Üst Eşik',
        nameEn: 'Vantage',
        description: 'Karmaşıklık ve uzmanlık alanları',
        icon: 'TreePine',
        color: 'indigo',
        criteria: {
            speechRate: 'Dakikada 140-160 kelime',
            syntax: 'Alana özgü terminoloji, şartlı cümleler',
            visualSupport: 'Dramatik gerilim ve tonlama'
        }
    },
    C1: {
        id: 'C1',
        name: 'İleri',
        nameEn: 'Effective Operational Proficiency',
        description: 'Hız, zeka ve ima edilen anlam',
        icon: 'Mountain',
        color: 'purple',
        criteria: {
            speechRate: 'Dakikada 160+ kelime',
            syntax: 'Sarkazm, kelime oyunları, kültürel referanslar',
            visualSupport: 'Alt metin okuma, söylenmeyeni anlama'
        }
    },
    C2: {
        id: 'C2',
        name: 'Ustalık',
        nameEn: 'Mastery',
        description: 'Diyalektler, sosyolektler ve gerçekçilik',
        icon: 'MountainSnow',
        color: 'rose',
        criteria: {
            speechRate: 'Değişken, mırıldanma dahil',
            syntax: 'Ağır bölgesel aksanlar, açıklanmayan argo',
            visualSupport: 'Gerçekçi ses miksajı, kültürel derinlik'
        }
    }
};

// TVMaze API ID'leri ile dizi veritabanı
export const SERIES_DATABASE = {
    // =========================================================================
    // A1 - BAŞLANGIÇ (Görsel Fazlalık, Fonetik Farkındalık)
    // =========================================================================
    A1: [
        {
            id: 4972,
            title: "Peppa Pig",
            genre: "Animasyon (Okul Öncesi)",
            accent: "British RP",
            pedagogicalValue: "Altın standart A1 içeriği. Eylemler ve sesler birebir örtüşür. Temel hayatta kalma İngilizcesi.",
            vocabDomain: ["Aile", "Renkler", "Sayılar", "Ev Eşyaları", "Temel Fiiller"],
            tags: ["İngiliz İngilizcesi", "Günlük Rutinler", "Aile Sözcüğü"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 55405, // Muzzy (yaklaşık ID)
            title: "Muzzy in Gondoland",
            genre: "Eğitim Animasyonu (BBC)",
            accent: "British RP",
            pedagogicalValue: "BBC tarafından dil öğretimi için tasarlandı. Gramer yapıları şarkılarla öğretilir.",
            vocabDomain: ["Gramer Kalıpları", "Şarkılar", "Boyutlar"],
            tags: ["Eğitici", "Gramer Odaklı", "BBC Klasik"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 31,
            title: "Sesame Street",
            genre: "Eğitim Animasyonu / Live-Action",
            accent: "American",
            pedagogicalValue: "ESL için efsanevi içerik. Tekrarlayan segmentler, kelime vurguları ve fonetik eğitim.",
            vocabDomain: ["Sayılar", "Harfler", "Sosyal Kavramlar", "Duygular"],
            tags: ["Klasik", "Eğitici", "Net Telaffuz"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 19397,
            title: "Extra (English)",
            genre: "Eğitim Sitcom",
            accent: "British",
            pedagogicalValue: "A1/A2 için yazılmış senaryo. Hata düzeltme sahneleri öğretici.",
            vocabDomain: ["Londra Yaşamı", "Hata Düzeltme", "Günlük İfadeler"],
            tags: ["Sitcom", "Londra Yaşamı", "Hata Düzeltme"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 5092,
            title: "Martha Speaks",
            genre: "Animasyon",
            accent: "American",
            pedagogicalValue: "Kelime öğretimi üzerine kurulu. Hedef kelimeler bölüm başında tanımlanır.",
            vocabDomain: ["Kelime Tanımı", "Hayvanlar", "Günlük Kelimeler"],
            tags: ["Kelime Odaklı", "Amerikan İngilizcesi", "Sistematik"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 2932,
            title: "Pocoyo",
            genre: "Animasyon",
            accent: "British RP",
            pedagogicalValue: "Stephen Fry anlatıcılığı. Beyaz arka plan görsel gürültüyü sıfırlar.",
            vocabDomain: ["Duygular", "Eylemler", "Üçüncü Şahıs"],
            tags: ["Görsel Minimalizm", "Dış Ses", "Duygular"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 16548,
            title: "Word Party",
            genre: "İnteraktif Animasyon (Netflix)",
            accent: "American",
            pedagogicalValue: "İzleyiciye doğrudan soru sorar. Kategorik kelime grupları.",
            vocabDomain: ["Meyveler", "Taşıtlar", "Parti Malzemeleri"],
            tags: ["İnteraktif", "Kategorik Kelimeler", "Telaffuz"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 4134,
            title: "Blue's Clues",
            genre: "Live-Action / Animasyon Hibrit",
            accent: "American",
            pedagogicalValue: "Parentese konuşma tarzı. Fonetik haritalamayı kolaylaştırır.",
            vocabDomain: ["Bulmaca Çözme", "Renkler", "Şekiller"],
            tags: ["Bulmaca Çözme", "Tekrar", "Amerikan Aksanı"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 1098,
            title: "Kipper the Dog",
            genre: "Animasyon (İngiliz)",
            accent: "British",
            pedagogicalValue: "Sakin ve sessiz. Uzun duraksamalar işleme süresi sağlar.",
            vocabDomain: ["Günlük Maceralar", "Arkadaşlık", "Hayvanlar"],
            tags: ["İngiliz Aksanı", "Sakin Anlatım", "Günlük Maceralar"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 6848,
            title: "Sarah & Duck",
            genre: "Animasyon (BBC)",
            accent: "British RP",
            pedagogicalValue: "Roger Allam anlatıcılığı. Soru-cevap mekanizması öğretir.",
            vocabDomain: ["Problem Çözme", "Hayal Gücü", "Neden-Sonuç"],
            tags: ["Anlatıcı Destekli", "Problem Çözme", "Hayal Gücü"],
            speechRate: 1,
            clarity: 5
        }
    ],

    // =========================================================================
    // A2 - TEMEL (Hikaye Akışı, Sosyal Etkileşim)
    // =========================================================================
    A2: [
        {
            id: 7583,
            title: "Arthur",
            genre: "Animasyon",
            accent: "American",
            pedagogicalValue: "Gerçek hayat konuşmaları. Fikir belirtme ve öneri sunma kalıpları.",
            vocabDomain: ["Okul Hayatı", "Sosyal Beceriler", "Aile"],
            tags: ["Okul Hayatı", "Sosyal Beceriler", "Amerikan İngilizcesi"],
            speechRate: 2,
            clarity: 4
        },
        {
            id: 699,
            title: "Clifford the Big Red Dog",
            genre: "Animasyon",
            accent: "American",
            pedagogicalValue: "Sosyal dersler ve net diyaloglar. Orta tempoda diyalog akışı.",
            vocabDomain: ["Arkadaşlık", "Sorumluluk", "Kasaba Yaşamı"],
            tags: ["Eğitici", "Net Konuşma", "Sosyal Beceriler"],
            speechRate: 2,
            clarity: 4
        },
        {
            id: 672,
            title: "Phineas and Ferb",
            genre: "Animasyon Komedi",
            accent: "American",
            pedagogicalValue: "Formülize yapı. Tekrarlayan kalıp cümleler (catchphrases). Şarkılar.",
            vocabDomain: ["Yaratıcılık", "İnşa", "İcat"],
            tags: ["Müzikal", "Yaratıcılık", "Formülize Yapı"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 713,
            title: "SpongeBob SquarePants",
            genre: "Animasyon Komedi",
            accent: "American",
            pedagogicalValue: "Farklı konuşma hızları. Görsel mizah dili destekler. Hafif argo girişi.",
            vocabDomain: ["Okyanus", "İş Hayatı", "Arkadaşlık"],
            tags: ["Mizah", "Argo Giriş", "Karakter Odaklı"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 396,
            title: "Gravity Falls",
            genre: "Gizem / Macera",
            accent: "American",
            pedagogicalValue: "Gizem çözme ipuçları. Günlük metinleri (okuma-dinleme bağlantısı).",
            vocabDomain: ["Gizem", "Doğaüstü", "Macera"],
            tags: ["Gizem", "Macera", "Görsel İpuçları"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 555,
            title: "Avatar: The Last Airbender",
            genre: "Fantastik Aksiyon",
            accent: "American",
            pedagogicalValue: "Seri anlatım, karakter gelişimi. Soyut kavramlar görsel metaforlarla.",
            vocabDomain: ["Elementler", "Onur", "Kader", "Denge"],
            tags: ["Fantastik", "Seri Anlatım", "Soyut Kavramlar"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 18504,
            title: "The Magic School Bus",
            genre: "Eğitim / Bilim",
            accent: "American",
            pedagogicalValue: "CLIL (İçerik ve Dil Entegre Öğrenme). Bilim İngilizce ile öğrenilir.",
            vocabDomain: ["Bilim", "Biyoloji", "Fizik"],
            tags: ["Bilim", "Akademik Kelimeler", "CLIL"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 691,
            title: "Daniel Tiger's Neighborhood",
            genre: "Okul Öncesi Müzikal",
            accent: "American",
            pedagogicalValue: "Jingle tekniği. Duygusal zeka kelimeleri şarkılarla öğretilir.",
            vocabDomain: ["Duygusal Zeka", "Sabır", "Paylaşmak"],
            tags: ["Duygusal Zeka", "Şarkılar", "Telkin"],
            speechRate: 1,
            clarity: 5
        },
        {
            id: 706,
            title: "Teen Titans Go!",
            genre: "Süper Kahraman Komedisi",
            accent: "American",
            pedagogicalValue: "Hızlı tempo ama çok tekrar. Sosyal İngilizcenin gayri resmi yüzü.",
            vocabDomain: ["Süper Kahraman", "Argo", "Arkadaşlık"],
            tags: ["Süper Kahraman", "Diyalog Odaklı", "Modern Argo"],
            speechRate: 4,
            clarity: 3
        },
        {
            id: 563,
            title: "Star Wars: The Clone Wars",
            genre: "Bilim Kurgu / Aksiyon",
            accent: "Various",
            pedagogicalValue: "Emir kipleri ve askeri terminoloji. Bölüm başı özet (scaffolding).",
            vocabDomain: ["Askeri Terimler", "Bilim Kurgu", "Strateji"],
            tags: ["Bilim Kurgu", "Emir Kipleri", "Özet Kullanımı"],
            speechRate: 3,
            clarity: 4
        }
    ],

    // =========================================================================
    // B1 - EŞİK (Sitcom Altın Çağı, Standart Dil)
    // =========================================================================
    B1: [
        {
            id: 431,
            title: "Friends",
            genre: "Sitcom",
            accent: "American (New York)",
            pedagogicalValue: "En popüler İngilizce öğrenme kaynağı. Dil oyunları ve yanlış anlaşılmalar.",
            vocabDomain: ["Sosyal İngilizce", "İlişkiler", "Kariyer"],
            tags: ["Klasik Sitcom", "Sosyal İngilizce", "İlişkiler"],
            speechRate: 3,
            clarity: 5
        },
        {
            id: 66,
            title: "The Big Bang Theory",
            genre: "Sitcom",
            accent: "American",
            pedagogicalValue: "Sheldon sosyal normları açıklar. Bilimsel terimler + basit sosyal diyalog karışımı.",
            vocabDomain: ["Bilim", "Sosyal Normlar", "Geek Kültürü"],
            tags: ["Bilim", "Mizah", "Sosyal Normlar"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 194,
            title: "Modern Family",
            genre: "Mockumentary",
            accent: "American / Colombian",
            pedagogicalValue: "Röportaj bölümleri olayları özetler. Gloria'nın aksanı motive edici.",
            vocabDomain: ["Aile", "Çok Kültürlü", "Ev Hayatı"],
            tags: ["Aile", "Çok Kültürlü", "Röportaj Formatı"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 2790,
            title: "The Good Place",
            genre: "Fantastik Komedi",
            accent: "American",
            pedagogicalValue: "Konsept net açıklanır. Etik kelimeler günlük dille harmanlanır. Küfür filtreli.",
            vocabDomain: ["Etik", "Felsefe", "Ölümden Sonra"],
            tags: ["Etik", "Fantastik", "Net Konuşma"],
            speechRate: 3,
            clarity: 5
        },
        {
            id: 49,
            title: "Brooklyn Nine-Nine",
            genre: "Polisiye Sitcom",
            accent: "American",
            pedagogicalValue: "Resmi (Holt) vs gayri resmi (Jake) dil kontrastı aynı sahnede.",
            vocabDomain: ["Polisiye", "İşyeri", "Argo"],
            tags: ["Polisiye Komedi", "Resmi/Gayri Resmi", "İşyeri"],
            speechRate: 4,
            clarity: 4
        },
        {
            id: 171,
            title: "How I Met Your Mother",
            genre: "Sitcom",
            accent: "American",
            pedagogicalValue: "Geçmiş zaman yapıları. Lineer olmayan anlatım.",
            vocabDomain: ["Romantik", "Arkadaşlık", "Anlatı"],
            tags: ["Anlatı", "Romantik", "Arkadaşlık"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 539,
            title: "The IT Crowd",
            genre: "İngiliz Sitcom",
            accent: "British / Irish",
            pedagogicalValue: "İngiliz ve İrlandalı aksanlarına giriş. Teknoloji jargonu mizahi.",
            vocabDomain: ["Teknoloji", "Ofis Hayatı", "İngiliz Mizahı"],
            tags: ["İngiliz Komedisi", "Teknoloji", "Ofis Hayatı"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 568,
            title: "Malcolm in the Middle",
            genre: "Sitcom",
            accent: "American",
            pedagogicalValue: "Dördüncü duvar yıkılır. Malcolm izleyiciye açıklar (scaffolding).",
            vocabDomain: ["Aile", "Okul", "Ergenlik"],
            tags: ["Aile Kaosu", "Dördüncü Duvar", "Ergenlik"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 20400,
            title: "Anne with an E",
            genre: "Dönem Draması",
            accent: "Canadian",
            pedagogicalValue: "Anne edebi kelimeleri açıklar. Konuşma hızı yavaş.",
            vocabDomain: ["Edebi Kelimeler", "Tarih", "Hayal Gücü"],
            tags: ["Dönem Draması", "Edebi Kelimeler", "Kanada İngilizcesi"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 22127,
            title: "Atypical",
            genre: "Dramedi",
            accent: "American",
            pedagogicalValue: "Sam metaforları literal alır. Deyimlerin mecazi anlamları öğretilir.",
            vocabDomain: ["Deyimler", "Lise", "Aile"],
            tags: ["Dram", "Literal Konuşma", "Lise"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 41632,
            title: "Emily in Paris",
            genre: "Romantik Komedi",
            accent: "American / French-English",
            pedagogicalValue: "Kültürlerarası iletişim hataları. İş İngilizcesi.",
            vocabDomain: ["İş İngilizcesi", "Seyahat", "Moda"],
            tags: ["İş İngilizcesi", "Seyahat", "Kültür Çatışması"],
            speechRate: 3,
            clarity: 4
        }
    ],

    // =========================================================================
    // B2 - ÜST EŞİK (Karmaşıklık ve Uzmanlık)
    // =========================================================================
    B2: [
        {
            id: 3594,
            title: "The Crown",
            genre: "Tarihi Drama",
            accent: "British RP",
            pedagogicalValue: "En temiz dinleme kaynağı. Resmi dil and diplomatik nezaket kalıpları.",
            vocabDomain: ["Protokol", "Diplomasi", "Anayasa"],
            tags: ["İngiliz Tarihi", "Resmi Dil", "Received Pronunciation"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 172,
            title: "Suits",
            genre: "Hukuk Draması",
            accent: "American",
            pedagogicalValue: "İş İngilizcesi hazinesi. İkna teknikleri ve müzakere dili.",
            vocabDomain: ["Hukuk", "İş Dünyası", "Müzakere"],
            tags: ["Hukuk İngilizcesi", "İş Dünyası", "Müzakere"],
            speechRate: 4,
            clarity: 4
        },
        {
            id: 175,
            title: "House of Cards",
            genre: "Politik Drama",
            accent: "American",
            pedagogicalValue: "Frank'in monologları entrikaları açıklar. Politik terminoloji.",
            vocabDomain: ["Politika", "Yasama", "Lobicilik"],
            tags: ["Politika", "Monolog", "Amerikan İngilizcesi"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 67,
            title: "Grey's Anatomy",
            genre: "Tıbbi Drama",
            accent: "American",
            pedagogicalValue: "Tıbbi jargon görsel destekli. Duygusal ilişkisel diyaloglar.",
            vocabDomain: ["Tıp", "Hastane", "İlişkiler"],
            tags: ["Tıbbi İngilizce", "Romantik", "Dram"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 21845,
            title: "The Good Doctor",
            genre: "Tıbbi Drama",
            accent: "American",
            pedagogicalValue: "Tıbbi durumlar görselleştirilir. Teknik ve odaklı dil.",
            vocabDomain: ["Tıp", "Anatomi", "Teşhis"],
            tags: ["Tıp", "Görsel Anlatım", "Profesyonel İngilizce"],
            speechRate: 2,
            clarity: 5
        },
        {
            id: 251,
            title: "Downton Abbey",
            genre: "Dönem Draması",
            accent: "British (Various Classes)",
            pedagogicalValue: "Sınıf sisteminin dile yansıması. RP vs işçi sınıfı aksanları.",
            vocabDomain: ["Tarih", "Sınıf Sistemi", "Hizmetçi/Aristrokrat"],
            tags: ["Sınıf Sistemi", "Tarih", "Aksan Farkları"],
            speechRate: 2,
            clarity: 4
        },
        {
            id: 305,
            title: "Black Mirror",
            genre: "Bilim Kurgu Antolojisi",
            accent: "British / American",
            pedagogicalValue: "Teknoloji ve toplum üzerine spekülatif dil. Tartışma kelimeleri.",
            vocabDomain: ["Teknoloji", "Yapay Zeka", "Etik"],
            tags: ["Bilim Kurgu", "Teknoloji", "Antoloji"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 550,
            title: "Desperate Housewives",
            genre: "Gizem / Kara Komedi",
            accent: "American (Suburban)",
            pedagogicalValue: "Dış ses özetler yapar. Banliyö yaşamı ve suç/gizem karışımı.",
            vocabDomain: ["Banliyö Yaşamı", "Gizem", "Aile"],
            tags: ["Banliyö Yaşamı", "Gizem", "Anlatım"],
            speechRate: 3,
            clarity: 5
        },
        {
            id: 2993,
            title: "Stranger Things",
            genre: "Bilim Kurgu / Korku",
            accent: "American",
            pedagogicalValue: "80'ler argosu. Soyut konseptleri tanımlama (The Upside Down).",
            vocabDomain: ["80'ler Kültürü", "Bilim Kurgu", "Korku"],
            tags: ["80'ler Kültürü", "Bilim Kurgu", "Argo"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 323,
            title: "White Collar",
            genre: "Suç / Prosedürel",
            accent: "American",
            pedagogicalValue: "Sofistike, kibar ve entelektüel dil. Yüksek kültür kelimeleri.",
            vocabDomain: ["Sanat", "Finans", "Dolandırıcılık"],
            tags: ["Suç", "Sanat", "Sofistike Diyalog"],
            speechRate: 3,
            clarity: 4
        }
    ],

    // =========================================================================
    // C1 - İLERİ (Hız, Zeka ve İma)
    // =========================================================================
    C1: [
        {
            id: 335,
            title: "Sherlock",
            genre: "Suç / Gizem",
            accent: "British",
            pedagogicalValue: "C1 dinleme hızının zirvesi. Makineli tüfek gibi tümdengelim analizi.",
            vocabDomain: ["Çıkarım", "Suç", "Mantık"],
            tags: ["Hızlı Konuşma", "Çıkarım", "Modern İngiliz"],
            speechRate: 5,
            clarity: 4
        },
        {
            id: 525,
            title: "Gilmore Girls",
            genre: "Dramedi",
            accent: "American",
            pedagogicalValue: "Screwball komedi. Senaryo 2 kat uzun. Pop kültür referansları.",
            vocabDomain: ["Pop Kültür", "Aile", "Kasaba Yaşamı"],
            tags: ["Aşırı Hızlı", "Pop Kültür", "Aile"],
            speechRate: 5,
            clarity: 4
        },
        {
            id: 523,
            title: "The West Wing",
            genre: "Politik Drama",
            accent: "American",
            pedagogicalValue: "Sorkin diyalogları. Koridorda yürürken karmaşık felsefeler.",
            vocabDomain: ["Politika", "Retorik", "Hukuk"],
            tags: ["Politika", "Retorik", "Sorkin Diyalogları"],
            speechRate: 5,
            clarity: 4
        },
        {
            id: 23470,
            title: "Succession",
            genre: "Kurumsal Hiciv",
            accent: "American / British",
            pedagogicalValue: "Kurumsal jargon + ağır küfür. Overlapping dialogue. Kurumsal boş konuşma.",
            vocabDomain: ["Kurumsal", "Medya", "Aile"],
            tags: ["Kurumsal", "Hiciv", "Küfür"],
            speechRate: 5,
            clarity: 3
        },
        {
            id: 385,
            title: "Mad Men",
            genre: "Dönem Draması",
            accent: "American (1960s)",
            pedagogicalValue: "Alt metin (subtext) üzerine kurulu. Satır arasını okuma.",
            vocabDomain: ["Reklamcılık", "60'lar Kültürü", "İş"],
            tags: ["Reklamcılık", "Alt Metin", "60'lar Deyimleri"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 169,
            title: "Breaking Bad",
            genre: "Suç Draması",
            accent: "American (Various)",
            pedagogicalValue: "Code-switching. Walter farklı bağlamlarda farklı dil kullanır.",
            vocabDomain: ["Kimya", "Suç", "Aile"],
            tags: ["Suç", "Kod Değiştirme", "Kimya"],
            speechRate: 4,
            clarity: 4
        },
        {
            id: 618,
            title: "Better Call Saul",
            genre: "Hukuk / Suç",
            accent: "American",
            pedagogicalValue: "Kelime oyunlarıyla manipülasyon. Deyimlerin bükülmesi (idiom twisting).",
            vocabDomain: ["Hukuk", "İkna", "Dolandırıcılık"],
            tags: ["Hukuk", "İkna", "Dolandırıcı Argosu"],
            speechRate: 4,
            clarity: 4
        },
        {
            id: 118,
            title: "House M.D.",
            genre: "Tıbbi Gizem",
            accent: "American",
            pedagogicalValue: "Sarkazm ve ironiyi ayırt etmek. İleri düzey pragmatik yetkinlik.",
            vocabDomain: ["Tıp", "Sarkazm", "Teşhis"],
            tags: ["Sarkazm", "Tıp", "Sinik Zeka"],
            speechRate: 4,
            clarity: 4
        },
        {
            id: 161,
            title: "Dexter",
            genre: "Suç / Gerilim",
            accent: "American",
            pedagogicalValue: "Yalan dili vs gerçek iç ses. Adli tıp terimleri.",
            vocabDomain: ["Adli Tıp", "Suç", "Psikoloji"],
            tags: ["İç Ses", "Adli Tıp", "Suç"],
            speechRate: 3,
            clarity: 4
        },
        {
            id: 32,
            title: "Fargo",
            genre: "Kara Komedi / Suç",
            accent: "Minnesota",
            pedagogicalValue: "Minnesota aksanı. Tehdit ederken aşırı kibar kelimeler (kültürel ironi).",
            vocabDomain: ["Suç", "Bölgesel Kültür", "İroni"],
            tags: ["Bölgesel Aksan", "İroni", "Kara Komedi"],
            speechRate: 3,
            clarity: 3
        },
        {
            id: 82,
            title: "Game of Thrones",
            genre: "Fantastik Drama",
            accent: "British (Various)",
            pedagogicalValue: "Arkaik İngilizce yapıları. Geniş aksan yelpazesi. Politik stratejiler.",
            vocabDomain: ["Fantastik", "Politika", "Arkaik Dil"],
            tags: ["Fantastik", "Arkaik Dil", "Politika"],
            speechRate: 3,
            clarity: 4
        }
    ],

    // =========================================================================
    // C2 - USTALIK (Diyalektler, Sosyolektler, Gerçekçilik)
    // =========================================================================
    C2: [
        {
            id: 179,
            title: "The Wire",
            genre: "Suç Draması",
            accent: "Baltimore AAVE",
            pedagogicalValue: "Final Boss. AAVE, polis jargonu, liman işçisi şivesi. Hiçbir açıklama yok.",
            vocabDomain: ["Sokak Argosu", "Polis", "Politika"],
            tags: ["AAVE", "Baltimore Aksanı", "En Zor Seviye"],
            speechRate: 4,
            clarity: 2
        },
        {
            id: 33320,
            title: "Derry Girls",
            genre: "Sitcom",
            accent: "Northern Irish (Derry)",
            pedagogicalValue: "İnanılmaz hızlı. Yerel argo (wain, cracker, stall the ball).",
            vocabDomain: ["İrlanda Tarihi", "Ergenlik", "Aile"],
            tags: ["İrlanda Aksanı", "Hız", "Yerel Argo"],
            speechRate: 5,
            clarity: 2
        },
        {
            id: 1667,
            title: "The Thick of It",
            genre: "Politik Hiciv",
            accent: "British",
            pedagogicalValue: "Doğaçlama hissi. Sürekli sözü kesme. Yaratıcı küfür kombinasyonları.",
            vocabDomain: ["Politika", "Bürokrasi", "Küfür"],
            tags: ["İngiliz Politikası", "Yaratıcı Küfür", "Üst Üste Konuşma"],
            speechRate: 5,
            clarity: 2
        },
        {
            id: 14055,
            title: "Letterkenny",
            genre: "Sitcom",
            accent: "Rural Ontario (Canadian)",
            pedagogicalValue: "Dil oyunu dizisi. Rap gibi konuşma. Kırsal kültür ve fonetik ritim bilgisi gerekir.",
            vocabDomain: ["Kanada Kültürü", "Kırsal", "Kelime Oyunu"],
            tags: ["Kanada Argosu", "Kelime Oyunu", "Kırsal Diyalekt"],
            speechRate: 5,
            clarity: 2
        },
        {
            id: 269,
            title: "Peaky Blinders",
            genre: "Dönem Suç",
            accent: "1920s Birmingham (Brummie)",
            pedagogicalValue: "Tarihi diyalekt + bölgesel aksan. Tom Hardy mırıldanması.",
            vocabDomain: ["Tarih", "Suç", "Çingene Kültürü"],
            tags: ["Brummie Aksanı", "Tarihi", "Suç"],
            speechRate: 3,
            clarity: 2
        },
        {
            id: 5,
            title: "True Detective",
            genre: "Suç / Güney Gotiği",
            accent: "Louisiana / Southern",
            pedagogicalValue: "Mırıldanma faktörü çok yüksek. Felsefi monologlar.",
            vocabDomain: ["Felsefe", "Suç", "Güney Kültürü"],
            tags: ["Güney Aksanı", "Mırıldanma", "Felsefe"],
            speechRate: 2,
            clarity: 1
        },
        {
            id: 43819,
            title: "Top Boy",
            genre: "Suç Draması",
            accent: "Multicultural London English (MLE)",
            pedagogicalValue: "The Crown'un zıddı. Modern Londra sokak dili (innit, wagwan).",
            vocabDomain: ["Sokak Kültürü", "Suç", "Londra"],
            tags: ["MLE Diyalekti", "Londra Argosu", "Şehir"],
            speechRate: 4,
            clarity: 2
        },
        {
            id: 106,
            title: "Justified",
            genre: "Neo-Western",
            accent: "Appalachian / Kentucky",
            pedagogicalValue: "Karmaşık kelimeler ağır Güney aksanıyla. Belagat ve şive birlikte.",
            vocabDomain: ["Suç", "Güney Kültürü", "Hukuk"],
            tags: ["Appalachian", "Belagat", "Güney Şivesi"],
            speechRate: 3,
            clarity: 2
        },
        {
            id: 4030,
            title: "The Royle Family",
            genre: "Sitcom",
            accent: "Manchester",
            pedagogicalValue: "Gerçek İngilizce: yarı uykulu, mırıldanarak aile içi konuşma.",
            vocabDomain: ["Aile", "Günlük Hayat", "TV Kültürü"],
            tags: ["Manchester Aksanı", "Mırıldanma", "Realizm"],
            speechRate: 2,
            clarity: 1
        },
        {
            id: 746,
            title: "Shameless (UK)",
            genre: "Dramedi",
            accent: "Manchester Working Class",
            pedagogicalValue: "Amerikan versiyonundan çok zor. Council Estate sosyolekti.",
            vocabDomain: ["İşçi Sınıfı", "Aile", "Suç"],
            tags: ["Manchester", "İşçi Sınıfı", "Argo"],
            speechRate: 4,
            clarity: 2
        }
    ]
};

// Eski format ile uyumluluk için RECOMMENDATIONS
export const RECOMMENDATIONS = [
    {
        title: "Başlangıç (A1)",
        level: "A1",
        description: "Görsel destek ve fonetik farkındalık. Temel kelimeler, yavaş ve net konuşmalar.",
        items: SERIES_DATABASE.A1.map(s => ({ id: s.id, title: s.title }))
    },
    {
        title: "Temel (A2)",
        level: "A2",
        description: "Hikaye akışı ve sosyal etkileşim. Lineer anlatım, basit çatışmalar.",
        items: SERIES_DATABASE.A2.map(s => ({ id: s.id, title: s.title }))
    },
    {
        title: "Eşik (B1)",
        level: "B1",
        description: "Sitcom altın çağı. Öngörülebilir mekanlar, standart dil, net ses.",
        items: SERIES_DATABASE.B1.map(s => ({ id: s.id, title: s.title }))
    },
    {
        title: "Üst Eşik (B2)",
        level: "B2",
        description: "Karmaşıklık ve uzmanlık. Tıp, hukuk, politik dramalar.",
        items: SERIES_DATABASE.B2.map(s => ({ id: s.id, title: s.title }))
    },
    {
        title: "İleri (C1)",
        level: "C1",
        description: "Hız, zeka ve ima. Sarkazm, kelime oyunları, kültürel referanslar.",
        items: SERIES_DATABASE.C1.map(s => ({ id: s.id, title: s.title }))
    },
    {
        title: "Ustalık (C2)",
        level: "C2",
        description: "Diyalektler ve gerçekçilik. Ağır bölgesel aksanlar, mırıldanma, argo.",
        items: SERIES_DATABASE.C2.map(s => ({ id: s.id, title: s.title }))
    }
];

/**
 * Seviyeye göre dizi önerisi döndürür
 * @param {string} level - CEFR seviyesi (A1, A2, B1, B2, C1, C2)
 * @returns {Array} Dizi listesi
 */
export const getSeriesByLevel = (level) => {
    return SERIES_DATABASE[level] || [];
};

/**
 * Tüm seviyelerdeki dizileri düz liste olarak döndürür
 * @returns {Array} Tüm diziler
 */
export const getAllSeries = () => {
    return Object.values(SERIES_DATABASE).flat();
};

/**
 * Dizi ID'sine göre bilgi döndürür
 * @param {number} id - TVMaze ID
 * @returns {Object|null} Dizi bilgisi
 */
export const getSeriesById = (id) => {
    return getAllSeries().find(s => s.id === id) || null;
};

/**
 * Etikete göre dizi arar
 * @param {string} tag - Aranacak etiket
 * @returns {Array} Eşleşen diziler
 */
export const getSeriesByTag = (tag) => {
    return getAllSeries().filter(s => s.tags?.includes(tag));
};

/**
 * Aksana göre dizi filtreler
 * @param {string} accent - Aksan türü
 * @returns {Array} Eşleşen diziler
 */
export const getSeriesByAccent = (accent) => {
    return getAllSeries().filter(s => s.accent?.toLowerCase().includes(accent.toLowerCase()));
};
