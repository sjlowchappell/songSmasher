// User goes to website
// User inputs a song name in search bar DONE
// App saves user input in a variable DONE
// App makes api call to musixmatch with song name -> track.search DONE
// Api call returns song id DONE

// App makes api call to musixmatch with song id -> track.lyrics.get
// Api call returns song lyrics
// Song lyrics saved in a string
// Parse string by white space and save lyrics into an array word by word -> use the split method
// App prints song lyrics string to the page

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


songApp.printLyrics = (section, lyrics) => {
    $(section).append(`<p>${lyrics}</p>`);
}
// Searches the musixmatch API for a track id
songApp.searchSong = (userInputSong, userInputArtist) =>{
    $.ajax({
        url: `${songApp.musicURL}track.search`,
        type: 'GET',
        data: {
            apikey: apiKey,
            q_track: userInputSong,
            q_artist: userInputArtist,
            page_size: '1',
            format: "jsonp"
        },
        dataType: "jsonp"
    }).then(res => {
        // saves the lyrics in a string
        songApp.songLyrics = songApp.getLyrics(res.message.body.track_list[0].track.track_id);
        // splits the string so that each word is saved in an array to be smashed later
        songApp.printLyrics('.originalSong', lyrics);
    });
};

// gets the lyrics to a song from the musixmatch API based on returned track id
songApp.getLyrics = (musixTrackID) => {
    $.ajax({
        url: `${songApp.musicURL}track.lyrics.get`,
        type: "GET",
        data: {
            apikey: apiKey,
            track_id: musixTrackID,
            format: "jsonp"
        },
        dataType: "jsonp"
    }).then(res => {
        // returns the lyrics
        return res.message.body.lyrics.lyrics_body;
    });
};

// Method that takes in a lyrics string and a modifier based on smash level
songApp.smashLyrics = (lyrics, n) => {
    const originalLyrics = lyrics.split(' ');
    const newLyrics = [];
    for (i = 0; i < originalLyrics.length; i++) {
        if (i % n == 0) {
            $.ajax({
                url: songApp.thesaurusURL,
                type: "GET",
                data: {
        
                }
            }).then(res => {
                newLyrics.push(!!!!!res!!!!!);
            })
        } else {
            newLyrics.push(originalLyrics[i]);
        }
    }
    songApp.smashedLyrics = newLyrics.join(' ');
    printLyrics('.smashedSong', songApp.smashedLyrics);
}


$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        songApp.songName = $('#songName').val();
        songApp.artistName = $('#artistName').val();
        songApp.searchSong(songApp.songName, songApp.artistName)
        // makeRequest(songName, artistName);
    })

    $('.smashButton').on('click', function (e) {
        e.preventDefault();
        songApp.smashLyrics(songApp.songLyrics, 10);
    })

    console.log("ready!");


    // let songName = '';
    // let artistName = '';
    // const songLyrics = [];
    // const smashedLyrics = [];
    // const apiKey = '5bd428e80ba2d105deb6caa361ace5d6';

    // const songURL = 'http://api.musixmatch.com/ws/1.1/track.lyrics.get';

    // // Makes request to musixmatch API based on user input song and artist information
    // const makeRequest = (userInputSong, userInputArtist) => {
    //     $.ajax({
    //         url: "https://api.musixmatch.com/ws/1.1/track.search",
    //         type: "GET",
    //         data: {
    //             apikey: apiKey,
    //             q_track: userInputSong,
    //             q_artist: userInputArtist,
    //             page_size: '1',
    //             format: "jsonp"
    //         },
    //         dataType: "jsonp"
    //     }).then(function(res){
    //         console.log('It worked!');
    //         console.log(res);
    //         const songInfo = res.message.body.track_list[0].track;
    //         // Print song info to the page
    //         printSong(songInfo.track_name, songInfo.artist_name, songInfo.album_name, songInfo.track_id);
    //     });
    // };
    // const printSong = (songName, songArtist, songAlbum, songID) => {
    //     $('.song').append(`<p>${songName} by ${songArtist} from the album ${songAlbum}. Track id is: ${songID}</p>`);
    // };
});