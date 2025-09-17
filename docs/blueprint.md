# **App Name**: ReDoc

## Core Features:

- Document Upload & Storage: Upload documents (PDF, images, text) and store them securely in Firebase Storage. Metadata is saved in Firestore.
- LLM-Powered Redaction Pipeline: Orchestrate a multi-LLM pipeline (GPT-3.5, LLaMA, Gemma 2) using Genkit flows. Models are modular and selectable per session, with a fallback/retry system. The AI acts as a tool for PII recognition.
- PII Detection & Redaction: Detect and redact PII (names, addresses, phone numbers, signatures, IDs) using selected LLM, replace '[REDACTED]' to visual blur. Blur must be a baby pink colored glass blur.
- Redacted Document Export: Export the redacted document (PDF/Image/Text) back to the user with a download option.
- User Authentication: Enable user authentication using Firebase Auth (Email + Google login). Allow users to track their history of redacted documents.
- Analytics & Logging: Store which LLM was used for each redaction, log errors and retries, and implement basic Firebase Analytics for monitoring.
- Content extraction and display: Instead of only extracting PII and blurring it alone, extract all contents in any file or docs, then only blur out the particular redaction text or objects, show the whole content and redacted parts in display

## Style Guidelines:

- Primary color: Slate blue (#708090) to evoke a sense of security and professionalism, nodding towards the app's focus on privacy.
- Background color: Light gray (#F0F0F0), very desaturated to provide a neutral backdrop.
- Accent color: Dusty rose (#D8BFD8) is used sparingly to highlight key interactive elements like buttons, without compromising the serious and secure tone.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a modern and neutral feel. Easy to read at various sizes, and can be used for body and headlines.
- Subtle text shuffler animations on titles or loading states using https://reactbits.dev/text-animations/shuffle to make dynamic
- Use text cursor on a prompt that is telling to start a new session https://reactbits.dev/text-animations/text-cursor.
- Use Prism backgrounds that are eye catchy and creates contrast and to draw attention, https://reactbits.dev/backgrounds/prism
- Use Electic border to denote selection and highlight important features
- Web app with a clear "Upload → Preview → Redact → Download" workflow.