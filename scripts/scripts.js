const songApp = {};

songApp.musicURL = 'http://api.musixmatch.com/ws/1.1/';
songApp.musicApiKey = '5bd428e80ba2d105deb6caa361ace5d6';
songApp.thesaurusURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';
songApp.thesaurusApiKey = '9778e990-d5f5-49d8-88af-881a41b463a3';
songApp.proxyURL = 'https://proxy.hackeryou.com/?reqUrl=';
songApp.songName = '';
songApp.artistName = '';
songApp.songLyrics = '';
songApp.smashedLyrics = '';
songApp.copyright = '';
songApp.firstLoader = document.querySelector('.firstLoader');
songApp.secondLoader = document.querySelector('.secondLoader');
songApp.lyricsSections = document.querySelectorAll('.lyrics');
songApp.highlightButton = document.querySelector('.highlight');
songApp.resetButton = document.querySelector('.reset');
songApp.smashButtons = document.querySelectorAll('.smashButton');
songApp.buttons = document.querySelector('.buttonsContainer');

songApp.setDisplayValue = (item, displayValue) => {
	item.style.display = displayValue;
};

songApp.handleError = reason => {
	songApp.lyricsSections[0].insertAdjacentHTML('beforeend', `<p>Sorry, ${reason}. Please try again.</p>`);
	songApp.setDisplayValue(songApp.lyricsSections[0], 'block');
};

// Searches the musixmatch API for a track id
songApp.searchSong = (userInputSong, userInputArtist) => {
	// For some reason, the fetch request will not go through properly if you use the & symbol -> instead, need to use the URL code %26 in order for request to be successful.

	const url = `${songApp.proxyURL}${songApp.musicURL}track.search?apikey=${songApp.musicApiKey}%26s_track_rating=desc%26q_track=${userInputSong}%26q_artist=${userInputArtist}`;

	fetch(url)
		.then(res => res.json())
		.then(res => {
			const topTrack = res.message.body.track_list[0];
			// if there's no top track returned, print error message to screen
			if (!topTrack) {
				songApp.handleError('we were unable to find this song and artist combination');
			} else {
				// otherwise, update the song name and artist name with official titles from api
				songApp.songName = topTrack.track.track_name;
				songApp.artistName = topTrack.track.artist_name;
				// send track id to get lyrics method
				songApp.getLyrics(topTrack.track.track_id);
			}
		});
};

// gets the lyrics to a song from the musixmatch API based on returned track id
songApp.getLyrics = musixTrackID => {
	// Display the first loader here
	songApp.setDisplayValue(songApp.firstLoader, 'inline-block');
	// For some reason, the fetch request will not go through properly if you use the & symbol -> instead, need to use the URL code %26 in order for request to be successful. This works!

	const url = `${songApp.proxyURL}${songApp.musicURL}track.lyrics.get?apikey=${songApp.musicApiKey}%26track_id=${musixTrackID}`;

	fetch(url)
		.then(res => res.json())
		.then(res => {
			const resLyrics = res.message.body.lyrics;
			// Checks to see if there are available lyrics by seeing if the body of the returned info is empty
			if (res.message.body.length === 0 || resLyrics.lyrics_body === '') {
				// If there are no available lyrics, an error message is printed to say that there are no lyrics available
				songApp.setDisplayValue(songApp.firstLoader, 'none');
				songApp.handleError('there are no lyrics currently available for that song');
			} else {
				// if there are lyrics, saves the lyrics and prints them on the page after the original song section
				songApp.copyright = resLyrics.lyrics_copyright;
				songApp.songLyrics = resLyrics.lyrics_body;
				// ****************REMOVE the first loader here
				songApp.printLyrics(songApp.lyricsSections[0], songApp.songLyrics);
				songApp.setDisplayValue(songApp.buttons, 'block');
			}
		});
};

