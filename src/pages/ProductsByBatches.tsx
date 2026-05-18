import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ChevronDown, Package, AlertTriangle, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../types';
import type { ProductBatch } from '../types/batch.types';
import { batchService } from '../services/batchService';
import { apiService, type PackagingDocument } from '../services/apiService';
import { downloadBatchVerificationPDF } from '../lib/pdf-generator';

interface ProductsByBatchesProps {
  onManageBatches: (product: Product) => void;
}

interface ProductWithBatches extends Product {
  batches: ProductBatch[];
  batchCount: number;
}

export const ProductsByBatches: React.FC<ProductsByBatchesProps> = ({
  onManageBatches,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [productsWithBatches, setProductsWithBatches] = useState<
    ProductWithBatches[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | false>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [packagingDocsByProductId, setPackagingDocsByProductId] = useState<
    Record<string, PackagingDocument[]>
  >({});
  const [packagingDocsLoadingProductId, setPackagingDocsLoadingProductId] =
    useState<string | null>(null);

  const PRODUCTS_PER_PAGE = 10;
  const BATCHES_PER_PRODUCT = 10;

  // Ref for infinite scroll
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const loadedPackagingDocsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!expandedProduct || typeof expandedProduct !== 'string') return;

    const productId = expandedProduct;
    if (loadedPackagingDocsRef.current.has(productId)) return;

    (async () => {
      try {
        setPackagingDocsLoadingProductId(productId);
        const docs = await apiService.getPackagingDocuments(productId);
        setPackagingDocsByProductId(prev => ({
          ...prev,
          [productId]: docs,
        }));
      } catch (err) {
        console.error('Failed to load packaging documents:', err);
        setPackagingDocsByProductId(prev => ({
          ...prev,
          [productId]: [],
        }));
      } finally {
        setPackagingDocsLoadingProductId(null);
        loadedPackagingDocsRef.current.add(productId);
      }
    })();
  }, [expandedProduct]);

  const loadProductsPage = React.useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Fetch products with pagination
        const productsResult = await apiService.getProductsWithPrefetch({
          page: pageNum,
          limit: PRODUCTS_PER_PAGE,
          search: '',
        });

        // For each product, fetch its batches (limited to BATCHES_PER_PRODUCT)
        const productsWithBatchesData = await Promise.all(
          productsResult.data.map(async product => {
            try {
              const batchesResult = await batchService.getBatchesPaginated({
                page: 1,
                limit: BATCHES_PER_PRODUCT,
                productIds: [product.id],
              });

              return {
                ...product,
                batches: batchesResult.data,
                batchCount: batchesResult.total,
              };
            } catch (err) {
              console.error(
                `Error loading batches for product ${product.id}:`,
                err
              );
              return {
                ...product,
                batches: [],
                batchCount: 0,
              };
            }
          })
        );

        setTotal(productsResult.total);

        if (append) {
          setProductsWithBatches(prev => [...prev, ...productsWithBatchesData]);
        } else {
          setProductsWithBatches(productsWithBatchesData);
        }

        // Check if there are more pages
        setHasMore(
          productsResult.page * productsResult.limit < productsResult.total
        );
      } catch (err) {
        console.error('Error loading products and batches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProductsPage(1, false);
    setPage(1);
  }, [loadProductsPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('Intersection detected, loading page:', page + 1);
          const nextPage = page + 1;
          setPage(nextPage);
          loadProductsPage(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [page, hasMore, loading, loadingMore, loadProductsPage]);

  const batchColumns: GridColDef[] = [
    {
      field: 'batchNumber',
      headerName: t('products:batches.fields.batchNumber'),
      width: 150,
      flex: 1,
    },
    {
      field: 'quantity',
      headerName: t('products:batches.fields.quantity'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.quantity} {params.row.unit}
        </Typography>
      ),
    },
    {
      field: 'receivedDate',
      headerName: t('products:batches.fields.receivedDate'),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'ddsStatus',
      headerName: t('products:batches.fields.ddsStatus'),
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value;
        let color: 'success' | 'warning' | 'error' | 'default' = 'default';

        if (status === 'ACTIVE') color = 'success';
        else if (status === 'EXPIRING_SOON') color = 'warning';
        else if (status === 'EXPIRED' || status === 'GEOLOCATION_MISMATCH')
          color = 'error';

        return <Chip label={status || 'N/A'} color={color} size="small" />;
      },
    },
    {
      field: 'ddsNumber',
      headerName: t('products:batches.fields.ddsNumber'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Download PDF">
          <IconButton
            size="small"
            onClick={() =>
              downloadBatchVerificationPDF(params.row.id, 'PRODUCT')
            }
            color="primary"
          >
            <Download size={16} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (productsWithBatches.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        gap={2}
      >
        <Typography variant="h6" color="textSecondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {productsWithBatches.filter(p => p.batchCount > 0).length} products
            with batches
          </Typography>
          <Typography variant="body2" color="textSecondary">
            •
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {productsWithBatches.reduce((sum, p) => sum + p.batchCount, 0)}{' '}
            total batches
          </Typography>
        </Stack>
      </Box>

      {productsWithBatches.map(product => (
        <Accordion
          key={product.id}
          expanded={expandedProduct === product.id}
          onChange={(_, isExpanded) =>
            setExpandedProduct(isExpanded ? product.id : false)
          }
          sx={{ mb: 1 }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown />}
            sx={{
              '& .MuiAccordionSummary-content': {
                my: 1.5,
              },
            }}
          >
            <Box
              display="grid"
              gridTemplateColumns="minmax(250px, 2fr) 100px 80px minmax(200px, 1.5fr) minmax(120px, 1fr) 48px"
              alignItems="center"
              gap={2}
              width="100%"
              pr={2}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {product.name}
                </Typography>
                {(product.internalProductCode ||
                  product.supplierProductCode) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {product.internalProductCode &&
                      `Code: ${product.internalProductCode}`}
                    {product.internalProductCode &&
                      product.supplierProductCode &&
                      ' • '}
                    {product.supplierProductCode &&
                      `Supplier: ${product.supplierProductCode}`}
                  </Typography>
                )}
              </Box>
              <Chip
                label={`${product.batchCount} ${product.batchCount === 1 ? 'batch' : 'batches'}`}
                size="small"
                color={product.batchCount > 0 ? 'primary' : 'default'}
              />
              <Box>
                {product.isEudrRelevant && (
                  <Chip
                    icon={<AlertTriangle size={14} />}
                    label="EUDR"
                    size="small"
                    color="warning"
                  />
                )}
                {packagingDocsLoadingProductId === product.id ? (
                  <Box sx={{ mt: 0.5 }}>
                    <CircularProgress size={16} />
                  </Box>
                ) : (
                  (packagingDocsByProductId[product.id]?.length ?? 0) > 0 && (
                    <Chip
                      label={`${packagingDocsByProductId[product.id]?.length} docs`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: product.isEudrRelevant ? 0.5 : 0 }}
                    />
                  )
                )}
              </Box>

              {/* Supplier Name */}
              <Typography
                variant="body2"
                color="textSecondary"
                noWrap
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {product.supplierName}
              </Typography>

              {/* Country */}
              <Typography
                variant="body2"
                color="textSecondary"
                noWrap
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {product.country}
              </Typography>

              {/* Actions */}
              <Tooltip title="Manage Batches">
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    onManageBatches(product);
                  }}
                  color="primary"
                >
                  <Package size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {packagingDocsLoadingProductId === product.id &&
            packagingDocsByProductId[product.id] === undefined ? (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="caption" color="text.secondary">
                  Loading EU 2025/40 packaging docs...
                </Typography>
              </Box>
            ) : (packagingDocsByProductId[product.id]?.length ?? 0) > 0 ? (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  EU 2025/40 Packaging documents
                </Typography>
                <Stack spacing={1}>
                  {(packagingDocsByProductId[product.id] || []).map(doc => (
                    <Box
                      key={doc.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {doc.docTypeLabel && (
                          <Chip
                            size="small"
                            label={doc.docTypeLabel}
                            sx={{ mb: 0.5, mr: 0.5 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          noWrap
                          title={doc.filename}
                        >
                          {doc.filename}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        {doc.expiryDate ? (
                          <Chip
                            size="small"
                            label={`Valid until ${new Date(
                              doc.expiryDate
                            ).toLocaleDateString()}`}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="No expiry"
                            variant="outlined"
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (doc.url) window.open(doc.url, '_blank');
                          }}
                          disabled={!doc.url}
                          title="Download"
                        >
                          <Download size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ) : null}
            {product.batches.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  No batches for this product yet.
                </Typography>
                <IconButton
                  onClick={() => onManageBatches(product)}
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  <Package size={20} />
                </IconButton>
              </Box>
            ) : (
              <Paper variant="outlined">
                <DataGrid
                  rows={product.batches}
                  columns={batchColumns}
                  autoHeight
                  hideFooter={product.batches.length <= 10}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                />
              </Paper>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {hasMore && (
        <div
          ref={observerTarget}
          style={{
            height: '20px',
            margin: '20px 0',
          }}
        />
      )}
      {loadingMore && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Show total count info */}
      {!hasMore && productsWithBatches.length > 0 && (
        <Box display="flex" justifyContent="center" py={2}>
          <Typography variant="body2" color="textSecondary">
            Showing all {total} products
          </Typography>
        </Box>
      )}
    </Box>
  );
};
