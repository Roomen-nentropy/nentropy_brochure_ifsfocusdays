import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { X, TrendingUp, TrendingDown, Minus, Plus, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { RiskAssessmentVersionComparison } from '../../types';

interface VersionComparisonProps {
  open: boolean;
  onClose: () => void;
  comparison: RiskAssessmentVersionComparison | null;
  isLoading?: boolean;
  error?: Error | null;
}

const getChangeIcon = (changeType: 'added' | 'removed' | 'modified') => {
  switch (changeType) {
    case 'added':
      return <Plus size={16} color="#4caf50" />;
    case 'removed':
      return <Minus size={16} color="#f44336" />;
    case 'modified':
      return <Edit size={16} color="#ff9800" />;
  }
};

const getChangeColor = (changeType: 'added' | 'removed' | 'modified') => {
  switch (changeType) {
    case 'added':
      return 'success';
    case 'removed':
      return 'error';
    case 'modified':
      return 'warning';
  }
};

const VersionComparison: React.FC<VersionComparisonProps> = ({
  open,
  onClose,
  comparison,
  isLoading,
  error,
}) => {
  const { t } = useTranslation(['riskAssessments', 'common']);

  // Group differences by category (top-level vs responses)
  const { topLevelDiffs, responseDiffs } = useMemo(() => {
    if (!comparison) {
      return { topLevelDiffs: [], responseDiffs: [] };
    }

    const topLevel = comparison.differences.filter(
      diff => !diff.field.includes('.')
    );
    const responses = comparison.differences.filter(diff =>
      diff.field.includes('.')
    );

    return { topLevelDiffs: topLevel, responseDiffs: responses };
  }, [comparison]);

  // Check if risk level improved or deteriorated
  const riskLevelChange = useMemo(() => {
    if (!comparison) return null;

    const v1Risk = comparison.version1.riskLevel;
    const v2Risk = comparison.version2.riskLevel;

    if (!v1Risk || !v2Risk || v1Risk === v2Risk) return null;

    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    const improvement = riskOrder[v2Risk] < riskOrder[v1Risk];

    return { improved: improvement, from: v1Risk, to: v2Risk };
  }, [comparison]);

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('riskAssessments:versioning.versionComparison')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">
            {t('common:errors.loadFailed')}: {error.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} startIcon={<X size={18} />}>
            {t('common:close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!comparison) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t('riskAssessments:versioning.versionComparison')}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Header: Version info */}
          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('riskAssessments:versioning.version')}{' '}
                  {comparison.version1.version}
                </Typography>
                <Typography variant="caption" display="block">
                  {format(
                    new Date(comparison.version1.createdAt),
                    'MMM dd, yyyy HH:mm'
                  )}
                </Typography>
                {comparison.version1.riskLevel && (
                  <Box mt={1}>
                    <Chip
                      label={t(
                        `riskAssessments:riskLevels.${comparison.version1.riskLevel.toLocaleLowerCase()}`
                      )}
                      color={
                        comparison.version1.riskLevel === 'HIGH'
                          ? 'error'
                          : comparison.version1.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                      }
                      size="small"
                    />
                  </Box>
                )}
              </Paper>
            </Box>

            <Box flex={1}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: 'primary.main' }}
              >
                <Typography variant="subtitle2" color="primary">
                  {t('riskAssessments:versioning.version')}{' '}
                  {comparison.version2.version}
                  {comparison.version2.isLatestVersion && (
                    <Chip
                      label={t('riskAssessments:versioning.latest')}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Typography variant="caption" display="block">
                  {format(
                    new Date(comparison.version2.createdAt),
                    'MMM dd, yyyy HH:mm'
                  )}
                </Typography>
                {comparison.version2.riskLevel && (
                  <Box mt={1}>
                    <Chip
                      label={t(
                        `riskAssessments:riskLevels.${comparison.version2.riskLevel}`
                      )}
                      color={
                        comparison.version2.riskLevel === 'HIGH'
                          ? 'error'
                          : comparison.version2.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                      }
                      size="small"
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          </Stack>

          {/* Risk level change indicator */}
          {riskLevelChange && (
            <Alert
              severity={riskLevelChange.improved ? 'success' : 'warning'}
              icon={
                riskLevelChange.improved ? (
                  <TrendingDown size={20} />
                ) : (
                  <TrendingUp size={20} />
                )
              }
            >
              <Typography variant="body2">
                {t('riskAssessments:riskLevelChanged')}:{' '}
                <strong>
                  {t(`riskAssessments:riskLevels.${riskLevelChange.from}`)} →{' '}
                  {t(`riskAssessments:riskLevels.${riskLevelChange.to}`)}
                </strong>
              </Typography>
            </Alert>
          )}

          {/* No differences */}
          {comparison.differences.length === 0 && (
            <Alert severity="info">
              {t('riskAssessments:versioning.noChangesBetweenVersions')}
            </Alert>
          )}

          {/* Top-level differences */}
          {topLevelDiffs.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('riskAssessments:versioning.statusAndMetadata')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {topLevelDiffs.map((diff, index) => (
                    <Box key={index}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getChangeIcon(diff.changeType)}
                        <Typography variant="subtitle2">
                          {t(
                            `riskAssessments:fields.${diff.field}`,
                            diff.field
                          )}
                        </Typography>
                        <Chip
                          label={t(
                            `riskAssessments:versioning.changeTypes.${diff.changeType}`
                          )}
                          color={getChangeColor(diff.changeType)}
                          size="small"
                        />
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Box flex={1}>
                          <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t('riskAssessments:versioning.oldValue')}:
                            </Typography>
                            <Typography variant="body2">
                              {diff.version1Value !== null &&
                              diff.version1Value !== undefined
                                ? String(diff.version1Value)
                                : t('common:none')}
                            </Typography>
                          </Paper>
                        </Box>
                        <Box flex={1}>
                          <Paper sx={{ p: 1, bgcolor: 'primary.50' }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t('riskAssessments:versioning.newValue')}:
                            </Typography>
                            <Typography variant="body2">
                              {diff.version2Value !== null &&
                              diff.version2Value !== undefined
                                ? String(diff.version2Value)
                                : t('common:none')}
                            </Typography>
                          </Paper>
                        </Box>
                      </Stack>
                      {index < topLevelDiffs.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Response differences */}
          {responseDiffs.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('riskAssessments:versioning.assessmentData')} (
                {responseDiffs.length} {t('common:changes')})
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}
              >
                <Stack spacing={2}>
                  {responseDiffs.map((diff, index) => (
                    <Box key={index}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getChangeIcon(diff.changeType)}
                        <Typography variant="subtitle2">
                          {diff.field}
                        </Typography>
                        <Chip
                          label={t(
                            `riskAssessments:versioning.changeTypes.${diff.changeType}`
                          )}
                          color={getChangeColor(diff.changeType)}
                          size="small"
                        />
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Box flex={1}>
                          <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t('riskAssessments:oldValue')}:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                maxHeight: 100,
                                overflow: 'auto',
                                wordBreak: 'break-word',
                              }}
                            >
                              {diff.version1Value !== null &&
                              diff.version1Value !== undefined
                                ? typeof diff.version1Value === 'object'
                                  ? JSON.stringify(diff.version1Value, null, 2)
                                  : String(diff.version1Value)
                                : t('common:none')}
                            </Typography>
                          </Paper>
                        </Box>
                        <Box flex={1}>
                          <Paper sx={{ p: 1, bgcolor: 'primary.50' }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t('riskAssessments:newValue')}:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                maxHeight: 100,
                                overflow: 'auto',
                                wordBreak: 'break-word',
                              }}
                            >
                              {diff.version2Value !== null &&
                              diff.version2Value !== undefined
                                ? typeof diff.version2Value === 'object'
                                  ? JSON.stringify(diff.version2Value, null, 2)
                                  : String(diff.version2Value)
                                : t('common:none')}
                            </Typography>
                          </Paper>
                        </Box>
                      </Stack>
                      {index < responseDiffs.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<X size={18} />}>
          {t('common:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionComparison;
