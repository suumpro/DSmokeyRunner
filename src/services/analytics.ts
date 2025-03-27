import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as path from 'path';
import { ProjectAnalytics, ProjectMetrics, calculateStatusDuration } from '../types/Analytics';
import { Project } from '../types/Project';

interface AnalyticsDbSchema {
  analytics: ProjectAnalytics[];
}

let db: Low<AnalyticsDbSchema>;

// Initialize analytics database
function initDb() {
  const dbFile = process.env.ANALYTICS_DB_FILE || path.join(process.cwd(), 'analytics.json');
  const adapter = new JSONFile<AnalyticsDbSchema>(dbFile);
  db = new Low<AnalyticsDbSchema>(adapter, { analytics: [] });
}

// Initialize the database on module load
initDb();

export async function initializeAnalytics(): Promise<void> {
  initDb();
  await db.read();
  if (!db.data) {
    db.data = { analytics: [] };
    await db.write();
  }
}

export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
  await db.read();
  return db.data.analytics.find(a => a.projectId === projectId) || null;
}

export async function updateProjectAnalytics(project: Project): Promise<ProjectAnalytics> {
  await db.read();

  const metrics: ProjectMetrics = {
    totalTests: project.testFiles.length,
    passedTests: 0, // To be updated with actual test results
    failedTests: 0, // To be updated with actual test results
    averageTestDuration: 0, // To be calculated from test history
    lastTestRun: null, // To be updated with actual test results
    statusDurations: calculateStatusDuration(project.statusHistory, project.status),
    testTrends: [] // To be populated with actual test trends
  };

  const analytics: ProjectAnalytics = {
    projectId: project.id,
    metrics,
    updatedAt: new Date()
  };

  const index = db.data.analytics.findIndex(a => a.projectId === project.id);
  if (index !== -1) {
    db.data.analytics[index] = analytics;
  } else {
    db.data.analytics.push(analytics);
  }

  await db.write();
  return analytics;
}

export async function deleteProjectAnalytics(projectId: string): Promise<boolean> {
  await db.read();
  const initialLength = db.data.analytics.length;
  db.data.analytics = db.data.analytics.filter(a => a.projectId !== projectId);
  
  if (db.data.analytics.length === initialLength) {
    return false;
  }
  
  await db.write();
  return true;
} 