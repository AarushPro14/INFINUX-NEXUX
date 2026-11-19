import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Who this policy applies to",
    paragraphs: [
      "This Privacy Policy explains how Aarushi Infotech, the creator and maintainer of INFINUX NEXUX (\"NEXUX\", \"we\", \"us\"), handles information when you visit or use the NEXUX website and business workspace (the \"Service\"). It applies to account holders, people requesting access, and people whose information is entered into a workspace by an organization.",
      "An organization using NEXUX may also decide how it uses information in its workspace. That organization is responsible for its own privacy notices and instructions to its members. Contact the organization that manages your workspace for questions about its use of workspace information.",
    ],
  },
  {
    title: "2. Information we handle",
    paragraphs: [
      "Account and sign-in information. Depending on how you register, this can include your name, email address, profile image, email verification status, and authentication details provided through Google or an email-and-password sign-in. Passwords are stored as hashes rather than readable passwords. When you sign in, the Service uses session and authentication information to keep you signed in and protect your account.",
      "Company and access information. This can include a company name and identifier, your role and account status, staff access requests, contact details and messages you submit with a request, and the status and review history of a request. Owners may review requests and make access decisions.",
      "Workspace information. When workspace features are used, the Service handles membership and session details, messages and replies, author names, timestamps, and files or other attachments you choose to share. Information you share may be visible to other authorized members of that workspace.",
      "Attendance information. Where enabled, this can include attendance status and date, and company holiday dates and names. Workspace owners or administrators may be able to view records for their organization.",
      "Technical and security information. The Service may process information needed to operate and secure sign-in and entry, such as session identifiers, request metadata, and records of failed attempts or temporary access restrictions. Do not send us passwords, authentication codes, or other secrets in a support request or workspace message.",
    ],
  },
  {
    title: "3. How we use information",
    paragraphs: [
      "We use information to create and manage accounts; authenticate users; connect members with the right company; process and review access requests; provide workspace, communication, file, and attendance features; respond to requests; maintain, troubleshoot, and improve the Service; and detect, prevent, and investigate abuse, fraud, and security incidents.",
      "We use information for these service and operational purposes. We do not describe workspace content as public, and access is intended for the relevant organization and its authorized members.",
    ],
  },
  {
    title: "4. How information is shared",
    paragraphs: [
      "Information is made available to the organization and authorized workspace members as needed to provide the features they use. For example, members of a workspace may see messages and shared files, and authorized owners may review staff requests or attendance information.",
      "We may use infrastructure, hosting, database, authentication, or other service providers to operate NEXUX. Those providers process information on our behalf as needed to provide their services. Sign-in through Google is also subject to Google's own privacy practices.",
      "We may disclose information if reasonably necessary to comply with law, respond to valid legal process, protect the rights and safety of users or others, or protect the security and integrity of the Service. If the business or Service is reorganized or transferred, information may be handled as part of that transaction, subject to applicable requirements.",
      "We do not sell personal information for money. This page does not promise that information is never shared; the sharing described above is needed to operate the Service and meet legal or safety obligations.",
    ],
  },
  {
    title: "5. Retention and security",
    paragraphs: [
      "We keep information for as long as needed to provide the Service, maintain accounts and organization records, resolve disputes, enforce our terms, and meet legal or security needs. Retention can vary by information type and by instructions from the organization that manages a workspace. Deleting an account or leaving an organization may not immediately remove records that the organization or Service needs to retain.",
      "We use technical and organizational measures designed to protect information, including server-side access checks and protected authentication practices. No website, storage system, or transmission method can be guaranteed completely secure.",
    ],
  },
  {
    title: "6. Your choices and requests",
    paragraphs: [
      "You can keep your account information accurate by using the available account settings. For access, correction, deletion, or other privacy requests about your account, contact the organization that manages your workspace or the Service operator through the contact channel provided to you. We may need to verify your identity and coordinate with the organization responsible for the relevant workspace before acting.",
      "Depending on where you live, you may have privacy rights under applicable law. The rights available and any exceptions depend on your location and the circumstances of the request. You may also be able to manage Google account permissions through Google.",
    ],
  },
  {
    title: "7. Children and third-party services",
    paragraphs: [
      "NEXUX is a business workspace intended for organizational use, not a service directed to children. If you believe a child has provided personal information to the Service, contact the organization managing the workspace or the Service operator.",
      "The Service may link to or rely on third-party services. Their own privacy policies govern their handling of information, and we do not control their independent practices.",
    ],
  },
  {
    title: "8. Changes and contact",
    paragraphs: [
      "We may update this Policy as the Service changes. The date at the top shows when this version was last updated. If a change materially affects how information is handled, we will take reasonable steps to provide notice through the Service or another appropriate channel.",
      "For a privacy question or request, contact the NEXUX workspace administrator or use the support/contact channel through which you received access to the Service. Please do not include passwords or authentication codes in your message.",
    ],
  },
];

export const metadata = {
  title: "Privacy Policy | INFINUX NEXUX",
  description: "Learn how INFINUX NEXUX handles account, company, and workspace information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/[0.055] blur-[170px]" />
        <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2 text-sm text-white/45 transition hover:text-white"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back home</Link>
        <Link href="/terms" className="flex items-center gap-2 text-sm text-white/45 transition hover:text-cyan-100">Terms of Service <ArrowRight className="h-4 w-4" /></Link>
      </header>
      <article className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-12 sm:pt-20">
        <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/60"><span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04]"><ShieldCheck className="h-5 w-5" /></span> INFINUX NEXUX · Privacy</div>
        <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Privacy Policy</h1>
        <p className="mt-5 text-sm leading-7 text-white/50">This Policy describes how information is handled in the NEXUX business workspace, including when people sign in, request company access, and use workspace features.</p>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/35">Last updated: November 19, 2026</p>
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.025] p-5 text-sm leading-7 text-white/60"><LockKeyhole className="mt-1 h-4 w-4 flex-none text-cyan-200/70" /><p>This is a general description of the Service’s current practices, not a guarantee that every feature or data flow is available in every workspace. Your organization may provide additional privacy information.</p></div>
        <div className="mt-12 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {sections.map((section) => <section key={section.title} className="py-8"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{section.title}</h2><div className="mt-4 space-y-4 text-sm leading-7 text-white/55">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
        </div>
        <footer className="mt-10 flex flex-wrap justify-between gap-4 text-sm text-white/40"><span>INFINUX NEXUX · Aarushi Infotech</span><Link className="transition hover:text-white" href="/terms">Read the Terms of Service →</Link></footer>
      </article>
    </main>
  );
}
