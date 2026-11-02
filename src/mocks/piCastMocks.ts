// Dev-only mocked "PiCast" status payloads, one Pi per case in the media/mic spec.
// Open the Pi Casting page with ?mockPiCast=1 (vite dev server only) and Pi_Casting
// feeds these through its normal PiCast handler every few seconds. Actions sent to
// a mock Pi (Start, Stop, ...) are handled here instead of hitting the API.
//
//   9001  legacy Pi (sw 2.x), no new fields  -> looks as before, grey "pending" badges
//   9002  idle, mic linked, recordings with every media verdict -> badges + "P" filter
//   9003  idle, mic_signal no_signal -> red mic alert, Start shows warning + dialog
//   9004  idle, mic_signal no_receiver -> "Mic receiver not plugged in"
//   9005  recording, latest_audio silent -> red "No audio" banner
//   9006  recording, latest_video black -> red "Video is black" banner
//   9007  recording, latest_video dark -> amber "Video is dark" banner
//   9008  recording, all ok -> no banner, "Checked 3/3"
//   9009  recording, media null (first minute) -> nothing shown
//   9010  idle, mic_signal unknown; Start is blocked with start_error transmitter_off -> dialog
//   9011  idle; Start fails with another start_error code -> red toast
//   9012  recording, mic_signal audio_lost -> red mic alert + red live banner (no dialog)

type MockPi = {
  pi_id: number;
  sw_version: string;
  mic_signal?: string;
  mic_connected?: boolean;
  active: boolean;
  media: any;
  start_error: any;
  startBlock?: 'transmitter_off' | 'camera_busy';
  recordings: any[];
};

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const doneRec = (id: number, piId: number, audio: any, video: any) => ({
  id,
  pi_id: piId,
  batch_id: `MOCK-${id}`,
  filename: `rec_${id}.mp4`,
  created_at: minutesAgo(id),
  duration: '00:45:00',
  status: 3,
  state: 'completed',
  media_audio: audio,
  media_video: video,
});

const liveRec = (piId: number) => ({
  id: piId * 10,
  pi_id: piId,
  batch_id: `LIVE-${piId}`,
  created_at: minutesAgo(12),
  duration: '00:12:00',
  status: 0,
  state: 'recording',
  media_audio: null,
  media_video: null,
});

const media = (latest_audio: string, latest_video: string, checked = 3, segments = 3) => ({
  audio: latest_audio,
  video: latest_video,
  latest_audio,
  latest_video,
  checked,
  segments,
});

const mockPis: Record<string, MockPi> = {};
const addPi = (pi: MockPi) => {
  mockPis[String(pi.pi_id)] = pi;
};

addPi({
  pi_id: 9002,
  sw_version: '3.1.11',
  mic_signal: 'linked',
  mic_connected: true,
  active: false,
  media: null,
  start_error: null,
  recordings: [
    doneRec(1, 9002, 'ok', 'ok'),
    doneRec(2, 9002, 'silent', 'ok'),
    doneRec(3, 9002, 'partial', 'dark'),
    doneRec(4, 9002, 'missing', 'black'),
    doneRec(5, 9002, 'mixed', 'mixed'),
    doneRec(6, 9002, null, null),
    doneRec(7, 9002, 'unknown', 'error'),
  ],
});
addPi({ pi_id: 9003, sw_version: '3.1.11', mic_signal: 'no_signal', mic_connected: false, active: false, media: null, start_error: null, startBlock: 'transmitter_off', recordings: [] });
addPi({ pi_id: 9004, sw_version: '3.1.11', mic_signal: 'no_receiver', mic_connected: false, active: false, media: null, start_error: null, recordings: [] });
addPi({ pi_id: 9005, sw_version: '3.1.11', mic_signal: 'no_signal', mic_connected: false, active: true, media: media('silent', 'ok', 2, 3), start_error: null, recordings: [liveRec(9005)] });
addPi({ pi_id: 9006, sw_version: '3.1.11', mic_signal: 'linked', mic_connected: true, active: true, media: media('ok', 'black'), start_error: null, recordings: [liveRec(9006)] });
addPi({ pi_id: 9007, sw_version: '3.1.11', mic_signal: 'linked', mic_connected: true, active: true, media: media('ok', 'dark'), start_error: null, recordings: [liveRec(9007)] });
addPi({ pi_id: 9008, sw_version: '3.1.11', mic_signal: 'linked', mic_connected: true, active: true, media: media('ok', 'ok'), start_error: null, recordings: [liveRec(9008)] });
addPi({ pi_id: 9009, sw_version: '3.1.11', mic_signal: 'linked', mic_connected: true, active: true, media: null, start_error: null, recordings: [liveRec(9009)] });
addPi({ pi_id: 9010, sw_version: '3.1.11', mic_signal: 'unknown', mic_connected: false, active: false, media: null, start_error: null, startBlock: 'transmitter_off', recordings: [] });
addPi({ pi_id: 9012, sw_version: '3.1.11', mic_signal: 'audio_lost', mic_connected: false, active: true, media: media('ok', 'ok', 4, 4), start_error: null, recordings: [liveRec(9012)] });
addPi({ pi_id: 9011, sw_version: '3.1.11', mic_signal: 'linked', mic_connected: true, active: false, media: null, start_error: null, startBlock: 'camera_busy', recordings: [] });

