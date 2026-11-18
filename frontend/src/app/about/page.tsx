"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  Globe2,
  Layers3,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
  KeyRound,
  Network,
  Workflow,
} from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    text: "A workspace should feel dependable from the moment you enter it.",
  },
  {
    icon: Layers3,
    title: "Everything connected",
    text: "Important parts of the business experience belong together, not scattered everywhere.",
  },
  {
    icon: Zap,
    title: "Fast by nature",
    text: "NEXUX is designed around focused interactions and a distraction-free experience.",
  },
  {
    icon: Users,
    title: "People centered",
    text: "Technology should help teams collaborate instead of getting in their way.",
  },
];

const milestones = [
  {
    number: "01",
    title: "The idea",
    text: "A simple question: what if a business workspace could feel powerful without feeling complicated?",
  },
  {
    number: "02",
    title: "The foundation",
    text: "NEXUX began taking shape around identity, workspaces, collaboration, and a focused digital environment.",
  },
  {
    number: "03",
    title: "The experience",
    text: "The goal became bigger than functionality — every interaction should feel intentional.",
  },
  {
    number: "04",
    title: "The future",
    text: "NEXUX is built to evolve as modern organizations and their digital needs evolve.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050608] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-280px] h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-400/[0.055] blur-[170px]" />

        <div className="absolute right-[-260px] top-[35%] h-[560px] w-[560px] rounded-full bg-blue-500/[0.035] blur-[160px]" />

        <div className="absolute bottom-[-300px] left-[-250px] h-[600px] w-[600px] rounded-full bg-cyan-300/[0.025] blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs text-white/35 transition hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back home
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Sparkles className="h-4 w-4 text-cyan-300" />
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-[0.3em]">
              INFINUX
            </div>
            <div className="text-[8px] tracking-[0.4em] text-white/25">
              NEXUX
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex min-h-[calc(100vh-90px)] items-center px-6">
        <div className="mx-auto w-full max-w-6xl py-24">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035]">
                <Globe2 className="h-5 w-5 text-cyan-200/70" />
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-cyan-200/40">
                About NEXUX
              </span>
            </div>

            <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              Business,
              <br />
              <span className="text-white/30">without the noise.</span>
            </h1>

            <p className="mt-9 max-w-2xl text-base leading-8 text-white/35 sm:text-lg">
              INFINUX NEXUX is a modern business workspace created by
              Aarushi Infotech — designed around clarity, connection,
              security, and purposeful digital experiences.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-16 flex items-center gap-3 text-[9px] uppercase tracking-[0.35em] text-white/20"
          >
            <span className="h-px w-10 bg-white/10" />
            Scroll to explore
            <ChevronDown className="h-3 w-3 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Identity section */}
      <section className="relative z-10 px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel icon={Building2} label="Who we are" />

          <div className="mt-12 grid gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                A workspace built around the way businesses actually move.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-sm leading-7 text-white/30"
            >
              <p>
                Modern businesses generate information, decisions,
                conversations, responsibilities, and relationships every
                day.
              </p>

              <p className="mt-5">
                NEXUX exists to bring that experience into a more
                understandable and focused digital environment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel icon={Target} label="Our principles" />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.1,
                  }}
                  className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/15 hover:bg-white/[0.045]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-cyan-200/65 transition group-hover:text-cyan-200" />
                  </div>

                  <h3 className="mt-7 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/30">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature statement */}
      <section className="relative z-10 px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-white/[0.025]"
        >
          <div className="relative p-8 sm:p-14 lg:p-20">
            <div className="absolute right-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-cyan-300/[0.04] blur-[100px]" />

            <div className="relative max-w-4xl">
              <LockKeyhole className="h-7 w-7 text-cyan-200/60" />

              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200/35">
                Designed with purpose
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Powerful technology should feel remarkably simple.
              </h2>

              <p className="mt-7 max-w-2xl text-sm leading-7 text-white/30 sm:text-base">
                NEXUX focuses on making the digital workspace easier to
                understand, easier to navigate, and easier to use — while
                maintaining a strong foundation for the people and
                organizations using it.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Story */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel icon={Rocket} label="The journey" />

          <div className="mt-14">
            {milestones.map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -25 : 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group grid gap-6 border-t border-white/[0.07] py-9 md:grid-cols-[100px_220px_1fr] md:items-start"
              >
                <span className="text-xs font-semibold tracking-[0.3em] text-cyan-200/30">
                  {item.number}
                </span>

                <h3 className="text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>

                <p className="max-w-2xl text-sm leading-7 text-white/30">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="relative z-10 px-6 py-36">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-cyan-200/40">
              Looking forward
            </p>

            <h2 className="mt-7 text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-6xl">
              The workspace is only
              <br />
              <span className="text-white/30">the beginning.</span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-white/30 sm:text-base">
              NEXUX is being shaped with a long-term perspective:
              technology that adapts to businesses rather than forcing
              businesses to adapt to technology.
            </p>

            <a
              href="/auth"
              className="group mt-10 inline-flex min-h-14 items-center gap-5 rounded-2xl border border-cyan-100/70 bg-gradient-to-r from-cyan-200 via-cyan-100 to-teal-100 px-5 py-3 text-left text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(34,211,238,0.32)]"
            >
              <span className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Private workspace</span>
                <span className="mt-0.5 text-base font-bold">Sign in to NEXUX</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-cyan-100 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Purpose, mission and vision */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-8 sm:p-11">
            <SectionLabel icon={Target} label="Our purpose" />
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Make business work easier to see.</h2>
            <p className="mt-5 text-sm leading-7 text-white/35">Organizations often rely on separate tools and informal processes to decide who belongs, what they can access, and where work happens. NEXUX brings the first step of that experience into a single business workspace: a clear identity, a named company, and approval before staff access is granted.</p>
          </article>
          <article className="rounded-[2rem] border border-cyan-200/[0.11] bg-cyan-200/[0.025] p-8 sm:p-11">
            <SectionLabel icon={Sparkles} label="Our mission" />
            <h2 className="mt-8 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Bring people and operations into one trusted environment.</h2>
            <p className="mt-5 text-sm leading-7 text-white/35">Our mission is to build a dependable starting point for company teams: one sign-in, an intentional access path, and a workspace that can grow as business needs become clearer. Every new capability should make ownership, collaboration, and the next action easier to understand.</p>
          </article>
        </div>
      </section>

      {/* Business ecosystem */}
      <section className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel icon={Network} label="The NEXUX ecosystem" />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <EcosystemCard icon={KeyRound} number="01" title="Identity" text="Members enter with an individual account through Google or email and password. An account identifies a person; it does not automatically make that person an owner or grant workspace access." />
            <EcosystemCard icon={Building2} number="02" title="Company" text="A NEXUX company has its own configured identifier and an owner controlled workspace. The company identifier helps route verified setup and staff requests to the correct organization." />
            <EcosystemCard icon={Workflow} number="03" title="Access" text="Staff request access with their contact details and a message. An authorized owner reviews the request and decides whether to approve or decline it." />
          </div>
        </div>
      </section>

      {/* Security philosophy */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-14 rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-8 sm:p-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <SectionLabel icon={ShieldCheck} label="Security philosophy" />
            <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Access is earned, reviewed, and checked on the server.</h2>
            <p className="mt-5 text-sm leading-7 text-white/35">NEXUX treats business identity and business authorization as separate steps. The application checks current account role and status against its database when it protects workspace pages and approval actions.</p>
          </div>
          <div className="grid gap-3">
            <SecurityRow title="Private credentials" text="Passwords are stored as bcrypt hashes. OAuth and company secrets stay in server environment variables." />
            <SecurityRow title="Controlled ownership" text="Owner setup checks the configured company ID, company password, and authorized owner email list." />
            <SecurityRow title="Owner reviewed staff" text="A staff registration is a request. It remains pending until an authorized owner approves it." />
            <SecurityRow title="Protected entry" text="The entry key is validated on the server, and failed attempts are limited using persistent database state." />
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel icon={Layers3} label="Development direction" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Grow from a trusted foundation.</h2>
              <p className="mt-5 text-sm leading-7 text-white/35">NEXUX is being developed in practical layers. The current product focuses on account access, company setup, staff approval, and separate owner and staff entry points. Future ideas remain plans until they are implemented and released.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <RoadmapCard title="Now" text="Authentication, company ownership setup, staff access requests, and owner review." status="Current foundation" />
              <RoadmapCard title="Next possibilities" text="Team tasks, project coordination, notifications, documents, and business reporting." status="Future direction" />
              <RoadmapCard title="Designed to extend" text="Additional business modules can build on company membership, roles, and server checked access." status="Architecture principle" />
              <RoadmapCard title="Built by Aarushi Infotech" text="INFINUX NEXUX is the business workspace product created and maintained by Aarushi Infotech." status="Product relationship" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-[9px] uppercase tracking-[0.3em] text-white/15 sm:flex-row sm:items-center sm:justify-between">
          <span>INFINUX NEXUX</span>
          <span>Aarushi Infotech</span>
          <Link
            href="/"
            className="transition hover:text-white/40"
          >
            Return home
          </Link>
        </div>
      </footer>
    </main>
  );
}

function EcosystemCard({icon:Icon,number,title,text}:{icon:typeof Building2;number:string;title:string;text:string}) {
  return <article className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7"><div className="flex items-center justify-between"><span className="text-[10px] tracking-[0.25em] text-cyan-200/40">{number}</span><Icon className="h-5 w-5 text-cyan-200/65"/></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/35">{text}</p></article>;
}

function SecurityRow({title,text}:{title:string;text:string}) {
  return <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/35">{text}</p></div>;
}

function RoadmapCard({title,text,status}:{title:string;text:string;status:string}) {
  return <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"><span className="text-[8px] uppercase tracking-[0.22em] text-cyan-200/45">{status}</span><h3 className="mt-3 text-base font-semibold">{title}</h3><p className="mt-2 text-xs leading-6 text-white/35">{text}</p></article>;
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: typeof Target;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
        <Icon className="h-4 w-4 text-cyan-200/60" />
      </div>

      <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-white/25">
        {label}
      </span>
    </div>
  );
}
