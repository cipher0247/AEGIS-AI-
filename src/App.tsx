/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Search, 
  Activity, 
  Code, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Info,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Lock,
  Zap,
  Download,
  FileJson,
  FileText,
  Bomb,
  Network,
  Skull,
  Crosshair,
  TrendingUp,
  AlertOctagon,
  Eye,
  Radar,
  Globe,
  Mail,
  Key,
  Cloud,
  Wifi,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { analyzeScan, neuralScan, analyzeOSINT } from './services/gemini';
import { ScanReport, Vulnerability, OSINTReport } from './types';
import { ExploitGraph, GraphErrorBoundary } from './components/ExploitGraph';
import { AIChatPanel } from './components/AIChatPanel';
import { LandingPage } from './components/LandingPage';
import { CyberAuth } from './components/CyberAuth';
import { SecurityHUD } from './components/SecurityHUD';
import { loginWithGoogle, logout, auth, saveReport, getReports, StoredReport, SecurityOperation, handleSecurityError } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { History, LogIn, LogOut, Clock, Trash2, FolderArchive, Loader2 } from 'lucide-react';

// Silence Vite HMR errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress common dev-server artifacts that don't affect runtime
    if (
      event.reason?.toString().includes('WebSocket') || 
      event.reason?.message?.includes('WebSocket') ||
      event.reason?.toString().includes('node not found') // Extra safety for D3 rejections
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

const SummaryCard: React.FC<{ label: string, value: string | number, color: string, borderClass?: string }> = ({ label, value, color, borderClass }) => (
  <div className={`bg-cyber-gray border border-cyber-border p-3 rounded shadow-sm text-center ${borderClass}`}>
    <div className="text-[10px] uppercase text-cyber-text-secondary mb-1 font-medium tracking-wider">{label}</div>
    <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
  </div>
);

const AttackSimulationStep: React.FC<{ step: any, index: number }> = ({ step, index }) => (
  <div className="relative pl-8 pb-4 border-l border-white/10 last:pb-0">
    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-cyber-critical rounded-full border-2 border-cyber-black" />
    <div className="text-[9px] font-mono text-cyber-critical uppercase tracking-widest mb-0.5">Phase {index + 1}: {step.phase}</div>
    <div className="text-[11px] font-bold text-white mb-1 uppercase tracking-tight">{step.action}</div>
    <div className="flex gap-2 mb-1.5 flex-wrap">
      {step.tool && <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-cyber-text-secondary font-mono">TOOL: {step.tool}</span>}
      <span className="text-[8px] bg-cyber-success/10 border border-cyber-success/20 px-1 py-0.5 rounded text-cyber-success font-mono">STATUS: SUCCESS</span>
    </div>
    <p className="text-[10px] text-gray-500 italic leading-tight">Result: {step.result}</p>
  </div>
);

export default function App() {
  const [target, setTarget] = useState('');
  const [scanData, setScanData] = useState('');
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVulnIndex, setSelectedVulnIndex] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'vulns' | 'simulation' | 'graph' | 'zero-day' | 'osint'>('vulns');
  const [osintReport, setOsintReport] = useState<OSINTReport | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<StoredReport[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [showSecurityHUD, setShowSecurityHUD] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userConfig, setUserConfig] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        fetchHistory(u.uid);
        // Load operational profile
        try {
          const { db } = await import('./lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) setUserConfig(snap.data());
        } catch (e) {
          console.warn("Profile Sync Failed");
        }
      } else {
        setHistory([]);
        setUserConfig(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid: string) => {
    setIsHistoryLoading(true);
    try {
      const reports = await getReports(uid);
      setHistory(reports);
    } catch (err) {
      console.error("Fetch History Error:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setReport(null);
    setTarget('');
    setScanData('');
  };

  const loadHistoryReport = (stored: StoredReport) => {
    setReport(stored.fullReport);
    setTarget(stored.target);
    setActiveTab('vulns');
    setSelectedVulnIndex(0);
    setView('dashboard');
  };

  const downloadHistoryReport = (stored: StoredReport) => {
    const dataStr = JSON.stringify(stored.fullReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AEGIS_ARCHIVE_${stored.target.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_${stored.createdAt?.toDate().toISOString().split('T')[0] || Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOSINT = async () => {
    if (!target || !scanData) {
      setError('Target Domain & Intelligence Data Required');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setOsintReport(null);
    try {
      setScanStatus('Initializing OSINT Discovery Loop...');
      const result = await analyzeOSINT(target, scanData);
      setOsintReport(result);
      setActiveTab('osint');
    } catch (err: any) {
      setError(err.message || 'Intelligence Core Failure.');
    } finally {
      setIsAnalyzing(false);
      setScanStatus('');
    }
  };

  const handleExport = (format: 'json' | 'html' | 'pdf' = 'json') => {
    const dataToExport = activeTab === 'osint' ? osintReport : report;
    if (!dataToExport) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AEGIS_INTEL_${target.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'html' || format === 'pdf') {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>AEGIS INTEL - ${target}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
            body { 
              background: #050505; 
              color: #00ff41; 
              font-family: 'JetBrains Mono', monospace; 
              padding: 60px; 
              margin: 0;
              line-height: 1.6;
            }
            .report-container { max-width: 900px; margin: 0 auto; }
            header { 
              border-bottom: 2px solid #00ff41; 
              padding-bottom: 30px; 
              margin-bottom: 50px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: 8px; }
            .meta { font-size: 10px; opacity: 0.5; text-align: right; letter-spacing: 2px; }
            h2 { color: white; border-left: 4px solid #00ff41; padding-left: 15px; text-transform: uppercase; letter-spacing: 3px; font-size: 18px; margin-top: 40px; }
            .vulnerability-card { 
              background: rgba(0,255,65,0.03); 
              border: 1px solid rgba(0,255,65,0.1); 
              padding: 25px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .severity { 
              display: inline-block; 
              padding: 4px 12px; 
              border-radius: 4px; 
              font-size: 10px; 
              font-weight: 800; 
              margin-bottom: 10px; 
              color: black;
            }
            .CRITICAL { background: #ff003c; }
            .HIGH { background: #ff7b00; }
            .MEDIUM { background: #00bcff; }
            .LOW { background: #888; }
            .v-title { font-size: 16px; font-weight: 700; color: white; display: block; margin-bottom: 10px; }
            .v-desc { font-size: 12px; opacity: 0.8; margin-bottom: 15px; }
            .evidence { background: rgba(0,0,0,0.5); padding: 15px; font-size: 11px; border: 1px dashed rgba(0,255,65,0.2); }
            footer { margin-top: 80px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 8px; opacity: 0.3; text-align: center; letter-spacing: 5px; }
            @media print {
              body { background: white; color: black; padding: 40px; }
              header, h2 { border-color: black; color: black; }
              .vulnerability-card { border-color: #ddd; background: #f9f9f9; }
              .v-title, .v-desc { color: black; }
              footer { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <header>
              <div class="logo">AEGIS_CORE_ANALYSIS</div>
              <div class="meta">
                TARGET: ${target}<br>
                REF_ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                DATE: ${new Date().toLocaleString()}
              </div>
            </header>

            <h2>[ INTELLIGENCE_SUMMARY ]</h2>
            <div class="vulnerability-card" style="border: none; background: none; padding: 0;">
              <p>Automated penetration test synthesis complete. The following security vulnerabilities were active during the probe of the target domain: <strong>${target}</strong>.</p>
            </div>

            <h2>[ VULNERABILITY_INDEX ]</h2>
            ${((dataToExport as any).vulnerabilities || (dataToExport as any).findings || (dataToExport as any).reconSummary || []).map((v: any, i: number) => `
              <div class="vulnerability-card">
                <div class="severity ${v.severity || v.risk_level || 'MEDIUM'}">${v.severity || v.risk_level || 'INFO'}</div>
                <div class="v-title">${v.title || v.finding || v.type || 'Observation ' + (i+1)}</div>
                <div class="v-desc">${v.description || v.impact || 'System observation recorded during automated reconnaissance.'}</div>
                ${v.evidence || v.evidence_source ? `<div class="v-title" style="font-size: 10px; opacity: 0.5;">Evidence_Anchor</div><div class="evidence">${v.evidence || v.evidence_source}</div>` : ''}
              </div>
            `).join('')}

            <footer>CLASSIFIED DOCUMENT // AEGIS-AI TACTICAL ENGINE V4.5</footer>
          </div>
        </body>
        </html>
      `;

      if (format === 'html') {
        const dataBlob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AEGIS_REPORT_${target.replace(/[^a-z0-9]/gi, '_').toUpperCase()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // PDF Simulation using printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      }
    }
  };

  const handleAnalyze = async () => {
    if (!target) {
      setError('Target Domain Required');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setReport(null);
    try {
      let finalScanData = scanData;
      if (!scanData) {
        setScanStatus('Initializing Recon... Starting Neural Probe');
        const probedData = await neuralScan(target);
        setScanStatus('Recon Complete. Analyzing Behavior & Headers');
        finalScanData = JSON.stringify(probedData, null, 2);
        setScanData(finalScanData);
      }
      setScanStatus('Synthesizing Attack Simulation Strategy...');
      const result = await analyzeScan(target, finalScanData, context);
      
      setReport(result);
      setSelectedVulnIndex(0);
      setActiveTab('vulns');

      // Persistence Layer
      if (user) {
        await saveReport(user.uid, target, result);
        fetchHistory(user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Strategy Engine Failure.');
    } finally {
      setIsAnalyzing(false);
      setScanStatus('');
    }
  };

  const loadSampleData = () => {
    setTarget('api.enterprise-nexus.io');
    setScanData(`[+] Probing surface: api.enterprise-nexus.io
[+] Server: nginx/1.18.0
[+] X-Powered-By: Express
[+] API Fingerprint: REST v2.0 detected
[+] Hidden Endpoints Found via Fuzzing:
    - /api/v2/debug/stats [200 OK]
    - /admin/setup.php [403 Forbidden]
[+] Vulnerability Scan:
    - SQL Injection in /auth/provider [Parameter: redirect_uri]
    - Broken Auth on /api/v2/user/settings
    - Missing CSP headers
    - Exposed cookie data in localStorage`);
    setContext('Primary production gateway in SOC Tier 2 environment.');
    
    // Populate dummy OSINT data so tab works
    setOsintReport({
      target: 'api.enterprise-nexus.io',
      intelligence_summary: {
        total_assets: 12,
        sensitive_leaks: 3,
        cloud_misconfigs: 1,
        composite_risk_score: 68
      },
      discovered_assets: {
        subdomains: ['dev-api.enterprise-nexus.io', 'staging.enterprise-nexus.io', 'vpn.enterprise-nexus.io'],
        apis: ['/api/v1', '/api/v2', '/internal-metrics'],
        external_services: ['AWS S3', 'Auth0', 'Mailgun']
      },
      sensitive_exposures: {
        emails: ['admin@enterprise-nexus.io', 'dev-lead@enterprise-nexus.io'],
        api_keys: ['sk_test_51Mz...', 'AIzaSyA...'],
        credentials: ['root:admin123 (Staging)'],
        repositories: ['github.com/ent-nx/api-core-v2']
      },
      findings: [
        {
          category: 'Exposure',
          type: 'Leaked Test Key',
          value: 'sk_test_51Mz...',
          risk_level: 'High',
          description: 'A Stripe test key was discovered in a publicly indexed staging environment log.',
          attack_vectors: ['Financial data exfiltration via test API', 'Account takeover if production key reused'],
          recommendation: 'Rotate all keys and strictly isolate logging endpoints.',
          evidence_source: 'Google Dork: "site:staging.enterprise-nexus.io intext:sk_test"'
        }
      ],
      strategic_correlation: 'The target infrastructure shows significant leakage in staging environments, effectively mapping a blueprint for bypassing production controls via dev-tunneling.'
    });
  };

  const currentVuln = report?.vulnerabilities?.length ? report.vulnerabilities[selectedVulnIndex] : null;

  if (view === 'landing') {
    return (
      <LandingPage 
        onStart={() => setView('dashboard')} 
        onLogin={handleLogin}
        user={user}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-cyber-black text-cyber-text-secondary flex flex-col p-4 gap-4 font-sans select-none relative overflow-hidden">
      <AnimatePresence>
        {showSecurityHUD && user && (
          <SecurityHUD 
            user={user} 
            userConfig={userConfig} 
            onClose={() => setShowSecurityHUD(false)} 
            onExport={handleExport}
            hasData={!!(report || osintReport)}
          />
        )}
        {showAuthModal && (
          <CyberAuth 
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              setView('dashboard');
            }}
          />
        )}
      </AnimatePresence>

      {/* Background Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Header HUD */}
      <header className="z-10 flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-cyber-critical p-2.5 rounded shadow-[0_0_15px_rgba(255,49,49,0.3)] animate-flicker">
            <Skull className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm font-black tracking-[6px] text-white uppercase font-display italic leading-none">AEGIS-AI // NEURAL-AEGIS CORE</div>
            <div className="text-[10px] font-mono text-cyber-accent flex items-center gap-2 mt-1.5 glow-text-accent">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" /> OFFENSIVE STRATEGIST V4.5 // SYSTEM: ACTIVE_PROBE
            </div>
          </div>
        </div>
        
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] uppercase hover:bg-white/10 hover:text-cyber-accent transition-all text-white/40"
          >
            <RotateCcw className="w-3 h-3" /> Return_to_HQ
          </button>

          {user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <img src={user.photoURL || ''} className="w-5 h-5 rounded-full border border-cyber-accent cursor-pointer" 
                   onClick={() => setShowSecurityHUD(!showSecurityHUD)}
                   referrerPolicy="no-referrer" />
              <div className="text-[10px] font-mono font-bold text-white max-w-[100px] truncate">{user.displayName}</div>
              <div className="flex gap-1.5 items-center ml-1 border-l border-white/10 pl-2">
                <button 
                  onClick={() => setShowSecurityHUD(!showSecurityHUD)}
                  className={`transition-colors ${showSecurityHUD ? 'text-cyber-accent' : 'text-white/20 hover:text-white'}`}
                  title="Security Status"
                >
                  <ShieldCheck className="w-3 h-3" />
                </button>
                <button 
                  onClick={handleLogout} 
                  title="Terminate Session"
                  className="text-white/30 hover:text-cyber-critical transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-cyber-accent/10 border border-cyber-accent/30 px-4 py-1.5 rounded text-[10px] font-bold text-cyber-accent hover:bg-cyber-accent/20 transition-all uppercase tracking-widest"
            >
              <LogIn className="w-3.5 h-3.5" /> Initialize Operator
            </button>
          )}
          <div className="h-8 w-[1px] bg-white/5" />
          <div className="flex flex-col items-end">
            <div className="text-[8px] font-mono opacity-40 uppercase">Global Posture</div>
            <div className={`text-xs font-bold font-mono ${report ? (report.summary.critical > 0 ? 'text-cyber-critical' : 'text-cyber-high') : 'text-cyber-low'}`}>
              {report ? (report.summary.critical > 0 ? 'CRITICAL COMPROMISE' : 'VULNERABLE') : 'POSTURE: UNDETERMINED'}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/5" />
          <div className="flex gap-2">
            { (report || osintReport) && (
              <button 
                onClick={() => handleExport('json')}
                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/60 hover:bg-white/10 hover:text-cyber-accent transition-all uppercase tracking-widest flex items-center gap-2"
                title="Quick Export (JSON)"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            )}
            <button onClick={loadSampleData} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono hover:bg-white/10 transition-all uppercase tracking-widest">Template</button>
            <button 
              onClick={handleOSINT}
              disabled={isAnalyzing}
              className="px-4 py-1.5 bg-cyber-accent/10 border border-cyber-accent/30 rounded text-[10px] font-mono text-cyber-accent hover:bg-cyber-accent/20 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Globe className="w-3 h-3" /> Intel Discovery
            </button>
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing} 
              className={`px-6 py-1.5 rounded text-[11px] font-bold transition-all uppercase flex items-center gap-2 shadow-lg ${
                isAnalyzing ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/50' : 'bg-white text-black hover:bg-cyber-accent hover:text-black'
              }`}
            >
              {isAnalyzing ? <div className="w-3 h-3 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin" /> : <Radar className="w-3.5 h-3.5" />}
              {isAnalyzing ? 'Processing...' : 'Engage Analysis'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-[300px] z-10 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar shrink-0">
          <section className="bezel overflow-hidden">
            <div className="bg-black/60 p-2.5 border-b border-cyber-border text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-cyber-critical" /> Recon Hub
              </div>
              <div className="text-[8px] font-mono text-white/20">01</div>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/30 mb-2 block tracking-tight">Scope Target</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/20" />
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="https://target-node.net"
                    className="w-full bg-black/80 border border-cyber-border rounded-md p-2.5 pl-8 text-xs font-mono text-cyber-accent focus:border-cyber-accent/50 focus:glow-text-accent outline-none placeholder:text-white/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/30 mb-2 block tracking-tight">Telemetry Input</label>
                <textarea 
                  value={scanData}
                  onChange={(e) => setScanData(e.target.value)}
                  className="w-full h-48 bg-black/80 border border-cyber-border rounded-md p-3 text-[10px] font-mono text-cyber-text-secondary focus:border-cyber-accent/30 outline-none resize-none custom-scrollbar transition-all leading-relaxed"
                  placeholder="Paste raw forensic data here..."
                />
              </div>
            </div>
          </section>

          {user && (
            <section className="bezel overflow-hidden flex flex-col max-h-[300px]">
              <div className="bg-black/60 p-2.5 border-b border-cyber-border text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyber-accent">
                  <FolderArchive className="w-3.5 h-3.5" /> Tactical Archives
                </div>
                <div className="text-[8px] font-mono text-white/20">02</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {isHistoryLoading ? (
                  <div className="text-[9px] font-mono text-white/20 p-4 text-center animate-pulse">Synchronizing Archives...</div>
                ) : history.length === 0 ? (
                  <div className="text-[9px] font-mono text-white/20 p-4 text-center">No Historical Records Found</div>
                ) : (
                  history.map((h) => (
                    <div 
                      key={h.id}
                      className="w-full flex items-center gap-1 group/item"
                    >
                      <button 
                        onClick={() => loadHistoryReport(h)}
                        className="flex-1 text-left p-2 rounded border border-white/5 bg-white/[0.02] hover:bg-cyber-accent/5 hover:border-cyber-accent/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-white group-hover:text-cyber-accent transition-colors truncate max-w-[120px]">{h.target}</span>
                          <span className="text-[8px] font-mono text-white/20">{h.createdAt?.toDate().toLocaleDateString() || '...' }</span>
                        </div>
                        <div className="flex gap-2 text-[8px] font-mono uppercase">
                          <span className="text-cyber-critical">CIT: {h.summary.critical}</span>
                          <span className="text-cyber-high">HIG: {h.summary.high}</span>
                        </div>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadHistoryReport(h);
                        }}
                        className="p-2 text-white/10 hover:text-cyber-accent transition-all bg-white/[0.02] border border-white/5 rounded hover:bg-cyber-accent/10 hover:border-cyber-accent/30 opacity-0 group-hover/item:opacity-100"
                        title="Download Archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {report && (
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bezel p-3 text-center">
                  <div className="text-[9px] uppercase text-white/30 font-bold mb-1.5 tracking-tighter">OWASP Compliance</div>
                  <div className="text-xl font-bold font-display text-cyber-accent glow-text-accent">{report.summary.owasp_compliance_score}%</div>
                </div>
                <div className="bezel p-3 text-center">
                  <div className="text-[9px] uppercase text-white/30 font-bold mb-1.5 tracking-tighter">Risk Index</div>
                  <div className="text-xl font-bold font-display text-cyber-critical glow-text-critical">{(report.summary.critical * 2.5 + report.summary.high * 1.5).toFixed(1)}</div>
                </div>
              </div>
              <div className="bezel overflow-hidden">
                <div className="bg-black/40 p-2 border-b border-cyber-border text-[9px] font-bold uppercase tracking-widest flex items-center justify-between">
                  <span>Operational Risks</span>
                  <TrendingUp className="w-3 h-3 text-cyber-accent" />
                </div>
                <div className="p-4 space-y-4">
                  {report.final_assessment.business_impact.map((impact, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse ${impact.severity === 'High' ? 'bg-cyber-critical' : 'bg-cyber-high'}`} />
                      <div>
                        <div className="text-[10px] font-bold text-white uppercase tracking-tight">{impact.category}</div>
                        <div className="text-[9px] text-white/40 leading-relaxed mt-1 font-mono italic">{impact.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="p-3 bg-cyber-critical/10 border border-cyber-critical/30 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyber-critical text-[10px] font-mono uppercase font-bold">
                <AlertTriangle className="w-3 h-3" /> System Fault Detected
              </div>
              <div className="text-[9px] text-cyber-critical/80 font-mono leading-tight">{error}</div>
              <button 
                onClick={handleAnalyze}
                className="mt-1 w-full bg-cyber-critical/20 hover:bg-cyber-critical/40 text-cyber-critical text-[8px] font-bold py-1 rounded uppercase transition-all"
              >
                Re-initialize Neural Hub
              </button>
            </div>
          )}
        </aside>

        {/* Main Display HUD */}
        <main className="flex-1 flex flex-col gap-4 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!report && !osintReport && !isAnalyzing ? (
              <motion.div key="idle" className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded">
                <Radar className="w-16 h-16 text-white/5 mb-4" />
                <div className="text-[10px] uppercase font-mono tracking-[8px] text-white/20">Waiting for Data Ingestion</div>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div key="loading" className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded">
                <div className="relative w-20 h-20 mb-8">
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-t-2 border-r-2 border-cyber-critical rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-4 border-b-2 border-l-2 border-cyber-high rounded-full opacity-50"
                  />
                </div>
                <div className="text-xs font-mono text-cyber-critical uppercase tracking-[4px] animate-pulse mb-2">{scanStatus}</div>
                <div className="text-[9px] font-mono text-white/30 uppercase">Correlating Neural Vectors...</div>
              </motion.div>
            ) : (
              <motion.div key="report" className="flex-1 flex flex-col overflow-hidden gap-4">
                {/* Secondary HUD Nav */}
                <nav className="flex gap-2 border-b border-white/5 pb-px">
                  {[
                    { id: 'vulns', label: 'Vulnerability Matrix', icon: Shield },
                    { id: 'simulation', label: 'Attack Simulation', icon: Skull },
                    { id: 'graph', label: 'Network topology', icon: Network },
                    { id: 'osint', label: 'Intelligence', icon: Globe },
                    { id: 'zero-day', label: 'Heuristic Sensors', icon: Bomb }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      disabled={tab.id === 'osint' ? !osintReport : !report}
                      className={`flex items-center gap-2.5 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[2px] transition-all relative disabled:opacity-20 ${
                        activeTab === tab.id ? 'text-cyber-accent' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'glow-text-accent' : ''}`} /> 
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-accent glow-text-accent" />
                      )}
                    </button>
                  ))}
                </nav>

                <div className="flex-1 overflow-hidden">
                  {activeTab === 'vulns' && (
                    <div className="h-full grid grid-cols-[340px_1fr] gap-4">
                      <div className="bezel flex flex-col overflow-hidden">
                        <div className="p-3 bg-black/60 border-b border-cyber-border text-[10px] font-bold uppercase tracking-widest text-white/40 flex justify-between items-center">
                          <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Incident Stream</span>
                          <span className="text-[9px] font-mono opacity-50 bg-white/5 px-1.5 rounded">{report?.vulnerabilities?.length || 0} findings</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {report?.vulnerabilities?.map((v, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={i}
                              onClick={() => setSelectedVulnIndex(i)}
                              className={`p-4 border-b border-white/5 cursor-pointer transition-all border-l-4 ${
                                selectedVulnIndex === i 
                                  ? 'bg-cyber-accent/5 border-l-cyber-accent' 
                                  : 'border-l-transparent hover:bg-white/[0.02] hover:border-l-white/10'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded tracking-tighter ${
                                  v.severity === 'Critical' ? 'bg-cyber-critical text-white' : 'bg-cyber-high text-black'
                                }`}>{v.severity}</span>
                                <span className="text-[10px] font-mono text-white/20 tracking-tighter">HEX_{i.toString(16).padStart(4, '0')}</span>
                              </div>
                              <div className={`text-[13px] font-bold mb-1 tracking-tight ${selectedVulnIndex === i ? 'text-cyber-accent' : 'text-white/80'}`}>{v.name}</div>
                              <div className="text-[10px] font-mono text-white/30 truncate uppercase italic tracking-tight">{v.affected_area}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="bezel p-8 flex flex-col gap-10 overflow-y-auto custom-scrollbar relative">
                        <div className="absolute top-0 right-0 p-4 font-mono text-[60px] opacity-[0.03] select-none font-black italic pointer-events-none uppercase">
                          {currentVuln?.severity}
                        </div>
                        {currentVuln && (
                          <>
                            <motion.header 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-between items-end border-b-2 border-white/5 pb-6"
                            >
                              <div>
                                <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter font-display italic glow-text-accent">
                                  {currentVuln.name}
                                  <span className="text-cyber-accent ml-2 text-sm not-italic opacity-40">_v4.5</span>
                                </h1>
                                <div className="flex gap-5 items-center">
                                  <div className="text-[10px] font-mono font-bold text-cyber-critical px-2.5 py-1 bg-cyber-critical/10 border border-cyber-critical/30 rounded uppercase">ID: {currentVuln.owasp_category}</div>
                                  <div className={`text-[10px] font-mono font-bold px-2.5 py-1 border rounded uppercase tracking-widest ${
                                    currentVuln.final_verdict === 'Confirmed' ? 'bg-cyber-success/10 border-cyber-success/30 text-cyber-success glow-text-accent' : 
                                    'bg-cyber-high/10 border-cyber-high/30 text-cyber-high'
                                  }`}>Verdict: {currentVuln.final_verdict}</div>
                                  <div className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-widest">Precision_Auth: {currentVuln.confidence_score}%</div>
                                </div>
                              </div>
                              <div className="bg-white/5 p-4 rounded-full border border-white/10">
                                <Shield className="w-10 h-10 text-white/20" />
                              </div>
                            </motion.header>

                            <div className="grid grid-cols-[1fr_300px] gap-8">
                              <div className="space-y-8">
                                <div className="bg-cyber-critical/5 p-4 border border-cyber-critical/20 rounded relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-2 font-mono text-[40px] opacity-[0.05] pointer-events-none uppercase italic font-black">Anchor</div>
                                  <div className="text-[10px] uppercase font-bold text-cyber-critical mb-2 flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5" /> Primary Evidence Anchor
                                  </div>
                                  <div className="text-[11px] font-mono bg-black/40 p-2.5 rounded border border-white/5 text-white/80 break-all leading-relaxed">
                                    {currentVuln.evidence_anchor}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-white/40 mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Deep Forensic Extraction
                                  </div>
                                  <p className="text-sm text-gray-300 leading-relaxed font-mono opacity-80">{currentVuln.description}</p>
                                </div>
                                <div className="bg-cyber-accent/5 p-5 rounded border border-cyber-accent/20 border-tactical">
                                  <div className="text-[10px] uppercase font-bold text-cyber-accent mb-3 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 glow-text-accent" /> Neural Validation Logic
                                  </div>
                                  <p className="text-[11px] text-cyber-accent/70 font-mono leading-relaxed italic">{" >> "}{currentVuln.validation_reasoning}</p>
                                </div>
                              </div>
                              <div className="space-y-8">
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-cyber-critical mb-4 border-b border-cyber-critical/20 pb-2">Operational Threat Impact</div>
                                  <p className="text-[12px] text-cyber-critical/80 leading-relaxed italic bg-cyber-critical/5 p-4 rounded border border-cyber-critical/10">"{currentVuln.impact}"</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded border border-white/5">
                                  <div className="text-[10px] uppercase font-bold text-cyber-high mb-3 border-b border-cyber-high/30 pb-2">Exfiltration Difficulty</div>
                                  <p className="text-[11px] text-cyber-high/80 leading-relaxed font-mono uppercase tracking-tighter">Complexity: {currentVuln.exploitability}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                              <section>
                                <div className="text-[10px] uppercase font-bold text-cyber-success mb-4 border-b border-cyber-success/20 pb-2 flex items-center justify-between">
                                  <span className="flex items-center gap-2"><Code className="w-3.5 h-3.5" /> Payload proof_of_concept</span>
                                  <span className="text-[9px] font-mono opacity-40">AEGIS_EXPLOIT_SYST_V4</span>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-cyber-success/5 animate-pulse group-hover:opacity-100 opacity-0 transition-all pointer-events-none" />
                                  <pre className="bg-cyber-dark p-5 border border-white/10 rounded text-cyber-success font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-2xl">
                                    {currentVuln.poc}
                                  </pre>
                                </div>
                              </section>
                              <section>
                                <div className="text-[10px] uppercase font-bold text-white/40 mb-4 border-b border-white/5 pb-2">Strategic Mitigation Path</div>
                                <div className="bg-white/5 p-6 rounded border-l-4 border-white/20 italic text-[13px] text-gray-300 leading-relaxed">
                                  {currentVuln.remediation}
                                </div>
                              </section>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'simulation' && (
                    <div className="h-full bezel flex flex-col overflow-hidden bg-cyber-dark">
                      <div className="p-4 bg-black/60 border-b border-cyber-border flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Skull className="w-5 h-5 text-cyber-critical animate-flicker" />
                          <h2 className="text-sm font-black uppercase tracking-[3px] text-white font-display italic font-bold">{report.attack_simulation.journey_name}</h2>
                        </div>
                        <div className="bg-cyber-critical/10 border border-cyber-critical/30 px-3 py-1 rounded text-[10px] font-mono text-cyber-critical glow-text-critical uppercase font-bold tracking-widest">
                          Probability_Of_Breach: {(report.attack_simulation.success_probability * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1 p-10 grid grid-cols-[1fr_400px] gap-16 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                          <div className="text-[11px] uppercase font-bold text-white/40 mb-10 flex items-center gap-3 tracking-[3px]">
                            <Activity className="w-4 h-4 text-cyber-accent" /> Neural Execution Chain
                          </div>
                          <div className="space-y-0.5">
                            {report.attack_simulation.steps.map((step, i) => (
                              <AttackSimulationStep key={i} step={step} index={i} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-10">
                          <div className="bg-black/60 p-8 rounded border-t-2 border-l-2 border-cyber-critical/30 border-tactical relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                              <Shield className="w-32 h-32" />
                            </div>
                            <div className="text-[11px] uppercase font-bold text-cyber-critical mb-6 flex items-center gap-3 tracking-[2px]">
                              <AlertOctagon className="w-4.5 h-4.5" /> High-Intensity Countermeasures
                            </div>
                            <p className="text-[13px] text-gray-300 leading-loose mb-8 font-mono italic opacity-90">{" >> "}{report.final_assessment.defense_strategy}</p>
                            <div className="grid grid-cols-1 gap-3">
                              {report.final_assessment.defense_layers?.map((layer, i) => (
                                <div key={i} className="flex items-center gap-4 text-[10px] font-mono text-cyber-accent bg-cyber-accent/5 p-3 rounded border border-cyber-accent/20 hover:bg-cyber-accent/10 transition-all uppercase font-bold">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" /> {layer}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'graph' && (
                    <div className="h-full bg-cyber-gray border border-cyber-border rounded flex flex-col overflow-hidden">
                      <div className="p-4 bg-black/40 border-b border-cyber-border flex items-center gap-3">
                        <Network className="w-5 h-5 text-cyber-high" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Exploitation Path Mapping</h2>
                      </div>
                      <div className="flex-1 p-4">
                        <GraphErrorBoundary>
                          <ExploitGraph graph={report.exploit_graph} />
                        </GraphErrorBoundary>
                      </div>
                    </div>
                  )}

                  {activeTab === 'osint' && osintReport && (
                    <div className="h-full bezel flex flex-col overflow-hidden p-8 gap-10 overflow-y-auto custom-scrollbar bg-cyber-dark">
                      <header className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                        <div className="flex items-center gap-6">
                          <div className="bg-cyber-accent p-4 rounded shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                            <Globe className="w-8 h-8 text-black" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-display italic">OSINT Intelligence Core</h2>
                            <p className="text-[11px] text-white/40 uppercase font-mono tracking-[4px] mt-2">Discovered Assets & Sensitive Exposures Analysis</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] uppercase text-white/30 font-bold mb-2 tracking-widest">Composite Risk Score</div>
                          <div className={`text-4xl font-bold font-display glow-text-accent ${
                            osintReport.intelligence_summary.composite_risk_score > 70 ? 'text-cyber-critical shadow-[0_0_20px_rgba(255,49,49,0.3)]' :
                            osintReport.intelligence_summary.composite_risk_score > 40 ? 'text-cyber-high shadow-[0_0_20px_rgba(255,138,0,0.3)]' :
                            'text-cyber-accent shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                          }`}>{osintReport.intelligence_summary.composite_risk_score}</div>
                        </div>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-black/40 p-5 rounded border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-cyber-accent mb-4 flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5" /> Discovered Assets
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[9px] text-white/30 uppercase mb-2">Subdomains</div>
                              <div className="flex flex-wrap gap-1.5">
                                {osintReport.discovered_assets.subdomains.map((s, i) => <span key={i} className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/60">{s}</span>)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] text-white/30 uppercase mb-2">APIs Found</div>
                              <div className="flex flex-wrap gap-1.5">
                                {osintReport.discovered_assets.apis.map((a, i) => <span key={i} className="text-[8px] font-mono bg-cyber-accent/10 px-2 py-0.5 rounded text-cyber-accent">{a}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/40 p-5 rounded border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-cyber-critical mb-4 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Sensitive Leaks
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[9px] text-white/30 uppercase mb-2">Emails Identified</div>
                              <div className="flex flex-wrap gap-1.5">
                                {osintReport.sensitive_exposures.emails.map((e, i) => <span key={i} className="text-[8px] font-mono bg-cyber-critical/10 px-2 py-0.5 rounded text-cyber-critical">{e}</span>)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] text-white/30 uppercase mb-2">API Keys / Secrets</div>
                              <div className="flex flex-wrap gap-1.5">
                                {osintReport.sensitive_exposures.api_keys.map((k, i) => <span key={i} className="text-[8px] font-mono bg-cyber-high/10 px-2 py-0.5 rounded text-cyber-high">{k}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/40 p-5 rounded border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-cyber-high mb-4 flex items-center gap-2">
                            <Cloud className="w-3.5 h-3.5" /> Cloud Vectors
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="text-[9px] text-white/30 uppercase">Exposed Repositories</div>
                            {osintReport.sensitive_exposures.repositories.map((r, i) => (
                              <a href={`https://${r}`} target="_blank" key={i} className="text-[9px] font-mono text-cyber-accent flex items-center gap-2 hover:underline">
                                <ExternalLink className="w-3 h-3" /> {r}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="text-[11px] uppercase font-bold text-white/40 border-b border-white/10 pb-2">Intelligence Correlation Stream</div>
                        <div className="grid grid-cols-1 gap-4">
                          {osintReport.findings.map((f, i) => (
                            <div key={i} className="bg-black/60 p-6 rounded border-l-4 border-l-cyber-accent border border-white/5 hover:bg-white/[0.02] transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="text-[9px] font-mono text-cyber-accent uppercase mb-1">{f.category} // {f.type}</div>
                                  <div className="text-sm font-bold text-white uppercase tracking-tight">{f.value}</div>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${f.risk_level === 'High' ? 'bg-cyber-critical text-white' : 'bg-cyber-high text-black'}`}>{f.risk_level} Risk</span>
                              </div>
                              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed font-mono italic opacity-80">{" >> "}{f.description}</p>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <div className="text-[9px] uppercase font-bold text-cyber-critical mb-2">Potential Attack Vectors</div>
                                  <ul className="space-y-1.5">
                                    {f.attack_vectors.map((v, idx) => <li key={idx} className="text-[9px] font-mono text-white/60 flex items-start gap-2"><span className="text-cyber-critical mt-1 shrink-0 w-1 h-1 rounded-full bg-cyber-critical" /> {v}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-[9px] uppercase font-bold text-cyber-success mb-2">Countermeasures</div>
                                  <p className="text-[9px] font-mono text-cyber-success/80 italic">{f.recommendation}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-cyber-accent/5 p-6 rounded border border-cyber-accent/20">
                        <div className="text-[11px] uppercase font-bold text-cyber-accent mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 glow-text-accent" /> Strategic Threat Landscape
                        </div>
                        <p className="text-[12px] text-gray-300 leading-relaxed font-mono italic opacity-90">{osintReport?.strategic_correlation}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'zero-day' && (
                    <div className="h-full bezel flex flex-col overflow-hidden p-8 gap-10 overflow-y-auto custom-scrollbar bg-cyber-dark">
                      <header className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                        <div className="flex items-center gap-6">
                          <div className="bg-cyber-high p-4 rounded shadow-[0_0_20px_rgba(255,138,0,0.2)]">
                            <Bomb className="w-8 h-8 text-black" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-display italic">Zero-Day Heuristic Sensors</h2>
                            <p className="text-[11px] text-white/40 uppercase font-mono tracking-[4px] mt-2">Behavioral anomaly extraction via neural pulse</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] uppercase text-white/30 font-bold mb-2 tracking-widest">Active Indicators</div>
                          <div className="text-4xl font-bold font-display text-cyber-high glow-text-high">{report?.summary.zero_day_indicators_found || 0}</div>
                        </div>
                      </header>

                      <div className="grid grid-cols-2 gap-8">
                        {report?.zero_day_indicators?.map((indicator, i) => (
                          <div key={i} className="bg-black/60 p-6 rounded border border-white/5 relative overflow-hidden group border-tactical">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-all">
                              <Eye className="w-16 h-16" />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                              <div className="text-[11px] font-bold uppercase bg-cyber-high text-black px-3 py-1 rounded tracking-widest">{indicator.pattern}</div>
                              <div className="text-[14px] font-bold text-cyber-high font-mono tracking-tighter">LVL_{indicator.suspicion_level.toString().padStart(2, '0')}</div>
                            </div>
                            <div className="text-base font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-cyber-high rounded-full animate-pulse" /> Threat Fingerprint
                            </div>
                            <p className="text-[13px] text-gray-400 leading-relaxed font-mono italic opacity-80">{" >> "}"{indicator.reasoning}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Right AI Assistant Panel */}
        <AIChatPanel 
          report={report} 
          osintReport={osintReport}
          target={target} 
          selectedVuln={currentVuln} 
          activeTab={activeTab}
        />
      </div>

      {/* Footer Info HUD */}
      <footer className="h-8 shrink-0 flex justify-between items-center text-[10px] font-mono text-white/30 border-t border-white/5 pt-3 uppercase tracking-widest bg-black/40 px-2">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-cyber-accent glow-text-accent"><Activity className="w-3.5 h-3.5" /> Neural_Link: STABLE</div>
          <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> RSA_PROT: ENABLED</div>
          <div className="flex items-center gap-2 opacity-30"><Database className="w-3.5 h-3.5" /> DB_SYNC: 0.2ms</div>
        </div>
        <div className="flex gap-4 items-center">
          <span className="opacity-20">Aegis-AI Tactical OS // Asia-SE1 // Console-7</span>
          <div className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-pulse shadow-[0_0_8px_#00FF41]" />
        </div>
      </footer>
    </div>
  );
}
