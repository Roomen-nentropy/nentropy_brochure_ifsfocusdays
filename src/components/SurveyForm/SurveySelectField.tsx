import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface SurveySelectFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: string | string[];
  onChange: (id: string, value: string | string[]) => void;
  options: string[];
  multiple?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const SurveySelectField: React.FC<SurveySelectFieldProps> = ({
  id,
  question,
  required,
  value,
  onChange,
  options,
  multiple = false,
  disabled = false,
  error = false,
  helperText,
}) => {
  // Use proper MUI event type for Select
  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const newValue = event.target.value;
    onChange(id, newValue);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {question}
        {required && <span>*</span>}
      </Typography>
      <FormControl fullWidth error={error} disabled={disabled}>
        <InputLabel id={`select-label-${id}`}>{question}</InputLabel>
        <Select
          labelId={`select-label-${id}`}
          multiple={multiple}
          value={value}
          onChange={handleChange}
          input={<OutlinedInput label={question} />}
          renderValue={selected => {
            if (multiple) {
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map(val => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              );
            }
            return selected as string;
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option}
              value={option}
              sx={{ whiteSpace: 'normal', py: 1.5 }}
            >
              {multiple && (
                <Checkbox checked={(value as string[]).indexOf(option) > -1} />
              )}
              <ListItemText
                primary={option}
                primaryTypographyProps={{
                  style: { whiteSpace: 'normal' },
                }}
              />
            </MenuItem>
          ))}
        </Select>
        {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default SurveySelectField;
