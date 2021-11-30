const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const { get } = require('http');

var tilesCollection

async function insertTile(tile) {
    const inserted = await tilesCollection.insertOne(tile)
    console.log(inserted)
}

async function insertTiles(tiles) {
    const inserted = await tilesCollection.insertMany(tiles)
    console.log(inserted)
}


async function connectToDB() {
    const keys = JSON.parse(fs.readFileSync('keys.json'));
    const mongoPass = keys.mongoPass

    const uri = `mongodb+srv://jbarrella:${mongoPass}@cluster0.hglap.mongodb.net/rentalPriceMap?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect()

    tilesCollection = client.db("rentalPriceMap").collection("priceTiles");
}

async function getAveragePrice(llLon, llLat, urLon, urLat) {
    const headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "device-memory": "8",
        "dpr": "1.25",
        "ect": "4g",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "viewport-width": "1238",
        "x-airbnb-api-key": "d306zoyjsyarp7ifhu67rjxn52tv0t20",
        "x-airbnb-graphql-platform": "web",
        "x-airbnb-graphql-platform-client": "minimalist-niobe",
        "x-airbnb-supports-airlock-v2": "true",
        "x-csrf-token": "V4$.airbnb.co.za$awCsSKxL0LU$UfIb4mkoe_0RiY-uICP1gWXn26pnTu_CZivJUbtjIuk=",
        "x-csrf-without-token": "1",
        "x-niobe-short-circuited": "true",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    }

    var url = `https://www.airbnb.co.za/api/v3/ExploreSections?operationName=ExploreSections&locale=en&` +
        `currency=ZAR&_cb=0foko1p11x5f2y0wk6n9r07vzo9n&variables=%7B%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn` +
        `%22%3Afalse%2C%22cdnCacheSafe%22%3Afalse%2C%22source%22%3A%22EXPLORE%22%2C%22exploreRequest%22%3A%7B` +
        `%22metadataOnly%22%3Afalse%2C%22version%22%3A%221.8.3%22%2C%22itemsPerGrid%22%3A20%2C%22tabId%22%3A` +
        `%22home_tab%22%2C%22refinementPaths%22%3A%5B%22%2Fhomes%22%5D%2C%22flexibleTripDates%22%3A%5B%22april` +
        `%22%2C%22march%22%2C%22may%22%5D%2C%22datePickerType%22%3A%22flexible_dates%22%2C%22placeId` +
        `%22%3A%22ChIJS_zBNNbXAhURy-FuRT5ib9k%22%2C%22flexibleTripLengths%22%3A%5B%22one_month%22%5D%2C%22adults` +
        `%22%3A1%2C%22source%22%3A%22structured_search_input_header%22%2C%22searchType%22%3A%22user_map_move` +
        `%22%2C%22priceMax%22%3A12359%2C%22neLat%22%3A%22${urLat}%22%2C%22neLng%22%3A%22${urLon}` +
        `%22%2C%22swLat%22%3A%22${llLat}%22%2C%22swLng%22%3A%22${llLon}%22%2C%22searchByMap` +
        `%22%3Atrue%2C%22query%22%3A%22Jerusalem%2C%20Israel%22%2C%22cdnCacheSafe%22%3Afalse%2C%22treatmentFlags` +
        `%22%3A%5B%22flex_destinations_june_2021_launch_web_treatment%22%2C%22new_filter_bar_v2_fm_header` +
        `%22%2C%22merch_header_breakpoint_expansion_web%22%2C%22storefronts_nov23_2021_homepage_web_treatment%22%2C` +
        `%22flexible_dates_options_extend_one_three_seven_days%22%2C%22super_date_flexibility%22%2C%22micro_flex_improvements` +
        `%22%2C%22micro_flex_show_by_default%22%2C%22search_input_placeholder_phrases%22%2C%22pets_fee_treatment%22%5D%2C` +
        `%22screenSize%22%3A%22large%22%2C%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn%22%3Afalse%7D%7D&extensions=%7B%22` +
        `persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22` +
        `f4b0bf3d59df44a79c73e4e6d43267f3e28126d806af5bb995590147043397f5%22%7D%7D`

    const { data } = await axios.get(url, { headers }).catch((e) => { console.log(e) })

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

async function getTiles(lonStart, lonStop, latStart, latStop) {
    const nTiles = 20
    const lonStep = (lonStop - lonStart) / nTiles
    const latStep = (latStop - latStart) / nTiles

    tiles = []
    for (i of [...Array(nTiles ** 2).keys()]) {
        if (i < 222) {
            continue
        }
        console.log(i)
        const llLon = lonStart + lonStep * (i % nTiles)
        const llLat = latStart + latStep * parseInt(i / nTiles)
        const urLon = lonStart + lonStep * ((i % nTiles) + 1)
        const urLat = latStart + latStep * (parseInt(i / nTiles) + 1)

        const [averagePrice, nPoints] = await getAveragePrice(llLon, llLat, urLon, urLat)
        console.log(averagePrice)

        const tile = {
            "llLon": llLon,
            "llLat": llLat,
            "urLon": urLon,
            "urLat": urLat,
            "price": averagePrice,
            'nPoints': nPoints,
            "timestamp": Date.now()
        }

        tiles.push(tile)
        if (i % 10 == 0) {
            insertTiles(tiles)
            tiles = []
        }

        // insertTile(tile)
    }

}

async function doStuff() {
    await connectToDB()
    // tilesCollection.deleteMany({ "llLat": { $gt: 0 } })

    // Cape Town
    // getTiles(18.282030, 18.908250, -34.390757, -33.719480)

    // EU
    // getTiles(-10.033260, 29.127248, 35.632172, 60.246205)

    // Asia
    getTiles(-10.033260, 29.127248, 35.632172, 60.246205)
}

doStuff()
