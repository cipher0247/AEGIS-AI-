/**
 * Security Report Exporters
 * Produces genuine, schema-compliant JSON, structured HTML, and Printable Briefs
 * with OWASP-aligned severity breakdowns, validation anchors, and audit timestamps.
 */

import { ScanReport, OSINTReport } from '../types';

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateReportHtml(report: ScanReport, generatedAt: Date = new Date()): string {
  const critCount = report.summary.critical || 0;
  const highCount = report.summary.high || 0;
  const medCount = report.summary.medium || 0;
  const lowCount = report.summary.low || 0;
  const total = report.summary.total_vulnerabilities || (critCount + highCount + medCount + lowCount);

  const vulnsHtml = report.vulnerabilities?.map((v, i) => `
    <div style="border: 1px solid #262626; border-left: 4px solid ${v.severity === 'Critical' ? '#ff3b30' : v.severity === 'High' ? '#ff9500' : '#ffd60a'}; padding: 16px; margin-bottom: 16px; background: #0f0f0f; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #fff; font-size: 14px; font-family: monospace;">#${i + 1} ${escapeHtml(v.name)}</h3>
        <span style="font-size: 11px; font-family: monospace; padding: 2px 8px; border-radius: 3px; font-weight: bold; background: ${v.severity === 'Critical' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 149, 0, 0.2)'}; color: ${v.severity === 'Critical' ? '#ff3b30' : '#ff9500'};">
          ${escapeHtml(v.severity).toUpperCase()} (Risk Score: ${v.risk_score}/10)
        </span>
      </div>
      <p style="color: #a3a3a3; font-size: 12px; margin: 4px 0 10px;">${escapeHtml(v.description)}</p>
      
      <div style="font-size: 11px; margin-top: 8px; color: #737373;">
        <strong style="color: #00ff41;">Confidence:</strong> ${v.confidence_score}% (${escapeHtml(v.final_verdict)}) | 
        <strong style="color: #00ff41;">Affected Area:</strong> <code>${escapeHtml(v.affected_area)}</code> | 
        <strong style="color: #00ff41;">OWASP:</strong> ${escapeHtml(v.owasp_category || 'N/A')}
      </div>

      ${v.evidence_anchor ? `
        <div style="margin-top: 10px; background: #000; border: 1px solid #1f1f1f; padding: 10px; font-family: monospace; font-size: 11px; color: #00ff41; border-radius: 3px; overflow-x: auto;">
          <strong>Evidence Anchor:</strong> ${escapeHtml(v.evidence_anchor)}
        </div>
      ` : ''}

      ${v.remediation ? `
        <div style="margin-top: 10px; padding: 10px; background: rgba(0, 255, 65, 0.05); border: 1px solid rgba(0, 255, 65, 0.2); font-size: 12px; color: #e5e5e5; border-radius: 3px;">
          <strong style="color: #00ff41;">Remediation Directive:</strong> ${escapeHtml(v.remediation)}
        </div>
      ` : ''}
    </div>
  `).join('') || '<p style="color: #737373;">No confirmed vulnerabilities reported.</p>';

  const simStepsHtml = report.attack_simulation?.steps?.map((s, idx) => `
    <li style="margin-bottom: 10px; color: #d4d4d4; font-size: 12px;">
      <strong style="color: #ff3b30;">Phase ${idx + 1} (${escapeHtml(s.phase)}):</strong> ${escapeHtml(s.action)}
      <br/><span style="color: #737373; font-size: 11px;">Expected Result: ${escapeHtml(s.result)}</span>
    </li>
  `).join('') || '<li style="color: #737373;">No attack path generated.</li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AEGIS-AI Strategic Brief - ${escapeHtml(report.target)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #050505; color: #e5e5e5; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 2px solid #00ff41; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .badge { font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #00ff41; text-transform: uppercase; }
    .title { font-size: 24px; font-weight: 800; margin: 6px 0; color: #fff; letter-spacing: -0.5px; }
    .meta { font-size: 12px; color: #737373; font-family: monospace; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px; }
    .card { background: #0d0d0d; border: 1px solid #262626; padding: 16px; border-radius: 4px; text-align: center; }
    .card-label { font-size: 10px; font-family: monospace; color: #737373; text-transform: uppercase; letter-spacing: 1px; }
    .card-val { font-size: 28px; font-weight: bold; margin-top: 6px; font-family: monospace; }
    .section-title { font-size: 14px; font-family: monospace; text-transform: uppercase; color: #00ff41; letter-spacing: 2px; border-bottom: 1px solid #1f1f1f; padding-bottom: 8px; margin: 30px 0 16px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #1f1f1f; text-align: center; font-size: 11px; color: #525252; font-family: monospace; }
    @media print { body { background: #fff; color: #000; padding: 20px; } .card, .header, .section-title { border-color: #ccc; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="badge">AEGIS-AI // Strategic Threat Intelligence</div>
        <div class="title">Security Assessment Brief</div>
        <div class="meta">Target: <strong>${escapeHtml(report.target)}</strong> | Generated: ${generatedAt.toISOString()}</div>
      </div>
      <div style="text-align: right;">
        <div class="badge">Compliance Index</div>
        <div style="font-size: 22px; font-weight: bold; color: #00ff41; font-family: monospace;">${report.summary.owasp_compliance_score || 0}%</div>
      </div>
    </div>

    <div class="summary-grid">
      <div class="card">
        <div class="card-label">Total Findings</div>
        <div class="card-val" style="color: #fff;">${total}</div>
      </div>
      <div class="card">
        <div class="card-label">Critical</div>
        <div class="card-val" style="color: #ff3b30;">${critCount}</div>
      </div>
      <div class="card">
        <div class="card-label">High Severity</div>
        <div class="card-val" style="color: #ff9500;">${highCount}</div>
      </div>
      <div class="card">
        <div class="card-label">Zero-Day Signals</div>
        <div class="card-val" style="color: #ffd60a;">${report.summary.zero_day_indicators_found || 0}</div>
      </div>
    </div>

    <div class="section-title">Verified Vulnerability Matrix</div>
    ${vulnsHtml}

    <div class="section-title">Synthesized Attack Path Simulation</div>
    <div style="background: #0d0d0d; border: 1px solid #262626; padding: 20px; border-radius: 4px;">
      <div style="font-size: 12px; font-family: monospace; color: #00ff41; margin-bottom: 12px; font-weight: bold;">
        Route: ${escapeHtml(report.attack_simulation?.journey_name || 'Standard Compromise Vector')}
        (Success Probability: ${Math.round((report.attack_simulation?.success_probability || 0) * 100)}%)
      </div>
      <ol style="margin: 0; padding-left: 20px;">
        ${simStepsHtml}
      </ol>
    </div>

    <div class="section-title">Strategic Defensive Hardening</div>
    <div style="background: #0d0d0d; border: 1px solid #262626; padding: 16px; border-radius: 4px; font-size: 12px; line-height: 1.6;">
      <p><strong>Overall Risk:</strong> ${escapeHtml(report.final_assessment?.overall_risk || 'N/A')}</p>
      <p><strong>Strategic Direction:</strong> ${escapeHtml(report.final_assessment?.recommendation || 'N/A')}</p>
      <p><strong>Defense Strategy:</strong> ${escapeHtml(report.final_assessment?.defense_strategy || 'N/A')}</p>
    </div>

    <div class="footer">
      CONFIDENTIAL REPORT // GENERATED BY AEGIS-AI OPEN OFFENSIVE INTELLIGENCE HUB<br/>
      AUTHORIZED SECURITY ASSESSMENT ONLY - NOT FOR REDISTRIBUTION
    </div>
  </div>
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
