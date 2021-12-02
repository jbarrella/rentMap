import logo from './logo.svg';
import './App.css';
import { React, useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Tooltip, Rectangle, useMap } from 'react-leaflet'
import Gradient from "javascript-color-gradient";


export default function App() {
  const colorGradient = new Gradient();
  const nColors = 10
  const maxColor = 120000
  const colorStep = maxColor / nColors
  const color1 = "#0D1687"
  const color2 = "#CC4878"
  const color3 = "#F3FA56"

  // const color1 = '#502EA8'
  // const color2 = '#E9446A'

  colorGradient.setGradient(color1, color2, color3);
  colorGradient.setMidpoint(nColors);

  const [tiles, setTiles] = useState([])
  useEffect(() => {
    async function fetchTiles() {
      const res = (await fetch('https://rentmap.netlify.app/.netlify/functions/getTiles'))
      const allTiles = (await res.body.json()).tiles

      setTiles(allTiles)

      // var tilesJson = await (await fetch("http://localhost:3001/api/airbnb")).json()
      // setTiles(tilesJson)
    }
    fetchTiles()
  }, [])

  const Tiles = () => {
    const map = useMap()

    const zoom = (e) => {
      map.fitBounds(e.target.getBounds(), { maxZoom: 8, animate: true, duration: 0.5 })
    }

    const hover = (e) => {
      e.target.setStyle({ 'opacity': '0.3' })
    }

    const stopHover = (e) => {
      e.target.setStyle({ 'opacity': '0.0' })
    }

    var rectangles = []
    for (let tile of tiles) {
      if (tile.price == undefined) {
        continue
      }
      const bounds = [[tile.llLat, tile.llLon], [tile.urLat, tile.urLon]]
      const color = colorGradient.getColor(parseInt(tile.price / colorStep) + 1)

      const rectangle = <Rectangle
        bounds={bounds}
        pathOptions={{ fillColor: color, opacity: 0.0, color: 'black', fillOpacity: 0.35 }}
        key={tile._id}
        eventHandlers={{ mouseover: hover, mouseout: stopHover, click: zoom }}
      >
        <Tooltip sticky opacity='0.8'>
          R{(tile.price / 1000).toString().replace('.', ' ')}
        </Tooltip>
      </Rectangle>

      rectangles.push(rectangle)

    }
    return rectangles
  }

  return (
    <div>
      <div className='title'>Rent Map</div>
      <div className='legendBox'>
        <div className='legend'>
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(1) }} /> {`${colorStep * 0 * 0.001} - ${colorStep * 1 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(2) }} /> {`${colorStep * 1 * 0.001} - ${colorStep * 2 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(3) }} /> {`${colorStep * 2 * 0.001} - ${colorStep * 3 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(4) }} /> {`${colorStep * 3 * 0.001} - ${colorStep * 4 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(5) }} /> {`${colorStep * 4 * 0.001} - ${colorStep * 5 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(6) }} /> {`${colorStep * 5 * 0.001} - ${colorStep * 6 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(7) }} /> {`${colorStep * 6 * 0.001} - ${colorStep * 7 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(8) }} /> {`${colorStep * 7 * 0.001} - ${colorStep * 8 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(9) }} /> {`${colorStep * 8 * 0.001} - ${colorStep * 9 * 0.001}`}
          <div className='legendEntry' style={{ 'background': colorGradient.getColor(10) }} />{`>${colorStep * 9 * 0.001}`}
        </div>
        <div className='legendInfo'>
          Monthly rent <br /> in kZAR
        </div>
      </div>
      <MapContainer center={[25, 12]} zoom={3} minZoom={3} maxZoom={10}>
        <TileLayer
          attribution='&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=fb9b22d6-25da-4bba-b571-809c6c73fe72"
        />
        <Tiles />
      </MapContainer>
      <div className='authorBox'>
        <a href="https://romantic-sinoussi-50af91.netlify.app/">by <span style={{ color: '#7F6DF2' }}>JB</span></a>
      </div>
    </div>
  );
}

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