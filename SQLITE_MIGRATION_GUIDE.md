# SQLite Migration Complete ✓

## What Changed

You've successfully migrated from **Firestore** to **SQLite** with **Next.js API routes**. Firebase Auth is still active for user authentication.

---

## Architecture Overview

```
Old Flow (Firestore):
Client → Firebase Firestore (Real-time DB)

New Flow (SQLite + API Routes):
Client → Next.js API Routes → SQLite (File-based DB)
              ↓
         /api/users
         /api/consumers
         /api/activities
```

---

## What's Set Up

### 1. **Database** (`/src/lib/db.ts`)
- SQLite database stored at `data/app.db`
- Automatic table creation on first request
- Tables: `users`, `consumers`, `letter_activities`

### 2. **API Routes** (`/src/app/api/`)
```
/api/users              - GET all users, POST new user
/api/users/[id]         - GET, PATCH, DELETE specific user
/api/consumers          - GET all consumers, POST new consumer  
/api/consumers/[accNo]  - GET, PATCH, DELETE specific consumer
/api/activities         - GET activities (with filters), POST new activity
/api/activities/[id]    - GET, DELETE specific activity
```

### 3. **Custom Hooks** (`/src/hooks/use-database.ts`)
New React hooks to replace Firestore hooks:
- `useActivities()` - Fetch letter activities
- `useUsers()` - Fetch all users
- `useConsumer(accNo)` - Fetch single consumer by account number
- `useCreateActivity()` - Create new activity
- `useUpdateUser()` - Update user status/email
- `useDeleteActivity()` - Delete activity
- `useDeleteUser()` - Delete user

---

## How to Use

### Example 1: Fetch Users
```typescript
import { useUsers } from '@/hooks/use-database';

export function AdminPanel() {
  const { data: users, isLoading, error } = useUsers();
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {users.map(user => <div key={user.id}>{user.email}</div>)}
    </div>
  );
}
```

### Example 2: Fetch Consumer Data
```typescript
import { useConsumer } from '@/hooks/use-database';

export function ConsumerForm() {
  const [accNo, setAccNo] = useState<string | null>(null);
  const { data: consumer, isLoading } = useConsumer(accNo);
  
  // Use consumer.name, consumer.guardian, etc.
}
```

### Example 3: Save Letter Activity
```typescript
import { useCreateActivity } from '@/hooks/use-database';

export function SaveLetterActivity() {
  const { createActivity, isLoading } = useCreateActivity({
    accountNumber: '12345',
    consumerName: 'John Doe',
    subject: 'Refund Request',
    createdBy: 'user@example.com',
    date: '2024-01-27',
    letterType: 'refund',
    formData: { /* form data */ }
  });

  const handleSave = async () => {
    try {
      await createActivity();
      toast({ title: 'Saved!' });
    } catch (err) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };
}
```

---

## API Request Examples

### Create User
```bash
curl -X POST http://localhost:9002/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "firebase-uid-123",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  }'
```

### Create Consumer
```bash
curl -X POST http://localhost:9002/api/consumers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-here",
    "accNo": "12345",
    "name": "John Doe",
    "guardian": "Father Name",
    "meterNo": "M123",
    "mobile": "01712345678",
    "address": "Village, District",
    "tarrif": "Domestic"
  }'
```

### Save Activity
```bash
curl -X POST http://localhost:9002/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "12345",
    "consumerName": "John Doe",
    "subject": "Refund Request",
    "createdBy": "user@example.com",
    "date": "2024-01-27",
    "letterType": "refund",
    "formData": {}
  }'
```

---

## Components Still Using Firestore (Need Migration)

These components need to be updated:
1. `/src/app/dashboard/admin/page.tsx` - User management
2. `/src/components/letter-generator.tsx` - Letter generation & activity logging
3. `/src/components/user-activity-log.tsx` - Activity log display
4. `/src/components/login-form.tsx` - User role checking (already partially updated)

Each should replace:
- `useFirestore()` → API calls via hooks
- `useCollection()` → `useActivities()` or `useUsers()`
- `doc()`, `collection()` → Direct API routes
- `addDoc()`, `setDoc()` → `useCreateActivity()`, `useUpdateUser()`
- `deleteDoc()` → `useDeleteActivity()`, `useDeleteUser()`

---

## Key Files

| File | Purpose |
|------|---------|
| `/src/lib/db.ts` | SQLite initialization & schema |
| `/src/app/api/users/route.ts` | Users API endpoints |
| `/src/app/api/consumers/route.ts` | Consumers API endpoints |
| `/src/app/api/activities/route.ts` | Activities API endpoints |
| `/src/hooks/use-database.ts` | React hooks for database queries |
| `data/app.db` | SQLite database file (auto-created) |

---

## Running the App

```bash
# Install dependencies (already done)
npm install better-sqlite3

# Start dev server
npm run dev

# The database will auto-initialize on first API request
# Visit http://localhost:9002/api/users to test
```

---

## Benefits of This Migration

✅ **No Cloud Cost** - SQLite is file-based, zero database fees  
✅ **Offline Capable** - Database stored locally  
✅ **Simple Deployment** - Just copy `data/app.db` with your app  
✅ **Fast Queries** - Local database is super fast  
✅ **Easy to Backup** - Just backup `data/app.db` file  
✅ **Easy Migration Path** - Can migrate to PostgreSQL later if needed  

---

## Next Steps

1. **Test the API**: Make requests to `/api/users`, `/api/consumers`, `/api/activities`
2. **Update Components**: Migrate remaining Firestore code to use new hooks
3. **Verify Data**: Check that `data/app.db` is created after first request
4. **Manual Test**: Create users, consumers, and activities through the UI

---

## Troubleshooting

**Q: `data/app.db` not created?**  
A: Make a request to any API endpoint first: `GET /api/users`

**Q: Database locked error?**  
A: Restart the dev server. This usually happens if the previous process didn't close cleanly.

**Q: Need to clear database?**  
A: Delete `data/app.db` and restart the server. The schema will recreate on first request.

---

## Firebase Auth Still Works

- Users still login with Firebase Auth
- Auth tokens are validated on the client side
- User creation now stores to SQLite (not Firestore)
- User metadata (role, status) stored in SQLite

You can easily switch to custom auth later by:
1. Creating user registration API endpoint
2. Using bcrypt to hash passwords
3. Storing users in SQLite with password_hash column

---

**Migration completed on:** January 27, 2026  
**Status:** ✅ Ready for component updates
