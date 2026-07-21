import { useState, useEffect } from 'react';

interface VisualizerProps {
  tags: Record<string, number | string>;
  onTagClick: (tagName: string) => void;
}

export default function IsometricVisualizer({ tags, onTagClick }: VisualizerProps) {
  const [helicopterPos, setHelicopterPos] = useState({ x: 450, y: 40 });
  const [boatPos, setBoatPos] = useState({ x: 80, y: 250 });
  const [waveOffset, setWaveOffset] = useState(0);

  // Read simulator values
  const sepLevel = Number(tags.SEP_LEVEL) || 0;
  const pgcRpm = Number(tags.PGC_RPM) || 0;
  const boosterRpm = Math.max(Number(tags.BOOST_PUMP_A_RPM) || 0, Number(tags.BOOST_PUMP_B_RPM) || 0);
  const flareFlow = Number(tags.SEP_OUT_GAS_FLOW) || 0;
  const isPowerOn = Number(tags.GEN1_STATUS) === 1;
  const isSubseaPowerOn = Number(tags.SUBSEA_POWER_STATUS) === 1;
  const flowSpeed = boosterRpm > 0 ? (boosterRpm / 2950) * 20 : 0;

  // Simple animations
  useEffect(() => {
    let frameId: number;
    let tick = 0;

    const animate = () => {
      tick += 1;
      setWaveOffset((tick * 0.5) % 40);

      // Helicopter circular hovering path around the complex helideck (at 450, 40)
      const angle = tick * 0.02;
      const radius = isPowerOn ? 10 + 5 * Math.sin(angle) : 0; // stop moving if dead
      setHelicopterPos({
        x: 460 + Math.cos(angle) * radius,
        y: 65 + Math.sin(angle * 2) * (radius * 0.3),
      });

      // Supply boat bobbing up and down
      setBoatPos({
        x: 90 + Math.cos(tick * 0.01) * 3,
        y: 260 + Math.sin(tick * 0.03) * 2,
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPowerOn]);

  // Determine colors based on status/ranges
  const getTagStatusColor = (val: number, min: number, max: number) => {
    if (val < min || val > max) return 'text-red-500 bg-red-100 dark:bg-red-950/40 border-red-500 animate-pulse';
    if (val > max * 0.85 || val < min * 1.15) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/40 border-yellow-500';
    return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-500';
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 p-4 text-white shadow-inner select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">
            Interactive Dynamic 2D Flowsheet & Asset Visualization
          </h3>
        </div>
        <div className="flex space-x-4 text-xs font-mono text-slate-400">
          <span>COMPLEX GRID: <strong className={isPowerOn ? 'text-emerald-400' : 'text-red-400'}>{isPowerOn ? '13.8kV ONLINE' : 'BLACKOUT'}</strong></span>
          <span>SUBSEA COMM: <strong className={isSubseaPowerOn ? 'text-emerald-400' : 'text-red-400'}>{isSubseaPowerOn ? 'ACTIVE' : 'FAULT'}</strong></span>
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full min-h-[400px]">
        {/* SVG Drawing Canvas representing the full Process Platform, Bridge, Wellheads */}
        <svg viewBox="0 0 600 340" className="w-full h-full">
          {/* Defs for gradients, patterns, and dash patterns */}
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>
            <linearGradient id="flareGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFFF00" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Ocean */}
          <rect width="600" height="340" fill="url(#oceanGrad)" rx="8" />

          {/* Dynamic Ocean Wave Patterns */}
          <g opacity="0.15">
            <path d={`M 0 300 Q 50 ${300 + Math.sin(waveOffset/4)*3} 100 300 T 200 300 T 300 300 T 400 300 T 500 300 T 600 300`} fill="none" stroke="#3A86C8" strokeWidth="2" />
            <path d={`M 0 315 Q 50 ${315 - Math.sin(waveOffset/4)*3} 100 315 T 200 315 T 300 315 T 400 315 T 500 315 T 600 315`} fill="none" stroke="#3A86C8" strokeWidth="1.5" />
          </g>

          {/* Subsea pipelines & cables (flowing/glowing) */}
          <g>
            {/* Subsea Cable from Wellhead to Process Complex */}
            <path d="M 120 280 L 320 180" fill="none" stroke={isSubseaPowerOn ? "#4CC9F0" : "#555555"} strokeWidth="2.5" strokeDasharray={isSubseaPowerOn ? "4 4" : "none"} className={isSubseaPowerOn ? "animate-[dash_10s_linear_infinite]" : ""} opacity="0.6" />
            {/* Subsea Oil Pipeline from Wellhead to separation platform */}
            <path d="M 120 275 L 320 170" fill="none" stroke="#f77f00" strokeWidth="3" strokeDasharray="6 6" strokeDashoffset={-flowSpeed} opacity="0.7" />
          </g>

          {/* Unmanned Wellhead Platform (UWP-A) Structure (Left) */}
          <g id="wellhead_platform" className="cursor-pointer" onClick={() => onTagClick('WELL1_CHOKE_VALVE')}>
            {/* Jacket legs */}
            <line x1="110" y1="280" x2="100" y2="305" stroke="#4a5568" strokeWidth="3" />
            <line x1="130" y1="280" x2="140" y2="305" stroke="#4a5568" strokeWidth="3" />
            <line x1="120" y1="280" x2="120" y2="305" stroke="#2d3748" strokeWidth="2" />
            <line x1="100" y1="305" x2="140" y2="305" stroke="#1a202c" strokeWidth="4" /> {/* sea mud line */}

            {/* Platform decks */}
            <rect x="100" y="260" width="40" height="20" rx="2" fill="#718096" stroke="#4a5568" strokeWidth="1" />
            <rect x="105" y="248" width="30" height="12" fill="#a0aec0" opacity="0.9" />

            {/* Well Trees symbols */}
            <circle cx="112" cy="254" r="3" fill={Number(tags.WELL1_STATUS) === 1 ? "#10B981" : "#EF4444"} />
            <circle cx="128" cy="254" r="3" fill={Number(tags.WELL2_STATUS) === 1 ? "#10B981" : "#EF4444"} />

            {/* Text Label */}
            <text x="120" y="238" fill="#e2e8f0" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">UWP-A WELLS</text>
          </g>

          {/* Bridge Connecting Separation Platform to Utility Platform */}
          <g id="bridge_structure">
            <rect x="360" y="145" width="80" height="8" fill="#4a5568" rx="1" opacity="0.8" />
            <line x1="360" y1="149" x2="440" y2="149" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
            {/* Flow line across the bridge */}
            <path d="M 360 147 L 440 147" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" strokeDashoffset={-flowSpeed * 1.5} />
            <text x="400" y="141" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">UTILITY BRIDGE</text>
          </g>

          {/* Central Process topside separation Platform (Center-Left) */}
          <g id="process_platform" className="cursor-pointer" onClick={() => onTagClick('SEP_LEVEL')}>
            {/* Jacket legs */}
            <line x1="280" y1="160" x2="260" y2="230" stroke="#4a5568" strokeWidth="4" />
            <line x1="360" y1="160" x2="380" y2="230" stroke="#4a5568" strokeWidth="4" />
            <line x1="320" y1="160" x2="320" y2="230" stroke="#2d3748" strokeWidth="3" />

            {/* Decks */}
            <rect x="260" y="140" width="110" height="25" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <rect x="275" y="115" width="80" height="25" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />

            {/* Separator Vessel V-101 */}
            <rect x="285" y="120" width="45" height="15" rx="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <text x="307" y="130" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V-101 SEP</text>

            {/* Separator Level Liquid Bar representation inside V-101 */}
            <rect x="290" y="128" width="35" height="4" fill="#0f172a" rx="1" />
            <rect x="290" y="128" width={(sepLevel / 100) * 35} height="4" fill="#f59e0b" rx="1" />

            {/* Flare Stack Frame */}
            <line x1="265" y1="140" x2="220" y2="60" stroke="#64748b" strokeWidth="3" />
            <line x1="262" y1="140" x2="220" y2="60" stroke="#94a3b8" strokeWidth="1" />

            {/* Dynamic flare stack flame animation */}
            {flareFlow > 0 && (
              <ellipse
                cx="218"
                cy={60 - Math.min(25, flareFlow * 0.08)}
                rx={Math.min(10, flareFlow * 0.04)}
                ry={Math.min(18, flareFlow * 0.09)}
                fill="url(#flareGrad)"
                opacity="0.85"
                className="animate-pulse"
              />
            )}

            <text x="315" y="105" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PROCESS TOPSIDES</text>
          </g>

          {/* Bridge Utility Platform (Right) */}
          <g id="utility_platform" className="cursor-pointer" onClick={() => onTagClick('PGC_RPM')}>
            {/* Jacket legs */}
            <line x1="440" y1="160" x2="420" y2="230" stroke="#4a5568" strokeWidth="4" />
            <line x1="520" y1="160" x2="540" y2="230" stroke="#4a5568" strokeWidth="4" />

            {/* Decks */}
            <rect x="430" y="140" width="100" height="25" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <rect x="445" y="115" width="75" height="25" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />

            {/* PGC Compressor icon - rotating line when RPM > 0 */}
            <circle cx="465" cy="127" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <line
              x1="465"
              y1="127"
              x2={465 + 6 * Math.cos(pgcRpm * 0.005)}
              y2={127 + 6 * Math.sin(pgcRpm * 0.005)}
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <text x="465" y="139" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">PGC</text>

            {/* Turbogenerator / Power icon */}
            <rect x="495" y="121" width="18" height="12" fill="#1e293b" stroke={isPowerOn ? "#10B981" : "#EF4444"} strokeWidth="1.5" />
            <text x="504" y="129" fill={isPowerOn ? "#10B981" : "#EF4444"} fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GEN</text>

            {/* Helideck on Utility Platform */}
            <polygon points="500,115 540,115 530,100 510,100" fill="#475569" stroke="#94a3b8" />
            <circle cx="520" cy="108" r="6" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <text x="520" y="110" fill="#e2e8f0" fontSize="7" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">H</text>

            <text x="480" y="94" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">UTILITIES & PGC</text>
          </g>

          {/* Animated Helicopter hovering or landing on Helideck */}
          <g transform={`translate(${helicopterPos.x}, ${helicopterPos.y})`}>
            {/* Rotor blade rotating animation if power is online */}
            <ellipse cx="0" cy="-6" rx={isPowerOn ? 12 : 6} ry="1.5" fill="#cbd5e1" opacity="0.6" className={isPowerOn ? "animate-[pulse_0.1s_infinite]" : ""} />
            {/* Helicopter Body */}
            <rect x="-8" y="-4" width="16" height="7" rx="3" fill="#3b82f6" />
            {/* Tail */}
            <rect x="-14" y="-2" width="8" height="2" fill="#2563eb" />
            <line x1="-14" y1="-2" x2="-14" y2="-6" stroke="#1d4ed8" strokeWidth="1" />
            {/* Landing skids */}
            <line x1="-6" y1="4" x2="6" y2="4" stroke="#475569" strokeWidth="1.5" />
            <line x1="-4" y1="3" x2="-4" y2="4" stroke="#475569" strokeWidth="1" />
            <line x1="4" y1="3" x2="4" y2="4" stroke="#475569" strokeWidth="1" />
            <text x="0" y="12" fill="#93c5fd" fontSize="5" fontFamily="monospace" textAnchor="middle">RESCUE-01</text>
          </g>

          {/* Offshore Supply Vessel bobbing next to the Separation Platform */}
          <g transform={`translate(${boatPos.x}, ${boatPos.y})`}>
            {/* Hull */}
            <path d="M 0 5 L 28 5 L 24 12 L 4 12 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            {/* Cabin */}
            <rect x="6" y="0" width="10" height="5" fill="#f8fafc" />
            <rect x="16" y="2" width="6" height="3" fill="#f8fafc" />
            <circle cx="9" cy="2.5" r="1" fill="#0284c7" />
            {/* Mast */}
            <line x1="11" y1="0" x2="11" y2="-5" stroke="#475569" strokeWidth="1" />
            <text x="12" y="19" fill="#fca5a5" fontSize="5" fontFamily="monospace" textAnchor="middle">OSV PACIFIC</text>
          </g>

          {/* Subsea Pipeline Flow Arrows overlay */}
          <g>
            <path d="M 120 275 L 320 170" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 20" strokeDashoffset={-flowSpeed * 1.2} />
          </g>
        </svg>

        {/* Dynamic Tag Overlay Floating Badge Cards */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 max-w-xs font-mono">
          <div
            onClick={() => onTagClick('SEP_LEVEL')}
            className={`cursor-pointer rounded border p-2 text-[10px] transition shadow-md backdrop-blur-sm ${getTagStatusColor(sepLevel, 30, 60)}`}
          >
            <div>V-101 Liquid Level</div>
            <div className="text-sm font-bold">{sepLevel.toFixed(1)} %</div>
          </div>

          <div
            onClick={() => onTagClick('INLET_PRESS')}
            className={`cursor-pointer rounded border p-2 text-[10px] transition shadow-md backdrop-blur-sm ${getTagStatusColor(Number(tags.INLET_PRESS) || 0, 30, 55)}`}
          >
            <div>Platform Inlet Pressure</div>
            <div className="text-sm font-bold">{(Number(tags.INLET_PRESS) || 0).toFixed(1)} barg</div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col space-y-2 max-w-xs font-mono">
          <div
            onClick={() => onTagClick('PGC_RPM')}
            className={`cursor-pointer rounded border p-2 text-[10px] transition shadow-md backdrop-blur-sm ${getTagStatusColor(pgcRpm, 6000, 10500)}`}
          >
            <div>PGC Compressor speed</div>
            <div className="text-sm font-bold">{pgcRpm.toLocaleString()} RPM</div>
          </div>

          <div
            onClick={() => onTagClick('GEN1_POWER')}
            className={`cursor-pointer rounded border p-2 text-[10px] transition shadow-md backdrop-blur-sm ${getTagStatusColor(Number(tags.GEN1_POWER) || 0, 8, 20)}`}
          >
            <div>Turbogenerator 1 Load</div>
            <div className="text-sm font-bold">{(Number(tags.GEN1_POWER) || 0).toFixed(1)} MW</div>
          </div>
        </div>

        {/* Offshore Platform State Footer */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex space-x-3">
            <span>BOOSTER RPM: <strong className={boosterRpm > 0 ? "text-cyan-400" : "text-slate-500"}>{boosterRpm}</strong></span>
            <span>SEP GAS FLOW: <strong className={flareFlow > 0 ? "text-amber-400" : "text-slate-500"}>{flareFlow.toFixed(1)} kNm3/h</strong></span>
          </div>
          <div>
            <span>SYSTEM VOLTAGE: <strong className={isPowerOn ? "text-emerald-400" : "text-red-400"}>{(Number(tags.BUS_VOLTAGE) || 0).toFixed(1)} kV</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
