import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Download, Sparkles, Check, Clipboard, AlertTriangle, ShieldCheck, Cpu, Tv, Eye, Layers } from 'lucide-react';

interface StoryboardFrame {
  id: string;
  filename: string;
  title: string;
  description: string;
  narrative: string;
  focusArea: string;
  expectedTags: { name: string; target: string; current: string | number }[];
}

const STORYBOARD_FRAMES: StoryboardFrame[] = [
  // Scenario A: Startup
  {
    id: "A1",
    filename: "A1_cluster.svg",
    title: "Wellhead Cluster Map",
    description: "Initial shut-in state of subsea wellheads",
    narrative: "All four wellheads are closed in with choke valves at 0%. No hydrocarbon flow lines are active (all greyed out). Pressures are static, power system is black.",
    focusArea: "Subsea well cluster manifold",
    expectedTags: [
      { name: "WELL1_STATUS", target: "0 (Closed)", current: 0 },
      { name: "WELL1_CHOKE_VALVE", target: "0%", current: 0 },
      { name: "GEN1_STATUS", target: "0 (Offline)", current: 0 }
    ]
  },
  {
    id: "A2",
    filename: "A2_approach.svg",
    title: "Platform Approach Zoom",
    description: "Visual approach camera zoom on primary topside deck",
    narrative: "3D camera view zooms into the physical bridge and process deck level-of-detail. HUD lines align with the main separation skids.",
    focusArea: "Topside Bridge & Process modules",
    expectedTags: [
      { name: "BUS_VOLTAGE", target: "0 kV", current: 0 },
      { name: "INLET_PRESS", target: "4.5 barg", current: 4.5 }
    ]
  },
  {
    id: "A3",
    filename: "A3_system_focus.svg",
    title: "Separator Vessel Focus",
    description: "Visual isolation of empty separator vessel",
    narrative: "Closer inspection of separator vessel. Liquid level is extremely low (12%). Flow lines are empty, showing no pressure or liquid speed indicators.",
    focusArea: "Process Separator V-101",
    expectedTags: [
      { name: "SEP_LEVEL", target: "12.0%", current: 12.0 },
      { name: "SEP_PRESS", target: "1.2 barg", current: 1.2 }
    ]
  },
  {
    id: "A4",
    filename: "A4_action.svg",
    title: "Generator Synchronization",
    description: "Main turbine sync & choke valve startup initialization",
    narrative: "The operator boots Turbogenerator 1. Voltage stabilizes to 13.8kV. Choke valve on Well 1 is opened to 45%, sending the first pressurized feed up the riser.",
    focusArea: "Turbogenerator skid & Well 1 riser",
    expectedTags: [
      { name: "GEN1_STATUS", target: "1 (Online)", current: 1 },
      { name: "BUS_VOLTAGE", target: "13.8 kV", current: 13.8 },
      { name: "WELL1_CHOKE_VALVE", target: "45%", current: 45 }
    ]
  },
  {
    id: "A5",
    filename: "A5_confirm.svg",
    title: "Separation Process Stabilization",
    description: "Liquid level reaches standard equilibrium",
    narrative: "Hydrocarbon flows enter the separator. Oil and gas separate. Oil output flow climbs and separator level reaches steady 45.2% equilibrium. Green indicators active.",
    focusArea: "Liquid Separation Train",
    expectedTags: [
      { name: "SEP_LEVEL", target: "45.2%", current: 45.2 },
      { name: "SEP_OUT_OIL_FLOW", target: "620 m3/h", current: 620 }
    ]
  },
  {
    id: "A6",
    filename: "A6_replay.svg",
    title: "Cold Startup Post-Review",
    description: "Final post-review of successful cold-start SOP sequence",
    narrative: "Review step for operators. All sequence checkmarks are passed. Flow lines are steady, active tags are securely inside green normal limits.",
    focusArea: "Full Platform Overview",
    expectedTags: [
      { name: "SOP_COMPLETION", target: "100%", current: 100 },
      { name: "WELL1_FLOW", target: "450 m3/h", current: 450 }
    ]
  },

  // Scenario B: Pump fault
  {
    id: "B1",
    filename: "B1_cluster.svg",
    title: "Steady-State Normal",
    description: "Normal production flow and pump alignment",
    narrative: "System is in normal steady-state. Wellhead cluster and topsides are healthy. Green flow paths show liquid moving at design pressure and velocity.",
    focusArea: "Topside Separation Block",
    expectedTags: [
      { name: "BOOST_PUMP_STATUS", target: "1 (Running)", current: 1 },
      { name: "BOOST_PUMP_A_RPM", target: "2950 rpm", current: 2950 },
      { name: "STANDBY_PUMP_STATUS", target: "0 (Standby)", current: 0 }
    ]
  },
  {
    id: "B2",
    filename: "B2_approach.svg",
    title: "Liquid Booster Skid Zoom",
    description: "Camera zooms onto booster pump skid area",
    narrative: "Approach camera focuses on the liquid pump export skids. HUD overlay displays bearing vibration status indicators.",
    focusArea: "Export pump skid modules A/B",
    expectedTags: [
      { name: "BOOST_PUMP_FLOW", target: "780 m3/h", current: 780 },
      { name: "BOOST_PUMP_PRESS_OUT", target: "54.8 barg", current: 54.8 }
    ]
  },
  {
    id: "B3",
    filename: "B3_system_focus.svg",
    title: "Primary Pump Focus",
    description: "High-resolution telemetry focus on Booster Pump A",
    narrative: "Close-up of Pump A. Telemetry overlays verify physical health: normal vibration levels, stable oil temperatures, and motor speeds.",
    focusArea: "Booster Pump A Impeller",
    expectedTags: [
      { name: "BOOST_PUMP_A_RPM", target: "2950 rpm", current: 2950 },
      { name: "BOOST_PUMP_STATUS", target: "1 (Normal)", current: 1 }
    ]
  },
  {
    id: "B4",
    filename: "B4_fault.svg",
    title: "Booster Pump A Vibration Trip",
    description: "Critical mechanical bearing high vibration fault",
    narrative: "Vibration limits are exceeded. Pump A trips with warning flash. Flow drops sharply. Separator level accumulates rapidly. Bypass valve is auto-opened.",
    focusArea: "Pump A Mechanical Bearings (Faulted)",
    expectedTags: [
      { name: "BOOST_PUMP_STATUS", target: "2 (Fault)", current: 2 },
      { name: "BOOST_PUMP_A_RPM", target: "0 rpm", current: 0 },
      { name: "VALVE_BYPASS_POS", target: "100%", current: 100 }
    ]
  },
  {
    id: "B5",
    filename: "B5_operator.svg",
    title: "Standby Pump Engagement",
    description: "Manual override switch to standby Pump B",
    narrative: "Operator activates Booster Pump B. Standby pump status turns to 1. Standby pump ramps up to 2950 RPM. Safety bypass valve starts closing.",
    focusArea: "Booster Pump B (Active)",
    expectedTags: [
      { name: "STANDBY_PUMP_STATUS", target: "1 (Running)", current: 1 },
      { name: "BOOST_PUMP_B_RPM", target: "2950 rpm", current: 2950 },
      { name: "VALVE_BYPASS_POS", target: "0%", current: 0 }
    ]
  },
  {
    id: "B6",
    filename: "B6_after.svg",
    title: "Stabilized Pump Review",
    description: "Post-fault recovery and steady-state return",
    narrative: "Pump B stabilizes the liquid transfer. Separator level is recovered to 45.2% normal. Liquid velocities return to green. Action logged successfully.",
    focusArea: "Topside Liquid Train",
    expectedTags: [
      { name: "SEP_LEVEL", target: "45.2%", current: 45.2 },
      { name: "BOOST_PUMP_FLOW", target: "780 m3/h", current: 780 }
    ]
  },

  // Scenario C: Comms Fault
  {
    id: "C1",
    filename: "C1_cluster.svg",
    title: "Subsea Wellheads Topology",
    description: "Topology layout of deep-water fiber lines",
    narrative: "Overview map showing fiber telemetry lines connected to the subsea wellheads. Comm links show high signal strength, 45ms RTT latency.",
    focusArea: "Subsea umbilical path",
    expectedTags: [
      { name: "SUBSEA_COMM_RTT", target: "45 ms", current: 45 },
      { name: "SUBSEA_POWER_STATUS", target: "1 (Healthy)", current: 1 }
    ]
  },
  {
    id: "C2",
    filename: "C2_approach.svg",
    title: "Umbilical Umbilical Focus",
    description: "Camera tracks fiber-optic lines to subsea riser",
    narrative: "Visual zooming on the physical subsea cable entering the platform sea-tube riser. Telemetry indicators trace high data bandwidth flows.",
    focusArea: "Platform Riser J-Tube",
    expectedTags: [
      { name: "SUBSEA_MANIFOLD_P", target: "142.6 barg", current: 142.6 }
    ]
  },
  {
    id: "C3",
    filename: "C3_system_focus.svg",
    title: "Fiber Network Diagnostics",
    description: "Main subsea communications control panel",
    narrative: "Telemetry network diagnostic center showing optical power values, healthy heartbeat, and low ping jitter. Flow continues normally.",
    focusArea: "DCS Telemetry Terminal",
    expectedTags: [
      { name: "SUBSEA_COMM_RTT", target: "45 ms", current: 45 },
      { name: "SUBSEA_ESD_VALVE", target: "1 (Open)", current: 1 }
    ]
  },
  {
    id: "C4",
    filename: "C4_fault.svg",
    title: "Optical Communications Loss",
    description: "Subsea cable breakage and Ground fault",
    narrative: "The fiber cable suffers severe degradation. Ping RTT latency spikes to 4,850ms. High-voltage power feed is lost. Safe remote telemetry is impossible.",
    focusArea: "Subsea umbilical cable (Damaged)",
    expectedTags: [
      { name: "SUBSEA_COMM_RTT", target: "4850 ms", current: 4850 },
      { name: "SUBSEA_POWER_STATUS", target: "0 (Fault)", current: 0 },
      { name: "SUBSEA_MANIFOLD_P", target: "188.5 barg", current: 188.5 }
    ]
  },
  {
    id: "C5",
    filename: "C5_tasks.svg",
    title: "Emergency Shutdown Triggers",
    description: "Manual ESD trigger isolating wellhead feeds",
    narrative: "Emergency safety actions triggered. Operator closes Subsea ESD Valve (SUBSEA_ESD_VALVE = 0) and Topside Separator ESD Valve (SEP_ESD_VALVE = 0) to halt well flows.",
    focusArea: "Isolation ESD Valves Block",
    expectedTags: [
      { name: "SUBSEA_ESD_VALVE", target: "0 (Closed)", current: 0 },
      { name: "SEP_ESD_VALVE", target: "0 (Closed)", current: 0 },
      { name: "WELL1_FLOW", target: "0 m3/h", current: 0 }
    ]
  },
  {
    id: "C6",
    filename: "C6_replay.svg",
    title: "Safe Standby Isolation",
    description: "Completed isolation post-review & safety sign-off",
    narrative: "The platform is isolated in a secure, non-flowing hot standby state. Pressures have stabilized. No venting. Fully compliant with graded offshore rules.",
    focusArea: "Subsea Wellhead and Platform Isolation",
    expectedTags: [
      { name: "SUBSEA_MANIFOLD_P", target: "142.6 barg", current: 142.6 },
      { name: "WELL1_FLOW", target: "0 m3/h", current: 0 },
      { name: "WELL2_FLOW", target: "0 m3/h", current: 0 }
    ]
  }
];

