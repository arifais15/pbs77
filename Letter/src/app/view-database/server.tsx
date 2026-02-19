import { ViewDatabaseClient } from './client';

export async function ViewDatabaseServer() {
  // Do not load the entire consumers table on the server —
  // the client handles paginated fetching via the `/api/consumers` endpoint.
  return <ViewDatabaseClient />;
}
