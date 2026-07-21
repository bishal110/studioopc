import { useState, useEffect, useRef } from 'react';
import { INITIAL_TAGS, SCENARIOS } from './simulatorData';
import { ProcessTag, SimulationScenario } from './types';
import IsometricVisualizer from './components/IsometricVisualizer';
import TagsExplorer from './components/TagsExplorer';
import ScenarioConsole from './components/ScenarioConsole';
import HandoffBundle from './components/HandoffBundle';
import StoryboardPlayer from './components/StoryboardPlayer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Layers, Activity, Sliders, FolderGit, FileText, Compass, AlertCircle, RefreshCw, HardHat, Tv } from 'lucide-react';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<'ops' | 'tags' | 'handoff' | 'curriculum' | 'storyboard'>('ops');
  const [tags, setTags] = useState<ProcessTag[]>(INITIAL_TAGS);
  const [currentValues, setCurrentValues] = useState<Record<string, number | string>>(() => {
    const vals: Record<string, number | string> = {};
    INITIAL_TAGS.forEach(t => {
      vals[t.tagName] = t.currentValue;
    });
    return vals;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSec, setTimeSec] = useState(0);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ timeSec: number; message: string; type: 'info' | 'warning' | 'error' | 'success' }[]>([]);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>('SEP_LEVEL');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  // Trend Chart data history (holds last 30 data points)
  const [trendHistory, setTrendHistory] = useState<{ time: number; level: number; pressure: number; rpm: number }[]>([]);

  const isInitialMount = useRef(true);

  // Sync state with server backend
  const fetchSimState = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const data = await res.json();
      setCurrentValues(data.tags);
      setIsPlaying(data.isPlaying);
      setTimeSec(data.timeSec);
      setActiveScenarioId(data.activeScenarioId);
      setLogs(data.logs);
      setActionHistory(data.actionHistory || []);
      setIsBackendOnline(true);

      // Append to Recharts historical trend arrays
      setTrendHistory(prev => {
        const next = [...prev, {
          time: data.timeSec,
          level: Number(data.tags.SEP_LEVEL) || 0,
          pressure: Number(data.tags.INLET_PRESS) || 0,
          rpm: Number(data.tags.PGC_RPM) || 0,
        }];
        if (next.length > 30) next.shift(); // keep last 30 seconds
        return next;
      });
    } catch (err) {
      // Graceful fallback for offline mode or transient boot states
      setIsBackendOnline(false);
      
      // If we are playing locally, simulate the physics ticks locally
      if (isPlaying) {
        setTimeSec(prev => {
          const nextTime = prev + 1;
          
          setCurrentValues(prevVals => {
            const nextVals = { ...prevVals };
            
            // Generate some safe oscillations and physical feedback
            const isW1Active = Number(nextVals.WELL1_STATUS) === 1;
            const isW2Active = Number(nextVals.WELL2_STATUS) === 1;
            const choke1 = Number(nextVals.WELL1_CHOKE_VALVE) || 0;
            
            if (isW1Active) {
              nextVals.WELL1_FLOW = Number((choke1 * 10 + 50 * Math.sin(nextTime / 10)).toFixed(1));
            } else {
              nextVals.WELL1_FLOW = 0;
            }

            if (isW2Active) {
              nextVals.WELL2_FLOW = Number((380 + 30 * Math.sin(nextTime / 12)).toFixed(1));
            } else {
              nextVals.WELL2_FLOW = 0;
            }

            const inflow = (Number(nextVals.WELL1_FLOW) || 0) + (Number(nextVals.WELL2_FLOW) || 0);
            nextVals.INLET_PRESS = Number((inflow * 0.08 + 10 + 2 * Math.sin(nextTime / 8)).toFixed(1));

            // Pump simulation
            const pumpAStatus = Number(nextVals.BOOST_PUMP_STATUS);
            const pumpBStatus = Number(nextVals.STANDBY_PUMP_STATUS);
            const isGenOnline = Number(nextVals.GEN1_STATUS) === 1;

            if (pumpAStatus === 1 && isGenOnline) {
              nextVals.BOOST_PUMP_A_RPM = Math.min(2950, (Number(nextVals.BOOST_PUMP_A_RPM) || 0) + 300);
            } else {
              nextVals.BOOST_PUMP_A_RPM = Math.max(0, (Number(nextVals.BOOST_PUMP_A_RPM) || 0) - 400);
            }

            if (pumpBStatus === 1 && isGenOnline) {
              nextVals.BOOST_PUMP_B_RPM = Math.min(2950, (Number(nextVals.BOOST_PUMP_B_RPM) || 0) + 300);
            } else {
              nextVals.BOOST_PUMP_B_RPM = Math.max(0, (Number(nextVals.BOOST_PUMP_B_RPM) || 0) - 400);
            }

            const activePumpRpm = Math.max(Number(nextVals.BOOST_PUMP_A_RPM) || 0, Number(nextVals.BOOST_PUMP_B_RPM) || 0);
            let outflowOil = (activePumpRpm / 2950) * 650;
            
            const bypassPos = Number(nextVals.VALVE_BYPASS_POS) || 0;
            if (bypassPos > 0) {
              outflowOil += (bypassPos / 100) * 150;
            }

            if (Number(nextVals.SEP_ESD_VALVE) === 0) {
              outflowOil = 0;
            }

            nextVals.SEP_OUT_OIL_FLOW = Number(outflowOil.toFixed(1));

            const levelDiff = (inflow - outflowOil) * 0.03;
            let currentLevel = (Number(nextVals.SEP_LEVEL) || 45.2) + levelDiff;
            currentLevel = Math.max(0, Math.min(100, currentLevel));
            nextVals.SEP_LEVEL = Number(currentLevel.toFixed(1));

            // Compressor
            const pgcStatus = Number(nextVals.PGC_STATUS);
            if (pgcStatus === 1 && isGenOnline) {
              nextVals.PGC_RPM = Math.min(8400, (Number(nextVals.PGC_RPM) || 0) + 500);
            } else {
              nextVals.PGC_RPM = Math.max(0, (Number(nextVals.PGC_RPM) || 0) - 800);
            }

            const pgcRpm = Number(nextVals.PGC_RPM) || 0;
            nextVals.SEP_PRESS = Number((20 + (inflow * 0.01) - (pgcRpm / 8400) * 5 + 1.2 * Math.sin(nextTime / 15)).toFixed(1));
            nextVals.PGC_DISCHARGE_P = Number((pgcRpm * 0.008 + 5).toFixed(1));

            return nextVals;
          });

          return nextTime;
        });
      }

      // Update Recharts historical trends in local fallback
      setTrendHistory(prev => {
        const next = [...prev, {
          time: timeSec,
          level: Number(currentValues.SEP_LEVEL) || 45.2,
          pressure: Number(currentValues.INLET_PRESS) || 42.5,
          rpm: Number(currentValues.PGC_RPM) || 8400,
        }];
        if (next.length > 30) next.shift();
        return next;
      });
    }
  };

  // Immediate pull on start, then poll once every second
  useEffect(() => {
    fetchSimState();
    const interval = setInterval(() => {
      fetchSimState();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, timeSec, currentValues]);

  const handleStartScenario = async (scenarioId: string) => {
    try {
      const res = await fetch('/api/scenario/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) throw new Error("Offline fallback triggered");
      const data = await res.json();
      setCurrentValues(data.tags);
      setIsPlaying(data.isPlaying);
      setTimeSec(data.timeSec);
      setActiveScenarioId(data.activeScenarioId);
      setLogs(data.logs);
      setTrendHistory([]); // reset charts on new run
    } catch (err) {
      // Local offline scenario trigger
      setActiveScenarioId(scenarioId);
      setIsPlaying(true);
      setTimeSec(0);
      setTrendHistory([]);
      setLogs([{ timeSec: 0, message: `Scenario started in offline sandbox mode: ${scenarioId}`, type: "info" }]);
      
      if (scenarioId === 'startup_001') {
        setCurrentValues(prev => ({
          ...prev,
          GEN1_STATUS: 0,
          GEN1_POWER: 0,
          BUS_VOLTAGE: 0,
          WELL1_STATUS: 0,
          WELL2_STATUS: 0,
          WELL1_CHOKE_VALVE: 0,
          WELL1_FLOW: 0,
          WELL2_FLOW: 0,
          SEP_LEVEL: 12.0,
          INLET_PRESS: 4.5,
          BOOST_PUMP_STATUS: 0,
          BOOST_PUMP_A_RPM: 0,
          BOOST_PUMP_FLOW: 0,
        }));
      } else {
        // Reset to initial tags for general starting
        const vals: Record<string, number | string> = {};
        INITIAL_TAGS.forEach(t => {
          vals[t.tagName] = t.currentValue;
        });
        setCurrentValues(vals);
      }
    }
  };

  const handleControlSim = async (action: 'play' | 'pause' | 'reset', value?: any) => {
    try {
      const res = await fetch('/api/state/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      if (!res.ok) throw new Error("Offline control fallback");
      const data = await res.json();
      setCurrentValues(data.tags);
      setIsPlaying(data.isPlaying);
      setTimeSec(data.timeSec);
      setActiveScenarioId(data.activeScenarioId);
      setLogs(data.logs);
      if (action === 'reset') {
        setTrendHistory([]);
      }
    } catch (err) {
      if (action === 'play') {
        setIsPlaying(true);
        setLogs(prev => [...prev, { timeSec, message: "Simulation resumed (offline).", type: "info" }]);
      } else if (action === 'pause') {
        setIsPlaying(false);
        setLogs(prev => [...prev, { timeSec, message: "Simulation paused (offline).", type: "info" }]);
      } else if (action === 'reset') {
        setIsPlaying(false);
        setTimeSec(0);
        setActiveScenarioId(null);
        setTrendHistory([]);
        // Reset to default
        const vals: Record<string, number | string> = {};
        INITIAL_TAGS.forEach(t => {
          vals[t.tagName] = t.currentValue;
        });
        setCurrentValues(vals);
        setLogs([{ timeSec: 0, message: "Offshore Complex Process Simulator reset (offline).", type: "info" }]);
      }
    }
  };

  const handleForceTag = async (tagName: string, value: string | number) => {
    try {
      const res = await fetch('/api/tags/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagName, value }),
      });
      if (!res.ok) throw new Error("Offline write fallback");
      const data = await res.json();
      setCurrentValues(data.tags);
      setLogs(data.logs);
    } catch (err) {
      let parsedVal: string | number = value;
      if (!isNaN(Number(value)) && value !== "") {
        parsedVal = Number(value);
      }
      setCurrentValues(prev => ({
        ...prev,
        [tagName]: parsedVal
      }));
      setLogs(prev => [
        ...prev,
        { timeSec, message: `OPERATOR ACTION (Offline): Set ${tagName} to ${parsedVal}`, type: 'success' }
      ]);
    }
  };

  const activeScenario = SCENARIOS.find(s => s.scenarioId === activeScenarioId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 h-16 bg-slate-900 text-white flex items-center px-6 justify-between border-b border-slate-700 shadow-sm select-none">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/15">S</div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold leading-none tracking-tight uppercase text-white flex items-center gap-2">
              SW-FPS PROCESS SIMULATOR
              <span className="text-[9px] font-mono font-bold bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40">
                DELTA-PHASE III
              </span>
            </h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">STEADY & TRANSIENT PHYSICS | VER: 2.1.0-RC</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-slate-300 uppercase text-xs tracking-wider font-semibold">
              {activeScenarioId ? `Drill: ${activeScenario?.title}` : 'Process Status: Normal'}
            </span>
          </div>

          <div className="bg-slate-800 px-4 py-1.5 rounded-md border border-slate-700 flex flex-col items-center min-w-[120px]">
            <span className="text-[9px] text-slate-400 uppercase font-mono leading-none mb-1">SIM Time</span>
            <span className="text-base font-mono text-blue-400 font-bold leading-none">
              {(() => {
                const hrs = Math.floor(timeSec / 3600);
                const mins = Math.floor((timeSec % 3600) / 60);
                const secs = timeSec % 60;
                return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.00`;
              })()}
            </span>
          </div>

          <div className="flex flex-col items-end border-l border-slate-700 pl-4">
            <span className="text-[9px] text-slate-400 uppercase font-mono">Operator</span>
            <span className="text-white text-xs font-semibold">SME_VIS_ALPHA</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-300">
              {isBackendOnline ? 'DCS: Connected' : 'SANDBOX MODE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => setActiveMainTab('ops')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeMainTab === 'ops' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
          >
            <Activity className={`w-4 h-4 ${activeMainTab === 'ops' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            Topside Operations
          </button>
          <button
            onClick={() => setActiveMainTab('storyboard')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeMainTab === 'storyboard' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
          >
            <Tv className={`w-4 h-4 ${activeMainTab === 'storyboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            Storyboard Player (18 Panels)
          </button>
          <button
            onClick={() => setActiveMainTab('tags')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeMainTab === 'tags' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
          >
            <Sliders className={`w-4 h-4 ${activeMainTab === 'tags' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            Tag Registry (120 Tags)
          </button>
          <button
            onClick={() => setActiveMainTab('handoff')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeMainTab === 'handoff' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
          >
            <FolderGit className={`w-4 h-4 ${activeMainTab === 'handoff' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            Handoff Deliverables
          </button>
          <button
            onClick={() => setActiveMainTab('curriculum')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeMainTab === 'curriculum' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-sm dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
          >
            <FileText className={`w-4 h-4 ${activeMainTab === 'curriculum' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            SOP Curriculum
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {/* 1. Operational Training Dashboard */}
          {activeMainTab === 'ops' && (
            <div className="space-y-6">
              {/* Dynamic Flowsheet Visualizer */}
              <IsometricVisualizer
                tags={currentValues}
                onTagClick={(name) => {
                  setSelectedTag(name);
                  setActiveMainTab('tags');
                }}
              />

              {/* Live Historical trending metrics (Recharts) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
                      Dynamic Trend Chart (Separator & Inlet Telemetry)
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time dynamic process values mapped out over operational runtime.</p>
                  </div>
                  <div className="flex space-x-4 text-[9px] md:text-[10px] font-mono font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>Separator Level (%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>Inlet Pressure (barg)</span>
                  </div>
                </div>

                <div className="p-5 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }} />
                      <Area type="monotone" dataKey="level" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLevel)" strokeWidth={2} name="Level (%)" />
                      <Area type="monotone" dataKey="pressure" stroke="#2563eb" fillOpacity={1} fill="url(#colorPress)" strokeWidth={2} name="Pressure (barg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scenario controller & Grader panels */}
              <ScenarioConsole
                scenarios={SCENARIOS}
                activeScenarioId={activeScenarioId}
                timeSec={timeSec}
                isPlaying={isPlaying}
                onStartScenario={handleStartScenario}
                onControlSim={handleControlSim}
                logs={logs}
                currentTagValues={currentValues}
                actionHistory={actionHistory}
              />
            </div>
          )}

          {/* 5. Interactive Storyboard Player */}
          {activeMainTab === 'storyboard' && (
            <StoryboardPlayer />
          )}

          {/* 2. Tag Server Registry */}
          {activeMainTab === 'tags' && (
            <TagsExplorer
              tags={tags}
              currentValues={currentValues}
              onForceTag={handleForceTag}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
          )}

          {/* 3. Handoff Bundle (WebGL scene and LOD rules) */}
          {activeMainTab === 'handoff' && (
            <HandoffBundle />
          )}

          {/* 4. SOP Curriculum & Grader Rubric */}
          {activeMainTab === 'curriculum' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
                  SOP Training Curriculum & Performance Assessment Rubric
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comprehensive standard operating instructions, assessment rules, after-action reviews, and field validation criteria.
                </p>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOP Steps */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Offshore SOP Drill Curriculum
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Unit 1: Separator Cold-Start Process</strong>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Bootstrapping main generators, syncing grid voltages, gradually opening choke valves to prevent liquid hammer on separation lines, and stabilizing level feedback loops.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Unit 2: Booster Pump Cavitation & Trip Mitigation</strong>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Identifying pre-trip indicators (high vibration alarms, pressure waves). Manual transfer to secondary booster line, safety bypass loop balancing, and valve alignment.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Unit 3: Subsea Telemetry Attenuation & Cable Failure</strong>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Isolating automated unmanned wellhead manifolds during a communications black-out, manual ESD triggers, and pressure safety vent alignments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assessment Rubrics */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Grading & Performance Assessment Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Safety Intervention Velocity</strong>
                        <span className="text-[10px] text-slate-450">Response to mechanical fault trips</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10">≤ 60 seconds</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Mass Flow Deviation Tolerance</strong>
                        <span className="text-[10px] text-slate-450">Process steady state balancing</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10">Within ± 5% error</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Transient Recovery Window</strong>
                        <span className="text-[10px] text-slate-450">Time to restore separator stability</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10">≤ 5 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="mt-auto border-t border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-950 p-6 text-center text-[10px] md:text-xs text-slate-500 font-mono">
        <p>© 2026 SW-FPS PROCESS COMPLEX SIMULATION HANDOFF. DELIVERED IN DELTA-PHASE III CONTEXT.</p>
      </footer>
    </div>
  );
}
