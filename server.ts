
import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SCAN_SYSTEM_PROMPT = `You are the AEGIS-AI Neural-Aegis Core, an elite AI Offensive Security Strategist.
Your primary directive is: ABSOLUTE ACCURACY. ZERO TOLERANCE FOR HALLUCINATION.

---
STRICT VALIDATION RULES (MANDATORY):
1. NO EVIDENCE, NO REPORT: You are strictly forbidden from reporting a vulnerability unless you find concrete, unambiguous evidence in the provided raw telemetry.
2. DISCARD NOISE: Immediately discard generic security boilerplate (e.g., "Missing HSTS", "X-Frame-Options not set") as standalone vulnerabilities unless they are critical to a specific, evidence-backed attack chain.
3. REJECT GENERIC ALERTS: Do not report "Possible SQLi" or "Suspected XSS" based on field names alone. You must observe abnormal response behaviors, error leakage, or unique header reflections.
4. EVIDENCE CITATION: Every vulnerability MUST cite the specific string, status code, or header from the raw input that proves its existence.
5. SKEPTICAL REASONING: For each finding, perform an internal "Red Team Audit." If the evidence is purely circumstantial (e.g., just an old server version with no proof of misconfiguration), DISCARD IT.

---
CONFIDENCE SCORING ENGINE:
- 95-100%: CONFORMED (Telemetry contains explicit proof, e.g., reflected payload, stack trace, or unauthorized data leakage).
- 80-94%: HIGHLY PROBABLE (Consistent abnormal behavior across multiple indicators).
- <80%: DISCARD. If you cannot reach 80% confidence backed by raw data, do not report the finding.

---
OUTPUT FORMAT (STRICT JSON):
{
  "target": "<domain>",
  "summary": { 
    "total_vulnerabilities": number, 
    "critical": number, "high": number, "medium": number, "low": number,
    "owasp_compliance_score": number, 
    "confidence_avg": number (Only for reported items),
    "zero_day_indicators_found": number
  },
  "vulnerabilities": [
    {
      "id": "vuln_1",
      "name": "Exploitable Gap Name",
      "severity": "Critical/High/Medium/Low",
      "risk_score": number,
      "confidence_score": number,
      "final_verdict": "Confirmed/Probable",
      "validation_reasoning": "Explicit technical logic explaining why this is confirmed and NOT a false positive.",
      "evidence_anchor": "Exact string or pattern from raw data used as proof.",
      "exploitability": "Detailed assessment of trigger difficulty.",
      "description": "Deep analytical breakdown of the find.",
      "impact": "Concrete damage scenario.",
      "affected_area": "Target endpoint or service.",
      "evidence": "Detailed telemetry excerpt.",
      "remediation": "Hardened fix guide.",
      "poc": "Offensive exploit snippet.",
      "owasp_category": "A#:2021-Category",
      "is_zero_day_indicator": boolean
    }
  ],
  "attack_simulation": {
    "journey_name": "Evidence-Backed Attack Route",
    "steps": [
      { "phase": "Initial Access", "action": "...", "tool": "...", "result": "..." }
    ],
    "success_probability": number
  },
  "exploit_graph": {
    "nodes": [
      { "id": "n1", "label": "Target", "type": "asset" },
      { "id": "v1", "label": "Verified Vulnerability", "type": "vulnerability" }
    ],
    "edges": [
      { "from": "n1", "to": "v1", "label": "Exposes" }
    ]
  },
  "zero_day_indicators": [
    { "pattern": "Abnormal Behavior", "suspicion_level": number, "reasoning": "Deep logic for why this suggests an unknown gap." }
  ],
  "final_assessment": { 
    "overall_risk": "High-level threat assessment.", 
    "recommendation": "Strategic path for defense.",
    "defense_strategy": "Offensive-informed configuration.",
    "business_impact": [
      { "category": "Financial", "severity": "...", "description": "..." }
    ]
  }
}
`;

