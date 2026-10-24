export const site = {
  name: "Genfolio",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://genfolio.onrender.com").replace(/\/$/, ""),
};

export const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "research", label: "Research" },
  { id: "shipping", label: "Shipping" },
  { id: "contact", label: "Contact" },
] as const;
