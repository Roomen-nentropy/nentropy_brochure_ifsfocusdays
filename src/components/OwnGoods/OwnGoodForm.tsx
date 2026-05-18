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
  IconButton,
} from '@mui/material';
import { Save, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CreateOwnGoodData,
  AvailableIngredient,
  OwnGood,
} from '../../types/own-goods.types';
import { ownGoodsService } from '../../services/ownGoodsService';

interface OwnGoodFormProps {
  ownGood?: OwnGood | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const OwnGoodForm: React.FC<OwnGoodFormProps> = ({
  ownGood,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation(['ownGoods', 'common']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<
    AvailableIngredient[]
  >([]);
  const isEditing = !!ownGood;

  const [formData, setFormData] = useState<CreateOwnGoodData>({
    name: ownGood?.name || '',
    category: ownGood?.category || '',
    country: ownGood?.country || '',
    hsCode: ownGood?.hsCode || '',
    unit: ownGood?.unit || 'kg',
    ingredients: [],
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await ownGoodsService.getAvailableIngredients();
      setAvailableIngredients(data);
    } catch (err) {
      console.error('Error loading ingredients:', err);
    }
  };

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          productId: '',
          quantityUsed: 0,
          unit: 'kg',
          percentageOfTotal: 0,
        },
      ],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
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
      if (!formData.name || !formData.hsCode) {
        setError(t('ownGoods:validation.requiredFields'));
        setLoading(false);
        return;
      }

      // Validate ingredients if provided
      if (!isEditing && formData.ingredients.length > 0) {
        for (let i = 0; i < formData.ingredients.length; i++) {
          const ing = formData.ingredients[i];
          if (!ing.productId) {
            setError(
              t('ownGoods:validation.ingredientProductRequired', {
                index: i + 1,
              })
            );
            setLoading(false);
            return;
          }
          if (
            ing.percentageOfTotal !== undefined &&
            (ing.percentageOfTotal < 0 || ing.percentageOfTotal > 100)
          ) {
            setError(
              t('ownGoods:validation.percentageRange', { index: i + 1 })
            );
            setLoading(false);
            return;
          }
        }
      }

      if (isEditing && ownGood) {
        // Update existing own good (only basic info, not batches/ingredients)
        await ownGoodsService.updateOwnGood(ownGood.id, {
          name: formData.name,
          category: formData.category,
          country: formData.country,
          hsCode: formData.hsCode,
          unit: formData.unit,
        });
      } else {
        // Create new own good recipe (ingredients are optional)
        await ownGoodsService.createOwnGood(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} own good:`,
        err
      );
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        `Failed to ${isEditing ? 'update' : 'create'} own good`;
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label={t('ownGoods:fields.productName')}
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t('ownGoods:fields.category')}
            value={formData.category}
            onChange={e =>
              setFormData(prev => ({ ...prev, category: e.target.value }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t('ownGoods:fields.country')}
            value={formData.country}
            onChange={e =>
              setFormData(prev => ({ ...prev, country: e.target.value }))
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            required
            label={t('ownGoods:fields.hsCode')}
            value={formData.hsCode}
            onChange={e =>
              setFormData(prev => ({ ...prev, hsCode: e.target.value }))
            }
          />
        </Grid>

        {!isEditing && (
          <>
            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2, mb: 1 }}
              >
                <Typography variant="h6">
                  {t('ownGoods:ingredients')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={handleAddIngredient}
                >
                  {t('ownGoods:addIngredient')}
                </Button>
              </Box>
            </Grid>

            {formData.ingredients.map((ingredient, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Box flex={1}>
                    <Autocomplete
                      fullWidth
                      options={availableIngredients}
                      getOptionLabel={option => option.name}
                      value={
                        availableIngredients.find(
                          ing => ing.id === ingredient.productId
                        ) || null
                      }
                      onChange={(_, value) => {
                        if (value) {
                          handleIngredientChange(index, 'productId', value.id);
                          handleIngredientChange(
                            index,
                            'productName',
                            value.name
                          );
                          // Reset batch selection when product changes
                          handleIngredientChange(index, 'batchId', '');
                        }
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            backgroundColor: theme =>
                              theme.palette.common.white,
                            '& .MuiAutocomplete-listbox': {
                              backgroundColor: theme =>
                                theme.palette.common.white,
                            },
                          },
                        },
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={t('ownGoods:fields.ingredient')}
                        />
                      )}
                    />
                  </Box>

                  <TextField
                    type="number"
                    label={t('ownGoods:fields.quantityUsed')}
                    value={ingredient.quantityUsed}
                    onChange={e =>
                      handleIngredientChange(
                        index,
                        'quantityUsed',
                        parseFloat(e.target.value)
                      )
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 150 }}
                  />
                  <TextField
                    label={t('ownGoods:fields.percentage')}
                    type="number"
                    value={ingredient.percentageOfTotal || ''}
                    onChange={e =>
                      handleIngredientChange(
                        index,
                        'percentageOfTotal',
                        parseFloat(e.target.value)
                      )
                    }
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    sx={{ width: 120 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveIngredient(index)}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <X size={20} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </>
        )}
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
          {isEditing ? t('common:actions.saveChanges') : t('common:create')}
        </Button>
      </Box>
    </Box>
  );
};

export default OwnGoodForm;
