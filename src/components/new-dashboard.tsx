
'use client';

import type { LetterInputs } from '@/app/dashboard/actions';
import { enToBn } from '@/lib/utils';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface NewDashboardProps {
    letterType: string;
    inputs: LetterInputs;
    showPreview: boolean;
    previewRef: React.RefObject<HTMLDivElement>;
    onLetterTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    isSearching: boolean;
}

export function NewDashboard({
    letterType,
    inputs,
    showPreview,
    previewRef,
    onLetterTypeChange,
    onInputChange,
    onGenerate,
    isSearching
}: NewDashboardProps) {

  const showPfInputs = letterType === 'pf';
  const showDueInputs = ['due', 'pdr', 'legal', 'refund'].includes(letterType);
  
  // Re-calculating bnDate and pfStr for rendering, as they are derived from props
  const bnDate = inputs.inDate
      ? enToBn(new Date(inputs.inDate).toLocaleDateString('bn-BD'))
      : enToBn(new Date().toLocaleDateString('bn-BD'));

  let pfStr = '0.0000';
  if (letterType === 'pf') {
    const kwh = parseFloat(inputs.ikwh) || 0;
    const tkvar = (parseFloat(inputs.ipeak) || 0) + (parseFloat(inputs.ioff) || 0);
    const pf = kwh / Math.sqrt(Math.pow(kwh, 2) + Math.pow(tkvar, 2));
    pfStr = isNaN(pf) ? '0.0000' : pf.toFixed(4);
  }

  const completeLetterContent = (
    <div id="letterContent" className="print-area">
        <div className="header">
          <img
            src="https://iili.io/Fin0JtI.jpg"
            alt="Logo"
            className="logo-img"
          />
          <div className="header-text">
            <h3>গাজীপুর পল্লী বিদ্যুৎ সমিতি–২</h3>
            <p>রাজেন্দ্রপুর, গাজীপুর।</p>
            <div className="contact-info">
              ইমেইল: gazipurpbs2@gmail.com | ওয়েব: pbs2.gazipur.gov.bd
            </div>
          </div>
        </div>

        <div className="meta-row">
          <span>
            স্মারক নং: ২৭.১২.৩৩৩০.<span id="outSmarok">{enToBn(inputs.inSmarok)}</span>
          </span>
          <span>
            তারিখ: <span id="outDate">{bnDate}</span>
          </span>
        </div>

        <div className="recipient-part">
          প্রতি,
          <br />
          <strong>গ্রাহকের নাম:</strong> <span id="outName">{inputs.inName || '................'}</span>
          <br />
          <strong>অভিভাবক/প্রযত্নে:</strong> {inputs.inGuardian || '................'}
          <br />
          <strong>হিসাব নং:</strong> <span id="outAcc">{enToBn(inputs.inAcc)}</span>,{' '}
          <strong>মিটার নং:</strong> <span id="outMeter">{enToBn(inputs.inMeter)}</span>
          <br />
          <strong>ঠিকানা:</strong> <span id="outOffice">{inputs.inOffice}</span>
          <br />
          <strong>মোবাইল:</strong> {enToBn(inputs.inMobile) || '................'},{' '}
          <strong>ট্যারিফ:</strong> {inputs.inTarrif || '................'}
        </div>

        <div className="main-text">
            <div id="s_pf" className={letterType === 'pf' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: নির্ধারিত মানের নিচে পাওয়ার ফ্যাক্টর (PF) বজায় রাখা এবং সারচার্জ আরোপ রোধ প্রসঙ্গে সতর্কীকরণ নোটিশ।</span>
                সম্মানিত গ্রাহক, আপনার বিদ্যুৎ সংযোগের রেকর্ড ও মিটার রিডিং ডাটা পর্যালোচনা করে দেখা গেছে যে, সংশ্লিষ্ট সংযোগের পাওয়ার ফ্যাক্টর বর্তমানে{' '}
                <strong><span id="resPF">{enToBn(pfStr)}</span></strong>, যা বিইআরসি (BERC) নির্ধারিত ন্যূনতম মান ০.৯৫ এর নিচে।বিদ্যুৎ বিতরণ ব্যবস্থার স্থায়িত্ব রক্ষা এবং কারিগরি ক্ষতি (System Loss) হ্রাসের লক্ষ্যে পাওয়ার ফ্যাক্টর নির্ধারিত মানে রাখা বাধ্যতামূলক। নিম্নে আপনার সংযোগের গাণিতিক বিশ্লেষণ প্রদান করা হলো: গাণিতিক বিশ্লেষণ:
                <div className="calc-box">
                  Active Energy (kWh) = <span id="cKwh">{enToBn(inputs.ikwh)}</span> | Total Reactive Energy (kVARh) = <span id="cTk">{enToBn((parseFloat(inputs.ipeak) || 0) + (parseFloat(inputs.ioff) || 0))}</span>
                  <div className="formula">
                    PF = kWh / √ (kWh² + kVARh²) = <span id="cPF">{enToBn(pfStr)}</span>
                  </div>
                </div>
                এমতাবস্থায়, অত্র পত্র প্রাপ্তির ১০ দিনের মধ্যে প্রয়োজনীয় মানের ক্যাপাসিটার ব্যাংক স্থাপনপূর্বক পাওয়ার ফ্যাক্টর উন্নয়নের অনুরোধ করা হলো। ব্যর্থতায় বিইআরসি’র ট্যারিফ নির্দেশিকা অনুযায়ী মাসিক বিলের সাথে অতিরিক্ত সারচার্জ আরোপিত হবে।
              </div>

              <div id="s_due" className={letterType === 'due' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: বকেয়া বিদ্যুৎ বিল পরিশোধ এবং বিদ্যুৎ আইন, ২০১৮ অনুযায়ী সংযোগ বিচ্ছিন্নকরণ প্রসঙ্গে।</span>
                আপনার বিদ্যুৎ সংযোগের বিপরীতে <span id="outDueMon">{inputs.idueMon}</span> মাস পর্যন্ত সর্বমোট{' '}
                <strong><span id="outDueAmt">{enToBn(inputs.idueAmt)}</span>/-</strong>{' '}
                টাকা বকেয়া রয়েছে। বকেয়া বিল একটি সরকারি পাওনা এবং এটি পরিশোধ না করা দণ্ডনীয় অপরাধ। অত্র পত্র প্রাপ্তির ০৭ দিনের মধ্যে সকল পাওনা পরিশোধ নিশ্চিত করার অনুরোধ করা হলো। অন্যথায় কোনো প্রকার পূর্ব নোটিশ ছাড়াই আপনার সংযোগটি বিচ্ছিন্ন করা হবে।
              </div>
              
               <div id="s_pdr" className={letterType === 'pdr' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: বকেয়া আদায়ের লক্ষে PDR Act অনুযায়ী সার্টিফিকেট মামলা দায়েরের চূড়ান্ত নোটিশ।</span>
                আপনার সংযোগটি বকেয়া বিলের কারণে ইতিপূর্বে বিচ্ছিন্ন করা হয়েছে।{' '}
                <span id="outPdrMon">{inputs.idueMon}</span> মাস পর্যন্ত আপনার নিকট সমিতির মোট পাওনা={' '}
                <strong><span id="outPdrAmt">{enToBn(inputs.idueAmt)}</span>/-</strong>{' '}
                টাকা যা দীর্ঘ সময় অতিবাহিত হলেও আপনি পরিশোধ করেননি। অত্র পত্র প্রাপ্তির ১০ দিনের মধ্যে উক্ত বকেয়া অর্থ পরিশোধের জন্য আপনাকে চূড়ান্তভাবে অনুরোধ করা হলো । অন্যথায়, বকেয়া পাওনা আদায়ের লক্ষ্যে আপনার বিরুদ্ধে <strong>The Public Demands Recovery (PDR) Act, 1913</strong> এর সংশ্লিষ্ট ধারা মোতাবেক আদালতে সার্টিফিকেট মামলা দায়েরসহ অন্যান্য প্রয়োজনীয় ব্যবস্থা গ্রহণ করা হবে।
              </div>

              <div id="s_hooking" className={letterType === 'hooking' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: অবৈধভাবে বিদ্যুৎ ব্যবহার (হুকিং/বাইপাস) এবং বিদ্যুৎ আইন–২০১৮ অনুযায়ী দণ্ডারোপ প্রসঙ্গে।</span>
                তদন্তে বর্ণিত মিটার সংযোগ স্থলে আঙিনায় মিটার বাইপাস/সার্ভিস ড্রপ ছিদ্র করে অবৈধভাবে বিদ্যুৎ ব্যবহারের অকাট্য প্রমাণ পাওয়া গেছে। এটি{' '}<strong>বিদ্যুৎ আইন, ২০১৮ এর ধারা ৩২ ,৩৯ ও ৪০</strong> অনুযায়ী জামিন অযোগ্য ফৌজদারি অপরাধ এবং জননিরাপত্তার জন্য চরম হুমকি স্বরূপ। উক্ত অবৈধ হস্তক্ষেপের ফলে সমিতির যে আর্থিক ও কারিগরি ক্ষতি হয়েছে, তার বিপরীতে আপনার ওপর ক্ষতিপূরণমূলক বিল ও জরিমানা (Penalty) আরোপ করা হয়েছে। অত্র পত্র প্রাপ্তির ০৭ দিনের মধ্যে অফিসে যোগাযোগ করে আরোপিত অর্থ পরিশোধ এবং আপনার ওয়্যারিং নিয়মিত করার অনুরোধ করা হলো। অন্যথায় আপনার বিরুদ্ধে বিদ্যুৎ আইন–২০১৮ অনুযায়ী বিদ্যুৎ আদালতে মামলা দায়ের করা হবে।
              </div>
              
              <div id="s_load" className={letterType === 'load' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: অনুমোদিত লোড অপেক্ষা অধিক লোড (Overload) ব্যবহারের কারণে নিয়মিতকরণ নোটিশ।</span>
                আপনার বিদ্যুৎ সংযোগের রেকর্ড ও মিটার রিডিং ডাটা পর্যালোচনা করে দেখা যায়, আপনি আপনার প্রতিষ্ঠানে অনুমোদিত লোড অপেক্ষা অধিক লোড ব্যবহার করছেন যা বিতরণ ট্রান্সফরমারকে/সাবস্টেশনকে ঝুঁকির মুখে ফেলছে। আগামী ০৭ কার্যদিবসের মধ্যে বর্ধিত লোড নিয়মিতকরণের আবেদন না করলে কারিগরি নিরাপত্তার স্বার্থে সংযোগ বিচ্ছিন্ন করা হবে।
              </div>

              <div id="s_board" className={letterType === 'board' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়:মিটার বোর্ড ও সার্ভিস ড্রপ যথাযথ এবং নিরাপদ স্থানে পুনঃস্থাপন প্রসঙ্গে।</span>
                সরেজমিনে পরিদর্শনে প্রতীয়মান হয় যে, আপনার বিদ্যুৎ সংযোগের মিটার বোর্ডটি বর্তমানে অনিরাপদ, অস্বাস্থ্যকর বা দুর্গম স্থানে স্থাপিত রয়েছে। এটি বিদ্যুৎ বিধিমালা ও নিরাপত্তা নির্দেশিকার পরিপন্থী এবং এতে মিটার রিডিং গ্রহণ ও জরুরি রক্ষণাবেক্ষণ কাজে বিঘ্ন সৃষ্টি হচ্ছে। বিদ্যুৎ সরবরাহ ব্যবস্থা নিরাপদ ও ত্রুটিমুক্ত রাখার স্বার্থে আগামী ০৭ (সাত) কার্যদিবসের  মধ্যে আপনার নিজস্ব ব্যবস্থাপনায় এবং সমিতির কারিগরি তত্ত্বাবধানে মিটার বোর্ডটি একটি দৃশ্যমান ও সহজগম্য স্থানে স্থানান্তরের অনুরোধ করা হলো। অন্যথায় নিরাপত্তার স্বার্থে আপনার বিদ্যুৎ সরবরাহ সাময়িকভাবে বিচ্ছিন্ন করা হতে পারে।
              </div>
              <div id="s_sysloss" className={letterType === 'sysloss' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: অস্বাভাবিক কারিগরি ক্ষতি (System Loss) নিয়ন্ত্রণ এবং অভ্যন্তরীণ ওয়্যারিং পরীক্ষা প্রসঙ্গে।</span>
                সম্মানিত গ্রাহক, আপনার বিদ্যুৎ সংযোগের লোড প্রোফাইল এবং মাসিক বিদ্যুৎ ব্যবহার ডাটা বিশ্লেষণ করে দেখা গেছে যে, সংশ্লিষ্ট সংযোগটিতে অস্বাভাবিক কারিগরি ক্ষতি (System Loss) পরিলক্ষিত হচ্ছে। প্রাথমিক কারিগরি পর্যবেক্ষণে প্রতীয়মান হয় যে, এই অপচয় প্রধানত আপনার সংযোগের অভ্যন্তরীণ ওয়্যারিং-এর ত্রুটি, লিকেজ অথবা নিম্নমানের বৈদ্যুতিক সরঞ্জাম ব্যবহারের ফলে সৃষ্টি হচ্ছে। <br /> <br /> বিদ্যুৎ সরবরাহ বিধিমালা অনুযায়ী, মিটার পরবর্তী অভ্যন্তরীণ ওয়্যারিং যথাযথ ও ত্রুটিমুক্ত রাখা গ্রাহকের একান্ত দায়িত্ব। ওয়্যারিং-এ ত্রুটি থাকলে একদিকে যেমন আপনার বিদ্যুৎ বিলের পরিমাণ অনাকাঙ্ক্ষিতভাবে বৃদ্ধি পায়, অন্যদিকে এটি শর্ট-সার্কিট বা ভয়াবহ অগ্নিকাণ্ডের ঝুঁকি তৈরি করে। <br /> <br /> এমতাবস্থায়, অত্র পত্র প্রাপ্তির ০৭ (সাত) কার্যদিবসের মধ্যে একজন লাইসেন্সপ্রাপ্ত অভিজ্ঞ ইলেকট্রিশিয়ান দ্বারা আপনার সংযোগের সম্পূর্ণ ওয়্যারিং পরীক্ষা করে ওয়্যারিং প্রতিবেদন অত্র দপ্তরে দাখিল করার জন্য অনুরোধ করা হলো, অন্যথায় কারিগরি নিরাপত্তার স্বার্থে আপনার সংযোগটি সাময়িকভাবে বিচ্ছিন্ন করা হতে পারে।
              </div>

              <div id="s_seal" className={letterType === 'seal' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: মিটারের সিল টেম্পারিং, কারিগরি কারসাজি এবং অবৈধ হস্তক্ষেপের কারণে দণ্ডারোপ ও আইনানুগ ব্যবস্থা গ্রহণ সংক্রান্ত।</span>
                উপযুক্ত বিষয়ে আপনার দৃষ্টি আকর্ষণপূর্বক জানানো যাচ্ছে যে, গত .................... তারিখ সমিতির একটি বিশেষ টাস্কফোর্স/পরিদর্শন দল কর্তৃক আপনার বিদ্যুৎ সংযোগটি সরেজমিনে পরিদর্শন করা হয়। পরিদর্শনকালে সংশ্লিষ্ট মিটারের বডি সিল (Body Seal) এবং টার্মিনাল সিল (Terminal Seal) ভাঙা/টেম্পারিং করা অবস্থায় পাওয়া গেছে। এছাড়াও মিটারের অভ্যন্তরীণ কারিগরি কারসাজির মাধ্যমে প্রকৃত বিদ্যুৎ ব্যবহার গোপন করার সুনির্দিষ্ট প্রমাণ পাওয়া গেছে। <br /> <br /> মিটারের সিল টেম্পারিং বা অন্য কোনো উপায়ে মিটারে অবৈধ হস্তক্ষেপ করা{' '} <strong>বিদ্যুৎ আইন, ২০১৮ এর ৩২,৩৯ ও ৪০ ধারা</strong> এবং বাংলাদেশ এনার্জি রেগুলেটরি কমিশন (BERC) এর বিদ্যুৎ সরবরাহ বিধিমালা অনুযায়ী একটি গুরুতর দণ্ডনীয় অপরাধ। এই অবৈধ কারসাজির ফলে সমিতি বিপুল পরিমাণ আর্থিক ক্ষতির সম্মুখীন হয়েছে, যা একটি সরকারি পাওনা আত্মসাতের শামিল। <br /> <br /> উক্ত অপরাধের প্রেক্ষিতে পবিস নির্দেশিকা ও প্রচলিত আইন অনুযায়ী আপনার বিদ্যুৎ সংযোগটি তাৎক্ষণিকভাবে বিচ্ছিন্ন করা হয়েছে। এমতাবস্থায়, বিইআরসি’র নীতিমালা অনুযায়ী আপনার ওপর আরোপিত জরিমানার অর্থ, ক্ষতিপূরণমূলক বিল এবং নতুন মিটার ফি আগামী ০৩ (তিন) কার্যদিবসের মধ্যে অত্র দপ্তরের জমা প্রদান করে সংযোগটি নিয়মিত করার জন্য অনুরোধ করা হলো। <br /> <br /> নির্ধারিত সময়ের মধ্যে জরিমানা পরিশোধে ব্যর্থ হলে আপনার বিরুদ্ধে নিয়মিত ফৌজদারি মামলা দায়েরসহ পাওনা আদায়ের লক্ষে আইনানুগ ব্যবস্থা গ্রহণ করা হবে।
              </div>

              <div id="s_obst" className={letterType === 'obst' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: সরকারি দাপ্তরিক কাজে বাধা প্রদান, সমিতির কর্মীদের সাথে অসদাচরণ এবং আইনানুগ ব্যবস্থা গ্রহণ সংক্রান্ত।</span>
                উপযুক্ত বিষয়ে আপনার দৃষ্টি আকর্ষণপূর্বক জানানো যাচ্ছে যে, গত .................... তারিখ গাজীপুর পল্লী বিদ্যুৎ সমিতি-২ এর কারিগরি/মিটার রিডিং বিভাগীয় কর্মীবৃন্দ আপনার আঙিনায় রুটিন মাফিক মিটার রিডিং গ্রহণ/লাইন রক্ষণাবেক্ষণ/তদন্ত কাজে নিয়োজিত থাকাকালীন আপনি এবং আপনার প্রতিনিধি কর্তৃক চরমভাবে বাধা প্রদান করা হয়েছে। এছাড়াও কর্তব্যরত কর্মীদের সাথে অশোভন ও অপেশাদার আচরণের অভিযোগ পাওয়া গেছে। <br /> <br /> স্মর্তব্য যে, পল্লী বিদ্যুৎ সমিতির সকল কর্মকর্তা ও কর্মচারী সরকারি সেবা প্রদানের লক্ষে নিয়োজিত এবং তাদের দাপ্তরিক কাজে বাধা প্রদান করা{' '} <strong>বাংলাদেশ দণ্ডবিধি (Penal Code, 1860) এর ধারা ১৫২/১৮৬/৫০৪</strong>{' '} এবং <strong>বিদ্যুৎ আইন, ২০১৮</strong> অনুযায়ী একটি আমলযোগ্য অপরাধ। সমিতির কর্মীবৃন্দ আইনানুগভাবে আপনার প্রাঙ্গণে প্রবেশের অধিকার রাখেন এবং তাদের নিরাপত্তা ও কাজে সহযোগিতা নিশ্চিত করা গ্রাহক হিসেবে আপনার অন্যতম দায়িত্ব। <br /> <br /> এহেন কর্মকাণ্ড সমিতির স্বাভাবিক কার্যক্রম ও গ্রাহক সেবায় বিঘ্ন ঘটায়, যা কোনোভাবেই গ্রহণযোগ্য নয়। এমতাবস্থায়, অত্র পত্রের মাধ্যমে আপনাকে এ ধরণের কর্মকাণ্ড থেকে বিরত থাকার জন্য কঠোরভাবে সতর্ক করা হলো। ভবিষ্যতে দাপ্তরিক কাজে বাধা প্রদান বা কর্মীদের সাথে অসদাচরণের পুনরাবৃত্তি ঘটলে বিদ্যুৎ সরবরাহ বিধিমালা অনুযায়ী আপনার বিদ্যুৎ সংযোগটি স্থায়ীভাবে বিচ্ছিন্ন করাসহ আপনার বিরুদ্ধে নিয়মিত ফৌজদারি মামলা দায়ের করা হবে। <br /> <br /> বিষয়টি অতীব জরুরি এবং আপনার সহযোগিতার লক্ষে সতর্ক করা হলো।
              </div>

              <div id="s_trans" className={letterType === 'trans' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: অনুমোদিত লোড অপেক্ষা অধিকতর লোড ব্যবহার এবং অবহেলার কারণে বিতরণ ট্রান্সফরমার পুড়ে যাওয়া সংক্রান্ত।</span>
                সম্মানিত গ্রাহক, উপযুক্ত বিষয়ে জানানো যাচ্ছে যে, গত .................... তারিখে আপনার প্রতিষ্ঠানে বিদ্যুৎ সরবরাহকারী বিতরণ ট্রান্সফরমারটি কারিগরি ত্রুটির কারণে বিকল/পুড়ে গেছে। সমিতির কারিগরি টিমের প্রাথমিক তদন্ত ও লোড ডাটা বিশ্লেষণে প্রতীয়মান হয় যে, আপনার প্রতিষ্ঠানে অনুমোদিত লোড অপেক্ষা অতিরিক্ত লোড (Overload) ব্যবহার এবং অভ্যন্তরীণ কারিগরি ত্রুটির কারণে সৃষ্ট উচ্চ চাপের ফলে উক্ত ট্রান্সফরমারটি পুড়ে গেছে। <br /> <br /> বিদ্যুৎ সরবরাহ বিধিমালা ও পবিস নির্দেশিকা অনুযায়ী, গ্রাহকের অব্যবস্থাপনা বা ওভারলোডের কারণে বিতরণ ব্যবস্থা বা ট্রান্সফরমার ক্ষতিগ্রস্ত হলে উক্ত ক্ষতির দায়ভার সংশ্লিষ্ট গ্রাহককে বহন করতে হয়। একটি ট্রান্সফরমার পুড়ে যাওয়ার ফলে সমিতির বিপুল পরিমাণ আর্থিক ক্ষতি সাধিত হওয়ার পাশাপাশি ওই এলাকার সাধারণ গ্রাহকগণ দীর্ঘ সময় বিদ্যুৎ বিভ্রাটের সম্মুখীন হয়েছেন, যা অত্যন্ত অনভিপ্রেত। <br /> <br /> এমতাবস্থায়, পবিস নীতিমালার আলোকে ক্ষতিগ্রস্ত ট্রান্সফরমার প্রতিস্থাপন বা মেরামত বাবদ ব্যয়ভার এবং আনুষঙ্গিক চার্জ নির্ধারণের লক্ষে অত্র পত্র প্রাপ্তির ০৩ (তিন) কার্যদিবসের মধ্যে অফিসে সরাসরি যোগাযোগের জন্য অনুরোধ করা হলো।
              </div>
              <div id="s_legal" className={letterType === 'legal' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: দীর্ঘকালীন বকেয়া বিদ্যুৎ বিল আদায়ের লক্ষে আইনানুগ ব্যবস্থা গ্রহণের চূড়ান্ত সতর্কবার্তা (Final Notice before Legal Action)।</span>
                উপযুক্ত বিষয়ে আপনার দৃষ্টি আকর্ষণপূর্বক জানানো যাচ্ছে যে, আপনার বিদ্যুৎ সংযোগের বিপরীতে দীর্ঘদিনের বকেয়া পাওনা আদায়ের লক্ষে সমিতি কর্তৃক ইতিপূর্বে একাধিকবার মৌখিক তাগাদা ও লিখিত নোটিশ প্রদান করা হয়েছে। অত্যন্ত দুঃখের বিষয় যে, দীর্ঘ সময় অতিবাহিত হওয়ার পরেও বকেয়া পাওনা পরিশোধে আপনি কোনো কার্যকর পদক্ষেপ গ্রহণ করেননি, যা  অফিসিয়াল পাওনা আদায়ের ক্ষেত্রে চরম অসহযোগিতার শামিল। <br /> <br /> স্মর্তব্য যে, বকেয়া বিদ্যুৎ বিল একটি সরকারি পাওনা এবং এটি পরিশোধ না করা <strong>বিদ্যুৎ আইন, ২০১৮</strong> এবং সমিতির প্রচলিত গ্রাহক সেবা নীতিমালার পরিপন্থী। আপনার এই অনমনীয় অবস্থানের প্রেক্ষিতে সমিতি আপনার বিরুদ্ধে নিয়মিত দেওয়ানি বা ফৌজদারি মামলা দায়েরসহ পাওনা আদায়ের লক্ষে{' '} <strong>The Public Demands Recovery (PDR) Act, 1913</strong>{' '} অনুযায়ী সার্টিফিকেট মামলা দায়েরের চূড়ান্ত সিদ্ধান্ত গ্রহণ করেছে। <br /> <br /> এমতাবস্থায়, মামলার দীর্ঘসূত্রিতা,আইনি জটিলতা এবং আনুষঙ্গিক ব্যয়ভার এড়াতে অত্র পত্র প্রাপ্তির আগামী ০৭ (সাত) কার্যদিবসের মধ্যে সকল বকেয়া পাওনা ও সারচার্জ পরিশোধের শেষ সুযোগ প্রদান করা হলো। অন্যথায়, আপনার বিরুদ্ধে আইনগত ব্যবস্থা গ্রহণ করা হবে এবং মামলা সংক্রান্ত সকল প্রকার আইনি ও প্রশাসনিক ব্যয়ভার আপনাকে বহন করতে হবে।
              </div>
              <div id="s_refund" className={letterType === 'refund' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: জমাকৃত নিরাপত্তা জামানত (Security Deposit) সমন্বয় অথবা রিফান্ড প্রদান সংক্রান্ত।</span>
                সম্মানিত গ্রাহক, উপযুক্ত বিষয়ে আপনার আবেদনের প্রেক্ষিতে জানানো যাচ্ছে যে, গাজীপুর পল্লী বিদ্যুৎ সমিতি-২ এর প্রচলিত নীতিমালা অনুযায়ী আপনার অনুকূলে জমাকৃত নিরাপত্তা জামানতের (Security Deposit) অর্থ সমন্বয় অথবা রিফান্ড করার বিষয়টি সদয় অনুমোদন করা হয়েছে। <br /> <br /> সংশ্লিষ্ট রেকর্ড পর্যালোচনা করে দেখা গেছে যে, আপনার সংযোগটি বর্তমানে [অস্থায়ীভাবে বিচ্ছিন্ন/স্থায়ীভাবে বিচ্ছিন্ন/চালু] অবস্থায় রয়েছে। পবিস নির্দেশিকা অনুযায়ী, যদি আপনার কোনো বকেয়া বিদ্যুৎ বিল বা আনুষঙ্গিক পাওনা অবশিষ্ট থাকে, তবে উক্ত নিরাপত্তা জামানতের অর্থ হতে তা সমন্বয় করা হবে। বকেয়া সমন্বয়ের পর অবশিষ্ট অর্থ (যদি থাকে) আপনাকে অ্যাকাউন্ট পেয়ী চেকের মাধ্যমে ফেরত প্রদান করা হবে অথবা সচল অ্যাকাউন্টের ক্ষেত্রে পরবর্তী বিদ্যুৎ বিলের সাথে ক্রেডিট হিসেবে সমন্বয় করা হবে। <br /> <br /> এমতাবস্থায়, উক্ত সমন্বয় বা রিফান্ড প্রক্রিয়াটি সম্পন্ন করার লক্ষে আপনার মূল জামানত রশিদ (Original Money Receipt), সর্বশেষ পরিশোধিত বিদ্যুৎ বিলের কপি এবং জাতীয় পরিচয়পত্রের ফটোকপিসহ আগামী ০৭ (সাত) কার্যদিবসের মধ্যে অত্র দপ্তরের বিলিং শাখায় যোগাযোগের জন্য অনুরোধ করা হলো। <br /> <br /> উল্লেখ্য যে, মূল জামানত রশিদ হারিয়ে গেলে জিডির কপি ও বিধি মোতাবেক নির্ধারিত স্ট্যাম্পে অঙ্গীকারনামা দাখিল সাপেক্ষে পরবর্তী ব্যবস্থা গ্রহণ করা হবে।
              </div>

              <div id="s_shift" className={letterType === 'shift' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: সমিতির পূর্বানুমতি ব্যতিরেকে অবৈধভাবে বিদ্যুৎ মিটার স্থানান্তর এবং দণ্ডারোপ প্রসঙ্গে।</span>
                উপযুক্ত বিষয়ে আপনার দৃষ্টি আকর্ষণপূর্বক জানানো যাচ্ছে যে, সরেজমিনে তদন্ত/পরিদর্শনে দেখা গেছে আপনি আপনার বিদ্যুৎ মিটারটি (মিটার নং:{' '}
                <span id="outMeterShift">{enToBn(inputs.inMeter)}</span>) সমিতির কোনো প্রকার লিখিত পূর্বানুমতি বা কারিগরি তদারকি ছাড়াই আদি স্থান হতে অন্য স্থানে স্থানান্তর করেছেন। <br /> <br /> বিদ্যুৎ সরবরাহ বিধিমালা ও পবিস নির্দেশিকা অনুযায়ী, একজন গ্রাহক নিজ উদ্যোগে বা কোনো বেসরকারি ইলেকট্রিশিয়ান দ্বারা মিটার স্থানান্তর করার অধিকার রাখেন না। এটি একটি গুরুতর দণ্ডনীয় অপরাধ।এই ধরণের অবৈধ স্থানান্তরের ফলে মিটারের সিল ক্ষতিগ্রস্ত হতে পারে এবং কারিগরি ত্রুটির কারণে বড় ধরণের অগ্নিকাণ্ডের বা বিদ্যুৎ দুর্ঘটনার ঝুঁকি তৈরি হয়। এছাড়াও, এতে সমিতির ডাটাবেজে আপনার মিটারের প্রকৃত অবস্থান ও রিডিং গ্রহণে বিভ্রান্তি সৃষ্টি হচ্ছে। <br />`,' <br /> এমতাবস্থায়, অত্র পত্র প্রাপ্তির ০৫ (পাঁচ) কার্যদিবসের মধ্যে অফিসে উপস্থিত হয়ে নির্ধারিত মিটার স্থানান্তর ফি, কারিগরি ফি এবং দণ্ড বা জরিমানা প্রদানপূর্বক উক্ত সংযোগটি নিয়মিত করার জন্য নির্দেশ প্রদান করা হলো। <br /> <br /> অন্যথায়, বিদ্যুৎ আইন অনুযায়ী আপনার সংযোগটি স্থায়ীভাবে বিচ্ছিন্ন করাসহ অবৈধ হস্তক্ষেপের দায়ে আপনার বিরুদ্ধে নিয়মিত ফৌজদারি মামলা দায়ের করা হবে। বিষয়টি অতীব জরুরি।
              </div>

              <div id="s_general" className={letterType === 'general' ? 'show-sec' : 'hidden-sec'}>
                <span className="subject">বিষয়: দাপ্তরিক আবেদন নিষ্পত্তি এবং কর্তৃপক্ষের সিদ্ধান্ত অবহিতকরণ প্রসঙ্গে।</span>
                সম্মানিত গ্রাহক, উপযুক্ত বিষয়ে আপনার দাখিলকৃত আবেদনের (রিসিপ্ট নং/তারিখ: ....................) প্রেক্ষিতে জানানো যাচ্ছে যে, গাজীপুর পল্লী বিদ্যুৎ সমিতি-২ এর প্রচলিত বিধিমালা, বিদ্যমান ট্যারিফ নির্দেশিকা এবং ঊর্ধ্বতন কর্তৃপক্ষের সিদ্ধান্ত অনুযায়ী আপনার বিষয়টি গুরুত্বের সাথে পর্যালোচনা করা হয়েছে। <br />* * * পর্যালোচনা শেষে আপনার আবেদনের বিষয়টি সমিতির বিদ্যমান নীতিমালা অনুযায়ী যথাযথভাবে নিষ্পত্তি করা হয়েছে। উক্ত নিষ্পত্তির ফলাফল এবং এ সংক্রান্ত পরবর্তী দাপ্তরিক নির্দেশনা বা করণীয় সম্পর্কে বিস্তারিত তথ্য জানার জন্য আপনাকে আপনার সংশ্লিষ্ট অফিসে (সদস্য সেবা বিভাগ) সরাসরি যোগাযোগের জন্য অনুরোধ করা হলো। <br /> <br /> পল্লী বিদ্যুৎ সমিতির সেবার মান উন্নয়নে আপনার সহযোগিতা একান্ত কাম্য। আপনার কোনো জিজ্ঞাসা থাকলে অফিস চলাকালীন সময়ে সরাসরি যোগাযোগ করার জন্য অনুরোধ করা হলো।
              </div>
        </div>

        <div className="sig-block">
          {/* <span className="handwriting">Arif</span> */}
          <span
            id="outSigDate"
            style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}
          >তারিখ: {bnDate}</span>
          <div className="sig-line"></div>
          <strong>সহকারী মহাব্যবস্থাপক (ফাইন্যান্স)</strong>
          <br />
          গাজীপুর পল্লী বিদ্যুৎ সমিতি–২
        </div>

        <div className="copy-to">
          <strong>অনুলিপি সদয় অবগতির জন্য (প্রযোজ্য ক্ষেত্রে):</strong>
          <br />
          ১. ডিজিএম (কারিগরি/সদর-দপ্তর), গাজীপুর পবিস-২।
          <br />
          ২. এজিএম (ওএন্ডএম/আইটি/সদস্য সেবা), গাজীপুর পবিস-২।
          <br />
          ৩. সংশ্লিষ্ট গ্রাহক ফাইল/অফিস কপি।
        </div>
      </div>
  );

  return (
    <>
      <style jsx global>{`
        /* Base Configuration */
        .dashboard-body * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
        }

        .dashboard-body {
            font-family: 'Nikosh','SolaimanLipi', Arial, sans-serif;
            background: #eaeff2;
            margin: 0;
            padding: 20px;
            color: #1a1a1a;
        }

        /* Configuration Panel Style */
        .dashboard-body .no-print-area {
            max-width: 1000px;
            margin: 0 auto 30px auto;
            background: #fff;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-top: 5px solid #1a5276;
        }

        .grid-form {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        
        .grid-form > .relative {
            position: relative;
        }

        .full {
            grid-column: span 3;
        }

        .dashboard-body label {
            font-weight: bold;
            font-size: 18px;
            color: #1a5276;
        }

        .dashboard-body input, .dashboard-body select, .dashboard-body button.gen-btn {
            width: 100%;
            padding: 12px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            margin-top: 5px;
            font-size: 18px;
        }

        .dashboard-body button.gen-btn {
                background: #1a5276;
                color: white;
                font-weight: bold;
                cursor: pointer;
                border: none;
                font-size: 18px;
                margin-top: 20px;
                transition: 0.2s;
            }

        .dashboard-body button.gen-btn:hover {
                    background: #154360;
                }

        /* Letter A4 Page Styling */
        #letterPreview {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-bottom: 50px;
        }

        .print-area {
            background: white; /* Ensure preview has white background */
        }
        
        #letterContent {
            width: 210mm;
            height: 297mm;
            padding: 15mm 20mm 15mm 25mm;
            background: white;
            position: relative;
            font-family: 'Nikosh', serif;
            font-size: 15.5px;
            line-height: 1.6;
            color: #000;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }

        /* Letterhead Design */
        #letterContent .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px; 
            color: #1a5276;
        }
        
        #letterContent .header h3 {
            margin: 0; 
            font-weight: bold;
            font-size: 1.3rem;
            line-height: 1;
        }
    
        #letterContent .header p {
            margin: 1px 0;
            font-size: 0.9rem;
        }
    
        #letterContent .header .contact-info {
            margin-top: 3px;
            font-size: 0.8rem;
            color: #555;
            border-top: 1px solid #eee;
            display: inline-block;
            padding-top: 3px;
        }
        
        #letterContent .logo-img {
          width: 65px;
          height: auto;
        }
        
        #letterContent .header-text h3, #letterContent .header-text p {
          margin: 0;
          padding: 0;
        }
        
        #letterContent .contact-info {
          font-size: 0.9em;
          margin-top: 5px;
        }

        /* Body Elements */
        .meta-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .recipient-part {
            margin-bottom: 20px;
            line-height: 1.15;
        }

        .subject {
            font-weight: bold;
            text-decoration: underline;
            margin: 15px 0;
            display: block;
            text-align: justify;
            line-height: 1.4;
        }

        .main-text {
            text-align: justify;
            min-height: 200px;
        }

        /* Calculation Box */
        .calc-box {
            margin: 15px 0;
            padding: 12px;
            border: 1.5px solid #000;
            background: #f9f9f9;
            font-size: 14px;
        }

        .formula {
            font-family: 'Times New Roman', serif;
            font-size: 19px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
        }

        /* Signature & Copy To (New Layout) */
        .sig-block {
            margin-top: 40px;
            float: right;
            text-align: center;
            width: 250px;
            margin-bottom: 40px;
        }

        .handwriting {
            font-family: 'Great Vibes', cursive;
            font-size: 45px;
            color: #0b2161;
            display: block;
            margin-bottom: -22px;
            transform: rotate(-3deg);
        }

        .sig-line {
            border-top: 1.5px solid #000;
            width: 190px;
            margin: 2px auto;
        }

        .copy-to {
            clear: both;
            margin-top: 30px;
            font-size: 13px;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: justify;
            line-height: 1.15;
            width: 100%;
        }

        /* Utility Classes */
        .hidden-sec {
            display: none;
        }

        .show-sec {
            display: block;
        }
        
        /* Page Switch Button style */
        .btn-home-small {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 12px;
            background-color: #1a5276;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        .control-btns {
            text-align: center;
            margin-top: 20px;
        }

      `}</style>
      
      <div className="dashboard-body">
        <div className="no-print-area">
          <div style={{ textAlign: 'center', marginTop: 0, color: '#1a5276' }}>
            <h1 style={{ display: 'inline-block', margin: 0, verticalAlign: 'middle' }}>
            বিলিং শাখার পত্র ব্যবস্থাপনা সিস্টেম
            </h1>
          </div>

          <div className="grid-form">
            <div className="full">
              <label>পত্রের বিষয়বস্তু ক্যাটাগরি অনুযায়ী নির্বাচন করুন</label>
              <select id="lType" value={letterType} onChange={onLetterTypeChange}>
                <optgroup label="বকেয়া ও আইনি পদক্ষেপ (Arrears & Legal)">
                  <option value="due">১. বকেয়া বিল ও সংযোগ বিচ্ছিন্নকরণ নোটিশ</option>
                  <option value="pdr">২. বকেয়া আদায়ের লক্ষে PDR মামলা দায়েরের চূড়ান্ত নোটিশ</option>
                  <option value="legal">৩. বকেয়া আদায়ের লক্ষে আইনি নোটিশ (Pre-Legal Action)</option>
                  <option value="refund">৪. নিরাপত্তা জামানত সমন্বয় ও রিফান্ড সংক্রান্ত তথ্য</option>
                </optgroup>
                <optgroup label="কারিগরি ও সিস্টেম (Technical & System)">
                  <option value="pf">৫. পাওয়ার ফ্যাক্টর (PF) উন্নয়ন ও সারচার্জ সংক্রান্ত</option>
                  <option value="load">৬. অনুমোদিত লোড অপেক্ষা অধিক লোড নিয়মিতকরণ</option>
                  <option value="sysloss">৭. অস্বাভাবিক সিস্টেম লস ও অভ্যন্তরীণ ওয়্যারিং পরীক্ষা</option>
                  <option value="board">৮. মিটার বোর্ড ও সার্ভিস ড্রপ নিরাপদ স্থানে পুনঃস্থাপন</option>
                  <option value="trans">৯. গ্রাহক অবহেলায় ট্রান্সফরমার পুড়লে ব্যবস্থা গ্রহণ</option>
                </optgroup>
                <optgroup label="অবৈধ ব্যবহার ও শৃঙ্খলা (Irregularities)">
                  <option value="hooking">১০. অবৈধ বিদ্যুৎ ব্যবহার (হুকিং/বাইপাস) ও ফৌজদারি ব্যবস্থা</option>
                  <option value="seal">১১. মিটার সিল টেম্পারিং ও অবৈধ হস্তক্ষেপের দণ্ড</option>
                  <option value="shift">১২. অনুমতি ব্যতিরেকে অবৈধ মিটার স্থানান্তর দণ্ড</option>
                  <option value="obst">১৩. দাপ্তরিক কাজে বাধা প্রদান ও অসদাচরণ সংক্রান্ত</option>
                  <option value="general">১৪. সাধারণ প্রশাসনিক যোগাযোগ ও নির্দেশাবলী</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label>গ্রাহকের নাম</label>
              <input id="inName" type="text" placeholder="মোঃ ..." value={inputs.inName} onChange={onInputChange} />
            </div>
            <div className="relative">
              <label>হিসাব নং</label>
              <input id="inAcc" type="text" value={inputs.inAcc} onChange={onInputChange} placeholder="Search by Account No..." />
              {isSearching && <Loader2 className="absolute right-3 top-10 h-5 w-5 animate-spin text-primary" />}
            </div>
            <div>
              <label>মিটার নং</label>
              <input id="inMeter" type="text" value={inputs.inMeter} onChange={onInputChange} />
            </div>
            <div>
              <label>অভিভাবক/প্রযত্নে</label>
              <input id="inGuardian" type="text" value={inputs.inGuardian} onChange={onInputChange} />
            </div>
            <div>
              <label>মোবাইল নং</label>
              <input id="inMobile" type="text" value={inputs.inMobile} onChange={onInputChange} />
            </div>
            <div>
              <label>ট্যারিফ</label>
              <input id="inTarrif" type="text" value={inputs.inTarrif} onChange={onInputChange} disabled />
            </div>
            <div>
              <label>স্মারক নং (শেষ অংশ)</label>
              <input id="inSmarok" type="text" value={inputs.inSmarok} onChange={onInputChange} />
            </div>
            <div>
              <label>তারিখ</label>
              <input id="inDate" type="date" value={inputs.inDate} onChange={onInputChange} />
            </div>
            <div>
              <label>ঠিকানা</label>
              <input id="inOffice" type="text" value={inputs.inOffice} onChange={onInputChange} />
            </div>

            {showPfInputs && (
              <div id="pfInputs" className="full grid-form" style={{ background: '#eaf2f8', padding: '10px', borderRadius: '5px' }}>
                <div>
                  <label>kWh</label>
                  <input id="ikwh" type="number" value={inputs.ikwh} onChange={onInputChange} />
                </div>
                <div>
                  <label>Peak kVARh</label>
                  <input id="ipeak" type="number" value={inputs.ipeak} onChange={onInputChange} />
                </div>
                <div>
                  <label>Off-Peak kVARh</label>
                  <input id="ioff" type="number" value={inputs.ioff} onChange={onInputChange} />
                </div>
              </div>
            )}

            {showDueInputs && (
              <div id="dueInputs" className="full grid-form" style={{ background: '#fdf2e9', padding: '10px', borderRadius: '5px' }}>
                <div>
                  <label>টাকার পরিমাণ</label>
                  <input id="idueAmt" type="number" value={inputs.idueAmt} onChange={onInputChange} />
                </div>
                <div>
                  <label>বকেয়া মাস পর্যন্ত</label>
                  <input id="idueMon" type="text" placeholder="উদা: ডিসেম্বর/২০২৫" value={inputs.idueMon} onChange={onInputChange} />
                </div>
              </div>
            )}

            <button className="gen-btn full" onClick={onGenerate}>পত্র জেনারেট করুন</button>
          </div>
        </div>

        {showPreview && (
          <div id="letterPreview" ref={previewRef}>
            {completeLetterContent}
            <div className="control-btns no-print-area">
              <button
                id="printBtn"
                onClick={() => window.print()}
                style={{
                  width: '120px',
                  background: '#2c3e50',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  marginRight: '10px',
                }}
              >
                Print
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
