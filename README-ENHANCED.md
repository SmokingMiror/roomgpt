# FlipAI RoomGPT - AI Room Renovation with Analysis Reports

Enhanced RoomGPT application that combines AI-powered room renovation with comprehensive analysis reports using OpenAI's Vision API. This implementation follows FlipAI specifications for seamless room renovation workflow.

## Features

### Core Functionality
- **AI Room Renovation**: Transform your room images using Replicate API with the specified `thijssdaniels/room-gpt` model
- **Multi-room Support**: Works with Living Room, Dining Room, Bedroom, Bathroom, Office, and Gaming Room
- **Before/After Comparison**: Side-by-side slider to compare original and renovated rooms
- **Automatic Report Generation**: Configurable auto-generation of renovation reports after image creation

### 🆕 AI Analysis Features
- **Renovation Analysis Reports**: Comprehensive AI-generated analysis of room transformations
- **Style Scoring**: 0-100 score rating how well the chosen style was executed
- **Key Changes Identification**: AI identifies major design changes made during renovation
- **Design Analysis**: Detailed analysis of design elements, style cohesion, and aesthetic improvements
- **Color Palette Extraction**: Automatically extracts color scheme from renovated rooms
- **Functionality Improvements**: Identifies enhanced features and functional improvements
- **Actionable Recommendations**: Practical suggestions for completing the renovation look
- **Optional Cost Estimates**: Realistic cost breakdowns for implementing the renovation (Furniture, Paint & Decor, Lighting, Flooring, Accessories)

### User Interface
- **Enhanced UI**: Modern interface with report generation controls
- **Settings Modal**: Choose between GPT-4o-mini (faster, cost-effective) and GPT-4o (higher quality) models
- **Report Download**: Export comprehensive reports as HTML files (printable to PDF)
- **Cost Estimate Toggle**: Option to include/exclude cost estimates in reports
- **Auto-Generate Toggle**: Configure automatic report generation after renovation
- **Error Handling**: Graceful handling of API failures with clear user feedback
- **Rate Limit Recovery**: Automatic retry with exponential backoff for 429 errors

## How it works

