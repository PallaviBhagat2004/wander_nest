const express = require('express');
const { smartSearch, chat } = require('../controllers/aiController');

const router = express.Router();

router.post('/search', smartSearch);
router.post('/chat', chat);

module.exports = router;
