import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Autocomplete,
  Paper,
  Chip,
} from '@mui/material';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AvailableIngredient } from '../../types/own-goods.types';
import { ownGoodsService } from '../../services/ownGoodsService';

interface OwnGoodBatchFormProps {
  ownGoodId: string;
  ownGoodName: string;
  recipeIngredients: Array<{
    id: string;
    productId: string;
    percentage: number;
    product: {
      id: string;
      name: string;
      internalProductCode?: string;
      supplierProductCode?: string;
    };
  }>;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BatchIngredientInput {
  recipeIngredientId: string;
  productId: string;
  productName: string;
  percentage: number;
  batchNumber: string;
  quantity: number;
}

const OwnGoodBatchForm: React.FC<OwnGoodBatchFormProps> = ({
  ownGoodId,
  ownGoodName,
  recipeIngredients,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation(['ownGoods', 'common']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<
    AvailableIngredient[]
  >([]);

  const [formData, setFormData] = useState({
    batchNumber: '',
    productionDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    unit: 'kg',
    ingredients: [] as BatchIngredientInput[],
  });

  useEffect(() => {
    loadIngredients();

    // Initialize ingredients from recipe
    if (recipeIngredients && recipeIngredients.length > 0) {
      const initialIngredients = recipeIngredients.map(ri => ({
        recipeIngredientId: ri.id,
        productId: ri.productId,
        productName: ri.product.name,
        percentage: ri.percentage,
        batchNumber: '',
        quantity: 0,
      }));
      setFormData(prev => ({ ...prev, ingredients: initialIngredients }));
    }
  }, [recipeIngredients]);

  const loadIngredients = async () => {
    try {
      const data = await ownGoodsService.getAvailableIngredients();
      setAvailableIngredients(data);
    } catch (err) {
      console.error('Error loading ingredients:', err);
    }
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.batchNumber ||
        !formData.productionDate ||
        !formData.quantity
      ) {
        setError(t('ownGoods:validation.batchRequiredFields'));
        setLoading(false);
        return;
      }

      if (formData.ingredients.length === 0) {
        setError(t('ownGoods:validation.ingredientsRequired'));
        setLoading(false);
        return;
      }

      // Validate ingredients
      for (let i = 0; i < formData.ingredients.length; i++) {
        const ing = formData.ingredients[i];
        if (!ing.productId || !ing.batchNumber || !ing.quantity) {
          setError(
            t('ownGoods:validation.ingredientDetailsRequired', { index: i + 1 })
          );
          setLoading(false);
          return;
        }
      }

      await ownGoodsService.createOwnGoodBatch(ownGoodId, {
        batchNumber: formData.batchNumber,
        productionDate: formData.productionDate,
        quantity: formData.quantity,
        unit: formData.unit,
        ingredients: formData.ingredients,
      });

      onSuccess();
    } catch (err) {
      console.error('Error creating own good batch:', err);
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError?.response?.data?.error ||
        axiosError?.message ||
        'Failed to create batch';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('ownGoods:batchCreationInfo', { product: ownGoodName })}
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label={t('ownGoods:fields.batchNumber')}
            value={formData.batchNumber}
            onChange={e =>
              setFormData(prev => ({ ...prev, batchNumber: e.target.value }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            type="date"
            label={t('ownGoods:fields.productionDate')}
            value={formData.productionDate}
            onChange={e =>
              setFormData(prev => ({ ...prev, productionDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            type="number"
            label={t('ownGoods:fields.quantityProduced')}
            value={formData.quantity || ''}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                quantity: parseFloat(e.target.value),
              }))
            }
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label={t('ownGoods:fields.unit')}
            value={formData.unit}
            onChange={e =>
              setFormData(prev => ({ ...prev, unit: e.target.value }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="h6">
              {t('ownGoods:ingredientBatches')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('ownGoods:selectBatchesForIngredients')}
            </Typography>
          </Box>
        </Grid>

        {formData.ingredients.map((ingredient, index) => {
          const ingredientProduct = availableIngredients.find(
            ing => ing.id === ingredient.productId
          );

          return (
            <Grid size={{ xs: 12 }} key={ingredient.recipeIngredientId}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      {ingredient.productName}
                      {ingredient.percentage && (
                        <Chip
                          label={`${ingredient.percentage}% of recipe`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>

                    {ingredientProduct &&
                    ingredientProduct.batches.length > 0 ? (
                      <Autocomplete
                        fullWidth
                        options={ingredientProduct.batches}
                        getOptionLabel={option =>
                          `${option.batchNumber} (${option.quantity} ${option.unit})${option.ddsNumber ? ` - DDS: ${option.ddsNumber}` : ''}`
                        }
                        value={
                          ingredientProduct.batches.find(
                            b => b.batchNumber === ingredient.batchNumber
                          ) || null
                        }
                        onChange={(_, value) => {
                          if (value) {
                            handleIngredientChange(
                              index,
                              'batchNumber',
                              value.batchNumber
                            );
                          }
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t('ownGoods:fields.batch')}
                            required
                            sx={{ mt: 1 }}
                          />
                        )}
                      />
                    ) : (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        No batches available for this ingredient. Please add
                        batches in the Products section.
                      </Alert>
                    )}
                  </Box>

                  <TextField
                    type="number"
                    label={t('ownGoods:fields.quantityUsed')}
                    value={ingredient.quantity || ''}
                    onChange={e =>
                      handleIngredientChange(
                        index,
                        'quantity',
                        parseFloat(e.target.value)
                      )
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 150 }}
                    required
                  />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box display="flex" gap={2} mt={3} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={loading}>
          {t('common:cancel')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          startIcon={
            loading ? <CircularProgress size={16} /> : <Save size={16} />
          }
          disabled={loading}
        >
          {t('ownGoods:createBatch')}
        </Button>
      </Box>
    </Box>
  );
};

export default OwnGoodBatchForm;
