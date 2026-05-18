import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  alpha,
  useTheme,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { MapPin, Search } from 'lucide-react';

// ── Places API (New) REST types ─────────────────────────────────

interface AutocompleteSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    structuredFormat: {
      mainText: { text: string };
      secondaryText: { text: string };
    };
  };
}

interface PlaceDetailsResponse {
  formattedAddress: string;
  addressComponents: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ParsedAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  /** Full formatted address */
  formatted: string;
  lat?: number;
  lon?: number;
}

interface AddressAutocompleteProps {
  value: ParsedAddress;
  onChange: (address: ParsedAddress) => void;
  labels?: {
    search?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  /** When true, shows only the search bar (no sub-fields) */
  compact?: boolean;
  disabled?: boolean;
}

// ── Places API (New) REST helpers ───────────────────────────────

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';
const DEBOUNCE_MS = 300;

/** Google Places (New) — opt-in only; default off so forms work without keys or network. */
const USE_GOOGLE_PLACES =
  import.meta.env.VITE_ENABLE_GOOGLE_PLACES === 'true' && !!GOOGLE_API_KEY;

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

function placeDetailsUrl(placeId: string) {
  return `https://places.googleapis.com/v1/places/${placeId}`;
}

async function fetchAutocompleteSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<AutocompleteSuggestion[]> {
  const res = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
    },
    body: JSON.stringify({
      input: query,
      includedPrimaryTypes: [
        'street_address',
        'subpremise',
        'premise',
        'route',
      ],
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Places autocomplete failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return (data.suggestions ?? []) as AutocompleteSuggestion[];
}

async function fetchPlaceDetails(
  placeId: string,
  signal?: AbortSignal
): Promise<PlaceDetailsResponse> {
  const fields = 'formattedAddress,addressComponents,location';
  const res = await fetch(`${placeDetailsUrl(placeId)}?languageCode=en`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': fields,
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Place details failed (${res.status}): ${text}`);
  }

  return (await res.json()) as PlaceDetailsResponse;
}

function parsePlaceDetails(details: PlaceDetailsResponse): ParsedAddress {
  const components = details.addressComponents ?? [];

  const get = (type: string): string =>
    components.find(c => c.types.includes(type))?.longText || '';

  const streetNumber = get('street_number');
  const route = get('route');
  const street = [route, streetNumber].filter(Boolean).join(' ');

  return {
    street,
    city:
      get('locality') ||
      get('postal_town') ||
      get('administrative_area_level_2') ||
      '',
    postalCode: get('postal_code') || '',
    country: get('country') || '',
    formatted: details.formattedAddress || '',
    lat: details.location?.latitude,
    lon: details.location?.longitude,
  };
}

// Flatten the suggestion into a simpler shape for the Autocomplete
interface OptionItem {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

function toOption(s: AutocompleteSuggestion): OptionItem {
  const p = s.placePrediction;
  return {
    placeId: p.placeId,
    description: p.text.text,
    mainText: p.structuredFormat.mainText.text,
    secondaryText: p.structuredFormat.secondaryText.text,
  };
}

// ── Component ───────────────────────────────────────────────────

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  labels = {},
  compact = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const ready = USE_GOOGLE_PLACES;

  const {
    search: searchLabel = 'Search address…',
    street: streetLabel = 'Street Address',
    city: cityLabel = 'City',
    postalCode: postalCodeLabel = 'Postal Code',
    country: countryLabel = 'Country',
  } = labels;

  // Fetch autocomplete predictions via REST
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!ready || query.length < 3) {
        setOptions([]);
        return;
      }

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const suggestions = await fetchAutocompleteSuggestions(
          query,
          controller.signal
        );
        setOptions(suggestions.map(toOption));
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Address autocomplete error:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [ready]
  );

  // Debounced input
  const handleInputChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      setInputValue(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => fetchSuggestions(newValue),
        DEBOUNCE_MS
      );
    },
    [fetchSuggestions]
  );

  // Selection handler — fetch place details then push parsed address
  const handleSelect = useCallback(
    async (_: React.SyntheticEvent, selected: string | OptionItem | null) => {
      if (!selected || typeof selected === 'string') return;

      try {
        const details = await fetchPlaceDetails(selected.placeId);
        const parsed = parsePlaceDetails(details);
        onChange(parsed);
      } catch (err) {
        console.error('Place details error:', err);
      }

      setInputValue('');
    },
    [onChange]
  );

  // Manual field change
  const handleFieldChange = useCallback(
    (field: keyof ParsedAddress, val: string) => {
      onChange({ ...value, [field]: val });
    },
    [onChange, value]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <Box>
      {!USE_GOOGLE_PLACES && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Address search (Google Places) is disabled. Set{' '}
          <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
            VITE_ENABLE_GOOGLE_PLACES=true
          </Typography>{' '}
          and <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>VITE_GOOGLE_PLACES_API_KEY</Typography> to enable. Enter the address manually below.
        </Alert>
      )}

      {USE_GOOGLE_PLACES && (
      <Autocomplete
        freeSolo
        disableClearable={false}
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        getOptionLabel={option =>
          typeof option === 'string' ? option : option.description
        }
        filterOptions={x => x}
        isOptionEqualToValue={(opt, val) => opt.placeId === val.placeId}
        disabled={disabled}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: t => t.palette.common.white,
              backgroundImage: 'none',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.grey[800], 0.15)}`,
              '& .MuiAutocomplete-listbox': {
                backgroundColor: t => t.palette.common.white,
              },
            },
          },
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1,
              }}
            >
              <MapPin
                size={16}
                style={{
                  marginTop: 3,
                  flexShrink: 0,
                  color: theme.palette.primary.main,
                }}
              />
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ lineHeight: 1.3 }}
                >
                  {option.mainText}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.secondaryText}
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={searchLabel}
            size="small"
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
            sx={{
              ...(compact ? {} : { mb: 2 }),
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              },
            }}
          />
        )}
      />
      )}

      {!compact && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            label={streetLabel}
            value={value.street}
            onChange={e => handleFieldChange('street', e.target.value)}
            fullWidth
            size="small"
            disabled={disabled}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <TextField
            label={cityLabel}
            value={value.city}
            onChange={e => handleFieldChange('city', e.target.value)}
            fullWidth
            size="small"
            disabled={disabled}
          />
          <TextField
            label={postalCodeLabel}
            value={value.postalCode}
            onChange={e => handleFieldChange('postalCode', e.target.value)}
            fullWidth
            size="small"
            disabled={disabled}
          />
          <TextField
            label={countryLabel}
            value={value.country}
            onChange={e => handleFieldChange('country', e.target.value)}
            fullWidth
            size="small"
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
};

export default AddressAutocomplete;
