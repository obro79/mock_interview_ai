import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { adminDb } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import {
    buildQuestionsPrompt,
    generateRequestSchema,
    parseQuestions,
    parseTechstack,
} from "@/lib/interview/questions";

export async function GET() {
    return Response.json({ success: true, data: "OK" }, { status: 200 });
}

export async function POST(request: Request) {
    const parsed = generateRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
        return Response.json(
            { success: false, error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { type, role, level, techstack, amount, userid } = parsed.data;

    try {
        const { text } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: buildQuestionsPrompt({ role, level, techstack, type, amount }),
        });

        const interview = {
            role,
            type,
            level,
            techstack: parseTechstack(techstack),
            userId: userid,
            questions: parseQuestions(text),
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        await adminDb().collection("interviews").add(interview);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error generating interview:", error);
        return Response.json(
            { success: false, error: "Failed to generate interview" },
            { status: 500 }
        );
    }
}
