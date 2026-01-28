'use server';

import { ViewDatabaseServer } from './server';

interface Props {
  searchParams?: { page?: string };
}

export default async function ConsumersViewPage({ searchParams }: Props) {
  // Pass searchParams to server component for pagination
  return <ViewDatabaseServer searchParams={searchParams} />;
}
