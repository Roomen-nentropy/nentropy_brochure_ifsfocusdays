import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../services';

interface DDSSurveyFormProps {
  surveyId: string;
  supplierId: string;
  mode: 'FULL_GEOLOCATION' | 'DDS_NUMBER_ONLY';
  onComplete?: () => void;
}

interface ProductBatch {
  batchNumber: string;
  kilograms: number;
  expirationDate?: string;
  providedDDSNumber?: string;
  geolocationFiles?: File[];
  sourceDocuments?: File[];
  geolocationFileUrls?: string[]; // S3 URLs after upload
  sourceDocumentUrls?: string[]; // S3 URLs after upload
}

interface Product {
  productName: string;
  hsCode: string;
  productId?: string;
  existingDDSNumber?: string;
  batches: ProductBatch[];
}

export const DDSSurveyForm: React.FC<DDSSurveyFormProps> = ({
  surveyId,
  supplierId,
  mode,
  onComplete,
}) => {
  const [products, setProducts] = useState<Product[]>([
    {
      productName: '',
      hsCode: '',
      batches: [
        {
          batchNumber: '',
          kilograms: 0,
          expirationDate: '',
          geolocationFiles: mode === 'FULL_GEOLOCATION' ? [] : undefined,
          sourceDocuments: mode === 'FULL_GEOLOCATION' ? [] : undefined,
        },
      ],
    },
  ]);

  const { data: prefillData } = useQuery({
    queryKey: ['dds-prefill', supplierId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/unified-dds-surveys/prefill/${supplierId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!supplierId,
  });

  const completeSurveyMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/unified-dds-surveys/${surveyId}/complete`,
        {
          products,
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      onComplete?.();
    },
  });

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productName: '',
        hsCode: '',
        batches: [
          {
            batchNumber: '',
            kilograms: 0,
            expirationDate: '',
            geolocationFiles: mode === 'FULL_GEOLOCATION' ? [] : undefined,
            sourceDocuments: mode === 'FULL_GEOLOCATION' ? [] : undefined,
          },
        ],
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const addBatch = (productIndex: number) => {
    const updated = [...products];
    updated[productIndex].batches.push({
      batchNumber: '',
      kilograms: 0,
      expirationDate: '',
      geolocationFiles: mode === 'FULL_GEOLOCATION' ? [] : undefined,
      sourceDocuments: mode === 'FULL_GEOLOCATION' ? [] : undefined,
    });
    setProducts(updated);
  };

  const removeBatch = (productIndex: number, batchIndex: number) => {
    const updated = [...products];
    updated[productIndex].batches = updated[productIndex].batches.filter(
      (_, i) => i !== batchIndex
    );
    setProducts(updated);
  };

  const updateBatch = (
    productIndex: number,
    batchIndex: number,
    field: keyof ProductBatch,
    value: string | number | File[]
  ) => {
    const updated = [...products];
    updated[productIndex].batches[batchIndex] = {
      ...updated[productIndex].batches[batchIndex],
      [field]: value,
    };
    setProducts(updated);
  };

  const handleSubmit = async () => {
    // Validate
    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    for (const product of products) {
      if (!product.productName || !product.hsCode) {
        alert('Please fill in product name and HS code for all products');
        return;
      }

      if (mode === 'FULL_GEOLOCATION') {
        for (const batch of product.batches) {
          if (!batch.geolocationFiles || batch.geolocationFiles.length === 0) {
            alert(
              'Please upload at least one geolocation file (GeoJSON/KML) for each batch'
            );
            return;
          }
          if (!batch.sourceDocuments || batch.sourceDocuments.length === 0) {
            alert('Please upload at least one source document for each batch');
            return;
          }
        }
      } else {
        for (const batch of product.batches) {
          if (!batch.providedDDSNumber) {
            alert('Please provide DDS number for all batches');
            return;
          }
        }
      }
    }

    // Upload all files to S3 first
    const updatedProducts = [...products];

    for (let i = 0; i < updatedProducts.length; i++) {
      for (let j = 0; j < updatedProducts[i].batches.length; j++) {
        const batch = updatedProducts[i].batches[j];

        // Upload geolocation files
        if (batch.geolocationFiles && batch.geolocationFiles.length > 0) {
          const geolocationUrls: string[] = [];
          for (const file of batch.geolocationFiles) {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
              `${API_BASE_URL}/api/unified-dds-surveys/${surveyId}/upload`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
              }
            );
            geolocationUrls.push(response.data.s3Url);
          }
          batch.geolocationFileUrls = geolocationUrls;
        }

        // Upload source documents
        if (batch.sourceDocuments && batch.sourceDocuments.length > 0) {
          const sourceDocUrls: string[] = [];
          for (const file of batch.sourceDocuments) {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
              `${API_BASE_URL}/api/unified-dds-surveys/${surveyId}/upload`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
              }
            );
            sourceDocUrls.push(response.data.s3Url);
          }
          batch.sourceDocumentUrls = sourceDocUrls;
        }

        // Remove File objects before sending to backend (can't serialize)
        delete batch.geolocationFiles;
        delete batch.sourceDocuments;
      }
    }

    // Now submit with S3 URLs
    completeSurveyMutation.mutate();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            DDS Survey
          </Typography>
          <Chip
            label={
              mode === 'FULL_GEOLOCATION'
                ? 'Full Geolocation Mode'
                : 'DDS Number Only Mode'
            }
            color={mode === 'FULL_GEOLOCATION' ? 'primary' : 'secondary'}
          />
        </Box>

        {prefillData &&
          prefillData.geolocations?.length > 0 &&
          mode === 'FULL_GEOLOCATION' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              We found {prefillData.geolocations.length} verified geolocation(s)
              from previous surveys. You can reuse these or add new ones.
            </Alert>
          )}

        {products.map((product, productIndex) => (
          <Paper key={productIndex} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="h6">Product {productIndex + 1}</Typography>
              {products.length > 1 && (
                <IconButton
                  onClick={() => removeProduct(productIndex)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={product.productName}
                  onChange={e =>
                    updateProduct(productIndex, 'productName', e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="HS Code"
                  value={product.hsCode}
                  onChange={e =>
                    updateProduct(productIndex, 'hsCode', e.target.value)
                  }
                  required
                />
              </Grid>

              {mode === 'DDS_NUMBER_ONLY' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Existing DDS Number (Optional)"
                    value={product.existingDDSNumber || ''}
                    onChange={e =>
                      updateProduct(
                        productIndex,
                        'existingDDSNumber',
                        e.target.value
                      )
                    }
                    helperText="If this product already has a DDS number"
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Batches
            </Typography>

            {product.batches.map((batch, batchIndex) => (
              <Paper
                key={batchIndex}
                sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2">
                    Batch {batchIndex + 1}
                  </Typography>
                  {product.batches.length > 1 && (
                    <IconButton
                      onClick={() => removeBatch(productIndex, batchIndex)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Batch Number"
                      value={batch.batchNumber}
                      onChange={e =>
                        updateBatch(
                          productIndex,
                          batchIndex,
                          'batchNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity (kg)"
                      value={batch.kilograms}
                      onChange={e =>
                        updateBatch(
                          productIndex,
                          batchIndex,
                          'kilograms',
                          parseFloat(e.target.value)
                        )
                      }
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiration Date (Optional)"
                      value={batch.expirationDate || ''}
                      onChange={e =>
                        updateBatch(
                          productIndex,
                          batchIndex,
                          'expirationDate',
                          e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {mode === 'FULL_GEOLOCATION' && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ mt: 1 }}
                        >
                          Plantation Geolocation Files *
                        </Typography>
                        <Button variant="outlined" component="label" fullWidth>
                          Upload GeoJSON or KML Files
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".geojson,.kml,.json"
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              updateBatch(
                                productIndex,
                                batchIndex,
                                'geolocationFiles',
                                files
                              );
                            }}
                          />
                        </Button>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Upload files containing plantation coordinates
                          (GeoJSON or KML format)
                        </Typography>
                        {batch.geolocationFiles &&
                          batch.geolocationFiles.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {batch.geolocationFiles.map((file, idx) => (
                                <Chip
                                  key={idx}
                                  label={file.name}
                                  size="small"
                                  sx={{ mr: 1, mt: 1 }}
                                  onDelete={() => {
                                    const updated = [...products];
                                    updated[productIndex].batches[
                                      batchIndex
                                    ].geolocationFiles = updated[
                                      productIndex
                                    ].batches[
                                      batchIndex
                                    ].geolocationFiles?.filter(
                                      (_, i) => i !== idx
                                    );
                                    setProducts(updated);
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Source Documents *
                        </Typography>
                        <Button variant="outlined" component="label" fullWidth>
                          Upload Legal Documents
                          <input
                            type="file"
                            hidden
                            multiple
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              updateBatch(
                                productIndex,
                                batchIndex,
                                'sourceDocuments',
                                files
                              );
                            }}
                          />
                        </Button>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Upload harvest permits, mill receipts, land ownership
                          documents, etc.
                        </Typography>
                        {batch.sourceDocuments &&
                          batch.sourceDocuments.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {batch.sourceDocuments.map((file, idx) => (
                                <Chip
                                  key={idx}
                                  label={file.name}
                                  size="small"
                                  sx={{ mr: 1, mt: 1 }}
                                  onDelete={() => {
                                    const updated = [...products];
                                    updated[productIndex].batches[
                                      batchIndex
                                    ].sourceDocuments = updated[
                                      productIndex
                                    ].batches[
                                      batchIndex
                                    ].sourceDocuments?.filter(
                                      (_, i) => i !== idx
                                    );
                                    setProducts(updated);
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                      </Grid>
                    </>
                  )}

                  {mode === 'DDS_NUMBER_ONLY' && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="DDS Number"
                        value={batch.providedDDSNumber || ''}
                        onChange={e =>
                          updateBatch(
                            productIndex,
                            batchIndex,
                            'providedDDSNumber',
                            e.target.value
                          )
                        }
                        required
                        helperText="DDS number provided by your supplier"
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => addBatch(productIndex)}
              variant="outlined"
              size="small"
            >
              Add Batch
            </Button>
          </Paper>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addProduct}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Add Product
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined">Save Draft</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={completeSurveyMutation.isPending}
          >
            {completeSurveyMutation.isPending
              ? 'Submitting...'
              : 'Complete Survey'}
          </Button>
        </Box>

        {completeSurveyMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to submit survey. Please check all fields and try again.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};
