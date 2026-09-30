/**
 * ------------------------------------------------------------------
 * SPENANCE — Automated Recurring Transactions Engine
 * Manages recurring income (salary), bills (rent, wifi, electricity),
 * subscriptions (Netflix), and loan EMI auto-debits.
 * ------------------------------------------------------------------
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../config/firebase'

const RECURRING_LOCAL_STORAGE = 'spenance.recurring.v1'

/**
 * Calculates the next due date based on frequency and day of month.
 */
export function calculateNextDueDate(dayOfMonth = 1, frequency = 'monthly', fromDate = new Date()) {
  const next = new Date(fromDate)

  if (frequency === 'monthly') {
    // If today is past the day of this month, move to next month
    if (next.getDate() >= dayOfMonth) {
      next.setMonth(next.getMonth() + 1)
    }
    next.setDate(Math.min(dayOfMonth, getDaysInMonth(next.getFullYear(), next.getMonth())))
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (frequency === 'yearly') {
    next.setFullYear(next.getFullYear() + 1)
  }

  return next.toISOString().slice(0, 10)
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Retrieves recurring rules from local storage.
 */
export function getLocalRecurringRules() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECURRING_LOCAL_STORAGE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves recurring rules to local storage.
 */
export function saveLocalRecurringRules(rules) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RECURRING_LOCAL_STORAGE, JSON.stringify(rules))
  } catch (err) {
    console.warn('Could not save recurring rules to localStorage:', err)
  }
}

/**
 * Subscribes to real-time recurring rules from Firestore or local storage.
 */
export function subscribeToRecurringRules(uid, onUpdate) {
  if (!isFirebaseConfigured || !db || !uid) {
    onUpdate(getLocalRecurringRules())
    return () => {}
  }

  const colRef = collection(db, 'users', uid, 'recurring')
  return onSnapshot(
    colRef,
    (snap) => {
      const rules = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      saveLocalRecurringRules(rules)
      onUpdate(rules)
    },
    (err) => {
      console.warn('Recurring rules listener error:', err)
      onUpdate(getLocalRecurringRules())
    },
  )
}

/**
 * Adds a new recurring rule.
 */
export async function addRecurringRule(uid, rule) {
  const id = rule.id || `rec-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  const record = {
    ...rule,
    id,
    active: rule.active !== false,
    nextRunDate:
      rule.nextRunDate ||
      calculateNextDueDate(Number(rule.dayOfMonth) || 1, rule.frequency || 'monthly'),
    lastRunDate: rule.lastRunDate || null,
    createdAt: new Date().toISOString(),
  }

  // Save to local storage
  const current = getLocalRecurringRules()
  saveLocalRecurringRules([record, ...current])

  // Save to Firestore if connected
  if (isFirebaseConfigured && db && uid) {
    const docRef = doc(db, 'users', uid, 'recurring', id)
    await setDoc(docRef, { ...record, createdAt: serverTimestamp() })
  }

  return record
}

/**
 * Updates an existing recurring rule.
 */
export async function updateRecurringRule(uid, ruleId, patch) {
  const current = getLocalRecurringRules()
  const updated = current.map((r) => (r.id === ruleId ? { ...r, ...patch } : r))
  saveLocalRecurringRules(updated)

  if (isFirebaseConfigured && db && uid) {
    const docRef = doc(db, 'users', uid, 'recurring', ruleId)
    await updateDoc(docRef, patch)
  }
}

/**
 * Deletes a recurring rule.
 */
export async function deleteRecurringRule(uid, ruleId) {
  const current = getLocalRecurringRules()
  const filtered = current.filter((r) => r.id !== ruleId)
  saveLocalRecurringRules(filtered)

  if (isFirebaseConfigured && db && uid) {
    const docRef = doc(db, 'users', uid, 'recurring', ruleId)
    await deleteDoc(docRef)
  }
}

/**
 * Processes overdue recurring rules.
 * Generates transactions for any rule where today >= nextRunDate.
 * Returns { transactionsToCreate, updatedRules }.
 */
export function evaluateDueRecurringRules(rules = [], todayStr = new Date().toISOString().slice(0, 10)) {
  const transactionsToCreate = []
  const updatedRules = []

  for (const rule of rules) {
    if (!rule.active) continue

    let nextRun = rule.nextRunDate
    if (!nextRun) {
      nextRun = calculateNextDueDate(Number(rule.dayOfMonth) || 1, rule.frequency || 'monthly')
    }

    // Check if nextRun is today or in the past
    if (nextRun <= todayStr) {
      // Create transaction record
      const txn = {
        id: `auto-rec-${rule.id}-${nextRun}`,
        date: nextRun,
        description: rule.title,
        amount: Number(rule.amount) || 0,
        category: rule.category || (Number(rule.amount) > 0 ? 'Salary' : 'Utilities'),
        method: rule.method || 'Auto-Debit',
        note: `Automated recurring: ${rule.frequency || 'monthly'} schedule`,
      }
      transactionsToCreate.push(txn)

      // Advance nextRunDate
      const nextDateObj = new Date(nextRun)
      if (rule.frequency === 'weekly') {
        nextDateObj.setDate(nextDateObj.getDate() + 7)
      } else if (rule.frequency === 'yearly') {
        nextDateObj.setFullYear(nextDateObj.getFullYear() + 1)
      } else {
        // monthly
        nextDateObj.setMonth(nextDateObj.getMonth() + 1)
        const targetDay = Number(rule.dayOfMonth) || 1
        nextDateObj.setDate(Math.min(targetDay, getDaysInMonth(nextDateObj.getFullYear(), nextDateObj.getMonth())))
      }

      updatedRules.push({
        ...rule,
        lastRunDate: nextRun,
        nextRunDate: nextDateObj.toISOString().slice(0, 10),
      })
    }
  }

  return { transactionsToCreate, updatedRules }
}
