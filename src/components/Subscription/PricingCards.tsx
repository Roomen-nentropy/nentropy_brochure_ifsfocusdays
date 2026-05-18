import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { PRICING_PLANS } from './pricing-config';
import type { BusinessType } from '../BusinessTypeSelector/BusinessTypeSelector';

interface PricingCardsProps {
  onSelectPlan: (planName: string, annual: boolean) => void;
  loading?: boolean;
  currentBusinessType?: BusinessType;
  showAnnual?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  onSelectPlan,
  loading = false,
  currentBusinessType,
  showAnnual = true,
}) => {
  const { t } = useTranslation('subscription');
  const [isAnnual, setIsAnnual] = useState(false);

  // Group plans by business type
  const groupedPlans = PRICING_PLANS.reduce(
    (acc, plan) => {
      if (!acc[plan.businessType]) {
        acc[plan.businessType] = [];
      }
      acc[plan.businessType].push(plan);
      return acc;
    },
    {} as Record<BusinessType, typeof PRICING_PLANS>
  );

  // Get the recommended plan for current business type
  const getRecommendedPlan = (plans: typeof PRICING_PLANS) => {
    return plans.find(p => !p.name.includes('plus')) || plans[0];
  };

  return (
    <Box>
      {showAnnual && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isAnnual}
                onChange={e => setIsAnnual(e.target.checked)}
              />
            }
            label={t('pricing.annual')}
          />
          {isAnnual && (
            <Chip
              label={t('pricing.saveDiscount')}
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      )}

      <Stack spacing={3}>
        {Object.entries(groupedPlans).map(([businessType, plans]) => {
          const recommendedPlan = getRecommendedPlan(plans);
          const isRecommended = businessType === currentBusinessType;

          return (
            <Card
              key={businessType}
              sx={{
                border: isRecommended ? 2 : 1,
                borderColor: isRecommended ? 'primary.main' : 'divider',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {isRecommended && (
                <Chip
                  label={t('pricing.recommendedForYou')}
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: 24,
                  }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t(`plans.${businessType.toLowerCase()}.name`)
                    .replace(' - Basic', '')
                    .replace(' - Plus', '')}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup defaultValue={recommendedPlan.name}>
                    {plans.map((plan, index) => (
                      <Box key={plan.name}>
                        {index > 0 && <Divider sx={{ my: 2 }} />}

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Radio
                            value={plan.name}
                            sx={{ alignSelf: 'flex-start', mt: 1 }}
                          />

                          <Box sx={{ flexGrow: 1 }}>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              mb={1}
                            >
                              <Typography variant="subtitle1" fontWeight="bold">
                                {plan.name.includes('plus')
                                  ? 'Plus Plan'
                                  : 'Basic Plan'}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                €{isAnnual ? plan.annualPrice : plan.price}
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  /mo
                                </Typography>
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={3}
                              flexWrap="wrap"
                              mb={1.5}
                            >
                              <Chip
                                label={
                                  plan.suppliers === 'Unlimited'
                                    ? t('pricing.unlimitedSuppliers')
                                    : t('pricing.upToSuppliers', {
                                        count: parseInt(plan.suppliers),
                                      })
                                }
                                size="small"
                                variant="outlined"
                              />
                              {plan.name.includes('plus') && (
                                <Chip
                                  label="Priority Support"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Stack>

                            {isAnnual && (
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                {t('pricing.billedAnnually', {
                                  amount: (plan.annualPrice * 12).toFixed(0),
                                })}{' '}
                                • {t('pricing.saveDiscount')}
                              </Typography>
                            )}
                          </Box>

                          <Button
                            variant={
                              plan === recommendedPlan
                                ? 'contained'
                                : 'outlined'
                            }
                            size="small"
                            onClick={() => onSelectPlan(plan.name, isAnnual)}
                            disabled={loading}
                            sx={{ minWidth: 100 }}
                          >
                            {loading
                              ? t('pricing.processing')
                              : t('pricing.subscribe')}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 2, textAlign: 'center' }}
                >
                  <Check
                    size={14}
                    style={{ verticalAlign: 'middle', marginRight: 4 }}
                  />
                  {t('pricing.freeTrialIncluded')}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default PricingCards;
