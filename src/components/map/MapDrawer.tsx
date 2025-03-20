
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
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry, Polygon } from 'ol/geom';
import { getArea } from 'ol/sphere';
import 'ol/ol.css';

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
  const drawInteractionRef = useRef<Draw | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);
  const geoJSONFormat = useRef(new GeoJSON());
  const [area, setArea] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

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

  const clearInteractions = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    
    if (modifyInteractionRef.current) {
      map.removeInteraction(modifyInteractionRef.current);
      modifyInteractionRef.current = null;
    }
    
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
      snapInteractionRef.current = null;
    }
  };

  const setupInteractions = () => {
    const map = mapInstanceRef.current;
    if (!map || readOnly) return;
    
    // Clear existing interactions first
    clearInteractions();
    
    // Add modify interaction
    const modify = new Modify({ source: vectorSourceRef.current });
    map.addInteraction(modify);
    modifyInteractionRef.current = modify;

    // Add draw interaction if there are no features yet
    if (vectorSourceRef.current.getFeatures().length === 0) {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: 'Polygon',
      });
      
      map.addInteraction(draw);
      drawInteractionRef.current = draw;

      // Listen for drawing end to update the value
      draw.on('drawend', (event) => {
        // Clear other features if we only want one polygon
        const features = vectorSourceRef.current.getFeatures();
        if (features.length > 1) {
          vectorSourceRef.current.clear();
          vectorSourceRef.current.addFeature(event.feature);
        }
        
        // Calculate area
        if (event.feature.getGeometry() instanceof Polygon) {
          calculateArea(event.feature.getGeometry() as Polygon);
        }
        
        updateValue();
      });
    }

    // Add snap interaction
    const snap = new Snap({ source: vectorSourceRef.current });
    map.addInteraction(snap);
    snapInteractionRef.current = snap;

    // Listen for modifications
    modify.on('modifyend', () => {
      const features = vectorSourceRef.current.getFeatures();
      if (features.length > 0 && features[0].getGeometry() instanceof Polygon) {
        calculateArea(features[0].getGeometry() as Polygon);
      }
      updateValue();
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source and layer for the drawings
    const vectorSource = vectorSourceRef.current;
    
    // Define style for the polygon
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
        center: fromLonLat(initialCenter),
        zoom: 5,
      }),
    });

    mapInstanceRef.current = map;

    // If we have an existing polygon value, add it to the map
    if (value) {
      try {
        console.log("MapDrawer - Initializing with GeoJSON:", value);
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
        console.error('Error parsing GeoJSON in init:', error);
        
        // In case of error, ensure the value is reset to avoid further issues
        if (onChange) {
          onChange('');
        }
      }
    }

    // Setup interactions if not in readonly mode
    setupInteractions();
    setInitialized(true);

    // Cleanup function
    return () => {
      clearInteractions();
      if (map) {
        map.dispose();
      }
    };
  }, [readOnly, initialCenter]);

  // Update when value changes externally
  useEffect(() => {
    if (!mapInstanceRef.current || !initialized) return;
    
    if (value && vectorSourceRef.current) {
      try {
        console.log("MapDrawer - Value changed externally:", value);
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
        console.error('Error parsing GeoJSON in update:', error);
        
        // Reset the value if there's an error
        if (onChange) {
          onChange('');
        }
      }
    } else if (value === '') {
      // If value is explicitly set to empty string, clear features
      vectorSourceRef.current.clear();
      setArea(0);
    }
    
    // Ensure interactions are set up if the map value changes
    setupInteractions();
  }, [value, initialized]);

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
    
    console.log("MapDrawer - Updating value with GeoJSON:", geoJSON);
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
      
      // Re-setup interactions to enable drawing again
      setupInteractions();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-mono-200" 
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