// takes the original song lyrics and a silly word frequency value. creates new song lyrics with random silly words depending on n value
songApp.smashLyrics = (lyrics, sillyFrequencyVal) => {
	// Display the second loader here
	songApp.setDisplayValue(songApp.secondLoader, 'inline-block');
	const individualWords = lyrics.split(' ');
	const sillyLyrics = [];

	// Disables the smash buttons so that the user does not make multiple calls to the thesaurus api
	songApp.smashButtons.forEach(smashButton => smashButton.setAttribute('disabled', 'disabled'));

	// makes an api call to get a response for the async function
	const getWordResponse = word => {
		const newurl = `${songApp.thesaurusURL}${word}?key=${songApp.thesaurusApiKey}`;
		return fetch(newurl).then(res => res.json());
	};

	// get random number function used to get a random index to select word from the array of word options in the thesaurus api response
	const getRandomNumber = max => Math.floor(Math.random() * Math.floor(max));

	// async function so that we can build the song lyrics array with new words
	async function createNewSong() {
		// loops through an array of all the individual words of the original song
		for (let i = 0; i < individualWords.length; i++) {
			// based on input interval value, grabs words in array. Makes sure it doesn't take the first word and checks for any words that may have a line break in them. example: if sillyFrequencyVal = 10, this will take every tenth word check if it includes a line break in the word
			// if the the selected word is the 10th word but has a line break, it will look up the following word instead
			// otherwise, the original word from the song remains the same
			if (i !== 0 && i % sillyFrequencyVal == 0 && !individualWords[i].includes('\n')) {
				// if the word is selected, send it to the ajax call and store the response
				const response = await getWordResponse(individualWords[i]);
				// check if there is a valid response. If response isn't valid, just plug the original word into the new array. If the response is valid, push the new silly word into the array
				if (!response[0]) {
					sillyLyrics.push(individualWords[i]);
				} else {
					// checks to see whether the word has synonyms (i.e. if the api call response includes the property 'meta'). If so, returns a random synonym. If not, it returns the first suggested word
					sillyLyrics.push(
						response[0].hasOwnProperty('meta')
							? `<span class="sillyWord highlightStyling">${
									response[0].meta.syns[0][getRandomNumber(response[0].meta.syns[0].length)]
							  }</span>`
							: `<span class="sillyWord highlightStyling">${
									response[getRandomNumber(response.length)]
							  }</span>`,
					);
				}
			} else if (i % sillyFrequencyVal == 0 && individualWords[i].includes('\n')) {
				// if the word is selected but includes a new line, add the word itself to the array so the page structure is maintained
				sillyLyrics.push(individualWords[i]);
				// then send the next word to the ajax call and store the responsee
				const response = await getWordResponse(individualWords[i + 1]);
				// check if there is a valid response. If response isn't valid, just plug the original word into the new array. If the response is valid, push the new silly word into the array
				if (!response[0]) {
					sillyLyrics.push(individualWords[i + 1]);
				} else {
					// checks to see whether the word has synonyms (i.e. if the api call response includes the property 'meta'). If so, returns a random synonym. If not, it returns the first suggested word
					sillyLyrics.push(
						response[0].hasOwnProperty('meta')
							? `<span class="sillyWord highlightStyling">${
									response[0].meta.syns[0][getRandomNumber(response[0].meta.syns[0].length)]
							  }</span>`
							: `<span class="sillyWord highlightStyling">${
									response[getRandomNumber(response.length)]
							  }</span>`,
					);
					// iterates an extra i so that no duplicate words are added to the array
				}
				i++;
			} else {
				sillyLyrics.push(individualWords[i]);
			}
		}
		// sends the new song to print lyrics so that the new lyrics are printed on the page
		songApp.printLyrics(songApp.lyricsSections[1], sillyLyrics.join(' '));
		// sets the highlight and reset buttons to display: block
		songApp.setDisplayValue(songApp.highlightButton, 'block');
		songApp.setDisplayValue(songApp.resetButton, 'block');
	}
	createNewSong();
};

// Appends the song lyrics to a given section
songApp.printLyrics = (section, lyrics) => {
	// splits lyrics string by new lines
	let newLyricsArray = lyrics.split('\n');

	// removes the ugly added content from musixmatch
	newLyricsArray.length = newLyricsArray.length - 4;

	// a title is added specifying the searched song title and artist
	section.insertAdjacentHTML(
		'beforeend',
		`<h3>Lyrics for <span class='title'>${songApp.songName}</span> by <span class='title'>${songApp.artistName}</span>`,
	);

	// appends each line of the lyrics to given section from the html
	for (line in newLyricsArray) {
		section.insertAdjacentHTML('beforeend', `<p>${newLyricsArray[line]}</p>`);
	}

	// appends copyright (required by API) at end
	section.insertAdjacentHTML('beforeend', `<h4>${songApp.copyright}</h4>`);

	// Remove the loaders here
	songApp.setDisplayValue(songApp.firstLoader, 'none');
	songApp.setDisplayValue(songApp.secondLoader, 'none');
	// displays the song
	songApp.setDisplayValue(section, 'block');
};

document.addEventListener('DOMContentLoaded', () => {
	const searchInputs = document.querySelectorAll('.searchInput');
	const form = document.querySelector('form');

	const clearSongs = () => {
		songApp.lyricsSections.forEach(lyricsSection => {
			// spread operator puts nodes into an array, then removes each one
			[...lyricsSection.childNodes].forEach(child => child.remove());
			// hide the lyrics section
			songApp.setDisplayValue(lyricsSection, 'none');
		});
	};

	searchInputs.forEach(searchInput => {
		// if there is text in an input after input is blurred, keep label above input. otherwise, label goes over input (visually)
		searchInput.addEventListener('blur', function() {
			const label = this.parentNode.children[1].classList;
			this.value.trim() !== '' ? label.add('focused') : label.remove('focused');
		});
	});

	form.addEventListener('submit', e => {
		e.preventDefault();
		// clear out existing lyrics
		clearSongs();
		// save song name and artist name
		songApp.songName = searchInputs[0].value;
		songApp.artistName = searchInputs[1].value;
		// search API
		songApp.searchSong(songApp.songName, songApp.artistName);
	});

	songApp.smashButtons.forEach(smashButton => {
		smashButton.addEventListener('click', function() {
			// get the smash level for each button as an int from html button
			const level = parseInt(this.dataset.smashlevel);
			// submit lyrics to smash method
			songApp.smashLyrics(songApp.songLyrics, level);
		});
	});

	songApp.highlightButton.addEventListener('click', () => {
		// get all the silly words
		const sillyWords = document.querySelectorAll('.sillyWord');
		// toggle styling
		sillyWords.forEach(sillyWord => sillyWord.classList.toggle('highlightStyling'));
	});

	songApp.resetButton.addEventListener('click', function(e) {
		// clear song lyrics, song and artist names, and inputs
		clearSongs();
		songApp.songName = '';
		songApp.artistName = '';
		searchInputs.forEach(searchInput => (searchInput.value = ''));
		// sets buttons to display: none and enables smash buttons once again
		songApp.smashButtons.forEach(smashButton => smashButton.removeAttribute('disabled'));
		songApp.setDisplayValue(songApp.buttons, 'none');
		songApp.setDisplayValue(songApp.highlightButton, 'none');
		songApp.setDisplayValue(songApp.resetButton, 'none');
	});
});
