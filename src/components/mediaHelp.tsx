import { useEffect, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IoIosHelpCircleOutline } from 'react-icons/io';

// Small looping 2D animations (SVG/SMIL, no image files) that show staff what to do
// for each mic / media warning. Click a warning pill to open its help card.

const LOOP = { dur: '4s', repeatCount: 'indefinite' } as const;

const TransmitterScene = () => (
  <svg viewBox="0 0 200 110" className="block h-auto w-full">
    <line x1="82" y1="18" x2="82" y2="6" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
    <g fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0">
      <path d="M88 2 Q94 8 88 14" />
      <path d="M94 -1 Q102 8 94 17" />
      <animate attributeName="opacity" values="0;0;1;0.3;1" keyTimes="0;0.55;0.65;0.8;1" {...LOOP} />
    </g>
    <rect x="68" y="16" width="54" height="82" rx="9" fill="#334155" />
    <circle cx="80" cy="30" r="4.5" fill="#ef4444">
      <animate attributeName="fill" values="#ef4444;#ef4444;#22c55e;#22c55e" keyTimes="0;0.5;0.52;1" {...LOOP} />
    </circle>
    {/* power switch */}
    <rect x="123" y="28" width="9" height="26" rx="3" fill="#94a3b8" />
    <rect x="123.5" y="45" width="8" height="8" rx="2" fill="#f8fafc">
      <animate attributeName="y" values="45;45;29;29" keyTimes="0;0.4;0.5;1" {...LOOP} />
    </rect>
    <text x="136" y="33" fontSize="7" fill="#22c55e">ON</text>
    <text x="136" y="54" fontSize="7" fill="#94a3b8">OFF</text>
    <path d="M162 41 l-9 -5 v10z" fill="#f59e0b" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.3;0.32;0.45;0.47;1" {...LOOP} />
    </path>
    {/* battery charging */}
    <rect x="78" y="58" width="32" height="18" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="2" />
    <rect x="110" y="63" width="3" height="8" rx="1" fill="#e2e8f0" />
    <rect x="81" y="61" width="5" height="12" rx="1.5" fill="#ef4444">
      <animate attributeName="width" values="5;26;26" keyTimes="0;0.35;1" {...LOOP} />
      <animate attributeName="fill" values="#ef4444;#f59e0b;#22c55e;#22c55e" keyTimes="0;0.18;0.35;1" {...LOOP} />
    </rect>
    <path d="M97 80 l-5 8 h4 l-2 7 l6 -9 h-4 l2 -6z" fill="#facc15">
      <animate attributeName="opacity" values="1;0.3;1;0;0" keyTimes="0;0.15;0.3;0.36;1" {...LOOP} />
    </path>
    <text x="160" y="96" textAnchor="middle" fontSize="9" fontWeight="600" fill="#22c55e" opacity="0">
      Ready ✓
      <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.65;0.7;1" {...LOOP} />
    </text>
  </svg>
);

const ReceiverScene = () => (
  <svg viewBox="0 0 200 110" className="block h-auto w-full">
    <rect x="112" y="28" width="76" height="56" rx="6" fill="#15803d" />
    <rect x="140" y="42" width="22" height="22" rx="2" fill="#0f172a" />
    <text x="151" y="78" textAnchor="middle" fontSize="8" fill="#dcfce7">Pi</text>
    <rect x="106" y="46" width="8" height="18" rx="1.5" fill="#cbd5e1" />
    <g>
      <animateTransform attributeName="transform" type="translate" values="-40 0;-40 0;0 0;0 0" keyTimes="0;0.15;0.45;1" {...LOOP} />
      <rect x="96" y="50" width="12" height="10" fill="#cbd5e1" />
      <rect x="56" y="46" width="42" height="18" rx="4" fill="#334155" />
      <circle cx="66" cy="55" r="3" fill="#64748b">
        <animate attributeName="fill" values="#64748b;#64748b;#22c55e;#22c55e" keyTimes="0;0.48;0.5;1" {...LOOP} />
      </circle>
      <text x="83" y="58" textAnchor="middle" fontSize="7" fill="#e2e8f0">RX</text>
    </g>
    <path d="M30 34 h20 l-4 -4 M50 34 l-4 4" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.4;0.45;1" {...LOOP} />
    </path>
    <text x="100" y="100" textAnchor="middle" fontSize="9" fontWeight="600" fill="#22c55e" opacity="0">
      Plugged in ✓
      <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.55;0.6;1" {...LOOP} />
    </text>
  </svg>
);

