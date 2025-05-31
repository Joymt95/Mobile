document.addEventListener('DOMContentLoaded', () => {
    const tmdbApiKey = "2e211dfda888f7cc55ce433d743f9bc3"; // <-- IMPORTANT: REPLACE WITH YOUR TMDB API KEY
    const tmdbBaseUrl = "https://api.themoviedb.org/3";
    const imageBaseUrl = "https://image.tmdb.org/t/p/";
    const placeholderPoster = 'https://via.placeholder.com/500x750.png?text=No+Poster';
    const placeholderScreenshot = 'https://via.placeholder.com/300x170.png?text=No+Screenshot';

    // ---------------------------------------------------------------------------
    //  MANUALLY ADD YOUR MOVIES HERE
    // ---------------------------------------------------------------------------
    //  tmdbId: Get this from The Movie Database (e.g., search on tmdb.org)
    //  playLink: Your direct link to play/stream the movie (e.g., a URL to an .mp4, a streaming service, or a page with an embedded player)
    //  downloadLink: Your direct link to download the movie (e.g., a direct .mp4 or .mkv link)
    //  screenshots: An array of URLs for movie screenshots
    // ---------------------------------------------------------------------------
    const myMovies = [
        {
            tmdbId: "1064213", // Example: Avengers: Endgame
            playLink: "https://pub-a0f37e1eec644f138ef306aeed62a9cd.r2.dev/Hit-3.2025.1080p.HEVC.WEB-DL.Hindi.2.0-Telugu.2.0.x265-HDHub4u.Ms.mkv", // Example: direct MP4 link
            downloadLink: "https://pub-a0f37e1eec644f138ef306aeed62a9cd.r2.dev/Hit-3.2025.1080p.HEVC.WEB-DL.Hindi.2.0-Telugu.2.0.x265-HDHub4u.Ms.mkv", // Example download link
            screenshots: [
                "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                "https://image.tmdb.org/t/p/w500/7RyHsO4yDXhBv1zUU3mTpHeQ0d5.jpg"
            ]
        },
        {
            tmdbId: "671", // Example: Harry Potter and the Philosopher's Stone
            playLink: "https://your-streaming-service.com/play/harry-potter-1", // Fictional streaming link
            // downloadLink: "", // Optional: leave empty or omit if no link
            screenshots: [
                "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg"
            ]
        },
        {
            tmdbId: "155", // Example: The Dark Knight
            playLink: "https://your-movie-site.com/player?id=tdk", // Fictional player page
            downloadLink: "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4", // Example download link
            screenshots: []
        },
        {
            tmdbId: "an-invalid-id-test",
            playLink: "http://example.com/play/invalid",
            downloadLink: "http://example.com/download/invalid"
        }
        // Add more movies here
    ];
    // ---------------------------------------------------------------------------

    const movieResultsContainer = document.getElementById('movie-results');
    const movieDetailsContainer = document.getElementById('movie-details');
    const detailsContent = document.getElementById('details-content');
    const backButton = document.getElementById('backButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessageDiv = document.getElementById('errorMessage');
    const resultsTitle = document.getElementById('results-title'); // Ensure this exists in your HTML

    if (tmdbApiKey === "YOUR_TMDB_API_KEY" || !tmdbApiKey) {
        showError("TMDB API Key is missing. Please add your TMDB API key to script.js.");
        if(resultsTitle) resultsTitle.textContent = "Configuration Error";
        return;
    }

    backButton.addEventListener('click', showResultsView);

    loadMyMovies();

    async function loadMyMovies() {
        showLoading(true);
        movieResultsContainer.innerHTML = '';
        if (myMovies.length === 0) {
            if(resultsTitle) resultsTitle.textContent = "No movies in your collection yet.";
            showLoading(false);
            return;
        }
        if(resultsTitle) resultsTitle.textContent = "Available Movies"; // Set default title

        let moviesProcessed = 0;
        for (const manualMovieData of myMovies) {
            try {
                const tmdbData = await fetchTmdbDetails(manualMovieData.tmdbId);
                if (tmdbData) {
                    const fullMovieData = { ...tmdbData, ...manualMovieData };
                    displayMovieCard(fullMovieData);
                } else {
                    console.warn(`Could not fetch TMDB details for ID: ${manualMovieData.tmdbId}. Displaying with manual data only.`);
                    displayMovieCard(manualMovieData, true);
                }
            } catch (error) {
                console.error(`Error processing movie ID ${manualMovieData.tmdbId}:`, error);
                displayErrorCard(manualMovieData.tmdbId);
            } finally {
                moviesProcessed++;
                if (moviesProcessed === myMovies.length) {
                    showLoading(false);
                }
            }
        }
        if (movieResultsContainer.innerHTML === '') {
            if(resultsTitle) resultsTitle.textContent = "Could not load any movie details.";
        }
    }

    async function fetchTmdbDetails(tmdbId) {
        hideError();
        const url = `${tmdbBaseUrl}/movie/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=credits,videos`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ status_message: "Unknown API error" }));
                console.error(`TMDB API error for ID ${tmdbId}: ${errorData.status_message || response.status}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Network or parsing error fetching TMDB details for ID ${tmdbId}:`, error);
            return null;
        }
    }

    function displayMovieCard(movie, tmdbFetchFailed = false) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.dataset.tmdbId = movie.tmdbId;

        const title = tmdbFetchFailed ? `Movie (ID: ${movie.tmdbId})` : movie.title;
        const posterPath = tmdbFetchFailed || !movie.poster_path ? placeholderPoster : `${imageBaseUrl}w500${movie.poster_path}`;
        const releaseYear = tmdbFetchFailed || !movie.release_date ? 'N/A' : movie.release_date.substring(0, 4);
        const rating = tmdbFetchFailed || !movie.vote_average ? 'N/A' : `${movie.vote_average.toFixed(1)} ⭐`;

        movieCard.innerHTML = `
            <img class="poster" src="${posterPath}" alt="${title} Poster">
            <div class="card-content">
                <div>
                    <h3>${title}</h3>
                    <p>Released: ${releaseYear}</p>
                    <p class="rating">Rating: ${rating}</p>
                </div>
                <div class="action-buttons">
                    ${movie.playLink ? `<a href="${movie.playLink}" target="_blank" rel="noopener noreferrer" class="btn-play">Play</a>` : ''}
                    ${movie.downloadLink ? `<a href="${movie.downloadLink}" target="_blank" rel="noopener noreferrer" class="btn-download" download>Download</a>` : ''}
                </div>
            </div>
        `;
        movieCard.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) return; // Prevent detail view if link or its child is clicked
            showMovieDetails(movie.tmdbId);
        });
        movieResultsContainer.appendChild(movieCard);
    }

    function displayErrorCard(failedId) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card', 'error-card');
        movieCard.innerHTML = `
            <img class="poster" src="${placeholderPoster}" alt="Error Poster">
            <div class="card-content">
                <h3>Error Loading Movie</h3>
                <p>ID: ${failedId}</p>
                <p>Could not fetch details from TMDB.</p>
            </div>`;
        movieResultsContainer.appendChild(movieCard);
    }

    async function showMovieDetails(tmdbId) {
        showLoading(true);
        const manualEntry = myMovies.find(m => m.tmdbId === tmdbId);
        if (!manualEntry) {
            showError("Movie data not found in your collection.");
            showLoading(false);
            return;
        }

        let tmdbData = await fetchTmdbDetails(tmdbId);
        if (!tmdbData) {
            console.warn(`TMDB details for ${tmdbId} failed on details view. Using manual data.`);
            tmdbData = { title: `Movie (ID: ${tmdbId})`, overview: "Details from TMDB could not be loaded." };
        }

        const movie = { ...tmdbData, ...manualEntry };

        const posterPath = movie.poster_path ? `${imageBaseUrl}w780${movie.poster_path}` : placeholderPoster;
        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
        const genres = movie.genres ? movie.genres.map(genre => `<span>${genre.name}</span>`).join(' ') : 'N/A';
        const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';

        let castList = 'N/A';
        if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
            castList = movie.credits.cast.slice(0, 8).map(actor => actor.name).join(', ');
        }

        let screenshotsHtml = '<p>No screenshots available.</p>';
        if (movie.screenshots && movie.screenshots.length > 0) {
            screenshotsHtml = movie.screenshots.map(ssUrl => `<img src="${ssUrl || placeholderScreenshot}" alt="Screenshot">`).join('');
        }

        detailsContent.innerHTML = `
            <div class="details-layout">
                <div class="poster-column">
                    <img src="${posterPath}" alt="${movie.title || ''} Poster">
                    <div class="action-buttons" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        ${movie.playLink ? `<a href="${movie.playLink}" target="_blank" rel="noopener noreferrer" class="btn-play">Play Movie</a>` : ''}
                        ${movie.downloadLink ? `<a href="${movie.downloadLink}" target="_blank" rel="noopener noreferrer" class="btn-download" download>Download Movie</a>` : ''}
                    </div>
                </div>
                <div class="info-column">
                    <h2>${movie.title || `Movie ID: ${movie.tmdbId}`} ${movie.release_date ? `(${releaseYear})` : ''}</h2>
                    ${movie.tagline ? `<p class="tagline"><em>${movie.tagline}</em></p>` : ''}
                    <p><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} (${movie.vote_count || 0} votes)</p>
                    <p><strong>Runtime:</strong> ${runtime}</p>
                    <p><strong>Genres:</strong> ${genres}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                    <p><strong>Overview:</strong></p>
                    <p>${movie.overview || 'No overview available.'}</p>
                    <p><strong>Main Cast:</strong> ${castList}</p>

                    <div class="screenshots-container">
                        <h3>Screenshots</h3>
                        <div class="screenshots-grid">
                            ${screenshotsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        movieResultsContainer.classList.add('hidden');
        movieDetailsContainer.classList.remove('hidden');
        backButton.classList.remove('hidden');
        window.scrollTo(0, 0);
        showLoading(false);
    }

    function showResultsView() {
        movieResultsContainer.classList.remove('hidden');
        movieDetailsContainer.classList.add('hidden');
        backButton.classList.add('hidden');
        hideError();
    }

    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        setTimeout(hideError, 7000);
    }

    function hideError() {
        errorMessageDiv.classList.add('hidden');
        errorMessageDiv.textContent = '';
    }
});
