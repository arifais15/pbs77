
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import type { LetterActivity } from '@/app/dashboard/actions';
import { Button } from './ui/button';

interface UserActivityLogProps {
    userEmail: string;
    onEdit: (activity: LetterActivity) => void;
    onDelete: (activityId: string) => void;
}

// Ensure the local type matches the one from actions, including the new fields.
interface ActivityLog extends LetterActivity {
  id: string;
  [key: string]: any;
}


export function UserActivityLog({ userEmail, onEdit, onDelete }: UserActivityLogProps) {
    const firestore = useFirestore();

    const userActivityQuery = useMemoFirebase(() => {
        if (!firestore || !userEmail) return null;
        return query(
            collection(firestore, "letter-activities"),
            where("createdBy", "==", userEmail),
            orderBy("date", "desc"),
            limit(50)
        );
    }, [firestore, userEmail]);

    const { data: userActivity, isLoading } = useCollection<ActivityLog>(userActivityQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Letter Generation Activity</CardTitle>
                <CardDescription>
                    Here is a list of the letters you have generated. Click the edit button to reload data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account No.</TableHead>
                            <TableHead>Consumer Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                   <div className="flex justify-center items-center gap-2">
                                     <Loader2 className="h-5 w-5 animate-spin" />
                                     <span>Loading your activity...</span>
                                   </div>
                                </TableCell>
                            </TableRow>
                        ) : userActivity && userActivity.length > 0 ? (
                            userActivity.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono">{log.accountNumber}</TableCell>
                                    <TableCell>{log.consumerName}</TableCell>
                                    <TableCell>{log.subject}</TableCell>
                                    <TableCell>{log.date}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => onEdit(log)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => onDelete(log.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">You have not generated any letters yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
