import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, User, Globe, RotateCcw, Bell, Palette, Shield, Database,
    ChevronRight, Check, AlertTriangle, Trash2, Download, Upload,
    Moon, Sun, Monitor, Link2, Unlink, ExternalLink, Tv
} from 'lucide-react';
import { ROTATION_STRATEGIES, getLanguageConfig, setLanguageConfig } from '../utils/schedule';
import { SUPPORTED_LANGUAGES } from '../services/SubtitleService';
import { ProfileService, ActivityService, isSupabaseConfigured } from '../services/SupabaseService';
import { TraktService, getTraktConnectionStatus } from '../services/TraktService';
import { toast } from 'sonner';

import { useAppStore } from '../store/useAppStore';

const SettingsPage = () => {
    const {
        user, userName,
        rotationStrategy, setRotationStrategy
    } = useAppStore();
    const [activeSection, setActiveSection] = useState('profile');
    const [langConfig, setLangConfig] = useState(getLanguageConfig());
    const [notifications, setNotifications] = useState({
        dailyReminder: true,
        weeklyReport: false,
        achievements: true
    });
    const [theme, setTheme] = useState('dark');
    const [traktStatus, setTraktStatus] = useState(getTraktConnectionStatus());
    const [traktProfile, setTraktProfile] = useState(null);
    const [traktLoading, setTraktLoading] = useState(false);

    // Trakt profil bilgilerini yükle
    useEffect(() => {
        if (traktStatus.isConnected) {
            TraktService.getProfile()
                .then(setTraktProfile)
                .catch(console.error);
        }
    }, [traktStatus.isConnected]);

    // Email onay durumu
    const isEmailConfirmed = user?.confirmed_at || user?.email_confirmed_at;

    const handleLanguageChange = async (field, value) => {
        const newConfig = { ...langConfig, [field]: value };
        setLangConfig(newConfig);
        setLanguageConfig({
            nativeLanguage: newConfig.l1Code,
            targetLanguage: newConfig.l2Code
        });

        if (user) {
            try {
                await ProfileService.upsertProfile(user.id, {
                    language_config: {
                        nativeLanguage: newConfig.l1Code,
                        targetLanguage: newConfig.l2Code
                    }
                });
                await ActivityService.logActivity(user.id, 'SETTINGS', 'Dil ayarları güncellendi.');
            } catch (error) {
                console.error('Settings sync error:', error);
            }
        }

        toast.success('Dil ayarları güncellendi');
    };

    const handleExportData = () => {
        const data = localStorage.getItem('langTracker_v4_seasons');
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `langtracker_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Veriler indirildi');
        }
    };

    const handleImportData = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                localStorage.setItem('langTracker_v4_seasons', JSON.stringify(data));
                toast.success('Veriler içe aktarıldı. Sayfa yenileniyor...');
                setTimeout(() => globalThis.location.reload(), 2000);
            } catch (error) {
                toast.error('Geçersiz dosya formatı');
                console.error('Import error:', error);
            }
        }
    };

    const handleClearData = () => {
        if (confirm('Tüm verileriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
            localStorage.clear();
            toast.success('Veriler silindi. Sayfa yenileniyor...');
            setTimeout(() => globalThis.location.reload(), 2000);
        }
    };

    const handleRotationUpdate = async (strategyId) => {
        setRotationStrategy(strategyId);

        if (user) {
            try {
                await ProfileService.upsertProfile(user.id, {
                    rotation_strategy: strategyId
                });
                await ActivityService.logActivity(user.id, 'SETTINGS', 'Varsayılan rotasyon stratejisi güncellendi.');
            } catch (error) {
                console.error('Rotation strategy sync error:', error);
            }
        }
    };

    const sections = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'languages', label: 'Dil Ayarları', icon: Globe },
        { id: 'learning', label: 'Öğrenme', icon: RotateCcw },
        { id: 'integrations', label: 'Entegrasyonlar', icon: Link2 },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'appearance', label: 'Görünüm', icon: Palette },
        { id: 'data', label: 'Veri Yönetimi', icon: Database },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={20} className="text-indigo-400" />
                            Profil Bilgileri
                        </h2>

                        {/* User Info Card */}
                        <div className="glass-panel rounded-3xl p-6 border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${user ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                                    }`}>
                                    {userName?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{userName || 'Misafir'}</h3>
                                    {user ? (
                                        <p className="text-sm text-slate-400">{user.email}</p>
                                    ) : (
                                        <p className="text-sm text-amber-400">Giriş yapılmadı</p>
                                    )}
                                </div>
                            </div>

                            {/* Email Confirmation Status */}
                            {user && (
                                <div className={`flex items-center gap-3 p-4 rounded-xl ${isEmailConfirmed
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-amber-500/10 border border-amber-500/20'
                                    }`}>
                                    {isEmailConfirmed ? (
                                        <>
                                            <Check size={20} className="text-emerald-400" />
                                            <div>
                                                <p className="text-emerald-300 font-medium">Email Onaylandı</p>
                                                <p className="text-xs text-emerald-400/70">
                                                    {new Date(isEmailConfirmed).toLocaleDateString('tr-TR')} tarihinde onaylandı
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={20} className="text-amber-400" />
                                            <div>
                                                <p className="text-amber-300 font-medium">Email Onaylanmadı</p>
                                                <p className="text-xs text-amber-400/70">
                                                    Lütfen email'inizi kontrol edin
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Account Info */}
                            {user && (
                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-slate-400">Hesap ID</span>
                                        <span className="text-slate-300 font-mono text-xs">{user.id?.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-slate-400">Kayıt Tarihi</span>
                                        <span className="text-slate-300">
                                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-400">Son Giriş</span>
                                        <span className="text-slate-300">
                                            {user.last_sign_in_at
                                                ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR')
                                                : '-'
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Supabase Status */}
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${isSupabaseConfigured()
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-slate-500/10 border border-slate-500/20'
                            }`}>
                            <Shield size={20} className={isSupabaseConfigured() ? 'text-emerald-400' : 'text-slate-400'} />
                            <div>
                                <p className={isSupabaseConfigured() ? 'text-emerald-300 font-medium' : 'text-slate-300 font-medium'}>
                                    {isSupabaseConfigured() ? 'Bulut Senkronizasyonu Aktif' : 'Yerel Mod'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {isSupabaseConfigured()
                                        ? 'Verileriniz güvenle bulutta saklanıyor'
                                        : 'Veriler sadece bu cihazda saklanıyor'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'languages':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-indigo-400" />
                            Dil Ayarları
                        </h2>

                        {/* Native Language */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <label htmlFor="l1-select" className="block text-sm font-medium text-slate-400 mb-3">
                                Ana Diliniz (L1)
                            </label>
                            <select
                                id="l1-select"
                                value={langConfig.l1Code}
                                onChange={(e) => handleLanguageChange('l1Code', e.target.value)}
                                className="w-full glass-input rounded-xl px-4 py-3 text-white focus:outline-none"
                            >
                                {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name} ({lang.nativeName})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                                Altyazılarda kullanılacak ana diliniz
                            </p>
                        </div>

                        {/* Target Language */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <label htmlFor="l2-select" className="block text-sm font-medium text-slate-400 mb-3">
                                Öğrenmek İstediğiniz Dil (L2)
                            </label>
                            <select
                                id="l2-select"
                                value={langConfig.l2Code}
                                onChange={(e) => handleLanguageChange('l2Code', e.target.value)}
                                className="w-full glass-input rounded-xl px-4 py-3 text-white focus:outline-none"
                            >
                                {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name} ({lang.nativeName})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                                Dizileri izlerken öğrenmek istediğiniz dil
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                            <p className="text-slate-400 text-sm mb-2">Öğrenme Yönünüz</p>
                            <div className="flex items-center justify-center gap-4 text-lg">
                                <span className="text-white font-bold">
                                    {SUPPORTED_LANGUAGES[langConfig.l1Code]?.flag} {SUPPORTED_LANGUAGES[langConfig.l1Code]?.name}
                                </span>
                                <span className="text-indigo-400">→</span>
                                <span className="text-white font-bold">
                                    {SUPPORTED_LANGUAGES[langConfig.l2Code]?.flag} {SUPPORTED_LANGUAGES[langConfig.l2Code]?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'learning':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <RotateCcw size={20} className="text-indigo-400" />
                            Öğrenme Ayarları
                        </h2>

                        {/* Default Rotation Strategy */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="block text-sm font-medium text-slate-400 mb-3">
                                Varsayılan Altyazı Rotasyonu
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Yeni eklenen diziler için kullanılacak varsayılan strateji. Her dizi için ayrıca değiştirilebilir.
                            </p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {Object.values(ROTATION_STRATEGIES).map(strategy => (
                                    <button
                                        key={strategy.id}
                                        onClick={() => {
                                            handleRotationUpdate(strategy.id);
                                            toast.success('Varsayılan strateji güncellendi');
                                        }}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${rotationStrategy === strategy.id
                                            ? 'bg-indigo-500/20 border-2 border-indigo-500'
                                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className={`font-bold ${rotationStrategy === strategy.id ? 'text-indigo-300' : 'text-white'}`}>
                                                    {strategy.name}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {strategy.description}
                                                </div>
                                            </div>
                                            {rotationStrategy === strategy.id && (
                                                <Check size={20} className="text-indigo-400" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bell size={20} className="text-indigo-400" />
                            Bildirim Ayarları
                        </h2>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                            {[
                                { key: 'dailyReminder', label: 'Günlük Hatırlatma', desc: 'Her gün izleme hatırlatması al' },
                                { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Haftalık ilerleme özeti al' },
                                { key: 'achievements', label: 'Başarılar', desc: 'Yeni başarı kazandığında bildirim al' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-white font-medium">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-indigo-500' : 'bg-slate-700'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'left-7' : 'left-1'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-amber-400 text-sm">
                                🚧 Bildirimler yakında aktif olacak!
                            </p>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Palette size={20} className="text-indigo-400" />
                            Görünüm
                        </h2>

                        {/* Theme */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="block text-sm font-medium text-slate-400 mb-3">
                                Tema
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'dark', label: 'Karanlık', icon: Moon },
                                    { id: 'light', label: 'Aydınlık', icon: Sun },
                                    { id: 'system', label: 'Sistem', icon: Monitor },
                                ].map(t => {
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${theme === t.id
                                                ? 'bg-indigo-500/20 border-2 border-indigo-500'
                                                : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                                }`}
                                        >
                                            <Icon size={24} className={theme === t.id ? 'text-indigo-400' : 'text-slate-400'} />
                                            <span className={theme === t.id ? 'text-indigo-300' : 'text-slate-400'} />
                                            <span className={theme === t.id ? 'text-indigo-300' : 'text-slate-400'}>
                                                {t.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-amber-400 text-sm">
                                🚧 Açık tema yakında eklenecek! Şu an sadece karanlık tema destekleniyor.
                            </p>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Database size={20} className="text-indigo-400" />
                            Veri Yönetimi
                        </h2>

                        {/* Export */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Verileri Dışa Aktar</h3>
                                    <p className="text-xs text-slate-500">Tüm verilerinizi JSON olarak indirin</p>
                                </div>
                                <button
                                    onClick={handleExportData}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors"
                                >
                                    <Download size={18} />
                                    İndir
                                </button>
                            </div>
                        </div>

                        {/* Import */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Verileri İçe Aktar</h3>
                                    <p className="text-xs text-slate-500">Yedekten verileri geri yükleyin</p>
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors cursor-pointer">
                                    <Upload size={18} />
                                    Yükle
                                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Clear Data */}
                        <div className="bg-rose-500/10 rounded-2xl p-6 border border-rose-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-rose-300 font-medium">Tüm Verileri Sil</h3>
                                    <p className="text-xs text-rose-400/70">Bu işlem geri alınamaz!</p>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Link2 size={20} className="text-indigo-400" />
                            Entegrasyonlar
                        </h2>

                        {/* Trakt.tv Integration */}
                        <div className="glass-panel rounded-2xl p-6 border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#ED1C24] flex items-center justify-center">
                                    <Tv size={28} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">Trakt.tv</h3>
                                    <p className="text-sm text-slate-400">İzleme geçmişinizi senkronize edin</p>
                                </div>
                                {traktStatus.isConnected && traktProfile && (
                                    <span className="liquid-badge liquid-badge-emerald">
                                        Bağlı
                                    </span>
                                )}
                            </div>

                            {!traktStatus.isConfigured ? (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-amber-400 mt-0.5" />
                                        <div>
                                            <p className="text-amber-300 font-medium">API Anahtarları Gerekli</p>
                                            <p className="text-xs text-amber-400/70 mt-1">
                                                Trakt.tv entegrasyonu için <code className="bg-black/30 px-1 rounded">VITE_TRAKT_CLIENT_ID</code> ve{' '}
                                                <code className="bg-black/30 px-1 rounded">VITE_TRAKT_CLIENT_SECRET</code> environment variables'ları gerekli.
                                            </p>
                                            <a
                                                href="https://trakt.tv/oauth/applications/new"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs mt-2"
                                            >
                                                Trakt.tv'de uygulama oluştur <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : traktStatus.isConnected ? (
                                <div className="space-y-4">
                                    {/* Connected Profile */}
                                    {traktProfile && (
                                        <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            {traktProfile.images?.avatar?.full ? (
                                                <img
                                                    src={traktProfile.images.avatar.full}
                                                    alt={traktProfile.username}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[#ED1C24] flex items-center justify-center text-white font-bold">
                                                    {traktProfile.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-white font-medium">@{traktProfile.username}</p>
                                                <p className="text-xs text-emerald-400">Hesap bağlı</p>
                                            </div>
                                            <a
                                                href={`https://trakt.tv/users/${traktProfile.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    )}

                                    {/* Disconnect Button */}
                                    <button
                                        onClick={() => {
                                            TraktService.disconnect();
                                            setTraktStatus(getTraktConnectionStatus());
                                            setTraktProfile(null);
                                            toast.success('Trakt.tv bağlantısı kesildi');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl transition-colors"
                                    >
                                        <Unlink size={18} />
                                        Bağlantıyı Kes
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-slate-400 text-sm">
                                        Trakt.tv hesabınızı bağlayarak izlediğiniz bölümleri otomatik olarak işaretleyin.
                                        Bölüm izlendi olarak işaretlendiğinde Trakt.tv'ye de kaydedilir.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setTraktLoading(true);
                                            window.location.href = TraktService.getAuthUrl();
                                        }}
                                        disabled={traktLoading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ED1C24] hover:bg-[#d91920] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <Link2 size={18} />
                                        {traktLoading ? 'Yönlendiriliyor...' : 'Trakt.tv ile Bağlan'}
                                    </button>
                                </div>
                            )}

                            {/* Features */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h4 className="text-sm font-medium text-slate-400 mb-3">Özellikler</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <Check size={14} className="text-emerald-400" />
                                        Bölüm izlendiğinde otomatik scrobble
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <Check size={14} className="text-emerald-400" />
                                        İzleme geçmişi doğrulama
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <Check size={14} className="text-emerald-400" />
                                        Çapraz platform senkronizasyon
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Settings size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400">Uygulama tercihlerinizi yönetin</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <nav className="glass-panel rounded-3xl border-white/10 p-2 space-y-1 sticky top-4">
                        {sections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{section.label}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-panel rounded-3xl border-white/10 p-8"
                    >
                        {renderSection()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
