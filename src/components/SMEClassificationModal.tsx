import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../services';

interface SMEClassificationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface SMEFormData {
  employeeCount: string;
  annualTurnoverEur: string;
  balanceSheetTotalEur: string;
}

export const SMEClassificationModal: React.FC<SMEClassificationModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [formData, setFormData] = useState<SMEFormData>({
    employeeCount: '',
    annualTurnoverEur: '',
    balanceSheetTotalEur: '',
  });

  const [errors, setErrors] = useState<Partial<SMEFormData>>({});

  const saveSMEClassificationMutation = useMutation({
    mutationFn: async (data: SMEFormData) => {
      const response = await axios.put(
        `${API_BASE_URL}/api/settings/sme-classification`,
        {
          employeeCount: parseInt(data.employeeCount),
          annualTurnoverEur: parseFloat(data.annualTurnoverEur),
          balanceSheetTotalEur: parseFloat(data.balanceSheetTotalEur),
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: data => {
      // Show SME status to user
      const isSME = data.isSME;
      alert(
        isSME
          ? 'Your company qualifies as an SME. You can use simplified DDS tracking.'
          : 'Your company does not qualify as an SME. Full geolocation tracking is required.'
      );
      onComplete();
      onClose();
    },
  });

  const handleChange =
    (field: keyof SMEFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear error when user types
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<SMEFormData> = {};

    if (!formData.employeeCount || parseInt(formData.employeeCount) < 0) {
      newErrors.employeeCount = 'Please enter a valid employee count';
    }

    if (!formData.annualTurnoverEur && !formData.balanceSheetTotalEur) {
      newErrors.annualTurnoverEur =
        'Please provide either annual turnover or balance sheet total';
      newErrors.balanceSheetTotalEur =
        'Please provide either annual turnover or balance sheet total';
    }

    if (
      formData.annualTurnoverEur &&
      parseFloat(formData.annualTurnoverEur) < 0
    ) {
      newErrors.annualTurnoverEur = 'Please enter a valid amount';
    }

    if (
      formData.balanceSheetTotalEur &&
      parseFloat(formData.balanceSheetTotalEur) < 0
    ) {
      newErrors.balanceSheetTotalEur = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      saveSMEClassificationMutation.mutate(formData);
    }
  };

  const calculatePreviewSME = (): boolean | null => {
    const employees = parseInt(formData.employeeCount);
    const turnover = parseFloat(formData.annualTurnoverEur);
    const balanceSheet = parseFloat(formData.balanceSheetTotalEur);

    if (isNaN(employees) || employees < 0) return null;
    if (
      (isNaN(turnover) || turnover < 0) &&
      (isNaN(balanceSheet) || balanceSheet < 0)
    ) {
      return null;
    }

    // SME criteria: employees < 250 AND (turnover ≤ €50M OR balance sheet ≤ €43M)
    return (
      employees < 250 && (turnover <= 50000000 || balanceSheet <= 43000000)
    );
  };

  const previewSME = calculatePreviewSME();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>SME Classification</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To determine your DDS tracking requirements, we need to classify
            your company size based on EU criteria.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>SME Criteria (EU Definition):</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Less than 250 employees, AND
              <br />• Annual turnover ≤ €50 million OR Balance sheet ≤ €43
              million
            </Typography>
          </Alert>

          <TextField
            fullWidth
            label="Number of Employees"
            type="number"
            value={formData.employeeCount}
            onChange={handleChange('employeeCount')}
            error={!!errors.employeeCount}
            helperText={errors.employeeCount}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Annual Turnover"
            type="number"
            value={formData.annualTurnoverEur}
            onChange={handleChange('annualTurnoverEur')}
            error={!!errors.annualTurnoverEur}
            helperText={
              errors.annualTurnoverEur ||
              'Optional if balance sheet is provided'
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Balance Sheet Total"
            type="number"
            value={formData.balanceSheetTotalEur}
            onChange={handleChange('balanceSheetTotalEur')}
            error={!!errors.balanceSheetTotalEur}
            helperText={
              errors.balanceSheetTotalEur ||
              'Optional if annual turnover is provided'
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {previewSME !== null && (
            <Alert severity={previewSME ? 'success' : 'warning'} sx={{ mt: 2 }}>
              {previewSME ? (
                <>
                  <strong>SME Status: YES</strong>
                  <br />
                  You qualify for simplified DDS tracking (DDS number only).
                </>
              ) : (
                <>
                  <strong>SME Status: NO</strong>
                  <br />
                  You will need to provide full geolocation tracking for DDS
                  compliance.
                </>
              )}
            </Alert>
          )}

          {saveSMEClassificationMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to save SME classification. Please try again.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saveSMEClassificationMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saveSMEClassificationMutation.isPending}
        >
          {saveSMEClassificationMutation.isPending
            ? 'Saving...'
            : 'Save & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
