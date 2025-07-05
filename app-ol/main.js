import 'ol/ol.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import MVT from 'ol/format/MVT.js';
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import TileDebugSource from 'ol/source/TileDebug.js';


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing OpenLayers map (via NPM).');

    // 1. Define the URL template for your MBTiles source from Martin
    const mbtilesUrlTemplate = 'http://localhost:3000/SG/{z}/{x}/{y}';

    // 2. Create a new VectorTile source for your MBTiles
    const mbtilesSource = new VectorTileSource({
        format: new MVT(),
        url: mbtilesUrlTemplate,
    });

    // 3. Create a VectorTile layer using the source
    const mbtilesLayer = new VectorTileLayer({
        source: mbtilesSource,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255, 0, 0, 0.6)',
                width: 1
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        properties: {
            renderBuffer: 0
        }
    });

    // 4. Create a TileDebug layer
    const debugLayer = new TileLayer({
        source: new TileDebugSource(),
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
    });

    // 5. Create the map instance
    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM()
            }),
            mbtilesLayer,
            debugLayer
        ],
        view: new View({
            center: fromLonLat([101.9758, 4.2105]),
            zoom: 5
        }),
    });

    // Add a click listener to log feature properties for debugging
    map.on('click', function(evt) {
        const coordinate = evt.coordinate;
        const features = map.getFeaturesAtPixel(evt.pixel);

        if (features && features.length > 0) {
            console.log("Clicked features at coordinate:", fromLonLat(coordinate, 'EPSG:3857', 'EPSG:4326'));
            features.forEach((feature, index) => {
                console.log(`Feature ${index + 1} Properties:`, feature.getProperties());
            });
        } else {
            console.log("No features clicked at coordinate:", fromLonLat(coordinate, 'EPSG:3857', 'EPSG:4326'));
        }
    });
});