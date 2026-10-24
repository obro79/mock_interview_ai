import { mappings } from "@/constants";

export const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

/** Maps free-form names like "Next.js" or "Tailwind CSS" to a devicon slug. */
export function normalizeTechName(tech: string): string | undefined {
    const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
    return mappings[key as keyof typeof mappings];
}

export function getTechIconUrl(tech: string): string | null {
    const normalized = normalizeTechName(tech);
    if (!normalized) return null;
    return `${techIconBaseURL}/${normalized}/${normalized}-original.svg`;
}
