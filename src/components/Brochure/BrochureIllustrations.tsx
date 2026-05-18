import type { CSSProperties } from 'react';

type IllustrationProps = {
  className?: string;
  style?: CSSProperties;
};

const stroke = '#2A2C33';
const accent = '#E08805';
const muted = '#9ca3af';

/** Stick figure overwhelmed by flying documents — brochure page 1 / chaos */
export function ChaosDocumentsIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* flying papers */}
      {[
        { x: 40, y: 30, r: -25 },
        { x: 300, y: 50, r: 15 },
        { x: 320, y: 120, r: -10 },
        { x: 60, y: 140, r: 20 },
        { x: 180, y: 20, r: -15 },
        { x: 250, y: 180, r: 30 },
        { x: 100, y: 200, r: -20 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.r})`}>
          <rect
            x="0"
            y="0"
            width="48"
            height="60"
            rx="2"
            fill="white"
            stroke={stroke}
            strokeWidth="1.5"
          />
          <line x1="8" y1="14" x2="40" y2="14" stroke={muted} strokeWidth="1.2" />
          <line x1="8" y1="24" x2="36" y2="24" stroke={muted} strokeWidth="1.2" />
          <line x1="8" y1="34" x2="32" y2="34" stroke={muted} strokeWidth="1.2" />
        </g>
      ))}
      {/* stick figure — stressed */}
      <circle cx="200" cy="130" r="22" stroke={stroke} strokeWidth="2.5" fill="white" />
      <path
        d="M200 152 L200 220 M200 185 L160 210 M200 185 L240 210 M200 220 L175 270 M200 220 L225 270"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* spiral stress lines */}
      <path
        d="M155 95 Q145 80 160 75 M245 95 Q255 80 240 75"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* ground document — the one that started it */}
      <rect
        x="175"
        y="275"
        width="50"
        height="35"
        rx="2"
        fill={accent}
        fillOpacity="0.15"
        stroke={accent}
        strokeWidth="2"
      />
    </svg>
  );
}

/** Scanner vs real digitization — brochure flow */
export function ScanningVsDigitalIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* left: scanner */}
      <rect x="30" y="80" width="140" height="100" rx="8" stroke={muted} strokeWidth="2" fill="#f3f4f6" />
      <rect x="50" y="100" width="100" height="8" rx="2" fill={muted} fillOpacity="0.4" />
      <rect x="50" y="115" width="80" height="6" rx="2" fill={muted} fillOpacity="0.3" />
      <text x="100" y="210" textAnchor="middle" fill={muted} fontSize="13" fontFamily="system-ui">
        PDF
      </text>
      <line x1="100" y1="185" x2="100" y2="200" stroke={muted} strokeWidth="1.5" strokeDasharray="4 3" />
      {/* X mark — not enough */}
      <circle cx="100" cy="240" r="18" stroke="#ef4444" strokeWidth="2" fill="none" />
      <line x1="90" y1="230" x2="110" y2="250" stroke="#ef4444" strokeWidth="2" />
      <line x1="110" y1="230" x2="90" y2="250" stroke="#ef4444" strokeWidth="2" />

      {/* arrow */}
      <path d="M185 140 L215 140" stroke={accent} strokeWidth="2.5" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={accent} />
        </marker>
      </defs>

      {/* right: connected nodes */}
      <circle cx="300" cy="100" r="28" stroke={accent} strokeWidth="2" fill="white" />
      <circle cx="260" cy="160" r="22" stroke={stroke} strokeWidth="1.5" fill="white" />
      <circle cx="340" cy="160" r="22" stroke={stroke} strokeWidth="1.5" fill="white" />
      <circle cx="300" cy="210" r="22" stroke={stroke} strokeWidth="1.5" fill="white" />
      <line x1="300" y1="128" x2="275" y2="145" stroke={accent} strokeWidth="1.5" />
      <line x1="300" y1="128" x2="325" y2="145" stroke={accent} strokeWidth="1.5" />
      <line x1="275" y1="175" x2="290" y2="192" stroke={accent} strokeWidth="1.5" />
      <line x1="325" y1="175" x2="310" y2="192" stroke={accent} strokeWidth="1.5" />
      <circle cx="300" cy="100" r="8" fill={accent} />
      {/* checkmark */}
      <circle cx="300" cy="250" r="18" stroke="#059669" strokeWidth="2" fill="none" />
      <path d="M290 250 L297 257 L312 242" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Person relaxed — platform works without them */
export function ForYouIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* dashboard screen */}
      <rect x="220" y="60" width="150" height="110" rx="8" stroke={stroke} strokeWidth="2" fill="white" />
      <rect x="235" y="75" width="120" height="12" rx="3" fill={accent} fillOpacity="0.3" />
      <rect x="235" y="95" width="90" height="8" rx="2" fill={muted} fillOpacity="0.4" />
      <rect x="235" y="110" width="100" height="8" rx="2" fill={muted} fillOpacity="0.4" />
      <path d="M235 135 L355 135" stroke={accent} strokeWidth="2" />
      <circle cx="280" cy="150" r="4" fill={accent} />
      <circle cx="310" cy="145" r="4" fill={accent} />
      <circle cx="340" cy="140" r="4" fill="#059669" />
      {/* stick figure — relaxed */}
      <circle cx="120" cy="120" r="24" stroke={stroke} strokeWidth="2.5" fill="white" />
      <path
        d="M96 108 Q120 100 144 108"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M120 144 L120 210 M120 175 L85 200 M120 175 L155 200 M120 210 L95 260 M120 210 L145 260"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* connection beam */}
      <path
        d="M155 150 Q190 130 220 120"
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="6 4"
        fill="none"
      />
    </svg>
  );
}

/** Handshake — transparency & trust */
export function HandshakeIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* left figure */}
      <circle cx="130" cy="90" r="22" stroke={stroke} strokeWidth="2.5" fill="white" />
      <path
        d="M130 112 L130 170 M130 140 L95 165 M130 140 L165 130"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M130 170 L110 230 M130 170 L150 230" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {/* right figure */}
      <circle cx="270" cy="90" r="22" stroke={stroke} strokeWidth="2.5" fill="white" />
      <path
        d="M270 112 L270 170 M270 140 L235 130 M270 140 L305 165"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M270 170 L250 230 M270 170 L290 230" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {/* handshake */}
      <path
        d="M165 130 Q200 145 235 130"
        stroke={accent}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="175" y="125" width="50" height="20" rx="4" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1" />
    </svg>
  );
}

/** Growth chart — trust to growth */
export function GrowthChartIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {/* easel / board */}
      <rect x="180" y="50" width="160" height="130" rx="4" stroke={stroke} strokeWidth="2" fill="white" />
      <line x1="200" y1="160" x2="320" y2="160" stroke={muted} strokeWidth="1.5" />
      <line x1="200" y1="70" x2="200" y2="160" stroke={muted} strokeWidth="1.5" />
      {/* upward trend */}
      <path
        d="M210 150 L240 130 L270 120 L300 85"
        stroke={accent}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="300" cy="85" r="5" fill={accent} />
      {/* stick figure pointing */}
      <circle cx="100" cy="110" r="22" stroke={stroke} strokeWidth="2.5" fill="white" />
      <path
        d="M100 132 L100 200 M100 165 L70 145 M100 165 L130 145 M100 200 L80 250 M100 200 L120 250"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M130 145 L175 100" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Supply chain nodes — traceability */
export function SupplyChainIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {[
        { cx: 80, cy: 140, label: 'Farm' },
        { cx: 160, cy: 80, label: 'Process' },
        { cx: 240, cy: 140, label: 'Plant' },
        { cx: 320, cy: 80, label: 'Market' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r="32" stroke={i === 0 ? accent : stroke} strokeWidth="2" fill="white" />
          <circle cx={n.cx} cy={n.cy} r="8" fill={i === 0 ? accent : muted} fillOpacity={i === 0 ? 1 : 0.5} />
        </g>
      ))}
      <path
        d="M112 130 L140 95 M192 95 L220 130 M272 130 L300 95"
        stroke={accent}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#scArrow)"
      />
      <defs>
        <marker id="scArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={accent} />
        </marker>
      </defs>
      {/* globe hint */}
      <circle cx="200" cy="220" r="40" stroke={stroke} strokeWidth="1.5" fill="none" strokeOpacity="0.3" />
      <ellipse cx="200" cy="220" rx="40" ry="14" stroke={stroke} strokeWidth="1" fill="none" strokeOpacity="0.2" />
      <line x1="160" y1="220" x2="240" y2="220" stroke={stroke} strokeWidth="1" strokeOpacity="0.2" />
    </svg>
  );
}

/** Order / dashboard — final state */
export function OrderDashboardIllustration({ className, style }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <rect x="40" y="30" width="320" height="200" rx="12" stroke={stroke} strokeWidth="2" fill="white" />
      <rect x="55" y="45" width="80" height="170" rx="6" fill="#f3f4f6" />
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x="65" y={60 + i * 28} width="60" height="18" rx="3" fill={i === 0 ? accent : 'white'} fillOpacity={i === 0 ? 0.25 : 1} stroke={stroke} strokeWidth="1" strokeOpacity="0.3" />
      ))}
      <rect x="150" y="45" width="195" height="40" rx="6" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1" />
      <rect x="150" y="95" width="195" height="55" rx="6" stroke={stroke} strokeWidth="1" fill="none" strokeOpacity="0.3" />
      <path d="M165 125 L320 125" stroke={accent} strokeWidth="2" />
      <circle cx="200" cy="122" r="4" fill={accent} />
      <circle cx="250" cy="115" r="4" fill={accent} />
      <circle cx="290" cy="108" r="4" fill="#059669" />
      <rect x="150" y="160" width="90" height="55" rx="6" stroke={stroke} strokeWidth="1" fill="none" strokeOpacity="0.3" />
      <rect x="255" y="160" width="90" height="55" rx="6" stroke={stroke} strokeWidth="1" fill="none" strokeOpacity="0.3" />
    </svg>
  );
}
