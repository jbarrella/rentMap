var express = require('express');
var router = express.Router();
var fs = require('fs')
const { MongoClient } = require('mongodb');


/* GET users listing. */
router.get('/', async function (req, res, next) {
  const keys = JSON.parse(fs.readFileSync('keys.json'));
  const mongoPass = keys.mongoPass

  const uri = `mongodb+srv://jbarrella:${mongoPass}@cluster0.hglap.mongodb.net/rentalPriceMap?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  await client.connect()

  const tilesCollection = client.db("rentalPriceMap").collection("priceTiles");

  const allTiles = []
  await tilesCollection.find({}).forEach((x) => allTiles.push(x))

  res.json(allTiles);

  client.close()
});

module.exports = router;
