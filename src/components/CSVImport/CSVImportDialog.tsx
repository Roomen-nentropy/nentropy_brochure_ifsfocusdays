import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Alert,
  Divider,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { CloudUpload, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CSVImportService,
  type HeaderMapping,
  type ImportPreview,
  type ImportResult,
} from '../../services/csvImportService';

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (result: ImportResult) => void;
}

const CSVImportDialog: React.FC<CSVImportDialogProps> = ({
  open,
  onClose,
  onImportComplete,
}) => {
  const { t } = useTranslation(['suppliers', 'common']);
  const [activeStep, setActiveStep] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [headerMapping, setHeaderMapping] = useState<HeaderMapping>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    t('suppliers:csvImport.steps.uploadFile'),
    t('suppliers:csvImport.steps.previewMapHeaders'),
    t('suppliers:csvImport.steps.importResults'),
  ];

  const supplierFields = [
    {
      key: 'supplierName',
      label: t('suppliers:csvImport.fields.supplierName'),
      required: true,
    },
    {
      key: 'supplierCountry',
      label: t('suppliers:csvImport.fields.supplierCountry'),
    },
    {
      key: 'supplierContactPerson',
      label: t('suppliers:csvImport.fields.contactPerson'),
    },
    { key: 'supplierEmail', label: t('suppliers:csvImport.fields.email') },
    { key: 'supplierPhone', label: t('suppliers:csvImport.fields.phone') },
    { key: 'supplierAddress', label: t('suppliers:csvImport.fields.address') },
  ];

  const productFields = [
    {
      key: 'productName',
      label: t('suppliers:csvImport.fields.productName'),
      required: true,
    },
    { key: 'productHsCode', label: t('suppliers:csvImport.fields.hsCode') },
    {
      key: 'internalProductCode',
      label: t('products:fields.internalProductCode'),
    },
    {
      key: 'supplierProductCode',
      label: t('products:fields.supplierProductCode'),
    },
    { key: 'productCategory', label: t('suppliers:csvImport.fields.category') },
    { key: 'productCountry', label: t('suppliers:csvImport.fields.country') },
    {
      key: 'productOrigin',
      label: t('suppliers:csvImport.fields.originEuNonEu'),
    },
    { key: 'productUnit', label: t('suppliers:csvImport.fields.unit') },
  ];

  const handleFileUpload = async (file: File) => {
    try {
      setCsvFile(file);
      const text = await file.text();
      setCsvText(text);

      const previewData = CSVImportService.parseCSVStructure(text, 50);
      setPreview(previewData);

      if (previewData.headers.length > 0) {
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleHeaderMappingChange = (
    fieldKey: keyof HeaderMapping,
    headerName: string
  ) => {
    setHeaderMapping(prev => ({
      ...prev,
      [fieldKey]: headerName === '' ? undefined : headerName,
    }));
  };

  const handleImport = async () => {
    if (!csvText) return;

    setIsProcessing(true);
    try {
      const result = CSVImportService.importWithMapping(csvText, headerMapping);
      setImportResult(result);

      // Wait for the API import to complete before showing results
      await onImportComplete(result);

      // Only move to results step after API completes
      setActiveStep(2);
    } catch (error) {
      console.error('Import error:', error);
      // Still show results step even on error so user can see what happened
      setActiveStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setCsvFile(null);
    setCsvText('');
    setPreview(null);
    setHeaderMapping({});
    setImportResult(null);
    setIsProcessing(false);
    onClose();
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return csvFile !== null;
      case 1:
        // At least one required field should be mapped
        return headerMapping.supplierName || headerMapping.productName;
      default:
        return true;
    }
  };

  const renderFileUpload = () => (
    <Box textAlign="center" py={4}>
      <CloudUpload size={64} color="blue" style={{ marginBottom: '16px' }} />
      <Typography variant="h6" gutterBottom>
        {t('suppliers:csvImport.selectFile')}
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        {t('suppliers:csvImport.messages.fileInstructions')}
      </Typography>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        style={{ display: 'none' }}
        id="csv-file-input"
      />
      <label htmlFor="csv-file-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload size={20} />}
        >
          {t('suppliers:csvImport.messages.chooseFile')}
        </Button>
      </label>
      {csvFile && (
        <Typography variant="body2" mt={2}>
          {t('suppliers:csvImport.messages.fileSelected', {
            name: csvFile.name,
            size: (csvFile.size / 1024).toFixed(1),
          })}
        </Typography>
      )}
    </Box>
  );

  const renderHeaderMapping = () => {
    if (!preview) return null;

    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('suppliers:csvImport.messages.mapHeaders')}
          </Typography>
        </Alert>

        <Box display="flex" gap={3}>
          <Box flex={1}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('suppliers:csvImport.messages.supplierFields')}
              </Typography>
              {supplierFields.map(field => (
                <FormControl fullWidth margin="normal" key={field.key}>
                  <InputLabel>
                    {field.label} {field.required && '*'}
                  </InputLabel>
                  <Select
                    value={
                      headerMapping[field.key as keyof HeaderMapping] || ''
                    }
                    onChange={e =>
                      handleHeaderMappingChange(
                        field.key as keyof HeaderMapping,
                        e.target.value
                      )
                    }
                    label={`${field.label} ${field.required ? '*' : ''}`}
                  >
                    <MenuItem value="">
                      <em>{t('suppliers:csvImport.messages.notMapped')}</em>
                    </MenuItem>
                    {preview.headers.map((header, index) => (
                      <MenuItem key={index} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('suppliers:csvImport.messages.productFields')}
              </Typography>
              {productFields.map(field => (
                <FormControl fullWidth margin="normal" key={field.key}>
                  <InputLabel>
                    {field.label} {field.required && '*'}
                  </InputLabel>
                  <Select
                    value={
                      headerMapping[field.key as keyof HeaderMapping] || ''
                    }
                    onChange={e =>
                      handleHeaderMappingChange(
                        field.key as keyof HeaderMapping,
                        e.target.value
                      )
                    }
                    label={`${field.label} ${field.required ? '*' : ''}`}
                  >
                    <MenuItem value="">
                      <em>{t('suppliers:csvImport.messages.notMapped')}</em>
                    </MenuItem>
                    {preview.headers.map((header, index) => (
                      <MenuItem key={index} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Paper>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {t('suppliers:csvImport.messages.dataPreview', {
            totalRows: preview.totalRows,
          })}
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {preview.headers.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.previewRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderResults = () => {
    if (!importResult) return null;

    return (
      <Box>
        {importResult.errors.length === 0 ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">
              {t('suppliers:csvImport.messages.importSuccessful')}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">
              {t('suppliers:csvImport.messages.importCompletedWithErrors')}
            </Typography>
          </Alert>
        )}

        <Box display="flex" gap={2} sx={{ mb: 3 }}>
          <Box flex={1}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {importResult.suppliers.length}
              </Typography>
              <Typography variant="body2">
                {t('suppliers:csvImport.messages.suppliers')}
              </Typography>
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {importResult.products.length}
              </Typography>
              <Typography variant="body2">
                {t('suppliers:csvImport.messages.products')}
              </Typography>
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {importResult.warnings.length}
              </Typography>
              <Typography variant="body2">
                {t('suppliers:csvImport.messages.warnings')}
              </Typography>
            </Paper>
          </Box>
          <Box flex={1}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {importResult.errors.length}
              </Typography>
              <Typography variant="body2">
                {t('suppliers:csvImport.messages.errors')}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {importResult.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {t('suppliers:csvImport.messages.warningsLabel')}
            </Typography>
            <ul>
              {importResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        {importResult.errors.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle2">
              {t('suppliers:csvImport.messages.errorsLabel')}
            </Typography>
            <ul>
              {importResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowUpDown size={24} />
          {t('suppliers:csvImport.title')}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
        }}
      >
        {isProcessing && (
          <Backdrop
            open={isProcessing}
            sx={{
              position: 'absolute',
              zIndex: theme => theme.zIndex.drawer + 1,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="primary" fontWeight="bold">
              {t('suppliers:csvImport.messages.importing', {
                defaultValue: 'Importing data...',
              })}
            </Typography>
            <Typography
              variant="body1"
              color="text.primary"
              fontWeight="medium"
            >
              {t('suppliers:csvImport.messages.pleaseWait', {
                defaultValue: 'Please wait while we process your data',
              })}
            </Typography>
          </Backdrop>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box flex={1} overflow="auto">
          {activeStep === 0 && renderFileUpload()}
          {activeStep === 1 && renderHeaderMapping()}
          {activeStep === 2 && renderResults()}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isProcessing}>
          {activeStep === 2
            ? t('suppliers:csvImport.messages.close')
            : t('suppliers:csvImport.cancel')}
        </Button>

        {activeStep === 1 && (
          <Button onClick={() => setActiveStep(0)} disabled={isProcessing}>
            {t('suppliers:csvImport.messages.back')}
          </Button>
        )}

        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!isStepValid() || isProcessing}
            startIcon={isProcessing ? null : <ArrowUpDown size={20} />}
          >
            {isProcessing
              ? t('suppliers:csvImport.messages.processing')
              : t('suppliers:csvImport.messages.importData')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportDialog;
