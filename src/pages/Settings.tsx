import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  Card,
  CardContent,
  Stack,
  Skeleton,
  Snackbar,
  Divider,
  Fade,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Check,
  Building2,
  Mail,
  Lock,
  Globe,
  Settings as SettingsIcon,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import type { CompanySettings } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import BusinessTypeSelector from '../components/BusinessTypeSelector/BusinessTypeSelector';
import type { BusinessType } from '../components/BusinessTypeSelector/BusinessTypeSelector';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import type { ParsedAddress } from '../components/AddressAutocomplete';

const AUTOSAVE_DELAY = 1500; // ms

/** Reusable section header inside a card */
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/** Inline save status indicator */
const SaveIndicator: React.FC<{
  status: 'idle' | 'saving' | 'saved' | 'error';
}> = ({ status }) => {
  const theme = useTheme();
  const { t } = useTranslation('settings');

  if (status === 'idle') return null;

  const config = {
    saving: {
      icon: (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      ),
      text: t('messages.saving'),
      color: theme.palette.text.secondary,
    },
    saved: {
      icon: <Check size={14} />,
      text: t('messages.settingsSaved'),
      color: theme.palette.success.main,
    },
    error: {
      icon: null,
      text: t('messages.loadingError'),
      color: theme.palette.error.main,
    },
  }[status];

  return (
    <Fade in>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: config.color,
          typography: 'caption',
          fontWeight: 500,
        }}
      >
        {config.icon}
        {config.text}
      </Box>
    </Fade>
  );
};

