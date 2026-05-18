import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Stack,
  useTheme,
  CircularProgress,
  DialogContentText,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Plus,
  Upload,
  Download,
  ChevronDown,
  Edit,
  Save,
  X,
  Trash2,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../types';
import {
  CSVImportService,
  type ImportResult,
} from '../services/csvImportService';
import { apiService } from '../services/apiService';
import { LocalStorageService } from '../services/localStorageService';
import CSVImportDialog from '../components/CSVImport/CSVImportDialog';
import { SupplierDossier } from '../components/SupplierMasterData/SupplierDossier';
import { getRiskLevelFromCountry } from '../lib/country-risk';
import {
  AddressAutocomplete,
  type ParsedAddress,
} from '../components/AddressAutocomplete';
import type { Supplier } from '../types/survey.types';

const Suppliers: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['suppliers', 'common']);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<
    Record<string, Product[]>
  >({});
  const [supplierStats, setSupplierStats] = useState<
    Record<string, { total: number; eudrRelevant: number }>
  >({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );
  const [dossierOpen, setDossierOpen] = useState(false);
  const [selectedSupplierForDossier, setSelectedSupplierForDossier] =
    useState<Supplier | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning'
  >('success');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    LocalStorageService.getSuppliersPageSize()
  );
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    LocalStorageService.saveSuppliersPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        const result = await apiService.getSuppliersWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });
        setSuppliers(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        setSnackbarMessage(t('suppliers:messages.failedToLoad'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, [page, pageSize, searchDebounced, t]);

  // Helper function to get products for a specific supplier (lazy loading)
  const getSupplierProducts = async (
    supplierId: string
  ): Promise<Product[]> => {
    if (supplierProducts[supplierId]) {
      return supplierProducts[supplierId];
    }

    try {
      const products = await apiService.getProductsBySupplier(supplierId);
      setSupplierProducts(prev => ({ ...prev, [supplierId]: products }));

      // Calculate and cache statistics
      const eudrRelevant = products.filter(p => p.isEudrRelevant).length;
      setSupplierStats(prev => ({
        ...prev,
        [supplierId]: { total: products.length, eudrRelevant },
      }));

      return products;
    } catch (error) {
      console.error('Error loading supplier products:', error);
      return [];
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('suppliers:fields.name'), width: 250 },
    { field: 'country', headerName: t('common:fields.country'), width: 120 },
    {
      field: 'contactPerson',
      headerName: t('suppliers:fields.contactPerson'),
      width: 150,
    },
    { field: 'email', headerName: t('common:fields.email'), width: 200 },
    { field: 'phone', headerName: t('common:fields.phone'), width: 150 },
    {
      field: 'isEuOrigin',
      headerName: t('common:fields.origin'),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.value
              ? t('suppliers:labels.eu')
              : t('suppliers:labels.nonEU')
          }
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'riskLevel',
      headerName: t('suppliers:fields.riskLevel'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Chip
            label={t(`suppliers:riskLevels.${params.formattedValue}`)}
            color={
              params.value === 'high'
                ? 'error'
                : params.value === 'medium'
                  ? 'warning'
                  : 'success'
            }
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: t('common:actions.actions'),
      filterable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Supplier>) => (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="left"
          gap={1}
          height="100%"
        >
          <IconButton
            onClick={() => handleViewDossier(params.row)}
            size="small"
            title="View Dossier"
          >
            <FileText size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleEditSupplier(params.row)}
            size="small"
            title="Edit"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteSupplier(params.row)}
            size="small"
            color="error"
            title="Delete"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleViewDossier = (supplier: Supplier) => {
    setSelectedSupplierForDossier(supplier);
    setDossierOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
    setOpenDialog(true);
    // Load supplier statistics when dialog opens
    getSupplierProducts(supplier.id);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
    // Load supplier statistics for the delete confirmation
    getSupplierProducts(supplier.id);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      setDeleteLoading(true);

      // Get products for this specific supplier
      const linkedProducts = await getSupplierProducts(supplierToDelete.id);

      if (linkedProducts.length > 0) {
        // Delete linked products first
        const productIds = linkedProducts.map(p => p.id);
        await apiService.deleteProducts(productIds);
      }

      // Delete the supplier
      await apiService.deleteSupplier(supplierToDelete.id);

      // Refetch current page to get updated data
      const updatedSuppliers = await apiService.getSuppliersWithPrefetch({
        page,
        limit: pageSize,
        search: searchDebounced,
      });
      setSuppliers(updatedSuppliers.data);
      setTotal(updatedSuppliers.total);

      // Clear the cached products and stats for this supplier
      setSupplierProducts(prev => {
        const newState = { ...prev };
        delete newState[supplierToDelete.id];
        return newState;
      });
      setSupplierStats(prev => {
        const newState = { ...prev };
        delete newState[supplierToDelete.id];
        return newState;
      });

      setSnackbarMessage(
        t('suppliers:messages.supplierDeletedWithProducts', {
          name: supplierToDelete.name,
          count: linkedProducts.length,
        })
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setSnackbarMessage(t('suppliers:messages.errorDeleting'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      setSaveLoading(true);

      if (editingSupplier?.id) {
        // Update existing supplier
        const supplierData = {
          name: editingSupplier.name,
          country: editingSupplier.country,
          address: editingSupplier.address,
          contactPerson: editingSupplier.contactPerson,
          email: editingSupplier.email,
          phone: editingSupplier.phone,
          riskLevel: editingSupplier.riskLevel,
          isEuOrigin: editingSupplier.isEuOrigin,
          certifications: editingSupplier.certifications,
        };

        await apiService.updateSupplier(editingSupplier.id, supplierData);

        const result = await apiService.getSuppliersWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });
        setSuppliers(result.data);
        setTotal(result.total);

        // Update related products' supplier names if changed
        const relatedProducts = await getSupplierProducts(editingSupplier.id);
        for (const product of relatedProducts) {
          if (product.supplierName !== editingSupplier.name) {
            await apiService.updateProduct(product.id, {
              supplierName: editingSupplier.name,
            });
          }
        }

        // Update cached products for this supplier
        const updatedProducts = await apiService.getProductsBySupplier(
          editingSupplier.id
        );
        setSupplierProducts(prev => ({
          ...prev,
          [editingSupplier.id]: updatedProducts,
        }));

        const eudrRelevant = updatedProducts.filter(
          p => p.isEudrRelevant
        ).length;
        setSupplierStats(prev => ({
          ...prev,
          [editingSupplier.id]: { total: updatedProducts.length, eudrRelevant },
        }));

        setSnackbarMessage(t('suppliers:messages.supplierUpdated'));
        setSnackbarSeverity('success');
      } else if (newSupplier.name && newSupplier.country) {
        // Add new supplier
        const supplierData = {
          name: newSupplier.name,
          country: newSupplier.country,
          address: newSupplier.address || '',
          contactPerson: newSupplier.contactPerson || '',
          email: newSupplier.email || '',
          phone: newSupplier.phone || '',
          riskLevel:
            newSupplier.riskLevel ||
            getRiskLevelFromCountry(newSupplier.country),
          isEuOrigin: newSupplier.isEuOrigin || false,
          certifications: [],
        };

        await apiService.createSupplier(supplierData);

        const result = await apiService.getSuppliersWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });

        setSuppliers(result.data);
        setTotal(result.total);

        setSnackbarMessage(t('suppliers:messages.supplierAdded'));
        setSnackbarSeverity('success');
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving supplier:', error);
      setSnackbarMessage(t('suppliers:messages.errorSaving'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }

    setEditingSupplier(null);
    setNewSupplier({});
    setOpenDialog(false);
  };

  const handleImportComplete = async (result: ImportResult) => {
    try {
      setImportLoading(true);

      // Prepare import data for the backend
      const importData = {
        suppliers: result.suppliers.map(s => ({
          name: s.name,
          country: s.country,
          address: s.address,
          contactPerson: s.contactPerson,
          email: s.email,
          phone: s.phone,
          riskLevel: s.riskLevel,
          isEuOrigin: s.isEuOrigin,
          certifications: s.certifications || [],
        })),
        products: result.products.map(p => ({
          name: p.name,
          supplierName: p.supplierName,
          category: p.category,
          country: p.country,
          origin: p.origin,
          commodityType: p.commodityType,
          hsCode: p.hsCode,
          unit: p.unit,
          isEudrRelevant: p.isEudrRelevant,
        })),
      };

      const importResult = await apiService.importData(importData);

      const updatedSuppliers = await apiService.getSuppliersWithPrefetch({
        page,
        limit: pageSize,
        search: searchDebounced,
      });

      setSuppliers(updatedSuppliers.data);
      setTotal(updatedSuppliers.total);

      // Clear supplier products cache since new data was imported
      setSupplierProducts({});
      setSupplierStats({});

      let message = t('suppliers:messages.importSuccess', {
        suppliers: importResult.result.suppliers.created,
        products: importResult.result.products.created,
      });
      let severity: 'success' | 'warning' = 'success';

      if (importResult.result.warnings.length > 0) {
        message = t('suppliers:messages.importSuccessWithWarnings', {
          suppliers: importResult.result.suppliers.created,
          products: importResult.result.products.created,
          warnings: importResult.result.warnings.length,
        });
        severity = 'warning';
      }

      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
      setCsvImportOpen(false);
    } catch (error) {
      console.error('Error importing data:', error);
      setSnackbarMessage(t('suppliers:messages.errorImporting'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setImportLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = CSVImportService.exportSuppliersToCSV(suppliers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentSupplier = editingSupplier || newSupplier;
  const isEditing = !!editingSupplier;

  return (
    <Box gap={2} flexDirection="column" display="flex">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="h4">
            {t('suppliers:title')} ({total})
          </Typography>
          <IconButton
            onClick={() => {
              setEditingSupplier(null);
              setNewSupplier({});
              setOpenDialog(true);
            }}
          >
            <Plus
              size={32}
              style={{
                color: theme.palette.background.paper,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '50%',
                padding: '4px',
              }}
            />
          </IconButton>
        </Stack>
        <Box display="flex" gap={2}>
          {(suppliers ?? []).length > 0 && (
            <Button
              variant="outlined"
              startIcon={
                importLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <Upload size={20} />
                )
              }
              onClick={() => setCsvImportOpen(true)}
              disabled={importLoading}
            >
              {importLoading
                ? t('suppliers:messages.importing')
                : `${t('common:actions.import')} CSV`}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
            onClick={exportToCSV}
            disabled={suppliers.length === 0}
          >
            {t('common:actions.export')} CSV
          </Button>
        </Box>
      </Box>

      {/* Search Box */}
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('suppliers:labels.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      <Paper elevation={2}>
        <DataGrid
          rows={suppliers}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={total}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={model => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{ height: 600 }}
          slots={{
            noRowsOverlay: () => (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                gap={3}
                p={4}
              >
                <Typography variant="h6" color="textSecondary">
                  {t('suppliers:labels.noSuppliers')}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                >
                  {t('suppliers:labels.noSuppliersDescription')}
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Upload size={20} />}
                    onClick={() => setCsvImportOpen(true)}
                    disabled={importLoading}
                  >
                    {importLoading
                      ? t('suppliers:messages.importing')
                      : t('suppliers:labels.importCsv')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Plus size={20} />}
                    onClick={() => {
                      setEditingSupplier(null);
                      setNewSupplier({});
                      setOpenDialog(true);
                    }}
                  >
                    {t('suppliers:labels.addManually')}
                  </Button>
                </Box>
              </Box>
            ),
          }}
        />
      </Paper>
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={20} />}>
          <Typography variant="h6">
            {t('suppliers:csvImportInstructions.title')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            {t('suppliers:csvImportInstructions.description')}
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>{t('suppliers:csvImportInstructions.columnsList.hsCode')}</li>
            <li>
              {t('suppliers:csvImportInstructions.columnsList.productName')}
            </li>
            <li>
              {t('suppliers:csvImportInstructions.columnsList.supplierName')}
            </li>
            <li>{t('suppliers:csvImportInstructions.columnsList.category')}</li>
            <li>{t('suppliers:csvImportInstructions.columnsList.country')}</li>
            <li>{t('suppliers:csvImportInstructions.columnsList.origin')}</li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('suppliers:csvImportInstructions.automaticProcessing')}
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>
              {t(
                'suppliers:csvImportInstructions.processingList.createSuppliers'
              )}
            </li>
            <li>
              {t(
                'suppliers:csvImportInstructions.processingList.createProducts'
              )}
            </li>
            <li>
              {t(
                'suppliers:csvImportInstructions.processingList.determineRelevance'
              )}
            </li>
            <li>
              {t(
                'suppliers:csvImportInstructions.processingList.setRiskLevels'
              )}
            </li>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing
            ? `${t('suppliers:editSupplier')}: ${editingSupplier?.name}`
            : t('suppliers:addSupplier')}
        </DialogTitle>
        <DialogContent>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gap={2}
            sx={{ mt: 1 }}
          >
            <TextField
              label={t('suppliers:fields.name')}
              value={currentSupplier.name || ''}
              onChange={e =>
                isEditing
                  ? setEditingSupplier(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  : setNewSupplier({ ...newSupplier, name: e.target.value })
              }
              required
            />
            {/* Country + Address handled by AddressAutocomplete below */}
            <TextField
              label={t('suppliers:fields.contactPerson')}
              value={currentSupplier.contactPerson || ''}
              onChange={e =>
                isEditing
                  ? setEditingSupplier(prev =>
                      prev ? { ...prev, contactPerson: e.target.value } : null
                    )
                  : setNewSupplier({
                      ...newSupplier,
                      contactPerson: e.target.value,
                    })
              }
            />
            <TextField
              label={t('common:fields.email')}
              type="email"
              value={currentSupplier.email || ''}
              onChange={e =>
                isEditing
                  ? setEditingSupplier(prev =>
                      prev ? { ...prev, email: e.target.value } : null
                    )
                  : setNewSupplier({ ...newSupplier, email: e.target.value })
              }
            />
            <TextField
              label={t('common:fields.phone')}
              value={currentSupplier.phone || ''}
              onChange={e =>
                isEditing
                  ? setEditingSupplier(prev =>
                      prev ? { ...prev, phone: e.target.value } : null
                    )
                  : setNewSupplier({ ...newSupplier, phone: e.target.value })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentSupplier.isEuOrigin || false}
                  onChange={e =>
                    isEditing
                      ? setEditingSupplier(prev =>
                          prev
                            ? { ...prev, isEuOrigin: e.target.checked }
                            : null
                        )
                      : setNewSupplier({
                          ...newSupplier,
                          isEuOrigin: e.target.checked,
                        })
                  }
                />
              }
              label={t('suppliers:labels.euOrigin')}
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <AddressAutocomplete
                value={{
                  street: currentSupplier.address || '',
                  city: '',
                  postalCode: '',
                  country: currentSupplier.country || '',
                  formatted: currentSupplier.address || '',
                }}
                onChange={(parsed: ParsedAddress) => {
                  const address = [
                    parsed.street,
                    parsed.city,
                    parsed.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ');
                  const country = parsed.country;
                  if (isEditing) {
                    setEditingSupplier(prev =>
                      prev ? { ...prev, address, country } : null
                    );
                  } else {
                    setNewSupplier(prev => ({ ...prev, address, country }));
                  }
                }}
                labels={{
                  search: t('settings:fields.searchAddress', {
                    defaultValue: 'Search address…',
                  }),
                  street: t('suppliers:labels.address', {
                    defaultValue: 'Address',
                  }),
                  city: t('common:fields.city', { defaultValue: 'City' }),
                  postalCode: t('common:fields.postalCode', {
                    defaultValue: 'Postal Code',
                  }),
                  country: t('common:fields.country', {
                    defaultValue: 'Country',
                  }),
                }}
              />
            </Box>
          </Box>

          {isEditing && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                {t('suppliers:statistics.title', {
                  defaultValue: 'Supplier Statistics',
                })}
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('suppliers:fields.products', {
                      defaultValue: 'Products',
                    })}
                  </Typography>
                  <Typography variant="h6">
                    {editingSupplier?.id
                      ? (supplierStats[editingSupplier.id]?.total ?? '...')
                      : 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('common:eudr.relevant')}
                  </Typography>
                  <Typography variant="h6">
                    {editingSupplier?.id
                      ? (supplierStats[editingSupplier.id]?.eudrRelevant ??
                        '...')
                      : 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('suppliers:fields.riskLevel')}
                  </Typography>
                  <Chip
                    label={editingSupplier?.riskLevel}
                    color={
                      editingSupplier?.riskLevel === 'high'
                        ? 'error'
                        : editingSupplier?.riskLevel === 'medium'
                          ? 'warning'
                          : 'success'
                    }
                    size="small"
                  />
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            startIcon={<X size={20} />}
            disabled={saveLoading}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={handleSaveSupplier}
            variant="contained"
            startIcon={
              saveLoading ? <CircularProgress size={20} /> : <Save size={20} />
            }
            disabled={
              !currentSupplier.name || !currentSupplier.country || saveLoading
            }
          >
            {saveLoading
              ? t('suppliers:messages.saving')
              : isEditing
                ? t('common:actions.saveChanges')
                : t('suppliers:addSupplier')}
          </Button>
        </DialogActions>
      </Dialog>
      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('suppliers:labels.confirmDeletion')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('suppliers:labels.deleteConfirmation', {
              name: supplierToDelete?.name,
            })}
            {supplierToDelete?.id &&
              supplierStats[supplierToDelete.id]?.total > 0 && (
                <span>
                  <br />
                  <br />
                  <strong>{t('common:messages.warning')}:</strong>{' '}
                  {t('suppliers:labels.deleteWarning', {
                    count: supplierStats[supplierToDelete.id]?.total,
                  })}
                </span>
              )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteLoading}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Trash2 size={20} />
              )
            }
          >
            {deleteLoading
              ? t('suppliers:messages.deleting')
              : t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dossierOpen}
        onClose={() => setDossierOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {selectedSupplierForDossier?.name} -{' '}
              {t('suppliers:labels.supplierDossier')}
            </Typography>
            <IconButton onClick={() => setDossierOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSupplierForDossier && (
            <SupplierDossier supplierId={selectedSupplierForDossier.id} />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
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

export default Suppliers;
