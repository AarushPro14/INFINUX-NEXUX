import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Agreement and eligibility",
    paragraphs: [
      "These Terms of Service (\"Terms\") govern access to and use of INFINUX NEXUX (\"NEXUX\", the \"Service\"), a business workspace created and maintained by Aarushi Infotech (\"we\", \"us\"). By accessing or using the Service, you agree to these Terms. If you use NEXUX for an organization, you confirm that you are authorized to accept these Terms on its behalf.",
      "NEXUX is intended for business and organizational use. You must be able to enter into a binding agreement under the laws that apply to you. If you do not agree to these Terms, do not use the Service.",
    ],
  },
  {
    title: "2. Accounts and organization access",
    paragraphs: [
      "Provide accurate account information and keep it current. You are responsible for safeguarding your sign-in credentials, for activity through your account, and for promptly notifying the organization managing your workspace if you believe your account has been accessed without authorization.",
      "Creating or signing into an account does not itself grant company or workspace access. Company ownership, staff membership, and other permissions are controlled through the Service’s access and approval process. An access request may be reviewed, approved, or declined by an authorized organization owner. Your role or access may change when the organization’s authorized owner or administrator makes a decision.",
      "Organization owners and administrators are responsible for assigning access appropriately, protecting their organization’s credentials, and ensuring that their use of NEXUX and instructions to members comply with applicable law and these Terms.",
    ],
  },
  {
    title: "3. Acceptable use",
    paragraphs: [
      "Use NEXUX only for lawful purposes and in accordance with your organization’s rules. You must not misuse access controls, attempt to access another person’s account or workspace without authorization, interfere with the operation or security of the Service, introduce malicious code, or use the Service to violate another person’s rights or applicable law.",
      "Do not upload or share content that you do not have the right to use, that is unlawful, or that is intended to harm, deceive, or disrupt others. Do not use NEXUX to store or distribute passwords, authentication codes, or other secrets in messages or shared files.",
    ],
  },
  {
    title: "4. Your content and workspace data",
    paragraphs: [
      "You and your organization retain rights to the content you submit to NEXUX, including messages, profile information, attendance entries, and files (\"Content\"). You are responsible for your Content and for having the rights and permissions needed to submit and share it.",
      "You grant us permission to host, process, transmit, and display Content as reasonably necessary to operate, secure, and provide the Service to you and your organization. Content shared in a workspace may be available to other authorized members of that workspace. Your organization may set rules for its Content and may have access to records associated with its workspace.",
      "We may remove or restrict Content when reasonably necessary to protect the Service, comply with law, or enforce these Terms. We do not claim ownership of your Content.",
    ],
  },
  {
    title: "5. Privacy and security",
    paragraphs: [
      "Our handling of information is described in the [Privacy Policy](/privacy). You are responsible for providing any notices and obtaining any permissions required for information you or your organization submit about other people.",
      "We use measures designed to protect accounts and workspace access, but no online service can be guaranteed completely secure or uninterrupted. Keep your credentials confidential and tell your organization administrator promptly about suspected misuse.",
    ],
  },
  {
    title: "6. Service availability and changes",
    paragraphs: [
      "We may update, add, or discontinue features as NEXUX develops. We aim to keep the Service available, but we do not guarantee uninterrupted or error-free operation. Features may be temporarily unavailable for maintenance, security, or operational reasons.",
      "We may revise these Terms from time to time. The date above identifies the current version. If you continue using the Service after updated Terms take effect, you agree to the revised Terms. If you do not agree, stop using the Service.",
    ],
  },
  {
    title: "7. Suspension and termination",
    paragraphs: [
      "You may stop using NEXUX at any time. An organization owner may manage membership and permissions for that organization. We may suspend or restrict access when reasonably necessary to protect the Service or its users, address a security concern, comply with law, or respond to a material breach of these Terms.",
      "When access ends, you may lose access to workspace Content. The organization or Service may retain information as described in the Privacy Policy or as needed for legal, security, and operational purposes.",
    ],
  },
  {
    title: "8. Intellectual property",
    paragraphs: [
      "The Service, including its software, design, branding, and materials, is owned by or licensed to Aarushi Infotech and is protected by intellectual property laws. These Terms give you a limited, non-exclusive, non-transferable right to use the Service for your organization while your access is active. No other rights are granted except as required by law.",
      "You may not copy, modify, distribute, reverse engineer, or create derivative works from the Service except where applicable law permits or we authorize it in writing.",
    ],
  },
  {
    title: "9. Disclaimers and limits of responsibility",
    paragraphs: [
      "To the extent permitted by law, the Service is provided on an \"as available\" basis, without warranties that it will be uninterrupted, error-free, or suitable for every purpose. Nothing in these Terms excludes a warranty or right that cannot lawfully be excluded.",
      "To the extent permitted by law, Aarushi Infotech will not be liable for indirect, incidental, special, consequential, or punitive loss, or loss of data, profits, or business opportunity arising from use of or inability to use the Service. These Terms do not limit liability that cannot lawfully be limited. Any limits on liability in these Terms apply only to the extent permitted by the law that governs the claim.",
    ],
  },
  {
    title: "10. General terms and contact",
    paragraphs: [
      "If a provision of these Terms cannot be enforced, the remaining provisions continue to apply. A failure to enforce a provision is not a waiver. You may not transfer your rights under these Terms without our consent, except where applicable law allows it. These Terms and any dispute relating to them are subject to applicable law; mandatory consumer or other protections in your jurisdiction continue to apply.",
      "For questions about these Terms, contact the NEXUX workspace administrator or use the support/contact channel through which you received access to the Service.",
    ],
  },
];

export const metadata = {
  title: "Terms of Service | INFINUX NEXUX",
  description: "Review the terms for using the INFINUX NEXUX business workspace.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/[0.055] blur-[170px]" />
        <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2 text-sm text-white/45 transition hover:text-white"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back home</Link>
        <Link href="/privacy" className="flex items-center gap-2 text-sm text-white/45 transition hover:text-cyan-100">Privacy Policy <ArrowRight className="h-4 w-4" /></Link>
      </header>
      <article className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-12 sm:pt-20">
        <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/60"><span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04]"><FileText className="h-5 w-5" /></span> INFINUX NEXUX · Terms</div>
        <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Terms of Service</h1>
        <p className="mt-5 text-sm leading-7 text-white/50">These Terms set out the basic rules for using the NEXUX business workspace, including accounts, organization access, and workspace content.</p>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/35">Last updated: November 19, 2026</p>
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.025] p-5 text-sm leading-7 text-white/60"><ShieldCheck className="mt-1 h-4 w-4 flex-none text-cyan-200/70" /><p>These Terms are written for the current NEXUX business workspace. They do not replace any separate agreement between your organization and Aarushi Infotech.</p></div>
        <div className="mt-12 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {sections.map((section) => <section key={section.title} className="py-8"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{section.title}</h2><div className="mt-4 space-y-4 text-sm leading-7 text-white/55">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph.startsWith("Our handling of information") ? <>Our handling of information is described in the <Link className="text-cyan-200/80 underline decoration-cyan-200/25 underline-offset-4 hover:text-cyan-100" href="/privacy">Privacy Policy</Link>. You are responsible for providing any notices and obtaining any permissions required for information you or your organization submit about other people.</> : paragraph}</p>)}</div></section>)}
        </div>
        <footer className="mt-10 flex flex-wrap justify-between gap-4 text-sm text-white/40"><span>INFINUX NEXUX · Aarushi Infotech</span><Link className="transition hover:text-white" href="/privacy">Read the Privacy Policy →</Link></footer>
      </article>
    </main>
  );
}
