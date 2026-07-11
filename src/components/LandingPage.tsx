import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Skull, Globe, Zap, Cpu, Lock, Terminal, 
  ChevronRight, BrainCircuit, Activity, Radar, Bot,
  Fingerprint, Monitor, Info
} from 'lucide-react';
import { TacticalManual } from './TacticalManual';

interface Props {
  onStart: () => void;
  onLogin: () => void;
  user: any;
}

export const LandingPage: React.FC<Props> = ({ onStart, onLogin, user }) => {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="min-h-screen bg-cyber-black text-white selection:bg-cyber-accent selection:text-black overflow-hidden relative font-sans">
      <AnimatePresence>
        {showDocs && <TacticalManual onClose={() => setShowDocs(false)} />}
      </AnimatePresence>

      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyber-accent/5 rounded-full blur-[120px]" 
        />
      </div>

      {/* Navigation HUD */}
      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-cyber-critical p-2 rounded shadow-[0_0_15px_rgba(255,49,49,0.3)]">
            <Skull className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-black tracking-[8px] uppercase italic">AEGIS-AI</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex gap-6 text-[10px] font-mono tracking-widest text-white/40 uppercase">
            <span className="hover:text-cyber-accent cursor-pointer transition-colors">Neural_Core</span>
            <span className="hover:text-cyber-accent cursor-pointer transition-colors">Tactical_OS</span>
            <span className="hover:text-cyber-accent cursor-pointer transition-colors">OSINT_Loop</span>
          </div>
          {user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <img src={user.photoURL} className="w-5 h-5 rounded-full" alt="avatar" />
              <span className="text-[10px] font-mono text-cyber-accent uppercase">{user.displayName}</span>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-4 py-1.5 border border-white/10 rounded text-[10px] font-mono uppercase tracking-[2px] hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Lock className="w-3 h-3 text-cyber-accent" /> Auth_Operator
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyber-accent/10 border border-cyber-accent/30 px-4 py-1 rounded-full text-[10px] font-mono text-cyber-accent uppercase tracking-[4px] mb-8 flex items-center gap-2"
        >
          <Activity className="w-3 h-3 animate-pulse" /> Neural Offensive Platform v4.5 Active
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-6 font-display"
        >
          Strategic <br />
          <span className="text-cyber-accent glow-text-accent">Dominance</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl text-lg text-white/40 font-mono italic mb-12 tracking-tight leading-relaxed"
        >
          The next generation of offensive cyber-intelligence. AEGIS-AI combines neural reconnaissance, real-time OSINT correlation, and automated exploit synthesis to map the path of least resistance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <button 
            onClick={onStart}
            className="group relative px-10 py-5 bg-cyber-accent text-black font-black uppercase tracking-[4px] italic text-lg shadow-[0_0_30px_rgba(0,255,65,0.4)] hover:shadow-[0_0_50px_rgba(0,255,65,0.6)] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            Initialize Mission
          </button>
          <button 
            onClick={() => setShowDocs(true)}
            className="px-10 py-5 border border-white/10 hover:bg-white/5 transition-all text-[12px] font-mono uppercase tracking-[4px] flex items-center gap-3 relative group"
          >
            <div className="absolute inset-0 border border-cyber-accent opacity-0 group-hover:opacity-20 transition-opacity" />
            Read Tactical_Docs <Terminal className="w-4 h-4 text-cyber-accent" />
          </button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-7xl w-full relative">
          <div className="absolute -top-24 left-0 text-[10px] font-mono text-cyber-accent/40 uppercase tracking-[6px] flex items-center gap-4">
            <Fingerprint className="w-4 h-4" /> System_Capability_Matrix // CORE_V4
          </div>
          {[
            { 
              icon: BrainCircuit, 
              title: "Neural Recon", 
              tag: "DEEP_FORENSICS",
              desc: "Deep forensic analysis driven by multi-layered neural networks for absolute precision.",
              color: "text-cyber-accent",
              glow: "bg-cyber-accent/5"
            },
            { 
              icon: Globe, 
              title: "Global Intel", 
              tag: "OSINT_REALTIME",
              desc: "Real-time OSINT loops scanning subdomains, APIs, and exposed cloud vectors automatically.",
              color: "text-cyber-low",
              glow: "bg-cyber-low/5"
            },
            { 
              icon: Zap, 
              title: "Exploit Synth", 
              tag: "PAYLOAD_GEN",
              desc: "Automated generation of verified proof-of-concept payloads and strategic exfiltration paths.",
              color: "text-cyber-critical",
              glow: "bg-cyber-critical/5"
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
              className={`bg-black/40 border border-white/5 p-8 rounded text-left hover:border-white/20 transition-all group relative overflow-hidden ${feat.glow}`}
            >
              <div className="flex justify-between items-start mb-8">
                <feat.icon className={`w-10 h-10 group-hover:scale-110 transition-transform ${feat.color}`} />
                <span className={`text-[8px] font-mono border px-2 py-0.5 rounded tracking-widest ${feat.color} border-current opacity-40`}>
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-wider mb-4 group-hover:text-cyber-accent transition-colors">{feat.title}</h3>
              <p className="text-sm text-white/30 font-mono leading-relaxed mb-6">{feat.desc}</p>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${feat.color === 'text-cyber-accent' ? 'bg-cyber-accent' : feat.color === 'text-cyber-low' ? 'bg-cyber-low' : 'bg-cyber-critical'}`} />
                <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Neural_Link_Ready</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Core Architecture Matrix */}
        <section className="mt-32 w-full max-w-7xl pt-24 border-t border-white/5 relative">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                Neural_Core <br />
                <span className="text-cyber-accent">Architecture</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Heuristic Engine", desc: "Anomaly detection system scanning for 0-day behavior patterns and logic-based session fragmentation.", icon: Monitor },
                  { title: "Intelligence Core", desc: "High-speed correlation of OSINT data points including leaked subdomains and API secrets.", icon: Globe },
                  { title: "Synthesis Layer", desc: "Automated logic generation unit for drafting strategic penetration paths and POC payloads.", icon: Cpu }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="mt-1 transition-transform group-hover:scale-125">
                      <item.icon className="w-5 h-5 text-cyber-accent opacity-50" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black uppercase tracking-[3px] text-white mb-1">{item.title}</h4>
                      <p className="text-[11px] font-mono text-white/30 leading-relaxed italic">{" >> "}{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square bg-cyber-accent/5 rounded-full border border-cyber-accent/20 flex items-center justify-center relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-4 border border-dashed border-white/10 rounded-full" 
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                   className="absolute inset-12 border border-dashed border-cyber-accent/20 rounded-full" 
                />
                <div className="z-10 bg-cyber-black p-12 rounded-full border-2 border-cyber-accent shadow-[0_0_50px_rgba(0,255,65,0.2)]">
                  <BrainCircuit className="w-20 h-20 text-cyber-accent animate-flicker" />
                </div>
                
                {/* Orbital Accents */}
                <div className="absolute top-0 left-1/2 -ml-3 -mt-3 bg-cyber-accent w-6 h-6 rounded-full blur-md opacity-40 animate-pulse" />
                <div className="absolute bottom-1/4 right-0 mt-3 mr-3 bg-cyber-critical w-3 h-3 rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </section>
        <footer className="mt-32 w-full max-w-7xl border-t border-white/5 pt-12 pb-24 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Neural_Sync</div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 bg-cyber-accent shadow-[0_0_10px_#00FF41]" />
              <div className="text-[12px] font-mono text-cyber-accent lowercase">stable@node-asia-se1</div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Active_Missions</div>
            <div className="text-3xl font-black italic">14,802</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Threat_Neutralized</div>
            <div className="text-3xl font-black italic">99.98%</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Core_Uptime</div>
            <div className="text-3xl font-black italic">420:09:12</div>
          </div>
        </footer>
      </main>

      {/* Decorative Scanner Effect */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="fixed left-0 right-0 h-px bg-cyber-accent/20 z-0 pointer-events-none shadow-[0_0_15px_#00FF41]"
      />
    </div>
  );
};
