import { NextResponse } from "next/server";
import { generateRenovationReport } from "../../utils/reportGeneration";
import { validateReportGenerationRequest, createFallbackReport } from "../../types/reportTypes";
import { retryWithBackoff } from "../../utils/retry";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedRequest = validateReportGenerationRequest(body);
    const { originalImage, renovatedImage, theme, roomType, includeCostEstimates = false } = validatedRequest;

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 401 }
      );
    }

    // Generate renovation report with retry logic and fallback
    console.log("Starting dedicated report generation...");
    const result = await retryWithBackoff(async () => {
      return await generateRenovationReport({
        originalImage,
        renovatedImage,
        theme,
        roomType,
        includeCostEstimates,
      });
    }, {
      maxRetries: 6,
      baseDelay: 1000,
      maxDelay: 32000,
      onRetry: (attempt, error) => {
        console.log(`Report generation retry ${attempt}: ${error.message}`);
      }
    });

    if (result.success) {
      console.log("Report generated successfully");
      return NextResponse.json(result.data);
    } else {
      console.error("Report generation failed after retries:", result.error);

      // Provide fallback report if all retries fail
      console.log("Providing fallback report template...");
      const fallbackReport = createFallbackReport(theme, roomType, includeCostEstimates);
      return NextResponse.json(fallbackReport);
    }
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