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
import TileDebug from 'ol/source/TileDebug.js';
import { createXYZ } from 'ol/tilegrid';
import { get as getProjection } from 'ol/proj';

import layersData from "./layers.json";

const MIN_ZOOM = 3
const MAX_ZOOM = 20

async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error.message}`);
        return null;
    }
}

async function main() {
    const mapProjection = getProjection('EPSG:3857');
    const fullExtent = mapProjection.getExtent();

    // Set Map View
    const map = new Map({
        target: 'map',
        view: new View({
            center: fromLonLat([103.8198, 1.3521]),
            zoom: 10,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            projection: 'EPSG:3857'
        }),
    });

    // Set OSM Basemap
    const osmBasemap = new TileLayer({
        source: new OSM(),
        visible: layersData.osm.visible ?? true
    });
    map.addLayer(osmBasemap);

    // Set Tile Debug
    const debugLayer = new TileLayer({
        source: new TileDebug({
            projection: map.getView().getProjection(),
            tileGrid: createXYZ({
                extent: fullExtent,
                tileSize: 256,
                minZoom: MIN_ZOOM,
                maxZoom: MAX_ZOOM,
            }),
        }),
        visible: layersData.debug.visible ?? true,
        zIndex: 999
    });
    map.addLayer(debugLayer);

    // Set MBTiles Layers
    const tileLayersData = layersData.tiles
    for (let i = 0; i < tileLayersData.length; i++) {
        const layerConfig = tileLayersData[i];
        const tileName = layerConfig.id ?? "";
        const tileFillColor = layerConfig.fillColor ?? "yellow";
        const tileStrokeColor = layerConfig.strokeColor ?? "red";

        if (!tileName) {
            console.warn("Skipping layer with empty ID:", layerConfig);
            continue;
        }

        const tileInfo = await getData(`http://localhost:8001/${tileName}`);

        if (!tileInfo || !tileInfo.tiles || tileInfo.tiles.length === 0) {
            console.error(`Could not get tile URL for layer: ${tileName}. Skipping.`);
            continue;
        }

        const tileUrl = tileInfo.tiles[0];

        const mbtilesSource = new VectorTileSource({
            format: new MVT(),
            url: tileUrl,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            tileGrid: createXYZ({
                extent: fullExtent,
                tileSize: 256,
            }),
        });

        const mbtilesLayer = new VectorTileLayer({
            source: mbtilesSource,
            style: new Style({
                stroke: new Stroke({
                    color: tileStrokeColor,
                    width: 1
                }),
                fill: new Fill({
                    color: tileFillColor
                })
            }),
            renderMode: 'vector',
        });
        map.addLayer(mbtilesLayer);
    }

    const dirTilesConfigs = layersData.directoryTiles
    for (let i = 0; i < dirTilesConfigs.length; i++) {
        const tileConfig = dirTilesConfigs[i];
        const countryCode = tileConfig.id;

        if (!countryCode) {
            console.warn("Skipping directory tile with empty ID:", tileConfig);
            continue;
        }

        const dirTilesLayer = new VectorTileLayer({
            source: new VectorTileSource({
                format: new MVT(),
                tileUrlFunction: ([z, x, y]) => `http://localhost:8002/tiles/${countryCode}/${z}/${x}/${y}.${tileConfig.extension}`,
                minZoom: tileConfig.minZoom,
                maxZoom: tileConfig.maxZoom,
                tileGrid: createXYZ({
                    extent: fullExtent,
                    tileSize: 256,
                }),
            }),
            style: new Style({
                stroke: new Stroke({ color: tileConfig.strokeColor, width: 2 }),
                fill: new Fill({ color: tileConfig.fillColor })
            }),
            renderMode: 'vector',
            zIndex: 1000 + i,
        });
        map.addLayer(dirTilesLayer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});