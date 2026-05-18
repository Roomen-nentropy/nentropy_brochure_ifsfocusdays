import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRiskAssessment } from '../hooks/useRiskAssessments';

const RiskAssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['riskAssessments', 'common']);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: riskAssessment, isLoading, error } = useRiskAssessment(id!);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    navigate('/risk-assessments');
  };

  const handleEdit = () => {
    navigate(`/risk-assessments/${id}/edit`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'REQUIRES_REVIEW':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'REJECTED':
        return <XCircle size={20} className="text-red-600" />;
      case 'IN_PROGRESS':
        return <Clock size={20} className="text-blue-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
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

  if (!id) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {t('riskAssessments:detail.idNotProvided')}
        </Alert>
      </Box>
    );
  }

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

  if (error || !riskAssessment) {
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
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {t('riskAssessments:detail.title')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {riskAssessment.supplier?.name ||
                t('riskAssessments:detail.unknownSupplier')}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2}>
          {riskAssessment.status !== 'APPROVED' && (
            <Button
              variant="contained"
              startIcon={<Edit size={20} />}
              onClick={handleEdit}
            >
              {t('riskAssessments:detail.edit')}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Status and Basic Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                icon={getStatusIcon(riskAssessment.status)}
                label={t(
                  `riskAssessments:statusTypes.${riskAssessment.status}`
                )}
                color={getStatusColor(riskAssessment.status)}
              />
              {riskAssessment.riskLevel && (
                <Chip
                  label={`${t('riskAssessments:detail.riskScore')}: ${t(`riskAssessments:riskLevels.${riskAssessment.riskLevel.toLowerCase()}`)}`}
                  color={getRiskLevelColor(riskAssessment.riskLevel)}
                />
              )}
            </Box>

            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={2}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('riskAssessments:detail.created')}
                </Typography>
                <Typography variant="body1">
                  {new Date(riskAssessment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              {riskAssessment.completedAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('riskAssessments:detail.completed')}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(riskAssessment.completedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {riskAssessment.prefillPercentage && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('riskAssessments:detail.autoFilled')}
                  </Typography>
                  <Typography variant="body1">
                    {Math.round(riskAssessment.prefillPercentage)}%
                  </Typography>
                </Box>
              )}

              {riskAssessment.overallRiskScore && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('riskAssessments:detail.riskScore')}
                  </Typography>
                  <Typography variant="body1">
                    {riskAssessment.overallRiskScore.toFixed(1)}/10
                  </Typography>
                </Box>
              )}
            </Box>

            {riskAssessment.prefillPercentage && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('riskAssessments:detail.completionProgress')}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={riskAssessment.prefillPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {riskAssessment.hasRedFlags && (
              <Alert severity="warning">
                <Typography variant="body2">
                  {t('riskAssessments:detail.containsRedFlags')}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      {riskAssessment.riskBreakdown &&
        Object.keys(riskAssessment.riskBreakdown).length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('riskAssessments:detail.riskBreakdown')}
              </Typography>
              <Box display="grid" gap={2}>
                {Object.entries(riskAssessment.riskBreakdown).map(
                  ([category, score]) => (
                    <Box key={category}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="body2">
                          {category
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {score.toFixed(1)}/10
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={score * 10}
                        color={
                          score < 3
                            ? 'success'
                            : score < 7
                              ? 'warning'
                              : 'error'
                        }
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        )}

      {/* Critical Red Flags */}
      {riskAssessment.criticalRedFlags &&
        riskAssessment.criticalRedFlags.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                {t('riskAssessments:detail.criticalRedFlags')}
              </Typography>
              <List>
                {riskAssessment.criticalRedFlags.map((flag, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={flag} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

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

export default RiskAssessmentDetail;
