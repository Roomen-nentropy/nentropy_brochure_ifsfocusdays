import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../services';

interface RecipeIngredient {
  productId: string;
  percentageOfRecipe: number;
  productName?: string;
}

interface BatchIngredient {
  recipeIngredientId: string;
  productBatchId: string;
  productBatchNumber?: string;
}

export const OwnGoodsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Recipe form state
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([{ productId: '', percentageOfRecipe: 0 }]);

  // Batch form state
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchIngredients, setBatchIngredients] = useState<BatchIngredient[]>(
    []
  );

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<'recipes' | 'batches'>('recipes');

  // Queries
  const { data: recipes } = useQuery({
    queryKey: ['own-goods'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/own-goods`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const { data: batches } = useQuery({
    queryKey: ['own-good-batches'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/own-goods/batches`,
        { withCredentials: true }
      );
      return response.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-recipes'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  // Mutations
  const createRecipeMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      ingredients: RecipeIngredient[];
    }) => {
      const response = await axios.post(`${API_BASE_URL}/api/own-goods`, data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-goods'] });
      setRecipeDialogOpen(false);
      resetRecipeForm();
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: {
      ownGoodId: string;
      batchNumber: string;
      quantityProduced: number;
      ingredients: BatchIngredient[];
    }) => {
      const response = await axios.post(
        `${API_BASE_URL}/api/own-goods/${data.ownGoodId}/batches`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-good-batches'] });
      setBatchDialogOpen(false);
      resetBatchForm();
    },
  });

  const uploadCsvMutation = useMutation({
    mutationFn: async ({
      file,
      type,
    }: {
      file: File;
      type: 'recipes' | 'batches';
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint =
        type === 'recipes'
          ? '/api/own-goods/import-csv'
          : '/api/own-goods/import-batches';

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['own-goods'] });
      queryClient.invalidateQueries({ queryKey: ['own-good-batches'] });
      setCsvDialogOpen(false);
      setCsvFile(null);
      alert(
        `Import complete: ${data.imported} successful, ${data.failed} failed, ${data.skipped} skipped`
      );
    },
  });

  const resetRecipeForm = () => {
    setRecipeName('');
    setRecipeDescription('');
    setRecipeIngredients([{ productId: '', percentageOfRecipe: 0 }]);
  };

  const resetBatchForm = () => {
    setSelectedRecipeId('');
    setBatchNumber('');
    setBatchQuantity('');
    setBatchIngredients([]);
  };

  const addRecipeIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { productId: '', percentageOfRecipe: 0 },
    ]);
  };

  const removeRecipeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const updateRecipeIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const totalPercentage = recipeIngredients.reduce(
    (sum, ing) => sum + (ing.percentageOfRecipe || 0),
    0
  );

  const handleCreateRecipe = () => {
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert('Total percentage must equal 100%');
      return;
    }

    createRecipeMutation.mutate({
      name: recipeName,
      description: recipeDescription,
      ingredients: recipeIngredients.map(ing => ({
        productId: ing.productId,
        percentageOfRecipe: ing.percentageOfRecipe,
      })),
    });
  };

  const handleCreateBatch = () => {
    createBatchMutation.mutate({
      ownGoodId: selectedRecipeId,
      batchNumber,
      quantityProduced: parseFloat(batchQuantity),
      ingredients: batchIngredients,
    });
  };

  const handleCsvUpload = () => {
    if (!csvFile) return;
    uploadCsvMutation.mutate({ file: csvFile, type: csvType });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Own Goods Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setCsvDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setRecipeDialogOpen(true)}
          >
            New Recipe
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={`Recipes (${recipes?.length || 0})`} />
          <Tab label={`Batches (${batches?.length || 0})`} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Ingredients</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes?.map(
                    (recipe: {
                      id: string;
                      name: string;
                      description?: string;
                      recipeIngredients?: unknown[];
                    }) => (
                      <TableRow key={recipe.id}>
                        <TableCell>{recipe.name}</TableCell>
                        <TableCell>{recipe.description || '-'}</TableCell>
                        <TableCell>
                          {recipe.recipeIngredients?.length || 0} ingredients
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedRecipeId(recipe.id);
                              setBatchDialogOpen(true);
                            }}
                          >
                            Create Batch
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Own Good</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Production Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches?.map(
                    (batch: {
                      id: string;
                      batchNumber: string;
                      ownGood?: { name: string };
                      quantityProduced: number;
                      productionDate: string;
                      ddsNumber?: string;
                    }) => (
                      <TableRow key={batch.id}>
                        <TableCell>{batch.batchNumber}</TableCell>
                        <TableCell>{batch.ownGood?.name || 'N/A'}</TableCell>
                        <TableCell>{batch.quantityProduced}</TableCell>
                        <TableCell>
                          {new Date(batch.productionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              batch.ddsNumber ? 'DDS Submitted' : 'Pending'
                            }
                            color={batch.ddsNumber ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Recipe Dialog */}
      <Dialog
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Own Good Recipe</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipe Name"
            value={recipeName}
            onChange={e => setRecipeName(e.target.value)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            label="Description"
            value={recipeDescription}
            onChange={e => setRecipeDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Ingredients
          </Typography>

          {recipeIngredients.map((ingredient, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
            >
              <TextField
                select
                label="Product"
                value={ingredient.productId}
                onChange={e =>
                  updateRecipeIngredient(index, 'productId', e.target.value)
                }
                SelectProps={{ native: true }}
                sx={{ flex: 2 }}
              >
                <option value="">Select product...</option>
                {products?.map((product: { id: string; name: string }) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Percentage"
                type="number"
                value={ingredient.percentageOfRecipe}
                onChange={e =>
                  updateRecipeIngredient(
                    index,
                    'percentageOfRecipe',
                    parseFloat(e.target.value)
                  )
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={() => removeRecipeIngredient(index)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addRecipeIngredient}
            sx={{ mb: 2 }}
          >
            Add Ingredient
          </Button>

          {Math.abs(totalPercentage - 100) > 0.01 && (
            <Alert severity="warning">
              Total percentage: {totalPercentage.toFixed(2)}% (must equal 100%)
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateRecipe}
            variant="contained"
            disabled={Math.abs(totalPercentage - 100) > 0.01 || !recipeName}
          >
            Create Recipe
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Dialog */}
      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Own Good Batch</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Recipe"
            value={selectedRecipeId}
            onChange={e => setSelectedRecipeId(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            <option value="">Select recipe...</option>
            {recipes?.map((recipe: { id: string; name: string }) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </TextField>

          <TextField
            label="Batch Number"
            value={batchNumber}
            onChange={e => setBatchNumber(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Quantity Produced"
            type="number"
            value={batchQuantity}
            onChange={e => setBatchQuantity(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Alert severity="info" sx={{ mb: 2 }}>
            After creating the batch, you'll need to map specific product batch
            numbers to each recipe ingredient.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateBatch}
            variant="contained"
            disabled={!selectedRecipeId || !batchNumber || !batchQuantity}
          >
            Create Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import from CSV</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Import Type"
            value={csvType}
            onChange={e => setCsvType(e.target.value as 'recipes' | 'batches')}
            SelectProps={{ native: true }}
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            <option value="recipes">Recipes</option>
            <option value="batches">Batches</option>
          </TextField>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            {csvFile ? csvFile.name : 'Choose CSV File'}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={e => setCsvFile(e.target.files?.[0] || null)}
            />
          </Button>

          <Alert severity="info">
            {csvType === 'recipes'
              ? 'CSV should have columns: name, description, ingredients (JSON array)'
              : 'CSV should have columns: ownGoodId, batchNumber, quantityProduced, ingredients (JSON array)'}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCsvUpload}
            variant="contained"
            disabled={!csvFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
