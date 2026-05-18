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
  Card,
  CardContent,
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
import { API_BASE_URL } from '../../services';

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

const DDSSurveysTab: React.FC = () => {
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

  // Fetch DDS templates
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
      return response.data || [];
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
          metadata: { expiresAt: expiresAt.toISOString() },
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['dds-surveys'] });
      const publicUrl = `${window.location.origin}/dds-survey/${data.accessToken}`;

      navigator.clipboard.writeText(publicUrl);
      setSnackbarMessage(`Survey created! Link copied to clipboard`);
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
    const template = templates.find((t: Template) => t.name.includes('DDS'));

    if (!template) {
      setSnackbarMessage('No DDS template found');
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

  const copyPublicLink = (accessToken: string) => {
    const publicUrl = `${window.location.origin}/dds-survey/${accessToken}`;
    navigator.clipboard.writeText(publicUrl);
    setSnackbarMessage('Link copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const getStatusChip = (status: DDSSurvey['status']) => {
    const statusConfig = {
      CREATED: {
        label: 'Created',
        color: 'default' as const,
        icon: <PendingIcon />,
      },
      SENT: { label: 'Sent', color: 'info' as const, icon: <SendIcon /> },
      IN_PROGRESS: {
        label: 'In Progress',
        color: 'warning' as const,
        icon: <PendingIcon />,
      },
      COMPLETED: {
        label: 'Completed',
        color: 'success' as const,
        icon: <CheckCircleIcon />,
      },
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const isSME = companySettings?.businessType === 'SME_TRADER';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6">DDS Supplier Surveys</Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage DDS surveys for your suppliers. Suppliers can
                fill out surveys via public links.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Survey
            </Button>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 3 }}
                    >
                      No surveys created yet. Click "Create Survey" to get
                      started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (surveys ?? []).map((survey: DDSSurvey) => (
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
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(survey.status)}</TableCell>
                    <TableCell>
                      {new Date(survey.createdAt).toLocaleDateString()}
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
                          onClick={() => copyPublicLink(survey.accessToken)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Survey Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create DDS Survey</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                label="Supplier"
              >
                {(suppliers ?? []).map((supplier: Supplier) => (
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
                  Full Geolocation
                </ToggleButton>
                <ToggleButton value="DDS_NUMBER_ONLY" disabled={!isSME}>
                  DDS Number Only {!isSME && '(SME only)'}
                </ToggleButton>
              </ToggleButtonGroup>
              {surveyMode === 'FULL_GEOLOCATION' && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Supplier must provide full geolocation data for all products
                </Typography>
              )}
              {surveyMode === 'DDS_NUMBER_ONLY' && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Supplier can provide existing DDS numbers instead of
                  geolocation data
                </Typography>
              )}
            </Box>

            <TextField
              label="Expiration (days)"
              type="number"
              value={expirationDays}
              onChange={e => setExpirationDays(Number(e.target.value))}
              fullWidth
              helperText="Survey link will expire after this many days"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSurvey}
            variant="contained"
            disabled={!selectedSupplier || createSurveyMutation.isPending}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default DDSSurveysTab;
