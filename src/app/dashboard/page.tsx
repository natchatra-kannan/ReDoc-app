"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { RedactionDocument } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ShieldAlert } from "lucide-react";

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

      const fetchDocuments = async () => {
        if (user) {
          setLoading(true);
          try {
            const q = query(
              collection(db, "redactions"),
              where("userId", "==", user.uid),
              orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as RedactionDocument));
            setDocuments(docs);
          } catch (error) {
            console.error("Error fetching documents:", error);
          } finally {
            setLoading(false);
          }
        }
      };

      fetchDocuments();
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
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
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
                      {doc.createdAt instanceof Timestamp
                        ? doc.createdAt.toDate().toLocaleDateString()
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
