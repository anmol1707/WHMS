var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    return res.status(200).json({
        message: "Server runnning"
    });
});

module.exports = router;
