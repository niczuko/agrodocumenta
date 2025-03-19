
import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry, Polygon } from 'ol/geom';
import 'ol/ol.css';
import { getArea } from 'ol/sphere';

interface MapDrawerProps {
  value?: string;
  onChange?: (value: string) => void;
  onAreaChange?: (areaHectares: number) => void;
  readOnly?: boolean;
  initialCenter?: [number, number];
  height?: string;
  className?: string;
}

const MapDrawer: React.FC<MapDrawerProps> = ({
  value,
  onChange,
  onAreaChange,
  readOnly = false,
  initialCenter = [-51.9, -14.2], // Default center in Brazil
  height = '400px',
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Geometry>>(new VectorSource());
  const geoJSONFormat = useRef(new GeoJSON());
  const [drawInteraction, setDrawInteraction] = useState<Draw | null>(null);
  const [area, setArea] = useState<number>(0);

  // Calculate area of polygon in hectares
  const calculateArea = (polygon: Polygon) => {
    const areaInSquareMeters = getArea(polygon);
    const areaInHectares = areaInSquareMeters / 10000; // Convert to hectares (1 hectare = 10,000 m²)
    setArea(areaInHectares);
    if (onAreaChange) {
      onAreaChange(areaInHectares);
    }
    return areaInHectares;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source and layer for the drawings
    const vectorSource = vectorSourceRef.current;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(51, 153, 204, 0.2)',
        }),
        stroke: new Stroke({
          color: '#3399CC',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#3399CC',
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
        center: fromLonLat(initialCenter),
        zoom: 5,
      }),
    });

    mapInstanceRef.current = map;

    // If we have an existing polygon value, add it to the map
    if (value) {
      try {
        const features = geoJSONFormat.current.readFeatures(value, {
          featureProjection: 'EPSG:3857',
        });
        
        vectorSource.clear(); // Clear any existing features
        vectorSource.addFeatures(features);
        
        // Zoom to the feature
        if (features.length > 0) {
          const extent = vectorSource.getExtent();
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18,
          });
          
          // Calculate and set area if a polygon exists
          const feature = features[0];
          if (feature.getGeometry() instanceof Polygon) {
            calculateArea(feature.getGeometry() as Polygon);
          }
        }
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    }

    // Setup drawing interaction if not readOnly
    if (!readOnly) {
      // Add modify interaction
      const modify = new Modify({ source: vectorSource });
      map.addInteraction(modify);

      // Add draw interaction
      const draw = new Draw({
        source: vectorSource,
        type: 'Polygon',
      });
      
      map.addInteraction(draw);
      setDrawInteraction(draw);

      // Add snap interaction
      const snap = new Snap({ source: vectorSource });
      map.addInteraction(snap);

      // Listen for drawing end to update the value
      draw.on('drawend', (event) => {
        // Clear other features if we only want one polygon
        const features = vectorSource.getFeatures();
        if (features.length > 1) {
          vectorSource.clear();
          vectorSource.addFeature(event.feature);
        }
        
        // Calculate area
        if (event.feature.getGeometry() instanceof Polygon) {
          calculateArea(event.feature.getGeometry() as Polygon);
        }
        
        updateValue();
      });

      // Listen for modifications
      modify.on('modifyend', (e) => {
        const features = vectorSource.getFeatures();
        if (features.length > 0 && features[0].getGeometry() instanceof Polygon) {
          calculateArea(features[0].getGeometry() as Polygon);
        }
        updateValue();
      });
    }

    // Cleanup function
    return () => {
      map.dispose();
    };
  }, [readOnly, initialCenter]);

  // Update when value changes externally
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (value && vectorSourceRef.current) {
      try {
        const features = geoJSONFormat.current.readFeatures(value, {
          featureProjection: 'EPSG:3857',
        });
        
        vectorSourceRef.current.clear();
        vectorSourceRef.current.addFeatures(features);
        
        // Calculate area
        if (features.length > 0 && features[0].getGeometry() instanceof Polygon) {
          calculateArea(features[0].getGeometry() as Polygon);
        }
        
        // Zoom to feature
        if (features.length > 0) {
          const extent = vectorSourceRef.current.getExtent();
          mapInstanceRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18,
          });
        }
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    } else if (!value) {
      vectorSourceRef.current.clear();
      setArea(0);
    }
  }, [value]);

  // Update the GeoJSON value
  const updateValue = () => {
    if (!onChange) return;
    
    const features = vectorSourceRef.current.getFeatures();
    if (features.length === 0) {
      onChange('');
      return;
    }

    // Convert features to GeoJSON
    const geoJSON = geoJSONFormat.current.writeFeatures(features, {
      featureProjection: 'EPSG:3857',
    });
    
    onChange(geoJSON);
  };

  // Provide a way to clear the drawing
  const clearDrawing = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      setArea(0);
      if (onChange) {
        onChange('');
      }
      if (onAreaChange) {
        onAreaChange(0);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full rounded-md border border-mono-200" 
        style={{ height }}
      />
      
      <div className="absolute bottom-2 left-2 z-10 p-2 bg-white/90 rounded-md shadow-sm border border-mono-200">
        <div className="text-sm text-mono-700">
          <span className="font-medium">Área:</span> {area.toFixed(2)} hectares
        </div>
      </div>
      
      {!readOnly && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button
            type="button"
            onClick={clearDrawing}
            className="p-2 bg-white rounded-md shadow-sm border border-mono-200 hover:bg-mono-100 text-red-500"
            title="Limpar desenho"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default MapDrawer;
