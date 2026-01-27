
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/users';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ArrowLeft, Loader2, PlusCircle, Trash2, Printer, Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, writeBatch, query, orderBy, limit } from 'firebase/firestore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Textarea } from '@/components/ui/textarea';


// Define the type for the activity log data from Firestore
interface ActivityLog {
  id: string;
  accountNumber: string;
  consumerName: string;
  subject: string;
  createdBy: string;
  date: string;
  [key: string]: any; 
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  // --- Firebase Hooks for users ---
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  // --- Firebase Hooks for activity log ---
  const activityLogQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'letter-activities'), orderBy('date', 'desc'), limit(100));
  }, [firestore, user]);
  const { data: activityLog, isLoading: activityLogLoading } = useCollection<ActivityLog>(activityLogQuery);
  
  // --- New User State ---
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // --- Bulk Data State ---
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
    // Role check now depends on Firebase user being loaded and running on the client
    if (!isUserLoading && user) {
      const role = sessionStorage.getItem('userRole');
      if (role !== 'admin') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You must be an admin to view this page.',
        });
        router.push('/dashboard');
      }
    } else if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [router, toast, user, isUserLoading]);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    try {
      await setDoc(userRef, { status: newStatus ? 'active' : 'inactive' }, { merge: true });
      toast({
        title: 'User status updated',
        description: `User status has been changed.`,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user status.' });
    }
  };

  const handleEmailChange = async (userId: string, oldEmail: string, newEmail: string) => {
    if (!newEmail || !newEmail.includes('@')) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
        return;
    }
    // Note: This only changes the email in Firestore. Changing Firebase Auth email is a more complex, secure operation.
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    try {
      await setDoc(userRef, { email: newEmail }, { merge: true });
       toast({
        title: 'User email updated in DB',
        description: `User email for ${oldEmail} is now ${newEmail}. Auth email not changed.`,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user email.' });
    }
  };
  
  const handleCreateUser = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
     if (!newUserEmail || !newUserPassword) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide email and password.' });
      return;
    }

    setIsCreatingUser(true);
    const auth = getAuth();

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      const newAuthUser = userCredential.user;

      // Step 2: Create user document in Firestore
      const userDocRef = doc(firestore, 'users', newAuthUser.uid);
      await setDoc(userDocRef, {
        id: newAuthUser.uid,
        email: newUserEmail,
        role: newUserRole,
        status: 'active'
      });

      toast({
        title: 'User Created',
        description: `${newUserEmail} has been added successfully.`
      });
      
      // Reset form and close dialog
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setAddUserDialogOpen(false);

    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.message || 'Could not create user.',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };
  
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!firestore) return;
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'users', userId));
      // Note: This does NOT delete the user from Firebase Authentication.
      // That requires a backend function for security reasons.
      toast({
        title: 'User Deleted from Firestore',
        description: `User ${userEmail} has been removed from the database.`,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete user.' });
    }
  }

  const handleDeleteActivity = async (activityId: string, consumerName: string) => {
    if (!firestore) return;
    if (!window.confirm(`Are you sure you want to delete the activity for ${consumerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'letter-activities', activityId));
      toast({
        title: 'Activity Deleted',
        description: `The activity log has been removed from the database.`,
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete activity.' });
    }
  }

  const handleImportConsumers = async () => {
    if (!firestore || !csvData) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available or no CSV data provided.' });
      return;
    }

    setIsImporting(true);
    try {
      const rows = csvData.trim().split('\n');
      if (rows.length === 0) {
        toast({ variant: 'destructive', title: 'Import Error', description: 'CSV data is empty.' });
        return;
      }
      
      const headers = rows.shift()?.trim().toLowerCase().split(',').map(h => h.trim()) || [];
      const requiredHeaders = ['accno', 'name', 'guardian', 'address', 'mobile', 'meterno', 'tarrif'];
      if (!requiredHeaders.every(h => headers.includes(h))) {
        toast({ variant: 'destructive', title: 'Invalid Headers', description: `CSV must contain these headers: ${requiredHeaders.join(', ')}` });
        setIsImporting(false);
        return;
      }

      // Process in batches of 500, committing each batch sequentially.
      for (let i = 0; i < rows.length; i += 500) {
          const batch = writeBatch(firestore);
          const chunk = rows.slice(i, i + 500);

          chunk.forEach(rowStr => {
              const values = rowStr.split(',');
              const rowData: { [key: string]: string } = {};
              headers.forEach((header, index) => {
                  rowData[header] = values[index]?.trim() || '';
              });

              const accNo = rowData['accno'];
              if (accNo) {
                  const consumerDoc = {
                      name: rowData['name'] || '',
                      guardian: rowData['guardian'] || '',
                      address: rowData['address'] || '',
                      mobile: rowData['mobile'] || '',
                      meterNo: rowData['meterno'] || '',
                      tarrif: rowData['tarrif'] || '',
                  };
                  const docRef = doc(firestore, 'consumers', accNo);
                  batch.set(docRef, consumerDoc);
              }
          });
          // Await each batch commit sequentially to avoid overwhelming Firestore.
          await batch.commit();
      }

      toast({
        title: 'Import Successful',
        description: `${rows.length} consumer records have been imported.`,
      });
      setCsvData('');
      setImportDialogOpen(false);
    } catch (error: any) {
      console.error("Error importing consumers:", error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'An unexpected error occurred during import.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAllConsumers = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }

    setIsDeleting(true);
    try {
      const consumersRef = collection(firestore, 'consumers');
      const querySnapshot = await getDocs(consumersRef);
      
      if (querySnapshot.empty) {
        toast({ title: 'No Data', description: 'There are no consumer records to delete.' });
        setIsDeleting(false);
        return;
      }

      // Process in batches of 500, committing each batch sequentially.
      for (let i = 0; i < querySnapshot.docs.length; i += 500) {
          const batch = writeBatch(firestore);
          const chunk = querySnapshot.docs.slice(i, i + 500);
          chunk.forEach(doc => batch.delete(doc.ref));
          // Await each batch commit sequentially to avoid overwhelming Firestore.
          await batch.commit();
      }

      toast({
        title: 'Deletion Successful',
        description: `All ${querySnapshot.size} consumer records have been deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting consumers:", error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'An unexpected error occurred during deletion.',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handlePrintActivityLog = () => {
    window.print();
  }

  if (!isClient || isUserLoading) {
    return (
       <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center no-print-area">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" /> Admin Dashboard
        </h1>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="no-print-area">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    Create, manage, and remove user accounts.
                </CardDescription>
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account and add it to Firestore. The user will be created in Firebase Authentication.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Password</Label>
                            <Input id="password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select onValueChange={(value: 'user' | 'admin') => setNewUserRole(value)} defaultValue="user">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateUser} disabled={isCreatingUser}>
                            {isCreatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <Input
                        type="email"
                        defaultValue={user.email}
                        onBlur={(e) => handleEmailChange(user.id, user.email, e.target.value)}
                        disabled={user.role === 'admin'}
                        className="w-full sm:w-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Switch
                      checked={user.status === 'active'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(user.id, checked)
                      }
                      disabled={user.role === 'admin'}
                      aria-label={`Activate or deactivate user ${user.email}`}
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={user.role === 'admin'}
                      aria-label={`Delete user ${user.email}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Card className="no-print-area">
        <CardHeader>
            <CardTitle>Consumer Data Management</CardTitle>
            <CardDescription>Import new consumer data from a CSV or delete all existing records.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import Consumers from CSV</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Import Consumer Data</DialogTitle>
                        <DialogDescription>
                            Paste your CSV content below. The first row must be a header with the following columns (case-insensitive):
                            <code className="block bg-muted p-2 rounded-md my-2 text-sm">accNo,name,guardian,address,mobile,meterNo,tarrif</code>
                            The `accNo` will be used as the unique ID for each consumer. <strong>Important:</strong> For large datasets (&gt; 5,000 records), using this tool may exceed your daily Firebase quota. It is highly recommended to use a server-side script with the Firebase Admin SDK for bulk importing large amounts of data.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea 
                        placeholder="Paste CSV data here..." 
                        className="h-64"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        disabled={isImporting}
                    />
                    <DialogFooter>
                        <Button onClick={handleImportConsumers} disabled={isImporting || !csvData}>
                            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Start Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete All Consumer Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all consumer documents. <strong>Important:</strong> This operation performs one delete for every consumer record and can easily exhaust your Firebase daily quota, causing the operation to fail partway through. For datasets over 5,000 records, performing this from a server-side script using the Firebase Admin SDK is strongly recommended for reliability.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllConsumers} className="bg-destructive hover:bg-destructive/90">
                           Confirm & Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
      
      <Card className="print-area">
        <CardHeader className="flex flex-row items-center justify-between no-print-area">
          <div>
            <CardTitle>Letter Generation Activity</CardTitle>
            <CardDescription>
              View a log of all letters and applications generated by users.
            </CardDescription>
          </div>
           <Button onClick={handlePrintActivityLog} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print Log
           </Button>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account No.</TableHead>
                <TableHead>Consumer Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogLoading ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                       <div className="flex justify-center items-center gap-2">
                         <Loader2 className="h-5 w-5 animate-spin" />
                         <span>Loading activity log...</span>
                       </div>
                    </TableCell>
                </TableRow>
              ) : activityLog && activityLog.length > 0 ? (
                activityLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono">{log.accountNumber}</TableCell>
                    <TableCell>{log.consumerName}</TableCell>
                    <TableCell>{log.subject}</TableCell>
                    <TableCell>{log.createdBy}</TableCell>
                    <TableCell>{log.date}</TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDeleteActivity(log.id, log.consumerName)}
                            aria-label={`Delete activity for ${log.consumerName}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No activity recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}

    
