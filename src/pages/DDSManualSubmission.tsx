import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../services';

type SubmissionType = 'IMPORT' | 'OWN_GOOD' | 'EXPORT';

interface Batch {
  id: string;
  batchNumber?: string;
  quantity?: number;
  quantityProduced?: number;
  ddsNumber?: string;
  product?: { name: string };
  ownGood?: { name: string };
}

interface Geolocation {
  latitude: number;
  longitude: number;
  country: string;
  plotId?: string;
  percentage?: number;
}

export const DDSManualSubmission: React.FC = () => {
  const [submissionType, setSubmissionType] =
    useState<SubmissionType>('IMPORT');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const steps = ['Select Batch', 'Review Geolocations', 'Submit to EU'];

  // Fetch batches based on type
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches-for-dds', submissionType],
    queryFn: async () => {
      let endpoint = '';
      if (submissionType === 'IMPORT') {
        endpoint = '/api/batches?hasGeolocations=true';
      } else if (submissionType === 'OWN_GOOD') {
        endpoint = '/api/own-goods/batches?readyForDDS=true';
      } else if (submissionType === 'EXPORT') {
        endpoint = '/api/batches?type=export';
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  // Fetch verification data for selected batch
  const { data: verificationData, isLoading: verificationLoading } = useQuery({
    queryKey: ['batch-verification', selectedBatchId, submissionType],
    queryFn: async () => {
      if (!selectedBatchId) return null;

      const batchType = submissionType === 'OWN_GOOD' ? 'OWN_GOOD' : 'PRODUCT';
      const response = await axios.get(
        `${API_BASE_URL}/api/dds-submissions/batch-verification/${selectedBatchId}?batchType=${batchType}`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!selectedBatchId && activeStep === 1,
  });

  // Fetch submission status
  const { data: submissionStatus } = useQuery({
    queryKey: ['dds-submission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await axios.get(
        `${API_BASE_URL}/api/dds-submissions/${submissionId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!submissionId,
    refetchInterval: query =>
      query.state.data?.status === 'PENDING' ? 5000 : false,
  });

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: async () => {
      const payload: {
        submissionType: SubmissionType;
        productBatchId?: string;
        ownGoodBatchId?: string;
        exportProductBatchId?: string;
      } = { submissionType };

      if (submissionType === 'IMPORT') {
        payload.productBatchId = selectedBatchId;
      } else if (submissionType === 'OWN_GOOD') {
        payload.ownGoodBatchId = selectedBatchId;
      } else if (submissionType === 'EXPORT') {
        payload.exportProductBatchId = selectedBatchId;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/dds-submissions`,
        payload,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: data => {
      setSubmissionId(data.id);
      setActiveStep(2);
    },
  });

  // Submit to EU mutation
  const submitToEuMutation = useMutation({
    mutationFn: async () => {
      if (!submissionId) throw new Error('No submission ID');
      const response = await axios.post(
        `${API_BASE_URL}/api/dds-submissions/${submissionId}/submit`,
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dds-submission', submissionId],
      });
    },
  });

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedBatchId) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      createSubmissionMutation.mutate();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedBatchId('');
    setSubmissionId(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manual DDS Submission
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submission Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {(['IMPORT', 'OWN_GOOD', 'EXPORT'] as SubmissionType[]).map(type => (
            <Button
              key={type}
              variant={submissionType === type ? 'contained' : 'outlined'}
              onClick={() => {
                setSubmissionType(type);
                setSelectedBatchId('');
                setActiveStep(0);
              }}
            >
              {type.replace('_', ' ')}
            </Button>
          ))}
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Select Batch */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select a batch to submit
            </Typography>

            {batchesLoading ? (
              <CircularProgress />
            ) : batches && batches.length > 0 ? (
              <List>
                {batches.map((batch: Batch) => (
                  <Card
                    key={batch.id}
                    sx={{
                      mb: 2,
                      border: selectedBatchId === batch.id ? 2 : 1,
                      borderColor:
                        selectedBatchId === batch.id
                          ? 'primary.main'
                          : 'divider',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleBatchSelect(batch.id)}
                  >
                    <CardContent>
                      <Typography variant="h6">
                        {batch.batchNumber || batch.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {submissionType === 'OWN_GOOD'
                          ? batch.ownGood?.name
                          : batch.product?.name || 'Product'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Quantity:{' '}
                        {batch.quantityProduced || batch.quantity || 'N/A'}
                        {batch.ddsNumber && (
                          <Chip
                            label={`DDS: ${batch.ddsNumber}`}
                            size="small"
                            color="success"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No batches available for {submissionType.toLowerCase()}{' '}
                submission.
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedBatchId}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 1: Review Geolocations */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Review Geolocations
            </Typography>

            {verificationLoading ? (
              <CircularProgress />
            ) : verificationData ? (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Batch Information
                    </Typography>
                    <Typography variant="body2">
                      Batch Number: {verificationData.batchNumber}
                    </Typography>
                    <Typography variant="body2">
                      Product: {verificationData.productName}
                    </Typography>
                    <Typography variant="body2">
                      Quantity: {verificationData.quantity}
                    </Typography>
                  </CardContent>
                </Card>

                <Typography variant="subtitle2" gutterBottom>
                  Geolocations ({verificationData.geolocations?.length || 0})
                </Typography>

                {verificationData.geolocations &&
                verificationData.geolocations.length > 0 ? (
                  <List>
                    {verificationData.geolocations.map(
                      (geo: Geolocation, index: number) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <LocationOnIcon
                            sx={{ mr: 2, color: 'primary.main' }}
                          />
                          <ListItemText
                            primary={`${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)}`}
                            secondary={`${geo.country} • Plot ID: ${geo.plotId || 'N/A'} • ${geo.percentage || 100}%`}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                ) : (
                  <Alert severity="warning">
                    No geolocations found for this batch.
                  </Alert>
                )}

                {submissionType === 'OWN_GOOD' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    These geolocations are aggregated from all recipe
                    ingredients used in this batch.
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="error">Failed to load verification data.</Alert>
            )}

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
            >
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  !verificationData ||
                  verificationData.geolocations?.length === 0
                }
              >
                Create Submission
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Submit to EU */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Submit to EU Traces System
            </Typography>

            {submissionStatus ? (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Submission Status: </Typography>
                    <Chip
                      label={submissionStatus.status}
                      color={
                        submissionStatus.status === 'APPROVED'
                          ? 'success'
                          : submissionStatus.status === 'REJECTED'
                            ? 'error'
                            : 'default'
                      }
                      sx={{ ml: 2 }}
                    />
                  </Box>

                  {submissionStatus.ddsNumber && (
                    <Typography variant="body1" gutterBottom>
                      <strong>DDS Number:</strong> {submissionStatus.ddsNumber}
                    </Typography>
                  )}

                  {submissionStatus.submittedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Submitted:{' '}
                      {new Date(submissionStatus.submittedAt).toLocaleString()}
                    </Typography>
                  )}

                  {submissionStatus.errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {submissionStatus.errorMessage}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">Loading submission details...</Alert>
            )}

            {submissionStatus?.status === 'DRAFT' && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => submitToEuMutation.mutate()}
                disabled={submitToEuMutation.isPending}
                fullWidth
                size="large"
              >
                {submitToEuMutation.isPending
                  ? 'Submitting...'
                  : 'Submit to EU Traces'}
              </Button>
            )}

            {submissionStatus?.status === 'APPROVED' && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
                />
                <Typography variant="h6" color="success.main">
                  DDS Submission Approved!
                </Typography>
                <Button variant="outlined" onClick={handleReset} sx={{ mt: 2 }}>
                  Submit Another Batch
                </Button>
              </Box>
            )}

            {submissionStatus?.status === 'PENDING' && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Waiting for EU Traces system response...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DDSManualSubmission;
