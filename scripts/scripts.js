// User goes to website
// User inputs a song name in search bar DONE
// App saves user input in a variable DONE
// App makes api call to musixmatch with song name -> track.search DONE
// Api call returns song id DONE

// Need to find a way to return the correct song rather than a weird cover version in initial request

// App makes api call to musixmatch with song id -> track.lyrics.get DONE
// Api call returns song lyrics DONE
// Song lyrics saved in a string DONE
// Parse string by white space and save lyrics into an array word by word -> use the split method DONE
// App prints song lyrics string to the page DONE

// User clicks "Smash this song" button DONE

// Look up synonym for each word DONE
// Save synonym for each word in an array DONE
// concatanate array with white spaces (excluding final word) DONE
// print string DONE

// TO DO:
// enable and disable the "smash this song button" based on what's on the page so far

const songApp = {};
songApp.musicURL = 'http://api.musixmatch.com/ws/1.1/';
songApp.musicApiKey = '5bd428e80ba2d105deb6caa361ace5d6';
songApp.thesaurusURL = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';
songApp.thesaurusApiKey = '9778e990-d5f5-49d8-88af-881a41b463a3';
songApp.songName = '';
songApp.artistName = '';
songApp.songLyrics = '';
songApp.smashedLyrics = '';

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
            format: "jsonp"
        },
        dataType: "jsonp"
    }).then(res => {
        // sends the track id to the getLyrics method
        songApp.songName = res.message.body.track_list[0].track.track_name;
        songApp.artistName = res.message.body.track_list[0].track.artist_name;
        songApp.getLyrics(res.message.body.track_list[0].track.track_id);
    });
};

// gets the lyrics to a song from the musixmatch API based on returned track id
songApp.getLyrics = (musixTrackID) => {
    // Ajax request
    $.ajax({
        url: `${songApp.musicURL}track.lyrics.get`,
        type: "GET",
        data: {
            apikey: songApp.musicApiKey,
            track_id: musixTrackID,
            format: "jsonp"
        },
        dataType: "jsonp"
    }).then(res => {
        // Checks to see if there are available lyrics by seeing if the body of the returned info is empty
        if ($.isEmptyObject(res.message.body)) {
            // If there are no available lyrics, a message is printed to say that there are no lyrics unavailable
            $('.originalSong').append(`<p>Sorry, no lyrics for that song currently available</p>`);
        } else {
            // if there are lyrics, saves the lyrics and prints them on the page after the original song section
            songApp.songLyrics = res.message.body.lyrics.lyrics_body;
            songApp.printLyrics('.originalSong', songApp.songLyrics);
        }     
    });
};

// Appends the song lyrics to a given section
songApp.printLyrics = (section, lyrics) => {
    // splits lyrics string by new lines
    let newLyricsArray = lyrics.split('\n');
    // removes the ugly added content from musixmatch
    newLyricsArray.length = newLyricsArray.length - 4;
    // a title is added specifying the searched song title and artist
    $(section).append(`<h3>Lyrics for ${songApp.songName} by ${songApp.artistName}`)
    // appends each line of the lyrics to given section from the html
    for (line in newLyricsArray) {
        $(section).append(`<p>${newLyricsArray[line]}</p>`);
    }
}

songApp.smashLyrics = (lyrics, n) => {
    const individualWords = lyrics.split(' ');
    const sillyLyrics = [];
    
    // makes an api call to get a response for the async function
    const getWordResponse = (word) => {
        return $.ajax({
            url: `${songApp.thesaurusURL}${word}`,
            type: 'GET',
            data: {
                key: songApp.thesaurusApiKey
            }
        });
    };
    // async function so that we can build the song lyrics array with new words
    async function createNewSong() {
        // loops through an array of all the individual words of the original song
        for (let i = 0; i < individualWords.length; i++) {
            // based on input interval input n, grabs words in array. Makes sure it doesn't take the first word and checks for any words that may have a line break in them. example: if n = 10, this will take every tenth word check if it includes a line break in the word
            // if the the selected word is the 10th word but has a line break, it will look up the following word instead
            // otherwise, the original word from the song remains the same
            if (i !== 0 && (i % n == 0) && !individualWords[i].includes('\n')) {
                // if the word is selected, send it to the ajax call and store the response
                const response = await getWordResponse(individualWords[i]);
                // checks to see whether the word has synonyms (includes the property meta), and if not, it returns the first suggested word
                if (response[0].hasOwnProperty('meta')) {
                    sillyLyrics.push(response[0].meta.syns[0][0]);
                } else {
                    sillyLyrics.push(response[0]);
                }
            } else if ((i % n == 0) && individualWords[i].includes('\n')) {
                // if the word is selected but includes a new line, add the word itself to the array so the page structure is maintained
                sillyLyrics.push(individualWords[i]);
                // then send the next word to the ajax call and store the response
                const response = await getWordResponse(individualWords[i+1]);
                // checks to see whether the word has synonyms (includes the property meta), and if not, it returns the first suggested word
                if (response[0].hasOwnProperty('meta')) {
                    sillyLyrics.push(response[0].meta.syns[0][0]);
                } else {
                    sillyLyrics.push(response[0]);
                }
                // iterates an extra i so that no duplicate words are added to the array
                i++;
            }
            else {
                sillyLyrics.push(individualWords[i]);
            }
        }
        // sends the new song to print lyrics so that the new lyrics are printed on the page
        songApp.printLyrics('.smashedSong', sillyLyrics.join(' '));
    }
    createNewSong();
};

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        songApp.songName = $('#songName').val();
        songApp.artistName = $('#artistName').val();
        songApp.searchSong(songApp.songName, songApp.artistName);
    });

    $('.smashButton').on('click', function (e) {
        e.preventDefault();
        songApp.smashLyrics(songApp.songLyrics, 10);
    })
});