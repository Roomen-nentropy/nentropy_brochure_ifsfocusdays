import React from 'react';
import { TextField, Typography, Box } from '@mui/material';

interface SurveyTextFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: string | number;
  onChange: (id: string, value: string | number) => void;
  type?: 'text' | 'number' | 'email';
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const SurveyTextField: React.FC<SurveyTextFieldProps> = ({
  id,
  question,
  required,
  value = '',
  onChange,
  type = 'text',
  validation,
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      type === 'number'
        ? e.target.value === ''
          ? ''
          : Number(e.target.value)
        : e.target.value;
    onChange(id, newValue);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {question}
        {required && <span>*</span>}
      </Typography>
      <TextField
        fullWidth
        value={value}
        onChange={handleChange}
        type={type}
        disabled={disabled}
        error={error}
        helperText={error ? helperText : ''}
        inputProps={{
          min: type === 'number' ? validation?.min : undefined,
          max: type === 'number' ? validation?.max : undefined,
          pattern: validation?.pattern,
        }}
      />
    </Box>
  );
};

export default SurveyTextField;
