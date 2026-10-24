import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { person } from "@/content/person";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const description =
  "Software engineer building backend systems and AI products: Spring Boot and Python microservices on AWS with Kafka, React/TypeScript, and LLM/RAG systems with evals. 5× Salesforce certified, M.S. CS.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${person.name} · Software Engineer`, template: `%s · ${person.name}` },
  description,
  keywords: ["Sameer Nagar", "software engineer", "backend", "AI engineer", "LLM", "RAG", "Spring Boot", "Kafka", "AWS", "Salesforce"],
  authors: [{ name: person.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", title: `${person.name} · Software Engineer`, description, url: site.url, siteName: person.name },
  twitter: { card: "summary_large_image", title: `${person.name} · Software Engineer`, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07070a" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
};

// Runs before paint so the saved theme never flashes. Dark is the default.
const themeScript = `try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){document.documentElement.classList.add('dark')}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: person.role,
  email: `mailto:${person.email}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "San Jose", addressRegion: "CA", addressCountry: "US" },
  alumniOf: ["California State University, Fullerton", "Rajiv Gandhi Proudyogiki Vishwavidyalaya"],
  sameAs: [person.links.github, person.links.linkedin, person.links.scholar],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
