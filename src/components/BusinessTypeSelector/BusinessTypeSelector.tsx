import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import { Store, Ship, Factory, Home, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRICING_PLANS } from '../Subscription/pricing-config';

export type BusinessType =
  | 'TRADER'
  | 'OPERATOR_IMPORTER'
  | 'OPERATOR_MANUFACTURER'
  | 'OPERATOR_DOMESTIC';

interface BusinessTypeOption {
  type: BusinessType;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: {
    label: string;
    available: boolean;
  }[];
  details: string[];
  color: string;
}

interface BusinessTypeSelectorProps {
  value?: BusinessType;
  onChange: (type: BusinessType) => void;
  disabled?: boolean;
  showPricing?: boolean;
  onSubscribe?: (type: BusinessType) => void;
}

const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showPricing = false,
  onSubscribe,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('businessTypeSelector');

  const getPriceForType = (type: BusinessType): number => {
    const plan = PRICING_PLANS.find(p => p.businessType === type);
    return plan?.price || 0;
  };

  const businessTypes: BusinessTypeOption[] = [
    {
      type: 'TRADER',
      icon: <Store size={32} />,
      title: t('businessTypes.TRADER.title'),
      description: t('businessTypes.TRADER.description'),
      color: theme.palette.info.main,
      features: [
        {
          label: t('businessTypes.TRADER.features.recordDDS'),
          available: true,
        },
        {
          label: t('businessTypes.TRADER.features.trackSuppliers'),
          available: true,
        },
        {
          label: t('businessTypes.TRADER.features.riskAssessments'),
          available: false,
        },
        {
          label: t('businessTypes.TRADER.features.createDDS'),
          available: false,
        },
        {
          label: t('businessTypes.TRADER.features.manufacture'),
          available: false,
        },
      ],
      details: [
        t('businessTypes.TRADER.details.retention'),
        t('businessTypes.TRADER.details.workflow'),
        t('businessTypes.TRADER.details.collectDDS'),
        t('businessTypes.TRADER.details.noGeolocation'),
      ],
    },
    {
      type: 'OPERATOR_IMPORTER',
      icon: <Ship size={32} />,
      title: t('businessTypes.OPERATOR_IMPORTER.title'),
      description: t('businessTypes.OPERATOR_IMPORTER.description'),
      color: theme.palette.warning.main,
      features: [
        {
          label: t('businessTypes.OPERATOR_IMPORTER.features.createDDS'),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_IMPORTER.features.riskAssessments'),
          available: true,
        },
        {
          label: t(
            'businessTypes.OPERATOR_IMPORTER.features.trackSupplyChains'
          ),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_IMPORTER.features.sendSurveys'),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_IMPORTER.features.geolocation'),
          available: true,
        },
      ],
      details: [
        t('businessTypes.OPERATOR_IMPORTER.details.retention'),
        t('businessTypes.OPERATOR_IMPORTER.details.dueDiligence'),
        t('businessTypes.OPERATOR_IMPORTER.details.geolocationMandatory'),
        t('businessTypes.OPERATOR_IMPORTER.details.riskAssessment'),
      ],
    },
    {
      type: 'OPERATOR_MANUFACTURER',
      icon: <Factory size={32} />,
      title: t('businessTypes.OPERATOR_MANUFACTURER.title'),
      description: t('businessTypes.OPERATOR_MANUFACTURER.description'),
      color: theme.palette.error.main,
      features: [
        {
          label: t('businessTypes.OPERATOR_MANUFACTURER.features.createDDS'),
          available: true,
        },
        {
          label: t(
            'businessTypes.OPERATOR_MANUFACTURER.features.riskAssessments'
          ),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_MANUFACTURER.features.ownGoods'),
          available: true,
        },
        {
          label: t(
            'businessTypes.OPERATOR_MANUFACTURER.features.ingredientTracking'
          ),
          available: true,
        },
        {
          label: t(
            'businessTypes.OPERATOR_MANUFACTURER.features.batchManagement'
          ),
          available: true,
        },
      ],
      details: [
        t('businessTypes.OPERATOR_MANUFACTURER.details.retention'),
        t('businessTypes.OPERATOR_MANUFACTURER.details.trackIngredients'),
        t('businessTypes.OPERATOR_MANUFACTURER.details.bomTracking'),
        t('businessTypes.OPERATOR_MANUFACTURER.details.traceability'),
      ],
    },
    {
      type: 'OPERATOR_DOMESTIC',
      icon: <Home size={32} />,
      title: t('businessTypes.OPERATOR_DOMESTIC.title'),
      description: t('businessTypes.OPERATOR_DOMESTIC.description'),
      color: theme.palette.success.main,
      features: [
        {
          label: t('businessTypes.OPERATOR_DOMESTIC.features.createDDS'),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_DOMESTIC.features.euSurveys'),
          available: true,
        },
        {
          label: t('businessTypes.OPERATOR_DOMESTIC.features.riskAssessments'),
          available: true,
        },
        {
          label: t(
            'businessTypes.OPERATOR_DOMESTIC.features.simplifiedCompliance'
          ),
          available: true,
        },
      ],
      details: [
        t('businessTypes.OPERATOR_DOMESTIC.details.retention'),
        t('businessTypes.OPERATOR_DOMESTIC.details.euSurveys'),
        t('businessTypes.OPERATOR_DOMESTIC.details.lowerRisk'),
      ],
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('subtitle')}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {businessTypes.map(businessType => {
          const isSelected = value === businessType.type;

          return (
            <Card
              sx={{
                height: '100%',
                border: 2,
                borderColor: isSelected ? businessType.color : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: alpha(businessType.color, 0.5),
                  transform: disabled ? 'none' : 'translateY(-4px)',
                  boxShadow: disabled ? 1 : 4,
                },
              }}
            >
              <CardActionArea
                onClick={() => !disabled && onChange(businessType.type)}
                disabled={disabled}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ height: '100%', position: 'relative' }}>
                  {/* Icon and Title */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        color: businessType.color,
                        backgroundColor: alpha(businessType.color, 0.1),
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {businessType.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" component="div">
                        {businessType.title}
                      </Typography>
                      {isSelected && (
                        <Chip
                          label={t('selected')}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Stack>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {businessType.description}
                  </Typography>

                  {/* Features */}
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 'bold' }}
                  >
                    {t('featuresLabel')}
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {businessType.features.map((feature, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        {feature.available ? (
                          <Check size={16} color={theme.palette.success.main} />
                        ) : (
                          <X size={16} color={theme.palette.text.disabled} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: feature.available
                              ? 'text.primary'
                              : 'text.disabled',
                          }}
                        >
                          {feature.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Details */}
                  <Box
                    sx={{
                      backgroundColor: alpha(businessType.color, 0.05),
                      borderRadius: 1,
                      p: 1.5,
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}
                    >
                      {t('keyDetailsLabel')}
                    </Typography>
                    {businessType.details.map((detail, index) => (
                      <Typography
                        key={index}
                        variant="caption"
                        sx={{ display: 'block', color: 'text.secondary' }}
                      >
                        • {detail}
                      </Typography>
                    ))}
                  </Box>

                  {/* Pricing Footer */}
                  {showPricing && (
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={0.5}
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="h5" fontWeight="bold">
                          €{getPriceForType(businessType.type)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          /month
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        color="success.main"
                        display="block"
                        sx={{ mb: 1.5 }}
                      >
                        ✓ 7-day free trial included
                      </Typography>
                      {onSubscribe && !disabled && (
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            onSubscribe(businessType.type);
                          }}
                        >
                          Subscribe Now
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default BusinessTypeSelector;
