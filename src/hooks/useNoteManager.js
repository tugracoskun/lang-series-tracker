import { toast } from 'sonner';

export const useNoteManager = (user, db, setDb, appMutations, logAction) => {

    const handleAddNote = async (note) => {
        let dbNote = null;
        if (user) {
            try {
                // Using appMutations for consistency if strictly needed, 
                // but direct service usage allows getting the returned object easier if mutation doesn't return it
                // appMutations.addNote.mutateAsync returns the result of mutationFn which is NotesService.addNote
                dbNote = await appMutations.addNote.mutateAsync(note);
            } catch (error) {
                console.error('Note save error:', error);
                // Continue to add locally even if sync fails? 
                // Original code did not stop.
            }
        }

        const newNote = dbNote ? {
            id: dbNote.id,
            ...note,
            createdAt: dbNote.created_at,
            updatedAt: dbNote.updated_at
        } : { ...note, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

        setDb(prev => ({
            ...prev,
            notes: [...prev.notes, newNote]
        }));
        logAction('ADD', `Yeni not eklendi: ${note.title}`);
        toast.success('Not eklendi');
    };

    const handleUpdateNote = async (id, updates) => {
        if (user) {
            try {
                await appMutations.updateNote.mutateAsync({ id, updates });
            } catch (error) {
                console.error('Note update error:', error);
                toast.error('Not güncellenemedi');
                return;
            }
        }

        const note = db.notes.find(n => n.id === id);
        const noteTitle = note?.title || "Not";

        setDb(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
        }));

        logAction('NOTE_UPDATE', `${noteTitle} güncellendi.`);
        toast.success('Not güncellendi');
    };

    const handleDeleteNote = async (id) => {
        if (user) {
            try {
                await appMutations.deleteNote.mutateAsync(id);
            } catch (error) {
                console.error('Note delete error:', error);
                // Original code just logs error but continues to delete locally?
                // "Series delete error" in App.jsx showed a return.
                // handle Series delete had return. 
                // handle delete Note in App.jsx (line 346) :
                // await NotesService.deleteNote(id); catch error log.
                // Then setDb works. So it deleted locally even if remote failed.
            }
        }

        setDb(prev => ({
            ...prev,
            notes: prev.notes.filter(n => n.id !== id)
        }));
        logAction('DELETE', 'Bir not silindi');
        toast.success('Not silindi');
    };

    return {
        handleAddNote,
        handleUpdateNote,
        handleDeleteNote
    };
};
