import { useState, useEffect } from 'react';
import { SimulationScenario } from '../types';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Cpu, Brain, Terminal, Sparkles } from 'lucide-react';

interface ScenarioConsoleProps {
  scenarios: SimulationScenario[];
  activeScenarioId: string | null;
  timeSec: number;
  isPlaying: boolean;
  onStartScenario: (id: string) => void;
  onControlSim: (action: 'play' | 'pause' | 'reset', value?: any) => void;
  logs: { timeSec: number; message: string; type: 'info' | 'warning' | 'error' | 'success' }[];
  currentTagValues: Record<string, number | string>;
  actionHistory: string[];
}

export default function ScenarioConsole({
  scenarios,
  activeScenarioId,
  timeSec,
  isPlaying,
  onStartScenario,
  onControlSim,
  logs,
  currentTagValues,
  actionHistory,
}: ScenarioConsoleProps) {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [errorAi, setErrorAi] = useState<string>('');

  const activeScenario = scenarios.find(s => s.scenarioId === activeScenarioId);

  // Validate the operator actions against current tag values in real-time
  const getActionProgress = (actionIndex: number) => {
    if (!activeScenario) return { completed: false, status: 'pending' as const };

    const gen1Status = Number(currentTagValues.GEN1_STATUS);
    const busVolts = Number(currentTagValues.BUS_VOLTAGE);
    const chokeVal = Number(currentTagValues.WELL1_CHOKE_VALVE);
    const well1Status = Number(currentTagValues.WELL1_STATUS);
    const sepLvl = Number(currentTagValues.SEP_LEVEL);
    const bypassPos = Number(currentTagValues.VALVE_BYPASS_POS);
    const pumpBStatus = Number(currentTagValues.STANDBY_PUMP_STATUS);
    const subseaEsd = Number(currentTagValues.SUBSEA_ESD_VALVE);
    const sepEsd = Number(currentTagValues.SEP_ESD_VALVE);
    const well2Status = Number(currentTagValues.WELL2_STATUS);

    if (activeScenarioId === 'startup_001') {
      if (actionIndex === 0) {
        const met = gen1Status === 1 && busVolts >= 13.5;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 1) {
        const met = chokeVal === 45 && well1Status === 1;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 2) {
        const met = sepLvl >= 40 && sepLvl <= 55 && Number(currentTagValues.SEP_OUT_OIL_FLOW) > 400;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
    }

    if (activeScenarioId === 'booster_trip_001') {
      if (actionIndex === 0) {
        const met = bypassPos === 100;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 1) {
        const met = pumpBStatus === 1 && Number(currentTagValues.BOOST_PUMP_B_RPM) > 2800;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 2) {
        const met = bypassPos === 0 && sepLvl < 55 && Number(currentTagValues.BOOST_PUMP_FLOW) > 500;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
    }

    if (activeScenarioId === 'subsea_fault_001') {
      if (actionIndex === 0) {
        const met = Number(currentTagValues.SUBSEA_COMM_RTT) > 1000; // Alarm is active
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 1) {
        const met = subseaEsd === 0;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
      if (actionIndex === 2) {
        const met = well1Status === 0 && well2Status === 0 && sepEsd === 0;
        return { completed: met, status: met ? ('success' as const) : ('pending' as const) };
      }
    }

    return { completed: false, status: 'pending' as const };
  };

  // Call the server-side Gemini API advisor route
  const getAiAdvisorAdvice = async () => {
    setLoadingAi(true);
    setAiResponse('');
    setErrorAi('');

    // Compile active warnings and alarms
    const activeAlarms: Record<string, any> = {};
    if (Number(currentTagValues.SEP_LEVEL) > 60 || Number(currentTagValues.SEP_LEVEL) < 15) {
      activeAlarms.SEP_LEVEL = currentTagValues.SEP_LEVEL;
    }
    if (Number(currentTagValues.BOOST_PUMP_STATUS) === 2) {
      activeAlarms.BOOST_PUMP_STATUS = 'TRIP_ALARM';
    }
    if (Number(currentTagValues.SUBSEA_COMM_RTT) > 1000) {
      activeAlarms.SUBSEA_COMM_RTT = currentTagValues.SUBSEA_COMM_RTT;
    }

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScenario: activeScenario?.title || 'Steady State',
          activeAlarms,
          actionsDone: actionHistory,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.advice || "Advice was received, but no text output was generated.");
      } else {
        setErrorAi(data.error || "The AI Safety Server reported an error processing your query.");
      }
    } catch (err: any) {
      setErrorAi("Failed to connect to the backend server. Verify your internet connection or dev server logs.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none">
      {/* Simulation Controls & Scenario Selection */}
      <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
            Active Operator Control Deck
          </h3>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1.5">Select Drill Scenario</label>
              <div className="space-y-2">
                {scenarios.map(sc => (
                  <button
                    key={sc.scenarioId}
                    onClick={() => onStartScenario(sc.scenarioId)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${activeScenarioId === sc.scenarioId ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-1 ring-blue-500/30' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="font-bold text-slate-850 dark:text-slate-100">{sc.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{sc.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Simulation Status</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Elapsed: {timeSec}s</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onControlSim(isPlaying ? 'pause' : 'play')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg text-white transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/10' : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/15'}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  {isPlaying ? 'Pause Simulation' : 'Resume Process'}
                </button>
                <button
                  onClick={() => onControlSim('reset')}
                  className="flex items-center justify-center border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-2">Live Process Event Log</span>
            <div className="bg-slate-950 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 border border-slate-800 scrollbar-thin">
              {logs.slice().reverse().map((log, i) => (
                <div key={i} className={`leading-relaxed border-l-2 pl-2 ${log.type === 'error' ? 'border-red-500 text-red-400 bg-red-950/10' : log.type === 'warning' ? 'border-yellow-500 text-yellow-300 bg-yellow-950/10' : log.type === 'success' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-blue-400 text-blue-300 bg-blue-950/10'}`}>
                  <span className="text-slate-500 mr-1">[{log.timeSec}s]</span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* active SOP checklists and Graded Operator Actions */}
      <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
            SOP Performance Grader
          </h3>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          {activeScenario ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">Current Drill Scope</span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">{activeScenario.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{activeScenario.description}</p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Required SOP Steps checklist</span>
                {activeScenario.expectedOperatorActions.map((act, i) => {
                  const prog = getActionProgress(i);
                  return (
                    <div key={i} className={`p-3 rounded-lg border transition-all ${prog.completed ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={prog.completed}
                            readOnly
                            className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{act.action}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{act.successCriteria}</div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${prog.completed ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}>
                          {prog.completed ? 'Pass' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 mt-2 border-t border-slate-200/60 dark:border-slate-800/50 pt-1.5">
                        <span>TIME WINDOW: {act.timeWindowSec[0]}s - {act.timeWindowSec[1]}s</span>
                        <span className={timeSec > act.timeWindowSec[1] && !prog.completed ? 'text-red-500 font-bold' : 'text-slate-400'}>
                          {timeSec > act.timeWindowSec[1] && !prog.completed ? 'OUT OF TIME' : 'OK'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center justify-center h-full flex-1">
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2 stroke-1" />
              No active drill scenario. Select a scenario from the control deck on the left to begin the graded operator training drill.
            </div>
          )}
        </div>
      </div>

      {/* Advanced AI Advisor Panel with Thinking Support */}
      <div className="xl:col-span-1 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
          <h3 className="font-bold text-white text-xs md:text-sm flex items-center gap-2">
            <span className="text-amber-400 font-bold text-base">◈</span>
            AI Safety & Operations Advisor
          </h3>
          <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-semibold uppercase">
            <Cpu className="w-3 h-3" />
            gemini-3.1-pro
          </span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Activate deep reasoning evaluation to analyze process safety hazards, alarms, and recommend steps aligned with chemical plant standards.
            </p>

            {loadingAi && (
              <div className="mt-5 border border-amber-500/20 bg-amber-500/5 rounded-lg p-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">AI reasoning mode active...</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Analyzing separator liquid volumes, transient pressures, compressor surge margins, and telemetry packet delay thresholds...</p>
              </div>
            )}

            {errorAi && (
              <div className="mt-5 bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs font-mono">
                Error: {errorAi}
              </div>
            )}

            {aiResponse && (
              <div className="mt-5 bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs overflow-y-auto max-h-80 scrollbar-thin prose prose-invert prose-xs">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono mb-2 uppercase tracking-wider font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Safety Recommendation:
                </div>
                <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-xs">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-850 pt-4">
            <button
              onClick={getAiAdvisorAdvice}
              disabled={loadingAi}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-lg py-3 transition shadow"
            >
              <Brain className="w-4 h-4" />
              {loadingAi ? 'AI Safety Officer Thinking...' : 'Ask AI Safety Advisor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
