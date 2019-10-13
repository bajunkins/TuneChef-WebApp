import express from 'express';
import bodyParser from 'body-parser';
import SpotifyWebApi from 'spotify-web-api-node';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const credentials = {
  clientId: 'c0d3ae62e6e74f0baa142965fcaa68c6',
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUri: 'http://localhost:3000/callback',
};

const spotifyApi = new SpotifyWebApi(credentials);

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

router.post('/playlist', (req, res) => {
  console.log(req);
  spotifyApi.createPlaylist(req.body.userId, req.body.playlistName, { 'public': true })
    .then((data) => {
      return res.status(200).send(data);
    }, (err) => {
      console.log(err);
      return res.status(500).send(err);
    });

});

router.post('/addSong', (req, res) => {

  console.log(req);
  spotifyApi.addTracksToPlaylist(req.body.playlistId, ['spotify:track:' + req.body.songId])
    .then((data) => {
      return res.status(200).send(data);
    }, (err) => {
      console.log(err);
      return res.status(500).send(err);
    });

});

export default router;
