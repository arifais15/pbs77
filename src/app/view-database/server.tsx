import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewDatabaseClient } from './client';

export async function ViewDatabaseServer() {
  try {
    const db = getDb();
    const consumers = db.prepare('SELECT * FROM consumers ORDER BY created_at DESC').all();

    return <ViewDatabaseClient consumers={consumers as any} />;
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              {error.message || 'Failed to load database records'}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
