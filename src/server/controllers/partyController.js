import express from 'express';
import bodyParser from 'body-parser';


const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.get('', (req, res) => {
    return res.status(500).send('Yay!');
});

export default router;
