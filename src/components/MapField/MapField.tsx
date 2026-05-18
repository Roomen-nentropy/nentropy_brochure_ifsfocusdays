import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

/** Map / drawing integration removed — no Leaflet or Google scripts. */

export interface MapConfig {
  mode?: 'draw' | 'view';
  allowedShapes?: Array<'marker' | 'rectangle' | 'polygon'>;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  enableSearch?: boolean;
  enableSatelliteView?: boolean;
  calculateArea?: boolean;
  showShapeInfo?: boolean;
  highlightShape?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableClearAll?: boolean;
  enableExport?: boolean;
  fitBounds?: boolean;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  };
  properties: {
    shapeType: 'marker' | 'rectangle' | 'polygon';
    area?: number;
    areaUnit?: string;
    timestamp: string;
  };
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface MapFieldProps {
  value?: GeoJSONData | null;
  onChange?: (geojson: GeoJSONData) => void;
  config?: MapConfig;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
}

const emptyCollection = (): GeoJSONData => ({
  type: 'FeatureCollection',
  features: [],
});

const MapField: React.FC<MapFieldProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  label,
}) => {
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setText(value ? JSON.stringify(value, null, 2) : '');
      setParseError(null);
    } catch {
      setText('');
    }
  }, [value]);

  const apply = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(text || '{}') as GeoJSONData;
      if (parsed?.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
        setParseError('JSON must be a GeoJSON FeatureCollection with a features array.');
        return;
      }
      onChange?.(parsed);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const clear = () => {
    const v = emptyCollection();
    setText(JSON.stringify(v, null, 2));
    onChange?.(v);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}
      <Alert severity="info" sx={{ mb: 2 }}>
        Interactive maps are disabled. Paste valid GeoJSON (FeatureCollection) or
        use &quot;Clear&quot; for an empty collection.
      </Alert>
      <TextField
        multiline
        minRows={8}
        fullWidth
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled}
        placeholder='{"type":"FeatureCollection","features":[]}'
        error={!!error || !!parseError}
        helperText={parseError || error || ' '}
        sx={{ fontFamily: 'monospace' }}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="contained" size="small" onClick={apply} disabled={disabled}>
          Apply GeoJSON
        </Button>
        <Button variant="outlined" size="small" onClick={clear} disabled={disabled}>
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default MapField;
