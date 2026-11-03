import { HiVideoCamera } from 'react-icons/hi2';
import { IoIosMic } from 'react-icons/io';
import { HelpTip } from './mediaHelp';

// Media-check verdicts reported by Pi 3.1.11+. Every field may be missing on
// older Pis, so anything unrecognised is treated as "pending", never as a problem.

export const MEDIA_MEANING: Record<string, string> = {
  ok: 'OK',
  silent: 'Silent – transmitter off / not linked',
  partial: 'Partial – audio stopped part-way (transmitter battery died / receiver reset)',
  missing: 'Missing – no audio at all',
  dark: 'Dark – room lights off',
  black: 'Black – camera shutter closed / lens covered',
  mixed: 'Mixed – some segments ok, some not',
  pending: 'Pending – not checked yet',
};

type MediaTone = 'ok' | 'bad' | 'warn' | 'pending';

const BAD_VALUES = ['silent', 'missing', 'partial', 'black'];
const WARN_VALUES = ['dark', 'mixed'];

const normMedia = (value: unknown) => String(value ?? '').trim().toLowerCase();

export const mediaTone = (value: unknown): MediaTone => {
  const v = normMedia(value);
  if (v === 'ok') return 'ok';
  if (BAD_VALUES.includes(v)) return 'bad';
  if (WARN_VALUES.includes(v)) return 'warn';
  return 'pending';
};

// Audio or video checked and not ok (pending values are ignored).
export const isProblemRecording = (rec: any) =>
  ['bad', 'warn'].includes(mediaTone(rec?.media_audio)) ||
  ['bad', 'warn'].includes(mediaTone(rec?.media_video));

const toneCls: Record<MediaTone, string> = {
  ok: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  bad: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  warn: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  pending: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const MediaBadge = ({ kind, value }: { kind: 'audio' | 'video'; value: unknown }) => {
  const tone = mediaTone(value);
  const label = tone === 'pending' ? 'pending' : normMedia(value);
  const Icon = kind === 'audio' ? IoIosMic : HiVideoCamera;
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap rounded px-1 py-px text-[10px] font-medium leading-none ${toneCls[tone]}`}
      title={`${kind === 'audio' ? 'Audio' : 'Video'}: ${MEDIA_MEANING[label] ?? label}`}
    >
      <Icon className="h-2.5 w-2.5 flex-shrink-0" />
      {label}
    </span>
  );
};

export const MediaBadges = ({ rec, className = '' }: { rec: any; className?: string }) => (
  <span className={`inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap ${className}`}>
    <MediaBadge kind="audio" value={rec?.media_audio} />
    <MediaBadge kind="video" value={rec?.media_video} />
  </span>
);

export const ProblemFilterToggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600"
    />
    Problem recordings only
  </label>
);

// Mic status from devices.mic_signal, falling back to the caller's existing
// mic_connected/mic check when the signal is "unknown" or missing.
export const getMicStatus = (devices: any, fallbackOn: boolean) => {
  const signal = normMedia(devices?.mic_signal);
  if (signal === 'linked') return { on: true, label: 'Mic on', alert: null, helpKey: null };
  if (signal === 'no_signal') {
    const label = 'Transmitter off – switch on / charge it';
    return { on: false, label, alert: label, helpKey: 'transmitter_off' };
  }
  if (signal === 'no_receiver') {
    const label = 'Mic receiver not plugged in';
    return { on: false, label, alert: label, helpKey: 'no_receiver' };
  }
  if (signal === 'audio_lost') {
    const label = 'Recording lost the mic audio – stop and start the recording';
    return { on: false, label, alert: label, helpKey: 'audio_lost' };
  }
  return {
    on: fallbackOn,
    label: fallbackOn ? 'Mic connected' : 'Mic disconnected',
    alert: null as string | null,
    helpKey: null as string | null,
  };
};

// Live warnings for the segment currently being recorded. Media banners wait for
// the first check result (~1 min after start); mic_signal "audio_lost" shows at once.
export const getLiveMediaWarning = (recording: any, devices?: any) => {
  if (!recording?.active) return null;
  const audioLost = normMedia(devices?.mic_signal) === 'audio_lost';
  const media = recording?.media && typeof recording.media === 'object' ? recording.media : null;
  const checked = Number(media?.checked);
  const latestAudio = normMedia(media?.latest_audio);
  const latestVideo = normMedia(media?.latest_video);
  const hasResult =
    !!media &&
    ((Number.isFinite(checked) && checked > 0) ||
      mediaTone(latestAudio) !== 'pending' ||
      mediaTone(latestVideo) !== 'pending');
  if (!hasResult && !audioLost) return null;

  const banners: { tone: 'bad' | 'warn'; text: string; helpKey: string }[] = [];
  if (audioLost) {
    banners.push({ tone: 'bad', text: 'Recording lost the mic audio – stop and start the recording', helpKey: 'audio_lost' });
  } else if (hasResult && ['silent', 'missing', 'partial'].includes(latestAudio)) {
    banners.push({ tone: 'bad', text: 'No audio – check the mic transmitter', helpKey: 'no_audio' });
  }
  if (latestVideo === 'black') {
    banners.push({ tone: 'bad', text: 'Video is black – open the camera shutter', helpKey: 'video_black' });
  } else if (latestVideo === 'dark') {
    banners.push({ tone: 'warn', text: 'Video is dark – turn on the room lights', helpKey: 'video_dark' });
  }
  return {
    banners,
    checkedText: hasResult ? `Checked ${media.checked ?? 0}/${media.segments ?? 0}` : null,
  };
};

export const LiveMediaBanners = ({ recording, devices }: { recording: any; devices?: any }) => {
  const warning = getLiveMediaWarning(recording, devices);
  if (!warning) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {warning.banners.map((b) => (
        <HelpTip
          key={b.text}
          helpKey={b.helpKey}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
            b.tone === 'bad'
              ? 'bg-rose-600 text-white dark:bg-rose-500/80'
              : 'bg-amber-400 text-amber-950 dark:bg-amber-500/80'
          }`}
        >
          ⚠ {b.text}
        </HelpTip>
      ))}
      {warning.checkedText && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{warning.checkedText}</span>
      )}
    </div>
  );
};
