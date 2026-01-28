import { getDb } from '@/lib/db';
import { ViewDatabaseClient } from './client';

export async function ViewDatabaseServer() {
  try {
    const db = getDb();
    const consumers = db.prepare('SELECT * FROM consumers ORDER BY created_at DESC').all();

    return <ViewDatabaseClient initialConsumers={consumers} />;
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-background p-6 flex justify-center items-center">
        <div className="max-w-2xl w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-red-900 text-xl font-bold mb-2">Error</h2>
            <p className="text-red-700">{error.message || 'Failed to load database records'}</p>
          </div>
        </div>
      </div>
    );
  }
}
