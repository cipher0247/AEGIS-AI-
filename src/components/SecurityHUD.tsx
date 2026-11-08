import React from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldCheck, ShieldAlert, Lock, UserCheck, Key, Globe, Activity, Eye, ShieldX, Fingerprint, Download } from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
  user: User;
  userConfig: any;
  onClose: () => void;
  onExport: () => void;
  hasData: boolean;
}

export const SecurityHUD: React.FC<Props> = ({ user, userConfig, onClose, onExport, hasData }) => {
  const isVerified = user.emailVerified;
  const role = userConfig?.role || 'OPERATOR';
  const mfa = userConfig?.mfaEnabled || false;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 z-50 w-[320px] bg-cyber-dark/95 border border-cyber-accent/30 backdrop-blur-xl rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,255,65,0.05)] overflow-hidden"
    >
      <div className="bg-cyber-accent/10 p-3 border-b border-cyber-accent/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-accent" />
          <span className="text-[10px] font-black uppercase tracking-[3px] text-white">Security_Intelligence</span>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
          <ShieldX className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Verification Hub */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-widest">Verification_Link</span>
            {isVerified ? (
              <span className="text-[8px] font-mono text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded border border-cyber-accent/30 tracking-tight flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            ) : (
              <span className="text-[8px] font-mono text-cyber-critical bg-cyber-critical/10 px-2 py-0.5 rounded border border-cyber-critical/30 tracking-tight flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> UNVERIFIED
              </span>
            )}
          </div>
          {!isVerified && (
            <p className="text-[9px] font-mono text-white/30 italic leading-tight">
              Action Required: Credentials not verified. Advanced reconnaissance disabled in rules.
            </p>
          )}
        </div>

        {/* RBAC Status */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[9px] font-mono uppercase text-white/60 tracking-widest">Operational_Role</span>
            </div>
            <span className={`text-[9px] font-black italic tracking-wider ${role === 'COMMANDER' ? 'text-cyber-medium' : 'text-white'}`}>
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[9px] font-mono uppercase text-white/60 tracking-widest">Multi_Factor</span>
            </div>
            <span className={`text-[9px] font-mono ${mfa ? 'text-cyber-accent' : 'text-white/20'}`}>
              {mfa ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Session Telemetry */}
        <div className="space-y-4">
          <h4 className="text-[8px] font-black uppercase text-white/20 tracking-[4px]">Session_Telemetry</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-white/5 rounded bg-black/40">
              <div className="text-[7px] font-mono text-white/30 uppercase mb-1">Session_Integrity</div>
              <div className="text-[9px] font-mono text-cyber-accent">STABLE</div>
            </div>
            <div className="p-2 border border-white/5 rounded bg-black/40">
              <div className="text-[7px] font-mono text-white/30 uppercase mb-1">Token_Rotation</div>
              <div className="text-[9px] font-mono text-cyber-accent">ACTIVE</div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex justify-between items-center text-[7px] font-mono text-white/20">
               <span>ANOMALY_DETECTION</span>
               <span>0.00ms</span>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-cyber-accent origin-left"
                />
             </div>
          </div>
        </div>

        {/* Operational Guard */}
        <div className="mt-4 border-t border-white/5 pt-4 space-y-4">
          <div className="flex items-start gap-3 bg-cyber-accent/5 p-3 rounded border border-cyber-accent/10">
            <Fingerprint className="w-4 h-4 text-cyber-accent mt-0.5" />
            <div>
              <div className="text-[9px] font-black uppercase text-white tracking-widest mb-1">Zero_Trust_Active</div>
              <p className="text-[8px] font-mono text-white/40 leading-none">All analytical syntheses are audited via HQ Core.</p>
            </div>
          </div>

          {hasData && (
            <button 
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyber-accent/10 border border-cyber-accent/20 rounded text-[10px] font-bold text-cyber-accent hover:bg-cyber-accent/20 transition-all uppercase tracking-widest group"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Exfiltrate Intelligence Brief
            </button>
          )}
        </div>
      </div>

      <div className="p-2 bg-black/40 border-t border-white/5 text-center">
        <span className="text-[7px] font-mono text-white/10 uppercase tracking-[6px]">Neural_Aegis_Security_Hub</span>
      </div>
    </motion.div>
  );
};
