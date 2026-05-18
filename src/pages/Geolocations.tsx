import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { Supplier } from '../types/survey.types';
import type { GridColDef } from '@mui/x-data-grid';
import type { Geolocation } from '../types';
import { MapPin, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Geolocations: React.FC = () => {
  const { t } = useTranslation(['geolocations', 'common']);
  const [geolocations] = useState<Geolocation[]>([
    {
      id: '1',
      name: 'São Paulo Coffee Farm Plot 1',
      supplierId: '1',
      plotNumber: 'SP001',
      coordinates: { latitude: -23.5505, longitude: -46.6333 },
      polygon: {
        coordinates: [
          { latitude: -23.5505, longitude: -46.6333 },
          { latitude: -23.551, longitude: -46.634 },
          { latitude: -23.5515, longitude: -46.6335 },
          { latitude: -23.551, longitude: -46.6328 },
        ],
      },
      area: 150,
      areaUnit: 'hectares',
      country: 'Brazil',
      region: 'São Paulo',
      forestRiskLevel: 'low',
      verificationStatus: 'verified',
      documents: ['land_certificate.pdf', 'satellite_imagery.jpg'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Sumatra Palm Plantation Block A',
      supplierId: '2',
      plotNumber: 'SUM001',
      coordinates: { latitude: 0.5, longitude: 101.5 },
      area: 500,
      areaUnit: 'hectares',
      country: 'Indonesia',
      region: 'Sumatra',
      forestRiskLevel: 'high',
      deforestationDate: new Date('2019-03-15'),
      verificationStatus: 'pending',
      documents: ['land_title.pdf'],
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2024-01-10'),
    },
  ]);

  const [suppliers] = useState<Supplier[]>([]);

  const [selectedGeolocation, setSelectedGeolocation] = useState<string>('1');

  const columns: GridColDef[] = [
    {
      field: 'plotNumber',
      headerName: t('geolocations:fields.plotNumber'),
      width: 120,
    },
    { field: 'name', headerName: t('geolocations:fields.name'), width: 200 },
    {
      field: 'supplierId',
      headerName: t('geolocations:fields.supplier'),
      width: 180,
      valueGetter: params => {
        const supplier = suppliers.find(s => s.id === params);
        return supplier ? supplier.name : 'Unknown';
      },
    },
    {
      field: 'country',
      headerName: t('geolocations:fields.country'),
      width: 100,
    },
    {
      field: 'region',
      headerName: t('geolocations:fields.region'),
      width: 120,
    },
    {
      field: 'area',
      headerName: t('geolocations:fields.area'),
      width: 100,
      valueFormatter: params => `${params} hectares`,
    },
    {
      field: 'forestRiskLevel',
      headerName: t('geolocations:fields.forestRiskLevel'),
      width: 120,
      renderCell: params => (
        <Chip
          label={params.value}
          color={
            params.value === 'high'
              ? 'error'
              : params.value === 'medium'
                ? 'warning'
                : 'success'
          }
          size="small"
        />
      ),
    },
    {
      field: 'verificationStatus',
      headerName: t('geolocations:fields.status'),
      width: 120,
      renderCell: params => (
        <Chip
          label={params.value}
          color={
            params.value === 'verified'
              ? 'success'
              : params.value === 'pending'
                ? 'warning'
                : 'error'
          }
          size="small"
        />
      ),
    },
  ];

  const selectedGeo = geolocations.find(geo => geo.id === selectedGeolocation);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">{t('geolocations:title')}</Typography>
        <Button variant="contained" startIcon={<CheckCircle size={20} />}>
          Verify Locations
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <DataGrid
          rows={geolocations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={params => setSelectedGeolocation(params.id as string)}
          sx={{ height: 400 }}
        />
      </Paper>

      {/* Geolocation Details */}
      {selectedGeo && (
        <Card elevation={2}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">
                <MapPin
                  size={20}
                  style={{ marginRight: '8px', verticalAlign: 'middle' }}
                />
                {selectedGeo.name}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Location</InputLabel>
                <Select
                  value={selectedGeolocation}
                  onChange={e => setSelectedGeolocation(e.target.value)}
                  label="Select Location"
                >
                  {geolocations.map(geo => (
                    <MenuItem key={geo.id} value={geo.id}>
                      {geo.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              gap={2}
              sx={{ mb: 3 }}
            >
              <TextField
                label="Plot Number"
                value={selectedGeo.plotNumber}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label="Country"
                value={selectedGeo.country}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label="Region"
                value={selectedGeo.region}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label="Area"
                value={`${selectedGeo.area} ${selectedGeo.areaUnit}`}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label="Forest Risk Level"
                value={selectedGeo.forestRiskLevel}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label="Verification Status"
                value={selectedGeo.verificationStatus}
                InputProps={{ readOnly: true }}
                size="small"
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              {t('geolocations:sections.coordinates')}
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={2}
              sx={{ mb: 3 }}
            >
              <TextField
                label={t('geolocations:fields.latitude')}
                value={selectedGeo.coordinates.latitude}
                InputProps={{ readOnly: true }}
                size="small"
              />
              <TextField
                label={t('geolocations:fields.longitude')}
                value={selectedGeo.coordinates.longitude}
                InputProps={{ readOnly: true }}
                size="small"
              />
            </Box>

            {selectedGeo.polygon && (
              <>
                <Typography variant="h6" gutterBottom>
                  Polygon Coordinates
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Click to copy coordinates for use in other systems:
                  </Typography>
                  <Box display="grid" gap={1}>
                    {selectedGeo.polygon.coordinates.map((coord, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.200' },
                        }}
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${coord.latitude}, ${coord.longitude}`
                          )
                        }
                      >
                        <Typography variant="body2" fontFamily="monospace">
                          Point {index + 1}: {coord.latitude}, {coord.longitude}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            {selectedGeo.deforestationDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="error">
                  Deforestation Alert
                </Typography>
                <Typography variant="body2" color="error">
                  Deforestation detected on:{' '}
                  {selectedGeo.deforestationDate.toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Typography variant="h6" gutterBottom>
              {t('geolocations:sections.documents')}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {selectedGeo.documents.map((doc, index) => (
                <Chip
                  key={index}
                  label={doc}
                  variant="outlined"
                  clickable
                  onClick={() => {
                    navigator.clipboard.writeText(doc);
                    // In a real app, you would also open/download the document
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Geolocations;