const OSINT_SYSTEM_PROMPT = `You are an OSINT Intelligence Analyst. Your task is to analyze publicly available data related to a target and identify potential security risks.
Your primary directive is: ABSOLUTE ACCURACY. ZERO HALLUCINATION.

---
INSTRUCTIONS:
1. ANALYZE DISCOVERED ASSETS: Identify Subdomains, APIs, and External services.
2. IDENTIFY SENSITIVE EXPOSURES: Extract Emails, API keys, Credentials, and Public repositories from the provided data.
3. DETECT CLOUD MISCONFIGURATIONS: Flag Open storage (S3/Azure), Exposed configs (.env, .git), and leaked infra keys.
4. CORRELATE FINDINGS: Show exactly how discovered OSINT data can be used in specific attack scenarios (e.g., "Leaked API key allows bypassing auth on /api/v2").
5. ASSIGN RISK LEVELS: Use High / Medium / Low based on impact.
6. ACTIONABLE RECOMMENDATIONS: Provide concrete defense steps for every finding.

---
OUTPUT FORMAT (STRICT JSON):
{
  "target": "<domain>",
  "intelligence_summary": {
    "total_assets": number,
    "sensitive_leaks": number,
    "cloud_misconfigs": number,
    "composite_risk_score": number
  },
  "discovered_assets": {
    "subdomains": ["sub1.target.com"],
    "apis": ["/api/v1"],
    "external_services": ["Cloudflare", "GitHub"]
  },
  "sensitive_exposures": {
    "emails": ["operator@target.com"],
    "api_keys": ["sk_live_..."],
    "credentials": ["admin:password123"],
    "repositories": ["github.com/target/leaked-repo"]
  },
  "findings": [
    {
      "category": "Asset/Exposure/Cloud Configuration/OSINT Correlation",
      "type": "Specific Type (e.g., Leaked Email)",
      "value": "The specific value found",
      "risk_level": "High/Medium/Low",
      "description": "Deep analytical breakdown.",
      "attack_vectors": ["How an attacker uses this."],
      "recommendation": "Concrete fix.",
      "evidence_source": "Source context from input."
    }
  ],
  "strategic_correlation": "Overall assessment of how these OSINT points combine into a threat landscape."
}
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Active Scan (Surface Scan)
  app.post("/api/active-scan", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Valid target URL or domain is required" });
    }

    const trimmed = url.trim();
    const formatted = trimmed.startsWith("http://") || trimmed.startsWith("https://") 
      ? trimmed 
      : `https://${trimmed}`;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(formatted);
    } catch {
      return res.status(400).json({ error: "Invalid target URL format" });
    }

    // SSRF & Protocol Guard
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: "Only HTTP and HTTPS protocols are allowed" });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1', 
      '169.254.169.254', 'metadata.google.internal', 'instance-data'
    ];
    if (blockedHosts.includes(hostname) || hostname.endsWith('.internal') || hostname.endsWith('.local')) {
      return res.status(400).json({ error: "SSRF Protection: Access to local, internal, or metadata hosts is forbidden" });
    }

    const blockedPrefixes = ['10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.', '127.', '169.254.'];
    for (const prefix of blockedPrefixes) {
      if (hostname.startsWith(prefix)) {
        return res.status(400).json({ error: "SSRF Protection: Access to private RFC 1918 subnets is forbidden" });
      }
    }

    const targetUrl = parsedUrl.origin + (parsedUrl.pathname === '/' ? '' : parsedUrl.pathname);

    try {
      console.log(`[Neural Scan] Analyzing surface of: ${targetUrl}`);
      
      const fetchPromise = fetch(targetUrl, { 
        headers: { "User-Agent": "AEGIS-Strategic-Forensics/4.5" },
        signal: AbortSignal.timeout(25000) // 25s for main entry point
      }).catch(e => {
        console.error("Main probe error:", e.message);
        throw new Error(`Primary target unreachable after 25s: ${e.message}`);
      });
      
      const robotsPromise = fetch(new URL("/robots.txt", targetUrl).toString(), {
        signal: AbortSignal.timeout(4000) // 4s for secondary assets
      }).catch(() => null);
      
      // Expanded Sensitive Paths (CMS-specific, API, and System leaks)
      const sensitivePaths = [
        ".env", ".git/config", "wp-config.php", "admin/", ".ssh/id_rsa",
        "api/v1/user", ".vscode/settings.json", "docker-compose.yml",
        "package.json", "composer.json", "node_modules/", "debug/",
        ".aws/credentials", ".env.local", "phpinfo.php", "server-status",
        "backup/", "db_backup.sql", "api-docs/", "swagger-ui.html",
        "graphql", "graphiql", "v1/api", "v2/api", "api/v1", "api/v2",
        ".well-known/security.txt", "openapi.json", "swagger.json"
      ];
      
      const pathProbes = sensitivePaths.map(p => 
        fetch(new URL(p, targetUrl).toString(), { 
          method: "GET",
          headers: { "User-Agent": "AEGIS-Strategic-Forensics/4.5" },
          signal: AbortSignal.timeout(5000) // Increased to 5s
        })
          .then(async r => {
            let bodyPreview = null;
            if (r.ok && r.headers.get("content-type")?.includes("application/json")) {
               try {
                 bodyPreview = (await r.text()).slice(0, 500);
               } catch(e) {}
            }
            return { 
              path: p, 
              status: r.status, 
              type: r.headers.get("content-type"),
              exposure_preview: bodyPreview 
            };
          })
          .catch(() => ({ path: p, status: "timeout" }))
      );

      const [response, robotsResponse, commonPathResults] = await Promise.all([
        fetchPromise as any, 
        robotsPromise as any,
        Promise.all(pathProbes)
      ]);
      
      const headers: Record<string, string> = {};
      response.headers.forEach((v: string, k: string) => { headers[k] = v; });

      const text = await response.text();
      const robotsText = robotsResponse?.ok ? await robotsResponse.text() : "Not found";

      // Pattern-based tech stack and API detection
      const bodyPatterns = {
        wordpress: /wp-content|wp-includes/i.test(text),
        react: /_next|react-dom/i.test(text),
        express: headers["x-powered-by"]?.toLowerCase().includes("express") || false,
        nginx: headers["server"]?.toLowerCase().includes("nginx") || false,
        jquery: /jquery\.min\.js/i.test(text),
        bootstrap: /bootstrap\.min\.css/i.test(text),
        graphql: text.includes("__schema") || text.includes("query {") || text.includes("/graphql") || false,
        rest_api: /api\/v[0-9]\//i.test(text) || text.includes("\"links\":") || false
      };

      // Detect tech stack and OWASP indicators
      const surface_analysis = {
        title: (text.match(/<title>(.*?)<\/title>/i) || [])[1] || "No title",
        tech_fingerprint: bodyPatterns,
        forms_found: text.includes("<form"),
        scripts_found: (text.match(/<script/g) || []).length,
        sensitive_path_probes: commonPathResults.filter(r => (r.status === 200 || r.status === 403 || r.status === 301)),
        security_headers: {
          csp: !!headers["content-security-policy"],
          hsts: !!headers["strict-transport-security"],
          xframe: !!headers["x-frame-options"],
          xss_protection: !!headers["x-xss-protection"],
          content_type_options: !!headers["x-content-type-options"],
          permissions_policy: !!headers["permissions-policy"],
          hsts_value: headers["strict-transport-security"] || "Missing",
          server_header: headers["server"] || "Hidden",
          x_powered_by: headers["x-powered-by"] || "Hidden"
        },
        // DOS/DDOS Indicator: Check for Rate Limiting headers
        dos_mitigation: {
          rate_limit: !!(headers["x-ratelimit-limit"] || headers["retry-after"] || headers["cf-ray"]),
          cf_ray: !!headers["cf-ray"], // Cloudflare indicator
          waf_indicator: !!(headers["x-waf-status"] || headers["cf-mitigated"] || headers["server"]?.toLowerCase().includes("cloudflare"))
        },
        page_entropy: text.length / 1024, // Size in KB
        raw_headers: headers // Pass all headers for behavioral analysis
      };

      const surfaceData = {
        scan_type: "Neural Deep Surface Probe",
        headers,
        robots: robotsText.slice(0, 500),
        surface_metrics: surface_analysis,
        html_preview: text.slice(0, 1500)
      };

      res.json(surfaceData);
    } catch (error: any) {
      console.error("Active scan failed:", error.message);
      res.status(500).json({ error: `Surface probe failed: ${error.message}` });
    }
  });

  // Resilience helpers for Gemini API
  const CANDIDATE_MODELS = [
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  function isTransientError(err: any): boolean {
    const errMsg = (err?.message || String(err)).toLowerCase();
    return (
      errMsg.includes("503") ||
      errMsg.includes("unavailable") ||
      errMsg.includes("high demand") ||
      errMsg.includes("overloaded") ||
      errMsg.includes("temporary") ||
      errMsg.includes("429") ||
      errMsg.includes("resource_exhausted") ||
      errMsg.includes("rate limit")
    );
  }

  function cleanErrorMessage(err: any): string {
    if (!err) return "Neural engine connection fault.";
    const msg = err.message || String(err);
    try {
      const jsonMatch = msg.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.error?.message) {
          return parsed.error.message;
        }
      }
    } catch (_) {}
    return msg;
  }

  function extractJson(text: string): any {
    let cleaned = (text || "{}").trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw err;
    }
  }

  async function generateContentWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`[Gemini Engine] Querying model: ${model} (attempt ${attempt + 1})...`);
          const response = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Engine] Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);
          if (isTransientError(err)) {
            await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
            continue;
          }
          break;
        }
      }
    }

    throw lastError;
  }

  async function generateContentStreamWithFallback(params: {
    contents: any;
    config?: any;
  }) {
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const stream = await ai.models.generateContentStream({
            model,
            contents: params.contents,
            config: params.config,
          });
          return stream;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Stream] Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);
          if (isTransientError(err)) {
            await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
            continue;
          }
          break;
        }
      }
    }

    throw lastError;
  }

  // API: Neural Scan Analysis (Server-Side Gemini)
  app.post("/api/analyze-scan", async (req, res) => {
    const { target, scanData, context } = req.body;
    if (!target) return res.status(400).json({ error: "Target domain/URL required" });

    try {
      const rawText = typeof scanData === 'string' ? scanData : JSON.stringify(scanData || {}, null, 2);
      const prompt = `Target URL: ${target}\n\nRaw Data:\n${rawText}\n\nContext: ${context || 'None'}`;
      
      const response = await generateContentWithFallback({
        contents: [{ role: "user", parts: [{ text: SCAN_SYSTEM_PROMPT }, { text: prompt }] }],
        config: { 
          responseMimeType: "application/json" 
        }
      });

      const parsed = extractJson(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: cleanErrorMessage(error) });
    }
  });

  // API: OSINT Synthesis (Server-Side Gemini)
  app.post("/api/analyze-osint", async (req, res) => {
    const { target, data } = req.body;
    if (!target) return res.status(400).json({ error: "Target required" });

    try {
      const response = await generateContentWithFallback({
        contents: [{ role: "user", parts: [{ text: OSINT_SYSTEM_PROMPT }, { text: `Target: ${target}\n\nData Context:\n${data || ''}` }] }],
        config: { 
          responseMimeType: "application/json" 
        }
      });

      const parsed = extractJson(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("OSINT Analysis Error:", error);
      res.status(500).json({ error: cleanErrorMessage(error) });
    }
  });

  // API: Tactical AI Chat Stream (Server-Side Gemini)
  app.post("/api/chat", async (req, res) => {
    const { message, history, systemInstruction } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
      }));

      const contents = [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ];

      const stream = await generateContentStreamWithFallback({
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
        }
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Chat Stream Error:", error);
      res.status(500).write(`\n[Neural Link Interrupted: ${cleanErrorMessage(error)}]`);
      res.end();
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
