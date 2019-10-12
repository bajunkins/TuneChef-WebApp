import express from 'express';
import bodyParser from 'body-parser';

// import Party from '../models/partyModel';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  return res.status(200).send('Yay!!!');
});

export default router;
