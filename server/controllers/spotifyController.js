import express from 'express';
import bodyParser from 'body-parser';
import SpotifyWebApi from 'spotify-web-api-node';

import Party from '../models/partyModel';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const credentials = {
  clientId: 'c0d3ae62e6e74f0baa142965fcaa68c6',
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUri: 'http://localhost:3000/callback',
};

const spotifyApi = new SpotifyWebApi(credentials);

const joinApi = new SpotifyWebApi({
  clientId: 'c0d3ae62e6e74f0baa142965fcaa68c6',
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUri: 'http://localhost:3000/thanks',
});

router.get('/authorize', (req, res) => {
  const scopes = ['user-read-private',
    'user-read-email',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-private',
    'user-follow-read',
    'user-top-read',
  ];
  // const redirectUri = 'http://localhost:3000/callback';
  // const clientId = 'c0d3ae62e6e74f0baa142965fcaa68c6';

  // // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  // const spotifyApi = new SpotifyWebApi({
  //   redirectUri,
  //   clientId,
  // });

  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

  return res.status(200).send(authorizeURL);
});

router.put('/setcode', (req, res) => {
  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(req.body.code)
    .then(
      (data) => {
        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        return res.status(200).json({ success: true, result: data.body['access_token'] });
      },
      (err) => {
        return res.status(200).json({ success: false, result: err });
      },
    );
});

router.get('/user', (req, res) => {
  spotifyApi.getMe()
    .then((data) => {
      return res.status(200).send(data);
    }, (err) => {
      return res.status(500).send(err);
    });
});

router.post('/generate', (req, res) => {
  var playlistId = -1;
  spotifyApi.createPlaylist(req.body.userId, req.body.playlistName, { 'public': true })
    .then((data) => {
      playlistId = data.body.id;
      addTopTracks(req.body.tracksList, playlistId);
      addCommonTracks(req.body.tracksList, playlistId);
      addCommonArtists(req.body.artistsList, playlistId);

    }, (err) => {
      console.log(err);
      return res.status(500).send(err);
    });
});

router.put('/joined', (req, res) => {
  // Retrieve an access token and a refresh token
  joinApi.authorizationCodeGrant(req.body.code)
    .then((data) => {
      // Set the access token on the API object to use it in later calls
      joinApi.setAccessToken(data.body['access_token']);
      joinApi.setRefreshToken(data.body['refresh_token']);
      joinApi.getMe()
        .then((user) => {
          Party.findOne({ _id: req.body.id }, (err, party) => {
            if (err || !party) {
              return res.status(200).json({ success: false, result: err });
            }

            let users = {};
            if (party.users) {
              users = JSON.parse(JSON.stringify(party.users));
            }

            users[user.body.display_name] = 'yay';

            Party.findOneAndUpdate(
              { _id: req.body.id },
              { users },
              { new: true },
              (error, newParty) => {
                if (error) {
                  return res.status(200).json({ success: false, result: err });
                }
                return res.status(200).json({ success: true, result: newParty });
              },
            );
          });
        }, (err) => {
          return res.status(200).json({ success: false, result: err });
        });
    },
      (err) => {
        return res.status(200).json({ success: false, result: err });
      });
});

router.get('/join', (req, res) => {
  const scopes = ['user-read-private',
    'user-read-email',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    'playlist-read-private',
    'user-follow-read',
    'user-top-read',
  ];

  const state = req.query.id;

  // Create the authorization URL
  const authorizeURL = joinApi.createAuthorizeURL(scopes, state);

  return res.status(200).send(authorizeURL);
});

/**
 * Adds passed tracks list to passed playlist id
 */
function addTracks(playlistId, tracksList) {
  if (tracksList.length < 1) return -1;


  const tracks = tracksList.map(x => 'spotify:track:${x.id}');
  console.log(tracks);
  spotifyApi.addTracksToPlaylist(playlistId, tracks)
    .then((data) => {
      return data;
    }, (err) => {
      console.log(err);
      return err;
    });
  return tracks;
}

/**
 * Add top 3 tracks from each user to playlist
 */
function addTopTracks(tracksList, playlistId) {
  const tracks = [];
  for (var i = 0; i < tracksList.length; i++) {
    for (var j = 0; j < 3; j++) {
      tracks.push(tracksList[i][j]);
    }
  }

  addTracks(playlistId, tracks);
}

/**
 * Returns json object array of tracks that user's have in common
 */
function addCommonTracks(tracksList, playlistId) {
  const tracksImportance = [];
  const tracks = [];

  for (var i = 0; i < tracksList.length; i++) {
    for (var j = 0; j < tracksList[i].length; j++) {
      tracksImportance.push([tracksList[i][j].id,getTrackImportance(tracksList[i][j].id, tracksList)]);
    }
  }

  tracksImportance.sort(function(a,b){return b[1] - a[1]});

  for (var i, k = 0; k < tracksList.length * 3 && i < tracksImportance.length; i++, k++) {
    var skip = false;
    for (var j = 0; j < tracks.length; j++) {
      if (tracksImportance[i][0] == tracks[j].id) {
        skip = true;
        k--;
      }
    }

    if (!skip) {
      tracks.push({
        id : tracksImportance[i][0]
      })
    }
  }

  addTracks(playlistId, tracks);
 }

/**
 * Returns track importance
 */
function getTrackImportance(trackId, tracksList) {
  var importance = 0;

  for (var i = 0; i < tracksList.length; i++) {
    for (var j = 0; j < tracksList[i].length; j++) {
      if (tracksList[i][j].id == trackId) {
        importance += (7 - (j + 1));
        break;
      }
    }
 }

  return importance;
}

/**
 * Return json object array of tracks from artists that user's have in common
 */
function addCommonArtists(artistsList, playlistId) {
  const tracks = [];
  for (var i = 0; i < artistsList.length; i++) {
    for (var j = 0; j < artistsList[i].length; j++) {
      addArtistTopTracks(artistsList[i][j].id, getArtistImportance(artistsList[i][j].id,artistsList), playlistId);
    }
  }
}

/**
 * adds given artist appropriate amount of times to playlist
 */
function addArtistTopTracks(artistId, amount, playlistId) {

  spotifyApi.getArtistTopTracks(artistId, 'US')
  .then(function(data) {

    const tracks = [];
    for (var i = 0; i < amount && i < data.body.tracks.length; i ++) {
      tracks.push({
        id: data.body.tracks[i].id
      });
    }

    addTracks(playlistId, tracks);

    }, function(err) {
    console.log('Something went wrong!', err);
  });


}

/**
 * Returns artist importance
 */
function getArtistImportance(artistId, artistsList) {

  var importance = -1;

  for (var i = 0; i < artistsList.length; i++) {
    for (var j = 0; j < artistsList[i].length; j++) {
      if (artistsList[i][j].id == artistId) {
        importance ++;
        break;
      }
    }
  }

  return importance;

}

/**
 * Returns json object array generated recommendations
 */
function addRecommendations() {

}

/**
 * Returns json object target parameters for recommendation
 */
function getTargets() {

}

/**
 * Returns json object array of top 5 artists user's have in common
 */
function getSeedArtists() {

}

export default router;