const Settings: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['settings', 'common', 'subscription']);
  const { settings, updateSettings, isLoading, error } = useSettings();
  const [formData, setFormData] = useState<Partial<CompanySettings>>(
    settings || {}
  );
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Track whether initial settings have loaded (skip autosave on first hydration)
  const initialised = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestFormData = useRef(formData);

  // Keep ref in sync
  latestFormData.current = formData;

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      // Mark initialised after first hydration so we don't autosave the initial load
      initialised.current = true;
    }
  }, [settings]);

  // Autosave function
  const performSave = useCallback(async () => {
    try {
      setSaveStatus('saving');
      await updateSettings(latestFormData.current);
      setSaveStatus('saved');
      // Clear "saved" indicator after 3s
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Autosave failed:', err);
      setSaveStatus('error');
      setSnackbar({
        open: true,
        message: t('settings:messages.loadingError'),
        severity: 'error',
      });
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  }, [updateSettings, t]);

  // Schedule autosave whenever formData changes
  const scheduleSave = useCallback(() => {
    if (!initialised.current) return;
    // Clear any existing timers
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaveStatus('idle');
    debounceTimer.current = setTimeout(performSave, AUTOSAVE_DELAY);
  }, [performSave]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const handleInputChange = (
    field: keyof CompanySettings,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    scheduleSave();
  };

  const handleNestedInputChange = (
    parent: keyof CompanySettings,
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as Record<string, string>),
        [field]: value,
      },
    }));
    scheduleSave();
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 880, mx: 'auto' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent>
                <Skeleton
                  variant="text"
                  width={180}
                  height={28}
                  sx={{ mb: 2 }}
                />
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto' }}>
      {/* Spinner keyframe for Loader2 icon */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <SettingsIcon size={22} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {t('settings:title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('settings:subtitle')}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SaveIndicator status={saveStatus} />
          <LanguageSwitcher />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {/* Company & Address — combined into one card */}
        <Card sx={{ cursor: 'default' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <SectionHeader
              icon={<Building2 size={20} />}
              title={t('settings:cards.companyInfo.title')}
              subtitle={t('settings:cards.companyInfo.subtitle')}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label={t('settings:fields.companyName')}
                value={formData.companyName || ''}
                onChange={e => handleInputChange('companyName', e.target.value)}
                fullWidth
                required
                size="small"
              />
              <TextField
                label={t('settings:fields.registrationNumber')}
                value={formData.registrationNumber || ''}
                onChange={e =>
                  handleInputChange('registrationNumber', e.target.value)
                }
                fullWidth
                required
                size="small"
              />
              <TextField
                label={t('settings:fields.vatNumber')}
                value={formData.vatNumber || ''}
                onChange={e => handleInputChange('vatNumber', e.target.value)}
                fullWidth
                size="small"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <SectionHeader
              icon={<Globe size={20} />}
              title={t('settings:cards.addressInfo.title')}
              subtitle={t('settings:cards.addressInfo.subtitle')}
            />
            <AddressAutocomplete
              value={{
                street: formData.address?.street || '',
                city: formData.address?.city || '',
                postalCode: formData.address?.postalCode || '',
                country: formData.address?.country || '',
                formatted: '',
                lat: (formData.address as Record<string, unknown>)?.lat as number | undefined,
                lon: (formData.address as Record<string, unknown>)?.lon as number | undefined,
              }}
              onChange={(addr: ParsedAddress) => {
                setFormData(prev => ({
                  ...prev,
                  address: {
                    street: addr.street,
                    city: addr.city,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    ...(addr.lat && addr.lon ? { lat: addr.lat, lon: addr.lon } : {}),
                  },
                }));
                scheduleSave();
              }}
              labels={{
                search: t('settings:fields.searchAddress', 'Search address…'),
                street: t('settings:fields.streetAddress'),
                city: t('settings:fields.city'),
                postalCode: t('settings:fields.postalCode'),
                country: t('settings:fields.country'),
              }}
            />
          </CardContent>
        </Card>

        {/* Contact & Legal Representative — combined into one card */}
        <Card sx={{ cursor: 'default' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <SectionHeader
              icon={<Mail size={20} />}
              title={t('settings:cards.contactInfo.title')}
              subtitle={t('settings:cards.contactInfo.subtitle')}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label={t('settings:fields.email')}
                type="email"
                value={formData.contactInfo?.email || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'contactInfo',
                    'email',
                    e.target.value
                  )
                }
                fullWidth
                required
                size="small"
              />
              <TextField
                label={t('settings:fields.phone')}
                value={formData.contactInfo?.phone || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'contactInfo',
                    'phone',
                    e.target.value
                  )
                }
                fullWidth
                size="small"
              />
              <TextField
                label={t('settings:fields.website')}
                value={formData.contactInfo?.website || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'contactInfo',
                    'website',
                    e.target.value
                  )
                }
                fullWidth
                size="small"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <SectionHeader
              icon={<Lock size={20} />}
              title={t('settings:cards.legalRepresentative.title')}
              subtitle={t('settings:cards.legalRepresentative.subtitle')}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label={t('settings:fields.fullName')}
                value={formData.legalRepresentative?.name || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'legalRepresentative',
                    'name',
                    e.target.value
                  )
                }
                fullWidth
                required
                size="small"
              />
              <TextField
                label={t('settings:fields.position')}
                value={formData.legalRepresentative?.position || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'legalRepresentative',
                    'position',
                    e.target.value
                  )
                }
                fullWidth
                size="small"
              />
              <TextField
                label={t('settings:fields.email')}
                type="email"
                value={formData.legalRepresentative?.email || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'legalRepresentative',
                    'email',
                    e.target.value
                  )
                }
                fullWidth
                size="small"
              />
              <TextField
                label={t('settings:fields.phone')}
                value={formData.legalRepresentative?.phone || ''}
                onChange={e =>
                  handleNestedInputChange(
                    'legalRepresentative',
                    'phone',
                    e.target.value
                  )
                }
                fullWidth
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Business Type */}
        <Card sx={{ cursor: 'default' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <SectionHeader
              icon={<Building2 size={20} />}
              title={t('settings:cards.businessType.title')}
              subtitle={t('settings:cards.businessType.subtitle')}
            />
            <BusinessTypeSelector
              value={formData.businessType?.toUpperCase() as BusinessType}
              onChange={type => handleInputChange('businessType', type)}
            />
          </CardContent>
        </Card>
      </Stack>

      {/* Error snackbar for autosave failures */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
