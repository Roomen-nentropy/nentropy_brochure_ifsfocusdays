import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { riskAssessmentApiService } from '../services/riskAssessmentApiService';
import type {
  RiskAssessment,
  CreateRiskAssessmentRequest,
  UpdateRiskAssessmentRequest,
  CreateVersionRequest,
} from '../types';

export const riskAssessmentKeys = {
  all: ['risk-assessments'] as const,
  lists: () => [...riskAssessmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...riskAssessmentKeys.lists(), { filters }] as const,
  details: () => [...riskAssessmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...riskAssessmentKeys.details(), id] as const,
  supplier: (supplierId: string) =>
    [...riskAssessmentKeys.all, 'supplier', supplierId] as const,
  prefill: (supplierId: string, type: string) =>
    [...riskAssessmentKeys.all, 'prefill', supplierId, type] as const,
  attachments: (id: string) =>
    [...riskAssessmentKeys.detail(id), 'attachments'] as const,
  surveyDocuments: (id: string) =>
    [...riskAssessmentKeys.detail(id), 'survey-documents'] as const,
  versions: (id: string) =>
    [...riskAssessmentKeys.detail(id), 'versions'] as const,
  versionComparison: (id: string, versionId: string) =>
    [...riskAssessmentKeys.detail(id), 'compare', versionId] as const,
};

// Get all risk assessments
export const useRiskAssessments = () => {
  return useQuery({
    queryKey: riskAssessmentKeys.list({}),
    queryFn: riskAssessmentApiService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get risk assessments by supplier
export const useRiskAssessmentsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: riskAssessmentKeys.supplier(supplierId),
    queryFn: () => riskAssessmentApiService.getBySupplier(supplierId),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRiskAssessment = (id: string) => {
  return useQuery({
    queryKey: riskAssessmentKeys.detail(id),
    queryFn: () => riskAssessmentApiService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRiskAssessmentPrefill = (
  supplierId: string,
  type: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER'
) => {
  return useQuery({
    queryKey: riskAssessmentKeys.prefill(supplierId, type),
    queryFn: () => riskAssessmentApiService.getPrefillData(supplierId, type),
    enabled: !!supplierId && !!type,
    staleTime: 10 * 60 * 1000,
  });
};

// Get attachments for a risk assessment
export const useRiskAssessmentAttachments = (id: string) => {
  return useQuery({
    queryKey: riskAssessmentKeys.attachments(id),
    queryFn: () => riskAssessmentApiService.getAttachments(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Get survey documents for a risk assessment
export const useSurveyDocuments = (id: string, enabled = true) => {
  return useQuery({
    queryKey: riskAssessmentKeys.surveyDocuments(id),
    queryFn: () => riskAssessmentApiService.getSurveyDocuments(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Create a new risk assessment
export const useCreateRiskAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRiskAssessmentRequest) =>
      riskAssessmentApiService.create(data),
    onSuccess: newAssessment => {
      // Invalidate and refetch risk assessments list
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });

      // Add the new assessment to supplier-specific cache
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.supplier(newAssessment.supplierId),
      });

      // Set the new assessment in detail cache
      queryClient.setQueryData(
        riskAssessmentKeys.detail(newAssessment.id),
        newAssessment
      );
    },
  });
};

// Update a risk assessment
export const useUpdateRiskAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRiskAssessmentRequest;
    }) => riskAssessmentApiService.update(id, data),
    onSuccess: updatedAssessment => {
      // Update the assessment in detail cache
      queryClient.setQueryData(
        riskAssessmentKeys.detail(updatedAssessment.id),
        updatedAssessment
      );

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.supplier(updatedAssessment.supplierId),
      });
    },
  });
};

// Delete a risk assessment
export const useDeleteRiskAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => riskAssessmentApiService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: riskAssessmentKeys.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.all });
    },
  });
};

// Calculate risk score
export const useCalculateRisk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => riskAssessmentApiService.calculateRisk(id),
    onSuccess: (riskData, id) => {
      // Update the risk assessment cache with new risk data
      queryClient.setQueryData(
        riskAssessmentKeys.detail(id),
        (old: RiskAssessment | undefined) => {
          if (!old) return old;
          return {
            ...old,
            overallRiskScore: riskData.riskScore,
            riskLevel: riskData.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
            riskBreakdown: riskData.riskBreakdown,
          };
        }
      );
    },
  });
};

// Update status (approve/reject)
export const useUpdateRiskAssessmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      comment?: string;
    }) => riskAssessmentApiService.updateStatus(id, status, comment),
    onSuccess: updatedAssessment => {
      queryClient.setQueryData(
        riskAssessmentKeys.detail(updatedAssessment.id),
        updatedAssessment
      );
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });
    },
  });
};

// Upload attachment
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      file,
      type,
      description,
    }: {
      id: string;
      file: File;
      type: string;
      description?: string;
    }) =>
      riskAssessmentApiService.uploadAttachment(id, file, type, description),
    onSuccess: (_, { id }) => {
      // Invalidate attachments cache
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.attachments(id),
      });

      // Invalidate the assessment detail to refresh attachment count
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.detail(id),
      });
    },
  });
};

// Delete attachment
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) =>
      riskAssessmentApiService.deleteAttachment(id, attachmentId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.attachments(id),
      });
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.detail(id),
      });
    },
  });
};

// Export PDF
export const useExportPDF = () => {
  return useMutation({
    mutationFn: (id: string) => riskAssessmentApiService.exportPDF(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-assessment-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Export JSON
export const useExportJSON = () => {
  return useMutation({
    mutationFn: (id: string) => riskAssessmentApiService.exportJSON(id),
    onSuccess: (data, id) => {
      // Create download link for JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-assessment-${id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// ===== VERSION MANAGEMENT HOOKS =====

// Get version history
export const useVersionHistory = (id: string) => {
  return useQuery({
    queryKey: riskAssessmentKeys.versions(id),
    queryFn: () => riskAssessmentApiService.getVersionHistory(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create new version
export const useCreateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateVersionRequest }) =>
      riskAssessmentApiService.createVersion(id, data),
    onSuccess: (newVersion, { id }) => {
      // Invalidate version history
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.versions(id),
      });

      // Invalidate the main assessment list
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });

      // Invalidate supplier assessments
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.supplier(newVersion.supplierId),
      });

      // Set the new version in detail cache
      queryClient.setQueryData(
        riskAssessmentKeys.detail(newVersion.id),
        newVersion
      );
    },
  });
};

// Compare versions
export const useCompareVersions = (id: string, versionId: string) => {
  return useQuery({
    queryKey: riskAssessmentKeys.versionComparison(id, versionId),
    queryFn: () => riskAssessmentApiService.compareVersions(id, versionId),
    enabled: !!id && !!versionId,
    staleTime: 5 * 60 * 1000, // 5 minutes (comparisons don't change)
  });
};

// Restore version
export const useRestoreVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      versionId,
      versionNotes,
    }: {
      id: string;
      versionId: string;
      versionNotes: string;
    }) => riskAssessmentApiService.restoreVersion(id, versionId, versionNotes),
    onSuccess: (restoredVersion, { id }) => {
      // Invalidate version history
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.versions(id),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: riskAssessmentKeys.lists() });

      // Invalidate supplier assessments
      queryClient.invalidateQueries({
        queryKey: riskAssessmentKeys.supplier(restoredVersion.supplierId),
      });

      // Set the restored version in detail cache
      queryClient.setQueryData(
        riskAssessmentKeys.detail(restoredVersion.id),
        restoredVersion
      );
    },
  });
};
