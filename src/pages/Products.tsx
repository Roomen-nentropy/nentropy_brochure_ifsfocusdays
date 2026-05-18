import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
  Alert,
  Snackbar,
  TextField,
  Switch,
  FormControlLabel,
  DialogContentText,
  CircularProgress,
  Divider,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Plus,
  Edit,
  Save,
  X,
  AlertTriangle,
  Trash2,
  Package,
  Grid3x3,
  Layers,
  Upload,
  ClipboardList,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../types';
import { apiService } from '../services/apiService';
import type { ImportResult } from '../services/csvImportService';
import CSVImportDialog from '../components/CSVImport/CSVImportDialog';
import { LocalStorageService } from '../services/localStorageService';
import type { Supplier } from '../types/survey.types';
import { BatchManagementSidebar } from '../components/BatchManagement';
import { ProductsByBatches } from './ProductsByBatches';
import { ProductDossier } from '../components/Dossiers/ProductDossier';

const Products: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['products', 'common']);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning'
  >('success');

  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const [batchSidebarOpen, setBatchSidebarOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] =
    useState<Product | null>(null);

  const [productDossierId, setProductDossierId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'batches'>('grid');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    LocalStorageService.getProductsPageSize()
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
    LocalStorageService.saveProductsPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await apiService.getProductsWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });
        setProducts(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('Error loading products:', error);
        setSnackbarMessage(t('products:messages.errorLoadingProducts'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, pageSize, searchDebounced, t]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const result = await apiService.getAllSuppliers();
        setSuppliers(result);
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    };

    loadSuppliers();
  }, []);

  const eudrRelevantCategories = [
    'кафе',
    'coffee',
    'палмово масло',
    'palm oil',
    'соя',
    'soy',
    'говеждо месо',
    'beef',
    'дървесина',
    'timber',
    'какао',
    'cocoa',
    'каучук',
    'rubber',
  ];

  const columns: GridColDef[] = [
    {
      field: 'internalProductCode',
      headerName: t('products:fields.internalProductCode'),
      width: 140,
    },
    {
      field: 'supplierProductCode',
      headerName: t('products:fields.supplierProductCode'),
      width: 140,
    },
    {
      field: 'hsCode',
      headerName: t('products:fields.hsCode'),
      width: 120,
    },
    { field: 'name', headerName: t('products:fields.name'), width: 200 },
    {
      field: 'supplierName',
      headerName: t('products:fields.supplier'),
      width: 180,
    },
    {
      field: 'category',
      headerName: t('products:fields.category'),
      width: 150,
    },
    {
      field: 'country',
      headerName: t('products:fields.country'),
      width: 140,
    },
    {
      field: 'isEudrRelevant',
      headerName: t('products:fields.isEudrRelevant'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={0}
          gap={1}
        >
          {params.value && <AlertTriangle color="orange" size={16} />}
          <Chip
            label={params.value ? t('common:yesNo.yes') : t('common:yesNo.no')}
            color={params.value ? 'warning' : 'default'}
            size="small"
          />
        </Box>
      ),
    },
    {
      field: 'origin',
      headerName: t('common:fields.origin', { defaultValue: 'Origin' }),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={0}
          gap={1}
        >
          <Chip
            label={params.value}
            color={params.value === 'EU' ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t('common:actions.actions', { defaultValue: 'Actions' }),
      width: 260,
      disableColumnMenu: true,
      disableReorder: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={0}
          gap={1}
        >
          <Tooltip title="Dossier">
            <IconButton
              onClick={() => setProductDossierId((params.row as Product).id)}
              size="small"
              color="secondary"
            >
              <ClipboardList size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('products:batches.manageBatches')}>
            <IconButton
              onClick={() => {
                setSelectedProductForBatch(params.row as Product);
                setBatchSidebarOpen(true);
              }}
              size="small"
              color="primary"
            >
              <Package size={16} />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => handleEditProduct(params.row as Product)}
            size="small"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteProduct(params.row as Product)}
            size="small"
            color="error"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setOpenDialog(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);

      await apiService.deleteProduct(productToDelete.id);

      const result = await apiService.getProductsWithPrefetch({
        page,
        limit: pageSize,
        search: searchDebounced,
      });
      setProducts(result.data);
      setTotal(result.total);

      setSnackbarMessage(
        t('products:messages.productDeletedSuccess', {
          name: productToDelete.name,
        })
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbarMessage(t('products:messages.errorDeletingProduct'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
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
          internalProductCode: p.internalProductCode,
          supplierProductCode: p.supplierProductCode,
        })),
      };

      const importResult = await apiService.importData(importData);

      // Refetch current page to get updated data
      const updatedProducts = await apiService.getProductsWithPrefetch({
        page,
        limit: pageSize,
        search: searchDebounced,
      });

      setProducts(updatedProducts.data);
      setTotal(updatedProducts.total);

      let message = t('products:messages.importSuccess', {
        suppliers: importResult.result.suppliers.created,
        products: importResult.result.products.created,
        defaultValue: `Successfully imported ${importResult.result.suppliers.created} suppliers and ${importResult.result.products.created} products`,
      });
      let severity: 'success' | 'warning' = 'success';

      if (importResult.result.warnings.length > 0) {
        message = t('products:messages.importSuccessWithWarnings', {
          suppliers: importResult.result.suppliers.created,
          products: importResult.result.products.created,
          warnings: importResult.result.warnings.length,
          defaultValue: `Imported ${importResult.result.suppliers.created} suppliers and ${importResult.result.products.created} products with ${importResult.result.warnings.length} warnings`,
        });
        severity = 'warning';
      }

      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
      setCsvImportOpen(false);
    } catch (error) {
      console.error('Error importing data:', error);
      setSnackbarMessage(t('products:messages.errorImporting'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      setSaveLoading(true);

      if (editingProduct?.id) {
        // Update existing product
        const productData = {
          name: editingProduct.name,
          supplierName: editingProduct.supplierName,
          supplierId: editingProduct.supplierId,
          category: editingProduct.category,
          country: editingProduct.country,
          origin: editingProduct.origin,
          commodityType: editingProduct.commodityType,
          hsCode: editingProduct.hsCode,
          unit: editingProduct.unit,
          isEudrRelevant: editingProduct.isEudrRelevant,
          internalProductCode: editingProduct.internalProductCode,
          supplierProductCode: editingProduct.supplierProductCode,
        };

        await apiService.updateProduct(editingProduct.id, productData);

        // Refetch current page to get updated data
        const result = await apiService.getProductsWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });
        setProducts(result.data);
        setTotal(result.total);

        setSnackbarMessage(t('products:messages.productUpdatedSuccess'));
        setSnackbarSeverity('success');
      } else if (
        newProduct.name &&
        newProduct.category &&
        newProduct.supplierId
      ) {
        // Add new product
        const selectedSupplier = suppliers.find(
          s => s.id === newProduct.supplierId
        );
        const isEudrRelevant = eudrRelevantCategories.some(cat =>
          newProduct.category?.toLowerCase().includes(cat.toLowerCase())
        );

        const productData = {
          name: newProduct.name,
          category: newProduct.category,
          supplierId: newProduct.supplierId,
          supplierName: selectedSupplier?.name || '',
          country: newProduct.country || selectedSupplier?.country || '',
          origin:
            newProduct.origin ||
            (selectedSupplier?.isEuOrigin ? 'EU' : 'NON-EU'),
          commodityType: newProduct.commodityType,
          hsCode: newProduct.hsCode,
          unit: newProduct.unit,
          isEudrRelevant,
          internalProductCode: newProduct.internalProductCode,
          supplierProductCode: newProduct.supplierProductCode,
        };

        await apiService.createProduct(productData);

        // Refetch current page to get updated data
        const result = await apiService.getProductsWithPrefetch({
          page,
          limit: pageSize,
          search: searchDebounced,
        });
        setProducts(result.data);
        setTotal(result.total);

        setSnackbarMessage(t('products:messages.productCreatedSuccess'));
        setSnackbarSeverity('success');
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbarMessage(t('products:messages.errorSavingProduct'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }

    setEditingProduct(null);
    setNewProduct({});
    setOpenDialog(false);
  };

  const getEudrRelevantCount = () =>
    products.filter(p => p.isEudrRelevant).length;

  const currentProduct = editingProduct || newProduct;
  const isEditing = !!editingProduct;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="h4">
            {t('products:title')} ({total})
          </Typography>
          <IconButton
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({});
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
        <Box display="flex" gap={2} alignItems="center">
          {products.length > 0 && (
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
                ? t('products:messages.importing', {
                    defaultValue: 'Importing...',
                  })
                : `${t('common:actions.import')} CSV`}
            </Button>
          )}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="grid">
              <Grid3x3 size={18} style={{ marginRight: 8 }} />
              {t('products:views.grid')}
            </ToggleButton>
            <ToggleButton value="batches">
              <Layers size={18} style={{ marginRight: 8 }} />
              {t('products:views.batches')}
            </ToggleButton>
          </ToggleButtonGroup>
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
            {t('common:eudr.relevant')}: {getEudrRelevantCount()}
          </Alert>
        </Box>
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('common:search.placeholder', {
            defaultValue:
              'Search products by name, supplier, category, country, HS code...',
          })}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {viewMode === 'batches' ? (
        <ProductsByBatches
          onManageBatches={product => {
            setSelectedProductForBatch(product);
            setBatchSidebarOpen(true);
          }}
        />
      ) : products.length === 0 && !loading ? (
        <Paper elevation={2}>
          <DataGrid
            rows={[]}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={0}
            paginationModel={{ page: page - 1, pageSize }}
            onPaginationModelChange={model => {
              setPage(model.page + 1);
              setPageSize(model.pageSize);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            sx={{ height: 800 }}
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
                    {t('products:messages.noProductsFound')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    textAlign="center"
                  >
                    {t('products:messages.noProductsInstructionsDetailed')}
                  </Typography>
                  <Box
                    display="flex"
                    gap={2}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Plus size={20} />}
                      onClick={() => {
                        setEditingProduct(null);
                        setNewProduct({});
                        setOpenDialog(true);
                      }}
                      disabled={suppliers.length === 0}
                    >
                      {t('products:labels.addProduct')}
                    </Button>
                    {suppliers.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        {t('products:messages.addSuppliersFirst')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ),
            }}
          />
        </Paper>
      ) : (
        <Paper elevation={2}>
          <DataGrid
            rows={products}
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
            disableRowSelectionOnClick
            sx={{ height: 800 }}
          />
        </Paper>
      )}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing
            ? `${t('products:editProduct')}: ${editingProduct?.name}`
            : t('products:addProduct')}
        </DialogTitle>
        <DialogContent>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gap={2}
            sx={{ mt: 1 }}
          >
            <TextField
              label={t('products:fields.internalProductCode')}
              value={currentProduct.internalProductCode || ''}
              onChange={e =>
                isEditing
                  ? setEditingProduct(prev =>
                      prev
                        ? { ...prev, internalProductCode: e.target.value }
                        : null
                    )
                  : setNewProduct({
                      ...newProduct,
                      internalProductCode: e.target.value,
                    })
              }
              placeholder={t('products:placeholders.internalProductCode')}
            />
            <TextField
              label={t('products:fields.supplierProductCode')}
              value={currentProduct.supplierProductCode || ''}
              onChange={e =>
                isEditing
                  ? setEditingProduct(prev =>
                      prev
                        ? { ...prev, supplierProductCode: e.target.value }
                        : null
                    )
                  : setNewProduct({
                      ...newProduct,
                      supplierProductCode: e.target.value,
                    })
              }
              placeholder={t('products:placeholders.supplierProductCode')}
            />
            <TextField
              label={t('products:fields.hsCode')}
              value={currentProduct.hsCode || ''}
              onChange={e =>
                isEditing
                  ? setEditingProduct(prev =>
                      prev ? { ...prev, hsCode: e.target.value } : null
                    )
                  : setNewProduct({
                      ...newProduct,
                      hsCode: e.target.value,
                    })
              }
            />
            <TextField
              label={t('products:fields.name')}
              value={currentProduct.name || ''}
              onChange={e =>
                isEditing
                  ? setEditingProduct(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  : setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
            />
            <TextField
              label={t('products:fields.category')}
              value={currentProduct.category || ''}
              onChange={e => {
                const category = e.target.value;
                const isEudrRelevant = eudrRelevantCategories.some(cat =>
                  category.toLowerCase().includes(cat.toLowerCase())
                );

                if (isEditing) {
                  setEditingProduct(prev =>
                    prev
                      ? {
                          ...prev,
                          category,
                          isEudrRelevant,
                        }
                      : null
                  );
                } else {
                  setNewProduct({
                    ...newProduct,
                    category,
                    isEudrRelevant,
                  });
                }
              }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>{t('products:fields.supplier')}</InputLabel>
              <Select
                value={currentProduct.supplierId || ''}
                onChange={e => {
                  const supplierId = e.target.value;
                  const supplier = suppliers.find(s => s.id === supplierId);

                  if (isEditing) {
                    setEditingProduct(prev =>
                      prev
                        ? {
                            ...prev,
                            supplierId,
                            supplierName: supplier?.name || '',
                            country: supplier?.country || prev.country,
                            origin: supplier?.isEuOrigin ? 'EU' : 'NON-EU',
                          }
                        : null
                    );
                  } else {
                    setNewProduct({
                      ...newProduct,
                      supplierId,
                      supplierName: supplier?.name || '',
                      country: supplier?.country || '',
                      origin: supplier?.isEuOrigin ? 'EU' : 'NON-EU',
                    });
                  }
                }}
              >
                {suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.country})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('products:fields.country')}
              value={currentProduct.country || ''}
              onChange={e =>
                isEditing
                  ? setEditingProduct(prev =>
                      prev ? { ...prev, country: e.target.value } : null
                    )
                  : setNewProduct({ ...newProduct, country: e.target.value })
              }
            />
            <FormControl>
              <InputLabel>{t('common:fields.origin')}</InputLabel>
              <Select
                value={currentProduct.origin || 'NON-EU'}
                onChange={e =>
                  isEditing
                    ? setEditingProduct(prev =>
                        prev ? { ...prev, origin: e.target.value } : null
                      )
                    : setNewProduct({ ...newProduct, origin: e.target.value })
                }
              >
                <MenuItem value="EU">{t('products:labels.eu')}</MenuItem>
                <MenuItem value="NON-EU">{t('products:labels.nonEU')}</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={currentProduct.isEudrRelevant || false}
                  onChange={e =>
                    isEditing
                      ? setEditingProduct(prev =>
                          prev
                            ? { ...prev, isEudrRelevant: e.target.checked }
                            : null
                        )
                      : setNewProduct({
                          ...newProduct,
                          isEudrRelevant: e.target.checked,
                        })
                  }
                />
              }
              label={t('products:labels.eudrRelevant')}
            />
          </Box>

          {currentProduct.isEudrRelevant && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('products:alerts.eudrRelevantWarning')}
            </Alert>
          )}

          {isEditing && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                {t('products:fields.productInfo')}
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('products:labels.created')}
                  </Typography>
                  <Typography variant="body1">
                    {editingProduct?.createdAt
                      ? new Date(editingProduct.createdAt).toLocaleDateString()
                      : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('products:labels.lastUpdated')}
                  </Typography>
                  <Typography variant="body1">
                    {editingProduct?.updatedAt
                      ? new Date(editingProduct.updatedAt).toLocaleDateString()
                      : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('products:labels.riskLevel')}
                  </Typography>
                  <Chip
                    label={
                      suppliers.find(s => s.id === editingProduct?.supplierId)
                        ?.riskLevel || t('products:labels.unknown')
                    }
                    color={
                      suppliers.find(s => s.id === editingProduct?.supplierId)
                        ?.riskLevel === 'high'
                        ? 'error'
                        : suppliers.find(
                              s => s.id === editingProduct?.supplierId
                            )?.riskLevel === 'medium'
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
            onClick={handleSaveProduct}
            variant="contained"
            startIcon={
              saveLoading ? <CircularProgress size={20} /> : <Save size={20} />
            }
            disabled={
              !currentProduct.name || !currentProduct.category || saveLoading
            }
          >
            {saveLoading
              ? t('products:messages.saving')
              : isEditing
                ? t('common:actions.saveChanges')
                : t('products:addProduct')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('products:labels.confirmDeletion')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('products:labels.deleteConfirmation', {
              name: productToDelete?.name,
            })}
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
            onClick={handleConfirmDeleteProduct}
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
              ? t('products:messages.deleting')
              : t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Batch Management Sidebar */}
      {selectedProductForBatch && (
        <BatchManagementSidebar
          open={batchSidebarOpen}
          onClose={() => {
            setBatchSidebarOpen(false);
            setSelectedProductForBatch(null);
          }}
          product={selectedProductForBatch}
          onBatchesUpdate={() => {
            // Optionally refresh products list to show updated batch info
          }}
        />
      )}

      <Dialog
        open={!!productDossierId}
        onClose={() => setProductDossierId(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {t('products:labels.productDossier')}
          <IconButton size="small" onClick={() => setProductDossierId(null)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {productDossierId && <ProductDossier productId={productDossierId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDossierId(null)}>
            {t('common:actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
