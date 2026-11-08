import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Bot, User, Loader2, ChevronRight, ChevronLeft, 
  BrainCircuit, ShieldAlert, Code2, Sparkles, Terminal, 
  Globe, Zap, Fingerprint, Search, Info, RotateCcw
} from 'lucide-react';
import { streamChatMessage } from '../services/gemini';
import { ScanReport, Vulnerability, OSINTReport } from '../types';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Props {
  report: ScanReport | null;
  osintReport: OSINTReport | null;
  target?: string;
  selectedVuln?: Vulnerability | null;
  activeTab: 'vulns' | 'simulation' | 'graph' | 'zero-day' | 'osint';
}

const TACTICAL_STATUS_MSGS = [
  "Correlating Neural Vectors...",
  "Decompiling Payload Headers...",
  "Mapping Lateral Movement Paths...",
  "Fuzzing API Authorization Hooks...",
  "Synthesizing Strategic Mitigation...",
  "Intercepting Bit-Stream Telemetry...",
  "Analyzing OSINT Asset Clusters...",
  "Heuristic Anomaly Detection Active..."
];

export const AIChatPanel: React.FC<Props> = ({ report, osintReport, target, selectedVuln, activeTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Neural Link Established. I am AEGIS-AI Core. Tactical analysis system is online. How can I assist in your penetration strategy?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [statusIdx, setStatusIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setStatusIdx(prev => (prev + 1) % TACTICAL_STATUS_MSGS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const systemInstruction = useMemo(() => {
    let contextStr = `Current Target: ${target || 'unknown'}\n`;
    
    if (report) {
      contextStr += `--- VULNERABILITY CONTEXT ---\n`;
      contextStr += `Summary: ${report.summary.critical} Critical, ${report.summary.high} High vulnerabilities.\n`;
      if (selectedVuln) {
        contextStr += `ACTIVE FOCUS: ${selectedVuln.name} (Severity: ${selectedVuln.severity}).\nDescription: ${selectedVuln.description}\nEvidence: ${selectedVuln.evidence_anchor}\n`;
      }
    }

    if (osintReport) {
      contextStr += `--- INTELLIGENCE CONTEXT ---\n`;
      contextStr += `Intel discovered ${osintReport.intelligence_summary.total_assets} assets and ${osintReport.intelligence_summary.sensitive_leaks} leaks.\n`;
      contextStr += `Discovered Subdomains: ${osintReport.discovered_assets.subdomains.slice(0, 5).join(', ')}\n`;
    }

    contextStr += `--- OPERATOR STATUS ---\n`;
    contextStr += `Operator is currently viewing the [${activeTab}] tab.\n`;

    return `You are AEGIS-AI Core, an elite offensive security neural assistant.
    OPERATIONAL ENVIRONMENT:
    ${contextStr}
    
    MISSION PARAMETERS:
    - Persona: Direct, technical, mission-critical, slightly cold, "AEGIS-AI" cyber-noir personality.
    - Precision: Use professional red-team terminology (exfiltration, lateral movement, SSRF, BOLA).
    - Hallucination: NEVER hallucinate features or vulnerabilities. Be skeptical.
    - Structure: Use Markdown tables for data, code blocks for payloads, and bold text for key threats.
    - Multi-turn: You have memory of this conversation. Build on previous tactical analysis.`;
  }, [target, report, osintReport, selectedVuln, activeTab]);

  const handleReset = () => {
    const resetId = 'reset-' + Date.now();
    setMessages([{
      id: resetId,
      role: 'assistant',
      content: "Neural link reset. Conversation history cleared. Awaiting mission parameters.",
      timestamp: new Date()
    }]);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      const history = messages
        .filter(m => !m.isStreaming && m.id !== '1' && !m.id.startsWith('reset'))
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      let accumulated = '';
      await streamChatMessage(
        userMessage.content,
        history,
        systemInstruction,
        (chunk) => {
          accumulated += chunk;
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: accumulated } : m
          ));
        }
      );

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
      ));
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { 
          ...m, 
          content: `FAIL: Neural Core sync loss. ${error.message || 'API access throttled or invalid. Attempting session recovery...'}`, 
          isStreaming: false 
        } : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const contextualShortcuts = useMemo(() => {
    const base = [
      { label: "Critical Path", cmd: "Identify my most critical path to compromise.", icon: Zap },
      { label: "Mitigation Plan", cmd: "Suggest hardening strategies for this target.", icon: ShieldAlert }
    ];

    if (activeTab === 'osint' && osintReport) {
      return [
        { label: "Correlate Intel", cmd: "Correlate discovered OSINT leaks with my verified vulnerabilities.", icon: Globe },
        { label: "Asset Risks", cmd: "Analyze the risk profile of my discovered subdomains.", icon: Search },
        ...base
      ];
    }

    if (activeTab === 'vulns' && selectedVuln) {
      return [
        { label: "Exploit Payload", cmd: `Generate an advanced exploit payload for ${selectedVuln.name}.`, icon: Code2 },
        { label: "Bypass Strategy", cmd: `Suggest ways to bypass WAFs for this ${selectedVuln.name} vector.`, icon: Zap },
        ...base
      ];
    }

    return base;
  }, [activeTab, osintReport, selectedVuln]);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 380 : 50 }}
      className="bg-black/80 backdrop-blur-2xl border-l border-white/5 flex flex-col relative z-20 shrink-0 h-full overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.6)]"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyber-accent/20 animate-scan pointer-events-none" />
        {isOpen ? (
          <>
            <div className="flex items-center gap-4">
              <div className="relative group-hover:scale-105 transition-transform duration-500">
                <BrainCircuit className="w-6 h-6 text-cyber-accent animate-flicker opacity-80" />
                <div className="absolute inset-0 bg-cyber-accent/20 blur-xl rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-[6px] text-white/90 block leading-none italic glow-text-accent">AEGIS CORE</span>
                <span className="text-[7px] font-mono text-cyber-accent/40 uppercase tracking-[3px] mt-1.5 font-bold">NODE: SYNCHRONIZED</span>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={handleReset}
                title="Reset Neural Link"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-white/10 hover:text-cyber-accent group/btn"
              >
                <RotateCcw className="w-4 h-4 group-hover/btn:rotate-[-90deg] transition-transform duration-500" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-all text-white/10 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full flex flex-col items-center gap-8 py-6 text-cyber-accent/60 hover:text-cyber-accent hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <div className="rotate-90 origin-center text-[9px] font-black uppercase tracking-[5px] whitespace-nowrap opacity-30">TERMINAL</div>
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Active Context Ribbon */}
          <div className="bg-white/[0.02] px-6 py-2.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyber-accent/40 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-cyber-accent/60 uppercase tracking-widest font-black">ACTIVE_DOMAIN</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter truncate font-medium">
                {activeTab.toUpperCase()}@NEURAL_NET
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">LAYER_V4.5_STABLE</span>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar bg-gradient-to-b from-black/20 to-transparent"
          >
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-center gap-3 mb-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${m.role === 'user' ? 'bg-white/5 border border-white/10' : 'bg-cyber-accent/10 border border-cyber-accent/20'}`}>
                      {m.role === 'user' ? <User className="w-3.5 h-3.5 text-white/40" /> : <Bot className="w-3.5 h-3.5 text-cyber-accent" />}
                    </div>
                    <span className={`text-[8px] font-mono uppercase font-black tracking-[2px] ${m.role === 'user' ? 'text-white/20' : 'text-cyber-accent/40'}`}>
                      {m.role === 'user' ? 'ID: OPERATOR_UNLINKED' : 'ID: AEGIS_SYSTEM_CORE'}
                    </span>
                  </div>
                  <div className={`max-w-[100%] p-5 rounded-2xl text-[12px] font-mono leading-relaxed prose prose-invert prose-xs relative transition-all duration-500 ${
                    m.role === 'user' 
                      ? 'bg-white/[0.03] border border-white/5 text-gray-300 rounded-tr-none' 
                      : 'bg-cyber-accent/[0.02] border border-cyber-accent/10 text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.2)] rounded-tl-none hover:border-cyber-accent/30'
                  }`}>
                    {m.content ? (
                      <div className={m.isStreaming ? 'typing-cursor' : ''}>
                        <Markdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline ? (
                                <span className="relative group my-5 block">
                                  <span className="absolute -top-3 left-3 bg-cyber-black px-2 text-[8px] text-cyber-accent uppercase tracking-[2px] border border-cyber-accent/20 z-10 font-bold italic">
                                    {match ? match[1] : 'TACTICAL_PAYLOAD'}
                                  </span>
                                  <code className={`${className} bg-black/60 px-5 py-5 rounded-lg text-cyber-success border border-cyber-accent/20 block whitespace-pre-wrap text-[11px] shadow-2xl backdrop-blur-md`} {...props}>
                                    {children}
                                  </code>
                                </span>
                              ) : (
                                <code className="bg-white/5 px-1.5 py-0.5 rounded text-cyber-accent border border-white/5 mx-0.5" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {m.content}
                        </Markdown>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 py-3">
                        <motion.div 
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <BrainCircuit className="w-5 h-5 text-cyber-accent shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
                        </motion.div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-cyber-accent/80 font-black uppercase tracking-[3px]">CORRELATING_DATA</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(i => (
                              <motion.div 
                                key={i}
                                animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 h-2 bg-cyber-accent rounded-full"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && !messages[messages.length-1].isStreaming && (
              <div className="flex flex-col items-start">
                <div className="bg-cyber-accent/[0.03] border border-cyber-accent/10 p-6 rounded-2xl flex flex-col gap-4 w-full backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Loader2 className="w-5 h-5 text-cyber-accent animate-spin opacity-60" />
                      <div className="absolute inset-0 bg-cyber-accent/10 blur-xl" />
                    </div>
                    <span className="text-[10px] text-cyber-accent/60 font-black uppercase tracking-[3px] animate-pulse">
                      {TACTICAL_STATUS_MSGS[statusIdx]}
                    </span>
                  </div>
                  <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-cyber-accent/40 to-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Library */}
          <div className="px-6 py-4 flex gap-3 overflow-x-auto custom-scrollbar border-t border-white/5 bg-black/40">
            {contextualShortcuts.map((sc, i) => (
              <button 
                key={i}
                onClick={() => handleSend(sc.cmd)}
                className="shrink-0 text-[9px] bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full text-white/40 hover:bg-cyber-accent/10 hover:text-cyber-accent hover:border-cyber-accent/30 transition-all uppercase font-black tracking-widest flex items-center gap-2.5 whitespace-nowrap"
              >
                <sc.icon className="w-3.5 h-3.5" /> {sc.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-6 bg-gradient-to-t from-black to-black/60 backdrop-blur-xl relative">
            <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="relative group">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="INPUT OPERATIONAL COMMAND..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 pr-14 text-[13px] font-mono text-white placeholder:text-white/10 focus:border-cyber-accent/40 focus:bg-white/[0.04] focus:shadow-[0_0_30px_rgba(0,255,65,0.05)] outline-none transition-all uppercase tracking-wide"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="absolute right-4 top-4 p-2 text-cyber-accent hover:bg-cyber-accent/10 rounded-lg transition-all disabled:opacity-20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-[8px] font-mono text-white/10 flex justify-between uppercase tracking-[4px] font-black">
              <span className="flex items-center gap-1.5"><Zap className="w-2.5 h-2.5" /> LINK: STABLE</span>
              <span>CORE_V4 // OFFENSIVE</span>
            </div>
          </div>
        </>
      )}
    </motion.aside>
  );
};
