import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface SurveyDateFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: string | null;
  onChange: (id: string, value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const SurveyDateField: React.FC<SurveyDateFieldProps> = ({
  id,
  question,
  required,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleChange = (date: Dayjs | null) => {
    if (date && date.isValid()) {
      onChange(id, date.format('YYYY-MM-DD'));
    } else {
      onChange(id, '');
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {question}
        {required && <span>*</span>}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value) : null}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={handleChange as any}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              error,
              helperText: error ? helperText : '',
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default SurveyDateField;
