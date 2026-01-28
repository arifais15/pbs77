'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerEditor } from '@/components/consumer-editor';
import { toBanglaNumeral } from '@/lib/numeral-converter';

export function ViewDatabaseClient() {
  const [consumers, setConsumers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedAccNo, setSelectedAccNo] = useState<string | null>(null);

  const limit = 20; // 20 rows per page

  const fetchData = async (pageNum: number) => {
    try {
      const res = await fetch(`/api/consumers?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      setConsumers(data.consumers);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Viewer</h1>
          <p className="text-muted-foreground">View and manage all consumer records in SQLite database</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consumers ({total})</CardTitle>
            <CardDescription>Click Edit to modify or delete a record.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
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
                    consumers.map((consumer: any) => (
                      <TableRow key={consumer.id}>
                        <TableCell className="font-mono text-sm font-bangla">{toBanglaNumeral(consumer.accNo)}</TableCell>
                        <TableCell>{consumer.name}</TableCell>
                        <TableCell>{consumer.guardian}</TableCell>
                        <TableCell className="font-bangla">{toBanglaNumeral(consumer.meterNo)}</TableCell>
                        <TableCell className="font-bangla">{toBanglaNumeral(consumer.mobile)}</TableCell>
                        <TableCell className="max-w-xs truncate">{consumer.address}</TableCell>
                        <TableCell>{consumer.tarrif}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(consumer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedAccNo(consumer.accNo);
                            setIsEditorOpen(true);
                          }}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="px-2 py-1 border rounded">{page} / {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
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
          onSuccess={() => fetchData(page)}
        />
      )}
    </div>
  );
}
