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

interface ReportExportData {
  report: RenovationReport;
  originalImage: string;
  renovatedImage: string;
  roomType: string;
  theme: string;
}

export function generateReportHTML(data: ReportExportData): string {
  const { report, originalImage, renovatedImage, roomType, theme } = data;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Renovation Analysis Report - ${theme} ${roomType}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #64748b;
            margin: 10px 0 0 0;
            font-size: 1.1em;
        }
        .images-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .image-container {
            text-align: center;
        }
        .image-container h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 1.2em;
        }
        .image-container img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .section h2 {
            color: #1e40af;
            margin: 0 0 15px 0;
            font-size: 1.8em;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .score-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .score-bar {
            flex: 1;
            height: 24px;
            background: #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            margin-right: 15px;
        }
        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #eab308, #22c55e);
            border-radius: 12px;
        }
        .score-text {
            font-size: 1.4em;
            font-weight: bold;
            color: #1e40af;
            min-width: 60px;
            text-align: right;
        }
        ul {
            padding-left: 0;
            list-style: none;
        }
        ul li {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
            position: relative;
            padding-left: 25px;
        }
        ul li:last-child {
            border-bottom: none;
        }
        ul li::before {
            content: "✓";
            color: #22c55e;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .color-palette {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .color-swatch {
            display: flex;
            align-items: center;
            background: #f9fafb;
            border-radius: 8px;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
        }
        .color-box {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            margin-right: 8px;
            border: 1px solid #d1d5db;
        }
        .cost-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .cost-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .cost-table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        .cost-table .total-row {
            font-weight: bold;
            background: #f9fafb;
            border-top: 2px solid #2563eb;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
        }
        @media print {
            body { background: white; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Renovation Analysis Report</h1>
        <p><strong>${theme} ${roomType}</strong> • Generated on ${currentDate}</p>
    </div>

    <div class="images-section">
        <div class="image-container">
            <h3>Original Room</h3>
            <img src="${originalImage}" alt="Original room" />
        </div>
        <div class="image-container">
            <h3>Renovated Room</h3>
            <img src="${renovatedImage}" alt="Renovated room" />
        </div>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p><strong>Style Score:</strong> ${report.styleScore}/100</p>
        <div class="score-section">
            <div class="score-bar">
                <div class="score-fill" style="width: ${report.styleScore}%"></div>
            </div>
            <div class="score-text">${report.styleScore}%</div>
        </div>
        <p style="margin-top: 15px;">${report.summary}</p>
    </div>

    <div class="section">
        <h2>Key Changes</h2>
        <ul>
            ${report.keyChanges.map(change => `<li>${change}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Design Analysis</h2>
        <p>${report.designAnalysis}</p>
    </div>

    <div class="section">
        <h2>Color Palette</h2>
        <div class="color-palette">
            ${report.colorPalette.map(color => `
                <div class="color-swatch">
                    <div class="color-box" style="background-color: ${color}"></div>
                    <span>${color}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Functionality Improvements</h2>
        <ul>
            ${report.functionalityImprovements.map(improvement => `<li>${improvement}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map((rec, index) => `<li>${index + 1}. ${rec}</li>`).join('')}
        </ul>
    </div>

    ${report.costEstimates ? `
    <div class="section">
        <h2>Cost Estimates</h2>
        <table class="cost-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Estimated Range</th>
                </tr>
            </thead>
            <tbody>
                ${report.costEstimates.breakdown.map(item => `
                    <tr>
                        <td>${item.item}</td>
                        <td>${item.range}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total Estimated Range</strong></td>
                    <td><strong>${report.costEstimates.totalRange}</strong></td>
                </tr>
            </tbody>
        </table>
        <p style="margin-top: 15px; font-style: italic; color: #6b7280;">
            *Cost estimates are approximate and may vary based on location, quality, and contractor rates.
        </p>
    </div>
    ` : ''}

    <div class="footer">
        <p>Report generated by RoomGPT AI Renovation Analysis</p>
        <p>Powered by OpenAI Vision API</p>
    </div>
</body>
</html>`;

  return html;
}

export async function exportReportAsPDF(data: ReportExportData): Promise<Blob> {
  // Generate HTML content
  const htmlContent = generateReportHTML(data);

  // Create a blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // Note: For true PDF generation, you would typically use a library like jsPDF or Puppeteer
  // For this implementation, we're returning an HTML file that can be printed to PDF
  // The user can open this file in a browser and print to PDF
  return blob;
}

export function downloadReport(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateReportFilename(roomType: string, theme: string): string {
  const date = new Date().toISOString().split('T')[0];
  const normalizedRoomType = roomType.toLowerCase().replace(/\s+/g, '-');
  const normalizedTheme = theme.toLowerCase();
  return `renovation-report-${normalizedRoomType}-${normalizedTheme}-${date}.html`;
}