# Remaining Migration Tasks

## Components That Need Update

### 1. Admin Dashboard (`src/app/dashboard/admin/page.tsx`)
**Current Status**: ❌ Uses Firestore  
**Lines**: 29-30, 56-68, 104-200+  

**What to replace**:
- `useFirestore()` → Remove
- `useCollection()` → Use `useUsers()` and `useActivities()`
- `collection()`, `doc()` → API endpoints
- `setDoc()` for status → `useUpdateUser()`
- `deleteDoc()` → `useDeleteUser()`
- `writeBatch()` for bulk import → Loop with POST requests
- `getDocs()` → `useActivities()` with filters

**Key sections**:
- Line 56: `const firestore = useFirestore();` → Remove
- Line 59-60: Users collection query → Use `useUsers()`
- Line 66-67: Activity log query → Use `useActivities()`
- Line 104-110: Status change handler → Use `useUpdateUser()`
- Line 200-220: Delete handler → Use `useDeleteUser()`
- Line 225-280: Import handler → Use fetch or `useCreateConsumer()`

---

### 2. Letter Generator (`src/components/letter-generator.tsx`)
**Current Status**: ❌ Uses Firestore  
**Lines**: 5-7, 52-100, 130-180+  

**What to replace**:
- `useFirestore()` → Remove
- `doc()`, `getDoc()` → `useConsumer()`
- `collection()`, `addDoc()` → `useCreateActivity()`
- `query()`, `where()`, `getDocs()` → `useActivities()`
- `deleteDoc()` → `useDeleteActivity()`

**Key sections**:
- Line 17: `const firestore = useFirestore();` → Remove
- Line 52-100: Account number lookup → Use `useConsumer()`
- Line 130-180: Duplicate check → Use `useActivities()` to fetch existing
- Line 200-220: Save activity → Use `useCreateActivity()`
- Line 240-260: Delete activity → Use `useDeleteActivity()`

---

### 3. User Activity Log (`src/components/user-activity-log.tsx`)
**Current Status**: ❌ Uses Firestore  

**What to replace**:
- `useFirestore()` → Remove
- `useCollection()` → Use `useActivities()`
- `collection()`, `query()`, `where()` → Filter in hook
- `deleteDoc()` → `useDeleteActivity()`

---

### 4. Login Form (`src/components/login-form.tsx`)
**Current Status**: ⚠️ Partially Updated  

**What to do**:
- Already fetches user from SQLite
- Verify it's working with new API
- May need minor adjustments

---

## Migration Template

Use this template for updating each component:

```typescript
// ❌ REMOVE
import { useFirestore, useCollection } from "@/firebase";
import { 
  collection, query, where, orderBy, limit,
  addDoc, setDoc, deleteDoc, getDocs, doc, getDoc
} from "firebase/firestore";

// ✅ ADD
import {
  useUsers,
  useActivities,
  useConsumer,
  useCreateActivity,
  useUpdateUser,
  useDeleteActivity,
  useDeleteUser
} from "@/hooks/use-database";

// ❌ BEFORE
const firestore = useFirestore();
const usersQuery = query(collection(firestore, 'users'), where('status', '==', 'active'));
const { data: users } = useCollection(usersQuery);

// ✅ AFTER
const { data: users, isLoading } = useUsers();
// Filter in component if needed:
const activeUsers = users?.filter(u => u.status === 'active');
```

---

## Detailed Update Guide by Component

### Admin Dashboard - Specific Changes

**Change 1**: Remove Firestore initialization
```typescript
// Line 56 - DELETE THIS:
const firestore = useFirestore();

// No replacement needed, use hooks instead
```

**Change 2**: Replace users query
```typescript
// BEFORE (Lines 57-61):
const usersQuery = useMemoFirebase(() => {
  if (!firestore || !user) return null;
  return collection(firestore, 'users');
}, [firestore, user]);
const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

// AFTER:
const { data: users, isLoading: usersLoading } = useUsers();
```

**Change 3**: Replace activities query
```typescript
// BEFORE (Lines 65-68):
const activityLogQuery = useMemoFirebase(() => {
  if (!firestore || !user) return null;
  return query(collection(firestore, 'letter-activities'), orderBy('date', 'desc'), limit(100));
}, [firestore, user]);
const { data: activityLog, isLoading: activityLogLoading } = useCollection<ActivityLog>(activityLogQuery);

// AFTER:
const { data: activityLog, isLoading: activityLogLoading } = useActivities({
  limit: 100
  // optional: createdBy: userEmail
});
```

**Change 4**: Replace status update handler
```typescript
// BEFORE:
const handleStatusChange = async (userId: string, newStatus: boolean) => {
  if (!firestore) return;
  const userRef = doc(firestore, 'users', userId);
  try {
    await setDoc(userRef, { status: newStatus ? 'active' : 'inactive' }, { merge: true });
    toast({ title: 'User status updated' });
  } catch (error) {
    toast({ variant: 'destructive', title: 'Error' });
  }
};

// AFTER:
const handleStatusChange = async (userId: string, newStatus: boolean) => {
  try {
    const { updateUser } = useUpdateUser(userId);
    await updateUser({ status: newStatus ? 'active' : 'inactive' });
    toast({ title: 'User status updated' });
  } catch (error) {
    toast({ variant: 'destructive', title: 'Error' });
  }
};
```

---

## Testing Checklist

After updating each component:

- [ ] Component compiles without errors
- [ ] API endpoints are called (check Network tab)
- [ ] Data displays correctly
- [ ] Create operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Loading states show correctly
- [ ] Error states display
- [ ] Data persists in SQLite

---

## Quick Command Reference

```bash
# Test if DB is working
curl http://localhost:9002/api/users

# Create test user
curl -X POST http://localhost:9002/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","email":"test@test.com","role":"user","status":"active"}'

# Create test consumer
curl -X POST http://localhost:9002/api/consumers \
  -H "Content-Type: application/json" \
  -d '{"id":"c1","accNo":"12345","name":"Test","guardian":"Parent"}'

# Check database file
ls -lh data/app.db

# Delete database (reset)
rm data/app.db
```

---

## Estimated Effort

| Component | Effort | Time |
|-----------|--------|------|
| Admin Dashboard | High | 45-60 min |
| Letter Generator | High | 45-60 min |
| Activity Log | Medium | 20-30 min |
| Login Form | Low | 10-15 min |
| **Total** | **High** | **2-2.5 hours** |

---

## Helpful Links

- [SQLITE_MIGRATION_GUIDE.md](./SQLITE_MIGRATION_GUIDE.md) - Full documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Code examples
- [/src/hooks/use-database.ts](./src/hooks/use-database.ts) - Hook implementations
- [/src/app/api/](./src/app/api/) - API route examples

---

**Last Updated**: January 27, 2026  
**Status**: Framework Ready, Components Pending  
**Start with**: Admin Dashboard (most critical)
