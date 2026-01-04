import { toast } from 'sonner';

export const useWatchlistManager = (user, db, setDb, appMutations, logAction) => {

    const handleAddToWatchlist = async (show) => {
        if (db.watchlist?.some(s => s.id === show.id) || db.series.some(s => s.id === show.id)) {
            toast.info("Bu dizi zaten listenizde veya takibinizde.");
            return;
        }

        if (user) {
            try {
                await appMutations.addToWatchlist.mutateAsync(show);
            } catch (error) {
                console.error('Watchlist add error:', error);
                toast.error('İzleme listesine eklenirken hata oluştu');
            }
        }

        const newWatchlistItem = { id: show.id, name: show.name, image: show.image, addedAt: new Date().toISOString() };
        setDb(prev => ({ ...prev, watchlist: [newWatchlistItem, ...prev.watchlist || []] }));
        logAction('ADD_WATCHLIST', `${show.name} izleme listesine eklendi.`);
        toast.success('İzleme listesine eklendi');
    };

    const removeFromWatchlist = async (showId) => {
        const show = db.watchlist.find(s => s.id === showId);
        const showName = show?.name || "Dizi";

        if (user) {
            try {
                await appMutations.removeFromWatchlist.mutateAsync(showId);
            } catch (error) {
                console.error('Watchlist remove error:', error);
                toast.error('Listeden çıkarılamadı');
                return;
            }
        }
        setDb(prev => ({ ...prev, watchlist: (prev.watchlist || []).filter(s => s.id !== showId) }));
        logAction('WATCHLIST_REMOVE', `${showName} izleme listesinden çıkarıldı.`);
        toast.info('Listeden çıkarıldı');
    };

    return {
        handleAddToWatchlist,
        removeFromWatchlist
    };
};
