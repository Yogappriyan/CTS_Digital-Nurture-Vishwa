import React from 'react';
import { DigitalTwinComponentId } from '../../types';

interface SvgFallbackProps {
  selectedComponent: DigitalTwinComponentId;
  onSelectComponent: (id: DigitalTwinComponentId) => void;
}

export const MotorcycleSvgFallback: React.FC<SvgFallbackProps> = ({
  selectedComponent,
  onSelectComponent,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#0E1522]">
      <div className="absolute top-4 left-4 text-xs font-mono px-2.5 py-1 bg-slate-900 text-cyan-300 border border-slate-700 rounded-md shadow-sm">
        YAMAHA FZ-X 2D Blueprint Schematic
      </div>

      <svg
        viewBox="0 0 800 450"
        className="w-full max-w-2xl h-auto drop-shadow-xl select-none"
      >
        {/* Ground grid */}
        <line x1="50" y1="380" x2="750" y2="380" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

        {/* Rear Wheel (Wide Scrambler Block Tread) */}
        <g
          className="cursor-pointer transition-transform hover:opacity-90"
          onClick={() => onSelectComponent('wheel_bearing')}
        >
          <circle
            cx="200"
            cy="325"
            r="65"
            fill="#1E293B"
            stroke={selectedComponent === 'wheel_bearing' ? '#22D3EE' : '#475569'}
            strokeWidth={selectedComponent === 'wheel_bearing' ? '4' : '2'}
          />
          {/* 5-Spoke Split Alloy */}
          <circle cx="200" cy="325" r="45" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
          <circle cx="200" cy="325" r="28" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Drilled Disc & Hub */}
          <circle cx="200" cy="325" r="16" fill="#334155" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="200" cy="325" r="6" fill="#22D3EE" />
          <text x="135" y="415" fill="#94A3B8" fontSize="11" fontFamily="monospace">Rear 140/60-17 Hub</text>
        </g>

        {/* Front Wheel */}
        <g
          className="cursor-pointer transition-transform hover:opacity-90"
          onClick={() => onSelectComponent('wheel_bearing')}
        >
          <circle
            cx="600"
            cy="325"
            r="65"
            fill="#1E293B"
            stroke={selectedComponent === 'wheel_bearing' ? '#22D3EE' : '#475569'}
            strokeWidth={selectedComponent === 'wheel_bearing' ? '4' : '2'}
          />
          <circle cx="600" cy="325" r="45" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
          <circle cx="600" cy="325" r="32" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 2" />
          {/* Front Caliper */}
          <rect x="625" y="300" width="14" height="26" rx="3" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="600" cy="325" r="8" fill="#22D3EE" />
          <text x="540" y="415" fill="#94A3B8" fontSize="11" fontFamily="monospace">Front 282mm Disc & Bearing</text>
        </g>

        {/* Front Telescopic Fork with Rubber Gaiters */}
        <line x1="600" y1="325" x2="520" y2="150" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
        {/* Rubber Gaiter Accordion Rings */}
        <line x1="575" y1="270" x2="550" y2="215" stroke="#1E293B" strokeWidth="12" strokeDasharray="4 3" />

        {/* FZ-X Round LED Projector Headlamp with DRL Halo */}
        <circle cx="538" cy="170" r="16" fill="#0F172A" stroke="#22D3EE" strokeWidth="3" />
        <circle cx="538" cy="170" r="8" fill="#38BDF8" />
        <circle cx="538" cy="170" r="4" fill="#FFFFFF" />

        {/* High Scrambler Handlebar & Round Mirrors */}
        <line x1="515" y1="140" x2="490" y2="115" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="478" cy="100" r="7" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />

        {/* Diamond Tubular Chassis Frame */}
        <path
          d="M200 325 L340 280 L400 190 L520 150"
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M340 280 L410 320 L480 300 L500 190"
          fill="none"
          stroke="#1E293B"
          strokeWidth="6"
        />

        {/* Sculpted FZ-X Fuel Tank with Signature Aluminum Side Shroud Gills */}
        <path
          d="M380 185 C420 160, 500 165, 520 195 L490 235 L390 230 Z"
          fill="#0284C7"
          stroke="#38BDF8"
          strokeWidth="2.5"
        />
        {/* Brushed Aluminum Side Shroud / Gill */}
        <rect x="440" y="195" width="45" height="24" rx="4" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="450" y1="202" x2="475" y2="202" stroke="#1E293B" strokeWidth="2" />
        <line x1="450" y1="210" x2="475" y2="210" stroke="#1E293B" strokeWidth="2" />

        {/* FZ-X Ribbed Tuck-and-Roll Scrambler Bench Seat */}
        <path
          d="M260 215 C300 205, 360 205, 390 215 L380 238 L270 238 Z"
          fill="#1E2430"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Horizontal stitch ribs */}
        <line x1="290" y1="214" x2="295" y2="236" stroke="#334155" strokeWidth="2" />
        <line x1="315" y1="210" x2="320" y2="236" stroke="#334155" strokeWidth="2" />
        <line x1="340" y1="209" x2="345" y2="236" stroke="#334155" strokeWidth="2" />
        <line x1="365" y1="212" x2="370" y2="236" stroke="#334155" strokeWidth="2" />

        {/* Pillion Grab Rail */}
        <line x1="250" y1="220" x2="265" y2="238" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

        {/* YAMAHA 149cc SOHC Engine (Interactive) */}
        <g
          className="cursor-pointer transition-transform hover:opacity-90"
          onClick={() => onSelectComponent('engine')}
        >
          <rect
            x="360"
            y="250"
            width="110"
            height="90"
            rx="8"
            fill={selectedComponent === 'engine' ? '#0E7490' : '#181C22'}
            stroke={selectedComponent === 'engine' ? '#22D3EE' : '#64748B'}
            strokeWidth={selectedComponent === 'engine' ? '3' : '2'}
          />
          {/* Milled Cooling Fins */}
          <line x1="375" y1="265" x2="455" y2="265" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="375" y1="278" x2="455" y2="278" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="375" y1="291" x2="455" y2="291" stroke="#CBD5E1" strokeWidth="2.5" />
          <line x1="375" y1="304" x2="455" y2="304" stroke="#CBD5E1" strokeWidth="2.5" />
          {/* Circular Clutch Casing Boss */}
          <circle cx="435" cy="320" r="14" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="375" y="328" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">149cc SOHC</text>
        </g>

        {/* Drive Chain & Sprockets (Interactive) */}
        <g
          className="cursor-pointer transition-transform hover:opacity-90"
          onClick={() => onSelectComponent('chain_sprocket')}
        >
          <circle
            cx="200"
            cy="325"
            r="24"
            fill="#0F172A"
            stroke={selectedComponent === 'chain_sprocket' ? '#F59E0B' : '#64748B'}
            strokeWidth={selectedComponent === 'chain_sprocket' ? '3' : '2'}
          />
          <line
            x1="200"
            y1="305"
            x2="370"
            y2="315"
            stroke={selectedComponent === 'chain_sprocket' ? '#F59E0B' : '#64748B'}
            strokeWidth={selectedComponent === 'chain_sprocket' ? '4' : '2'}
            strokeDasharray="4 2"
          />
          <line
            x1="200"
            y1="345"
            x2="370"
            y2="335"
            stroke={selectedComponent === 'chain_sprocket' ? '#F59E0B' : '#64748B'}
            strokeWidth={selectedComponent === 'chain_sprocket' ? '4' : '2'}
            strokeDasharray="4 2"
          />
          <text x="230" y="365" fill={selectedComponent === 'chain_sprocket' ? '#F59E0B' : '#94A3B8'} fontSize="11" fontFamily="monospace">
            Chain & Sprockets
          </text>
        </g>

        {/* Swept Exhaust & Scrambler Muffler (Interactive) */}
        <g
          className="cursor-pointer transition-transform hover:opacity-90"
          onClick={() => onSelectComponent('exhaust')}
        >
          {/* Curving Header Pipe */}
          <path
            d="M455 265 C485 285, 470 350, 420 355 L320 355 L210 335"
            fill="none"
            stroke={selectedComponent === 'exhaust' ? '#22D3EE' : '#94A3B8'}
            strokeWidth={selectedComponent === 'exhaust' ? '7' : '5'}
            strokeLinecap="round"
          />
          {/* Megaphone Canister with Heat Guard */}
          <rect
            x="190"
            y="322"
            width="85"
            height="22"
            rx="4"
            fill={selectedComponent === 'exhaust' ? '#0891B2' : '#1E293B'}
            stroke={selectedComponent === 'exhaust' ? '#22D3EE' : '#64748B'}
            strokeWidth="2"
          />
          <rect x="210" y="325" width="45" height="12" rx="2" fill="#CBD5E1" />
          <text x="175" y="310" fill={selectedComponent === 'exhaust' ? '#22D3EE' : '#94A3B8'} fontSize="11" fontFamily="monospace">
            Scrambler Exhaust
          </text>
        </g>
      </svg>
    </div>
  );
};
