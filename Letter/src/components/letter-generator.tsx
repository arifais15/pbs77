"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useConsumer, useCreateActivity, useActivities } from '@/hooks/use-database';
import type { LetterActivity, LetterInputs } from '@/app/dashboard/actions';
import { enToBn } from '@/lib/utils';
import { NewDashboard } from './new-dashboard';
import { UserActivityLog } from './user-activity-log';

// Default empty inputs
const DEFAULT_INPUTS: LetterInputs = {
  inName: '',
  inAcc: '',
  inMeter: '',
  inGuardian: '',
  inMobile: '',
  inTarrif: '',
  inSmarok: '577.04.26.',
  inOffice: '',
  inDate: '',
  ikwh: '0',
  ipeak: '0',
  ioff: '0',
  idueAmt: '0',
  idueMon: '',
};

// Helper to ensure all inputs properties are defined
const ensureInputs = (partial: Partial<LetterInputs>): LetterInputs => ({
  ...DEFAULT_INPUTS,
  ...partial,
});

export function LetterGenerator() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [accNo, setAccNo] = useState<string | null>(null);
  const { data: consumer, isLoading: isSearching } = useConsumer(accNo);
  const { data: userActivities, refetch: refetchActivities } = useActivities({ createdBy: userEmail || undefined });
  const [activityData, setActivityData] = useState<LetterActivity | null>(null);
  const { createActivity: saveActivity } = useCreateActivity(activityData);

  const [letterType, setLetterType] = useState('due');
  const [inputs, setInputs] = useState<LetterInputs>(DEFAULT_INPUTS);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

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

  // Update form when consumer data is fetched
  useEffect(() => {
    if (consumer && consumer.name) {
      setInputs(prev => ensureInputs({
        ...prev,
        inName: consumer.name || '',
        inMeter: consumer.meterNo || '',
        inOffice: consumer.address || '',
        inGuardian: consumer.guardian || '',
        inMobile: consumer.mobile || '',
        inTarrif: consumer.tarrif || '',
      }));
      toast({
        title: "গ্রাহক পাওয়া গেছে",
        description: `${consumer.name} এর তথ্য লোড হয়েছে।`,
      });
    }
  }, [consumer, toast]);

  // Show error if consumer not found
  useEffect(() => {
    if (accNo && !isSearching && !consumer) {
      toast({
        variant: "destructive",
        title: "গ্রাহক পাওয়া যায়নি",
        description: `হিসাব নং ${accNo} এর কোনো তথ্য পাওয়া যায়নি।`,
      });
    }
  }, [accNo, isSearching, consumer, toast]);

  // Handle activity creation when activityData is set
  useEffect(() => {
    if (activityData) {
      saveActivity().then(() => {
        toast({
          title: "Activity Logged",
          description: "The letter generation has been saved.",
        });
        refetchActivities();
        setActivityData(null);
      }).catch((error) => {
        console.error("Failed to save letter activity:", error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save the letter activity to the database.",
        });
        setActivityData(null);
      });
    }
  }, [activityData, saveActivity, toast, refetchActivities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    setInputs(prev => ({ ...prev, [id]: value }));

    if (id === 'inAcc') {
      if (value === '') {
        setInputs(prev => ({
          ...prev,
          inName: '', inMeter: '', inOffice: '', inGuardian: '', inMobile: '', inTarrif: '', idueAmt: '0', idueMon: ''
        }));
        setAccNo(null);
        return;
      }

      if (value.length > 4) {
        setAccNo(value);
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
    if (!userEmail) {
      toast({ variant: "destructive", title: "Save Error", description: "User email not found. Preview is available but will not be saved." });
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
    const generationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check for duplicates in the activities list
    const isDuplicate = userActivities?.some(activity => 
      activity.accountNumber === inputs.inAcc &&
      activity.subject === subjectText &&
      activity.date === generationDate
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate Letter",
        description: "Preview generated. A new activity was not logged as it already exists for today.",
      });
      return;
    }

    // Save the activity
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
      // Set activity data which will trigger the hook
      setActivityData(letterData);
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
    setInputs(ensureInputs(activity.formData || {
        inName: activity.consumerName,
        inAcc: activity.accountNumber,
        inMeter: '',
        inGuardian: '',
        inMobile: '',
        inTarrif: '',
        inSmarok: '577.04.26.',
        inOffice: '',
        inDate: activity.date,
        ikwh: '0',
        ipeak: '0',
        ioff: '0',
        idueAmt: '0',
        idueMon: '',
    }));
  }

  const handleDeleteActivityOld = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast({
        title: "Activity Deleted",
        description: "The activity log has been removed.",
      });
      refetchActivities();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete activity."
      });
    }
  }

  return (
    <>
      {isClient ? (
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
      ) : (
        <div>Loading...</div>
      )}
      {isClient && userEmail && (
        <UserActivityLog
          userEmail={userEmail}
          onEdit={handleEdit}
          onDelete={handleDeleteActivityOld}
        />
      )}
    </>
  );
}
