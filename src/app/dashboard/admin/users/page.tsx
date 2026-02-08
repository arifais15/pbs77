"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/use-database';
import { useToast } from '@/hooks/use-toast';

export default function ManageUsersPage() {
  const { data: users, isLoading, refetch } = useUsers();
  const { toast } = useToast();
  const [bulkText, setBulkText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkCreate = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast({ title: 'No input', description: 'Provide one user per line (email or id,email[,role,status])' });
      return;
    }

    const payload = lines.map(line => {
      if (line.includes(',')) {
        const [id, email, role, status] = line.split(',').map(s => s.trim());
        return { id, email, role, status };
      }
      // line is an email only
      return { id: (crypto as any).randomUUID(), email: line };
    });

    try {
      setIsProcessing(true);
      const res = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Bulk create failed');
      toast({ title: 'Bulk import complete', description: `Processed ${json.results.length} entries` });
      setBulkText('');
      await refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('user');
  const [editStatus, setEditStatus] = useState<string>('active');

  const startEditing = (u: any) => {
    setEditingId(u.id);
    setEditRole(u.role || 'user');
    setEditStatus(u.status || 'active');
  };

  const handleSave = async (id: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole, status: editStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      toast({ title: 'Updated', description: `User ${id} updated` });
      setEditingId(null);
      await refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: `User ${id} removed` });
      await refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || String(err) });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage System Users</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <section className="p-4 border rounded space-y-3">
          <h2 className="font-medium">Bulk Create / Update</h2>
          <p className="text-sm text-muted-foreground">Provide one user per line. Accepts either an email alone or a CSV line: id,email,role,status</p>
          <textarea
            className="w-full h-36 p-2 border rounded"
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={'user@example.com\nuser2@example.com\ncustom-id,user3@example.com,admin,active'}
          />
          <div className="flex gap-2">
            <Button onClick={handleBulkCreate} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Import'}</Button>
            <Button variant="ghost" onClick={() => setBulkText('')}>Clear</Button>
          </div>
        </section>

        <section className="p-4 border rounded">
          <h2 className="font-medium mb-3">Existing Users</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} className="p-1 border rounded text-sm">
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="p-1 border rounded text-sm">
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
                        </select>
                        <Button size="sm" onClick={() => handleSave(u.id)} disabled={isProcessing}>Save</Button>
                        <Button size="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-xs mr-2">{u.role} • {u.status}</div>
                        <Button size="sm" onClick={() => startEditing(u)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>Delete</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No users found</p>
          )}
        </section>
      </div>
    </div>
  );
}
