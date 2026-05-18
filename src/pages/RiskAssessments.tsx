import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Plus,
  Eye,
  Edit,
  Download,
  MoreVertical,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useRiskAssessments,
  useCreateRiskAssessment,
  useExportPDF,
  useExportJSON,
} from '../hooks/useRiskAssessments';
import { apiService } from '../services/apiService';

const RiskAssessments: React.FC = () => {
  const { t } = useTranslation(['riskAssessments', 'common']);
  const navigate = useNavigate();

  // State management
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [suppliersWithSurveys, setSuppliersWithSurveys] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      country: string;
      contactPerson?: string;
      latestSurveyId: string;
      latestSurveyCompletedAt: string;
      templateName: string;
      assessmentType: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER';
    }>
  >([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Hooks
  const { data: riskAssessments = [], isLoading, error } = useRiskAssessments();

  const createRiskAssessment = useCreateRiskAssessment();
  const exportPDF = useExportPDF();
  const exportJSON = useExportJSON();

  // Load suppliers with completed surveys on component mount
  React.useEffect(() => {
    const loadSuppliersWithSurveys = async () => {
      try {
        const suppliersData =
          await apiService.getSuppliersWithCompletedSurveys();
        setSuppliersWithSurveys(suppliersData || []);
      } catch (error) {
        console.error(
          'Failed to load suppliers with completed surveys:',
          error
        );
        showSnackbar(t('riskAssessments:messages.createError'), 'error');
      }
    };
    loadSuppliersWithSurveys();
  }, [t]);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCreateAssessment = async () => {
    if (!selectedSupplierId) {
      showSnackbar(t('riskAssessments:messages.selectSupplier'), 'warning');
      return;
    }

    // Find the selected supplier to get the assessment type
    const selectedSupplier = suppliersWithSurveys.find(
      s => s.id === selectedSupplierId
    );
    if (!selectedSupplier) {
      showSnackbar(t('riskAssessments:messages.supplierNotFound'), 'error');
      return;
    }

    try {
      const newAssessment = await createRiskAssessment.mutateAsync({
        supplierId: selectedSupplierId,
        type: selectedSupplier.assessmentType,
        sourceSurveyInstanceId: selectedSupplier.latestSurveyId,
      });

      showSnackbar(t('riskAssessments:messages.assessmentCreated'), 'success');
      setCreateDialogOpen(false);
      setSelectedSupplierId('');

      // Navigate to the new assessment
      navigate(`/risk-assessments/${newAssessment.id}`);
    } catch (error) {
      console.error('Failed to create risk assessment:', error);
      showSnackbar(t('riskAssessments:messages.createError'), 'error');
    }
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/risk-assessments/${id}`);
  };

  const handleEditAssessment = (id: string) => {
    navigate(`/risk-assessments/${id}/edit`);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    assessmentId: string
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAssessmentId(assessmentId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAssessmentId(null);
  };

  const handleExportPDF = async () => {
    if (!selectedAssessmentId) return;

    try {
      await exportPDF.mutateAsync(selectedAssessmentId);
      showSnackbar(t('riskAssessments:messages.pdfExported'), 'success');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      showSnackbar(t('riskAssessments:messages.pdfExportError'), 'error');
    }
    handleMenuClose();
  };

  const handleExportJSON = async () => {
    if (!selectedAssessmentId) return;

    try {
      await exportJSON.mutateAsync(selectedAssessmentId);
      showSnackbar(t('riskAssessments:messages.jsonExported'), 'success');
    } catch (error) {
      console.error('Failed to export JSON:', error);
      showSnackbar(t('riskAssessments:messages.jsonExportError'), 'error');
    }
    handleMenuClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REQUIRES_REVIEW':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'success';
      case 'REQUIRES_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'IN_PROGRESS':
        return 'info';
      case 'DRAFT':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRiskLevelColor = (
    riskLevel?: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (riskLevel) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{t('riskAssessments:detail.loadError')}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {t('riskAssessments:title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setCreateDialogOpen(true)}
        >
          {t('riskAssessments:create')}
        </Button>
      </Box>

      {/* Risk Assessments Grid */}
      <Box
        display="grid"
        gap={3}
        gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
      >
        {riskAssessments.length === 0 ? (
          <Card>
            <CardContent>
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
              >
                {t('riskAssessments:noAssessments')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          riskAssessments.map(assessment => (
            <Card key={assessment.id}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Typography variant="h6" component="h3">
                    {assessment.supplier?.name ||
                      t('riskAssessments:detail.unknownSupplier')}
                  </Typography>
                  <Button
                    size="small"
                    onClick={e => handleMenuClick(e, assessment.id)}
                  >
                    <MoreVertical size={16} />
                  </Button>
                </Box>

                <Stack spacing={1} mb={2}>
                  <Box display="flex" gap={1}>
                    <Chip
                      icon={getStatusIcon(assessment.status)}
                      label={t(
                        `riskAssessments:statusTypes.${assessment.status}`
                      )}
                      size="small"
                      color={getStatusColor(assessment.status)}
                    />
                  </Box>

                  {assessment.riskLevel && (
                    <Chip
                      label={`${t('riskAssessments:detail.riskScore')}: ${t(`riskAssessments:riskLevels.${assessment.riskLevel.toLowerCase()}`)}`}
                      size="small"
                      color={getRiskLevelColor(assessment.riskLevel)}
                    />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {t('riskAssessments:detail.created')}:{' '}
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </Typography>

                {assessment.prefillPercentage && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {t('riskAssessments:detail.autoFilled')}:{' '}
                    {Math.round(assessment.prefillPercentage)}%
                  </Typography>
                )}

                {assessment.hasRedFlags && (
                  <Alert severity="warning">
                    {t('riskAssessments:detail.containsRedFlags')}
                  </Alert>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Eye size={16} />}
                  onClick={() => handleViewAssessment(assessment.id)}
                >
                  {t('riskAssessments:actions.view')}
                </Button>
                {assessment.status !== 'APPROVED' && (
                  <Button
                    size="small"
                    startIcon={<Edit size={16} />}
                    onClick={() => handleEditAssessment(assessment.id)}
                  >
                    {t('riskAssessments:actions.edit')}
                  </Button>
                )}
              </CardActions>
            </Card>
          ))
        )}
      </Box>
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('riskAssessments:createDialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <FormControl fullWidth>
              <InputLabel>
                {t('riskAssessments:createDialog.selectSupplier')}
              </InputLabel>
              <Select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                label={t('riskAssessments:createDialog.selectSupplier')}
              >
                {suppliersWithSurveys.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    <Box>
                      <Typography component="span">{supplier.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {new Date(
                          supplier.latestSurveyCompletedAt
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {suppliersWithSurveys.length === 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  {t('riskAssessments:createDialog.noSurveys')}
                  <br />
                  {t('riskAssessments:createDialog.noSurveysDetails')}
                </Typography>
              </Alert>
            )}

            {selectedSupplierId && (
              <Alert severity="info">
                <Typography variant="body2">
                  {(() => {
                    const selectedSupplier = suppliersWithSurveys.find(
                      s => s.id === selectedSupplierId
                    );
                    if (!selectedSupplier) return '';
                    return t(
                      'riskAssessments:createDialog.assessmentTypeInfo',
                      {
                        type: selectedSupplier.assessmentType.replace('_', ' '),
                        template: selectedSupplier.templateName,
                      }
                    );
                  })()}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            {t('riskAssessments:createDialog.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAssessment}
            disabled={!selectedSupplierId || createRiskAssessment.isPending}
          >
            {createRiskAssessment.isPending
              ? t('riskAssessments:createDialog.creating')
              : t('riskAssessments:createDialog.createButton')}
          </Button>
        </DialogActions>
      </Dialog>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <Download size={16} />
          </ListItemIcon>
          <ListItemText>{t('riskAssessments:actions.exportPdf')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <FileText size={16} />
          </ListItemIcon>
          <ListItemText>{t('riskAssessments:actions.exportJson')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RiskAssessments;
