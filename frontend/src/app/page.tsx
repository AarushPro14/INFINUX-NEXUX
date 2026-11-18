"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Info,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050608] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/[0.06] blur-[160px]" />

        <div className="absolute bottom-[-300px] left-[-200px] h-[600px] w-[600px] rounded-full bg-blue-500/[0.04] blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Intro animation */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="mx-auto mb-7 flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl sm:h-40 sm:w-40">
              <Image src="/infinux-nexux-official.png" alt="INFINUX NEXUX official logo" width={320} height={320} priority className="h-full w-full object-contain" />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-cyan-200/50">
              A product by
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Aarushi Infotech
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mx-auto mt-7 h-px max-w-xs bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-8"
          >
            <p className="text-sm text-white/30">
              Introducing something built for modern business.
            </p>

            <p className="mt-3 text-xs uppercase tracking-[0.35em] text-white/15">
              INFINUX NEXUX
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-5 w-5 animate-bounce text-white/20" />
        </motion.div>
      </section>

      {/* Main landing page */}
      <section className="relative z-10 min-h-screen px-6 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Navigation */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-24 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>

              <div>
                <div className="text-xs font-bold tracking-[0.3em]">
                  INFINUX
                </div>
                <div className="text-[8px] tracking-[0.4em] text-white/25">
                  NEXUX
                </div>
              </div>
            </div>

            <a
              href="/auth"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-200/[0.12] px-4 py-2 text-xs font-semibold text-cyan-50 shadow-[0_0_28px_rgba(103,232,249,0.14)] transition hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-cyan-100 hover:text-slate-950"
            >
              Enter workspace
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.header>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="max-w-4xl"
          >
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-cyan-200/50">
              Welcome to NEXUX
            </p>

            <h2 className="text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl">
              Your business.
              <br />
              <span className="text-white/35">Connected.</span>
            </h2>

            <p className="mt-8 max-w-2xl text-base leading-7 text-white/35 sm:text-lg">
              NEXUX brings your business workspace into one focused
              environment — helping teams work, communicate, and manage
              what matters.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="/auth"
                className="group inline-flex min-h-14 items-center justify-between gap-5 rounded-2xl border border-cyan-100/70 bg-gradient-to-r from-cyan-200 via-cyan-100 to-teal-100 px-5 py-3 text-left text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(34,211,238,0.32)] sm:min-w-64"
              >
                <span className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Private workspace</span>
                  <span className="mt-0.5 text-base font-bold">Enter NEXUX</span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-cyan-100 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>

              <a
                href="#information"
                className="flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
              >
                Explore
              </a>
            </div>
          </motion.div>

          {/* Information */}
          <div
            id="information"
            className="mt-36 grid gap-6 md:grid-cols-3"
          >
            <InfoCard
              icon={<Sparkles className="h-5 w-5" />}
              title="One Workspace"
              description="A focused environment designed to keep your business experience organized and connected."
              delay={0}
            />

            <InfoCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Built to Scale"
              description="Designed with a foundation that can grow alongside teams, businesses, and their needs."
              delay={0.15}
            />

            <InfoCard
              icon={<Info className="h-5 w-5" />}
              title="Simple by Design"
              description="A clean experience that keeps the important things easy to find and understand."
              delay={0.3}
            />
          </div>

          {/* Bottom information */}
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-28 border-t border-white/[0.07] pt-12"
          >
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-cyan-200/40">
                  About
                </p>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  INFINUX NEXUX
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/30">
                  NEXUX is a business workspace created by Aarushi
                  Infotech, designed to provide a modern and focused
                  digital experience for organizations and their teams.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:items-end md:justify-end">
                <a
                  href="/release-notes"
                  className="group flex w-full max-w-xs items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-sm text-white/55 transition hover:border-cyan-300/20 hover:bg-white/[0.05] hover:text-white"
                >
                  <span>Release Notes</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  href="/about"
                  className="group flex w-full max-w-xs items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-sm text-white/55 transition hover:border-cyan-300/20 hover:bg-white/[0.05] hover:text-white"
                >
                  <span>About NEXUX</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="mt-20 flex flex-col gap-3 border-t border-white/[0.05] pt-7 pb-10 text-[9px] uppercase tracking-[0.25em] text-white/15 sm:flex-row sm:items-center sm:justify-between">
            <span>INFINUX NEXUX</span>
            <span>Aarushi Infotech</span>
            <span>Private Business Workspace</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/15 hover:bg-white/[0.04]"
    >
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-200/70">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-white/30">
        {description}
      </p>
    </motion.div>
  );
}
