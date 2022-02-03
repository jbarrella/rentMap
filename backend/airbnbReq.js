const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');

let tilesCollection
let sweepsCollection

async function connectToDB() {
    const keys = JSON.parse(fs.readFileSync('data/keys.json'));
    const mongoPass = keys.mongoPass

    const uri = `mongodb+srv://jbarrella:${mongoPass}@cluster0.hglap.mongodb.net/rentalPriceMap?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect().catch((e) => { console.log(e) })

    tilesCollection = client.db("rentalPriceMap").collection("priceTiles");
    sweepsCollection = client.db("rentalPriceMap").collection("sweeps");
}

async function insertSweep(sweep) {
    const inserted = await sweepsCollection.insertOne(sweep)
    console.log(inserted)
}

async function insertTiles(tiles) {
    const inserted = await tilesCollection.insertMany(tiles)
    console.log(inserted)
}

async function getAveragePrice(llLon, llLat, urLon, urLat) {
    const headers = {
        "accept-language": "en-US,en;q=0.9",
        "x-airbnb-api-key": "d306zoyjsyarp7ifhu67rjxn52tv0t20",
    }

    var url = `https://www.airbnb.co.za/api/v3/ExploreSections?operationName=ExploreSections&locale=en&` +
        `currency=ZAR&_cb=0mwbghl1fjmxv81dhx9eh07r8bhl&variables=%7B%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn` +
        `%22%3Afalse%2C%22cdnCacheSafe%22%3Afalse%2C%22source%22%3A%22EXPLORE%22%2C%22exploreRequest%22%3A%7B` +
        `%22metadataOnly%22%3Afalse%2C%22version%22%3A%221.8.3%22%2C%22itemsPerGrid%22%3A20%2C%22tabId%22%3A` +
        `%22home_tab%22%2C%22refinementPaths%22%3A%5B%22%2Fhomes%22%5D%2C%22flexibleTripDates%22%3A%5B%22april` +
        `%22%2C%22december%22%2C%22february%22%2C%22january%22%2C%22march%22%2C%22may%22%5D%2C%22datePickerType%22%3A%22flexible_dates%22%2C%22placeId` +
        `%22%3A%22ChIJ1-4miA9QzB0Rh6ooKPzhf2g%22%2C%22source%22%3A%22structured_search_input_header%22%2C%22searchType%22%3A%22user_map_move` +
        `%22%2C%22neLat%22%3A%22${urLat}%22%2C%22neLng%22%3A%22${urLon}%22%2C%22swLat%22%3A%22${llLat}%22%2C%22swLng` +
        `%22%3A%22${llLon}%22%2C%22searchByMap%22%3Atrue%2C%22flexibleTripLengths%22%3A%5B%22one_month%22%5D%2C%22quer` +
        `y%22%3A%22Cape%20Town%2C%20Western%20Cape%2C%20South%20Africa%22%2C%22cdnCacheSafe%22%3Afalse%2C%22treatmentFl` +
        `ags%22%3A%5B%22flex_destinations_june_2021_launch_web_treatment%22%2C%22new_filter_bar_v2_fm_header%22%2C%22mer` +
        `ch_header_breakpoint_expansion_web%22%2C%22storefronts_nov23_2021_homepage_web_treatment%22%2C%22flexible_dates` +
        `_options_extend_one_three_seven_days%22%2C%22super_date_flexibility%22%2C%22micro_flex_improvements%22%2C%22mic` +
        `ro_flex_show_by_default%22%2C%22search_input_placeholder_phrases%22%2C%22pets_fee_treatment%22%5D%2C%22screenSi` +
        `ze%22%3A%22large%22%2C%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn%22%3Afalse%7D%7D&extensions=%7B%22persistedQue` +
        `ry%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%222c163f91188732b966435468fc32999ca0f2d09f667de95c26e04a1337b1` +
        `ce91%22%7D%7D`

    const { data } = await axios.get(url, { headers })
        .catch((e) => { console.log(e) })

    for (section of data['data']['presentation']['explore']['sections']["sections"]) {
        let sectionTitle = section['sectionComponentType']
        if (sectionTitle == 'EXPLORE_FILTER') {
            try {
                var averagePrice = section["section"]["filterItems"][0]["metadata"]["averagePrice"]
                break
            }
            catch (e) {
            }
        }
        if (sectionTitle == 'EXPLORE_STRUCTURED_PAGE_TITLE') {
            var nPoints = parseInt(section['section']['structuredTitle'].split(' ')[0])
        }

    }

    return [averagePrice, nPoints]
}

async function getTiles(boxes, region, nTiles) {
    const box = boxes[region]
    const [lonStart, latStart, lonStop, latStop] = box

    const lonStep = (lonStop - lonStart) / nTiles
    const latStep = (latStop - latStart) / nTiles

    let sweep = {
        name: region,
        bounds: { lon1: lonStart, lon2: lonStop, lat1: latStart, lat2: latStop },
        timestamp: new Date().toISOString()
    }

    let tiles = []
    for (i of [...Array(nTiles ** 2).keys()]) {
        const llLon = lonStart + lonStep * (i % nTiles)
        const llLat = latStart + latStep * parseInt(i / nTiles)
        const urLon = lonStart + lonStep * ((i % nTiles) + 1)
        const urLat = latStart + latStep * (parseInt(i / nTiles) + 1)

        const [averagePrice, nPoints] = await getAveragePrice(llLon, llLat, urLon, urLat)
        console.log(i, averagePrice, nPoints)

        const tile = {
            lon1: llLon,
            lat1: llLat,
            lon2: urLon,
            lat2: urLat,
            price: averagePrice,
            nPoints: nPoints,
        }

        tiles.push(tile)
        await new Promise(res => setTimeout(res, 1000));
    }
    sweep.tiles = tiles
    insertSweep(sweep)
}


async function sweep() {
    await connectToDB()
    // tilesCollection.deleteMany({ "llLat": { $gt: 0 } })

    const nTiles = 64
    const region = 'europe'
    const boxes = require('./data/boundingBoxes.json')

    getTiles(boxes, region, nTiles)
}

sweep()

// https://boundingbox.klokantech.com/