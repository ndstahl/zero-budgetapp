import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ROADMAP_STEPS } from '../constants/roadmapSteps';

interface RoadmapProgressEntry {
  id: string;
  step_key: string;
  status: 'locked' | 'active' | 'completed';
  completed_at: string | null;
  notes: string | null;
}

export function useRoadmap() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['roadmap', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('roadmap_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');
      if (error) throw error;
      return (data ?? []) as RoadmapProgressEntry[];
    },
    enabled: !!userId,
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({
      stepKey,
      status,
      notes,
    }: {
      stepKey: string;
      status: 'locked' | 'active' | 'completed';
      notes?: string;
    }) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase.from('roadmap_progress').upsert(
        {
          user_id: userId,
          step_key: stepKey,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          notes: notes ?? null,
        },
        { onConflict: 'user_id,step_key' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  // Build combined steps with progress
  const steps = ROADMAP_STEPS.map((step) => {
    const entry = progress.find((p) => p.step_key === step.key);
    return {
      ...step,
      status: entry?.status ?? 'locked',
      completedAt: entry?.completed_at ?? null,
      notes: entry?.notes ?? null,
    };
  });

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const activeStep = steps.find((s) => s.status === 'active');
  const percentComplete = steps.length > 0 ? completedCount / steps.length : 0;

  return {
    steps,
    completedCount,
    activeStep,
    percentComplete,
    isLoading,
    updateStep: updateStepMutation.mutate,
  };
}
