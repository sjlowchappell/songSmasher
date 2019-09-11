const songApp = {};
songApp.musicURL = 'http://api.musixmatch.com/ws/1.1/';
songApp.musicApiKey = '5bd428e80ba2d105deb6caa361ace5d6';
songApp.thesaurusURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';
songApp.thesaurusApiKey = '9778e990-d5f5-49d8-88af-881a41b463a3';
songApp.songName = '';
songApp.artistName = '';
songApp.songLyrics = '';
songApp.smashedLyrics = '';
songApp.copyright = '';

// Searches the musixmatch API for a track id
songApp.searchSong = (userInputSong, userInputArtist) => {
	// Ajax request
	$.ajax({
		url: `${songApp.musicURL}track.search`,
		type: 'GET',
		data: {
			apikey: songApp.musicApiKey,
			q_track: userInputSong,
			q_artist: userInputArtist,
			page_size: '1',
			s_track_rating: 'desc',
			format: 'jsonp',
		},
		dataType: 'jsonp',
	}).then(res => {
		// sends the track id to the getLyrics method
		if (res.message.body.track_list[0] === undefined) {
			$('.originalSong')
				.append(`<p>Sorry, we were unable to find this song and artist combination. Please try again.</p>`)
				.css('display', 'block');
		} else {
			songApp.songName = res.message.body.track_list[0].track.track_name;
			songApp.artistName = res.message.body.track_list[0].track.artist_name;
			songApp.getLyrics(res.message.body.track_list[0].track.track_id);
		}
	});
};

// gets the lyrics to a song from the musixmatch API based on returned track id
songApp.getLyrics = musixTrackID => {
	// Ajax request
	$.ajax({
		url: `${songApp.musicURL}track.lyrics.get`,
		type: 'GET',
		data: {
			apikey: songApp.musicApiKey,
			track_id: musixTrackID,
			format: 'jsonp',
		},
		dataType: 'jsonp',
	}).then(res => {
		// Checks to see if there are available lyrics by seeing if the body of the returned info is empty
		if ($.isEmptyObject(res.message.body) || res.message.body.lyrics.lyrics_body === '') {
			// If there are no available lyrics, a message is printed to say that there are no lyrics available
			$('.originalSong')
				.append(`<p>Sorry, there are no lyrics currently available for that song</p>`)
				.css('display', 'block');
		} else {
			// if there are lyrics, saves the lyrics and prints them on the page after the original song section
			songApp.copyright = res.message.body.lyrics.lyrics_copyright;
			songApp.songLyrics = res.message.body.lyrics.lyrics_body;
			songApp.printLyrics('.originalSong', songApp.songLyrics);
			// After the song has been printed, enables the smash button
			$('.smashButton').removeAttr('disabled');
		}
	});
};

