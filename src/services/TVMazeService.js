const BASE_URL = 'https://api.tvmaze.com';

export const TVMazeService = {
    async searchShows(query) {
        const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        return data.map(item => item.show);
    },

    async getShowDetails(id) {
        const res = await fetch(`${BASE_URL}/shows/${id}?embed=episodes`);
        return await res.json();
    }
};
