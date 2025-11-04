import React from 'react';

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

interface ReportDisplayProps {
  report: RenovationReport;
  onDownloadReport?: () => void;
}

export default function ReportDisplay({ report, onDownloadReport }: ReportDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Renovation Analysis Report</h2>
          <p className="text-gray-600">Comprehensive analysis of your room transformation</p>
        </div>
        {onDownloadReport && (
          <button
            onClick={onDownloadReport}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Download Report
          </button>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
        <p className="text-gray-600 leading-relaxed">{report.summary}</p>
      </div>

      {/* Style Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Style Score</h3>
          <span className="text-sm font-medium text-gray-600">
            {report.styleScore}/100 - {getScoreLabel(report.styleScore)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getScoreColor(report.styleScore)}`}
            style={{ width: `${report.styleScore}%` }}
          />
        </div>
      </div>

      {/* Key Changes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Changes</h3>
        <ul className="space-y-2">
          {report.keyChanges.map((change, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">✓</span>
              <span className="text-gray-600">{change}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Design Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Design Analysis</h3>
        <p className="text-gray-600 leading-relaxed">{report.designAnalysis}</p>
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Color Palette</h3>
        <div className="flex flex-wrap gap-2">
          {report.colorPalette.map((color, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-mono text-gray-600">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Functionality Improvements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Functionality Improvements</h3>
        <ul className="space-y-2">
          {report.functionalityImprovements.map((improvement, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">→</span>
              <span className="text-gray-600">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cost Estimates */}
      {report.costEstimates && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cost Estimates</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700">Total Estimated Range</span>
              <span className="text-xl font-bold text-blue-600">{report.costEstimates.totalRange}</span>
            </div>
            <div className="space-y-2">
              {report.costEstimates.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600">{item.item}</span>
                  <span className="font-medium text-gray-800">{item.range}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              *Cost estimates are approximate and may vary based on location, quality, and contractor rates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}