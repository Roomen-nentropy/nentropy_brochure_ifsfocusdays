import { api } from '.';

export interface DashboardStats {
  suppliers: number;
  products: number;
  pendingAssessments: number;
  completedDDS: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface Deadline {
  id: string;
  task: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProgressData {
  overall: number;
  riskAssessments: number;
  ddsCompletion: number;
}

export interface DashboardData {
  stats: DashboardStats;
  progress: ProgressData;
  activities: ActivityItem[];
  deadlines: Deadline[];
}

class DashboardService {
  // Optimized: fetch all dashboard data in a single request
  async getAllDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/api/dashboard/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data, using fallback:', error);
      return {
        stats: {
          suppliers: 0,
          products: 0,
          pendingAssessments: 0,
          completedDDS: 0,
        },
        progress: {
          overall: 0,
          riskAssessments: 0,
          ddsCompletion: 0,
        },
        activities: [],
        deadlines: [],
      };
    }
  }

  // Legacy endpoints (kept for backward compatibility)
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats, using fallback:', error);

      return {
        suppliers: 0,
        products: 0,
        pendingAssessments: 0,
        completedDDS: 0,
      };
    }
  }

  async getProgressData(): Promise<ProgressData> {
    try {
      const response = await api.get('/api/dashboard/progress');
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching dashboard progress, using fallback:',
        error
      );
      return {
        overall: 0,
        riskAssessments: 0,
        ddsCompletion: 0,
      };
    }
  }

  async getRecentActivities(): Promise<{ activities: ActivityItem[] }> {
    try {
      const response = await api.get('/api/dashboard/activities');
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching dashboard activities, using fallback:',
        error
      );
      return { activities: [] };
    }
  }

  async getUpcomingDeadlines(): Promise<{ deadlines: Deadline[] }> {
    try {
      const response = await api.get('/api/dashboard/deadlines');
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching dashboard deadlines, using fallback:',
        error
      );
      return { deadlines: [] };
    }
  }
}

export const dashboardService = new DashboardService();