const ShutterScene = () => (
  <svg viewBox="0 0 200 110" className="block h-auto w-full">
    <rect x="50" y="28" width="100" height="60" rx="10" fill="#334155" />
    <circle cx="100" cy="58" r="22" fill="#0f172a" />
    <circle cx="100" cy="58" r="12" fill="#1e3a8a" />
    <circle cx="94" cy="52" r="4" fill="#ffffff" opacity="0">
      <animate attributeName="opacity" values="0;0;0.9;0.9;0" keyTimes="0;0.45;0.5;0.9;1" {...LOOP} />
    </circle>
    <circle cx="62" cy="38" r="3" fill="#ef4444" opacity="0">
      <animate attributeName="opacity" values="0;0;1;0.3;1;0" keyTimes="0;0.5;0.55;0.7;0.85;1" {...LOOP} />
    </circle>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 0;54 0;54 0;0 0" keyTimes="0;0.2;0.45;0.9;1" {...LOOP} />
      <rect x="74" y="32" width="52" height="52" rx="6" fill="#94a3b8" />
      <path d="M116 46 v24 M120 46 v24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </g>
    <path d="M86 18 h28 l-5 -5 M114 18 l-5 5" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.2;0.25;1" {...LOOP} />
    </path>
    <text x="100" y="104" textAnchor="middle" fontSize="9" fontWeight="600" fill="#22c55e" opacity="0">
      Lens open ✓
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.5;0.55;0.9;1" {...LOOP} />
    </text>
  </svg>
);

const LightsScene = () => (
  <svg viewBox="0 0 200 110" className="block h-auto w-full">
    <rect x="0" y="0" width="200" height="110" fill="#0f172a">
      <animate attributeName="fill" values="#0f172a;#0f172a;#fef9c3;#fef9c3;#0f172a" keyTimes="0;0.38;0.42;0.9;1" {...LOOP} />
    </rect>
    <rect x="12" y="12" width="22" height="14" rx="3" fill="#64748b" />
    <circle cx="23" cy="19" r="4" fill="#0f172a" />
    <line x1="90" y1="0" x2="90" y2="13" stroke="#64748b" strokeWidth="2" />
    <g stroke="#facc15" strokeWidth="2" strokeLinecap="round" opacity="0">
      <path d="M74 22 h-6 M106 22 h6 M79 33 l-4 4 M101 33 l4 4 M79 11 l-4 -4 M101 11 l4 -4" />
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.42;0.9;1" {...LOOP} />
    </g>
    <circle cx="90" cy="22" r="9" fill="#475569">
      <animate attributeName="fill" values="#475569;#475569;#facc15;#facc15;#475569" keyTimes="0;0.4;0.42;0.9;1" {...LOOP} />
    </circle>
    <g fill="#334155">
      <circle cx="55" cy="74" r="8" />
      <path d="M41 100 q14 -20 28 0z" />
      <circle cx="90" cy="74" r="8" />
      <path d="M76 100 q14 -20 28 0z" />
      <circle cx="125" cy="74" r="8" />
      <path d="M111 100 q14 -20 28 0z" />
    </g>
    <rect x="160" y="40" width="22" height="32" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
    <rect x="167" y="58" width="8" height="10" rx="1.5" fill="#64748b">
      <animate attributeName="y" values="58;58;46;46;58" keyTimes="0;0.3;0.36;0.9;1" {...LOOP} />
    </rect>
    <path d="M196 56 l-8 -5 v10z" fill="#f59e0b" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.32;0.36;1" {...LOOP} />
    </path>
  </svg>
);

const RestartScene = () => (
  <svg viewBox="0 0 200 110" className="block h-auto w-full">
    <text x="65" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8">1</text>
    <text x="135" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8">2</text>
    <circle cx="65" cy="52" r="20" fill="none" stroke="#e11d48" strokeWidth="2" opacity="0">
      <animate attributeName="r" values="20;20;20;30;30" keyTimes="0;0.22;0.23;0.35;1" {...LOOP} />
      <animate attributeName="opacity" values="0;0;0.8;0;0" keyTimes="0;0.22;0.23;0.35;1" {...LOOP} />
    </circle>
    <circle cx="65" cy="52" r="20" fill="#e11d48" />
    <rect x="58" y="45" width="14" height="14" rx="2" fill="#ffffff" />
    <text x="65" y="86" textAnchor="middle" fontSize="8" fill="#94a3b8">Stop</text>
    <circle cx="135" cy="52" r="20" fill="none" stroke="#059669" strokeWidth="2" opacity="0">
      <animate attributeName="r" values="20;20;20;30;30" keyTimes="0;0.6;0.61;0.73;1" {...LOOP} />
      <animate attributeName="opacity" values="0;0;0.8;0;0" keyTimes="0;0.6;0.61;0.73;1" {...LOOP} />
    </circle>
    <circle cx="135" cy="52" r="20" fill="#059669" />
    <path d="M129 43 L145 52 L129 61z" fill="#ffffff" />
    <text x="135" y="86" textAnchor="middle" fontSize="8" fill="#94a3b8">Start</text>
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="100 100;68 55;68 55;138 55;138 55;100 100"
        keyTimes="0;0.2;0.38;0.58;0.85;1"
        {...LOOP}
      />
      <path d="M0 0 L0 16 L4.5 12 L8 19 L10.5 18 L7 11 L13 11 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
    </g>
    <text x="100" y="104" textAnchor="middle" fontSize="9" fontWeight="600" fill="#22c55e" opacity="0">
      Audio back ✓
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.7;0.75;0.92;1" {...LOOP} />
    </text>
  </svg>
);

