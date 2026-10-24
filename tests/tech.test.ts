import { describe, expect, it } from "vitest";

import { getTechIconUrl, normalizeTechName } from "@/lib/tech";

describe("normalizeTechName", () => {
    it.each([
        ["React", "react"],
        ["Next.js", "nextjs"],
        ["Tailwind CSS", "tailwindcss"],
        ["node.js", "nodejs"],
        ["TS", "typescript"],
    ])("maps %s to %s", (input, expected) => {
        expect(normalizeTechName(input)).toBe(expected);
    });

    it("returns undefined for unknown tech", () => {
        expect(normalizeTechName("COBOL")).toBeUndefined();
    });
});

describe("getTechIconUrl", () => {
    it("builds a devicon URL for known tech", () => {
        expect(getTechIconUrl("Docker")).toBe(
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
        );
    });

    it("returns null instead of an 'undefined' URL for unknown tech", () => {
        expect(getTechIconUrl("COBOL")).toBeNull();
    });
});
