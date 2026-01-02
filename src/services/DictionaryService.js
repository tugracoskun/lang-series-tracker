export const DictionaryService = {
    async lookup(word) {
        try {
            // Using MyMemory Translation API for EN -> TR
            // This is a free endpoint for reasonable usage limits.
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`);

            if (!res.ok) throw new Error("Translation failed");
            const data = await res.json();

            // MyMemory returns matches. responseData.translatedText is usually the best match.
            // basic validation
            if (data.responseStatus === 200 && data.responseData.translatedText) {
                // Sometimes it returns the same word if not found.
                // We can filter that if needed, but usually it's fine.
                return data.responseData.translatedText;
            }
            return null;
        } catch (e) {
            console.error("Translation lookup failed", e);
            return null;
        }
    }
};
