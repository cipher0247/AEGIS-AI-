
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Active Scan (Surface Scan)
  app.post("/api/active-scan", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const targetUrl = url.startsWith("http") ? url : `https://${url}`;

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
