"use server";

// This type should ideally be shared between frontend and backend

export interface LetterInputs {
  inName: string;
  inAcc: string;
  inMeter: string;
  inGuardian: string;
  inMobile: string;
  inTarrif: string;
  inSmarok: string;
  inOffice: string;
  inDate: string;
  ikwh: string;
  ipeak: string;
  ioff: string;
  idueAmt: string;
  idueMon: string;
}

export interface LetterActivity {
  accountNumber: string;
  consumerName: string;
  subject: string;
  createdBy: string;
  date: string;
  letterType: string;
  formData: LetterInputs;
}
