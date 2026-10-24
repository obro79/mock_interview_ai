import { beforeEach, describe, expect, it, vi } from "vitest";

const add = vi.fn();
vi.mock("@/firebase/admin", () => ({
    adminDb: () => ({ collection: () => ({ add }) }),
}));

const generateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...args: unknown[]) => generateText(...args) }));
vi.mock("@ai-sdk/google", () => ({ google: () => "gemini" }));

import { POST } from "@/app/api/vapi/generate/route";

const post = (body: string) =>
    POST(
        new Request("http://localhost/api/vapi/generate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
        })
    );

const validBody = {
    type: "technical",
    role: "Backend Engineer",
    level: "Senior",
    techstack: "Go, Kafka",
    amount: 2,
    userid: "user-1",
};

describe("POST /api/vapi/generate", () => {
    beforeEach(() => {
        add.mockReset();
        generateText.mockReset();
    });

    it("returns 400 for malformed JSON", async () => {
        const res = await post("{");
        expect(res.status).toBe(400);
        expect(generateText).not.toHaveBeenCalled();
    });

    it("returns 400 when required fields are missing", async () => {
        const res = await post(JSON.stringify({ role: "Engineer" }));
        expect(res.status).toBe(400);
        expect(add).not.toHaveBeenCalled();
    });

    it("stores the generated interview", async () => {
        generateText.mockResolvedValue({ text: '```json\n["Q1?", "Q2?"]\n```' });

        const res = await post(JSON.stringify(validBody));

        expect(res.status).toBe(200);
        expect(generateText.mock.calls[0][0].prompt).toContain("Backend Engineer");
        expect(add).toHaveBeenCalledWith(
            expect.objectContaining({
                role: "Backend Engineer",
                techstack: ["Go", "Kafka"],
                questions: ["Q1?", "Q2?"],
                userId: "user-1",
                finalized: true,
            })
        );
    });

    it("returns 500 without writing when the model output is unusable", async () => {
        generateText.mockResolvedValue({ text: "Sorry, I can't do that." });

        const res = await post(JSON.stringify(validBody));

        expect(res.status).toBe(500);
        expect(add).not.toHaveBeenCalled();
    });
});
