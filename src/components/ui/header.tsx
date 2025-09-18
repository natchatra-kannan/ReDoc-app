import Link from "next/link";
import AuthButton from "./auth-button";
import ShuffleText from "../animations/ShuffleText";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, CheckCircle } from "lucide-react";

export default function Header() {
  const premiumFeatures = [
    {
      name: "AI-Powered Anonymization Report",
      description: "Get detailed reports on what PII was found and why it was redacted.",
    },
    {
      name: "Custom Redaction Rules",
      description: "Define your own patterns for redacting proprietary or custom information.",
    },
    {
      name: "AI-Powered Content Summary",
      description: "Generate one-line summaries of documents, like describing a candidate for HR review.",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="text-lg font-bold text-primary">
            <ShuffleText text="ReDoc" />
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Star className="mr-2 h-4 w-4 text-yellow-400" />
                Premium
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-400" />
                  Premium Features
                </DialogTitle>
                <DialogDescription>
                  Upgrade to unlock powerful tools for professionals.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-4 pt-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature.name} className="flex items-start">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