// takes the original song lyrics and a silly word frequency value (n). creates new song lyrics with random silly words depending on n value
songApp.smashLyrics = (lyrics, n) => {
	const individualWords = lyrics.split(' ');
	const sillyLyrics = [];

	// Disables the smash buttons so that the user does not make multiple calls to the thesaurus api
	$('.smashButton').attr('disabled', 'disabled');

	// makes an api call to get a response for the async function
	const getWordResponse = word => {
		return $.ajax({
			url: `${songApp.thesaurusURL}${word}`,
			type: 'GET',
			data: {
				key: songApp.thesaurusApiKey,
			},
		});
	};

	// get random number function used to get a random index to select word from the array of word options in the thesaurus api response
	function getRandomNumber(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	// async function so that we can build the song lyrics array with new words
	async function createNewSong() {
		// loops through an array of all the individual words of the original song
		for (let i = 0; i < individualWords.length; i++) {
			// based on input interval input n, grabs words in array. Makes sure it doesn't take the first word and checks for any words that may have a line break in them. example: if n = 10, this will take every tenth word check if it includes a line break in the word
			// if the the selected word is the 10th word but has a line break, it will look up the following word instead
			// otherwise, the original word from the song remains the same
			if (i !== 0 && i % n == 0 && !individualWords[i].includes('\n')) {
				// if the word is selected, send it to the ajax call and store the response
				const response = await getWordResponse(individualWords[i]);
				// check if there is a valid response. If response isn't valid, just plug the original word into the new array. If the response is valid, push the new silly word into the array
				if (response[0] === undefined) {
					sillyLyrics.push(individualWords[i]);
				} else {
					// checks to see whether the word has synonyms (i.e. if the api call response includes the property 'meta'). If so, returns a random synonym. If not, it returns the first suggested word
					sillyLyrics.push(
						response[0].hasOwnProperty('meta')
							? `<span class="sillyWord">${
									response[0].meta.syns[0][getRandomNumber(response[0].meta.syns[0].length)]
							  }</span>`
							: `<span class="sillyWord">${response[getRandomNumber(response.length)]}</span>`,
					);
				}
			} else if (i % n == 0 && individualWords[i].includes('\n')) {
				// if the word is selected but includes a new line, add the word itself to the array so the page structure is maintained
				sillyLyrics.push(individualWords[i]);
				// then send the next word to the ajax call and store the responsee
				const response = await getWordResponse(individualWords[i + 1]);
				// check if there is a valid response. If response isn't valid, just plug the original word into the new array. If the response is valid, push the new silly word into the array
				if (response[0] === undefined) {
					sillyLyrics.push(individualWords[i + 1]);
				} else {
					// checks to see whether the word has synonyms (i.e. if the api call response includes the property 'meta'). If so, returns a random synonym. If not, it returns the first suggested word
					sillyLyrics.push(
						response[0].hasOwnProperty('meta')
							? `<span class="sillyWord">${
									response[0].meta.syns[0][getRandomNumber(response[0].meta.syns[0].length)]
							  }</span>`
							: `<span class="sillyWord">${response[getRandomNumber(response.length)]}</span>`,
					);
					// iterates an extra i so that no duplicate words are added to the array
				}
				i++;
			} else {
				sillyLyrics.push(individualWords[i]);
			}
		}
		// sends the new song to print lyrics so that the new lyrics are printed on the page
		songApp.printLyrics('.smashedSong', sillyLyrics.join(' '));
		$('.highlight').css('display', 'block');
		$('.reset').css('display', 'block');
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
	if (section === '.originalSong') {
		$(section).append(
			`<h3>Lyrics for <span class='title'>${songApp.songName}</span> by <span class='title'>${songApp.artistName}</span>`,
		);
	} else {
		$(section).append(
			`<h3>Silly Lyrics for <span class='title'>${songApp.songName}</span> by <span class='title'>${songApp.artistName}</span>`,
		);
	}
	// appends each line of the lyrics to given section from the html
	for (line in newLyricsArray) {
		$(section).append(`<p>${newLyricsArray[line]}</p>`);
	}
	$(section).append(`<h4>${songApp.copyright}</h4>`);
	$(section).css('display', 'block');
};

$(document).ready(function() {
	const searchInputs = document.querySelectorAll('.searchInput');
	const form = document.querySelector('form');
	const lyricsSections = document.querySelectorAll('.lyrics');

	searchInputs.forEach(searchInput => {
		searchInput.addEventListener('focus', function() {
			this.parentNode.children[1].classList.add('focused');
		});
	});
	form.addEventListener('submit', e => {
		e.preventDefault();
		lyricsSections.forEach(lyricsSection => {
			[...lyricsSection.childNodes].forEach(child => child.remove());
		});
		songApp.songName = searchInputs[0].value;
		songApp.artistName = searchInputs[1].value;
		songApp.searchSong(songApp.songName, songApp.artistName);
		searchInputs.forEach(searchInput => {
			searchInput.value = '';
		});
	});

	// $('form').on('submit', function(e) {
	// 	e.preventDefault();
	// 	$('.originalSong').empty();
	// 	$('.smashedSong').empty();
	// 	songApp.songName = $('#songName').val();
	// 	songApp.artistName = $('#artistName').val();
	// 	songApp.searchSong(songApp.songName, songApp.artistName);
	// });

	$('.smashButton').on('click', function(e) {
		const smashType = $(this).attr('name');
		if (smashType === 'smallSmash') {
			songApp.smashLyrics(songApp.songLyrics, 12);
		} else if (smashType === 'normalSmash') {
			songApp.smashLyrics(songApp.songLyrics, 8);
		} else {
			songApp.smashLyrics(songApp.songLyrics, 2);
		}
	});

	$('.highlight').on('click', function(e) {
		$('.sillyWord').toggleClass('highlightStyling');
	});

	$('.reset').on('click', function(e) {
		$('.originalSong')
			.empty()
			.css('display', 'none');
		$('.smashedSong')
			.empty()
			.css('display', 'none');
		songApp.songName = '';
		songApp.artistName = '';
		$('#songName').val('');
		$('#artistName').val('');
		$('.searchInputContainer label').removeClass('focused');
		$('.highlight').css('display', 'none');
		$(this).css('display', 'none');
	});
});

// User goes to website
// User inputs a song name in search bar DONE
// App saves user input in a variable DONE
// App makes api call to musixmatch with song name -> track.search DONE
// Api call returns song id DONE

// App makes api call to musixmatch with song id -> track.lyrics.get DONE
// Api call returns song lyrics DONE
// Song lyrics saved in a string DONE
// Parse string by white space and save lyrics into an array word by word -> use the split method DONE
// App prints song lyrics string to the page DONE

// User clicks "Smash this song" button DONE

// iterate through original song lyrics DONE
// Look up synonym for words based on n frequency of weird words DONE
// Save synonyms for in a new array DONE
// Save normal words in new array DONE
// concatanate array with white spaces DONE
// print silly lyrics to page DONE

// TO DO:
// enable and disable the "smash this song button" based on what's on the page so far DONE
// Need to find a way to return the correct song rather than a weird cover version in initial request DONE
// review thesaurus api to ensure I am making calls correctly for individual words
// randomize the words returned from thesaurus api DONE
// add ternanry statements to shorten checks DONE
// Add new buttons so there are 3 smash options DONE
// Check to make sure app doesn't break if there is no song provided, no lyrics provided, or if there are issues getting synonyms DONE

// Add a "start over" button to the bottom that resets everything DONE
// Credit the different APIS that I used DONE

// Add a "highlight lyrics" button
