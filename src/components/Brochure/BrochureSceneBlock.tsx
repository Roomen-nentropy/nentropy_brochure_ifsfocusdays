import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import type { BrochureScene, SceneItem } from '../../pages/brochure/brochureScenes';

const ORANGE = '#E08805';
const BLUE = '#44628C';
const DARK = '#2A2C33';
const BG = '#f4f0eb';

const SIZE_MAP: Record<NonNullable<SceneItem['size']>, { maxW: number | string }> = {
  xs: { maxW: 160 },
  sm: { maxW: 220 },
  md: { maxW: 380 },
  lg: { maxW: 480 },
  xl: { maxW: 600 },
  full: { maxW: 680 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

type SceneText = {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  body?: string;
  footer?: string;
  tags?: string[];
  steps?: string[];
  closingStep?: string;
  menuItems?: string[];
  layerPills?: string[];
  layerCaptions?: string[];
  layerItems?: string[][];
  dppSubtitle?: string;
  benefitItems?: string[];
  forecastItems?: string[];
  regulations?: string[];
};

type Props = {
  scene: BrochureScene;
  text: SceneText;
};

function StepBadge({ step }: { step: number }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: BLUE,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '1.1rem',
        mx: 'auto',
        mb: 1.5,
      }}
    >
      {step}
    </Box>
  );
}

function LayerList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '1rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: BLUE,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2.5 }}>
        {items.map(line => (
          <Typography key={line} component="li" sx={{ color: 'rgba(42,44,51,0.78)', fontSize: '0.95rem' }}>
            {line}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function PillRow({ items }: { items: string[] }) {
  return (
    <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} useFlexGap>
      {items.map(item => (
        <Chip key={item} label={item} sx={{ fontWeight: 700, bgcolor: 'white', border: `1px solid ${BLUE}40`, color: BLUE }} />
      ))}
    </Stack>
  );
}

function AssetImg({
  item,
  index,
  caption,
  hideCaption,
}: {
  item: SceneItem;
  index: number;
  caption?: string;
  hideCaption?: boolean;
}) {
  const size = item.size ?? 'md';
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <Box sx={{ textAlign: 'center' }}>
        {item.step != null && <StepBadge step={item.step} />}
        {!hideCaption && caption && (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: DARK,
              mb: 1.5,
            }}
          >
            {caption}
          </Typography>
        )}
        <Box
          component="img"
          src={item.asset}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          sx={{
            width: 'auto',
            maxWidth: `min(100%, ${typeof SIZE_MAP[size].maxW === 'number' ? `${SIZE_MAP[size].maxW}px` : SIZE_MAP[size].maxW})`,
            height: 'auto',
            display: 'block',
            mx: 'auto',
          }}
        />
      </Box>
    </motion.div>
  );
}

