
import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry, Polygon } from 'ol/geom';
import { getArea } from 'ol/sphere';
import 'ol/ol.css';

interface MapViewerProps {
  geoJSON?: string;
  height?: string;
  className?: string;
  showArea?: boolean;
}

const MapViewer: React.FC<MapViewerProps> = ({
  geoJSON,
  height = '300px',
  className = '',
  showArea = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const areaRef = useRef<number>(0);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source and layer for the drawings
    const vectorSource = new VectorSource<Geometry>();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(128, 128, 128, 0.2)', // Cinza com transparência
        }),
        stroke: new Stroke({
          color: '#666666', // Cinza médio
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#808080', // Cinza
          }),
        }),
      }),
    });

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-51.9, -14.2]), // Default center in Brazil
        zoom: 5,
      }),
    });

    mapInstance.current = map;

    // If we have GeoJSON, add it to the map
    if (geoJSON) {
      try {
        console.log("MapViewer - Initializing with GeoJSON:", geoJSON);
        const geoJSONFormat = new GeoJSON();
        const features = geoJSONFormat.readFeatures(geoJSON, {
          featureProjection: 'EPSG:3857',
        });
        
        vectorSource.addFeatures(features);
        
        // Calculate area if the first feature is a polygon
        if (features.length > 0 && features[0].getGeometry() instanceof Polygon) {
          const polygon = features[0].getGeometry() as Polygon;
          const areaInSquareMeters = getArea(polygon);
          const areaInHectares = areaInSquareMeters / 10000; // Convert to hectares
          areaRef.current = areaInHectares;
        }
        
        // Zoom to the feature
        if (features.length > 0) {
          const extent = vectorSource.getExtent();
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18,
          });
        }
      } catch (error) {
        console.error('Error parsing GeoJSON in MapViewer init:', error);
      }
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update the map when geoJSON changes
  useEffect(() => {
    if (!mapInstance.current) return;
    
    const map = mapInstance.current;
    const vectorLayer = map.getLayers().getArray().find(
      layer => layer instanceof VectorLayer
    ) as VectorLayer<VectorSource<Geometry>> | undefined;
    
    if (!vectorLayer) return;
    
    const vectorSource = vectorLayer.getSource();
    if (!vectorSource) return;
    
    // Clear existing features
    vectorSource.clear();
    areaRef.current = 0;
    
    // Add new features if we have GeoJSON
    if (geoJSON) {
      try {
        console.log("MapViewer - Updating with GeoJSON:", geoJSON);
        const geoJSONFormat = new GeoJSON();
        const features = geoJSONFormat.readFeatures(geoJSON, {
          featureProjection: 'EPSG:3857',
        });
        
        vectorSource.addFeatures(features);
        
        // Calculate area if the first feature is a polygon
        if (features.length > 0 && features[0].getGeometry() instanceof Polygon) {
          const polygon = features[0].getGeometry() as Polygon;
          const areaInSquareMeters = getArea(polygon);
          const areaInHectares = areaInSquareMeters / 10000; // Convert to hectares
          areaRef.current = areaInHectares;
        }
        
        // Zoom to the feature
        if (features.length > 0) {
          const extent = vectorSource.getExtent();
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18,
          });
        }
      } catch (error) {
        console.error('Error parsing GeoJSON in MapViewer update:', error, geoJSON);
      }
    }
  }, [geoJSON]);

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-mono-200 overflow-hidden" 
        style={{ height }}
      >
        {showArea && areaRef.current > 0 && (
          <div className="absolute bottom-2 left-2 z-10 p-2 bg-white/90 rounded-md shadow-sm border border-mono-200">
            <div className="text-sm text-mono-700">
              <span className="font-medium">Área:</span> {areaRef.current.toFixed(2)} hectares
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapViewer;
