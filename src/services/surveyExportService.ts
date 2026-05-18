import type { SurveyInstance, SurveyQuestion } from '../types/survey.types';
import surveyApiService from './surveyApiService';
import {
  calculateCompletionPercentage,
  formatDate,
  formatResponseValue,
  getStatusLabel,
} from '../lib/survey-utils';

export class SurveyExportService {
  static async exportAsJSON(instance: SurveyInstance): Promise<void> {
    try {
      const exportData = await surveyApiService.exportSurveyInstance(
        instance.id
      );

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-${instance.id}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to export survey as JSON'
      );
    }
  }

  static async exportAsPDF(instance: SurveyInstance): Promise<void> {
    try {
      const template = instance.template;
      const supplier = instance.supplier;

      // Get responses in a more readable format
      const responsesRecord: Record<
        string,
        string | number | boolean | string[]
      > = {};
      (instance.responses ?? []).forEach(response => {
        try {
          responsesRecord[response.questionId] = JSON.parse(response.response);
        } catch {
          responsesRecord[response.questionId] = response.response;
        }
      });

      const completionPercentage =
        (instance.responses ?? []).length > 0
          ? calculateCompletionPercentage(instance, responsesRecord)
          : 0;

      const htmlContent = this.generatePDFHTML(
        instance,
        template,
        supplier,
        responsesRecord,
        completionPercentage
      );

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const newWindow = window.open(url, '_blank', 'width=800,height=600');

      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        };
      } else {
        // Fallback: download HTML file if popup blocked
        const link = document.createElement('a');
        link.href = url;
        link.download = `survey-${instance.id}-export.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to export survey as PDF'
      );
    }
  }

  private static generatePDFHTML(
    instance: SurveyInstance,
    template: SurveyInstance['template'],
    supplier: SurveyInstance['supplier'],
    responsesRecord: Record<string, string | number | boolean | string[]>,
    completionPercentage: number
  ): string {
    const parsedQuestions: SurveyQuestion[] = Array.isArray(template?.questions)
      ? template.questions
      : template?.questions
        ? JSON.parse(template.questions)
        : [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Survey Export - ${template?.name || 'Survey'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.5;
            color: rgba(0, 0, 0, 0.87);
            background-color: #fafafa;
            padding: 24px;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .header {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
            color: white;
            padding: 32px 24px;
            text-align: left;
          }

          .header h1 {
            font-size: 28px;
            font-weight: 400;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .header .subtitle {
            font-size: 20px;
            font-weight: 300;
            opacity: 0.9;
            margin-bottom: 4px;
          }

          .header .description {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 12px;
          }

          .content {
            padding: 24px;
          }

          .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
          }

          .metadata-card {
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 16px;
            transition: box-shadow 0.2s ease;
          }

          .metadata-label {
            font-size: 12px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .metadata-value {
            font-size: 16px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.87);
          }

          .status-chip {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-completed {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          .status-in_progress {
            background-color: #e3f2fd;
            color: #1976d2;
          }
          .status-sent {
            background-color: #fff8e1;
            color: #f57c00;
          }
          .status-created {
            background-color: #f3e5f5;
            color: #7b1fa2;
          }
          .status-expired {
            background-color: #ffebee;
            color: #d32f2f;
          }

          .progress-container {
            margin-top: 8px;
          }

          .progress-bar {
            width: 100%;
            height: 6px;
            background-color: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background-color: #4caf50;
            width: ${completionPercentage}%;
            transition: width 0.3s ease;
          }

          .progress-text {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            margin-top: 4px;
          }

          .section-title {
            font-size: 20px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }

          .question-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            margin-bottom: 16px;
            overflow: hidden;
            transition: box-shadow 0.2s ease;
          }

          .question-card:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .question-header {
            background: #fafafa;
            border-bottom: 1px solid #e0e0e0;
            padding: 16px;
          }

          .question-title {
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
            margin-bottom: 8px;
          }

          .question-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }

          .meta-chip {
            background: #e0e0e0;
            color: rgba(0, 0, 0, 0.6);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
          }

          .meta-chip.required {
            background: #ffebee;
            color: #d32f2f;
          }

          .question-content {
            padding: 16px;
          }

          .response-content {
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 12px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
            min-height: 40px;
            display: flex;
            align-items: center;
          }

          .no-response {
            color: rgba(0, 0, 0, 0.38);
            font-style: italic;
            background: #fff3e0;
            border-color: #ffb74d;
          }

          .footer {
            margin-top: 40px;
            padding: 24px;
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
            text-align: center;
          }

          .footer-title {
            font-size: 14px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
            margin-bottom: 8px;
          }

          .footer-details {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 1.4;
          }

          .footer-branding {
            margin-top: 16px;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.38);
          }

          .footer-branding a {
            color: #1976d2;
            text-decoration: none;
          }

          @media print {
            body {
              padding: 15px;
              background: white;
            }
            .container {
              box-shadow: none;
              border: 1px solid #e0e0e0;
            }
            .question-card {
              break-inside: avoid;
              box-shadow: none;
            }
            .header {
              background: #1976d2 !important;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Survey Export Report</h1>
            <div class="subtitle">${template?.name || 'Survey'}</div>
            ${template?.description ? `<div class="description">${template.description}</div>` : ''}
          </div>

          <div class="content">
            <div class="metadata-grid">
              <div class="metadata-card">
                <div class="metadata-label">Supplier</div>
                <div class="metadata-value">${supplier?.name || 'Unknown Supplier'}</div>
              </div>

              <div class="metadata-card">
                <div class="metadata-label">Status</div>
                <div class="metadata-value">
                  <span class="status-chip status-${instance.status.toLowerCase()}">${getStatusLabel(instance.status)}</span>
                </div>
              </div>

              <div class="metadata-card">
                <div class="metadata-label">Created</div>
                <div class="metadata-value">${formatDate(instance.createdAt)}</div>
              </div>

              <div class="metadata-card">
                <div class="metadata-label">Completion</div>
                <div class="metadata-value">${completionPercentage}%</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill"></div>
                  </div>
                  <div class="progress-text">${completionPercentage}% complete</div>
                </div>
              </div>

              ${
                instance.completedAt
                  ? `
              <div class="metadata-card">
                <div class="metadata-label">Completed</div>
                <div class="metadata-value">${formatDate(instance.completedAt)}</div>
              </div>
              `
                  : ''
              }

              <div class="metadata-card">
                <div class="metadata-label">Expires</div>
                <div class="metadata-value">${formatDate(instance.expiresAt)}</div>
              </div>
            </div>

            <h2 class="section-title">Survey Questions & Responses</h2>

            ${
              parsedQuestions.length > 0
                ? parsedQuestions
                    .map((question: SurveyQuestion, index: number) => {
                      const response = responsesRecord[question.id];
                      const formattedResponse = response
                        ? formatResponseValue(response.toString())
                        : '';

                      return `
                    <div class="question-card">
                      <div class="question-header">
                        <div class="question-title">${index + 1}. ${question.question}</div>
                        <div class="question-meta">
                          <span class="meta-chip">${question.type}</span>
                          <span class="meta-chip ${question.required ? 'required' : ''}">${question.required ? 'Required' : 'Optional'}</span>
                          ${question.options ? question.options.map(opt => `<span class="meta-chip">${opt}</span>`).join('') : ''}
                        </div>
                      </div>
                      <div class="question-content">
                        <div class="response-content ${!response ? 'no-response' : ''}">
                          ${formattedResponse || 'No response provided'}
                        </div>
                      </div>
                    </div>
                  `;
                    })
                    .join('')
                : '<div style="text-align: center; color: rgba(0, 0, 0, 0.38); font-style: italic; padding: 40px;">No questions available in this survey template.</div>'
            }
          </div>

          <div class="footer">
            <div class="footer-title">Export Information</div>
            <div class="footer-details">
              Exported on: ${new Date().toLocaleString()}<br>
              Survey ID: ${instance.id}<br>
              Total Questions: ${parsedQuestions.length}<br>
              Total Responses: ${(instance.responses ?? []).length}
            </div>
            <div class="footer-branding">
              Powered by <a href="https://joinnentropy.com">N'entropy</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default SurveyExportService;
