import { getDb } from '@/lib/db';
import { ViewDatabaseClient } from './client';

interface ViewDatabaseServerProps {
  searchParams?: { page?: string };
}

const PAGE_SIZE = 50;

export async function ViewDatabaseServer({ searchParams }: ViewDatabaseServerProps) {
  try {
    const db = getDb();
    const page = parseInt(searchParams?.page || '1', 10);
    const offset = (page - 1) * PAGE_SIZE;

    // Get paginated records
    const consumers = db
      .prepare('SELECT * FROM consumers ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(PAGE_SIZE, offset);

    // Get total count
    const { count }: { count: number } = db
      .prepare('SELECT COUNT(*) as count FROM consumers')
      .get();

    return (
      <ViewDatabaseClient
        consumers={consumers as any}
        totalCount={count}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={(newPage) => {
          // Simple page change: reload client with new query param
          window.location.search = `?page=${newPage}`;
        }}
      />
    );
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <div className="border-red-200 bg-red-50 rounded-lg p-4">
            <h2 className="text-red-900 text-xl font-bold">Error</h2>
            <p className="text-red-700">{error.message || 'Failed to load database records'}</p>
          </div>
        </div>
      </div>
    );
  }
}

