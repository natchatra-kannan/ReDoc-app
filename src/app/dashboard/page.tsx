"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RedactionDocument } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore";


// Since we are faking auth, we'll also fake the documents for now.
const createFakeDocuments = (userId: string): RedactionDocument[] => {
    return [
        {
            id: '1',
            userId: userId,
            fileName: 'old-resume.pdf',
            originalFileUrl: '#',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: 'completed',
            llmUsed: 'GPT-3.5',
        },
        {
            id: '2',
            userId: userId,
            fileName: 'project-notes.txt',
            originalFileUrl: '#',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            status: 'completed',
            llmUsed: 'LLaMA',
        },
        {
            id: '3',
            userId: userId,
            fileName: 'sensitive-contract.docx',
            originalFileUrl: '#',
            createdAt: new Date(),
            status: 'failed',
            llmUsed: 'Gemma 2',
            error: 'Failed to extract text.'
        },
    ];
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<RedactionDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      
      // Load fake documents
      setLoading(true);
      setTimeout(() => {
        setDocuments(createFakeDocuments(user.uid));
        setLoading(false);
      }, 500); // Simulate network delay
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Redaction History</CardTitle>
          <CardDescription>
            A log of all the documents you have redacted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>LLM Used</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>{doc.llmUsed || "N/A"}</TableCell>
                    <TableCell>
                      {doc.createdAt instanceof Date
                        ? doc.createdAt.toLocaleDateString()
                        : "Invalid Date"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doc.status === "completed"
                            ? "default"
                            : "destructive"
                        }
                        className={doc.status === "completed" ? "bg-green-600" : ""}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
              <ShieldAlert className="w-16 h-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Redactions Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your redacted documents will appear here once you complete a redaction.
              </p>
              <Button asChild className="mt-6">
                <a href="/">Start Redacting</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