The application uses [ControlNet](https://github.com/lllyasviel/ControlNet) to generate room variations via Replicate API and adds OpenAI Vision API analysis for comprehensive renovation reports. Images are stored using [Bytescale](https://www.bytescale.com/).

## Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd roomgpt
```

### 2. Get API Keys

**Replicate API (Required):**
1. Go to [Replicate](https://replicate.com/) to make an account
2. Click your profile picture → "API Tokens"
3. Copy your API token

**OpenAI API (Required for reports):**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create and copy your API key

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
# FlipAI requirement: Replicate API Token for room generation
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Legacy support (backward compatibility)
REPLICATE_API_KEY=your_replicate_api_token_here

# FlipAI requirement: OpenAI API Key for analysis reports
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Image upload (defaults to free tier)
NEXT_PUBLIC_UPLOAD_API_KEY=your_bytescale_api_key_here

# Optional: Rate limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# FlipAI requirement: AI Model selection (gpt-4o-mini recommended)
OPENAI_MODEL=gpt-4o-mini
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Basic Room Renovation
1. Select your desired theme (Modern, Vintage, Minimalist, etc.)
2. Choose your room type (Living Room, Bedroom, etc.)
3. Upload a clear photo of your room
4. Wait for AI to generate the renovated room
5. Download the generated image

### 🆕 Generating Analysis Reports

**Automatic Generation (Recommended):**
1. Enable "Auto-generate renovation report" in step 4 (AI Analysis Options)
2. Optionally check "Include cost estimates" for detailed pricing
3. Upload your room image - report will generate automatically after renovation
4. View comprehensive report with style score, key changes, design analysis, color palette, recommendations, and cost estimates
5. Download report as HTML file (can be printed to PDF)

**Manual Generation:**
1. Complete a room renovation first
2. Check "Include cost estimates in report" if desired (optional)
3. Click "Generate Analysis Report"
4. Wait for AI analysis to complete
5. View comprehensive report and download as needed

### Settings Configuration
1. Click "Settings" button in header
2. Choose AI model:
   - **GPT-4o-mini**: Faster, more cost-effective (recommended)
   - **GPT-4o**: Higher quality, more detailed analysis
3. Save preferences

## API Endpoints

### POST /generate
Generates renovated room image using Replicate API.

**Request Body:**
```json
{
  "imageUrl": "string",
  "theme": "Modern",
  "room": "Living Room",
  "generateReport": false,
  "includeCostEstimates": false
}
```

**Response:**
```json
{
  "renovatedImage": "https://...",
  "renovationReport": { ... } // Optional
}
```

### POST /report
Generates standalone analysis report for existing images.

**Request Body:**
```json
{
  "originalImage": "https://...",
  "renovatedImage": "https://...",
  "theme": "Modern",
  "roomType": "Living Room",
  "includeCostEstimates": false
}
```

**Response:** Complete renovation report object.

## Component Structure

### New Components
- **ReportDisplay**: Renders comprehensive analysis reports
- **SettingsModal**: AI model selection and preferences
- **Enhanced Header**: Added settings button and functionality

### New Utilities
- **reportGeneration.ts**: OpenAI Vision API integration and prompt engineering
- **reportExport.ts**: HTML report generation and download functionality
- **retry.ts**: Exponential backoff retry handler for rate limiting (429 errors)
- **types/reportTypes.ts**: Zod schemas for type safety and validation

### Enhanced Files
- **app/generate/route.ts**: Enhanced with FlipAI model and retry logic
- **app/report/route.ts**: Dedicated endpoint for standalone report generation
- **app/dream/page.tsx**: Enhanced UI with auto-generation controls
- **components/Header.tsx**: Added settings integration
- **package.json**: Added OpenAI and Zod dependencies

## Error Handling

The application includes comprehensive error handling:
- **API Failures**: Graceful degradation when OpenAI or Replicate APIs are unavailable
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **Validation**: Input validation for all API parameters
- **User Feedback**: Clear error messages and loading states

## Cost Considerations

### API Costs
- **Replicate API**: Charged per image generation
- **OpenAI API**:
  - GPT-4o-mini: ~$0.01 per report
  - GPT-4o: ~$0.05 per report
- **Cost Estimates**: Provide realistic ranges but are approximate

### Recommendations
- Use GPT-4o-mini for most use cases (good quality, cost-effective)
- Enable cost estimates only when needed
- Consider rate limits for high-usage applications

## Development

### Project Structure
```
roomgpt/
├── app/
│   ├── generate/route.ts      # Enhanced generation endpoint with FlipAI model
│   ├── report/route.ts        # Dedicated report generation endpoint
│   └── dream/page.tsx         # Enhanced UI with auto-generation
├── components/
│   ├── ReportDisplay.tsx      # Report display component
│   ├── SettingsModal.tsx      # AI model selection modal
│   └── Header.tsx             # Enhanced header with settings
├── utils/
│   ├── reportGeneration.ts    # OpenAI Vision API integration
│   ├── reportExport.ts        # HTML export functionality
│   ├── retry.ts               # Exponential backoff retry logic
│   └── dropdownTypes.ts       # Existing type definitions
├── types/
│   └── reportTypes.ts         # Zod schemas for validation
├── test-endpoints.js          # API testing script
├── .env.example               # Environment variables template
└── README-ENHANCED.md         # This documentation
```

### Technologies Used
- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **AI APIs**: Replicate (image generation), OpenAI Vision (analysis)
- **Image Handling**: Bytescale Upload Widget
- **Rate Limiting**: Upstash Redis

## License

This project extends the original RoomGPT with AI analysis capabilities. Please refer to the original project's license terms.

## Support

For issues related to:
- **Room Generation**: Check Replicate API documentation
- **Analysis Reports**: Ensure OpenAI API key is valid and has sufficient credits
- **General Issues**: Check environment variables and API key configurations