export default function BrochureSceneBlock({ scene, text }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const captionFor = (index: number, item: SceneItem) => {
    if (scene.layout === 'scatter') return undefined;
    if (item.step != null) return text.steps?.[index];
    return undefined;
  };

  const textBlock = (
    <motion.div variants={textVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      {text.eyebrow && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: ORANGE,
            mb: 1.5,
            textAlign: 'center',
          }}
        >
          {text.eyebrow}
        </Typography>
      )}

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.75rem', md: scene.layout === 'hero' ? '2.75rem' : '2.1rem' },
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: DARK,
          }}
        >
          {text.title}
          {text.titleAccent && (
            <Box component="span" sx={{ display: 'block', mt: 0.5, color: ORANGE }}>
              {text.titleAccent}
            </Box>
          )}
        </Typography>
        {text.subtitle && (
          <Typography sx={{ mt: 1.5, fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 600, color: 'rgba(42,44,51,0.85)' }}>
            {text.subtitle}
          </Typography>
        )}
      </Box>

      {text.body && (
        <Typography
          sx={{
            textAlign: 'center',
            maxWidth: 540,
            mx: 'auto',
            mb: 4,
            fontSize: { xs: '1.02rem', md: '1.1rem' },
            lineHeight: 1.75,
            color: 'rgba(42,44,51,0.78)',
          }}
        >
          {text.body}
        </Typography>
      )}

      {text.tags && text.tags.length > 0 && (
        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} mb={4} useFlexGap>
          {text.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              sx={{ fontWeight: 700, bgcolor: `${ORANGE}14`, color: ORANGE, border: `1px solid ${ORANGE}35` }}
            />
          ))}
        </Stack>
      )}

      {text.footer && scene.id !== 'growth' && (
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.04em',
            mb: 4,
            color: 'rgba(42,44,51,0.75)',
          }}
        >
          {text.footer}
        </Typography>
      )}
    </motion.div>
  );

  const layerCardSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2.5,
    p: 3,
    borderRadius: 3,
    bgcolor: '#ffffff',
    border: '1px solid rgba(42,44,51,0.08)',
    boxShadow: '0 4px 24px rgba(42,44,51,0.06)',
    width: '100%',
    maxWidth: 420,
    mx: 'auto',
  } as const;

  const renderDppLayers = () => (
    <Stack spacing={4} sx={{ mb: 2, width: '100%' }}>
      {scene.items.map((item, i) => {
        const title = text.layerCaptions?.[i] ?? '';
        const bullets = text.layerItems?.[i] ?? [];
        const isFeaturedLayer = i === scene.items.length - 1;

        return (
          <motion.div
            key={item.asset}
            custom={i + 1}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {isFeaturedLayer ? (
              <Box
                sx={{
                  ...layerCardSx,
                  maxWidth: 680,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  gap: { xs: 2.5, sm: 3 },
                  textAlign: 'left',
                }}
              >
                <Box
                  component="img"
                  src={item.asset}
                  alt={item.alt}
                  sx={{
                    width: 'auto',
                    maxWidth: { xs: '100%', sm: 'min(62%, 480px)' },
                    height: 'auto',
                    flexShrink: 0,
                    display: 'block',
                  }}
                />
                {title && bullets.length > 0 && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <LayerList title={title} items={bullets} />
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={layerCardSx}>
                {title && bullets.length > 0 && <LayerList title={title} items={bullets} />}
              </Box>
            )}
          </motion.div>
        );
      })}
    </Stack>
  );

  const renderSupplyChain = () => {
    const stepItems = scene.items.filter(item => item.step != null);
    const consumerGraphic = scene.items.find(item => item.step == null);

    return (
      <Stack spacing={4} alignItems="center" sx={{ mb: 2, width: '100%' }}>
        {stepItems.map((item, i) => (
          <AssetImg key={item.asset} item={item} index={i + 1} caption={captionFor(i, item)} />
        ))}

        <motion.div variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Box sx={{ textAlign: 'center' }}>
            <StepBadge step={6} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: DARK,
                mb: 2,
              }}
            >
              {text.steps?.[5]}
            </Typography>
          </Box>
        </motion.div>

        {(text.dppSubtitle || (text.menuItems && text.menuItems.length > 0)) && (
          <Box sx={{ ...layerCardSx, textAlign: 'center' }}>
            {text.dppSubtitle && (
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: BLUE, mb: 2 }}>
                {text.dppSubtitle}
              </Typography>
            )}
            {text.menuItems && text.menuItems.length > 0 && (
              <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 0, listStyle: 'none', textAlign: 'left', minWidth: 260, mx: 'auto' }}>
                {text.menuItems.map(line => (
                  <Typography key={line} component="li" sx={{ fontWeight: 600, color: DARK, fontSize: '1rem' }}>
                    {line}
                  </Typography>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {consumerGraphic && <AssetImg item={consumerGraphic} index={7} hideCaption />}
      </Stack>
    );
  };

  const renderExtras = () => {
    if (scene.id === 'feedback' && text.benefitItems?.length) {
      return <Box sx={{ mb: 3 }}><PillRow items={text.benefitItems} /></Box>;
    }
    if (scene.id === 'forecasts' && text.forecastItems?.length) {
      return <Box sx={{ mb: 3 }}><PillRow items={text.forecastItems} /></Box>;
    }
    if (scene.id === 'compliance' && text.regulations?.length) {
      return (
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          {text.regulations.map(reg => (
            <Typography key={reg} sx={{ fontWeight: 600, color: BLUE, fontSize: '1rem' }}>
              {reg}
            </Typography>
          ))}
        </Stack>
      );
    }
    return null;
  };

  const renderAssets = () => {
    if (scene.items.length === 0) return null;
    if (scene.id === 'dpp-layers') return renderDppLayers();
    if (scene.id === 'supply-chain') return renderSupplyChain();

    if (scene.layout === 'scatter') {
      return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 680, mx: 'auto', height: { xs: 440, md: 500 }, mb: 2 }}>
          {scene.items.map((item, i) => (
            <Box
              key={item.asset}
              sx={{
                position: 'absolute',
                left: `${item.x ?? 0}%`,
                top: `${item.y ?? 0}%`,
                width: { xs: '40%', md: '34%' },
                transform: `rotate(${item.rotate ?? 0}deg)`,
              }}
            >
              <AssetImg item={{ ...item, size: 'sm' }} index={i + 1} hideCaption />
            </Box>
          ))}
        </Box>
      );
    }

    const stack = (spacing: number) => (
      <Stack spacing={spacing} alignItems="center" sx={{ mb: 2, width: '100%' }}>
        {scene.items.map((item, i) => (
          <AssetImg key={item.asset} item={item} index={i + 1} caption={captionFor(i, item)} hideCaption={scene.id === 'scanning'} />
        ))}
      </Stack>
    );

    if (scene.layout === 'stack') return stack(4);
    if (scene.layout === 'sequence') return stack(5);
    if (scene.layout === 'wide' || scene.layout === 'center') return stack(4);

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <AssetImg item={scene.items[0]} index={1} hideCaption />
      </Box>
    );
  };

  return (
    <Box
      ref={ref}
      component="section"
      id={`scene-${scene.id}`}
      data-brochure-chapter={scene.chapter}
      sx={{
        minHeight: { xs: 'auto', md: scene.layout === 'scatter' ? '85vh' : '75vh' },
        py: { xs: 7, md: 9 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        scrollMarginTop: 88,
        bgcolor: BG,
      }}
    >
      {scene.layout === 'hero' ? (
        <>
          <motion.div variants={textVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            {text.eyebrow && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: ORANGE,
                  mb: 1.5,
                  textAlign: 'center',
                }}
              >
                {text.eyebrow}
              </Typography>
            )}
            <Box sx={{ bgcolor: ORANGE, color: 'white', borderRadius: 3, py: { xs: 2.5, md: 3 }, px: 2, mb: 3, textAlign: 'center' }}>
              <Typography component="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05 }}>
                {text.title}
              </Typography>
            </Box>
          </motion.div>
          {renderAssets()}
          <motion.div variants={textVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <Box sx={{ bgcolor: ORANGE, color: 'white', borderRadius: 3, py: 2, px: 2, mt: 3, textAlign: 'center' }}>
              {text.titleAccent && (
                <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 800, textTransform: 'uppercase' }}>
                  {text.titleAccent}
                </Typography>
              )}
              {text.subtitle && (
                <Typography sx={{ mt: 0.5, fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 600 }}>{text.subtitle}</Typography>
              )}
            </Box>
          </motion.div>
        </>
      ) : (
        <>
          {textBlock}
          {renderExtras()}
          {renderAssets()}
          {text.footer && scene.id === 'growth' && (
            <Typography
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.04em',
                mt: 3,
                color: 'rgba(42,44,51,0.75)',
              }}
            >
              {text.footer}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
