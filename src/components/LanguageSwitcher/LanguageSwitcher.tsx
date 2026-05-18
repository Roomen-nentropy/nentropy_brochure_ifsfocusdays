import React from 'react';
import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation('settings');

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    i18n.changeLanguage(event.target.value);
    // Language persistence is now handled automatically by i18n listener
  };

  const languages = [
    { code: 'en', name: t('languages.en'), flag: '🇺🇸' },
    { code: 'bg', name: t('languages.bg'), flag: '🇧🇬' },
  ];

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        displayEmpty
        renderValue={selected => {
          const selectedLang = languages.find(lang => lang.code === selected);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Languages size={16} />
              <Typography variant="body2">
                {selectedLang?.flag} {selectedLang?.name}
              </Typography>
            </Box>
          );
        }}
      >
        {languages.map(language => (
          <MenuItem key={language.code} value={language.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span">{language.flag}</Typography>
              <Typography variant="body2">{language.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
