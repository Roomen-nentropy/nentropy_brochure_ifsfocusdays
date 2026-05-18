import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MergeType as MergeTypeIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../services';

interface DuplicatePair {
  geolocation1: {
    id: string;
    latitude: number;
    longitude: number;
    country: string;
    plotId?: string;
    supplierName: string;
    verificationCount: number;
  };
  geolocation2: {
    id: string;
    latitude: number;
    longitude: number;
    country: string;
    plotId?: string;
    supplierName: string;
    verificationCount: number;
  };
  distance: number;
}

type ReviewAction = 'APPROVE_UNIQUE' | 'MERGE' | 'REJECT_INVALID';

export const DuplicateGeolocationReview: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<DuplicatePair | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(
    null
  );
  const [geoToKeep, setGeoToKeep] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: duplicates, isLoading } = useQuery({
    queryKey: ['duplicate-geolocations'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/supplier-master-data/geolocations/duplicates`,
        { withCredentials: true }
      );
      return response.data;
    },
  });

  const resolveDuplicateMutation = useMutation({
    mutationFn: async ({
      geolocationId,
      action,
      mergeWithId,
    }: {
      geolocationId: string;
      action: ReviewAction;
      mergeWithId?: string;
    }) => {
      const response = await axios.post(
        `${API_BASE_URL}/api/supplier-master-data/geolocations/${geolocationId}/resolve-duplicate`,
        { action, mergeWithId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicate-geolocations'] });
      setReviewDialogOpen(false);
      setSelectedPair(null);
      setSelectedAction(null);
      setGeoToKeep(null);
    },
  });

  const handleOpenReview = (pair: DuplicatePair) => {
    setSelectedPair(pair);
    setReviewDialogOpen(true);
  };

  const handleResolve = () => {
    if (!selectedPair || !selectedAction) return;

    if (selectedAction === 'MERGE' && !geoToKeep) {
      alert('Please select which geolocation to keep');
      return;
    }

    const geoToResolve =
      selectedAction === 'MERGE' && geoToKeep === selectedPair.geolocation2.id
        ? selectedPair.geolocation1.id
        : selectedPair.geolocation1.id;

    resolveDuplicateMutation.mutate({
      geolocationId: geoToResolve,
      action: selectedAction,
      mergeWithId: selectedAction === 'MERGE' ? geoToKeep! : undefined,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Duplicate Geolocation Review
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Geolocations within 0.001° (~111 meters) of each other are flagged as
        potential duplicates. Review each pair and decide whether they are
        unique locations, should be merged, or rejected as invalid.
      </Alert>

      {duplicates && duplicates.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location 1</TableCell>
                <TableCell>Location 2</TableCell>
                <TableCell>Distance (m)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {duplicates.map((pair: DuplicatePair, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {pair.geolocation1.supplierName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pair.geolocation1.latitude.toFixed(6)},{' '}
                        {pair.geolocation1.longitude.toFixed(6)}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {pair.geolocation1.country}
                        {pair.geolocation1.plotId &&
                          ` • Plot: ${pair.geolocation1.plotId}`}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Verified: {pair.geolocation1.verificationCount}x
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {pair.geolocation2.supplierName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pair.geolocation2.latitude.toFixed(6)},{' '}
                        {pair.geolocation2.longitude.toFixed(6)}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {pair.geolocation2.country}
                        {pair.geolocation2.plotId &&
                          ` • Plot: ${pair.geolocation2.plotId}`}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Verified: {pair.geolocation2.verificationCount}x
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {pair.distance.toFixed(1)}m
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label="Pending Review" color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenReview(pair)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon
            sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
          />
          <Typography variant="h6" color="success.main">
            No duplicate geolocations to review!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All geolocations have been reviewed or are sufficiently distinct.
          </Typography>
        </Paper>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Duplicate Geolocations</DialogTitle>
        <DialogContent>
          {selectedPair && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                These two geolocations are {selectedPair.distance.toFixed(1)}{' '}
                meters apart. Choose an action below.
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Location 1</Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Supplier:</strong>{' '}
                      {selectedPair.geolocation1.supplierName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Coordinates:</strong>{' '}
                      {selectedPair.geolocation1.latitude.toFixed(6)},{' '}
                      {selectedPair.geolocation1.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Country:</strong>{' '}
                      {selectedPair.geolocation1.country}
                    </Typography>
                    {selectedPair.geolocation1.plotId && (
                      <Typography variant="body2">
                        <strong>Plot ID:</strong>{' '}
                        {selectedPair.geolocation1.plotId}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Verified:</strong>{' '}
                      {selectedPair.geolocation1.verificationCount} times
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Location 2</Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Supplier:</strong>{' '}
                      {selectedPair.geolocation2.supplierName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Coordinates:</strong>{' '}
                      {selectedPair.geolocation2.latitude.toFixed(6)},{' '}
                      {selectedPair.geolocation2.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Country:</strong>{' '}
                      {selectedPair.geolocation2.country}
                    </Typography>
                    {selectedPair.geolocation2.plotId && (
                      <Typography variant="body2">
                        <strong>Plot ID:</strong>{' '}
                        {selectedPair.geolocation2.plotId}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Verified:</strong>{' '}
                      {selectedPair.geolocation2.verificationCount} times
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Select Action
              </Typography>

              <ButtonGroup fullWidth sx={{ mb: 2 }}>
                <Button
                  variant={
                    selectedAction === 'APPROVE_UNIQUE'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => setSelectedAction('APPROVE_UNIQUE')}
                  startIcon={<CheckCircleIcon />}
                >
                  Approve as Unique
                </Button>
                <Button
                  variant={
                    selectedAction === 'MERGE' ? 'contained' : 'outlined'
                  }
                  onClick={() => setSelectedAction('MERGE')}
                  startIcon={<MergeTypeIcon />}
                >
                  Merge
                </Button>
                <Button
                  variant={
                    selectedAction === 'REJECT_INVALID'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => setSelectedAction('REJECT_INVALID')}
                  startIcon={<CancelIcon />}
                  color="error"
                >
                  Reject as Invalid
                </Button>
              </ButtonGroup>

              {selectedAction === 'MERGE' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select which geolocation to keep:
                  </Typography>
                  <ButtonGroup fullWidth>
                    <Button
                      variant={
                        geoToKeep === selectedPair.geolocation1.id
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => setGeoToKeep(selectedPair.geolocation1.id)}
                    >
                      Keep Location 1
                    </Button>
                    <Button
                      variant={
                        geoToKeep === selectedPair.geolocation2.id
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => setGeoToKeep(selectedPair.geolocation2.id)}
                    >
                      Keep Location 2
                    </Button>
                  </ButtonGroup>
                </Box>
              )}

              {selectedAction === 'APPROVE_UNIQUE' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  These geolocations will be marked as unique and distinct
                  locations.
                </Alert>
              )}

              {selectedAction === 'REJECT_INVALID' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Both geolocations will be marked as invalid and excluded from
                  risk assessments.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResolve}
            variant="contained"
            disabled={
              !selectedAction ||
              (selectedAction === 'MERGE' && !geoToKeep) ||
              resolveDuplicateMutation.isPending
            }
          >
            {resolveDuplicateMutation.isPending ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
