# Quick Reference: Firestore → SQLite Migration

## Hook Migration Cheat Sheet

### Get All Users
```typescript
// ❌ BEFORE (Firestore)
const firestore = useFirestore();
const usersQuery = collection(firestore, 'users');
const { data: users } = useCollection(usersQuery);

// ✅ AFTER (SQLite)
const { data: users, isLoading } = useUsers();
```

### Get Single Consumer by Account Number
```typescript
// ❌ BEFORE
const docRef = doc(firestore, 'consumers', accNo);
const docSnap = await getDoc(docRef);

// ✅ AFTER
const { data: consumer } = useConsumer(accNo);
```

### Get Activities with Filter
```typescript
// ❌ BEFORE
const q = query(
  collection(firestore, 'letter-activities'),
  where('createdBy', '==', userEmail),
  orderBy('date', 'desc'),
  limit(100)
);
const { data } = useCollection(q);

// ✅ AFTER
const { data } = useActivities({
  createdBy: userEmail,
  limit: 100
});
```

### Create Activity
```typescript
// ❌ BEFORE
await addDoc(collection(firestore, 'letter-activities'), {
  accountNumber: '12345',
  consumerName: 'John',
  subject: 'Refund',
  createdBy: 'user@email.com',
  date: '2024-01-27'
});

// ✅ AFTER
const { createActivity } = useCreateActivity({
  accountNumber: '12345',
  consumerName: 'John',
  subject: 'Refund',
  createdBy: 'user@email.com',
  date: '2024-01-27'
});
await createActivity();
```

### Update User
```typescript
// ❌ BEFORE
const userRef = doc(firestore, 'users', userId);
await setDoc(userRef, { status: 'inactive' }, { merge: true });

// ✅ AFTER
const { updateUser } = useUpdateUser(userId);
await updateUser({ status: 'inactive' });
```

### Delete Activity
```typescript
// ❌ BEFORE
await deleteDoc(doc(firestore, 'letter-activities', activityId));

// ✅ AFTER
const { deleteActivity } = useDeleteActivity(activityId);
await deleteActivity();
```

### Delete User
```typescript
// ❌ BEFORE
await deleteDoc(doc(firestore, 'users', userId));

// ✅ AFTER
const { deleteUser } = useDeleteUser(userId);
await deleteUser();
```

---

## Common Patterns

### Pattern 1: Load Data on Mount
```typescript
function MyComponent() {
  const { data: users, isLoading } = useUsers();
  
  if (isLoading) return <Spinner />;
  
  return users.map(u => <div key={u.id}>{u.email}</div>);
}
```

### Pattern 2: Handle Async Save
```typescript
async function handleSave() {
  try {
    const { createActivity } = useCreateActivity(data);
    await createActivity();
    toast({ title: 'Saved!' });
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  }
}
```

### Pattern 3: Refetch Data
```typescript
const { data, refetch } = useActivities({ createdBy: email });

const handleDelete = async (id) => {
  await deleteActivity(id);
  await refetch(); // Re-fetch updated list
};
```

### Pattern 4: Conditional Fetch
```typescript
const [accNo, setAccNo] = useState<string | null>(null);
const { data: consumer } = useConsumer(accNo);
// Only fetches when accNo is set

const handleAccChange = (value: string) => {
  if (value.length > 4) {
    setAccNo(value);
  }
};
```

---

## API Endpoints Reference

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| GET | `/api/users` | - | `User[]` |
| POST | `/api/users` | `{id, email, role?, status?}` | `User` |
| GET | `/api/users/:id` | - | `User` |
| PATCH | `/api/users/:id` | `{email?, role?, status?}` | `User` |
| DELETE | `/api/users/:id` | - | `{success: true}` |
| GET | `/api/consumers` | - | `Consumer[]` |
| POST | `/api/consumers` | `{id, accNo, name, ...}` | `Consumer` |
| GET | `/api/consumers/:accNo` | - | `Consumer` |
| PATCH | `/api/consumers/:accNo` | `{name?, guardian?, ...}` | `Consumer` |
| DELETE | `/api/consumers/:accNo` | - | `{success: true}` |
| GET | `/api/activities?createdBy=x&limit=100` | - | `Activity[]` |
| POST | `/api/activities` | `{accountNumber, consumerName, ...}` | `Activity` |
| GET | `/api/activities/:id` | - | `Activity` |
| DELETE | `/api/activities/:id` | - | `{success: true}` |

---

## Imports Needed

```typescript
// Replace these Firestore imports:
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, query, where, orderBy, limit, addDoc, setDoc, deleteDoc, getDocs, getDoc } from "firebase/firestore";

// With these database imports:
import { 
  useUsers,
  useActivities,
  useConsumer,
  useCreateActivity,
  useUpdateUser,
  useDeleteActivity,
  useDeleteUser
} from "@/hooks/use-database";
```

---

## Quick Checklist for Migrating a Component

- [ ] Remove Firestore imports
- [ ] Add database hook imports
- [ ] Replace `useFirestore()` with appropriate hook
- [ ] Replace `useCollection()` calls with `useActivities()` or `useUsers()`
- [ ] Replace `doc()`, `collection()` with API endpoint calls
- [ ] Replace `addDoc()` with `useCreateActivity()`
- [ ] Replace `setDoc()` with `useUpdateUser()`
- [ ] Replace `deleteDoc()` with `useDelete*()`
- [ ] Update error handling
- [ ] Test in browser

---

## Common Issues & Solutions

**"Consumer data not loading?"**
- Check if accNo is set correctly
- Verify consumer exists in database
- Check browser console for errors

**"Activities not saving?"**
- Verify all required fields are provided
- Check user email is passed correctly
- Check formData is properly serialized

**"Cannot read property X of undefined?"**
- Check if data is loaded: `if (!consumer) return null`
- Use optional chaining: `consumer?.name`
- Check null/undefined in conditional renders

---

## Performance Tips

1. **Batch Operations**: Use `Promise.all()` for multiple saves
```typescript
await Promise.all([
  createActivity(activity1),
  createActivity(activity2),
  createActivity(activity3)
]);
```

2. **Debounce Searches**:
```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => setAccNo(value), 500),
  []
);
```

3. **Cache Data**: Use React Query or SWR for advanced caching
```typescript
const { data } = useSWR('/api/users', fetch);
```

---

**Last Updated:** January 27, 2026  
**Migration Status:** ✅ Framework Complete, Components Pending