// Venues / batches for the Start dialog's batch list. Venue 501 has active batches
// (one in Pi 9002's classroom, one in 9003's); venue 502 has none; other Pis have no venue.
const mockVenueOf: Record<number, number> = { 9002: 501, 9003: 501, 9010: 502 };
export const MOCK_VENUES: Record<string, string> = { 501: 'Mock Venue A', 502: 'Mock Venue B' };
export const MOCK_BATCHES: Record<string, string> = {
  7001: 'Mon-Wed 10AM (A)',
  7002: 'Tue-Thu 4PM (A)',
  7003: 'Sat 11AM (A)',
  7101: 'Weekend Batch (C)',
  7102: 'Old Batch (D)',
};
// Same shape as POST rpi/get_classrooms_batches/{venue_id}.
export const mockClassroomsBatches = (venueId: string) => ({
  error: 0,
  data:
    venueId === '501'
      ? [
          { batch_id: 7001, batch: MOCK_BATCHES[7001], venue_id: 501, rpi_pi_id: 9002 },
          { batch_id: 7002, batch: MOCK_BATCHES[7002], venue_id: 501, rpi_pi_id: 9003 },
          { batch_id: 7003, batch: MOCK_BATCHES[7003], venue_id: 501, rpi_pi_id: null },
        ]
      : [],
});

const commonFields = (piId: number) => ({
  type: 'status',
  pi_id: piId,
  venue_id: mockVenueOf[piId] ?? null,
  resources: {
    storage: { total_gb: 58, used_gb: 21.4, free_gb: 36.6 },
    ram: { total_gb: 4, used_gb: 1.2, free_gb: 2.8 },
  },
  network: { speed_mbps: 12 },
});

const v3Event = (pi: MockPi) => ({
  message: {
    ...commonFields(pi.pi_id),
    sw_version: pi.sw_version,
    devices: {
      camera_connected: true,
      mic_connected: pi.mic_connected,
      mic_receiver: pi.mic_signal !== 'no_receiver',
      mic_signal: pi.mic_signal,
      cpu_temp_c: 52.3,
    },
    recording: {
      active: pi.active,
      uploading_count: 0,
      merging_count: 0,
      media: pi.active ? pi.media : null,
      start_error: pi.start_error,
    },
    recordings: pi.active ? pi.recordings : pi.recordings.filter((r) => r.status !== 0),
  },
});

// Legacy Pi: none of the new fields, old devices shape.
const legacyEvent = () => ({
  message: {
    pi_id: 9001,
    sw_version: '2.4.0',
    devices: { camera: 1, mic: 1, cpu_temperature: 48.1 },
    stats: {
      storage: { total_storage: 58, used_storage: 30.2, free_storage: 27.8 },
      ram: { total_ram: 4, used_ram: 1.1, free_ram: 2.9 },
    },
    network_speed: '9',
    recordings: [
      {
        id: 11,
        pi_id: 9001,
        batch_id: 'LEGACY-11',
        date: minutesAgo(90),
        created_at: minutesAgo(90),
        duration: '00:50:00',
        video_size: '820MB',
        audio_size: '45MB',
        status: 3,
      },
    ],
  },
});

export const buildMockPiCastEvents = () => [
  legacyEvent(),
  ...Object.values(mockPis).map(v3Event),
];

// Returns true when the action targeted a mock Pi (and so must not reach the API).
export const mockPiCastAction = (payload: any): boolean => {
  const id = String(payload?.id ?? '');
  if (id === '9001') return true;
  const pi = mockPis[id];
  if (!pi) return false;

  if (payload.type === 'rec_start') {
    const forced = Number(payload.force) === 1;
    if (pi.startBlock && !(forced && pi.startBlock === 'transmitter_off')) {
      pi.start_error = {
        code: pi.startBlock,
        message:
          pi.startBlock === 'transmitter_off'
            ? 'Mic transmitter is off'
            : 'Camera is busy – another process is using it',
        batch_id: payload.batch_id,
        at: new Date().toISOString(),
      };
      return true;
    }
    pi.start_error = null;
    pi.active = true;
    pi.media = null;
    if (!pi.recordings.some((r) => r.status === 0)) {
      pi.recordings.unshift({ ...liveRec(pi.pi_id), batch_id: payload.batch_id });
    }
  } else if (payload.type === 'rec_stop') {
    pi.active = false;
    pi.media = null;
    pi.recordings = pi.recordings.filter((r) => r.status !== 0);
  }
  return true;
};
