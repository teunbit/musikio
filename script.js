// GLOBAL API VARS
const spotifyUrl = 'https://api.spotify.com/v1/';
const clientId = '1cb8bd773dce48b691926421c56d0a46';
const clientSecret = '50668d110ab54f69bcf4327630274706';

// DOM VARS
const searchButton = document.querySelector('button');
const inputField = document.querySelector('input');
const artistField = document.querySelector('#profile');
const albumsEl = document.querySelector('#albumsEl');
const topTracksEl = document.querySelector('.top-tracks');
const relatedArtistsEl = document.querySelector('.related-artists');

/**
 * Function that fetches the Token from the Spotify API 
 * @returns token
 */
async function fetchToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials',
    });
    const data = await result.json();
    return data.access_token;
}

/**
 * Function that fetches data about an artist from Spotify
 * @param {*} artist 
 * @returns artistdata
 */
async function fetchArtist(query, token) {
    const params = 'search?type=artist&limit=1&q=';
    const result = await fetch(spotifyUrl + params + query, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const artistdata = await result.json();
    return artistdata.artists.items[0];
}
/**
 * Function that fetches albums based on artistId
 * @param {*} artistId 
 * @param {*} offset 
 * @param {*} token 
 * @returns albums
 */
async function fetchAlbums(artistId, offset, token) {
    const params = `artists/${artistId}/albums?limit=50&offset=${offset}&include_groups=album&market=nl`;
    const result = await fetch(spotifyUrl + params, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const albums = await result.json();
    return albums.items
}
/**
 * Function that fetches top tracks based on artistId
 * @param {*} artistId 
 * @param {*} token 
 * @returns top tracks
 */
async function fetchTopTracks(artistId, token) {
    const params = `artists/${artistId}/top-tracks?market=nl`;
    const result = await fetch(spotifyUrl + params, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const topTracks = await result.json();
    return topTracks.tracks;
}

/**
 * Function that fetches related artists based on artistId
 * @param {*} artistId 
 * @param {*} token 
 * @returns 
 */
async function fetchRelatedArtists(artistId, token) {
    const params = `artists/${artistId}/related-artists`;
    const result = await fetch(spotifyUrl + params, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const relatedArtists = await result.json();
    return relatedArtists.artists;
}


/**
 * function that displays an artist
 * @param {*} ar 
 */
function displayArtist(ar) {
    artistField.innerHTML = `
    <h2 class="profile__name">
        <a href="${ar.external_urls.spotify}" target="_blank">${ar.name}</a>
    </h2>
    <p class="profile__genres" ><b>Genres:</b> ${ar.genres.join(", ")}</p>
    <img class="profile__img" src='${ar.images[0].url}'>   
    `;

}

/**
 * Function that displays albums
 * @param {} albums 
 */
function displayAlbums(albums) {
    albumsEl.innerHTML = `
    <h2 class="albums__title">
        Albums
    </h2>
    <div class="albums wrapper" id="albums"></div>
    `;

    const albumsField = document.querySelector('#albums');
    albumsField.innerHTML = '';


    albums = albums.reverse();
    for (let i = 0; i < albums.length; i++) {
        const al = albums[i];
        const div = document.createElement('div');
        div.classList.add('albums__item');
        div.innerHTML = `
        <a class="albums__link" target="_blank" href="${al.external_urls.spotify}">
        <p class="albums__text">${al.name} - ${al.release_date.substring(0, 4)}</p>
        <img class="albums__img" src="${al.images[1].url}">
        </a>
        `;
        albumsField.append(div);

    }

    if (albums.length > 4) {

        const button = document.createElement('button');
        button.classList.add('albums__show-more-button');
        button.innerHTML = "Show more";
        button.addEventListener('click', function () {
            albumsField.classList.toggle('albums--show-more');
            button.remove();
        });
        albumsEl.append(button);
    }
}

/**
 * Function that displays top tracks 
 * @param {} topTracks 
 */
function displayTopTracks(topTracks) {

    topTracksEl.innerHTML = `
        <h2 class="top-tracks__title">
            Top tracks
        </h2>
        <ul class="top-tracks__list"></ul>
        `;
    const topTracksList = document.querySelector('.top-tracks__list');
    for (let i = 0; i < topTracks.length; i++) {
        const tr = topTracks[i];
        const li = document.createElement('li');
        if (tr.preview_url != null) {
            const audio = new Audio(tr.preview_url);
            li.append(audio);
            li.addEventListener('mouseover', () =>
                setTimeout(() => audio.play(), 300));
            li.addEventListener('mouseleave', () =>
                setTimeout(() => audio.pause(), 400));
            li.setAttribute('style', 'text-decoration: underline');
        }
        li.classList.add('top-tracks__item');
        li.innerHTML = `
        <a class="top-tracks__link" target="_blank" href="${tr.external_urls.spotify}">${tr.name}</a>
        `;
        topTracksList.append(li);
    }
}

/**
 * function that displays related artists
 * @param {*} relatedArtists 
 */
function displayRelatedArtists(relatedArtists) {
    relatedArtistsEl.innerHTML = `
    <h2 class="related-artists__title">
        Related Artists
    </h2>
    <div class="related-artists wrapper" id="related-artists"></div>    
    `;
    const relatedArtistsField = document.querySelector('#related-artists');

    for (let i = 0; i < relatedArtists.length; i++) {
        const ra = relatedArtists[i];
        const div = document.createElement('div');
        div.classList.add('related-artist');
        div.innerHTML = `
            <h4 class="related-artist__name">
                ${ra.name}
            </h4>
            <img src="${ra.images[1].url}">
        `
        div.addEventListener('click', () => generatePage(ra.name), window.scrollTo(0, 0));
        relatedArtistsField.append(div);
    }
}
/**
 * Function that generates the page. Called by using the search function or by clicking on a related artist.
 * @param {*} query 
 */
async function generatePage(query) {

    let artist = await fetchArtist(query, await fetchToken());
    displayArtist(artist);
    window.scrollTo(0, 0);
    let albums = await fetchAlbums(artist.id, 0, await fetchToken());
    if (albums.length > 49) {
        let albums2 = await fetchAlbums(artist.id, 49, await fetchToken());
        albums = [...albums, ...albums2];
    }
    displayAlbums(albums);
    let topTracks = await fetchTopTracks(artist.id, await fetchToken());
    displayTopTracks(topTracks);
    let relatedArtists = await fetchRelatedArtists(artist.id, await fetchToken());
    displayRelatedArtists(relatedArtists);
}


/**
 * Code for adding the functionality to the button
 */
searchButton.addEventListener('click', function () {
    const query = inputField.value;
    generatePage(query);
});

window.addEventListener('keypress', function (e) {
    if (e.key == 'Enter') {
        const query = inputField.value;
        generatePage(query);
    }
});

inputField.addEventListener('focus', () => inputField.value = '');

// on page start:
const letters = ['a', 'b', 'c', 'd', 'd', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const index = Math.floor(Math.random() * letters.length);
generatePage(letters[index]);