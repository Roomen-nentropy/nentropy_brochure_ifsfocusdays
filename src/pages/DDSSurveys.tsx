import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../services';

interface Template {
  id: string;
  name: string;
  version: number;
  fields: unknown[];
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
}

interface DDSSurvey {
  id: string;
  supplierId: string;
  supplier: Supplier;
  surveyMode: 'FULL_GEOLOCATION' | 'DDS_NUMBER_ONLY';
  accessToken: string;
  status: 'CREATED' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

const DDSSurveys: React.FC = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [surveyMode, setSurveyMode] = useState<
    'FULL_GEOLOCATION' | 'DDS_NUMBER_ONLY'
  >('FULL_GEOLOCATION');
  const [expirationDays, setExpirationDays] = useState(30);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning'
  >('success');

  const queryClient = useQueryClient();

  // Fetch suppliers
  const { data: suppliersResponse } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/suppliers`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const suppliers = suppliersResponse?.data || [];

  // Fetch DDS templates (assuming one for each mode)
  const { data: templates = [] } = useQuery({
    queryKey: ['dds-templates'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/surveys/templates`,
        {
          withCredentials: true,
        }
      );
      return response.data.filter((t: Template) => t.name.includes('DDS'));
    },
  });

  // Fetch company settings to check SME status
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/settings`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  // Fetch DDS surveys
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['dds-surveys'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/unified-dds-surveys`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: async (data: {
      templateId: string;
      supplierId: string;
      surveyMode: 'FULL_GEOLOCATION' | 'DDS_NUMBER_ONLY';
      expirationDays: number;
    }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expirationDays);

      const response = await axios.post(
        `${API_BASE_URL}/api/unified-dds-surveys`,
        {
          templateId: data.templateId,
          supplierId: data.supplierId,
          surveyMode: data.surveyMode,
          metadata: {
            expiresAt: expiresAt.toISOString(),
          },
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['dds-surveys'] });
      const publicUrl = `${window.location.origin}/survey/${data.accessToken}`;

      setSnackbarMessage(`DDS Survey created! Public URL: ${publicUrl}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'Failed to create survey';
      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const resetForm = () => {
    setSelectedSupplier('');
    setSurveyMode('FULL_GEOLOCATION');
    setExpirationDays(30);
  };

  const handleCreateSurvey = () => {
    if (!selectedSupplier) {
      setSnackbarMessage('Please select a supplier');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const template =
      templates.find((t: Template) =>
        surveyMode === 'FULL_GEOLOCATION'
          ? t.name.includes('Full')
          : t.name.includes('Number')
      ) || templates[0];

    if (!template) {
      setSnackbarMessage('No DDS template found. Please create one first.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    createSurveyMutation.mutate({
      templateId: template.id,
      supplierId: selectedSupplier,
      surveyMode,
      expirationDays,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Link copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const getPublicUrl = (accessToken: string) => {
    return `${window.location.origin}/survey/${accessToken}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'SENT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon fontSize="small" />;
      case 'IN_PROGRESS':
        return <PendingIcon fontSize="small" />;
      case 'SENT':
        return <SendIcon fontSize="small" />;
      default:
        return <AddIcon fontSize="small" />;
    }
  };

  const isSME = companySettings?.isSME === true;
  const businessType = companySettings?.businessType;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            DDS Surveys
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Due Diligence Statement surveys for EUDR compliance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create DDS Survey
        </Button>
      </Box>

      {!isSME && businessType === 'TRADER' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          As a non-SME trader, you must use FULL_GEOLOCATION mode for all DDS
          surveys.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : surveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No DDS surveys yet. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              surveys.map((survey: DDSSurvey) => (
                <TableRow key={survey.id}>
                  <TableCell>{survey.supplier.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        survey.surveyMode === 'FULL_GEOLOCATION'
                          ? 'Full Geolocation'
                          : 'DDS Number Only'
                      }
                      size="small"
                      color={
                        survey.surveyMode === 'FULL_GEOLOCATION'
                          ? 'primary'
                          : 'secondary'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(survey.status)}
                      label={survey.status}
                      size="small"
                      color={getStatusColor(survey.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {survey.completedAt
                      ? new Date(survey.completedAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {survey.expiresAt
                      ? new Date(survey.expiresAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Copy public link">
                      <IconButton
                        size="small"
                        onClick={() =>
                          copyToClipboard(getPublicUrl(survey.accessToken))
                        }
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Survey Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New DDS Survey</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                label="Supplier"
              >
                {(suppliers || []).map((supplier: Supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Survey Mode
              </Typography>
              <ToggleButtonGroup
                value={surveyMode}
                exclusive
                onChange={(_, value) => value && setSurveyMode(value)}
                fullWidth
              >
                <ToggleButton value="FULL_GEOLOCATION">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">
                      Full Geolocation
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      For operators & non-SME traders
                    </Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="DDS_NUMBER_ONLY"
                  disabled={!isSME && businessType === 'TRADER'}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">
                      DDS Number Only
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      For SME traders
                    </Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
              {!isSME &&
                businessType === 'TRADER' &&
                surveyMode === 'FULL_GEOLOCATION' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your company is not classified as an SME. You must use Full
                    Geolocation mode.
                  </Alert>
                )}
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Expiration (days)"
              value={expirationDays}
              onChange={e => setExpirationDays(parseInt(e.target.value))}
              helperText="Number of days until the survey link expires"
              inputProps={{ min: 1, max: 365 }}
            />

            {selectedSupplier && (
              <Alert severity="info">
                A public link will be generated for the supplier to fill out the
                survey.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSurvey}
            variant="contained"
            disabled={createSurveyMutation.isPending || !selectedSupplier}
          >
            {createSurveyMutation.isPending ? 'Creating...' : 'Create Survey'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DDSSurveys;
