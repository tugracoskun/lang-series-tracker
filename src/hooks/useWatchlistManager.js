import { toast } from 'sonner';

export const useWatchlistManager = (user, db, setDb, appMutations, logAction) => {

    const handleAddToWatchlist = async (show) => {
        const showIdStr = show.id?.toString();

        // Aktif olarak izlenen dizilerde mi kontrol et
        const isActivelyWatching = db.series.some(s => s.id?.toString() === showIdStr);
        if (isActivelyWatching) {
            toast.info("Bu diziyi zaten izliyorsun!");
            return;
        }

        // Watchlist'te zaten var mı kontrol et
        const isInWatchlist = db.watchlist?.some(s => s.id?.toString() === showIdStr);
        if (isInWatchlist) {
            toast.info("Bu dizi zaten izleme listende.");
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
