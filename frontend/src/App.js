import logo from './logo.svg';
import './App.css';
import { React, useEffect, useState } from "react";
import { MapContainer, TileLayer, Tooltip, Popup, Rectangle } from 'react-leaflet'
import Gradient from "javascript-color-gradient";


function App() {
  const colorGradient = new Gradient();
  const color1 = "#0D1687"
  const color2 = "#CC4878";
  const color3 = "#F3FA56";
  colorGradient.setGradient(color1, color2, color3);
  colorGradient.setMidpoint(12);

  const [Rectangles, setRectangles] = useState([])
  useEffect(() => {
    async function fetchTiles() {
      var tiles = await fetch("http://localhost:3001/api/airbnb")
      tiles = await tiles.json()
      var rects = []
      for (let tile of tiles) {
        if (tile.price == undefined) {
          continue
        }
        const bounds = [[tile.llLat, tile.llLon], [tile.urLat, tile.urLon]]
        const color = colorGradient.getColor(parseInt(tile.price / 10000) + 1)

        const rectangle = <Rectangle
          bounds={bounds}
          pathOptions={{ fillColor: color, opacity: 0.0, color: 'black', fillOpacity: 0.35 }}
          key={tile._id}>
          <Tooltip sticky opacity='0.8'>
            R{(tile.price / 1000).toString().replace('.', ' ')}
          </Tooltip>
        </Rectangle>

        rects.push(rectangle)
      }
      setRectangles(rects)
    }
    fetchTiles()
  }, [])
  return (
    <MapContainer center={[25, 12]} zoom={3}>
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=fb9b22d6-25da-4bba-b571-809c6c73fe72"
      />
      {Rectangles.map((comp, i) => { return comp })}
    </MapContainer>
  );
}

export default App;

// var Jawg_Matrix = L.tileLayer('https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
// attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// minZoom: 0,
// maxZoom: 22,
// subdomains: 'abcd',
// accessToken: '<your accessToken>'

// var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
// 	maxZoom: 20,
// 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
// });