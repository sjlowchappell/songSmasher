// User goes to website
// User inputs a song name in search bar
// App saves user input in a variable
// App makes api call to musixmatch with song name -> track.search
// Api call returns song id
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





$(document).ready(function () {
    let songName = '';
    let artistName = '';
    const songLyrics = [];
    const smashedLyrics = [];
    const apiKey = '5bd428e80ba2d105deb6caa361ace5d6';

    const songURL = 'http://api.musixmatch.com/ws/1.1/track.lyrics.get';

    const makeRequest = (userInputSong, userInputArtist) => {
        $.ajax({
            type: "GET",
            data: {
                apikey: apiKey,
                q_track: userInputSong,
                q_artist: userInputArtist,
                page_size: '1',
                format: "jsonp",
                callback: "jsonp_callback"
            },
            url: "https://api.musixmatch.com/ws/1.1/track.search",
            dataType: "jsonp",
            jsonpCallback: 'jsonp_callback',
            contentType: 'application/json',
        }).then(function(res){
            console.log('It worked!');
            console.log(res);
        });
    };

    console.log(songURL);

    
    
    
    $('form').on('submit', function(e) {
        e.preventDefault();
        songName = $('#songName').val();
        artistName = $('#artistName').val();
        makeRequest(songName, artistName);
    })



    console.log("ready!");
});