export type MediaHelpKey = 'transmitter_off' | 'no_receiver' | 'no_audio' | 'audio_lost' | 'video_black' | 'video_dark';

export const MEDIA_HELP: Record<MediaHelpKey, { title: string; Scene: () => ReactElement; steps: string[] }> = {
  transmitter_off: {
    title: 'Mic transmitter is off',
    Scene: TransmitterScene,
    steps: [
      'Find the clip-on mic transmitter.',
      'Switch it ON. The light should turn green.',
      'If the light stays red or off, charge it or swap the battery.',
      'Wait a few seconds until the dashboard shows "Mic on".',
    ],
  },
  no_receiver: {
    title: 'Mic receiver not plugged in',
    Scene: ReceiverScene,
    steps: [
      'Find the small mic receiver next to the Pi.',
      'Plug it firmly into a USB port on the Pi.',
      'Its light comes on and the dashboard shows "Mic on" within a few seconds.',
    ],
  },
  no_audio: {
    title: 'No audio is being recorded',
    Scene: TransmitterScene,
    steps: [
      'Check the mic transmitter is switched ON and its light is green.',
      'If the light is red, charge it or swap the battery.',
      'Check the mic cable is plugged into the transmitter.',
      'Check the receiver is plugged into the Pi.',
    ],
  },
  audio_lost: {
    title: 'Recording lost the mic audio',
    Scene: RestartScene,
    steps: [
      'Open Actions on this Pi and click Stop.',
      'Wait until the Pi shows Idle.',
      'Open Actions again and click Start. Audio is recorded again.',
    ],
  },
  video_black: {
    title: 'Video is black',
    Scene: ShutterScene,
    steps: [
      'Go to the camera.',
      'Slide the privacy shutter open or remove the lens cover.',
      'The warning clears after the next check (about 1 minute).',
    ],
  },
  video_dark: {
    title: 'Video is too dark',
    Scene: LightsScene,
    steps: [
      'Switch on the room lights.',
      'Open the curtains if it is daytime.',
      'The warning clears after the next check (about 1 minute).',
    ],
  },
};

const CARD_W = 280;
const CARD_H = 320;

// Wraps a warning pill: clicking it opens the matching help card. Without a known
// helpKey it renders the pill unchanged.
export const HelpTip = ({
  helpKey,
  className = '',
  children,
}: {
  helpKey?: string | null;
  className?: string;
  children: ReactNode;
}) => {
  const help = helpKey ? MEDIA_HELP[helpKey as MediaHelpKey] : undefined;
  const btnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!pos) return;
    const onMouseDown = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (cardRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      setPos(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPos(null);
    const close = () => setPos(null);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos]);

  if (!help) return <span className={className}>{children}</span>;

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (pos) return setPos(null);
    const r = btnRef.current!.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), window.innerWidth - CARD_W - 8);
    const top = r.bottom + 6 + CARD_H > window.innerHeight ? Math.max(8, r.top - 6 - CARD_H) : r.bottom + 6;
    setPos({ top, left });
  };

  const { Scene } = help;
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`${className} cursor-pointer hover:opacity-90`}
        title="What to do?"
        aria-expanded={!!pos}
      >
        {children}
        <IoIosHelpCircleOutline className="h-3.5 w-3.5 flex-shrink-0 opacity-80" />
      </button>
      {pos &&
        createPortal(
          <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            style={{ top: pos.top, left: pos.left, width: CARD_W }}
            className="fixed z-[9999] rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{help.title}</span>
              <button
                type="button"
                onClick={() => setPos(null)}
                className="text-sm leading-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
              <Scene />
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
              {help.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>,
          document.body,
        )}
    </>
  );
};
