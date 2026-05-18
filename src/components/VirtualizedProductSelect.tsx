import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Product } from '../types';

interface VirtualizedProductSelectProps {
  supplierId: string;
  value: Array<{
    id: string;
    name: string;
    hsCode?: string;
    category?: string;
  }>;
  onChange: (
    products: Array<{
      id: string;
      name: string;
      hsCode?: string;
      category?: string;
    }>
  ) => void;
  label: string;
  required?: boolean;
}

const VirtualizedProductSelect: React.FC<VirtualizedProductSelectProps> = ({
  supplierId,
  value,
  onChange,
  label,
  required = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialLoadRef = useRef(false);

  const selectedIds = value.map(p => p.id);

  const loadProducts = useCallback(
    async (pageNum: number, searchTerm: string, append: boolean = true) => {
      if (loadingRef.current || !supplierId) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const result = await apiService.getProductsBySupplierPaginated(
          supplierId,
          {
            page: pageNum,
            limit: 25,
            search: searchTerm,
          }
        );

        setProducts(prev => (append ? [...prev, ...result.data] : result.data));
        setHasMore(pageNum < result.totalPages);
        setTotalProducts(result.total);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [supplierId]
  );

  // Initial load when component mounts
  useEffect(() => {
    if (!initialLoadRef.current && supplierId) {
      initialLoadRef.current = true;
      loadProducts(1, '', false);
    }
  }, [supplierId, loadProducts]);

  // Handle search changes
  useEffect(() => {
    if (!initialLoadRef.current) return; // Skip until initial load is done

    setPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(1, search, false);
  }, [search, loadProducts]);

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, search, true);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearch(newSearch);
    }, 300);
  };

  const handleChange = (selectedIds: string[]) => {
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));

    // Include previously selected products that might not be in current page
    const previouslySelected = value.filter(
      v => !products.some(p => p.id === v.id)
    );

    onChange([...selectedProducts, ...previouslySelected]);
  };

  return (
    <FormControl fullWidth required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedIds}
        onChange={e => handleChange(e.target.value as string[])}
        label={label}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
            onScroll: handleScroll as React.UIEventHandler<HTMLUListElement>,
          },
          autoFocus: false,
        }}
        renderValue={selected => {
          const selectedArray = selected as string[];
          const count = selectedArray.length;

          if (count === 0) {
            return (
              <Typography color="text.secondary">
                No products selected
              </Typography>
            );
          }

          if (count === 1) {
            const product =
              value.find(p => p.id === selectedArray[0]) ||
              products.find(p => p.id === selectedArray[0]);
            return (
              <Typography>
                {product?.name || 'Product'} ({product?.hsCode || 'N/A'})
              </Typography>
            );
          }

          // Show first product + count for multiple selections
          const firstProduct =
            value.find(p => p.id === selectedArray[0]) ||
            products.find(p => p.id === selectedArray[0]);

          return (
            <Typography>
              {firstProduct?.name || 'Product'}{' '}
              <Typography
                color="textSecondary"
                component="span"
                bgcolor="turquoise"
              >
                (+{count - 1} more)
              </Typography>
            </Typography>
          );
        }}
      >
        {/* Search field at the top of dropdown */}
        <Box
          sx={{
            p: 1,
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search products..."
            onChange={handleSearchChange}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {products.length === 0 && !loading && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {search ? 'No products found' : 'No products available'}
            </Typography>
          </MenuItem>
        )}

        {products.map(product => (
          <MenuItem key={product.id} value={product.id} sx={{ py: 0.5 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontSize: '0.875rem', lineHeight: 1.3 }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {product.internalProductCode &&
                  `Code: ${product.internalProductCode} • `}
                HS: {product.hsCode || 'N/A'}
                {product.category ? ` • ${product.category}` : ''}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && hasMore && products.length > 0 && (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Scroll down to load more...
            </Typography>
          </MenuItem>
        )}

        {!loading && !hasMore && products.length > 0 && (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Showing all {totalProducts} products
            </Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default VirtualizedProductSelect;
