import { describe, expect, it } from "vitest";

import {
    buildQuestionsPrompt,
    formatQuestionsForAgent,
    generateRequestSchema,
    parseQuestions,
    parseTechstack,
} from "@/lib/interview/questions";

describe("buildQuestionsPrompt", () => {
    it("interpolates every request field into the prompt", () => {
        const prompt = buildQuestionsPrompt({
            role: "Backend Engineer",
            level: "Senior",
            techstack: "Go,Kafka",
            type: "technical",
            amount: 5,
        });

        expect(prompt).toContain("The job role is Backend Engineer.");
        expect(prompt).toContain("The job experience level is Senior.");
        expect(prompt).toContain("tech stack used in the job is: Go,Kafka");
        expect(prompt).toContain("lean towards: technical");
        expect(prompt).toContain("amount of questions required is: 5");
        expect(prompt).not.toContain("${");
    });
});

describe("parseQuestions", () => {
    it("parses a plain JSON array", () => {
        expect(parseQuestions('["What is a closure?", "Explain CAP."]')).toEqual([
            "What is a closure?",
            "Explain CAP.",
        ]);
    });

    it("strips markdown code fences and surrounding prose", () => {
        const text =
            'Here are your questions:\n```json\n["Tell me about yourself", "Why us?"]\n```';
        expect(parseQuestions(text)).toEqual(["Tell me about yourself", "Why us?"]);
    });

    it("trims whitespace and drops empty entries", () => {
        expect(parseQuestions('["  Q1 ", "", "Q2"]')).toEqual(["Q1", "Q2"]);
    });

    it("throws when there is no array", () => {
        expect(() => parseQuestions("Sorry, I can't help with that.")).toThrow();
    });

    it("throws when the array is not all strings", () => {
        expect(() => parseQuestions("[1, 2, 3]")).toThrow();
    });

    it("throws when the array is empty", () => {
        expect(() => parseQuestions("[]")).toThrow(/no questions/);
    });
});

describe("parseTechstack", () => {
    it("splits, trims and drops blanks", () => {
        expect(parseTechstack(" React, Next.js ,,TypeScript ")).toEqual([
            "React",
            "Next.js",
            "TypeScript",
        ]);
    });

    it("returns an empty list for an empty string", () => {
        expect(parseTechstack("")).toEqual([]);
    });
});

describe("formatQuestionsForAgent", () => {
    it("renders a bulleted list", () => {
        expect(formatQuestionsForAgent(["A?", "B?"])).toBe("- A?\n- B?");
    });

    it("handles missing questions", () => {
        expect(formatQuestionsForAgent()).toBe("");
    });
});

describe("generateRequestSchema", () => {
    const valid = {
        type: "mixed",
        role: "Frontend Developer",
        level: "Junior",
        techstack: "React,TypeScript",
        amount: "3",
        userid: "user-123",
    };

    it("accepts a valid body and coerces amount to a number", () => {
        const result = generateRequestSchema.parse(valid);
        expect(result.amount).toBe(3);
    });

    it("rejects a missing user id", () => {
        const { userid: _userid, ...rest } = valid;
        expect(generateRequestSchema.safeParse(rest).success).toBe(false);
    });

    it("rejects an unreasonable question count", () => {
        expect(generateRequestSchema.safeParse({ ...valid, amount: 500 }).success).toBe(
            false
        );
    });
});
