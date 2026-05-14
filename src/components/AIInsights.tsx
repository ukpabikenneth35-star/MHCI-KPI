import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { DashboardData } from '../types';
import { motion } from 'motion/react';

interface AIInsightsProps {
  data: DashboardData;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are a project management strategist. Analyze the following team task KPI data and provide 3 concise, actionable insights for the team (Uwana, Adaeze, Ikanke, Bright).
        
        KPI Data:
        ${data.kpis.map(k => `- ${k.owner} (${k.name}): ${k.value}${k.unit} (${k.trend} ${k.change}% trend)`).join('\n')}
        
        Focus on task completion rates, workload balance, and individual performance trends. 
        Format your response as a bulleted list of 3 brief, high-impact tactical points.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setInsight("Error generating insights. Please check your API key if it's the first time you run the app.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] text-[var(--text-primary)] p-8 rounded-3xl relative overflow-hidden border border-[var(--border-color)] backdrop-blur-sm">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Sparkles className="text-indigo-400" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight uppercase">Strategic AI</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-widest">GEMINI_LENS</p>
          </div>
        </div>
        
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] hover:bg-slate-800 border border-[var(--border-color)] transition-all rounded-lg text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 text-[var(--text-secondary)] hover:text-white"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {insight ? 'Iterate' : 'Execute'}
        </button>
      </div>

      <div className="relative z-10 min-h-[150px]">
        {!insight && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] italic text-[10px] font-mono">
            // AWAITING_DATA_ANALYSIS_REQUEST
          </div>
        )}
        
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-2 bg-slate-800 rounded-full w-full opacity-20" />
            <div className="h-2 bg-slate-800 rounded-full w-5/6 opacity-20" />
            <div className="h-2 bg-slate-800 rounded-full w-4/6 opacity-20" />
            <div className="h-2 bg-slate-800 rounded-full w-full opacity-20" />
          </div>
        )}

        {insight && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-none"
          >
            <div className="text-[var(--text-secondary)] text-xs leading-relaxed font-medium space-y-4">
              {insight.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
