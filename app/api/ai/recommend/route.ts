import { type NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/security/session-cookies";
import { RECOMMENDATION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getDefaultTextModel, hasConfiguredAiProvider } from "@/lib/ai/provider";

export const maxDuration = 30;

const RecommendationSchema = z.object({
  recommendedPlan: z.object({
    id: z.string(),
    name: z.string(),
    reason: z.string(),
  }),
  alternativePlan: z.object({
    id: z.string().nullable(),
    name: z.string().nullable(),
    reason: z.string().nullable(),
  }),
  tips: z.array(z.string()),
  estimatedMonthlyCost: z.number(),
});

interface RecommendRequest {
  websiteCount: number;
  expectedMonthlyVisitors: number;
  needsCustomDomain: boolean;
  needsAdvancedBackups: boolean;
  industry?: string;
  budget?: "low" | "medium" | "high";
}

export async function POST(request: NextRequest) {
  try {
    if (!hasConfiguredAiProvider()) {
      return NextResponse.json(
        { error: "AI provider is not configured" },
        { status: 503 }
      );
    }

    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RecommendRequest = await request.json();

    const prompt = `Based on the following requirements, recommend the best subscription plan:

Requirements:
- Number of websites needed: ${body.websiteCount}
- Expected monthly visitors: ${body.expectedMonthlyVisitors.toLocaleString()}
- Needs custom domain: ${body.needsCustomDomain ? "Yes" : "No"}
- Needs advanced backups: ${body.needsAdvancedBackups ? "Yes" : "No"}
${body.industry ? `- Industry: ${body.industry}` : ""}
${body.budget ? `- Budget preference: ${body.budget}` : ""}

Provide your recommendation with reasoning, an alternative option if applicable, and helpful tips.`;

    const result = await generateText({
      model: getDefaultTextModel(),
      system: RECOMMENDATION_SYSTEM_PROMPT,
      prompt,
      output: Output.object({ schema: RecommendationSchema }),
      maxOutputTokens: 800,
    });

    return NextResponse.json({
      recommendation: result.output,
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
