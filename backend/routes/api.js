var express = require("express");
var router = express.Router();
var airbnbRouter = require('./airbnb');

/* GET home page. */
router.get("/", function (req, res) {
  res.json({
    message: "General purpose api",
  });
});

router.use("/airbnb", airbnbRouter);

module.exports = router;
