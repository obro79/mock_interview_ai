import { describe, expect, it } from "vitest";

import {
    FEEDBACK_CATEGORIES,
    buildFeedbackPrompt,
    feedbackSchema,
    formatTranscript,
} from "@/lib/interview/feedback";

const transcript = [
    { role: "assistant", content: "Tell me about a project you shipped." },
    { role: "user", content: "I built a Kafka pipeline." },
];

describe("formatTranscript", () => {
    it("renders one line per message with its speaker", () => {
        expect(formatTranscript(transcript)).toBe(
            "- assistant: Tell me about a project you shipped.\n" +
                "- user: I built a Kafka pipeline.\n"
        );
    });
});

describe("buildFeedbackPrompt", () => {
    it("includes the transcript and names every scored category exactly", () => {
        const prompt = buildFeedbackPrompt(transcript);
        expect(prompt).toContain("- user: I built a Kafka pipeline.");
        for (const category of FEEDBACK_CATEGORIES) {
            expect(prompt).toContain(`**${category.name}**`);
        }
    });
});

describe("feedbackSchema", () => {
    const valid = {
        totalScore: 72,
        categoryScores: FEEDBACK_CATEGORIES.map((c) => ({
            name: c.name,
            score: 70,
            comment: "Solid.",
        })),
        strengths: ["Clear structure"],
        areasForImprovement: ["Go deeper on trade-offs"],
        finalAssessment: "Promising candidate.",
    };

    it("accepts well-formed feedback", () => {
        expect(feedbackSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects categories out of order or renamed", () => {
        const renamed = {
            ...valid,
            categoryScores: [
                { ...valid.categoryScores[0], name: "Communication" },
                ...valid.categoryScores.slice(1),
            ],
        };
        expect(feedbackSchema.safeParse(renamed).success).toBe(false);
    });

    it("rejects scores outside 0 to 100", () => {
        expect(feedbackSchema.safeParse({ ...valid, totalScore: 140 }).success).toBe(
            false
        );
    });
});
