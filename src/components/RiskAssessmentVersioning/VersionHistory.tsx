import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  History,
  Eye,
  RotateCcw,
  GitCompare,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { RiskAssessment } from '../../types';

interface VersionHistoryProps {
  assessmentId: string;
  versions: RiskAssessment[];
  isLoading?: boolean;
  error?: Error | null;
  onViewVersion?: (versionId: string) => void;
  onCompareVersion?: (versionId: string) => void;
  onRestoreVersion?: (versionId: string) => void;
}

const getStatusIcon = (status: RiskAssessment['status']) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle size={20} />;
    case 'REJECTED':
      return <XCircle size={20} />;
    case 'COMPLETED':
    case 'REQUIRES_REVIEW':
      return <CheckCircle size={20} />;
    default:
      return <Clock size={20} />;
  }
};

const getStatusColor = (status: RiskAssessment['status']) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'COMPLETED':
    case 'REQUIRES_REVIEW':
      return 'info';
    default:
      return 'default';
  }
};

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  isLoading,
  error,
  onViewVersion,
  onCompareVersion,
  onRestoreVersion,
}) => {
  const { t } = useTranslation(['riskAssessments', 'common']);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('common:errors.loadFailed')}: {error.message}
      </Alert>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <History size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <Typography variant="body1" color="text.secondary">
          {t('riskAssessments:versioning.noVersionHistory')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {versions.map(version => (
          <Card
            key={version.id}
            elevation={version.isLatestVersion ? 3 : 1}
            sx={{
              borderLeft: version.isLatestVersion
                ? '4px solid'
                : '4px solid transparent',
              borderColor: 'primary.main',
              position: 'relative',
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* Header row */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: version.isLatestVersion
                          ? 'primary.main'
                          : 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: version.isLatestVersion
                          ? 'white'
                          : 'text.secondary',
                      }}
                    >
                      {getStatusIcon(version.status)}
                    </Box>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          {t('riskAssessments:versioning.version')}{' '}
                          {version.version}
                        </Typography>
                        {version.isLatestVersion && (
                          <Chip
                            label={t('riskAssessments:versioning.latest')}
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {format(
                          new Date(version.createdAt),
                          'MMM dd, yyyy HH:mm'
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={t(`riskAssessments:statusTypes.${version.status}`)}
                    color={getStatusColor(version.status)}
                    size="small"
                  />
                </Box>

                {/* Version notes */}
                {version.versionNotes && (
                  <>
                    <Divider />
                    <Typography variant="body2" color="text.secondary">
                      {version.versionNotes}
                    </Typography>
                  </>
                )}

                {/* Risk level */}
                {version.riskLevel && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t('riskAssessments:fields.riskLevel')}:
                    </Typography>
                    <Chip
                      label={t(
                        `riskAssessments:riskLevels.${version.riskLevel.toLocaleLowerCase()}`
                      )}
                      color={
                        version.riskLevel === 'HIGH'
                          ? 'error'
                          : version.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                      }
                      size="small"
                    />
                    {version.overallRiskScore && (
                      <Typography variant="caption" color="text.secondary">
                        ({version.overallRiskScore.toFixed(1)})
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Actions */}
                <Divider />
                <Box display="flex" gap={1}>
                  {onViewVersion && (
                    <Tooltip
                      title={t('riskAssessments:versioning.viewVersion')}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onViewVersion(version.id)}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!version.isLatestVersion && onCompareVersion && (
                    <Tooltip
                      title={t('riskAssessments:versioning.compareWithCurrent')}
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onCompareVersion(version.id)}
                      >
                        <GitCompare size={18} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!version.isLatestVersion && onRestoreVersion && (
                    <Tooltip
                      title={t('riskAssessments:versioning.restoreVersion')}
                    >
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => onRestoreVersion(version.id)}
                      >
                        <RotateCcw size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default VersionHistory;
