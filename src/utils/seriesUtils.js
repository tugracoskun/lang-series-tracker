export const estimateDifficulty = (show) => {
    const genres = show.genres || [];
    if (genres.includes('Children') || genres.includes('Anime') || genres.includes('Animation')) return { id: 'EASY', level: 'Elementary', color: 'bg-emerald-500', text: 'A1-A2' };
    if (genres.includes('Family') || genres.includes('Comedy') || genres.includes('Music') || genres.includes('Reality')) return { id: 'MEDIUM', level: 'Intermediate', color: 'bg-indigo-500', text: 'B1-B2' };
    if (genres.includes('Drama') || genres.includes('Romance') || genres.includes('Adventure')) return { id: 'MEDIUM', level: 'Upper Int.', color: 'bg-purple-500', text: 'B2-C1' };
    if (genres.includes('Science-Fiction') || genres.includes('Legal') || genres.includes('Medical') || genres.includes('Thriller') || genres.includes('Crime') || genres.includes('Mystery')) return { id: 'HARD', level: 'Advanced', color: 'bg-rose-500', text: 'C1-C2' };
    return { id: 'MEDIUM', level: 'Standard', color: 'bg-slate-500', text: 'Genel' };
};
