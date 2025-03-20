
import React, { useState, useEffect } from 'react';
import MapDrawer from './MapDrawer';
import { Glass } from '@/components/ui/Glass';

interface FazendaGeolocationProps {
  value?: string;
  onCoordinatesChange: (coordinates: string) => void;
  onAreaChange: (area: number) => void;
  initialArea?: string;
  readOnly?: boolean;
}

const FazendaGeolocation: React.FC<FazendaGeolocationProps> = ({
  value,
  onCoordinatesChange,
  onAreaChange,
  initialArea,
  readOnly = false,
}) => {
  const [mapValue, setMapValue] = useState<string>(value || '');
  const [calculatedArea, setCalculatedArea] = useState<number>(initialArea ? parseFloat(initialArea) : 0);

  useEffect(() => {
    // Update local state when value changes from parent
    if (value !== undefined) {
      setMapValue(value);
    }
  }, [value]);

  const handleMapChange = (geoJSON: string) => {
    console.log("FazendaGeolocation: Map changed, setting new geoJSON:", geoJSON);
    setMapValue(geoJSON);
    onCoordinatesChange(geoJSON);
  };

  const handleAreaChange = (areaHectares: number) => {
    console.log("FazendaGeolocation: Area changed:", areaHectares);
    setCalculatedArea(areaHectares);
    onAreaChange(areaHectares);
  };

  return (
    <Glass className="p-6">
      <h3 className="text-lg font-medium mb-3">Localização da Fazenda</h3>
      <p className="text-mono-600 mb-4">
        Desenhe a área da fazenda no mapa para calcular automaticamente a área total em hectares.
      </p>
      
      <MapDrawer 
        value={mapValue}
        onChange={handleMapChange}
        onAreaChange={handleAreaChange}
        readOnly={readOnly}
        height="500px"
      />
      
      <div className="mt-3 text-sm text-mono-500">
        Clique no mapa para adicionar pontos e desenhar o perímetro da fazenda. Para finalizar, clique no ponto inicial do polígono.
      </div>
    </Glass>
  );
};

export default FazendaGeolocation;
