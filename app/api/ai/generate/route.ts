import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getSessionFromRequest } from "@/lib/security/session-cookies";
import { CONTENT_GENERATOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export const maxDuration = 30;

interface GenerateRequest {
  type: "description" | "meta" | "blog" | "cta" | "custom";
  prompt: string;
  context?: {
    businessName?: string;
    industry?: string;
    tone?: string;
    keywords?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { type, prompt, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build context-aware prompt
    let contextPrompt = "";
    if (context) {
      const parts = [];
      if (context.businessName) parts.push(`Business: ${context.businessName}`);
      if (context.industry) parts.push(`Industry: ${context.industry}`);
      if (context.tone) parts.push(`Tone: ${context.tone}`);
      if (context.keywords?.length) parts.push(`Keywords: ${context.keywords.join(", ")}`);
      if (parts.length > 0) {
        contextPrompt = `\n\nContext:\n${parts.join("\n")}`;
      }
    }

    // Build type-specific instructions
    let typeInstructions = "";
    switch (type) {
      case "description":
        typeInstructions = "Generate a compelling website description or about page content.";
        break;
      case "meta":
        typeInstructions = "Generate SEO-optimized meta title and description. Format: Title (max 60 chars), Description (max 160 chars)";
        break;
      case "blog":
        typeInstructions = "Generate a blog post outline with suggested headings and key points.";
        break;
      case "cta":
        typeInstructions = "Generate compelling call-to-action text and button copy.";
        break;
      default:
        typeInstructions = "Generate content based on the user's request.";
    }

    const result = await generateText({
      model: "openai/gpt-5-mini",
      system: CONTENT_GENERATOR_SYSTEM_PROMPT,
      prompt: `${typeInstructions}${contextPrompt}\n\nUser request: ${prompt}`,
      maxOutputTokens: 1000,
    });

    return NextResponse.json({
      content: result.text,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
