'use client';

import { useState, useEffect } from 'react';
import { useConsumer, useUpdateConsumer, useDeleteConsumer } from '@/hooks/use-database';
import { toBanglaNumeral, normalizeToEnglish } from '@/lib/numeral-converter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ConsumerEditorProps {
  accNo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConsumerEditor({ accNo, isOpen, onClose, onSuccess }: ConsumerEditorProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch consumer data
  const { data: consumer, isLoading: isFetching, error } = useConsumer(accNo);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    guardian: '',
    meterNo: '',
    mobile: '',
    address: '',
    tarrif: '',
  });

  // Update form when consumer data loads
  useEffect(() => {
    if (consumer) {
      setFormData({
        name: consumer.name || '',
        guardian: consumer.guardian || '',
        meterNo: normalizeToEnglish(consumer.meterNo || ''),
        mobile: consumer.mobile || '',
        address: consumer.address || '',
        tarrif: consumer.tarrif || '',
      });
    }
  }, [consumer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/consumers/${accNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update consumer');

      toast({
        title: 'Success',
        description: 'Consumer updated successfully',
      });
      onSuccess();
      onClose();
      // Refresh page after update
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Error updating consumer:', err);
      toast({
        title: 'Error',
        description: 'Failed to update consumer',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/consumers/${accNo}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete consumer');

      toast({
        title: 'Success',
        description: 'Consumer deleted successfully',
      });
      setShowDeleteConfirm(false);
      onSuccess();
      onClose();
      // Refresh page after deletion
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Error deleting consumer:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete consumer',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-red-500">Failed to load consumer data: {String(error)}</p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Consumer</DialogTitle>
            <DialogDescription>
              Account: {consumer?.accNo || accNo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Consumer name"
                />
              </div>
              <div>
                <Label htmlFor="guardian">Guardian</Label>
                <Input
                  id="guardian"
                  name="guardian"
                  value={formData.guardian}
                  onChange={handleInputChange}
                  placeholder="Guardian name"
                />
              </div>
              <div>
                <Label htmlFor="meterNo">Meter No</Label>
                <Input
                  id="meterNo"
                  name="meterNo"
                  value={formData.meterNo}
                  onChange={handleInputChange}
                  placeholder="Meter number"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Mobile number"
                />
              </div>
              <div>
                <Label htmlFor="tarrif">Tarrif</Label>
                <Input
                  id="tarrif"
                  name="tarrif"
                  value={formData.tarrif}
                  onChange={handleInputChange}
                  placeholder="Tarrif"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Consumer address"
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Consumer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the consumer record for <strong>{consumer?.accNo}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
