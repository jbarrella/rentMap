const { MongoClient } = require("mongodb");

exports.handler = async function (event, context) {
    const mongoPass = process.env.MONGO_PASS

    const uri = `mongodb+srv://jbarrella:${mongoPass}@cluster0.hglap.mongodb.net/rentalPriceMap?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect()

    const tilesCollection = client.db("rentalPriceMap").collection("priceTiles");

    const allTiles = []
    await tilesCollection.find({}).forEach((x) => allTiles.push(x))

    client.close()

    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ tiles: allTiles })
    };
};
