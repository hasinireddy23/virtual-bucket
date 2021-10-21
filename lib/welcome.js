var express = require("express");
var router = express.Router();

function welcomePage(req, res, next) {
    res.send('Hello  World!');
}

router.get('/', welcomePage);

module.exports = router;