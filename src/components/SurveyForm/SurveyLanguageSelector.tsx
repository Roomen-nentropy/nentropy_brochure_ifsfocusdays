import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { Languages } from 'lucide-react';

export type SupportedSurveyLanguage =
  | 'en'
  | 'zh'
  | 'es'
  | 'tr'
  | 'pt'
  | 'fr'
  | 'id'
  | 'vi';

const LANGUAGE_LABELS: Record<SupportedSurveyLanguage, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  tr: 'Türkçe',
  pt: 'Português',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
};

interface SurveyLanguageSelectorProps {
  currentLanguage: string;
  supportedLanguages: string[];
  onLanguageChange: (language: string) => void;
}

export const SurveyLanguageSelector: React.FC<SurveyLanguageSelectorProps> = ({
  currentLanguage,
  supportedLanguages,
  onLanguageChange,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onLanguageChange(event.target.value);
  };

  if (supportedLanguages.length <= 1) {
    return null; // Don't show selector if only one language is available
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Languages size={20} />
      <Typography variant="body2" sx={{ mr: 1 }}>
        Language:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select value={currentLanguage} onChange={handleChange}>
          {supportedLanguages.map(lang => (
            <MenuItem key={lang} value={lang}>
              {LANGUAGE_LABELS[lang as SupportedSurveyLanguage] ||
                lang.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SurveyLanguageSelector;
