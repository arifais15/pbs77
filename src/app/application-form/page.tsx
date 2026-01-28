"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { enToBn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConsumer } from "@/hooks/use-database";

type AppType = "refund" | "shift" | "load" | "Install" | "reconn" | "check";

interface AppData {
  custName: string;
  fatherName: string;
  accNo: string;
  meterNo: string;
  mobileNo: string;
  address: string;
  extraDesc: string;
  appType: AppType;
  tarrif: string;
}

export default function ApplicationFormPage() {
  const [appData, setAppData] = useState<AppData>({
    custName: "",
    fatherName: "",
    accNo: "",
    meterNo: "",
    mobileNo: "",
    address: "",
    extraDesc: "",
    appType: "refund",
    tarrif: "",
  });

  const [generatedApp, setGeneratedApp] = useState<React.ReactNode | null>(null);
  const [accNo, setAccNo] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: consumer, isLoading: isSearching } = useConsumer(accNo);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For account number
    if (name === "accNo") {
      if (value === "") {
        setAppData(prev => ({
          ...prev,
          accNo: "",
          custName: "",
          fatherName: "",
          meterNo: "",
          mobileNo: "",
          address: "",
          tarrif: "",
        }));
        setAccNo(null);
        return;
      }

      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      if (digitsOnly.length === 7) {
        // Format as XXX-XXXX
        const formattedAccNo = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
        setAppData(prev => ({ ...prev, accNo: formattedAccNo }));
        setAccNo(formattedAccNo); // Trigger search
      } else {
        setAppData(prev => ({ ...prev, accNo: value }));
        setAccNo(null);
        if (digitsOnly.length > 0) {
          toast({
            variant: "destructive",
            title: "ভুল হিসাব নম্বর",
            description: "হিসাব নম্বর অবশ্যই ৭ সংখ্যার হতে হবে (উদাঃ 5202030)।",
          });
        }
      }
      return;
    }

    // For other fields
    setAppData(prev => ({ ...prev, [name]: value }));
  };

  // Load consumer data when accNo changes
  useEffect(() => {
    if (consumer && consumer.name) {
      setAppData(prev => ({
        ...prev,
        custName: consumer.name || "",
        fatherName: consumer.guardian || "",
        meterNo: consumer.meterNo || "",
        mobileNo: consumer.mobile || "",
        address: consumer.address || "",
        tarrif: consumer.tarrif || "",
      }));
      toast({
        title: "গ্রাহক পাওয়া গেছে",
        description: `${consumer.name} এর তথ্য লোড হয়েছে।`,
      });
    }
  }, [consumer, toast]);

  // Show toast if account number not found
  useEffect(() => {
    if (accNo && !isSearching && !consumer) {
      toast({
        variant: "destructive",
        title: "গ্রাহক পাওয়া যায়নি",
        description: `হিসাব নং ${accNo} এর কোনো তথ্য পাওয়া যায়নি। সঠিক নম্বর নিশ্চিত করুন।`,
      });
    }
  }, [accNo, isSearching, consumer, toast]);

  // Handle Select change
  const handleSelectChange = (value: AppType) => {
    setAppData(prev => ({ ...prev, appType: value }));
  };

  // Generate Application Preview
  const generateApp = () => {
    const today = new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let subject = "", content = "";
    const meter = enToBn(appData.meterNo) || "..............";
    const accNoFormatted = enToBn(appData.accNo) || "..............";

    switch (appData.appType) {
      case "refund":
        subject = "নিরাপত্তা জামানত সমন্বয় অথবা রিফান্ড পাওয়ার জন্য আবেদন।";
        content = `বর্তমানে আমার সংযোগটি স্থায়ীভাবে বিচ্ছিন্ন করা হয়েছে। এমতাবস্থায়, সংযোগ গ্রহণকালে আমার জমাকৃত নিরাপত্তা জামানতের টাকা সর্বশেষ বকেয়া বিলের সাথে সমন্বয় অথবা রিফান্ড প্রদানের প্রয়োজনীয় ব্যবস্থা গ্রহণের অনুরোধ করছি।`;
        break;
      case "shift":
        subject = "বিদ্যুৎ মিটারটি নিরাপদ স্থানে স্থানান্তরের জন্য আবেদন।";
        content = `আমার হিসাব নম্বর ${accNoFormatted} (মিটার নং: ${meter}) বর্তমানে যেখানে স্থাপিত আছে, সেখানে ভবন সংস্কার কাজের কারণে নিরাপদ স্থানে স্থানান্তর করা জরুরি হয়ে পড়েছে। প্রয়োজনীয় ফি গ্রহণপূর্বক মিটারটি স্থানান্তরের অনুমতি দানে আপনার সদয় মর্জি কামনা করছি।`;
        break;
      case "load":
        subject = "অনুমোদিত লোড বৃদ্ধির জন্য আবেদন।";
        content = `বর্তমানে আমার ব্যবহৃত লোড পূর্বের অনুমোদিত লোডের চেয়ে বৃদ্ধি পাওয়ায় এবং অতিরিক্ত বৈদ্যুতিক সরঞ্জাম ব্যবহৃত হওয়ায় অনুমোদিত লোড বৃদ্ধি করা আবশ্যক হয়ে পড়েছে। বিধি মোতাবেক আমার লোড বৃদ্ধিকরণের প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সুমর্জি হয়।`;
        break;
      case "Install":
        subject = "বকেয়া বিদ্যুৎ বিল কিস্তিতে পরিশোধের অনুমতি প্রসঙ্গে আবেদন।";
        content = `আমার হিসাব নম্বর ${accNoFormatted}। বিভিন্ন আর্থিক সীমাবদ্ধতার কারণে নির্ধারিত সময়ে বিদ্যুৎ বিল পরিশোধ করতে না পারায় বর্তমানে আমার নামে ..................মাসের .........................টাকা বকেয়া বিল জমা হয়েছে।\n\nবর্তমানে এককালীনভাবে সম্পূর্ণ বকেয়া বিল পরিশোধ করা আমার পক্ষে সম্ভব নয়। তবে আমি নিয়মিতভাবে কিস্তির মাধ্যমে বকেয়া বিল পরিশোধ করতে আগ্রহী এবং সক্ষম। এমতাবস্থায়, মানবিক বিবেচনায় আমাকে ........... কিস্তির মাধ্যমে উক্ত বকেয়া বিল পরিশোধের সুযোগ প্রদান করার জন্য আপনার সদয় অনুমোদন প্রার্থনা করছি।\nআজকে বকেয়া বিলের ........................টাকা পরিশোধ করতে ইচ্ছুক।\nআমি অঙ্গীকার করছি যে, অনুমোদিত কিস্তি অনুযায়ী নির্ধারিত সময়ের মধ্যে অবশিষ্ট্য সকল বকেয়া বিল পরিশোধ করব এবং ভবিষ্যতে নিয়মিতভাবে বিদ্যুৎ বিল পরিশোধ করব।`;
        break;
      case "reconn":
        subject = "বকেয়া বিদ্যুৎ বিল কিস্তিতে পরিশোধ ও বিচ্ছিন্ন সংযোগ পুনঃসংযোগের অনুমতি প্রসঙ্গে আবেদন।";
        content = `আমার  হিসাব নম্বর ${accNoFormatted}। বিভিন্ন আর্থিক সীমাবদ্ধতার কারণে নির্ধারিত সময়ে বিদ্যুৎ বিল পরিশোধ করতে না পারায় বর্তমানে আমার নামে .................. মাসের ......................... টাকা বকেয়া বিল জমা হয়েছে, যার পরিপ্রেক্ষিতে আমার বিদ্যুৎ সংযোগটি সাময়িকভাবে বিচ্ছিন্ন করা হয়েছে।\n\nবর্তমানে এককালীনভাবে সম্পূর্ণ বকেয়া বিল পরিশোধ করা আমার পক্ষে সম্ভব নয়। তবে আমি নিয়মিতভাবে কিস্তির মাধ্যমে বকেয়া বিল পরিশোধ করতে আগ্রহী ও সক্ষম। এমতাবস্থায়, মানবিক বিবেচনায় আমাকে ........... কিস্তির মাধ্যমে উক্ত বকেয়া বিল পরিশোধের সুযোগ প্রদান করার জন্য আপনার সদয় অনুমোদন প্রার্থনা করছি।\n\nএমতাবস্থায়, আজ বকেয়া বিলের বিপরীতে ........................ টাকা পরিশোধ করতে ইচ্ছুক।\n\nআমি অঙ্গীকার করছি যে, অনুমোদিত কিস্তি অনুযায়ী নির্ধারিত সময়ের মধ্যে অবশিষ্ট সকল বকেয়া বিল পরিশোধ করব এবং ভবিষ্যতে নিয়মিতভাবে বিদ্যুৎ বিল পরিশোধ করব।\nঅতএব, উপরোক্ত বিষয়াদি বিবেচনাপূর্বক কিস্তিতে বকেয়া বিল পরিশোধের অনুমতি প্রদানের পাশাপাশি আমার বিচ্ছিন্নকৃত বিদ্যুৎ সংযোগটি দ্রুত পুনঃসংযোগ প্রদানের জন্য প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সদয় অনুমোদন কামনা করছি।`;
        break;
      case "check":
        subject = "মিটার বা ওয়্যারিং পরীক্ষার আবেদন।";
        content = `আমার  হিসাব নম্বর ${accNoFormatted} এবং মিটার নং: ${meter}-এ বিগত কয়েক মাস যাবত অস্বাভাবিক বিদ্যুৎ বিল প্রদর্শিত হচ্ছে। আমার ধারণা মিটারে কোনো কারিগরি ত্রুটি থাকতে পারে। এমতাবস্থায় মিটারটি বা ইন্টারনাল ওয়্যারিং পরীক্ষা করার প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সুমর্জি হয়।`;
        break;
    }

    setGeneratedApp(
      <div
        id="application-preview"
        className="bg-white p-8 rounded-lg shadow-lg min-h-[500px] overflow-auto text-black font-body print:shadow-none print:border-none"
      >
        <div className="text-[16px] leading-snug mb-4">
          তারিখ: {today}
          <br />
          <br />
          বরাবর,
          <br />
          <strong>সিনিয়র জেনারেল ম্যানেজার</strong>
          <br />
          গাজীপুর পল্লী বিদ্যুৎ সমিতি–২
          <br />
          সদর অফিস, রাজেন্দ্রপুর, গাজীপুর।
        </div>

        <div>
          <div className="font-bold underline my-3 text-[16.5px]">
            বিষয়: {subject}
          </div>
          <div className="text-justify text-[15.5px] leading-relaxed">
            <p>
              জনাব,<br />
              সবিনয় নিবেদন এই যে, আমি আপনার পল্লী বিদ্যুৎ সমিতির একজন নিয়মিত গ্রাহক। {content}
            </p>
            {appData.extraDesc && <p>{appData.extraDesc}</p>}
            <p>অতএব, মহোদয়ের নিকট প্রার্থনা, বিষয়টি বিবেচনা করে প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সুমর্জি হয়।</p>
          </div>
        </div>

        <div className="mt-5 text-[15px] leading-tight w-[250px]">
          বিনীত নিবেদক,<br />
          <br />
          <br />
          -----------------------<br />
          ({appData.custName || ".............."})<br />
          পিতা/অভিভাবক: {appData.fatherName || ".............."}<br />
          হিসাব নং: {enToBn(appData.accNo) || ".............."}<br />
          ঠিকানা: {appData.address || ".............."}<br />
          মোবাইল: {enToBn(appData.mobileNo) || ".............."}
        </div>
      </div>
    );

    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      {/* Back Button */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>আবেদন পত্র তৈরি করুন</CardTitle>
          <CardDescription>প্রয়োজনীয় তথ্য দিয়ে আবেদন পত্র তৈরি করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>আবেদনের ধরণ</Label>
              <Select
                name="appType"
                onValueChange={handleSelectChange}
                defaultValue={appData.appType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an application type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">নিরাপত্তা জামানত রিফান্ড/সমন্বয়</SelectItem>
                  <SelectItem value="shift">মিটার নিরাপদ স্থানে স্থানান্তর</SelectItem>
                  <SelectItem value="load">অনুমোদিত লোড বৃদ্ধি</SelectItem>
                  <SelectItem value="Install">বকেয়া বিদ্যুৎ বিল কিস্তিতে পরিশোধ</SelectItem>
                  <SelectItem value="reconn">বকেয়া বিদ্যুৎ বিল কিস্তিসহ পুনঃসংযোগ</SelectItem>
                  <SelectItem value="check">মিটার বা ওয়্যারিং পরীক্ষা</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="accNo">হিসাব নং</Label>
              <Input
                id="accNo"
                name="accNo"
                value={appData.accNo}
                onChange={handleInputChange}
                placeholder="520-2030"
              />
              {isSearching && (
                <Loader2 className="absolute right-2 top-9 h-4 w-4 animate-spin" />
              )}
            </div>

            {/* Other input fields */}
            <div className="space-y-2">
              <Label htmlFor="custName">আবেদনকারীর নাম</Label>
              <Input id="custName" name="custName" value={appData.custName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherName">পিতা/অভিভাবকের নাম</Label>
              <Input id="fatherName" name="fatherName" value={appData.fatherName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meterNo">মিটার নং</Label>
              <Input id="meterNo" name="meterNo" value={appData.meterNo} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNo">মোবাইল নং</Label>
              <Input id="mobileNo" name="mobileNo" value={appData.mobileNo} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tarrif">ট্যারিফ</Label>
              <Input id="tarrif" name="tarrif" value={appData.tarrif} disabled />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">ঠিকানা/গ্রাম</Label>
              <Input id="address" name="address" value={appData.address} onChange={handleInputChange} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="extraDesc">অতিরিক্ত বর্ণনা (সংক্ষিপ্ত লিখুন)</Label>
              <Textarea id="extraDesc" name="extraDesc" value={appData.extraDesc} onChange={handleInputChange} rows={2} />
            </div>
          </div>

          <Button onClick={generateApp} className="w-full">
            আবেদন পত্র তৈরি করুন
          </Button>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {generatedApp && (
        <Card ref={previewRef}>
          <CardHeader>
            <CardTitle>Application Preview</CardTitle>
            <CardDescription>আপনার তৈরি করা আবেদন পত্র। প্রিন্ট করতে পারেন।</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full max-w-[210mm]">{generatedApp}</div>
            <Button onClick={handlePrint} className="mt-4 print-hidden">
              সরাসরি প্রিন্ট করুন
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
