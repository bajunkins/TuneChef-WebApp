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
      addRecommendations(req.body.tracksList, (tracks) => {
        addTracks(playlistId, tracks);
      });


    }, (err) => {
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
  const tracks = tracksList.map(x => `spotify:track:${x}`);
  spotifyApi.addTracksToPlaylist(playlistId, tracks)
    .then((data) => {
      return data;
    }, (err) => {
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
      tracks.push(tracksList[i][j].id);
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
function addRecommendations(tracksList, cb) {

    var recommendedTracks = []

    getTargets(tracksList, (targets, seeds) => {
      spotifyApi.getRecommendations({ ...targets, seed_tracks: seeds })
        .then((recommendations) => {
            for (var i = 0; i < 20; i++) {
              recommendedTracks.push(recommendations.body.tracks[i].id)
            }
            cb(recommendedTracks);
        }, (err) => {
          return err;
        });
    });
}

/**
 * Returns json object target parameters for recommendation
 */
function getTargets(tracksList, cb) {

  var total = 0;

  var seeds = [];
  var seedCount = 0;

  var targets = {
    target_duration_ms: 0,
    target_key: 0,
    target_mode: 0,
    target_time_signature: 0,
    target_acousticness: 0,
    target_danceability: 0,
    target_energy: 0,
    target_instrumentalness: 0,
    target_liveness: 0,
    target_loudness: 0,
    target_speechiness: 0,
    target_valence: 0,
    target_tempo: 0,
  }

  async function waitForAllTracks() {
    const promises = [];

    for (var i = 0; i < tracksList.length; i++) {
      for (var j = 0; j < tracksList[i].length; j++) {
        promises.push(new Promise ((resolve) => {
          if (seedCount < 5 && !seeds.includes(tracksList[i][j])) {
            seeds.push(tracksList[i][j].id);
            seedCount++;
          }
          spotifyApi.getAudioFeaturesForTrack(tracksList[i][j].id)
            .then((features) => {
              targets.target_duration_ms += features.body.duration_ms
              targets.target_key += features.body.key
              targets.target_mode += features.body.mode
              targets.target_time_signature += features.body.time_signature
              targets.target_acousticness += features.body.acousticness
              targets.target_danceability += features.body.danceability
              targets.target_energy += features.body.energy
              targets.target_instrumentalness += features.body.instrumentalness
              targets.target_liveness += features.body.liveness
              targets.target_loudness += features.body.loudness
              targets.target_speechiness += features.body.speechiness
              targets.target_valence += features.body.valence
              targets.target_tempo += features.body.tempo
              total++
              resolve();
            }, (err) => {
              resolve();
            });
        }));
      }
    }


    await Promise.all(promises);

    if (total != 0) {
      Object.entries(targets).forEach(([key, value]) => {
        targets[key] = Math.round(value / total);
      });
      // targets.target_key = Math.round(targets.target_key);
      // targets.target_mode = Math.round(targets.target_mode);
    }

    cb(targets, seeds);
  }

  waitForAllTracks();
}

/**
 * Returns json object array of top 5 artists user's have in common
 */
function getSeedArtists() {

}

export default router;
