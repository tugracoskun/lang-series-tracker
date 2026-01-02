export const METHODS = ['EN', 'TR', null]; // The rotation cycle: EN -> TR -> None

export const generateSeasonSchedule = (allEpisodes) => {
    // 1. Group by Season
    const seasonsMap = {};
    allEpisodes.forEach(ep => {
        if (!seasonsMap[ep.season]) seasonsMap[ep.season] = [];
        seasonsMap[ep.season].push(ep);
    });

    const schedule = [];

    // Sort seasons properly
    Object.keys(seasonsMap).sort((a, b) => parseInt(a) - parseInt(b)).forEach(seasonNum => {
        const episodes = seasonsMap[seasonNum];
        const tours = [];

        // Create 3 Tours for this season
        for (let t = 1; t <= 3; t++) {
            const weeks = [];
            let epCursor = 0;
            let weekCounter = 1;

            while (epCursor < episodes.length) {
                const days = [];
                // Fill Mon-Sat
                for (let d = 0; d < 6; d++) {
                    if (epCursor < episodes.length) {
                        const ep = episodes[epCursor];
                        // Rotation Logic: (EpIndex + TourIndex - 1) % 3
                        const methodIndex = (epCursor + (t - 1)) % 3;
                        const method = METHODS[methodIndex];

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
                            summary: ep.summary
                        });
                        epCursor++;
                    }
                }
                // Add Sunday (Rest)
                days.push({ d: "Pazar", s: "Dinlenme & Analiz" });

                weeks.push({ week: weekCounter, days });
                weekCounter++;
            }

            tours.push({
                id: t,
                title: `${t}. Tur`,
                pattern: t === 1 ? "EN → TR → Altyazısız" : t === 2 ? "TR → Altyazısız → EN" : "Altyazısız → EN → TR",
                weeks
            });
        }
        schedule.push({ season: parseInt(seasonNum), tours });
    });

    return schedule;
};
