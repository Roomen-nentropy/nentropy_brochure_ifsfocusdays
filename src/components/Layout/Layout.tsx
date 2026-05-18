import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  Shield,
  FileSpreadsheet,
  GitBranch,
  Factory,
  LogOut,
  Plug,
  Cpu,
  Tags,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LiveChat } from '../Livechat';
import {
  useWorkflow,
  type BusinessTypeFeatures,
} from '../../hooks/useWorkflow';
import { useSession, signOut } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';
import type { ExtendedSessionData } from '../../types/auth';
import type { BusinessType } from '../BusinessTypeSelector/BusinessTypeSelector';
import TrialBanner from '../Subscription/TrialBanner';
import SubscriptionModal from '../Subscription/SubscriptionModal';
const logo = '/dark-gray-logo.svg';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  comingSoon?: boolean;
  requiresFeature?: string; // Feature flag from workflow
}

const allMenuItems: MenuItem[] = [
  { text: 'menu.dashboard', icon: <LayoutDashboard />, path: '/dashboard' },
  { text: 'menu.suppliers', icon: <Building2 />, path: '/suppliers' },
  { text: 'menu.products', icon: <Package />, path: '/products' },
  {
    text: 'menu.ownGoods',
    icon: <Factory />,
    path: '/own-goods',
    requiresFeature: 'canManageOwnGoods',
  },
  {
    text: 'menu.production',
    icon: <Cpu />,
    path: '/production',
    requiresFeature: 'canManageOwnGoods',
  },
  {
    text: 'menu.packagingLabelling',
    icon: <Tags />,
    path: '/packaging-labelling',
    requiresFeature: 'canManageOwnGoods',
  },
  {
    text: 'menu.surveys',
    icon: <FileText />,
    path: '/surveys',
    requiresFeature: 'canSendSurveys',
  },
  {
    text: 'menu.riskAssessments',
    icon: <Shield />,
    path: '/risk-assessments',
    requiresFeature: 'canCreateRiskAssessments',
  },
  {
    text: 'menu.dds',
    icon: <FileSpreadsheet />,
    path: '/dds',
  },
  {
    text: 'menu.supplyChains',
    icon: <GitBranch />,
    path: '/supply-chains',
    requiresFeature: 'canManageSupplyChains',
    comingSoon: true,
  },
  {
    text: 'menu.integrations',
    icon: <Plug />,
    path: '/integrations',
  },
  { text: 'menu.settings', icon: <Settings />, path: '/settings' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const { hasFeature } = useWorkflow();
  const { data: session } = useSession();
  const { settings } = useSettings();

  useEffect(() => {
    if (session?.user) {
      const user = (session as ExtendedSessionData).user;
      const trialEndsAt = user.trialEndsAt;
      const subscriptionStatus = user.subscriptionStatus;

      if (trialEndsAt && new Date() > new Date(trialEndsAt)) {
        if (subscriptionStatus !== 'ACTIVE') {
          setShowSubscriptionModal(true);
        }
      }
    }
  }, [session]);

  const showTrialBanner = useMemo(() => {
    if (!session?.user) return false;
    const user = (session as ExtendedSessionData).user;
    const trialEndsAt = user.trialEndsAt;
    const subscriptionStatus = user.subscriptionStatus;

    if (trialEndsAt && subscriptionStatus === 'TRIAL') {
      return new Date() < new Date(trialEndsAt);
    }
    return false;
  }, [session]);

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      if (!item.requiresFeature) return true;

      return hasFeature(
        item.requiresFeature as keyof BusinessTypeFeatures['features']
      );
    });
  }, [hasFeature]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          justifyContent: desktopOpen ? 'space-between' : 'center',
          minHeight: { xs: 56, sm: 64 },
          px: desktopOpen ? 2 : 1,
        }}
      >
        {desktopOpen && (
          <Typography variant="h6" noWrap component="div" color="primary">
            <img src={logo} height={24} />
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleDesktopDrawerToggle}
            color="primary"
            sx={{
              p: desktopOpen ? 1 : 1.5,
            }}
          >
            {desktopOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Toolbar>
      <List>
        {menuItems.map(item => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{ height: 50, px: desktopOpen ? 2 : 0 }}
          >
            <ListItemButton
              sx={{
                height: 45,
                justifyContent: desktopOpen ? 'initial' : 'center',
                px: desktopOpen ? 2.5 : 0,
              }}
              selected={location.pathname === item.path}
              onClick={() => {
                if (!item.comingSoon) {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: desktopOpen ? 3 : 0,
                  justifyContent: 'center',
                  width: desktopOpen ? 'auto' : '100%',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <span>{t(item.text)}</span>
                    {item.comingSoon && desktopOpen && (
                      <Chip
                        label="Coming Soon!"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-24px',
                          height: 14,
                          fontSize: '0.5rem',
                          fontWeight: 700,
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          transform: 'rotate(-12deg)',
                          transformOrigin: 'center',
                          boxShadow: '0 1px 3px rgba(255, 68, 68, 0.4)',
                          zIndex: 1,
                          '& .MuiChip-label': {
                            padding: '0 4px',
                          },
                        }}
                      />
                    )}
                  </Box>
                }
                sx={{
                  opacity: desktopOpen ? 1 : 0,
                  display: desktopOpen ? 'block' : 'none',
                  '& .MuiListItemText-primary': { fontSize: '0.95rem' },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding sx={{ height: 50, px: desktopOpen ? 2 : 0 }}>
          <ListItemButton
            sx={{
              height: 45,
              justifyContent: desktopOpen ? 'initial' : 'center',
              px: desktopOpen ? 2.5 : 0,
            }}
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen ? 3 : 0,
                justifyContent: 'center',
                width: desktopOpen ? 'auto' : '100%',
              }}
            >
              <LogOut />
            </ListItemIcon>
            <ListItemText
              primary={t('navbar.signOut')}
              sx={{
                opacity: desktopOpen ? 1 : 0,
                display: desktopOpen ? 'block' : 'none',
                '& .MuiListItemText-primary': { fontSize: '0.95rem' },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <LiveChat />
      <SubscriptionModal
        open={showSubscriptionModal}
        businessType={
          settings?.businessType?.toUpperCase() as BusinessType | undefined
        }
      />

      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? drawerWidth : collapsedDrawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          p: 3,
          width: {
            md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)`,
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {showTrialBanner && session?.user && (
          <TrialBanner
            trialEndsAt={(session as ExtendedSessionData).user.trialEndsAt!}
          />
        )}

        {children}
      </Box>
    </Box>
  );
};

export default Layout;
