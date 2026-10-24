import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
    {
        name: "Communication Skills",
        description: "Clarity, articulation, structured responses.",
    },
    {
        name: "Technical Knowledge",
        description: "Understanding of key concepts for the role.",
    },
    {
        name: "Problem Solving",
        description: "Ability to analyze problems and propose solutions.",
    },
    {
        name: "Cultural Fit",
        description: "Alignment with company values and job role.",
    },
    {
        name: "Confidence and Clarity",
        description: "Confidence in responses, engagement, and clarity.",
    },
] as const;

const categoryScore = <T extends string>(name: T) =>
    z.object({
        name: z.literal(name),
        score: z.number().min(0).max(100),
        comment: z.string(),
    });

export const feedbackSchema = z.object({
    totalScore: z.number().min(0).max(100),
    categoryScores: z.tuple([
        categoryScore(FEEDBACK_CATEGORIES[0].name),
        categoryScore(FEEDBACK_CATEGORIES[1].name),
        categoryScore(FEEDBACK_CATEGORIES[2].name),
        categoryScore(FEEDBACK_CATEGORIES[3].name),
        categoryScore(FEEDBACK_CATEGORIES[4].name),
    ]),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
});

export type TranscriptMessage = { role: string; content: string };

export function formatTranscript(transcript: TranscriptMessage[]): string {
    return transcript
        .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
        .join("");
}

export function buildFeedbackPrompt(transcript: TranscriptMessage[]): string {
    const categories = FEEDBACK_CATEGORIES.map(
        (c) => `- **${c.name}**: ${c.description}`
    ).join("\n");

    return `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
Transcript:
${formatTranscript(transcript)}
Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
${categories}`;
}
