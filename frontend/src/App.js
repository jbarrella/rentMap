import './App.css';
import { React, useEffect, useState } from "react";
import { MapContainer, TileLayer, Tooltip, Rectangle, useMap } from 'react-leaflet'
import Gradient from "javascript-color-gradient";
import { ChakraProvider, Checkbox } from '@chakra-ui/react'


export default function App() {
  const initialRegions = {
    europe: false, 'n. america': false, 's. america': false,
    'south africa': true, 'cape town': true, asia: false, australia: false, africa: false
  }
  const [checkedRegions, setCheckedRegions] = useState(initialRegions)
  const [sweeps, setSweeps] = useState([])

  const colorGradient = new Gradient();
  const nColors = 10
  const maxColor = 120000
  const colorStep = maxColor / nColors
  const [color1, color2, color3] = ["#0D1687", "#CC4878", "#F3FA56"]

  colorGradient.setGradient(color1, color2, color3);
  colorGradient.setMidpoint(nColors);

  useEffect(() => {
    async function fetchSweeps() {
      const res = (await fetch('https://rentmap.netlify.app/.netlify/functions/getTiles'))
      const allSweeps = (await res.json()).sweeps
      setSweeps(allSweeps)
    }
    fetchSweeps()
  }, [])

  const Tiles = ({ checkedRegions }) => {
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
    for (let isweep of sweeps) {
      for (let jsweep of sweeps) {
        if (jsweep == isweep) {
          continue
        }

        // determine resolution of sweeps
        const isweepRes = ((isweep.bounds.lon2 - isweep.bounds.lon1) * (isweep.bounds.lat2 - isweep.bounds.lat1)) / isweep.tiles.length
        const jsweepRes = ((jsweep.bounds.lon2 - jsweep.bounds.lon1) * (jsweep.bounds.lat2 - jsweep.bounds.lat1)) / jsweep.tiles.length
        if (jsweepRes < isweepRes) {
          // avoid double counting
          continue
        }

        // hide overlapping tiles with lower resolution
        if (isweep.bounds.lon1 < jsweep.bounds.lon2 && isweep.bounds.lon2 > jsweep.bounds.lon1
          && isweep.bounds.lat1 < jsweep.bounds.lat2 && isweep.bounds.lat2 > jsweep.bounds.lat1) {
          for (let tile of jsweep.tiles) {
            if (tile.lon1 < isweep.bounds.lon2 && tile.lon2 > isweep.bounds.lon1
              && tile.lat1 < isweep.bounds.lat2 && tile.lat2 > isweep.bounds.lat1) {
                // tiles with null price are not drawn
                tile.price = null
            }

          }
        }
      }
    }

    for (let sweep of sweeps) {
      // do not display sweeps of regions that are not selected by user 
      if (!(Object.entries(checkedRegions).some(([region, isChecked]) => {
        return (sweep.name).includes(region) && isChecked
      }))) {
        continue
      }

      let i = 0
      for (let tile of sweep.tiles) {
        if (tile.price == undefined || tile.nPoints <= 1) {
          continue
        }
        const bounds = [[tile.lat1, tile.lon1], [tile.lat2, tile.lon2]]
        const color = colorGradient.getColor(parseInt(tile.price / colorStep) + 1)

        const rectangle = <Rectangle
          bounds={bounds}
          pathOptions={{ fillColor: color, opacity: 0.0, color: 'black', fillOpacity: 0.35 }}
          key={sweep._id + i}
          eventHandlers={{ mouseover: hover, mouseout: stopHover, click: zoom }}>
          <Tooltip sticky opacity='0.8'>
            R{(tile.price / 1000).toString().replace('.', ' ')}
            <br />{tile.nPoints == 300 ? '300+' : tile.nPoints} properties
          </Tooltip>
        </Rectangle>

        rectangles.push(rectangle)
        i++;
      }
    }
    return rectangles
  }

  const onChange = (e) => {
    setCheckedRegions({ ...checkedRegions, [e.target.id]: e.target.checked })
  }

  return (
    <ChakraProvider>
      <div>
        <div className='container legendBox'>
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
            Avg. rent pm <br /> in kZAR
          </div>
        </div>
        <MapContainer center={[25, 12]} zoom={3} minZoom={3} maxZoom={11}>
          <TileLayer
            attribution='&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=fb9b22d6-25da-4bba-b571-809c6c73fe72"
          />
          <Tiles checkedRegions={checkedRegions} />
        </MapContainer>
        <div className='container authorBox'>
          <a href="https://jasonbarrella.netlify.app/">by <span style={{ color: '#7F6DF2' }}>JB</span></a>
        </div>
        <div className='container optionsBox'>
          <span style={{ color: '#bfbfbf' }}>Show:</span>
          <Checkbox id='africa' onChange={onChange}>Africa</Checkbox>
          <Checkbox id='asia' onChange={onChange}>Asia</Checkbox>
          <Checkbox isDisabled id='australia' onChange={onChange}>Australia</Checkbox>
          <Checkbox id='europe' onChange={onChange}>Europe</Checkbox>
          <Checkbox id='n. america' onChange={onChange}>N. America</Checkbox>
          <Checkbox isDisabled id='s. america' onChange={onChange}>S. America</Checkbox>
        </div>
      </div>
    </ChakraProvider>
  );
}
