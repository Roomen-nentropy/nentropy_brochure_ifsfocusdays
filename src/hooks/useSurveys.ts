import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import surveyApiService from '../services/surveyApiService';
import type {
  CreateSurveyInstanceRequest,
  CreateTemplateRequest,
  UpdateSurveyResponseRequest,
} from '../services/surveyApiService';
import type { SurveyTemplate, SurveyInstance } from '../types/survey.types';

export const surveyKeys = {
  all: ['surveys'] as const,
  templates: () => [...surveyKeys.all, 'templates'] as const,
  instances: () => [...surveyKeys.all, 'instances'] as const,
  instance: (id: string) => [...surveyKeys.instances(), id] as const,
  responses: (instanceId: string) =>
    [...surveyKeys.instance(instanceId), 'responses'] as const,
  publicSurvey: (token: string) =>
    [...surveyKeys.all, 'public', token] as const,
  latestBySupplier: (supplierId: string) =>
    [...surveyKeys.all, 'latest-by-supplier', supplierId] as const,
};

export const useTemplates = () => {
  return useQuery({
    queryKey: surveyKeys.templates(),
    queryFn: surveyApiService.getAllTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateRequest) =>
      surveyApiService.createTemplate(data),
    onSuccess: newTemplate => {
      queryClient.setQueryData<SurveyTemplate[]>(surveyKeys.templates(), old =>
        old ? [...old, newTemplate] : [newTemplate]
      );
    },
  });
};

export const useSurveyInstances = () => {
  return useQuery({
    queryKey: surveyKeys.instances(),
    queryFn: surveyApiService.getAllSurveyInstances,
    refetchInterval: 10000, // Auto-refresh every 10 seconds for real-time monitoring
  });
};

export const useLatestCompletedSurveyBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: surveyKeys.latestBySupplier(supplierId),
    queryFn: () =>
      surveyApiService.getLatestCompletedSurveyBySupplier(supplierId),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSurveyInstance = (id: string) => {
  return useQuery({
    queryKey: surveyKeys.instance(id),
    queryFn: () => surveyApiService.getSurveyInstance(id),
    enabled: !!id,
  });
};

export const useCreateSurveyInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyInstanceRequest) =>
      surveyApiService.createSurveyInstance(data),
    onSuccess: newInstance => {
      // Update instances cache
      queryClient.setQueryData<SurveyInstance[]>(surveyKeys.instances(), old =>
        old ? [...old, newInstance] : [newInstance]
      );
    },
  });
};

export const useUpdateSurveyInstanceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      surveyApiService.updateSurveyInstanceStatus(id, status),
    onSuccess: (updatedInstance, { id }) => {
      // Update specific instance cache
      queryClient.setQueryData<SurveyInstance>(
        surveyKeys.instance(id),
        updatedInstance
      );

      // Update instances list cache
      queryClient.setQueryData<SurveyInstance[]>(surveyKeys.instances(), old =>
        old
          ? old.map(instance =>
              instance.id === id ? updatedInstance : instance
            )
          : [updatedInstance]
      );
    },
  });
};

// ====== SURVEY RESPONSES ======

export const useSurveyResponses = (instanceId: string) => {
  return useQuery({
    queryKey: surveyKeys.responses(instanceId),
    queryFn: () => surveyApiService.getSurveyResponses(instanceId),
    enabled: !!instanceId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds for live updates
  });
};

export const useExportSurveyInstance = () => {
  return useMutation({
    mutationFn: (instanceId: string) =>
      surveyApiService.exportSurveyInstance(instanceId),
  });
};

// ====== PUBLIC SURVEY ======

export const usePublicSurvey = (token: string) => {
  return useQuery({
    queryKey: surveyKeys.publicSurvey(token),
    queryFn: () => surveyApiService.getPublicSurvey(token),
    enabled: !!token,
    retry: (failureCount: number, error: Error) => {
      // Don't retry if survey is not found or expired
      if (
        error?.message?.includes('not found') ||
        error?.message?.includes('expired')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateSurveyResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: UpdateSurveyResponseRequest;
    }) => surveyApiService.updateSurveyResponse(token, data),
    onSuccess: (updatedInstance, { token }) => {
      // Update the public survey cache with new completion percentage
      queryClient.setQueryData<SurveyInstance>(
        surveyKeys.publicSurvey(token),
        old => (old ? { ...old, ...updatedInstance } : updatedInstance)
      );
    },
  });
};

export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => surveyApiService.submitSurveyResponse(token),
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.publicSurvey(token),
      });

      queryClient.invalidateQueries({
        queryKey: surveyKeys.instances(),
      });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({
      token,
      questionId,
      file,
      entryFieldId,
      entryIndex,
    }: {
      token: string;
      questionId: string;
      file: File;
      entryFieldId?: string;
      entryIndex?: number;
    }) =>
      surveyApiService.uploadFile(
        token,
        questionId,
        file,
        entryFieldId,
        entryIndex
      ),
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ token, fileId }: { token: string; fileId: string }) =>
      surveyApiService.downloadFile(token, fileId),
  });
};

// ====== AUTO-SAVE HOOK ======

export const useAutoSave = (
  token: string,
  responses: UpdateSurveyResponseRequest['responses'],
  enabled: boolean = true,
  interval: number = 30000 // 30 seconds
) => {
  const updateResponseMutation = useUpdateSurveyResponse();

  React.useEffect(() => {
    if (!enabled || !token || Object.keys(responses).length === 0) return;

    const autoSaveInterval = setInterval(() => {
      updateResponseMutation.mutate({
        token,
        data: { responses, isFinal: false },
      });
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [token, responses, enabled, interval, updateResponseMutation]);

  return {
    isAutoSaving: updateResponseMutation.isPending,
    autoSaveError: updateResponseMutation.error,
    lastAutoSave: updateResponseMutation.data ? new Date() : null,
  };
};

// ====== OPTIMISTIC UPDATES HELPER ======

export const useOptimisticSurveyUpdate = () => {
  const queryClient = useQueryClient();

  const updateSurveyOptimistically = (
    token: string,
    updates: Partial<SurveyInstance>
  ) => {
    queryClient.setQueryData<SurveyInstance>(
      surveyKeys.publicSurvey(token),
      old => (old ? { ...old, ...updates } : old)
    );
  };

  return { updateSurveyOptimistically };
};
