import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase'
import {
  DEFAULT_BUDGETS,
  DEMO_USER,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData'

/* ------------------------------------------------------------------ */
/* Auth Services                                                      */
/* ------------------------------------------------------------------ */

export function onAuthChange(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function registerWithEmail(email, password, name) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured in .env file.')
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  if (name) {
    await updateAuthProfile(user, { displayName: name })
  }

  // Initialize their Firestore database with default Spenance state
  await seedUserData(user.uid, {
    name: name || email.split('@')[0],
    email: user.email,
  })

  return user
}

export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured in .env file.')
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase Google Auth is not configured.')
  }
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)
    const user = userCredential.user

    // Check if profile exists, if not seed initial data
    if (db) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        await seedUserData(user.uid, {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
        })
      }
    }

    return user
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      // Automatic fallback to redirect if popup blocker prevented the popup
      await signInWithRedirect(auth, googleProvider)
      return null
    }
    throw error
  }
}

export async function checkRedirectAuth() {
  if (!isFirebaseConfigured || !auth) return null
  try {
    const result = await getRedirectResult(auth)
    if (result && result.user) {
      const user = result.user
      if (db) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
          await seedUserData(user.uid, {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
          })
        }
      }
      return user
    }
  } catch (err) {
    console.warn('Redirect auth check failed:', err)
  }
  return null
}

export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) return
  await signOut(auth)
}

export async function sendResetPassword(email) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured.')
  }
  await sendPasswordResetEmail(auth, email)
}

/* ------------------------------------------------------------------ */
/* Firestore Database Services                                        */
/* ------------------------------------------------------------------ */

/**
 * Seeds a new user with default template data (profile, budgets, loans, transactions)
 */
export async function seedUserData(uid, initialProfile = {}) {
  if (!isFirebaseConfigured || !db) return

  const userRef = doc(db, 'users', uid)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) return

  const batch = writeBatch(db)

  // 1. Profile & Budgets
  const profile = {
    ...DEMO_USER,
    name: initialProfile.name || DEMO_USER.name,
    email: initialProfile.email || DEMO_USER.email,
    firstName: (initialProfile.name || DEMO_USER.name).split(' ')[0],
    initials: (initialProfile.name || DEMO_USER.name)
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
    memberSince: new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    createdAt: serverTimestamp(),
  }

  batch.set(userRef, {
    profile,
    budgets: DEFAULT_BUDGETS,
    notifications: INITIAL_NOTIFICATIONS,
    theme: 'light',
  })

  await batch.commit()
}

/**
 * Automatically purges any legacy mock data from Firestore for this user account.
 */
export async function purgeUserMockDataFromFirestore(uid) {
  if (!isFirebaseConfigured || !db || !uid) return
  try {
    const txnsSnap = await getDocs(collection(db, 'users', uid, 'transactions'))
    const mockTxnIds = new Set(
      Array.from({ length: 30 }, (_, i) => `txn-${String(i + 1).padStart(2, '0')}`)
    )
    for (const d of txnsSnap.docs) {
      if (mockTxnIds.has(d.id)) {
        await deleteDoc(d.ref)
      }
    }

    const loansSnap = await getDocs(collection(db, 'users', uid, 'loans'))
    const mockLoanIds = new Set(['loan-edu', 'loan-personal'])
    for (const d of loansSnap.docs) {
      if (mockLoanIds.has(d.id)) {
        await deleteDoc(d.ref)
      }
    }

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const data = userSnap.data()
      const updates = {}
      if (data.profile?.monthlyIncome === 45000 || data.profile?.name === 'Rahul Sharma') {
        updates['profile.monthlyIncome'] = 0
        updates['profile.emergencyFund'] = 0
        updates['profile.debtToIncome'] = 0
      }
      if (data.budgets?.Food === 8000) {
        updates['budgets'] = DEFAULT_BUDGETS
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates)
      }
    }
  } catch (err) {
    console.warn('Error purging legacy mock data from Firestore:', err)
  }
}

/**
 * Resets all user data in Firestore to clean zero state.
 */
export async function resetAllUserDataFirestore(uid) {
  if (!isFirebaseConfigured || !db || !uid) return
  try {
    const txnsSnap = await getDocs(collection(db, 'users', uid, 'transactions'))
    for (const d of txnsSnap.docs) {
      await deleteDoc(d.ref)
    }
    const loansSnap = await getDocs(collection(db, 'users', uid, 'loans'))
    for (const d of loansSnap.docs) {
      await deleteDoc(d.ref)
    }
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      budgets: DEFAULT_BUDGETS,
      'profile.monthlyIncome': 0,
      'profile.emergencyFund': 0,
      'profile.debtToIncome': 0,
    })
  } catch (err) {
    console.error('Error resetting user data in Firestore:', err)
  }
}

/**
 * Real-time listener for user document (profile, budgets), transactions, and loans.
 */
