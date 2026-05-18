import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { CompanySettings } from '../types';
import { companySettingsApi } from '../services/companySettingsService';
import { useSession } from '../lib/auth';

interface SettingsContextType {
  settings: Partial<CompanySettings> | null;
  updateSettings: (settings: Partial<CompanySettings>) => Promise<void>;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export { SettingsContext };

const defaultSettings: Partial<CompanySettings> = {
  id: undefined,
  companyName: '',
  registrationNumber: '',
  vatNumber: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
  contactInfo: {
    email: '',
    phone: '',
    website: '',
  },
  legalRepresentative: {
    name: '',
    position: '',
    email: '',
    phone: '',
  },
  businessType: 'TRADER',
  defaultRiskLevel: 'medium',
  certifications: [],
  operatingCountries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending: isAuthPending } = useSession();
  const [settings, setSettings] = useState<Partial<CompanySettings> | null>(
    defaultSettings
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!session) {
      setSettings(defaultSettings);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await companySettingsApi.getSettings();
      setSettings(data || defaultSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isAuthPending) {
      return;
    }

    loadSettings();
  }, [loadSettings, isAuthPending]);

  const updateSettings = async (updatedSettings: Partial<CompanySettings>) => {
    if (!settings) return;

    try {
      setIsUpdating(true);
      setError(null);

      let updatedData: CompanySettings;

      if (!settings.id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...createData } = {
          ...settings,
          ...updatedSettings,
        };
        updatedData = await companySettingsApi.createSettings(
          createData as CompanySettings
        );
      } else {
        updatedData = await companySettingsApi.updateSettings(updatedSettings);
      }

      setSettings(updatedData);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to save settings');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const refetchSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isLoading,
        isUpdating,
        error,
        refetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
