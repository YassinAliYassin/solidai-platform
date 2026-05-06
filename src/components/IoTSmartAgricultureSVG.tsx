import React from 'react';

export default function IoTSmartAgricultureSVG() {
  return (
    <svg viewBox="0 0 800 400" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F7FA" />
        </linearGradient>
        <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8BC34A" />
          <stop offset="100%" stopColor="#689F38" />
        </linearGradient>
        <linearGradient id="solar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
      </defs>
      
      {/* Sky */}
      <rect width="800" height="400" fill="url(#sky)" />
      
      {/* Sun */}
      <circle cx="700" cy="80" r="40" fill="#FFEB3B" opacity="0.9" />
      <circle cx="700" cy="80" r="50" fill="#FFEB3B" opacity="0.3" />
      
      {/* Clouds */}
      <ellipse cx="200" cy="60" rx="60" ry="25" fill="white" opacity="0.8" />
      <ellipse cx="230" cy="55" rx="50" ry="20" fill="white" opacity="0.8" />
      <ellipse cx="600" cy="90" rx="45" ry="20" fill="white" opacity="0.7" />
      
      {/* Ground */}
      <rect y="250" width="800" height="150" fill="url(#ground)" />
      
      {/* Farm rows */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={i * 140} y="260" width="100" height="8" fill="#558B2F" opacity="0.6" />
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={i * 140 + 20} y="280" width="100" height="8" fill="#558B2F" opacity="0.6" />
      ))}
      
      {/* IoT Sensors in ground */}
      {[100, 300, 500, 700].map((x, i) => (
        <g key={i}>
          <rect x={x-5} y="295" width="10" height="15" fill="#37474F" rx="2" />
          <circle cx={x} cy="290" r="8" fill="#4CAF50" />
          <circle cx={x} cy="290" r="4" fill="#81C784" />
        </g>
      ))}
      
      {/* Solar Panel */}
      <rect x="50" y="220" width="60" height="30" fill="url(#solar)" rx="3" />
      <rect x="55" y="225" width="50" height="20" fill="#FFF9C4" opacity="0.6" />
      <line x1="80" y1="220" x2="80" y2="190" stroke="#795548" strokeWidth="3" />
      
      {/* Drone */}
      <g transform="translate(400, 180)">
        <ellipse cx="0" cy="0" rx="30" ry="10" fill="#455A64" />
        <rect x="-25" y="-5" width="50" height="10" fill="#546E7A" rx="5" />
        <circle cx="-20" cy="0" r="8" fill="#263238" />
        <circle cx="20" cy="0" r="8" fill="#263238" />
        <circle cx="0" cy="-8" r="5" fill="#29B6F6" />
        <line x1="0" y1="-8" x2="0" y2="-25" stroke="#29B6F6" strokeWidth="2" />
        <circle cx="0" cy="-25" r="3" fill="#29B6F6" />
      </g>
      
      {/* Data connection lines */}
      <line x1="100" y1="290" x2="400" y2="180" stroke="#4CAF50" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="300" y1="290" x2="400" y2="180" stroke="#4CAF50" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="500" y1="290" x2="400" y2="180" stroke="#4CAF50" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
      </line>
      
      {/* Data dashboard overlay */}
      <rect x="580" y="120" width="180" height="100" fill="rgba(0,0,0,0.7)" rx="8" />
      <text x="590" y="140" fill="#4CAF50" fontSize="12" fontFamily="monospace">IOT MONITOR</text>
      <text x="590" y="160" fill="white" fontSize="10" fontFamily="monospace">Soil: 68% moisture</text>
      <text x="590" y="175" fill="white" fontSize="10" fontFamily="monospace">Temp: 24.5°C</text>
      <text x="590" y="190" fill="white" fontSize="10" fontFamily="monospace">Crops: Healthy</text>
      <text x="590" y="205" fill="#4CAF50" fontSize="10" fontFamily="monospace">● 500+ farms</text>
      
      {/* Trees */}
      <circle cx="750" cy="240" r="20" fill="#2E7D32" />
      <rect x="745" y="240" width="10" height="20" fill="#5D4037" />
      <circle cx="770" cy="235" r="15" fill="#388E3C" />
      
      {/* Title overlay */}
      <rect x="0" y="320" width="800" height="80" fill="rgba(0,0,0,0.5)" />
      <text x="400" y="355" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">IoT Smart Agriculture Network</text>
      <text x="400" y="380" fill="#4CAF50" fontSize="14" textAnchor="middle" fontFamily="sans-serif">500+ Farms Connected • Real-time Monitoring</text>
    </svg>
  );
}