export function subscribeToUserData(uid, callbacks) {
  if (!isFirebaseConfigured || !db || !uid) return () => {}

  // Automatically purge any old mock data from previous sessions
  purgeUserMockDataFromFirestore(uid).catch(console.error)

  const unsubs = []

  // 1. Listen to user doc (profile, budgets, settings)
  const userRef = doc(db, 'users', uid)
  const userUnsub = onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (callbacks.onUserData) callbacks.onUserData(data)
      } else {
        // Doc doesn't exist yet, seed it
        seedUserData(uid).catch(console.error)
      }
    },
    (err) => console.warn('Firestore user listener error:', err)
  )
  unsubs.push(userUnsub)

  // 2. Listen to transactions collection
  const txnsQuery = query(
    collection(db, 'users', uid, 'transactions'),
    orderBy('date', 'desc')
  )
  const txnsUnsub = onSnapshot(
    txnsQuery,
    (snap) => {
      const transactions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (callbacks.onTransactions) callbacks.onTransactions(transactions)
    },
    (err) => console.warn('Firestore transactions listener error:', err)
  )
  unsubs.push(txnsUnsub)

  // 3. Listen to loans collection
  const loansRef = collection(db, 'users', uid, 'loans')
  const loansUnsub = onSnapshot(
    loansRef,
    (snap) => {
      const loans = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (callbacks.onLoans) callbacks.onLoans(loans)
    },
    (err) => console.warn('Firestore loans listener error:', err)
  )
  unsubs.push(loansUnsub)

  return () => {
    unsubs.forEach((unsub) => unsub && unsub())
  }
}

/* ------------------------------------------------------------------ */
/* Data Mutations                                                     */
/* ------------------------------------------------------------------ */

export async function addTransactionFirestore(uid, txn) {
  if (!isFirebaseConfigured || !db || !uid) return txn
  const id = txn.id || `txn-${Date.now()}`
  const ref = doc(db, 'users', uid, 'transactions', id)
  const payload = {
    ...txn,
    id,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, payload)
  return payload
}

/**
 * Batch-writes multiple imported transactions to Firestore using writeBatch chunks.
 */
export async function batchAddTransactionsFirestore(uid, txns) {
  if (!isFirebaseConfigured || !db || !uid || !Array.isArray(txns) || txns.length === 0) return txns
  const chunkSize = 400
  for (let i = 0; i < txns.length; i += chunkSize) {
    const chunk = txns.slice(i, i + chunkSize)
    const batch = writeBatch(db)
    for (const txn of chunk) {
      const id = txn.id || `txn-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
      const ref = doc(db, 'users', uid, 'transactions', id)
      batch.set(ref, {
        ...txn,
        id,
        createdAt: serverTimestamp(),
      })
    }
    await batch.commit()
  }
  return txns
}

export async function deleteTransactionFirestore(uid, txnId) {
  if (!isFirebaseConfigured || !db || !uid) return
  await deleteDoc(doc(db, 'users', uid, 'transactions', txnId))
}

export async function updateTransactionFirestore(uid, txnId, patch) {
  if (!isFirebaseConfigured || !db || !uid) return
  await updateDoc(doc(db, 'users', uid, 'transactions', txnId), patch)
}

export async function batchDeleteTransactionsFirestore(uid, txnIds) {
  if (!isFirebaseConfigured || !db || !uid || !Array.isArray(txnIds) || txnIds.length === 0) return
  const chunkSize = 400
  for (let i = 0; i < txnIds.length; i += chunkSize) {
    const chunk = txnIds.slice(i, i + chunkSize)
    const batch = writeBatch(db)
    for (const id of chunk) {
      batch.delete(doc(db, 'users', uid, 'transactions', id))
    }
    await batch.commit()
  }
}

export async function updateBudgetsFirestore(uid, nextBudgets) {
  if (!isFirebaseConfigured || !db || !uid) return
  await updateDoc(doc(db, 'users', uid), { budgets: nextBudgets })
}

export async function addLoanFirestore(uid, loan) {
  if (!isFirebaseConfigured || !db || !uid) return loan
  const id = loan.id || `loan-${Date.now()}`
  const ref = doc(db, 'users', uid, 'loans', id)
  const payload = { ...loan, id, createdAt: serverTimestamp() }
  await setDoc(ref, payload)
  return payload
}

export async function updateLoanFirestore(uid, loanId, patch) {
  if (!isFirebaseConfigured || !db || !uid) return
  await updateDoc(doc(db, 'users', uid, 'loans', loanId), patch)
}

export async function deleteLoanFirestore(uid, loanId) {
  if (!isFirebaseConfigured || !db || !uid) return
  await deleteDoc(doc(db, 'users', uid, 'loans', loanId))
}

export async function updateProfileFirestore(uid, patch) {
  if (!isFirebaseConfigured || !db || !uid) return
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const existing = snap.data().profile || {}
    await updateDoc(userRef, { profile: { ...existing, ...patch } })
  }
}
