import { z } from 'zod';
import { ProjectStatus } from './Project';

export const ProjectMetrics = z.object({
  totalTests: z.number(),
  passedTests: z.number(),
  failedTests: z.number(),
  averageTestDuration: z.number(),
  lastTestRun: z.date().nullable(),
  statusDurations: z.record(ProjectStatus, z.number()),
  testTrends: z.array(z.object({
    date: z.date(),
    passed: z.number(),
    failed: z.number(),
    duration: z.number()
  }))
});

export type ProjectMetrics = z.infer<typeof ProjectMetrics>;

export const ProjectAnalytics = z.object({
  projectId: z.string().uuid(),
  metrics: ProjectMetrics,
  updatedAt: z.date()
});

export type ProjectAnalytics = z.infer<typeof ProjectAnalytics>;

export function calculateStatusDuration(
  statusHistory: { from: ProjectStatus; to: ProjectStatus; timestamp: Date }[],
  currentStatus: ProjectStatus,
  currentTime: Date = new Date()
): Record<ProjectStatus, number> {
  const durations: Record<ProjectStatus, number> = {
    draft: 0,
    active: 0,
    paused: 0,
    completed: 0,
    archived: 0
  };

  if (statusHistory.length === 0) {
    return durations;
  }

  // Sort history by timestamp
  const sortedHistory = [...statusHistory].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Calculate durations between transitions
  for (let i = 0; i < sortedHistory.length; i++) {
    const current = sortedHistory[i];
    const next = sortedHistory[i + 1];
    const duration = next 
      ? next.timestamp.getTime() - current.timestamp.getTime()
      : currentTime.getTime() - current.timestamp.getTime();
    
    durations[current.to] += duration;
  }

  // Convert milliseconds to hours
  Object.keys(durations).forEach(status => {
    durations[status as ProjectStatus] = Math.round(durations[status as ProjectStatus] / (1000 * 60 * 60));
  });

  return durations;
} 