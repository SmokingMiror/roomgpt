import { z } from 'zod';

/**
 * Cost breakdown item schema
 */
export const CostBreakdownItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  range: z.string().min(1, "Cost range is required"),
});

/**
 * Cost estimates schema
 */
export const CostEstimatesSchema = z.object({
  totalRange: z.string().min(1, "Total cost range is required"),
  breakdown: z.array(CostBreakdownItemSchema).min(1, "At least one cost breakdown item is required"),
});

/**
 * Renovation report schema
 */
export const RenovationReportSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters").max(500, "Summary must be less than 500 characters"),
  keyChanges: z.array(z.string().min(1)).min(1, "At least one key change is required").max(10, "Too many key changes"),
  designAnalysis: z.string().min(20, "Design analysis must be at least 20 characters").max(2000, "Design analysis is too long"),
  recommendations: z.array(z.string().min(1)).min(1, "At least one recommendation is required").max(15, "Too many recommendations"),
  colorPalette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")).min(1, "At least one color is required").max(10, "Too many colors"),
  styleScore: z.number().int().min(0, "Style score must be at least 0").max(100, "Style score must be at most 100"),
  functionalityImprovements: z.array(z.string().min(1)).min(0, "Functionality improvements must be an array").max(8, "Too many functionality improvements"),
  costEstimates: CostEstimatesSchema.optional(),
});

/**
 * Request schema for report generation
 */
export const ReportGenerationRequestSchema = z.object({
  originalImage: z.string().url("Invalid original image URL"),
  renovatedImage: z.string().url("Invalid renovated image URL"),
  theme: z.string().min(1, "Theme is required"),
  roomType: z.string().min(1, "Room type is required"),
  includeCostEstimates: z.boolean().default(false),
});

/**
 * Enhanced generate route request schema
 */
export const GenerateRequestSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  theme: z.string().min(1, "Theme is required"),
  room: z.string().min(1, "Room type is required"),
  generateReport: z.boolean().default(false),
  includeCostEstimates: z.boolean().default(false),
});

/**
 * Enhanced generate route response schema
 */
export const GenerateResponseSchema = z.object({
  renovatedImage: z.string().url("Invalid renovated image URL"),
  renovationReport: RenovationReportSchema.optional(),
});

/**
 * API response wrapper schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Type exports inferred from schemas
 */
export type CostBreakdownItem = z.infer<typeof CostBreakdownItemSchema>;
export type CostEstimates = z.infer<typeof CostEstimatesSchema>;
export type RenovationReport = z.infer<typeof RenovationReportSchema>;
export type ReportGenerationRequest = z.infer<typeof ReportGenerationRequestSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

/**
 * Validation functions
 */
export function validateReportGenerationRequest(data: unknown): ReportGenerationRequest {
  return ReportGenerationRequestSchema.parse(data);
}

export function validateGenerateRequest(data: unknown): GenerateRequest {
  return GenerateRequestSchema.parse(data);
}

export function validateRenovationReport(data: unknown): RenovationReport {
  return RenovationReportSchema.parse(data);
}

/**
 * Safe validation functions (return null instead of throwing)
 */
