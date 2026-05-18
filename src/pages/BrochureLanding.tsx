import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BrochureSceneBlock from '../components/Brochure/BrochureSceneBlock';
import {
  BROCHURE_SCENES,
  CHAPTER_LABELS,
  type BrochureChapter,
} from './brochure/brochureScenes';
import { BROCHURE_SITE_URL, assetBase } from '../config/brochureSite';

const ORANGE = '#E08805';
const BLUE = '#44628C';
const DARK = '#2A2C33';
const BG = '#f4f0eb';

const CONTACTS = {
  rumen: { email: 'rumen.lozanov@joinnentropy.com', phone: '+359 884651368' },
  konstantin: { email: 'konstantin.markov@joinnentropy.com' },
  website: 'https://www.joinnentropy.com',
};

const CHAPTER_COLORS: Record<BrochureChapter, string> = {
  intro: DARK,
  solution: ORANGE,
  chaos: ORANGE,
  transition: BLUE,
  platform: BLUE,
  outcome: '#059669',
};

type SceneText = {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  body?: string;
  tags?: string[];
  steps?: string[];
  layerCaptions?: string[];
};

export default function BrochureLanding() {
  const { t, i18n } = useTranslation('brochure');
  const lang = i18n.language === 'en' ? 'en' : 'bg';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState<BrochureChapter>('solution');

  const brochureUrl = BROCHURE_SITE_URL || (typeof window !== 'undefined' ? window.location.href : '');
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(brochureUrl)}`;

  const chapters = useMemo(() => {
    const seen = new Set<BrochureChapter>();
    return BROCHURE_SCENES.filter(s => {
      if (seen.has(s.chapter)) return false;
      seen.add(s.chapter);
      return true;
    });
  }, []);

  useEffect(() => {
    document.title = t('meta.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.description'));
  }, [t, lang]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? el.scrollTop / max : 0);

      const sections = document.querySelectorAll('[data-brochure-chapter]');
      let current: BrochureChapter = 'solution';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.42) {
          current = section.getAttribute('data-brochure-chapter') as BrochureChapter;
        }
      });
      setActiveChapter(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToChapter = (chapter: BrochureChapter) => {
    const el = document.querySelector(`[data-brochure-chapter="${chapter}"]`);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const sceneText = (key: string): SceneText =>
    t(`scenes.${key}`, { returnObjects: true }) as SceneText;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, color: DARK, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <LinearProgress
        variant="determinate"
        value={scrollProgress * 100}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 3,
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': { bgcolor: ORANGE },
        }}
      />

      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 3,
          left: 0,
          right: 0,
          zIndex: 150,
          py: 1.25,
          px: 2,
          bgcolor: 'rgba(244,240,235,0.94)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(42,44,51,0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box component="img" src={`${assetBase}dark-gray-logo.svg`} alt="N'entropy" sx={{ height: 26 }} />
              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: CHAPTER_COLORS[activeChapter],
                  transition: 'color 0.3s',
                }}
              >
                {CHAPTER_LABELS[activeChapter][lang]}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={() => i18n.changeLanguage(lang === 'bg' ? 'en' : 'bg')}
                aria-label="Toggle language"
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
              <Button component="a" href="#contact" size="small" variant="contained" color="secondary" sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 1 }}>
                {t('nav.contact')}
              </Button>
              <IconButton size="small" onClick={() => setMenuOpen(v => !v)} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Menu">
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed',
              top: 56,
              left: 0,
              right: 0,
              zIndex: 140,
              background: 'rgba(244,240,235,0.98)',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              padding: '12px 16px',
            }}
          >
            <Stack spacing={0.5}>
              {chapters.map(c => (
                <Button
                  key={c.chapter}
                  fullWidth
                  onClick={() => scrollToChapter(c.chapter)}
                  sx={{
                    justifyContent: 'flex-start',
                    color: activeChapter === c.chapter ? ORANGE : 'text.secondary',
                    fontWeight: activeChapter === c.chapter ? 700 : 500,
                  }}
                >
                  {CHAPTER_LABELS[c.chapter][lang]}
                </Button>
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 120,
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {chapters.map(c => (
          <Box
            key={c.chapter}
            component="button"
            onClick={() => scrollToChapter(c.chapter)}
            sx={{
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'transparent',
              p: 0.5,
              opacity: activeChapter === c.chapter ? 1 : 0.4,
              '&:hover': { opacity: 1 },
            }}
          >
            <Box
              sx={{
                width: activeChapter === c.chapter ? 10 : 6,
                height: activeChapter === c.chapter ? 10 : 6,
                borderRadius: '50%',
                bgcolor: CHAPTER_COLORS[c.chapter],
              }}
            />
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: CHAPTER_COLORS[c.chapter],
                display: activeChapter === c.chapter ? 'block' : 'none',
              }}
            >
              {CHAPTER_LABELS[c.chapter][lang]}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box component="main" sx={{ pt: 9 }}>
        <Container maxWidth="md" sx={{ pl: { md: 8 } }}>
          <Box sx={{ textAlign: 'center', py: 4, display: { xs: 'block', md: 'none' } }}>
            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{t('nav.scrollHint')}</Typography>
            <KeyboardArrowDownIcon sx={{ mt: 1, color: ORANGE }} />
          </Box>

          {BROCHURE_SCENES.map(scene => (
            <BrochureSceneBlock key={scene.id} scene={scene} text={sceneText(scene.textKey)} />
          ))}
        </Container>

        <Box
          id="contact"
          component="section"
          sx={{
            py: { xs: 6, md: 10 },
            mt: 4,
            background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
            color: 'white',
            scrollMarginTop: 80,
          }}
        >
          <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center" justifyContent="center" mb={5}>
                <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 2 }}>
                  <Box component="img" src={qrImageUrl} alt="QR" width={180} height={180} sx={{ display: 'block' }} />
                </Box>
                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="h6" fontWeight={700}>{t('qr.title')}</Typography>
                  <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.9rem' }}>{t('qr.hint')}</Typography>
                  <Typography sx={{ mt: 1.5, fontSize: '0.8rem', fontFamily: 'monospace', opacity: 0.55, wordBreak: 'break-all' }}>
                    {brochureUrl}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {t('cta.title')}
              </Typography>
              <Typography textAlign="center" sx={{ opacity: 0.88, mt: 1, mb: 4 }}>{t('cta.subtitle')}</Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {[
                  { name: t('contact.rumen'), email: CONTACTS.rumen.email, phone: CONTACTS.rumen.phone },
                  { name: t('contact.konstantin'), email: CONTACTS.konstantin.email },
                ].map(person => (
                  <Box
                    key={person.email}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    <Typography fontWeight={700} mb={2}>{person.name}</Typography>
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmailOutlinedIcon sx={{ opacity: 0.75, fontSize: 20 }} />
                        <Typography component="a" href={`mailto:${person.email}`} sx={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
                          {person.email}
                        </Typography>
                      </Stack>
                      {person.phone && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneOutlinedIcon sx={{ opacity: 0.75, fontSize: 20 }} />
                          <Typography component="a" href={`tel:${person.phone.replace(/\s/g, '')}`} sx={{ color: 'white', textDecoration: 'none' }}>
                            {person.phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Stack alignItems="center" spacing={2} mt={4}>
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" useFlexGap>
                  <Button component="a" href={CONTACTS.website} target="_blank" rel="noopener noreferrer" variant="contained" color="secondary" size="large">
                    {t('cta.website')}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/auth"
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}
                  >
                    {t('nav.app')}
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ opacity: 0.45 }}>© {new Date().getFullYear()} N'entropy</Typography>
              </Stack>
            </motion.div>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
