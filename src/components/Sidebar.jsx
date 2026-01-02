import { LayoutDashboard, BookOpen, Settings, User, X, Database, Zap } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onNavigate, activeView }) => {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-[#0B0F17]/95 border-l border-white/5 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-white">Menü</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-2xl mb-6 border border-indigo-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="text-white font-bold">Kullanıcı</div>
                                <div className="text-xs text-indigo-300">Seviye: Başlangıç</div>
                            </div>
                        </div>
                    </div>

                    <MenuLink
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <MenuLink
                        icon={<BookOpen size={20} />}
                        label="Kelimelerim"
                        badge="Yeni"
                        active={activeView === 'vocab'}
                        onClick={() => onNavigate('vocab')}
                    />
                    <MenuLink
                        icon={<Zap size={20} />} // Changed icon to Zap for Flashcards
                        label="Flashcards"
                        active={activeView === 'flashcards'}
                        onClick={() => onNavigate('flashcards')}
                    />
                    <MenuLink
                        icon={<Database size={20} />}
                        label="Veri Yöneticisi"
                        badge="Yakında"
                        active={activeView === 'data-manager'}
                        onClick={() => onNavigate('data-manager')}
                    />
                    <MenuLink
                        icon={<Settings size={20} />}
                        label="Ayarlar"
                        active={activeView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />

                </div>

                <div className="p-6 border-t border-white/5 text-center text-xs text-slate-500 font-mono">
                    LangTracker v2.0<br />
                    Season Mastery Protocol
                </div>
            </div>
        </>
    );
};

const MenuLink = ({ icon, label, badge, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${active ? 'bg-white/5 text-white border border-white/5' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
        <div className="flex items-center gap-4">
            <span className={active ? "text-indigo-400" : "text-slate-500 group-hover:text-white transition-colors"}>{icon}</span>
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5">
                {badge}
            </span>
        )}
    </button>
);

export default Sidebar;
