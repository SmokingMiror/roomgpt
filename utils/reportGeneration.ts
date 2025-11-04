import OpenAI from 'openai';

interface RenovationReportInputs {
  originalImage: string;
  renovatedImage: string;
  theme: string;
  roomType: string;
  includeCostEstimates?: boolean;
}

interface RenovationReport {
  summary: string;
  keyChanges: string[];
  designAnalysis: string;
  recommendations: string[];
  colorPalette: string[];
  styleScore: number;
  functionalityImprovements: string[];
  costEstimates?: {
    totalRange: string;
    breakdown: Array<{
      item: string;
      range: string;
    }>;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function createAnalysisPrompt(theme: string, roomType: string, includeCostEstimates: boolean = false): string {
  let basePrompt = `Analyze this before/after room renovation and provide a comprehensive analysis. The room was transformed to a ${theme.toLowerCase()} ${roomType.toLowerCase()} style.

Please analyze both images and provide a detailed JSON response with the following structure:
{
  "summary": "Brief overview of the transformation in 2-3 sentences",
  "keyChanges": ["list", "of", "major", "changes", "max 5 items"],
  "designAnalysis": "Detailed analysis of design elements, style cohesion, and aesthetic improvements",
  "recommendations": ["actionable", "suggestions", "for", "completing", "the", "look", "max 6 items"],
  "colorPalette": ["#HEX", "colors", "extracted", "from", "renovated", "room", "max 6 colors"],
  "styleScore": 85,
  "functionalityImprovements": ["enhanced", "features", "or", "improvements", "max 4 items"]`;

  if (includeCostEstimates) {
    basePrompt += `,
  "costEstimates": {
    "totalRange": "$X,XXX-XX,XXX",
    "breakdown": [
      {"item": "Furniture", "range": "$X,XXX-XX,XXX"},
      {"item": "Paint & Decor", "range": "$XXX-X,XXX"},
      {"item": "Lighting", "range": "$XXX-X,XXX"},
      {"item": "Flooring", "range": "$XXX-X,XXX"},
      {"item": "Accessories", "range": "$XXX-X,XXX"}
    ]
  }`;
  }

  basePrompt += `

Focus on:
1. Quality of design execution and style consistency
2. Functional improvements in the space
3. Color harmony and palette cohesion
4. Practical implementation advice
5. Realistic cost estimates based on room scope and transformation quality`;

  if (includeCostEstimates) {
    basePrompt += `
6. Provide realistic cost ranges for implementing this renovation, considering room type, scope, and quality level shown`;
  }

  basePrompt += `

Style score should be 0-100, rating how well the ${theme.toLowerCase()} style was executed.
All recommendations should be practical and actionable for someone implementing this renovation.
Color palette should be extracted from the renovated room image as hex codes.

Respond only with valid JSON, no additional text.`;

  return basePrompt;
}

export async function generateRenovationReport({
  originalImage,
  renovatedImage,
  theme,
  roomType,
  includeCostEstimates = false,
}: RenovationReportInputs): Promise<RenovationReport> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = createAnalysisPrompt(theme, roomType, includeCostEstimates);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: originalImage,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: renovatedImage,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    let parsedReport: RenovationReport;
    try {
      parsedReport = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Invalid response format from AI analysis');
    }

    return validateReportData(parsedReport, includeCostEstimates);
  } catch (error) {
    console.error('Error generating renovation report:', error);
    throw error;
  }
}

function validateReportData(report: any, includeCostEstimates: boolean): RenovationReport {
  const validated: RenovationReport = {
    summary: report.summary || 'Room renovation completed with style transformation.',
    keyChanges: Array.isArray(report.keyChanges) ? report.keyChanges.slice(0, 5) : ['Updated room style', 'Enhanced functionality'],
    designAnalysis: report.designAnalysis || 'The renovation successfully transforms the space with improved aesthetics and functionality.',
    recommendations: Array.isArray(report.recommendations) ? report.recommendations.slice(0, 6) : ['Add decorative elements', 'Consider lighting upgrades'],
    colorPalette: Array.isArray(report.colorPalette) ? report.colorPalette.slice(0, 6) : ['#FFFFFF', '#F5F5F5', '#E0E0E0'],
    styleScore: typeof report.styleScore === 'number' ? Math.min(100, Math.max(0, report.styleScore)) : 80,
    functionalityImprovements: Array.isArray(report.functionalityImprovements) ? report.functionalityImprovements.slice(0, 4) : ['Improved layout', 'Better organization'],
  };

  if (includeCostEstimates && report.costEstimates) {
    validated.costEstimates = {
      totalRange: report.costEstimates.totalRange || '$5,000-15,000',
      breakdown: Array.isArray(report.costEstimates.breakdown) ? report.costEstimates.breakdown : [
        { item: 'Furniture', range: '$2,000-8,000' },
        { item: 'Paint & Decor', range: '$500-2,000' },
        { item: 'Lighting', range: '$1,000-3,000' },
        { item: 'Flooring', range: '$1,500-2,000' },
      ],
    };
  }

  return validated;
}

export function formatOpenAIResponse(rawResponse: string): RenovationReport {
  try {
    return JSON.parse(rawResponse);
  } catch (error) {
    console.error('Error formatting OpenAI response:', error);
    throw new Error('Failed to format AI response');
  }
}