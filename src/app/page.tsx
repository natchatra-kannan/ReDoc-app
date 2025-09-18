import RedactionWorkflow from "@/components/redaction-workflow";
import ShuffleText from "@/components/animations/ShuffleText";

export default function Home() {
  return (
    <div className="prism-background">
      <div className="relative container mx-auto px-4 py-16 sm:py-24 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block text-primary">Privacy-First Document Redaction</span>
            <span className="mt-2 block">
              <ShuffleText text="with ReDoc" />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground sm:max-w-3xl">
            Securely upload your documents and let our powerful AI find and redact sensitive information in seconds. Your privacy is our priority.
          </p>
        </div>
        <RedactionWorkflow />
      </div>
    </div>
  );
}
