import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Fab,
  Paper,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupplyChain } from '../types';
import type { Supplier } from '../types/survey.types';

const SupplyChains: React.FC = () => {
  const { t } = useTranslation(['supplyChains', 'common']);
  const [supplyChains] = useState<SupplyChain[]>([
    {
      id: '1',
      name: 'São Paulo to Port Santos',
      geoLocationIds: ['1'],
      isCompliant: true,
      lastUpdated: new Date(),
      productIds: ['1'],
      supplierIds: ['1'],
      riskLevel: 'low',
    },
  ]);

  const [suppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'ABC Coffee Growers',
      code: 'SUP001',
      country: 'Brazil',
      address: '123 Coffee Street, São Paulo',
      contactPerson: 'Maria Silva',
      email: 'maria@abccoffee.com',
      phone: '+55 11 1234-5678',
      isEuOrigin: false,
      riskLevel: 'medium',
      certifications: ['Rainforest Alliance', 'Fair Trade'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
  ]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('supplyChains:fields.chainName'),
      width: 200,
    },
    {
      field: 'supplierId',
      headerName: t('supplyChains:fields.supplier'),
      width: 180,
      valueGetter: params => {
        const supplier = suppliers.find(s => s.id === params);
        return supplier ? supplier.name : 'Unknown';
      },
    },
    {
      field: 'totalDistance',
      headerName: t('supplyChains:fields.distance'),
      width: 120,
    },
    {
      field: 'transportMethods',
      headerName: t('supplyChains:fields.transport'),
      width: 120,
      valueGetter: params => (params as string[])?.join(', '),
    },
    {
      field: 'riskLevel',
      headerName: t('supplyChains:fields.riskLevel'),
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
      headerName: t('supplyChains:fields.status'),
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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">{t('supplyChains:title')}</Typography>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <DataGrid
          rows={supplyChains}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ height: 400 }}
        />
      </Paper>

      {/* Supply Chain Details */}
      {supplyChains.length > 0 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('supplyChains:labels.supplyChainDetails', {
                name: supplyChains[0].name,
              })}
            </Typography>

            {/* <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Total Distance: {supplyChains[0].totalDistance} km | Transport
                Methods: {supplyChains[0].transportMethods.join(', ')} | Risk
                Level: {supplyChains[0].riskLevel} | Status:{' '}
                {supplyChains[0].verificationStatus}
              </Typography>
            </Box> */}

            <Typography variant="h6" gutterBottom>
              {t('supplyChains:supplyChainSteps')}
            </Typography>

            {/* <Box display="grid" gap={2}>
              {supplyChains[0].steps.map(step => (
                <Card key={step.id} variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Typography variant="h6">
                        Step {step.stepNumber}: {step.location}
                      </Typography>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                    </Box>

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                      <TextField
                        label="Entity"
                        value={step.entity}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <TextField
                        label="Role"
                        value={step.role}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      {step.coordinates && (
                        <>
                          <TextField
                            label="Latitude"
                            value={step.coordinates.latitude}
                            InputProps={{ readOnly: true }}
                            size="small"
                          />
                          <TextField
                            label="Longitude"
                            value={step.coordinates.longitude}
                            InputProps={{ readOnly: true }}
                            size="small"
                          />
                        </>
                      )}
                      {step.transportMethod && (
                        <TextField
                          label="Transport Method"
                          value={step.transportMethod}
                          InputProps={{ readOnly: true }}
                          size="small"
                        />
                      )}
                      {step.distanceToNext && (
                        <TextField
                          label="Distance to Next (km)"
                          value={step.distanceToNext}
                          InputProps={{ readOnly: true }}
                          size="small"
                        />
                      )}
                    </Box>

                    <TextField
                      label="Process Description"
                      value={step.processDescription}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={2}
                      fullWidth
                      sx={{ mt: 2 }}
                      size="small"
                    />

                    {step.documents.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Documents:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {step.documents.map((doc, docIndex) => (
                            <Chip
                              key={docIndex}
                              label={doc}
                              size="small"
                              variant="outlined"
                              clickable
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box> */}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>{t('common:userInterface.feature')}:</strong>{' '}
                {t('supplyChains:copyNotice')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Plus size={24} />
      </Fab>
    </Box>
  );
};

export default SupplyChains;
