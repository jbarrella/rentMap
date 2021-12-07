const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const { getTTFB } = require('web-vitals');
// const { get } = require('http');

let tilesCollection
let sweepsCollection

async function connectToDB() {
    const keys = JSON.parse(fs.readFileSync('keys.json'));
    const mongoPass = keys.mongoPass

    const uri = `mongodb+srv://jbarrella:${mongoPass}@cluster0.hglap.mongodb.net/rentalPriceMap?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect().catch((err) => { console.log(err) })

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

    // var url = `https://www.airbnb.co.za/api/v3/ExploreSections?operationName=ExploreSections&locale=en&` +
    //     `currency=ZAR&_cb=0foko1p11x5f2y0wk6n9r07vzo9n&variables=%7B%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn` +
    //     `%22%3Afalse%2C%22cdnCacheSafe%22%3Afalse%2C%22source%22%3A%22EXPLORE%22%2C%22exploreRequest%22%3A%7B` +
    //     `%22metadataOnly%22%3Afalse%2C%22version%22%3A%221.8.3%22%2C%22itemsPerGrid%22%3A20%2C%22tabId%22%3A` +
    //     `%22home_tab%22%2C%22refinementPaths%22%3A%5B%22%2Fhomes%22%5D%2C%22flexibleTripDates%22%3A%5B%22april` +
    //     `%22%2C%22march%22%2C%22may%22%5D%2C%22datePickerType%22%3A%22flexible_dates%22%2C%22placeId` +
    //     `%22%3A%22ChIJS_zBNNbXAhURy-FuRT5ib9k%22%2C%22flexibleTripLengths%22%3A%5B%22one_month%22%5D%2C%22adults` +
    //     `%22%3A1%2C%22source%22%3A%22structured_search_input_header%22%2C%22searchType%22%3A%22user_map_move` +
    //     `%22%2C%22priceMax%22%3A12359%2C%22neLat%22%3A%22${urLat}%22%2C%22neLng%22%3A%22${urLon}` +
    //     `%22%2C%22swLat%22%3A%22${llLat}%22%2C%22swLng%22%3A%22${llLon}%22%2C%22searchByMap` +
    //     `%22%3Atrue%2C%22query%22%3A%22Jerusalem%2C%20Israel%22%2C%22cdnCacheSafe%22%3Afalse%2C%22treatmentFlags` +
    //     `%22%3A%5B%22flex_destinations_june_2021_launch_web_treatment%22%2C%22new_filter_bar_v2_fm_header` +
    //     `%22%2C%22merch_header_breakpoint_expansion_web%22%2C%22storefronts_nov23_2021_homepage_web_treatment%22%2C` +
    //     `%22flexible_dates_options_extend_one_three_seven_days%22%2C%22super_date_flexibility%22%2C%22micro_flex_improvements` +
    //     `%22%2C%22micro_flex_show_by_default%22%2C%22search_input_placeholder_phrases%22%2C%22pets_fee_treatment%22%5D%2C` +
    //     `%22screenSize%22%3A%22large%22%2C%22isInitialLoad%22%3Atrue%2C%22hasLoggedIn%22%3Afalse%7D%7D&extensions=%7B%22` +
    //     `persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22` +
    //     `f4b0bf3d59df44a79c73e4e6d43267f3e28126d806af5bb995590147043397f5%22%7D%7D`

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

async function getTiles(lonStart, latStart, lonStop, latStop) {
    const lonStep = (lonStop - lonStart) / NTILES
    const latStep = (latStop - latStart) / NTILES

    let sweep = {
        name: SWEEP_NAME,
        bounds: { lon1: lonStart, lon2: lonStop, lat1: latStart, lat2: latStop },
        timestamp: new Date().toISOString()
    }

    let tiles = []
    for (i of [...Array(NTILES ** 2).keys()]) {
        // if (i < 16) {
        //     continue
        // }

        const llLon = lonStart + lonStep * (i % NTILES)
        const llLat = latStart + latStep * parseInt(i / NTILES)
        const urLon = lonStart + lonStep * ((i % NTILES) + 1)
        const urLat = latStart + latStep * (parseInt(i / NTILES) + 1)

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

const NTILES = 12
const SWEEP_NAME = 'africa south'

async function doStuff() {
    await connectToDB()
    // tilesCollection.deleteMany({ "llLat": { $gt: 0 } })

    // Cape Town
    // getTiles(18.300011, -34.367532, 18.76457, -33.786825)

    // EU
    // getTiles(-11.26, 36.01, 30.45, 60.5)

    // South Africa
    // getTiles(16.26, -35.06, 33.37, -21.92)

    // Asia north
    // getTiles(33.28, 27.93, 124.34, 53.12)

    // Asia south
    // getTiles(66.26, 5.9, 126.98, 27.64)

    // North america south
    // getTiles(-124.84, 12.82, -61.79, 49.26)

    // Africa north
    // getTiles(-18.2,4.0,33.6,35.9)

    // Africa south
    getTiles(8.7,-26.0,50.4,3.8)
}

doStuff()

// https://boundingbox.klokantech.com/