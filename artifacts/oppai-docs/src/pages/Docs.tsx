import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { apiDocs, sidebarCategories } from "@/data/docs";
import { CodeBlock } from "@/components/CodeBlock";
import { Navbar } from "@/components/Navbar";

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin.replace(/\/oppai-docs\/?$/, "").replace(/:\d+$/, "") +
      ":8080"
    : "https://your-api.replit.app";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    POST: "bg-green-500/20 text-green-400 border border-green-500/30",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${colors[method] ?? "bg-gray-500/20 text-gray-400"}`}
    >
      {method}
    </span>
  );
}

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
        {step}
      </div>
      <div className="flex-1 pb-6">
        <h4 className="text-white font-semibold mb-2">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <div className="space-y-16">
      <div id="getting-started">
        <h2 className="text-2xl font-bold font-display text-white border-b border-border pb-4 mb-6">
          Getting Started
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The <strong className="text-white">OppAI Stream API</strong> is a free, open API that lets
          you programmatically access anime from{" "}
          <a
            href="https://oppai.stream"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            oppai.stream
          </a>
          . You can search for anime, fetch metadata, list episodes, and get raw video stream URLs —
          all without an API key or sign-up.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🔑", title: "No Auth Required", desc: "No API keys, no sign-up" },
            { icon: "🌐", title: "CORS Enabled", desc: "Works from any browser or server" },
            { icon: "🎬", title: "Raw Stream URLs", desc: "4K, 1080p and 720p direct links" },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-secondary/40 border border-border rounded-xl p-4 flex gap-3"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <div className="text-white text-sm font-semibold">{f.title}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Base URL:</span>
          <code className="text-primary font-mono bg-background px-3 py-1.5 rounded-lg text-sm">
            {BASE_URL}
          </code>
          <span className="text-xs text-muted-foreground">All endpoints are prefixed with /api</span>
        </div>
      </div>

      <div id="quick-start">
        <h2 className="text-2xl font-bold font-display text-white border-b border-border pb-4 mb-6">
          Quick Start Guide
        </h2>
        <p className="text-muted-foreground mb-6">
          Three requests to get a playable stream URL from zero:
        </p>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border p-5">
            <StepCard step={1} title="Search for an anime">
              <p className="text-muted-foreground text-sm mb-3">
                Find the anime you want and note its <code className="text-primary">slug</code>
              </p>
              <div className="bg-background rounded-lg p-3 font-mono text-sm">
                <span className="text-blue-400">GET</span>{" "}
                <span className="text-foreground/80">{BASE_URL}/api/search?q=sister+breeder</span>
                <div className="mt-2 text-muted-foreground text-xs">
                  {"→ returns: { results: [{ slug: \"sister-breeder\", title: \"Sister Breeder\" }] }"}
                </div>
              </div>
            </StepCard>
          </div>

          <div className="border-b border-border p-5">
            <StepCard step={2} title="Get episode streams">
              <p className="text-muted-foreground text-sm mb-3">
                Use the slug + episode number to fetch all stream qualities
              </p>
              <div className="bg-background rounded-lg p-3 font-mono text-sm">
                <span className="text-blue-400">GET</span>{" "}
                <span className="text-foreground/80">
                  {BASE_URL}/api/anime/sister-breeder/episode/1
                </span>
                <div className="mt-2 text-muted-foreground text-xs">
                  {'→ returns: { streams: [{ quality: "4K", proxyUrl: "...", type: "webm" }, ...] }'}
                </div>
              </div>
            </StepCard>
          </div>

          <div className="p-5">
            <StepCard step={3} title="Play the video">
              <p className="text-muted-foreground text-sm mb-3">
                Use <code className="text-primary">proxyUrl</code> (not{" "}
                <code className="text-muted-foreground">url</code>) — the raw CDN URL requires a
                Referer header and will return 403 in browsers and players
              </p>
              <div className="bg-background rounded-lg p-3 font-mono text-sm break-all">
                <span className="text-green-400">✓ Works:</span>{" "}
                <span className="text-foreground/80">streams[0].proxyUrl</span>
                <div className="mt-1">
                  <span className="text-red-400">✗ 403 Forbidden:</span>{" "}
                  <span className="text-muted-foreground">streams[0].url (direct CDN)</span>
                </div>
              </div>
            </StepCard>
          </div>
        </div>
      </div>

      <div id="base-url">
        <h2 className="text-2xl font-bold font-display text-white border-b border-border pb-4 mb-6">
          Base URL & Responses
        </h2>

        <div className="space-y-5">
          <div>
            <h4 className="text-white font-semibold mb-2">Response Format</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All endpoints return <strong className="text-white">JSON</strong>. Successful responses
              have HTTP status <code className="text-primary">200</code> (or{" "}
              <code className="text-primary">206</code> for range video requests). Errors return a
              JSON object with <code className="text-primary">error</code> and{" "}
              <code className="text-primary">message</code> fields.
            </p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">HTTP Code</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card text-sm">
                {[
                  ["200 OK", "Request succeeded"],
                  ["206 Partial Content", "Range video request succeeded (seeking)"],
                  ["400 Bad Request", "Missing or invalid parameter"],
                  ["403 Forbidden", "Proxy: target URL not allowed"],
                  ["404 Not Found", "Anime or episode does not exist"],
                  ["502 Bad Gateway", "Upstream CDN error"],
                ].map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="px-4 py-3 font-mono text-primary">{code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Error response shape</h4>
            <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm text-muted-foreground">
              {`{ "error": "NOT_FOUND", "message": "Anime 'xyz' not found" }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Docs() {
  const [activeId, setActiveId] = useState<string>("getting-started");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const allIds = [
      "getting-started",
      "quick-start",
      "base-url",
      ...apiDocs.map((d) => d.id),
    ];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    for (const id of allIds) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/70 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            No API Key Required · Free Forever
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white mb-5"
          >
            OppAI Stream <span className="text-gradient">API Docs</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Search anime, fetch metadata, and get raw stream URLs — all in a single API call.
          </motion.p>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 flex gap-10">

        {/* Sidebar */}
        <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {sidebarCategories.map((cat) => (
              <div key={cat.label}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-2">
                  {cat.label}
                </p>
                <ul className="space-y-0.5">
                  {cat.items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToId(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-primary/15 text-primary font-medium border-l-2 border-primary pl-[10px]"
                              : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-20 pt-4">
          <IntroSection />

          {apiDocs.map((doc) => (
            <motion.section
              key={doc.id}
              id={doc.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              className="border-t border-border/50 pt-12"
            >
              {/* Endpoint header */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <MethodBadge method={doc.method} />
                <code className="text-base font-mono text-foreground/85 bg-secondary/50 px-3 py-1 rounded-lg">
                  {doc.path}
                </code>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">{doc.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {doc.description}
              </p>

              {/* Parameters */}
              {doc.parameters && doc.parameters.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Parameters
                  </h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-muted-foreground font-medium text-xs">
                            Name
                          </th>
                          <th className="px-4 py-2.5 text-left text-muted-foreground font-medium text-xs">
                            Type
                          </th>
                          <th className="px-4 py-2.5 text-left text-muted-foreground font-medium text-xs">
                            Required
                          </th>
                          <th className="px-4 py-2.5 text-left text-muted-foreground font-medium text-xs">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {doc.parameters.map((p) => (
                          <tr key={p.name}>
                            <td className="px-4 py-3 font-mono text-primary text-sm">{p.name}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{p.type}</td>
                            <td className="px-4 py-3">
                              {p.required ? (
                                <span className="text-[11px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                                  required
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60 bg-secondary/50 px-2 py-0.5 rounded-full">
                                  optional
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-sm">
                              {p.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Code examples + response */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CodeBlock code={doc.examples.python} language="python" title="Python" />
                  <CodeBlock code={doc.examples.java} language="java" title="Java" />
                </div>
                <div>
                  <CodeBlock code={doc.examples.json} language="json" title="Response" />
                </div>
              </div>
            </motion.section>
          ))}
        </main>
      </div>
    </div>
  );
}
