import { NextResponse } from "next/server";
import { generateRenovationReport } from "../../utils/reportGeneration";
import { validateReportGenerationRequest, createFallbackReport } from "../../types/reportTypes";
import { retryWithBackoff } from "../../utils/retry";

export async function POST(request: Request) {
  try {
    const { originalImage, renovatedImage, theme, roomType, includeCostEstimates = false } = await request.json();

    // Validate required parameters
    if (!originalImage || !renovatedImage || !theme || !roomType) {
      return NextResponse.json(
        { error: "Missing required parameters: originalImage, renovatedImage, theme, roomType" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 401 }
      );
    }

    // Generate renovation report
    const renovationReport = await generateRenovationReport({
      originalImage,
      renovatedImage,
      theme,
      roomType,
      includeCostEstimates,
    });

    return NextResponse.json(renovationReport);
  } catch (error) {
    console.error("Error generating renovation report:", error);

    let errorMessage = "Failed to generate renovation report";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("OpenAI API key is not configured")) {
        errorMessage = "OpenAI API key is not configured";
        statusCode = 401;
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
        statusCode = 429;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Analysis request timed out. Please try again.";
        statusCode = 504;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}