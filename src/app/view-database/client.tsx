'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerEditor } from '@/components/consumer-editor';
import { toBanglaNumeral } from '@/lib/numeral-converter';

interface Consumer {
  id: string;
  accNo: string;
  name: string;
  guardian: string;
  meterNo: string;
  mobile: string;
  address: string;
  tarrif: string;
  created_at: string;
}

interface ViewDatabaseClientProps {
  initialConsumers: Consumer[];
  pageSize?: number;
}

export function ViewDatabaseClient({ initialConsumers, pageSize = 20 }: ViewDatabaseClientProps) {
  const [selectedAccNo, setSelectedAccNo] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [consumers, setConsumers] = useState<Consumer[]>([]);

  const totalPages = Math.ceil(initialConsumers.length / pageSize);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setConsumers(initialConsumers.slice(start, end));
  }, [page, initialConsumers, pageSize]);

  const handleSuccess = () => {
    // Reload page on edit/save
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Viewer</h1>
          <p className="text-muted-foreground">View and manage all consumer records in SQLite database</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consumers ({initialConsumers.length})</CardTitle>
            <CardDescription>
              All consumer records stored in the database. Click Edit to modify or delete a record.
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
                <TableBody>
                  {consumers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No consumer records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    consumers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm font-bangla">{toBanglaNumeral(c.accNo)}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.guardian}</TableCell>
                        <TableCell className="font-bangla">{toBanglaNumeral(c.meterNo)}</TableCell>
                        <TableCell className="font-bangla">{toBanglaNumeral(c.mobile)}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.address}</TableCell>
                        <TableCell>{c.tarrif}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccNo(c.accNo);
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
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