export function safeValidateReportGenerationRequest(data: unknown): ReportGenerationRequest | null {
  const result = ReportGenerationRequestSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function safeValidateGenerateRequest(data: unknown): GenerateRequest | null {
  const result = GenerateRequestSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function safeValidateRenovationReport(data: unknown): RenovationReport | null {
  const result = RenovationReportSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Template fallback report when AI analysis fails
 */
export function createFallbackReport(theme: string, roomType: string, includeCosts: boolean = false): RenovationReport {
  const report: RenovationReport = {
    summary: `Your ${roomType.toLowerCase()} has been successfully transformed to a ${theme.toLowerCase()} style. The renovation captures the essence of the selected design theme while maintaining functionality.`,
    keyChanges: [
      `Updated to ${theme.toLowerCase()} aesthetic`,
      'Enhanced color coordination',
      'Improved layout and flow',
      'Modernized decorative elements',
      'Optimized space utilization'
    ],
    designAnalysis: `The ${theme.toLowerCase()} transformation brings a fresh perspective to your ${roomType.toLowerCase()}. The design successfully incorporates key elements of the ${theme.toLowerCase()} style, creating a cohesive and harmonious space. The balance between aesthetics and functionality has been maintained throughout the renovation.`,
    recommendations: [
      'Add decorative lighting to enhance ambiance',
      'Consider texture variations through textiles',
      'Incorporate plants for natural elements',
      'Select artwork that complements the theme',
      'Maintain the color scheme with additional accents',
      'Consider smart home integrations for modern convenience'
    ],
    colorPalette: generateThemeColors(theme),
    styleScore: 85,
    functionalityImprovements: [
      'Enhanced spatial organization',
      'Improved lighting distribution',
      'Better storage integration',
      'Optimized furniture placement'
    ],
  };

  if (includeCosts) {
    report.costEstimates = generateFallbackCosts(roomType);
  }

  return report;
}

/**
 * Generate theme-appropriate color palettes
 */
function generateThemeColors(theme: string): string[] {
  const colorPalettes: Record<string, string[]> = {
    'Modern': ['#2C3E50', '#ECF0F1', '#3498DB', '#E74C3C', '#95A5A6', '#34495E'],
    'Vintage': ['#8B4513', '#F4E4BC', '#CD853F', '#704214', '#DEB887', '#D2691E'],
    'Minimalist': ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#333333', '#666666', '#999999'],
    'Professional': ['#1F2937', '#F9FAFB', '#3B82F6', '#6B7280', '#E5E7EB', '#111827'],
    'Tropical': ['#2E7D32', '#FFF3E0', '#FF6F00', '#4CAF50', '#FFC107', '#795548']
  };

  return colorPalettes[theme] || colorPalettes['Modern'];
}

/**
 * Generate fallback cost estimates
 */
function generateFallbackCosts(roomType: string): CostEstimates {
  const baseCosts: Record<string, CostEstimates> = {
    'Living Room': {
      totalRange: '$8,000-25,000',
      breakdown: [
        { item: 'Furniture', range: '$3,000-12,000' },
        { item: 'Paint & Decor', range: '$800-3,000' },
        { item: 'Lighting', range: '$1,200-4,000' },
        { item: 'Flooring', range: '$2,000-4,000' },
        { item: 'Accessories', range: '$1,000-2,000' }
      ]
    },
    'Bedroom': {
      totalRange: '$5,000-15,000',
      breakdown: [
        { item: 'Furniture', range: '$2,000-8,000' },
        { item: 'Paint & Decor', range: '$500-2,000' },
        { item: 'Lighting', range: '$800-2,500' },
        { item: 'Flooring', range: '$1,200-2,000' },
        { item: 'Accessories', range: '$500-1,500' }
      ]
    },
    'Bathroom': {
      totalRange: '$10,000-30,000',
      breakdown: [
        { item: 'Fixtures', range: '$4,000-15,000' },
        { item: 'Tile & Materials', range: '$3,000-8,000' },
        { item: 'Lighting', range: '$1,000-3,000' },
        { item: 'Vanities', range: '$1,500-3,000' },
        { item: 'Accessories', range: '$500-1,000' }
      ]
    },
    'Dining Room': {
      totalRange: '$6,000-18,000',
      breakdown: [
        { item: 'Furniture', range: '$2,500-10,000' },
        { item: 'Paint & Decor', range: '$600-2,000' },
        { item: 'Lighting', range: '$1,500-4,000' },
        { item: 'Flooring', range: '$1,000-2,000' },
        { item: 'Accessories', range: '$400-1,000' }
      ]
    },
    'Office': {
      totalRange: '$4,000-12,000',
      breakdown: [
        { item: 'Furniture', range: '$2,000-6,000' },
        { item: 'Paint & Decor', range: '$400-1,500' },
        { item: 'Lighting', range: '$800-2,500' },
        { item: 'Storage', range: '$500-1,500' },
        { item: 'Technology', range: '$300-500' }
      ]
    },
    'Gaming Room': {
      totalRange: '$7,000-20,000',
      breakdown: [
        { item: 'Gaming Furniture', range: '$3,000-10,000' },
        { item: 'Paint & Decor', range: '$700-2,500' },
        { item: 'Lighting', range: '$1,500-4,000' },
        { item: 'Flooring', range: '$1,000-2,000' },
        { item: 'Technology', range: '$800-1,500' }
      ]
    }
  };

  return baseCosts[roomType] || baseCosts['Living Room'];
}