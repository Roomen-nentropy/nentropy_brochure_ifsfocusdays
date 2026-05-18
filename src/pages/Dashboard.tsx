import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Building2,
  Package,
  Shield,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  dashboardService,
  type DashboardStats,
  type ActivityItem,
  type Deadline,
  type ProgressData,
} from '../services/dashboardService';
import DashboardSkeleton from '../components/SkeletonLoader/DashboardSkeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': onClick
          ? {
              elevation: 4,
              transform: 'translateY(-2px)',
            }
          : {},
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box color={`${color}.main`}>{icon}</Box>
            {onClick && (
              <ChevronRight
                style={{
                  color: theme.palette.action.disabled,
                  transition: 'color 0.2s ease-in-out',
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();
  const theme = useTheme();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigateToSuppliers = () => navigate('/suppliers');
  const handleNavigateToProducts = () => navigate('/products');
  const handleNavigateToSurveys = () => navigate('/surveys');
  const handleNavigateToDDS = () => navigate('/dds');

  const handleActivityClick = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'success':
        navigate('/surveys');
        break;
      case 'info':
        navigate('/surveys');
        break;
      case 'warning':
        navigate('/risk-assessments');
        break;
      default:
        navigate('/surveys');
    }
  };

  const handleDeadlineClick = (deadline: Deadline) => {
    if (deadline.task.toLowerCase().includes('survey')) {
      navigate('/surveys');
    } else if (
      deadline.task.toLowerCase().includes('eudr') ||
      deadline.task.toLowerCase().includes('compliance')
    ) {
      navigate('/dds');
    } else {
      navigate('/surveys');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dashboardService.getAllDashboardData();

        setStats(data.stats);
        setProgressData(data.progress);
        setRecentActivities(data.activities || []);
        setUpcomingDeadlines(data.deadlines || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data'
        );

        // Fallback
        setStats({
          suppliers: 0,
          products: 0,
          pendingAssessments: 0,
          completedDDS: 0,
        });
        setProgressData({
          overall: 0,
          riskAssessments: 0,
          ddsCompletion: 0,
        });
        setRecentActivities([]);
        setUpcomingDeadlines([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!stats || !progressData) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('dashboard:messages.noDashboardData')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={3}
        sx={{ mb: 4 }}
      >
        <StatCard
          title={t('dashboard:statistics.totalSuppliers')}
          value={stats.suppliers}
          icon={<Building2 size={32} />}
          color="primary"
          onClick={handleNavigateToSuppliers}
        />
        <StatCard
          title={t('dashboard:statistics.totalProducts')}
          value={stats.products}
          icon={<Package size={32} />}
          color="secondary"
          onClick={handleNavigateToProducts}
        />
        <StatCard
          title={t('dashboard:statistics.pendingAssessments')}
          value={stats.pendingAssessments}
          icon={<Shield size={32} />}
          color="warning"
          onClick={handleNavigateToSurveys}
        />
        <StatCard
          title={t('dashboard:statistics.completedDds')}
          value={stats.completedDDS}
          icon={<FileSpreadsheet size={32} />}
          color="success"
          onClick={handleNavigateToDDS}
        />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
        gap={3}
        sx={{ mb: 3 }}
      >
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('dashboard:progress.title')}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('dashboard:progress.overall')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressData.overall}
              sx={{ height: 8, borderRadius: 4, mt: 1 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {t('dashboard:progress.suppliersCompliant', {
                percentage: progressData.overall,
                count: stats.suppliers,
              })}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {t('dashboard:progress.riskAssessments')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressData.riskAssessments}
              color="warning"
              sx={{ height: 8, borderRadius: 4, mt: 1 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {t('dashboard:progress.suppliersAssessed', {
                percentage: progressData.riskAssessments,
              })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              {t('dashboard:progress.ddsCompletion')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressData.ddsCompletion}
              color="info"
              sx={{ height: 8, borderRadius: 4, mt: 1 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {t('dashboard:progress.formsCompleted', {
                percentage: progressData.ddsCompletion,
              })}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('dashboard:recentActivity.title')}
          </Typography>
          <Box>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <Box
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    borderRadius: 1,
                    p: 1,
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2">{activity.action}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {activity.timestamp}
                    </Typography>
                  </Box>
                  <ChevronRight
                    style={{
                      color: theme.palette.action.disabled,
                      fontSize: '1rem',
                      transition: 'color 0.2s ease-in-out',
                    }}
                  />
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                {t('dashboard:messages.noRecentActivities')}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard:upcomingDeadlines.title')}
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
          gap={2}
        >
          {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map(deadline => (
              <Card
                variant="outlined"
                key={deadline.id}
                onClick={() => handleDeadlineClick(deadline)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 2,
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    {deadline.task}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      {t('dashboard:messages.due', {
                        date: new Date(deadline.deadline).toLocaleDateString(),
                      })}
                    </Typography>
                    <Chip
                      label={t(`dashboard:priority.${deadline.priority}`)}
                      color={deadline.priority === 'high' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              {t('dashboard:messages.noUpcomingDeadlines')}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
