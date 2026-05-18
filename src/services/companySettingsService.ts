import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { CompanySettings } from '../types';
import { api } from '.';

class CompanySettingsApiService {
  async getSettings(): Promise<CompanySettings | null> {
    try {
      const response: AxiosResponse<CompanySettings> = await api.get(
        '/api/company-settings'
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No settings found
      }
      console.error('Error fetching company settings:', error);
      throw error;
    }
  }

  async createSettings(
    settings: Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CompanySettings> {
    try {
      const response: AxiosResponse<CompanySettings> = await api.post(
        '/api/company-settings',
        settings
      );
      return response.data;
    } catch (error) {
      console.error('Error creating company settings:', error);
      throw error;
    }
  }

  async updateSettings(
    settings: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    try {
      // Remove fields that shouldn't be updated via API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...updateData } = settings;

      const response: AxiosResponse<CompanySettings> = await api.put(
        '/api/company-settings',
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  }

  async deleteSettings(): Promise<void> {
    try {
      await api.delete('/api/company-settings');
    } catch (error) {
      console.error('Error deleting company settings:', error);
      throw error;
    }
  }
}

export const companySettingsApi = new CompanySettingsApiService();
