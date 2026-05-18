import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  type SelectChangeEvent,
} from '@mui/material';

interface SurveyBooleanFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: boolean | null;
  onChange: (id: string, value: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const SurveyBooleanField: React.FC<SurveyBooleanFieldProps> = ({
  id,
  question,
  required,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}) => {
  // Initialize with false if value is null/undefined
  React.useEffect(() => {
    if (value === null || value === undefined) {
      onChange(id, false);
    }
  }, [id, value, onChange]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    if (newValue === 'yes') {
      onChange(id, true);
    } else if (newValue === 'no') {
      onChange(id, false);
    }
  };

  const selectValue =
    value === null || value === undefined ? 'no' : value ? 'yes' : 'no';

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <FormControl
        fullWidth
        required={required}
        error={error}
        disabled={disabled}
      >
        <InputLabel
          id={`${id}-label`}
          sx={{
            whiteSpace: 'normal',
            position: 'relative',
            transform: 'none',
            fontSize: '1rem',
            color: 'text.primary',
            mb: 1,
            '&.Mui-focused': {
              color: 'text.primary',
            },
          }}
          required={required}
        >
          {question}
        </InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={selectValue}
          onChange={handleChange}
          sx={{ mt: 1 }}
        >
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>
        {error && helperText ? (
          <FormHelperText>{helperText}</FormHelperText>
        ) : required ? (
          <FormHelperText>Required field</FormHelperText>
        ) : null}
      </FormControl>
    </Box>
  );
};

export default SurveyBooleanField;
