import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  Supplier,
  CreateSurveyInstanceResponse,
  SurveyTemplate,
} from '../types/survey.types';
import SurveyMonitoring from '../components/SurveyForm/SurveyMonitoring';
import surveyApiService from '../services/surveyApiService';
import { apiService } from '../services/apiService';
import {
  useTemplates,
  useSurveyInstances,
  useCreateSurveyInstance,
} from '../hooks/useSurveys';

function supplierComplianceTemplates(templates: SurveyTemplate[]) {
  return templates.filter(
    t =>
      t.surveyType === 'SUPPLIER_COMPLIANCE' || t.surveyType === undefined
  );
}

function templateQuestionCount(template: SurveyTemplate): number {
  const q = template.questions;
  if (Array.isArray(q)) return q.length;
  if (typeof q === 'string') {
    try {
      const parsed = JSON.parse(q) as unknown;
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function resolveComplianceTemplate(
  supplier: Supplier | undefined,
  compliance: SurveyTemplate[]
): SurveyTemplate | undefined {
  if (!supplier || compliance.length === 0) return undefined;
  const isEu = supplier.isEuOrigin === true;
  const pool = compliance.filter(x => x.isEu === isEu);
  if (pool.length === 0) return undefined;

  const preferredName = isEu ? 'Small survey' : 'Full survey';
  const byName = pool.find(x => x.name === preferredName);
  if (byName && templateQuestionCount(byName) > 3) return byName;

  return pool
    .slice()
    .sort((a, b) => templateQuestionCount(b) - templateQuestionCount(a))[0];
}

const Surveys: React.FC = () => {
  const { t } = useTranslation(['surveys', 'common']);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('success');

  const {
    data: templates = [],
    isLoading: loadingTemplates,
    error: templatesError,
  } = useTemplates();
  const { error: surveyInstancesError } = useSurveyInstances();
  const createSurveyInstanceMutation = useCreateSurveyInstance();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const fetchedSuppliers = await apiService.getAllSuppliers();
        setSuppliers(fetchedSuppliers);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
        setSnackbarMessage(t('surveys:messages.failedToLoadSuppliers'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    loadSuppliers();
  }, [t]);

  useEffect(() => {
    if (templatesError) {
      setSnackbarMessage(t('surveys:messages.failedToLoadTemplates'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [templatesError, t]);

  useEffect(() => {
    if (surveyInstancesError) {
      setSnackbarMessage(t('surveys:messages.failedToLoadInstances'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [surveyInstancesError, t]);

  const [openCreateSurveyDialog, setOpenCreateSurveyDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [includePlotQuestion, setIncludePlotQuestion] = useState<boolean>(true);
  const [includePackaging2025_40, setIncludePackaging2025_40] = useState<boolean>(false);

  const complianceTemplates = useMemo(
    () => supplierComplianceTemplates(templates),
    [templates]
  );

  const selectedSupplierRow = useMemo(
    () => suppliers.find(s => s.id === selectedSupplier),
    [suppliers, selectedSupplier]
  );

  const resolvedTemplate = useMemo(
    () => resolveComplianceTemplate(selectedSupplierRow, complianceTemplates),
    [selectedSupplierRow, complianceTemplates]
  );

  const handleCreateSurvey = async () => {
    if (!selectedSupplier) return;
    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      const template = resolveComplianceTemplate(supplier, complianceTemplates);

      if (!template) {
        setSnackbarMessage(t('surveys:messages.noTemplateForSupplierOrigin'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const result = (await createSurveyInstanceMutation.mutateAsync({
        templateId: template.id,
        supplierId: selectedSupplier,
        expirationDays,
        includePlotQuestion,
        includePackaging2025_40,
      })) as CreateSurveyInstanceResponse;

      setSelectedSupplier('');
      setExpirationDays(30);
      setIncludePlotQuestion(true);
      setIncludePackaging2025_40(false);
      setOpenCreateSurveyDialog(false);

      const supplierName = supplier?.name;

      // Show appropriate message based on email status
      let message = t('surveys:messages.surveyCreated', {
        templateName: template.name,
        supplierName,
      });

      let severity: 'success' | 'warning' = 'success';

      if (result.supplierHasEmail === false) {
        message += ' ' + t('surveys:messages.noSupplierEmail');
        severity = 'warning';
      } else if (result.emailSent === false) {
        message += ' ' + t('surveys:messages.emailSendFailed');
        severity = 'warning';
      } else if (result.emailSent === true) {
        message += ' ' + t('surveys:messages.emailSent');
      }

      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMessage(
          err instanceof Error
            ? err.message
            : t('surveys:messages.failedToCreateSurvey')
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
  };

  const handleCopyPublicLink = async (publicToken: string) => {
    const link = surveyApiService.generatePublicSurveyUrl(publicToken);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="h4">{t('surveys:title')}</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setOpenCreateSurveyDialog(true)}
          disabled={
            loadingSuppliers ||
            suppliers.length === 0 ||
            loadingTemplates ||
            complianceTemplates.length === 0 ||
            createSurveyInstanceMutation.isPending
          }
          title={
            suppliers.length === 0 && !loadingSuppliers
              ? t('surveys:buttons.addSuppliers')
              : complianceTemplates.length === 0 && !loadingTemplates
                ? t('surveys:buttons.createSupplierComplianceTemplates')
                : undefined
          }
        >
          {createSurveyInstanceMutation.isPending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {t('surveys:dialog.creating')}
            </>
          ) : (
            t('surveys:buttons.createSurvey')
          )}
        </Button>
      </Box>
      <SurveyMonitoring onCopyLink={handleCopyPublicLink} />
      <Dialog
        open={openCreateSurveyDialog}
        onClose={() => setOpenCreateSurveyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('surveys:dialog.createSurvey')}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('surveys:dialog.supplier')}</InputLabel>
              <Select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                label={t('surveys:dialog.supplier')}
                disabled={loadingSuppliers}
              >
                {loadingSuppliers ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('surveys:loading.suppliers')}
                  </MenuItem>
                ) : suppliers.length === 0 ? (
                  <MenuItem disabled>{t('surveys:empty.noSuppliers')}</MenuItem>
                ) : (
                  suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {!loadingSuppliers && suppliers.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {t('surveys:empty.noSuppliersDialog')}
                </Typography>
              )}
            </FormControl>
            {selectedSupplierRow && !resolvedTemplate && complianceTemplates.length > 0 && (
              <Alert severity="warning">
                {t('surveys:messages.noTemplateForSupplierOrigin')}
              </Alert>
            )}
            {complianceTemplates.length === 0 && !loadingTemplates && (
              <Alert severity="warning">
                {t('surveys:messages.noSupplierComplianceTemplates')}
              </Alert>
            )}
            {resolvedTemplate && (
              <Typography variant="body2" color="text.secondary">
                {t('surveys:dialog.willUseTemplate', {
                  name: resolvedTemplate.name,
                  eu: resolvedTemplate.isEu
                    ? t('surveys:dialog.templateEu')
                    : t('surveys:dialog.templateNonEu'),
                })}
              </Typography>
            )}
            <TextField
              fullWidth
              label={t('surveys:dialog.expirationDays')}
              type="number"
              value={expirationDays}
              onChange={e => setExpirationDays(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1, max: 365 } }}
              helperText={t('surveys:dialog.expirationHelperText')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includePlotQuestion}
                  onChange={e => setIncludePlotQuestion(e.target.checked)}
                />
              }
              label={t('surveys:dialog.includePlotQuestion')}
            />
            <Typography variant="caption" color="text.secondary">
              {t('surveys:dialog.includePlotQuestionHelp')}
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={includePackaging2025_40}
                  onChange={e => setIncludePackaging2025_40(e.target.checked)}
                />
              }
              label={t('surveys:dialog.includePackaging2025_40')}
            />

            <Typography variant="caption" color="text.secondary">
              {t('surveys:dialog.includePackaging2025_40Help')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCreateSurveyDialog(false)}
            disabled={createSurveyInstanceMutation.isPending}
          >
            {t('surveys:dialog.cancel')}
          </Button>
          <Button
            onClick={handleCreateSurvey}
            variant="contained"
            disabled={
              !selectedSupplier ||
              !resolvedTemplate ||
              loadingSuppliers ||
              createSurveyInstanceMutation.isPending
            }
          >
            {createSurveyInstanceMutation.isPending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('surveys:dialog.creating')}
              </>
            ) : (
              t('surveys:dialog.create')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Surveys;
