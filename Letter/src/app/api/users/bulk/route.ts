import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import admin from '@/firebase/admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const users = Array.isArray(body) ? body : body?.users;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No users provided' }, { status: 400 });
    }

    const db = getDb();
    const insertStmt = db.prepare('INSERT INTO users (id, email, role, status) VALUES (?, ?, ?, ?)');
    const updateStmt = db.prepare('UPDATE users SET email = ?, role = ?, status = ? WHERE id = ?');
    const existsStmt = db.prepare('SELECT id FROM users WHERE id = ?');

    const results: any[] = [];
    const authTasks: Array<{ id: string; email: string; password?: string; createdInDb: boolean }> = [];

    const tx = db.transaction((list: any[]) => {
      for (const u of list) {
        const id = u.id;
        const email = u.email;
        const role = u.role || 'user';
        const status = u.status || 'active';

        if (!id || !email) {
          results.push({ id: id || null, email: email || null, ok: false, reason: 'Missing id or email' });
          continue;
        }

        const exists = existsStmt.get(id);
        if (exists) {
          updateStmt.run(email, role, status, id);
          results.push({ id, email, role, status, ok: true, action: 'updated' });
          // don't overwrite password for existing auth users by default
        } else {
          insertStmt.run(id, email, role, status);
          // generate a password if one wasn't provided
          const providedPassword = u.password || u.pw || null;
          const password = providedPassword || crypto.randomBytes(9).toString('base64').slice(0, 12);
          results.push({ id, email, role, status, ok: true, action: 'created', password: providedPassword ? undefined : password });
          authTasks.push({ id, email, password, createdInDb: true });
        }
      }
    });

    tx(users);

    // Now process Firebase Auth creation/updates (async, outside of transaction)
    if (admin) {
      for (const t of authTasks) {
        try {
          // Try to get by uid first
          let userRecord;
          try {
            userRecord = await admin.auth().getUser(t.id);
          } catch (err: any) {
            userRecord = null;
          }

          if (userRecord) {
            // user exists in Auth — don't change password unless explicitly requested
            // (we did not include password for existing users)
            // Ensure email is set
            await admin.auth().updateUser(t.id, { email: t.email });
          } else {
            // create auth user with password
            await admin.auth().createUser({ uid: t.id, email: t.email, password: t.password });
          }
        } catch (err) {
          console.error('Firebase Auth create/update failed for', t.id, err);
          // mark the corresponding result entry
          const r = results.find((x) => x.id === t.id);
          if (r) {
            r.authOk = false;
            r.authError = String(err);
          }
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in bulk user create:', error);
    return NextResponse.json({ error: 'Failed to process bulk users' }, { status: 500 });
  }
}
