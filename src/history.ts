import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'
import dayjs from 'dayjs'

// Types for our history entries
export interface TestSummary {
  total: number
  passed: number
  failed: number
  duration: number
}

export interface HistoryEntry {
  runId: string
  timestamp: string
  testFiles: string[]
  status: 'passed' | 'failed' | 'error'
  summary: TestSummary
  output: string
}

interface DbSchema {
  history: HistoryEntry[]
}

// Initialize database
const dbFile = path.join(process.cwd(), 'history.json')
const adapter = new JSONFile<DbSchema>(dbFile)
const db = new Low(adapter, { history: [] }) as Low<DbSchema>

// Maximum number of history entries to keep
const MAX_HISTORY_ENTRIES = 100

// Initialize the database if it doesn't exist
export async function initializeHistory(): Promise<void> {
  await db.read()
  if (!db.data) {
    db.data = { history: [] }
    await db.write()
  }
}

// Add a new history entry
export async function addHistoryEntry(entry: Omit<HistoryEntry, 'runId' | 'timestamp'>): Promise<HistoryEntry> {
  await db.read()
  
  const newEntry: HistoryEntry = {
    ...entry,
    runId: uuidv4(),
    timestamp: dayjs().toISOString()
  }

  db.data.history.unshift(newEntry)
  
  // Keep only the latest MAX_HISTORY_ENTRIES
  if (db.data.history.length > MAX_HISTORY_ENTRIES) {
    db.data.history = db.data.history.slice(0, MAX_HISTORY_ENTRIES)
  }
  
  await db.write()
  return newEntry
}

// Get all history entries
export async function getHistory(limit?: number, offset?: number): Promise<HistoryEntry[]> {
  await db.read()
  
  let entries = db.data.history
  
  if (offset !== undefined) {
    entries = entries.slice(offset)
  }
  
  if (limit !== undefined) {
    entries = entries.slice(0, limit)
  }
  
  return entries
}

// Get a specific history entry by runId
export async function getHistoryEntry(runId: string): Promise<HistoryEntry | null> {
  await db.read()
  return db.data.history.find((entry: HistoryEntry) => entry.runId === runId) || null
}

// Clear all history
export async function clearHistory(): Promise<void> {
  db.data.history = []
  await db.write()
}

// Delete a specific history entry
export async function deleteHistoryEntry(runId: string): Promise<boolean> {
  await db.read()
  const initialLength = db.data.history.length
  db.data.history = db.data.history.filter((entry: HistoryEntry) => entry.runId !== runId)
  
  if (db.data.history.length === initialLength) {
    return false
  }
  
  await db.write()
  return true
} 