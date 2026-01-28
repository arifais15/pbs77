'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: Array<{ index: number; accNo?: string; error: string }>;
}

export function CSVUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const consumers = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const consumer: any = {};
      
      headers.forEach((header, idx) => {
        // Convert header names to match database schema
        const fieldName = header
          .replace(/meterno/i, 'meterNo')
          .replace(/accno/i, 'accNo')
          .replace(/custname/i, 'name')
          .replace(/fathername/i, 'guardian');
        
        consumer[fieldName] = values[idx] || '';
      });
      
      consumers.push(consumer);
    }
    
    return consumers;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      setProgress(20);

      const consumers = parseCSV(text);
      setProgress(40);

      if (consumers.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid CSV',
          description: 'No consumer records found in the file.',
        });
        setIsLoading(false);
        return;
      }

      // Simulate progressive upload (in chunks)
      const chunkSize = Math.ceil(consumers.length / 5);
      let uploadedCount = 0;
      let totalInserted = 0;
      const uploadErrors: any[] = [];

      for (let i = 0; i < consumers.length; i += chunkSize) {
        const chunk = consumers.slice(i, i + chunkSize);
        
        const res = await fetch('/api/consumers/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consumers: chunk }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await res.json();
        totalInserted += data.inserted || 0;
        if (data.details?.errors) {
          uploadErrors.push(...data.details.errors);
        }

        uploadedCount += chunk.length;
        const newProgress = 40 + (uploadedCount / consumers.length) * 50;
        setProgress(Math.min(newProgress, 90));
      }

      setProgress(95);

      const uploadResult: UploadResult = {
        success: totalInserted > 0,
        inserted: totalInserted,
        failed: uploadErrors.length,
        errors: uploadErrors.length > 0 ? uploadErrors : undefined,
      };

      setResult(uploadResult);

      if (totalInserted > 0) {
        toast({
          title: 'Upload Successful',
          description: `${totalInserted} consumer records imported successfully.`,
        });
        // Refresh page after successful upload
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      if (uploadErrors.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Some Records Failed',
          description: `${uploadErrors.length} records had errors. See details above.`,
        });
      }

      if (totalInserted === 0) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'No records were imported. Check CSV format.',
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Consumers (CSV)
        </CardTitle>
        <CardDescription>
          Upload a CSV file with columns: accNo, name, guardian, meterNo, mobile, address, tarrif
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Uploading...' : 'Select CSV File'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Or drag and drop a CSV file here
          </p>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Import Complete</p>
                    <p className="text-sm text-green-700">
                      ✓ {result.inserted} records imported
                      {result.failed > 0 && ` • ✗ ${result.failed} failed`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Import Failed</p>
                    <p className="text-sm text-red-700">
                      {result.errors?.length ? `${result.errors.length} errors occurred` : 'Unknown error'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
