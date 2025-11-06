import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateRenovationReport } from "../../utils/reportGeneration";
import { retryWithBackoff, retryFetch } from "../../utils/retry";
import { validateGenerateRequest, createFallbackReport } from "../../types/reportTypes";

// Create a new ratelimiter, that allows 5 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "1440 m"),
      analytics: true,
    })
  : undefined;

export async function POST(request: Request) {
  // Rate Limiter Code
  if (ratelimit) {
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");

    const result = await ratelimit.limit(ipIdentifier ?? "");

    if (!result.success) {
      return new Response(
        "Too many uploads in 1 day. Please try again in a 24 hours.",
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit,
            "X-RateLimit-Remaining": result.remaining,
          } as any,
        }
      );
    }
  }

  const body = await request.json();

  // Validate request body
  const validatedRequest = validateGenerateRequest(body);
  const { imageUrl, theme, room, generateReport = false, includeCostEstimates = false } = validatedRequest;

  // Use FlipAI preferred environment variable with fallback
  const replicateApiToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;

  if (!replicateApiToken) {
    return NextResponse.json(
      { error: "Replicate API token not configured. Please set REPLICATE_API_TOKEN environment variable." },
      { status: 500 }
    );
  }

  // POST request to Replicate to start the image restoration generation process with retry logic
  let startResponse = await retryFetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + replicateApiToken,
    },
    body: JSON.stringify({
      version:
        "bfcb42751f8f702e4661daa3e592c960cdec178831df79d361c54a78e8ec87e1",
      input: {
        image: imageUrl,
        prompt:
          room === "Gaming Room"
            ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
            : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
        a_prompt:
          "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();

  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage: string | null = null;
  while (!restoredImage) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === "succeeded") {
      restoredImage = jsonFinalResponse.output;
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!restoredImage) {
    return NextResponse.json("Failed to restore image");
  }

  // Generate renovation report if requested
  let renovationReport = null;
  if (generateReport && process.env.OPENAI_API_KEY) {
    try {
      renovationReport = await generateRenovationReport({
        originalImage: imageUrl,
        renovatedImage: restoredImage,
        theme,
        roomType: room,
        includeCostEstimates,
      });
    } catch (reportError) {
      console.error('Failed to generate renovation report:', reportError);
      // Continue without report - this is not a blocking error
      renovationReport = null;
    }
  }

  return NextResponse.json({
    renovatedImage: restoredImage,
    renovationReport,
  });
}
