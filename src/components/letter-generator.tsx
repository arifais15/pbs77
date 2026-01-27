
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import type { LetterActivity, LetterInputs } from '@/app/dashboard/actions';
import { enToBn } from '@/lib/utils';
import { NewDashboard } from './new-dashboard';
import { UserActivityLog } from './user-activity-log';
import { Loader2 } from 'lucide-react';

export function LetterGenerator() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [letterType, setLetterType] = useState('due');
  const [inputs, setInputs] = useState<LetterInputs>({
    inName: '',
    inAcc: '',
    inMeter: '',
    inGuardian: '',
    inMobile: '',
    inTarrif: '',
    inSmarok: '৫৭৭.০৪.২৬.',
    inOffice: '',
    inDate: '',
    ikwh: '0',
    ipeak: '0',
    ioff: '0',
    idueAmt: '0',
    idueMon: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    if (!isUserLoading && user) {
      const role = sessionStorage.getItem('userRole');
      const email = sessionStorage.getItem('userEmail');
      if (role === 'admin') {
        setIsAdmin(true);
      }
      setUserEmail(email);
    }
  }, [user, isUserLoading]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    // Optimistically update the input field being typed in
    setInputs(prev => ({ ...prev, [id]: value }));

    if (id === 'inAcc') {
        // Clear other fields if account number is cleared
        if (value === '') {
            setInputs(prev => ({
                ...prev,
                inName: '', inMeter: '', inOffice: '', inGuardian: '', inMobile: '', inTarrif: '', idueAmt: '0', idueMon: ''
            }));
            return;
        }

        // Only search when the input looks like a valid account number
        if (value.length > 4) {
            setIsSearching(true);
            try {
                if (!firestore) {
                    toast({ variant: "destructive", title: "Error", description: "Firestore is not available." });
                    return;
                }
                // The document ID in Firestore should be the account number string
                const docRef = doc(firestore, 'consumers', value);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const consumer = docSnap.data();
                    setInputs(prev => ({
                        ...prev,
                        inName: consumer.name || '',
                        inMeter: consumer.meterNo || '',
                        inOffice: consumer.address || '',
                        inGuardian: consumer.guardian || '',
                        inMobile: consumer.mobile || '',
                        inTarrif: consumer.tarrif || '',
                    }));
                    toast({
                        title: "গ্রাহক পাওয়া গেছে",
                        description: `${consumer.name} এর তথ্য লোড হয়েছে।`,
                    });
                } else {
                    // Clear fields if no consumer is found for the given account number
                     setInputs(prev => ({
                        ...prev,
                        inName: '', inMeter: '', inOffice: '', inGuardian: '', inMobile: '', inTarrif: '',
                    }));
                }
            } catch (error) {
                console.error("Error fetching consumer:", error);
                toast({ variant: "destructive", title: "Search Error", description: "Could not fetch consumer data." });
            } finally {
                setIsSearching(false);
            }
        }
    }
  };

  const handleLetterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLetterType(e.target.value);
  }

  const buildLetterAndSave = async () => {
    // Always show the preview first based on the current form inputs.
    setShowPreview(true);
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Then, validate everything needed for saving the activity.
    if (!firestore || !userEmail) {
      toast({ variant: "destructive", title: "Save Error", description: "Could not connect to database or user not found. Preview is available but will not be saved." });
      return;
    }
    
    if (!inputs.inAcc || !inputs.inName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Account No and Consumer Name are required to save the activity log.",
      });
      return;
    }

    const subjectText = document.querySelector(`#lType option[value="${letterType}"]`)?.textContent || '';
    const generationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for checking

    // --- Duplicate Check ---
    const q = query(
      collection(firestore, "letter-activities"),
      where("accountNumber", "==", inputs.inAcc),
      where("subject", "==", subjectText),
      where("date", "==", generationDate)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast({
        title: "Duplicate Letter",
        description: "Preview generated. A new activity was not logged as it already exists for today.",
      });
      return; // Stop execution if duplicate is found, but after showing the preview.
    }
    // --- End Duplicate Check ---

    // If all checks pass, proceed to save the activity log.
    const letterData: LetterActivity = {
      accountNumber: inputs.inAcc,
      consumerName: inputs.inName,
      subject: subjectText,
      createdBy: userEmail,
      date: generationDate,
      letterType: letterType,
      formData: inputs,
    };

    try {
      await addDoc(collection(firestore, "letter-activities"), letterData);
      toast({
        title: "Activity Logged",
        description: "The letter generation has been saved.",
      });
    } catch (error) {
      console.error("Failed to save letter activity:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the letter activity to the database.",
      });
    }
  }

  const handleEdit = (activity: LetterActivity) => {
    // Gracefully handle older log entries that don't have formData
    setInputs(activity.formData || {
        inName: activity.consumerName,
        inAcc: activity.accountNumber,
        inMeter: '',
        inGuardian: '',
        inMobile: '',
        inTarrif: '',
        inSmarok: '৫৭৭.০৪.২৬.',
        inOffice: '',
        inDate: activity.date,
        ikwh: '0',
        ipeak: '0',
        ioff: '0',
        idueAmt: '0',
        idueMon: '',
    });

    setLetterType(activity.letterType || 'due');
    setShowPreview(false); // Hide any existing preview
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
      title: "Editing Letter",
      description: `Loaded data for account ${activity.accountNumber}.`,
    })
  };
  
  const handleDeleteActivity = async (activityId: string) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }
     if (!window.confirm(`Are you sure you want to delete this activity? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, "letter-activities", activityId));
      toast({
        title: "Activity Deleted",
        description: "The activity has been removed from your log.",
      });
    } catch (error) {
      console.error("Failed to delete letter activity:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the activity from the database.",
      });
    }
  }

  if (!isClient || isUserLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NewDashboard
        letterType={letterType}
        inputs={inputs}
        showPreview={showPreview}
        previewRef={previewRef}
        onLetterTypeChange={handleLetterTypeChange}
        onInputChange={handleInputChange}
        onGenerate={buildLetterAndSave}
        isSearching={isSearching}
      />
      {!isAdmin && user && userEmail && (
        <div className="mt-8">
            <UserActivityLog userEmail={userEmail} onEdit={handleEdit} onDelete={handleDeleteActivity} />
        </div>
      )}
    </>
  );
}
