export interface Vulnerability {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  risk_score: number;
  confidence_score: number; // 80-100%
  final_verdict: 'Confirmed' | 'Probable';
  validation_reasoning: string;
  evidence_anchor: string; // The primary technical proof from raw data
  exploitability: string;
  description: string;
  impact: string;
  affected_area: string;
  evidence: string;
  remediation: string;
  poc: string;
  owasp_category?: string;
  is_zero_day_indicator?: boolean;
}

export interface AttackStep {
  phase: 'Recon' | 'Initial Access' | 'Persistence' | 'PrivEsc' | 'Exfiltration' | 'Impact';
  action: string;
  tool?: string;
  result: string;
}

export interface AttackSimulation {
  journey_name: string;
  steps: AttackStep[];
  success_probability: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'vulnerability' | 'endpoint' | 'infrastructure' | 'asset';
  severity?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface ExploitGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BusinessImpact {
  category: 'Financial' | 'Operational' | 'Reputational' | 'Legal';
  severity: string;
  description: string;
}

export interface OSINTFinding {
  category: 'Asset' | 'Exposure' | 'Cloud Configuration' | 'OSINT Correlation';
  type: string;
  value: string;
  risk_level: 'High' | 'Medium' | 'Low';
  description: string;
  attack_vectors: string[];
  recommendation: string;
  evidence_source: string;
}

export interface OSINTReport {
  target: string;
  intelligence_summary: {
    total_assets: number;
    sensitive_leaks: number;
    cloud_misconfigs: number;
    composite_risk_score: number;
  };
  discovered_assets: {
    subdomains: string[];
    apis: string[];
    external_services: string[];
  };
  sensitive_exposures: {
    emails: string[];
    api_keys: string[];
    credentials: string[];
    repositories: string[];
  };
  findings: OSINTFinding[];
  strategic_correlation: string;
}

export interface ScanReport {
  target: string;
  summary: {
    total_vulnerabilities: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    owasp_compliance_score?: number;
    confidence_avg?: number;
    zero_day_indicators_found: number;
  };
  vulnerabilities: Vulnerability[];
  attack_simulation: AttackSimulation;
  exploit_graph: ExploitGraph;
  zero_day_indicators: {
    pattern: string;
    suspicion_level: number;
    reasoning: string;
  }[];
  final_assessment: {
    overall_risk: string;
    recommendation: string;
    defense_strategy: string;
    defense_layers?: string[];
    business_impact: BusinessImpact[];
  };
}
