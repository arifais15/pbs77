'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerEditor } from '@/components/consumer-editor';
import { toBanglaNumeral } from '@/lib/numeral-converter';

interface ViewDatabaseClientProps {
  consumers: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function ViewDatabaseClient({
  consumers,
  totalCount,
  page,
  pageSize,
  onPageChange,
}: ViewDatabaseClientProps) {
  const [selectedAccNo, setSelectedAccNo] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Viewer</h1>
          <p className="text-muted-foreground">View and manage consumer records in SQLite database</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Consumers ({toBanglaNumeral(totalCount.toString())})
            </CardTitle>
            <CardDescription>
              Records are paginated. Click Edit to modify or delete a record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Account No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Meter No</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Tarrif</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody key={refreshKey}>
                  {consumers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No consumer records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    consumers.map((consumer: any) => (
                      <TableRow key={consumer.id}>
                        <TableCell className="font-mono text-sm font-bangla">
                          {toBanglaNumeral(consumer.accNo)}
                        </TableCell>
                        <TableCell>{consumer.name}</TableCell>
                        <TableCell>{consumer.guardian}</TableCell>
                        <TableCell className="font-bangla">
                          {toBanglaNumeral(consumer.meterNo)}
                        </TableCell>
                        <TableCell className="font-bangla">
                          {toBanglaNumeral(consumer.mobile)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{consumer.address}</TableCell>
                        <TableCell>{consumer.tarrif}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(consumer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccNo(consumer.accNo);
                              setIsEditorOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-2 py-1 rounded border">
                  Page {toBanglaNumeral(page.toString())} / {toBanglaNumeral(totalPages.toString())}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedAccNo && (
        <ConsumerEditor
          accNo={selectedAccNo}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
