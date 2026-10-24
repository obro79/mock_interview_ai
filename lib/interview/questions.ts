import { z } from "zod";

/** Body that the Vapi "generate" workflow POSTs to /api/vapi/generate. */
export const generateRequestSchema = z.object({
    type: z.string().min(1),
    role: z.string().min(1),
    level: z.string().min(1),
    techstack: z.string().default(""),
    amount: z.coerce.number().int().min(1).max(20),
    userid: z.string().min(1),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export function parseTechstack(techstack: string): string[] {
    return techstack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);
}

export function buildQuestionsPrompt({
    role,
    level,
    techstack,
    type,
    amount,
}: Pick<GenerateRequest, "role" | "level" | "techstack" | "type" | "amount">) {
    return `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]`;
}

/**
 * Parses the model's reply into a list of questions. Models often wrap JSON in
 * a ```json fence or add a sentence around it, so we pull out the first JSON
 * array instead of trusting the raw text.
 */
export function parseQuestions(text: string): string[] {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end <= start) {
        throw new Error("Model response did not contain a JSON array of questions");
    }

    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    const questions = z.array(z.string()).parse(parsed);

    const cleaned = questions.map((q) => q.trim()).filter(Boolean);
    if (cleaned.length === 0) {
        throw new Error("Model returned no questions");
    }
    return cleaned;
}

/** Formats questions for the {{questions}} variable in the interviewer prompt. */
export function formatQuestionsForAgent(questions: string[] = []): string {
    return questions.map((question) => `- ${question}`).join("\n");
}
