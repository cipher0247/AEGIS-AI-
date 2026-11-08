import { describe, it, expect } from 'vitest';
import { generateReportHtml, escapeHtml } from '../lib/exporter';
import { ScanReport } from '../types';

describe('Report Generation & Sanitization Engine', () => {
  it('correctly escapes dangerous HTML characters to prevent XSS injection', () => {
    const malicious = '<script>alert("XSS")</script>&"\'';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#039;');
  });

  it('renders genuine vulnerability metrics, confidence scores and evidence in HTML', () => {
    const mockReport: ScanReport = {
      target: 'api.example.com',
      summary: {
        total_vulnerabilities: 2,
        critical: 1,
        high: 1,
        medium: 0,
        low: 0,
        owasp_compliance_score: 78,
        confidence_avg: 94,
        zero_day_indicators_found: 0,
      },
      vulnerabilities: [
        {
          id: 'vuln_1',
          name: 'SQL Injection in Auth Route',
          severity: 'Critical',
          risk_score: 9.8,
          confidence_score: 96,
          final_verdict: 'Confirmed',
          validation_reasoning: 'Reflected syntax error on quote injection',
          evidence_anchor: 'syntax error at or near "\'"',
          exploitability: 'High',
          description: 'Parameter tampering causes database query syntax leakage.',
          impact: 'Potential full database compromise.',
          affected_area: '/auth/login',
          evidence: 'POST /auth/login HTTP/1.1 -> 500 Internal Error',
          remediation: 'Use parameterized queries with ORM.',
          poc: "' OR 1=1 --",
          owasp_category: 'A03:2021-Injection',
        },
      ],
      attack_simulation: {
        journey_name: 'Direct Gateway Infiltration',
        steps: [
          {
            phase: 'Initial Access',
            action: 'Execute SQLi payload on /auth/login',
            tool: 'Custom Probe',
            result: 'Extract administrative session token',
          },
        ],
        success_probability: 0.88,
      },
      exploit_graph: { nodes: [], edges: [] },
      zero_day_indicators: [],
      final_assessment: {
        overall_risk: 'Critical Threat',
        recommendation: 'Immediate patch of auth service.',
        defense_strategy: 'Deploy WAF rate limiting and parameter sanitation.',
        business_impact: [],
      },
    };

    const html = generateReportHtml(mockReport, new Date('2026-01-01T00:00:00Z'));
    expect(html).toContain('api.example.com');
    expect(html).toContain('SQL Injection in Auth Route');
    expect(html).toContain('syntax error at or near &quot;&#039;&quot;');
    expect(html).toContain('78%');
    expect(html).toContain('96%');
    expect(html).toContain('A03:2021-Injection');
  });
});
