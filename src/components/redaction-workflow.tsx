"use client";

import { useState, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { redactDocument } from "@/actions/redact";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, FileText, Download, AlertCircle, Loader2, Sparkles, Quote, ClipboardList } from "lucide-react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type Status = "idle" | "preview" | "redacting" | "success" | "error";
type LLMOption = "GPT-3.5" | "LLaMA" | "Gemma 2";
type AnonymizationReport = { category: string; count: number }[];


export default function RedactionWorkflow() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [llm, setLlm] = useState<LLMOption>("GPT-3.5");
  const [generateSummary, setGenerateSummary] = useState(false);
  const [generateAnonymizationReport, setGenerateAnonymizationReport] = useState(false);
  const [progress, setProgress] = useState(0);
  const [redactedContent, setRedactedContent] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [anonymizationReport, setAnonymizationReport] = useState<AnonymizationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus("preview");
      setError(null);
      setRedactedContent(null);
      setSummary(null);
      setAnonymizationReport(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "image/*": [], "text/plain": [] },
    maxFiles: 1,
  });

  const filePreview = useMemo(() => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      return <Image src={url} alt="Preview" width={500} height={700} className="rounded-md object-contain max-h-[70vh]" />;
    }
    if (file.type === "application/pdf") {
      return <iframe src={url} className="w-full h-[70vh] rounded-md border" title="PDF Preview" />;
    }
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="mt-2 font-medium">{file.name}</p>
      </div>
    );
  }, [file]);

  const handleRedact = async () => {
    if (!file) return;

    setStatus("redacting");
    setProgress(30);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("llm", llm);
    if (user) {
      formData.append("userId", user.uid);
    }
    if (generateSummary) {
      formData.append("generateSummary", "true");
    }
    if (generateAnonymizationReport) {
      formData.append("generateAnonymizationReport", "true");
    }
    
    // Simulate progress
    const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
    }, 500);

    try {
      const result = await redactDocument(formData);
      clearInterval(interval);
      setProgress(100);

      if (result.success) {
        setRedactedContent(result.redactedContent!);
        setSummary(result.summary || null);
        setAnonymizationReport(result.anonymizationReport || null);
        setStatus("success");
        toast({
          title: "Redaction Complete",
          description: "Your document has been successfully processed.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (e: any) {
      clearInterval(interval);
      setError(e.message || "An unknown error occurred.");
      setStatus("error");
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: e.message || "Please try again.",
      });
    }
  };

  const handleDownload = () => {
    if (!redactedContent) return;
    const blob = new Blob([redactedContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redacted-${file?.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const resetWorkflow = () => {
    setFile(null);
    setStatus('idle');
    setRedactedContent(null);
    setSummary(null);
    setAnonymizationReport(null);
    setError(null);
    setProgress(0);
    setGenerateSummary(false);
    setGenerateAnonymizationReport(false);
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {status === "idle" && (
          <div
            {...getRootProps()}
            className={cn(
              "electric-border flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary",
               isDragActive && "active border-primary bg-accent/50"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold text-lg">Drag & drop a file here, or click to select</p>
            <p className="text-muted-foreground mt-1 text-sm">Supports PDF, images, and text files</p>
            {isDragActive ? <p className="mt-2 text-primary text-sm font-bold">Drop the file to upload</p> : null}
          </div>
        )}

        {(status === "preview" || status === "success") && file && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">Original Document</h3>
              <div className="p-4 border rounded-lg bg-muted/20 min-h-[300px] flex items-center justify-center">
                {filePreview}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{status === 'success' ? 'Processed Document' : 'Redaction Options'}</h3>
              {status === "preview" && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Select an AI model to perform the redaction.</p>
                  <RadioGroup value={llm} onValueChange={(value: LLMOption) => setLlm(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="GPT-3.5" id="llm-gpt" />
                      <Label htmlFor="llm-gpt">GPT-3.5 (Fast & Reliable)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LLaMA" id="llm-llama" />
                      <Label htmlFor="llm-llama">LLaMA (Balanced)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Gemma 2" id="llm-gemma" />
                      <Label htmlFor="llm-gemma">Gemma 2 (Academic & Multilingual)</Label>
                    </div>
                  </RadioGroup>
                  
                  {user && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                               <Sparkles className="h-5 w-5 text-primary" />
                               <div>
                                    <Label htmlFor="summary-switch" className="font-semibold">Generate AI Summary</Label>
                                    <p className="text-xs text-muted-foreground">Get a one-line summary of the document.</p>
                               </div>
                            </div>
                            <Switch id="summary-switch" checked={generateSummary} onCheckedChange={setGenerateSummary} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                               <ClipboardList className="h-5 w-5 text-primary" />
                               <div>
                                    <Label htmlFor="report-switch" className="font-semibold">Anonymization Report</Label>
                                    <p className="text-xs text-muted-foreground">Get a report of redacted PII.</p>
                               </div>
                            </div>
                            <Switch id="report-switch" checked={generateAnonymizationReport} onCheckedChange={setGenerateAnonymizationReport} />
                        </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleRedact} className="w-full">Redact Document</Button>
                    <Button onClick={resetWorkflow} variant="outline" className="w-full">Cancel</Button>
                  </div>
                </div>
              )}
               {status === "success" && redactedContent && (
                 <div className="space-y-4">
                    {summary && (
                      <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                        <div className="flex items-start">
                          <Quote className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-primary">AI Summary</h4>
                            <p className="text-sm italic text-foreground">{summary}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {anonymizationReport && anonymizationReport.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary flex items-center">
                                <ClipboardList className="h-5 w-5 mr-2" />
                                Anonymization Report
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PII Category</TableHead>
                                        <TableHead className="text-right">Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {anonymizationReport.map(item => (
                                        <TableRow key={item.category}>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell className="text-right">{item.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div className="p-4 border rounded-lg bg-muted/20 min-h-[300px] overflow-auto max-h-[70vh] whitespace-pre-wrap">
                        <div dangerouslySetInnerHTML={{ __html: redactedContent.replace(/\[REDACTED\]/g, '<span class="redacted-pii">[REDACTED]</span>') }} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="w-full"><Download className="mr-2 h-4 w-4" /> Download</Button>
                      <Button onClick={resetWorkflow} variant="outline" className="w-full">Process Another</Button>
                    </div>
                </div>
              )}
            </div>
          </div>
        )}

        {status === "redacting" && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 font-semibold text-lg">Processing document...</p>
            <p className="text-muted-foreground mt-1 text-sm">Please wait, this may take a moment.</p>
            <Progress value={progress} className="w-full max-w-sm mt-6" />
          </div>
        )}

        {status === "error" && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="mt-4 font-semibold text-lg">Processing Failed</p>
                <Alert variant="destructive" className="mt-4 max-w-md text-left">
                    <AlertTitle>Error Details</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={resetWorkflow} className="mt-6">Try Again</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