export default function StoryboardPlayer() {
  const [activeFrameId, setActiveFrameId] = useState<string>("A1");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentFrame = STORYBOARD_FRAMES.find(f => f.id === activeFrameId) || STORYBOARD_FRAMES[0];

  // Simple narrative speed multiplier tick
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 250 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setSimTime(prev => {
          const nextTime = prev + 5;
          const maxDuration = 600; // scenario duration limit
          if (nextTime >= maxDuration) {
            // Auto advance frame if enabled
            if (autoAdvance) {
              const currentIdx = STORYBOARD_FRAMES.findIndex(f => f.id === activeFrameId);
              if (currentIdx !== -1 && currentIdx < STORYBOARD_FRAMES.length - 1) {
                const nextFrame = STORYBOARD_FRAMES[currentIdx + 1];
                setActiveFrameId(nextFrame.id);
                return 0; // reset time for next frame
              }
            }
            setIsPlaying(false);
            return maxDuration;
          }
          return nextTime;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, activeFrameId, autoAdvance]);

  const handleFrameChange = (frameId: string) => {
    setActiveFrameId(frameId);
    setSimTime(0);
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(STORYBOARD_FRAMES, null, 2));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helper formatting minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getDynamicValue = (tagName: string, targetValueStr: string, originalVal: string | number) => {
    // Dynamically scale or change tag values as simulation time progresses
    const progress = simTime / 600;
    if (typeof originalVal === 'number') {
      const targetNum = parseFloat(targetValueStr) || originalVal;
      const computed = originalVal + (targetNum - originalVal) * progress;
      return computed.toFixed(1);
    }
    return progress > 0.5 ? targetValueStr : String(originalVal);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 select-none animate-fadeIn">
      
      {/* 1. Left interactive SVG Visualizer Panel & Controls (Col-span 3) */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
                Active Storyboard Player ({currentFrame.id} - {currentFrame.title})
              </h3>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive SVG simulation playback mapping 12-week design specs over real operational narratives.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                Story Scene: {activeFrameId[0]} Series
              </span>
            </div>
          </div>

          {/* Inline SVG Schematic Player Canvas */}
          <div className="p-6 bg-slate-950 flex items-center justify-center relative min-h-[350px] border-b border-slate-200 dark:border-slate-800">
            <svg viewBox="0 0 800 400" className="w-full max-w-4xl h-auto">
              {/* Gradients */}
              <defs>
                <linearGradient id="cyberOcean" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#020813" />
                  <stop offset="100%" stopColor="#081a33" />
                </linearGradient>
                <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect width="800" height="400" fill="url(#cyberOcean)" rx="12" stroke="#1e293b" strokeWidth="2" />
              
              {/* Overlay grid lines */}
              <g stroke="#1e293b" strokeWidth="0.5" opacity="0.4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={400} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`y-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
                ))}
              </g>

              {/* Static background lines indicating connections */}
              <path d="M 120 280 L 300 280 L 480 180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 480 180 L 680 180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />

              {/* ---------------- DRAW DYNAMIC SVG ACCORDING TO FRAME TYPE ---------------- */}
              
              {/* A. CLUSTER MAP VIEWS (A1, B1, C1) */}
              {(currentFrame.id.includes("1")) && (
                <g className="animate-fadeIn">
                  <text x="30" y="40" fill="#64748b" className="font-mono text-[10px] tracking-widest font-bold uppercase">SUBSEA TOPOLOGY VIEW</text>
                  
                  {/* Wellhead 1 */}
                  <g transform="translate(100, 150)">
                    <circle r="22" fill="#1e293b" stroke={activeFrameId === "A1" ? "#64748b" : "#10b981"} strokeWidth="2" className={activeFrameId === "C1" ? "animate-pulse" : ""} />
                    <text x="0" y="4" fill="#f8fafc" className="font-mono text-[9px] font-bold text-center" textAnchor="middle">WELL 1</text>
                    <path d="M 22 0 L 80 0" fill="none" stroke={activeFrameId === "A1" ? "#475569" : "#10b981"} strokeWidth="3" strokeDasharray="4,4" />
                    {activeFrameId !== "A1" && <circle r="3" fill="#10b981" transform="translate(45, 0)" className="animate-ping" />}
                  </g>

                  {/* Wellhead 2 */}
                  <g transform="translate(100, 250)">
                    <circle r="22" fill="#1e293b" stroke={activeFrameId === "A1" ? "#64748b" : "#10b981"} strokeWidth="2" />
                    <text x="0" y="4" fill="#f8fafc" className="font-mono text-[9px] font-bold text-center" textAnchor="middle">WELL 2</text>
                    <path d="M 22 0 L 80 0" fill="none" stroke={activeFrameId === "A1" ? "#475569" : "#10b981"} strokeWidth="3" strokeDasharray="4,4" />
                  </g>

                  {/* Subsea Manifold Box */}
                  <g transform="translate(260, 180)">
                    <rect x="-30" y="-35" width="60" height="70" fill="url(#vesselGrad)" stroke="#3b82f6" strokeWidth="2" rx="4" />
                    <text x="0" y="-15" fill="#94a3b8" className="font-mono text-[8px] font-bold" textAnchor="middle">SUBSEA</text>
                    <text x="0" y="0" fill="#f8fafc" className="font-mono text-[9px] font-bold" textAnchor="middle">MANIFOLD</text>
                    <text x="0" y="15" fill="#3b82f6" className="font-mono text-[8px]" textAnchor="middle">M-101</text>
                  </g>

                  {/* Manifold Output to Platform */}
                  <path d="M 320 200 Q 420 200 480 150" fill="none" stroke={activeFrameId === "A1" ? "#475569" : "#10b981"} strokeWidth="4" />
                  
                  {/* Topside Platform Platform */}
                  <g transform="translate(560, 150)">
                    <rect x="-40" y="-30" width="100" height="60" fill="url(#vesselGrad)" stroke="#f59e0b" strokeWidth="2" rx="6" />
                    <text x="10" y="5" fill="#f8fafc" className="font-mono text-[10px] font-bold" textAnchor="middle">TOPSIDES</text>
                    <text x="10" y="18" fill="#f59e0b" className="font-mono text-[7px]" textAnchor="middle">SW-FPS-A</text>
                  </g>

                  {/* Fiber cable lines */}
                  <path d="M 100 80 L 260 80 L 260 145" fill="none" stroke={activeFrameId === "C1" ? "#38bdf8" : "#3b82f6"} strokeWidth="2" />
                  <circle r="4" fill={activeFrameId === "C1" ? "#38bdf8" : "#3b82f6"} cx="100" cy="80" className="animate-ping" />
                  <text x="110" y="75" fill="#38bdf8" className="font-mono text-[8px] font-bold">HV COMMS UMBILICAL</text>
                </g>
              )}

              {/* B. APPROACH CAM VIEWS (A2, B2, C2) */}
              {(currentFrame.id.includes("2")) && (
                <g className="animate-fadeIn">
                  <text x="30" y="40" fill="#64748b" className="font-mono text-[10px] tracking-widest font-bold uppercase">CAMERA APPROACH ZOOM VIEW</text>
                  
                  {/* Horizon line */}
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#1e293b" strokeWidth="1.5" />
                  
                  {/* Ocean wave floor */}
                  <path d="M 50 200 C 250 220 550 180 750 200" fill="none" stroke="#1d4ed8" strokeWidth="2" opacity="0.3" />

                  {/* 3D Wireframe Platform Structure */}
                  <g transform="translate(400, 180)">
                    {/* Leg pylons */}
                    <line x1="-80" y1="20" x2="-120" y2="120" stroke="#334155" strokeWidth="3" />
                    <line x1="80" y1="20" x2="120" y2="120" stroke="#334155" strokeWidth="3" />
                    <line x1="0" y1="20" x2="0" y2="120" stroke="#334155" strokeWidth="2" />

                    {/* Cross bracing wireframes */}
                    <line x1="-80" y1="20" x2="80" y2="120" stroke="#1e293b" strokeWidth="1" />
                    <line x1="80" y1="20" x2="-120" y2="120" stroke="#1e293b" strokeWidth="1" />

                    {/* Platform deck slab */}
                    <polygon points="-120,20 120,20 150,-20 -150,-20" fill="url(#vesselGrad)" stroke="#3b82f6" strokeWidth="2" />

                    {/* Topside equipment modules boxes */}
                    <rect x="-80" y="-55" width="45" height="35" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
                    <rect x="-20" y="-60" width="50" height="40" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
                    <rect x="40" y="-45" width="35" height="25" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="2" />

                    {/* Flare stack tower */}
                    <line x1="-120" y1="-10" x2="-180" y2="-80" stroke="#475569" strokeWidth="2" />
                    <circle cx="-180" cy="-80" r="3" fill="#ef4444" className="animate-pulse" />

                    {/* HUD reticle rings */}
                    <circle r="70" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" className="animate-spin-slow" />
                    <line x1="-100" y1="0" x2="-60" y2="0" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="60" y1="0" x2="100" y2="0" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="0" y1="-100" x2="0" y2="-60" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="0" y1="60" x2="0" y2="100" stroke="#38bdf8" strokeWidth="1" />
                  </g>

                  {/* HUD Corner boundaries */}
                  <path d="M 80 80 L 50 80 L 50 110" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M 720 80 L 750 80 L 750 110" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M 80 320 L 50 320 L 50 290" fill="none" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M 720 320 L 750 320 L 750 290" fill="none" stroke="#38bdf8" strokeWidth="2" />

                  <text x="400" y="340" fill="#38bdf8" className="font-mono text-[9px] font-bold" textAnchor="middle">CAM_RISER_APPROACH_LOD1 • CAMERA LOCK ACTIVE</text>
                </g>
              )}

              {/* C. SYSTEM FOCUS: SEPARATOR (A3, A4, A5, A6) */}
              {(activeFrameId.startsWith("A") && !activeFrameId.includes("1") && !activeFrameId.includes("2")) && (
                <g className="animate-fadeIn">
                  <text x="30" y="40" fill="#64748b" className="font-mono text-[10px] tracking-widest font-bold uppercase">SEPARATOR DETAILED FLOWSHEET</text>

                  {/* Flow pipeline inlet */}
                  <path d="M 50 200 L 250 200" fill="none" stroke={activeFrameId === "A3" ? "#475569" : "#10b981"} strokeWidth="4" />
                  {activeFrameId !== "A3" && <circle r="4" fill="#10b981" cx="150" cy="200" className="animate-ping" />}

                  {/* Separator Vessel */}
                  <g transform="translate(380, 200)">
                    {/* Outer hull */}
                    <rect x="-120" y="-70" width="240" height="140" fill="url(#vesselGrad)" stroke="#f59e0b" strokeWidth="3" rx="35" />
                    
                    {/* Vessel Level Fluid fills dynamically */}
                    <rect x="-115" y={activeFrameId === "A3" ? 50 : activeFrameId === "A4" ? 20 : 10} width="230" height={activeFrameId === "A3" ? 15 : activeFrameId === "A4" ? 45 : 55} fill="#0284c7" opacity="0.6" rx="10" />

                    {/* Demister pad filter inside separator */}
                    <line x1="30" y1="-65" x2="30" y2="65" stroke="#475569" strokeWidth="2" strokeDasharray="4,4" />

                    {/* Labels */}
                    <text x="0" y="-20" fill="#f8fafc" className="font-bold text-[14px]" textAnchor="middle">3-PHASE SEPARATOR</text>
                    <text x="0" y="0" fill="#94a3b8" className="font-mono text-[10px]" textAnchor="middle">V-101 LIQUID PROCESS</text>
                    
                    {/* Dynamic level tag percentage indicator */}
                    <text x="0" y="35" fill="#f8fafc" className="font-mono text-[11px] font-bold bg-black/40 px-2 py-0.5 rounded" textAnchor="middle">
                      LEVEL: {activeFrameId === "A3" ? "12.0%" : activeFrameId === "A4" ? "32.5%" : "45.2%"}
                    </text>
                  </g>

                  {/* Outlet oil pipeline */}
                  <path d="M 500 240 L 700 240" fill="none" stroke={activeFrameId === "A3" ? "#475569" : "#10b981"} strokeWidth="4" />
                  
                  {/* Outlet gas pipeline */}
                  <path d="M 500 160 L 700 160" fill="none" stroke={activeFrameId === "A3" ? "#475569" : "#10b981"} strokeWidth="4" />

                  {/* Generator light HUD indicators */}
                  <g transform="translate(680, 70)">
                    <rect x="-60" y="-15" width="120" height="30" fill="#0f172a" stroke={activeFrameId === "A3" ? "#ef4444" : "#10b981"} strokeWidth="1.5" rx="4" />
                    <text x="0" y="4" fill="#f8fafc" className="font-mono text-[8px] font-bold" textAnchor="middle">
                      GEN 1: {activeFrameId === "A3" ? "OFFLINE" : "ONLINE"}
                    </text>
                  </g>
                </g>
              )}

              {/* D. SYSTEM FOCUS: BOOSTER PUMPS (B3, B4, B5, B6) */}
              {(activeFrameId.startsWith("B") && !activeFrameId.includes("1") && !activeFrameId.includes("2")) && (
                <g className="animate-fadeIn">
                  <text x="30" y="40" fill="#64748b" className="font-mono text-[10px] tracking-widest font-bold uppercase">LIQUID TRANSFER BOOSTER PUMP SKID</text>

                  {/* Pipeline header */}
                  <path d="M 50 200 L 220 200" fill="none" stroke="#10b981" strokeWidth="4" />

                  {/* Flow splits to Pump A & B */}
                  <path d="M 220 200 L 220 120 L 320 120" fill="none" stroke={activeFrameId === "B4" ? "#ef4444" : "#10b981"} strokeWidth="3" />
                  <path d="M 220 200 L 220 280 L 320 280" fill="none" stroke={activeFrameId === "B5" || activeFrameId === "B6" ? "#10b981" : "#475569"} strokeWidth="3" />

                  {/* Pump A Container */}
                  <g transform="translate(360, 120)">
                    <rect x="-40" y="-25" width="80" height="50" fill="url(#vesselGrad)" stroke={activeFrameId === "B4" ? "#ef4444" : activeFrameId === "B5" || activeFrameId === "B6" ? "#64748b" : "#10b981"} strokeWidth="2" rx="4" className={activeFrameId === "B4" ? "animate-pulse" : ""} />
                    <text x="0" y="-4" fill="#f8fafc" className="font-mono text-[10px] font-bold" textAnchor="middle">PUMP A</text>
                    <text x="0" y="10" fill={activeFrameId === "B4" ? "#ef4444" : "#94a3b8"} className="font-mono text-[8px]" textAnchor="middle">
                      {activeFrameId === "B4" ? "VIB TRIP" : "2950 RPM"}
                    </text>
                  </g>

                  {/* Pump B Standby Container */}
                  <g transform="translate(360, 280)">
                    <rect x="-40" y="-25" width="80" height="50" fill="url(#vesselGrad)" stroke={activeFrameId === "B5" || activeFrameId === "B6" ? "#10b981" : "#475569"} strokeWidth="2" rx="4" className={activeFrameId === "B5" ? "animate-pulse" : ""} />
                    <text x="0" y="-4" fill="#f8fafc" className="font-mono text-[10px] font-bold" textAnchor="middle">PUMP B</text>
                    <text x="0" y="10" fill={activeFrameId === "B5" || activeFrameId === "B6" ? "#10b981" : "#94a3b8"} className="font-mono text-[8px]" textAnchor="middle">
                      {activeFrameId === "B5" || activeFrameId === "B6" ? "2950 RPM" : "STANDBY"}
                    </text>
                  </g>

                  {/* Outputs join back */}
                  <path d="M 400 120 L 500 120 L 500 200" fill="none" stroke={activeFrameId === "B4" ? "#ef4444" : "#10b981"} strokeWidth="3" />
                  <path d="M 400 280 L 500 280 L 500 200" fill="none" stroke={activeFrameId === "B5" || activeFrameId === "B6" ? "#10b981" : "#475569"} strokeWidth="3" />
                  
                  {/* Outlet pipe header */}
                  <path d="M 500 200 L 700 200" fill="none" stroke="#10b981" strokeWidth="4" />

                  {/* Alarm Box Overlays */}
                  {activeFrameId === "B4" && (
                    <g transform="translate(480, 60)" className="animate-bounce">
                      <rect x="-80" y="-15" width="160" height="30" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" rx="4" />
                      <text x="0" y="4" fill="#f8fafc" className="font-mono text-[9px] font-bold" textAnchor="middle">▲ VIB LIMIT EXCEEDED (32.5mm/s)</text>
                    </g>
                  )}
                </g>
              )}

              {/* E. SYSTEM FOCUS: TELEMETRY & COMMS (C3, C4, C5, C6) */}
              {(activeFrameId.startsWith("C") && !activeFrameId.includes("1") && !activeFrameId.includes("2")) && (
                <g className="animate-fadeIn">
                  <text x="30" y="40" fill="#64748b" className="font-mono text-[10px] tracking-widest font-bold uppercase">COMMUNICATION & TELEMETRY SUB-DIAGRAM</text>

                  {/* Telemetry line drawing */}
                  <path d="M 80 200 L 320 200" fill="none" stroke={activeFrameId === "C3" ? "#38bdf8" : "#991b1b"} strokeWidth="4" strokeDasharray={activeFrameId === "C3" ? "none" : "5,5"} />
                  
                  {/* Riser tower */}
                  <rect x="320" y="100" width="10" height="200" fill="#334155" />
                  
                  {/* Heartbeat pulse circles */}
                  {activeFrameId === "C3" && (
                    <>
                      <circle cx="120" cy="200" r="5" fill="#38bdf8" className="animate-ping" />
                      <circle cx="200" cy="200" r="5" fill="#38bdf8" className="animate-ping" />
                    </>
                  )}

                  {/* Satellite network dish */}
                  <g transform="translate(325, 80)">
                    <path d="M -15 -10 A 15 15 0 0 0 15 -10" fill="none" stroke="#64748b" strokeWidth="3" />
                    <line x1="0" y1="-10" x2="0" y2="-25" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="0" cy="-25" r="3" fill={activeFrameId === "C3" ? "#10b981" : "#ef4444"} className="animate-pulse" />
                  </g>

                  {/* Control Center HUD readout */}
                  <g transform="translate(520, 200)">
                    <rect x="-100" y="-60" width="200" height="120" fill="url(#vesselGrad)" stroke={activeFrameId === "C3" ? "#38bdf8" : "#ef4444"} strokeWidth="2.5" rx="6" />
                    <text x="-80" y="-35" fill="#94a3b8" className="font-mono text-[8px] font-bold">DCS TELEMETRY LINK</text>
                    
                    <text x="-80" y="-10" fill="#f8fafc" className="font-mono text-[10px] font-bold">
                      LATENCY: {activeFrameId === "C3" ? "45 ms (OK)" : "4,850 ms (FAIL)"}
                    </text>
                    
                    <text x="-80" y="12" fill="#f8fafc" className="font-mono text-[10px] font-bold">
                      UMBILICAL PWR: {activeFrameId === "C3" ? "ACTIVE" : "DEAD"}
                    </text>
                    
                    <text x="-80" y="35" fill={activeFrameId === "C3" ? "#10b981" : "#ef4444"} className="font-mono text-[9px] font-bold">
                      STATUS: {activeFrameId === "C3" ? "✓ SECURE CHANNEL" : "⚠ COMMS DISCONNECTED"}
                    </text>
                  </g>
                </g>
              )}
            </svg>

            {/* Dynamic Floating HUD overlays */}
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 rounded p-2 text-[10px] font-mono space-y-1 text-slate-300">
              <div>TIME INDEX: {formatTime(simTime)}</div>
              <div>FOCUS: <span className="text-blue-400 font-bold">{currentFrame.focusArea}</span></div>
            </div>

            {/* Live tags small widget bottom left */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 gap-4 overflow-x-auto">
              <span className="text-blue-400 font-bold uppercase shrink-0">HUD Dynamic Signals:</span>
              <div className="flex gap-4">
                {currentFrame.expectedTags.map(tag => (
                  <span key={tag.name} className="flex gap-1 border border-slate-800 bg-slate-950 px-2 py-1 rounded">
                    <span className="text-slate-400">{tag.name}:</span>
                    <strong className="text-amber-400">{getDynamicValue(tag.name, tag.target, tag.current)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline & Speed control bars */}
          <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
            {/* Playback Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-lg text-white transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 shadow-sm' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play Scenario'}
              </button>
              
              <button
                onClick={() => setSimTime(0)}
                className="flex items-center justify-center border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-lg text-slate-600 dark:text-slate-300 transition-all bg-white dark:bg-slate-900"
                title="Reset Scenario Timeline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-2.5 outline-none font-medium"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="2">2.0x</option>
                <option value="4">4.0x</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none ml-2">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Auto-advance Frame
              </label>
            </div>

            {/* Timeline Scrub Slider */}
            <div className="flex items-center gap-3 w-full md:flex-1">
              <span className="text-[10px] font-mono font-bold text-slate-400">00:00</span>
              <input
                type="range"
                min="0"
                max="600"
                value={simTime}
                onChange={(e) => setSimTime(parseInt(e.target.value))}
                className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold text-slate-400">{formatTime(simTime)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Frame Narrative Detail box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-xs md:text-sm text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Scenario Technical Narrative & Execution Flow
            </h4>
            <span className="text-[9px] font-mono text-slate-400 uppercase">Interactive Asset Telemetry</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentFrame.narrative}
          </p>
        </div>
      </div>

      {/* 2. Right Column (Available Frames List & Handoff Specifications) */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        
        {/* Available Storyboard Panels list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
              <Tv className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Storyboard Frames (18)
            </h3>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[440px] space-y-4 scrollbar-thin">
            
            {/* Group A */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Scenario A: Cold Startup</span>
              {STORYBOARD_FRAMES.filter(f => f.id.startsWith("A")).map(frame => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameChange(frame.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-1.5 ${activeFrameId === frame.id ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30' : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">{frame.id}</span>
                      <span className="truncate">{frame.title}</span>
                    </div>
                  </div>
                  <Eye className={`w-3.5 h-3.5 shrink-0 ${activeFrameId === frame.id ? 'text-blue-500' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Group B */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Scenario B: Booster Trip</span>
              {STORYBOARD_FRAMES.filter(f => f.id.startsWith("B")).map(frame => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameChange(frame.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-1.5 ${activeFrameId === frame.id ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30' : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">{frame.id}</span>
                      <span className="truncate">{frame.title}</span>
                    </div>
                  </div>
                  <Eye className={`w-3.5 h-3.5 shrink-0 ${activeFrameId === frame.id ? 'text-blue-500' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Group C */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Scenario C: Comms Fault</span>
              {STORYBOARD_FRAMES.filter(f => f.id.startsWith("C")).map(frame => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameChange(frame.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-1.5 ${activeFrameId === frame.id ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30' : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">{frame.id}</span>
                      <span className="truncate">{frame.title}</span>
                    </div>
                  </div>
                  <Eye className={`w-3.5 h-3.5 shrink-0 ${activeFrameId === frame.id ? 'text-blue-500' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Handoff manifest specs actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm p-4 flex flex-col gap-3">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Storyboard Integration actions</span>
          
          <button
            onClick={copyManifest}
            className="w-full text-left p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-750 dark:text-slate-300 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5 text-blue-500" />
              Copy Scene Manifest
            </span>
            {copiedText ? (
              <span className="text-[10px] text-emerald-500 font-bold uppercase">Copied!</span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">JSON</span>
            )}
          </button>

          <button
            onClick={() => alert("All 18 Storyboard frames preloaded into the application memory successfully!")}
            className="w-full text-left p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-750 dark:text-slate-300 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Preload All Frames
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
}
