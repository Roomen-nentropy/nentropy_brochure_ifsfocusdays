import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import surveyApiService from '../../services/surveyApiService';
import SurveyExportService from '../../services/surveyExportService';
import SurveyExportMenu from './SurveyExportMenu';
import SurveyInstanceTableRow from './SurveyInstanceTableRow';
import SurveyResponsesDialog from './SurveyResponsesDialog';
import type {
  SurveyInstance,
  SurveyInstanceResponse,
} from '../../types/survey.types';

interface SurveyMonitoringProps {
  onCopyLink?: (token: string) => void;
}

const SurveyMonitoring: React.FC<SurveyMonitoringProps> = ({ onCopyLink }) => {
  const { t } = useTranslation('surveyForm');
  const [surveyInstances, setSurveyInstances] = useState<SurveyInstance[]>([]);
  const [selectedInstance, setSelectedInstance] =
    useState<SurveyInstance | null>(null);
  const [responses, setResponses] = useState<SurveyInstanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [responsesOpen, setResponsesOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [exportingInstance, setExportingInstance] =
    useState<SurveyInstance | null>(null);

  const REFRESH_INTERVAL = 10_000_0;

  const loadSurveyInstances = useCallback(async () => {
    try {
      const instances = await surveyApiService.getAllSurveyInstances();

      setSurveyInstances(instances);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('monitoring.messages.failedToLoadInstances')
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadSurveyResponses = async (instanceId: string) => {
    try {
      const instanceResponses =
        await surveyApiService.getSurveyResponses(instanceId);

      setResponses(instanceResponses);

      const fullInstance = surveyInstances.find(inst => inst.id === instanceId);

      if (fullInstance) {
        setSelectedInstance(fullInstance);
      } else {
        console.log('Could not find full instance data for:', instanceId);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('monitoring.messages.failedToLoadResponses')
      );
    }
  };

  useEffect(() => {
    loadSurveyInstances();
  }, [loadSurveyInstances]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSurveyInstances();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, loadSurveyInstances]);

  const handleViewResponses = async (instance: SurveyInstance) => {
    setSelectedInstance(instance);

    await loadSurveyResponses(instance.id);

    setResponsesOpen(true);
  };

  const handleExportJSON = async (instance: SurveyInstance) => {
    try {
      await SurveyExportService.exportAsJSON(instance);
      setExportMenuAnchor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export as JSON');
      setExportMenuAnchor(null);
    }
  };

  const handleExportPDF = async (instance: SurveyInstance) => {
    try {
      await SurveyExportService.exportAsPDF(instance);
      setExportMenuAnchor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export as PDF');
      setExportMenuAnchor(null);
    }
  };

  const handleExportMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    instance: SurveyInstance
  ) => {
    setExportMenuAnchor(event.currentTarget);
    setExportingInstance(instance);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
    setExportingInstance(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">{t('monitoring.title')}</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
              />
            }
            label={t('monitoring.settings.autoRefresh')}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={20} />}
            onClick={loadSurveyInstances}
          >
            {t('monitoring.buttons.refreshNow')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                {t('monitoring.table.headers.surveyTemplate')}
              </TableCell>
              <TableCell>{t('monitoring.table.headers.supplier')}</TableCell>
              <TableCell>{t('monitoring.table.headers.status')}</TableCell>
              <TableCell>{t('monitoring.table.headers.progress')}</TableCell>
              <TableCell>{t('monitoring.table.headers.created')}</TableCell>
              <TableCell>{t('monitoring.table.headers.expires')}</TableCell>
              <TableCell>
                {t('monitoring.table.headers.timeRemaining')}
              </TableCell>
              <TableCell>{t('monitoring.table.headers.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surveyInstances.map(instance => (
              <SurveyInstanceTableRow
                key={instance.id}
                instance={instance}
                onViewResponses={handleViewResponses}
                onExportMenuOpen={handleExportMenuOpen}
                onCopyLink={onCopyLink}
              />
            ))}
            {surveyInstances.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary" py={4}>
                    No survey instances found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SurveyResponsesDialog
        open={responsesOpen}
        onClose={() => setResponsesOpen(false)}
        instance={selectedInstance}
        responses={responses}
      />

      <SurveyExportMenu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        instance={exportingInstance}
        onExportJSON={handleExportJSON}
        onExportPDF={handleExportPDF}
      />
    </Box>
  );
};

export default SurveyMonitoring;
