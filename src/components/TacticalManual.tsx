import React from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Shield, Zap, Globe, BrainCircuit, 
  Search, Cpu, ChevronRight, Info, AlertTriangle,
  PlayCircle, Fingerprint, Database, Network, Radar, Activity
} from 'lucide-react';

export const TacticalManual: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-cyber-black/95 backdrop-blur-xl overflow-y-auto custom-scrollbar p-8"
    >
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center border-b border-white/10 pb-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-cyber-accent p-3 rounded shadow-[0_0_20px_rgba(0,255,65,0.3)]">
              <Terminal className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tactical_Manual</h2>
              <p className="text-[10px] font-mono text-cyber-accent uppercase tracking-[4px]">Neural Offensive Operations Guide // v4.5</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-white/10 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Exit_Docs
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Section 1: Initialization */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-cyber-accent">
              <PlayCircle className="w-5 h-5" />
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white">01. Mission Initialization</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Database className="w-16 h-16" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-mono mb-4 italic">
                To begin a reconnaissance cycle, the operator must provide a target vector and a sample intelligence stream.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-[11px] font-mono text-white/40">
                  <ChevronRight className="w-3 h-3 mt-1 text-cyber-accent shrink-0" />
                  <span><strong className="text-white">Target Domain:</strong> The primary FQDN (e.g., api.nexus-core.com) of the infrastructure under probe.</span>
                </li>
                <li className="flex gap-3 text-[11px] font-mono text-white/40">
                  <ChevronRight className="w-3 h-3 mt-1 text-cyber-accent shrink-0" />
                  <span><strong className="text-white">Intelligence Data:</strong> Paste raw server logs, Nmap scans, or fuzzer output. Aegis will parse and correlate this data live.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Neural Recon */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-cyber-high">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white">02. Neural Reconnaissance</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Cpu className="w-16 h-16" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-mono mb-4 italic">
                Aegis AI processes the stream via its Neural-Aegis Core. Navigating the tabs provides multi-layered insights.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-white/5 rounded bg-black/40">
                  <div className="text-[10px] font-bold text-cyber-critical mb-1 uppercase tracking-tighter">Vulnerability Matrix</div>
                  <div className="text-[9px] text-white/30 font-mono">Detailed breakdown of identified CVEs and logic flaws.</div>
                </div>
                <div className="p-3 border border-white/5 rounded bg-black/40">
                  <div className="text-[10px] font-bold text-cyber-accent mb-1 uppercase tracking-tighter">Attack Simulation</div>
                  <div className="text-[9px] text-white/30 font-mono">Step-by-step kinetic walkthrough of potential exploitation.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: OSINT Loop */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-cyber-low">
              <Globe className="w-5 h-5" />
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white">03. OSINT Intelligence Loop</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Radar className="w-16 h-16" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-mono mb-4 italic">
                Active external discovery scans for subdomains, APIs, and leaked secrets across the global threat landscape.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-cyber-low/5 border border-cyber-low/20 p-3 rounded">
                  <Fingerprint className="w-4 h-4 text-cyber-low" />
                  <span className="text-[10px] font-mono text-cyber-low/80 uppercase">Correlates leaked API keys with target vectors</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded">
                  <Network className="w-4 h-4 text-white/40" />
                  <span className="text-[10px] font-mono text-white/40 uppercase">Identifies shadow subdomains and staging envs</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: AI Command */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-cyber-accent">
              <Zap className="w-5 h-5" />
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white">04. AEGIS Command interaction</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Terminal className="w-16 h-16" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-mono mb-4 italic">
                The side-panel Command Hub allows direct neural link negotiation for custom exploitation logic.
              </p>
              <div className="bg-black/60 p-4 rounded border border-cyber-accent/20 font-mono">
                <div className="text-[9px] text-cyber-accent/40 mb-2">// EXAMPLE_NEGOTIATION</div>
                <div className="text-[10px] text-white/60">Operator: "Synthesize bypass for the WAF detected on phase 2."</div>
                <div className="text-[10px] text-cyber-accent mt-1">Aegis: "Bypass payload generated. Review Tactical_HUD."</div>
              </div>
            </div>
          </section>

          {/* Section 5: Persistence & History */}
          <section className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3 text-cyber-medium">
              <Info className="w-5 h-5" />
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white">05. Mission Persistence & Archives</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
               <div className="flex gap-4">
                  <Fingerprint className="w-5 h-5 text-cyber-medium shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold uppercase mb-1">Auth_Req</h5>
                    <p className="text-[10px] text-white/40 font-mono">Login via HQ Core to enable mission archiving and history sync.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <Database className="w-5 h-5 text-cyber-medium shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold uppercase mb-1">Report_Save</h5>
                    <p className="text-[10px] text-white/40 font-mono">Completed probes are automatically synchronized to the Firebase-Cortex.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <Activity className="w-5 h-5 text-cyber-medium shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold uppercase mb-1">History_Load</h5>
                    <p className="text-[10px] text-white/40 font-mono">Reload past missions directly from the 'Recent Primes' menu in HUD.</p>
                  </div>
               </div>
            </div>
          </section>
        </div>

        <div className="mt-24 p-8 bg-cyber-critical/5 border border-cyber-critical/20 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-critical/40 animate-pulse" />
          <div className="flex items-start gap-6">
            <div className="bg-cyber-critical p-4 rounded shadow-[0_0_20px_rgba(255,49,49,0.3)]">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase italic tracking-wider text-cyber-critical mb-2">Rules of Engagement</h4>
              <p className="text-sm text-white/60 leading-relaxed font-mono italic">
                AEGIS-AI is a strictly authorized offensive intelligence platform. Usage without explicit cross-mission authorization is a violation of international cyber-treaties. All neural telemetry is logged to the SOC-Core.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-24 text-center border-t border-white/5 pt-12 pb-12">
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-[10px] mb-4">Neural_Loop_End</div>
          <div className="text-[8px] font-mono text-white/10 uppercase tracking-widest">© 2026 AEGIS NEURAL SYSTEMS // ALL RIGHTS RESERVED</div>
        </footer>
      </div>
    </motion.div>
  );
};
