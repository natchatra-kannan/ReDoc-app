"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RedactionDocument } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// This function is now just a blueprint.
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
      
      // Generate and set fake documents on the client-side only
      setLoading(true);
      setTimeout(() => {
        setDocuments(createFakeDocuments(user.uid));
        setLoading(false);
      }, 500); // Simulate network delay
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, {user.displayName || user.email}.</p>
        </div>

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
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your recent redactions will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
