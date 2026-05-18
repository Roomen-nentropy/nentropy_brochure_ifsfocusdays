import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#44628C', // Primary blue from landing page
      light: '#5a7aa3', // Lighter blue
      dark: '#354d6f', // Darker blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E08805', // Orange accent from landing page
      light: '#f59e0b', // Lighter orange
      dark: '#c67503', // Darker orange
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E08805', // Using orange for warnings
      light: '#f59e0b',
      dark: '#c67503',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb', // Background from landing page
      paper: alpha('#FFFFFF', 0.85),
    },
    text: {
      primary: '#2A2C33', // Dark text from landing page
      secondary: '#6b7280', // Muted text from landing page
    },
    divider: alpha('#e5e7eb', 0.6),
    grey: {
      50: '#f0f4f8', // Primary-50 from landing page
      100: '#f3f4f6', // Background-alt from landing page
      200: '#e5e7eb', // Border from landing page
      300: '#d9e2ec', // Primary-100 from landing page
      400: '#bcccdc', // Primary-200 from landing page
      500: '#6b7280', // Text-muted from landing page
      600: '#4b5563',
      700: '#374151',
      800: '#2A2C33', // Color-dark from landing page
      900: '#111827',
    },
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          '&.MuiDataGrid-panel': {
            backgroundColor: theme.palette.common.white,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          },
          '&.MuiDataGrid-columnsPanel': {
            backgroundColor: theme.palette.common.white,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          },
          '&.MuiDataGrid-filterPanel': {
            backgroundColor: theme.palette.common.white,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.9),
          border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
          transition: 'all 0.4s',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:focus-visible': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            outlineOffset: 2,
          },
        }),
        contained: ({ theme }) => ({
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.main,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 20%)`,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            transform: 'translateY(-1px)',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          '&:active': {
            transform: 'translateY(0px)',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
          },
          '&:disabled': {
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.6)} 0%, ${alpha(theme.palette.primary.light, 0.6)} 100%)`,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.5),
          backgroundColor: alpha(theme.palette.common.white, 0.7),
          border: '1.5px solid',
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.9),
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px',
            transform: 'translateY(-1px)',
            boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            transform: 'translateY(0px)',
          },
        }),
        text: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            transform: 'none',
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            transform: 'none',
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(theme.palette.common.white, 0.8),
            borderRadius: 8,
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: alpha(theme.palette.primary.main, 0.7),
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            },
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: alpha(theme.palette.common.white, 0.8),
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.7),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
        }),
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiInputLabel-root': {
            backgroundColor: 'transparent',
            '&.Mui-focused': {
              color: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiInputLabel-outlined': {
            backgroundColor: alpha(theme.palette.common.white, 0.9),
            paddingLeft: 4,
            paddingRight: 4,
            '&.MuiInputLabel-shrink': {
              backgroundColor: alpha(theme.palette.common.white, 0.95),
              paddingLeft: 8,
              paddingRight: 8,
            },
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.common.white,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 8,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          },
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.common.white,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.grey[800], 0.37)}`,
          borderRadius: 8,
        }),
      },
    },
    MuiList: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.common.white,
          padding: 4,
        }),
      },
    },
    MuiModal: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-columnsPanel': {
            backgroundColor: `${theme.palette.common.white} !important`,
          },
          '& .MuiDataGrid-filterPanel': {
            backgroundColor: `${theme.palette.common.white} !important`,
          },
          '& .MuiDataGrid-panel': {
            backgroundColor: `${theme.palette.common.white} !important`,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.grey[100], 0.9),
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.grey[700],
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[200], 0.9),
            },
            '&:active': {
              backgroundColor: alpha(theme.palette.grey[300], 0.9),
            },
          },
        }),
        colorPrimary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.15),
          color: theme.palette.primary.dark,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            '&:active': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
            },
          },
        }),
        colorSecondary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.secondary.main, 0.15),
          color: theme.palette.secondary.dark,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.25),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
            '&:active': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.3),
            },
          },
        }),
        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, 0.15),
          color: theme.palette.success.dark,
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.warning.main, 0.15),
          color: theme.palette.warning.dark,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
        }),
        colorError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.15),
          color: theme.palette.error.dark,
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        }),
        colorDefault: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.grey[500], 0.15),
          color: theme.palette.grey[700],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.common.white,
          border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
          boxShadow: `0 25px 50px ${alpha(theme.palette.grey[800], 0.4)}`,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          boxShadow: `0 4px 16px ${alpha(theme.palette.grey[800], 0.2)}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.common.white,
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
        }),
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.8),
          borderRadius: 12,
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: theme.palette.grey[700],
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
        }),
      },
    },
    MuiFab: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          boxShadow: `0 8px 32px ${alpha(theme.palette.grey[800], 0.37)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          '&:active': {
            transform: 'scale(1.05) translateY(0px)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:focus-visible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.8),
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          '&:before': {
            display: 'none',
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.7),
          borderRadius: 8,
          border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          minHeight: 48,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: 3,
            borderRadius: 3,
            bottom: 4,
          },
        }),
        flexContainer: {
          paddingLeft: 8,
          paddingRight: 8,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          minWidth: 120,
          color: theme.palette.text.secondary,
          borderRadius: 6,
          margin: '4px 2px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            transform: 'translateY(-1px)',
          },
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 600,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            outlineOffset: 2,
          },
        }),
      },
    },
  },
});
