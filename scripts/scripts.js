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

// User clicks "Smash this song" button

// Map function song lyrics array
// Look up synonym for each word
// Save synonym for each word in an array
// concatanate array with white spaces (excluding final word)
// print string

const songApp = {};

songApp.musicURL = 'http://api.musixmatch.com/ws/1.1/';
songApp.musicApiKey = '5bd428e80ba2d105deb6caa361ace5d6';
songApp.thesaurusURL = '';

songApp.songName = '';
songApp.artistName = '';
songApp.songLyrics = '';
songApp.smashedLyrics = '';

// Appends the song lyrics to a given section
songApp.printLyrics = (section, lyrics) => {
    // splits lyrics string by new lines
    let newLyricsArray = lyrics.split('\n');
    // removes the ugly added content from musixmatch
    newLyricsArray.length = newLyricsArray.length - 3;
    // appends each line to given section from the html
    for (line in newLyricsArray) {
        $(section).append(`<p>${newLyricsArray[line]}</p>`);
    }
}
// Searches the musixmatch API for a track id
songApp.searchSong = (userInputSong, userInputArtist) =>{
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
        // Checks to see if there are available lyrics be seeing if the body is empty
        if ($.isEmptyObject(res.message.body)) {
            // If there are no available lyrics, a message is printed to say that they are unavailable
            $('.originalSong').append(`<p>Sorry, no lyrics for that song currently available</p>`);
        } else {
            // if there are lyrics, saves the lyrics and prints them on the page
            songApp.songLyrics = res.message.body.lyrics.lyrics_body;
            songApp.printLyrics('.originalSong', songApp.songLyrics);
        }     
    });
};

// Method that takes in a lyrics string and a modifier based on smash level
// songApp.smashLyrics = (lyrics, n) => {
//     const originalLyrics = lyrics.split(' ');
//     const newLyrics = [];
//     for (i = 0; i < originalLyrics.length; i++) {
//         if (i % n == 0) {
//             $.ajax({
//                 url: songApp.thesaurusURL,
//                 type: "GET",
//                 data: {
        
//                 }
//             }).then(res => {
//                 newLyrics.push(!!!!!res!!!!!);
//             })
//         } else {
//             newLyrics.push(originalLyrics[i]);
//         }
//     }
//     songApp.smashedLyrics = newLyrics.join(' ');
//     printLyrics('.smashedSong', songApp.smashedLyrics);
// }


$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        songApp.songName = $('#songName').val();
        songApp.artistName = $('#artistName').val();
        songApp.searchSong(songApp.songName, songApp.artistName);
    })

    $('.smashButton').on('click', function (e) {
        e.preventDefault();
        songApp.smashLyrics(songApp.songLyrics, 10);
    })

    console.log("ready!");
});