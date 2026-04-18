import axios from 'axios';
import { del, get, post, put } from '../helpers/api_helper';
import Pusher from 'pusher-js';
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from '../common/Loader';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import { HiVideoCamera } from 'react-icons/hi2';
import { HiVideoCameraSlash } from 'react-icons/hi2';
import { IoIosMic } from 'react-icons/io';
import { IoIosMicOff } from 'react-icons/io';
import { FaRegPlayCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { TbArrowMerge } from 'react-icons/tb';
import { FaRegCircleStop } from 'react-icons/fa6';
import { RiShutDownLine } from 'react-icons/ri';
import { BsBootstrapReboot } from 'react-icons/bs';
import { GrPowerReset } from 'react-icons/gr';
import { LuRefreshCcwDot } from 'react-icons/lu';
import { FcCamera } from 'react-icons/fc';
import { MdCleaningServices } from 'react-icons/md';
import { MdOutlineSdStorage } from 'react-icons/md';
import { MdNetworkWifi, MdSystemUpdateAlt } from 'react-icons/md';
import { GrClearOption } from 'react-icons/gr';
import { TbTemperature } from 'react-icons/tb';
import { DateTime } from 'luxon';
import TypoGraphy from './TypoGraphy';
import { SearchContext } from './SearchContext';
import { Dialog, Transition } from '@headlessui/react';
// icons

import { FcStart } from 'react-icons/fc';
import { FaPlay } from 'react-icons/fa';
import { BsRecordCircle } from 'react-icons/bs';
import { ActionMenu } from './ActionMenu';
import ActionsMenuNew from './ActionMenuNew';
import { LinearProgress } from '@mui/material';

const parseToDateTime = (rawDate?: unknown) => {
  if (!rawDate) return null;
  if (DateTime.isDateTime(rawDate)) return rawDate;
  if (rawDate instanceof Date) return DateTime.fromJSDate(rawDate);

  let str = String(rawDate).trim();
  if (!str) return null;

  // Trim fractional seconds to milliseconds if present.
  str = str.replace(/(\.\d{3})\d+/, '$1');

  let dt = DateTime.fromISO(str);
  if (!dt.isValid) dt = DateTime.fromSQL(str);
  if (!dt.isValid) dt = DateTime.fromFormat(str, 'yyyy-MM-dd');
  if (!dt.isValid) return null;
  return dt;
};

const formatRecordDate = (rawDate?: unknown) => {
  const dt = parseToDateTime(rawDate);
  if (!dt) return rawDate ? String(rawDate) : '';
  const localDt = dt.toLocal();
  return localDt.toFormat('d MMM h:mm a');
};

const toNum = (value: any, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const isModernSwVersion = (version?: unknown) => {
  const raw = String(version ?? '').trim();
  if (!raw) return false;
  const normalized = raw.startsWith('v') ? raw.slice(1) : raw;
  const coreVersion = normalized.split('-')[0].split('+')[0];
  const parts = coreVersion
    .split('.')
    .map((part) => Number(String(part).match(/\d+/)?.[0] ?? Number.NaN));
  if (parts.some((part) => !Number.isFinite(part))) return false;
  const [major = 0, minor = 0, patch = 0] = parts;
  if (major > 3) return true;
  if (major < 3) return false;
  if (minor > 0) return true;
  if (minor < 0) return false;
  return patch >= 0;
};

const resolveRecordingStatus = (record: any = {}): number => {
  const explicitStatus = Number(record?.status);
  if (Number.isFinite(explicitStatus)) return explicitStatus;

  const state = String(record?.state ?? record?.status_text ?? '').toLowerCase();
  if (state.includes('fail') || state.includes('error')) return 9;
  if (state.includes('upload') && state.includes('complete')) return 3;
  if (state.includes('upload')) return 2;
  if (state.includes('merge') && state.includes('complete')) return 2;
  if (state.includes('merge')) return 1;
  if (state.includes('record')) return 0;

  const error = toNum(record?.error, 0);
  if (error === 1) return 9;

  const recFlag = toNum(record?.recording, 0);
  const mergeFlag = toNum(record?.merge, 0);
  const uploadFlag = toNum(record?.upload, 0);
  const syncFlag = toNum(record?.sync, 0);
  if (syncFlag === 1 || (recFlag === 1 && mergeFlag === 1 && uploadFlag === 1)) return 3;
  if (recFlag === 1 && mergeFlag === 1 && uploadFlag === 0) return 2;
  if (recFlag === 1 && mergeFlag === 0) return 1;
  if (recFlag === 0 && mergeFlag === 0 && uploadFlag === 0) return 0;

  const uploadPct = toNum(record?.upload_percentage, 0);
  const mergePct = toNum(record?.merge_percentage, 0);
  if (uploadPct > 0) return 2;
  if (mergePct > 0) return 1;
  return 3;
};

const applyStatusFlags = (record: any = {}, statusInput?: number) => {
  const status = Number.isFinite(Number(statusInput))
    ? Number(statusInput)
    : resolveRecordingStatus(record);
  const failed = status === 9 || toNum(record?.error, 0) === 1;
  const prevMerge = Math.max(0, toNum(record?.merge_percentage, 0));
  const prevUpload = Math.max(0, toNum(record?.upload_percentage, 0));

  if (failed) {
    return {
      status: 9,
      recording: 1,
      merge: toNum(record?.merge, 0),
      upload: toNum(record?.upload, 0),
      merge_percentage: prevMerge,
      upload_percentage: prevUpload,
      sync: toNum(record?.sync, 0),
      error: 1,
    };
  }

  if (status === 0) {
    return {
      status: 0,
      recording: 0,
      merge: 0,
      upload: 0,
      merge_percentage: 0,
      upload_percentage: 0,
      sync: 0,
      error: 0,
    };
  }
  if (status === 1) {
    return {
      status: 1,
      recording: 1,
      merge: 0,
      upload: 0,
      merge_percentage: prevMerge,
      upload_percentage: 0,
      sync: 0,
      error: 0,
    };
  }
  if (status === 2) {
    return {
      status: 2,
      recording: 1,
      merge: 1,
      upload: 0,
      merge_percentage: 100,
      upload_percentage: prevUpload,
      sync: 0,
      error: 0,
    };
  }
  return {
    status: 3,
    recording: 1,
    merge: 1,
    upload: 1,
    merge_percentage: 100,
    upload_percentage: 100,
    sync: 1,
    error: 0,
  };
};

const recordingIdentity = (rec: any = {}) =>
  String(
    rec?.id ??
      rec?.recording_key ??
      rec?.filename ??
      rec?.s3_key ??
      rec?.file_id ??
      `${rec?.batch_id ?? '0'}_${rec?.created_at ?? rec?.date ?? ''}`,
  );

const mergeRecordingLists = (prevList: any[] = [], incomingList: any[] = []) => {
  const map = new Map<string, any>();
  prevList.forEach((rec) => map.set(recordingIdentity(rec), rec));

  incomingList.forEach((incoming) => {
    const key = recordingIdentity(incoming);
    const prev = map.get(key) || {};
    const incomingStatus = resolveRecordingStatus(incoming);
    const baseFlags = applyStatusFlags(incoming, incomingStatus);
    const prevMerge = toNum(prev?.merge_percentage, 0);
    const prevUpload = toNum(prev?.upload_percentage, 0);
    const merged = {
      ...prev,
      ...incoming,
      ...baseFlags,
      merge_percentage:
        incomingStatus === 1 || incomingStatus === 9
          ? Math.max(prevMerge, toNum(incoming?.merge_percentage, baseFlags.merge_percentage))
          : baseFlags.merge_percentage,
      upload_percentage:
        incomingStatus === 2 || incomingStatus === 9
          ? Math.max(prevUpload, toNum(incoming?.upload_percentage, baseFlags.upload_percentage))
          : baseFlags.upload_percentage,
      s3_key: incoming?.s3_key ?? prev?.s3_key,
      s3_bucket: incoming?.s3_bucket ?? prev?.s3_bucket,
      file_id: incoming?.file_id ?? prev?.file_id ?? null,
    };
    map.set(key, merged);
  });

  return Array.from(map.values());
};

function normalizeV3Recording(
  statusObj: any = {},
  piId: string,
  devices: any = {},
  idx = 0,
) {
  let state = (statusObj?.state || '').toLowerCase();
  if (!state) {
    if (statusObj?.is_uploading) state = 'uploading';
    else if (statusObj?.is_recording) state = 'recording';
  }
  const statusMap: Record<string, number> = {
    recording: 0,
    merging: 1,
    uploading: 2,
    completed: 3,
    failed: 9,
    error: 9,
  };
  const status =
    Number.isFinite(Number(statusObj?.status))
      ? Number(statusObj?.status)
      : statusMap[state] ?? resolveRecordingStatus(statusObj);
  const start = statusObj?.start_time || statusObj?.started_at;
  const parsedStart = parseToDateTime(start);
  const formattedDate = parsedStart
    ? parsedStart.toFormat('yyyy-MM-dd HH:mm:ss')
    : start
    ? String(start)
    : '';

  const createdAt = statusObj?.created_at ?? formattedDate ?? '';
  const flags = applyStatusFlags(
    {
      ...statusObj,
      merge_percentage: statusObj?.merge_percentage,
      upload_percentage: statusObj?.upload_percentage,
    },
    status,
  );

  return {
    id: statusObj?.id ?? idx ?? 0,
    pi_id: piId,
    camera: devices?.camera ?? 0,
    mic: devices?.mic ?? 0,
    batch_id: statusObj?.batch_id ?? 0,
    date: createdAt,
    filename: statusObj?.filename ?? '',
    video_size: statusObj?.video_size ?? '',
    audio_size: statusObj?.audio_size ?? '',
    duration: statusObj?.duration ?? '',
    file_id: statusObj?.file_id ?? null,
    recording: flags.recording,
    merge: flags.merge,
    merge_percentage: flags.merge_percentage,
    upload: flags.upload,
    upload_percentage: flags.upload_percentage,
    sync: flags.sync,
    status: flags.status,
    created_at: createdAt,
    modified_at: statusObj?.modified_at ?? '',
    status_text: statusObj?.status_text ?? state,
    expected_end_time: statusObj?.expected_end_time,
    state,
    error: flags.error,
    s3_key: statusObj?.s3_key,
    s3_bucket: statusObj?.s3_bucket,
  };
}

function normalizeRecordingEntry(record: any = {}, piId: string, devices: any = {}) {
  const status = resolveRecordingStatus(record);
  const flags = applyStatusFlags(record, status);
  const dateSource = record?.created_at || record?.date || record?.modified_at;

  return {
    id: record?.id ?? 0,
    pi_id: record?.pi_id ?? piId,
    camera: record?.camera ?? devices?.camera ?? 0,
    mic: record?.mic ?? devices?.mic ?? 0,
    batch_id: record?.batch_id ?? 0,
    date: dateSource ?? '',
    filename: record?.filename ?? '',
    video_size: record?.video_size ?? '',
    audio_size: record?.audio_size ?? '',
    duration: record?.duration ?? '',
    file_id: record?.file_id ?? null,
    recording: flags.recording,
    merge: flags.merge,
    merge_percentage: Math.max(
      toNum(record?.merge_percentage, 0),
      toNum(flags.merge_percentage, 0),
    ),
    upload: flags.upload,
    upload_percentage: Math.max(
      toNum(record?.upload_percentage, 0),
      toNum(flags.upload_percentage, 0),
    ),
    sync: flags.sync,
    status: flags.status,
    created_at: record?.created_at ?? dateSource ?? '',
    modified_at: record?.modified_at ?? '',
    status_text: record?.status_text ?? record?.state ?? '',
    recording_key: record?.recording_key,
    error: flags.error,
    storage_type: record?.storage_type,
    s3_key: record?.s3_key,
    s3_bucket: record?.s3_bucket,
  };
}

const listRowVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 10,
    scale: 0.985,
    filter: 'blur(2px)',
    transition: {
      delay: i * 0.02,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.02,
      duration: 0.25,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    filter: 'blur(1.5px)',
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

// Memoized Row Component for better performance with large datasets
const PiRow = React.memo(React.forwardRef(({
  element,
  indexs,
  venues,
  batches,
  expandedRows,
  setExpandedRows,
  rowFilters,
  setRowFilters,
  inputValue,
  textVariants,
  isLoading,
  loaderIcon,
  stopRecord,
  openPreviewModal,
  openShellModal,
  startRecord,
  clearRecord,
  reboot,
  shutDown,
  reFresh,
  storageClear,
  startReMerging,
  trash,
  pendingActions,
  appChannelOnline,
}: any, ref: any) => {
  const isV3 = isModernSwVersion(element?.sw_version);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const rowExpandKey = String(element?.pi_id ?? indexs);
  const isExpanded = !!expandedRows[rowExpandKey];
  const rowFilter = rowFilters?.[rowExpandKey] ?? null;
  const cameraOn =
    element?.devices?.camera_connected !== undefined
      ? !!element?.devices?.camera_connected
      : element?.devices?.camera === true ||
        String(element?.devices?.camera ?? '').toLowerCase() === 'true' ||
        Number(element?.devices?.camera ?? 0) === 1;
  const micOn =
    element?.devices?.mic_connected !== undefined
      ? !!element?.devices?.mic_connected
      : element?.devices?.mic === true ||
        String(element?.devices?.mic ?? '').toLowerCase() === 'true' ||
        Number(element?.devices?.mic ?? 0) === 1;
  const isAppOnline = !!appChannelOnline?.[String(element?.pi_id)];
  const statusText = (r: any) =>
    String(r?.status_text ?? r?.state ?? '').toLowerCase();

  const isRecording = (r: any) =>
    isV3 ? resolveRecordingStatus(r) === 0 || statusText(r) === 'recording' : r?.status === 0;
  const isUploading = (r: any) =>
    isV3
      ? resolveRecordingStatus(r) === 2 || statusText(r) === 'uploading'
      : r?.status === 2;
  const isMerging = (r: any) =>
    isV3
      ? resolveRecordingStatus(r) === 1 || statusText(r) === 'merging'
      : r?.status === 1;
  const toPercent = (value: any) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  const baseRecs =
    (isV3
      ? element?.lastRenderedRecordings ??
        element?.lastFullRecordings ??
        element?.recordings
      : element?.recordings) || [];
  const activeRec =
    isV3 && (element?.renderActiveRecording ?? element?.active_recording)
      ? [element?.renderActiveRecording ?? element?.active_recording]
      : [];
  const uploadingPayloadRecs =
    isV3 &&
    Array.isArray(
      element?.renderUploadingRecordings ?? element?.uploading_recordings,
    )
      ? element?.renderUploadingRecordings ?? element.uploading_recordings
      : [];

  const supplementalV3Recs = [...activeRec, ...uploadingPayloadRecs].map((rec: any) =>
    normalizeRecordingEntry(rec, String(element?.pi_id ?? ''), element?.devices),
  );
  const recsV3 =
    isV3 && Array.isArray(element?.renderRowsSnapshot)
      ? element.renderRowsSnapshot
      : mergeRecordingLists(supplementalV3Recs, baseRecs);

  const recordingRecs = recsV3.filter((r: any) => isRecording(r));
  const uploadingRecs = recsV3.filter((r: any) => isUploading(r));
  const mergingRecs = recsV3.filter((r: any) => isMerging(r));
  const otherRecs = recsV3.filter(
    (r: any) => !isRecording(r) && !isUploading(r) && !isMerging(r),
  );
  // v3 row priority: live recording first, then merging, then uploading, then rest.
  const orderedRecs = [...recordingRecs, ...mergingRecs, ...uploadingRecs, ...otherRecs];
  const pending = isV3 ? pendingActions?.[element?.pi_id] : undefined;
  const placeholderRecs = orderedRecs.filter(
    (r: any) =>
      r?.id === 0 &&
      !r?.batch_id &&
      !r?.filename &&
      !r?.date &&
      !r?.duration,
  );
  const filteredRecs =
    pending && placeholderRecs.length === orderedRecs.length
      ? []
      : orderedRecs.filter(
          (r: any) =>
            !(
              pending &&
              r?.id === 0 &&
              !r?.batch_id &&
              !r?.filename &&
              !r?.date &&
              !r?.duration
            ),
        );
  const pendingRec = pending
    ? {
        _pending: true,
        id: `pending-${element?.pi_id}-${pending.type}`,
        status: pending.type === 'start' ? 0 : 2,
        batch_id: pending.type === 'start' ? 'Starting...' : 'Stopping...',
        duration: '',
        video_size: '',
        audio_size: '',
        date: '',
      }
    : null;
  const orderedWithPending = pendingRec ? [pendingRec, ...filteredRecs] : filteredRecs;
  const idleRow = {
    _idle: true,
    id: 0,
    pi_id: element?.pi_id,
    batch_id: 0,
    status: undefined,
  };
  const recordingOnlyRows = orderedWithPending.filter(
    (r: any) => r?._pending || isRecording(r),
  );
  const uploadingOnlyRows = orderedWithPending.filter((r: any) => isUploading(r));
  const mergingOnlyRows = orderedWithPending.filter((r: any) => isMerging(r));
  const filteredByType =
    rowFilter === 'recording'
      ? recordingOnlyRows.length
        ? recordingOnlyRows
        : [idleRow]
      : rowFilter === 'uploading'
      ? uploadingOnlyRows.length
        ? uploadingOnlyRows
        : [
            {
              _empty: true,
              _emptyKind: 'uploading',
              id: 0,
              pi_id: element?.pi_id,
              batch_id: 0,
              status: undefined,
            },
          ]
      : rowFilter === 'merging'
      ? mergingOnlyRows.length
        ? mergingOnlyRows
        : [
            {
              _empty: true,
              _emptyKind: 'merging',
              id: 0,
              pi_id: element?.pi_id,
              batch_id: 0,
              status: undefined,
            },
          ]
      : orderedWithPending;
  const previewRecording = orderedWithPending.find(
    (r: any) => r?._pending || isRecording(r),
  );
  const previewRecsV3 = previewRecording ? [previewRecording] : [idleRow];

  const displayRecsV3 = isExpanded ? filteredByType : previewRecsV3;
  const displayRecsLegacy = isExpanded
    ? baseRecs
    : baseRecs.slice(-1);

  const rows = isV3
    ? displayRecsV3.length === 0
      ? rowFilter
        ? filteredByType
        : [idleRow]
      : displayRecsV3
    : displayRecsLegacy;
  const recordingCount = recsV3.filter((r: any) => isRecording(r)).length;
  const uploadingCount = recsV3.filter((r: any) => isUploading(r)).length;
  const mergingCount = recsV3.filter((r: any) => isMerging(r)).length;
  const tempRaw =
    element?.devices?.cpu_temperature ??
    element?.devices?.cpu_temp ??
    element?.cpu_temperature ??
    element?.cpu_temp;
  const temp =
    tempRaw === undefined || tempRaw === null || tempRaw === ''
      ? null
      : Number(tempRaw);
  const tempCls =
    temp !== null && temp > 70
      ? 'text-red-600 dark:text-red-400'
      : temp !== null && temp > 60
      ? 'text-orange-600 dark:text-orange-400'
      : 'text-gray-700 dark:text-gray-300';
  const ram = element?.stats?.ram || {};
  const ramTotal = Number(ram?.total_ram) || 0;
  const ramUsed = Number(ram?.used_ram) || 0;
  const ramPct = Math.max(
    0,
    Math.min(100, ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0),
  );
  const recordingBtnClass = `inline-flex min-w-0 items-center gap-1 rounded-md border pl-0.5 pr-1.5 py-0.5 text-[11px] font-medium transition-colors ${
    rowFilter === 'recording'
      ? 'border-transparent bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200'
      : 'border-transparent bg-rose-50/70 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15'
  }`;
  const uploadingBtnClass = `inline-flex min-w-0 items-center gap-1 rounded-md border pl-0.5 pr-1.5 py-0.5 text-[11px] font-medium transition-colors ${
    rowFilter === 'uploading'
      ? 'border-transparent bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200'
      : 'border-transparent bg-yellow-50/70 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/15'
  }`;
  const mergingBtnClass = `inline-flex min-w-0 items-center gap-1 rounded-md border pl-0.5 pr-1.5 py-0.5 text-[11px] font-medium transition-colors ${
    rowFilter === 'merging'
      ? 'border-transparent bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200'
      : 'border-transparent bg-blue-50/70 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15'
  }`;
  const secondaryMetaItemClass =
    'inline-flex min-w-0 min-h-[22px] items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] font-medium';
  const toggleBtnClass =
    'inline-flex h-6 w-6 items-center justify-center rounded-md border border-transparent bg-slate-50/70 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white';

  const activateFilter = (type: 'recording' | 'uploading' | 'merging') => {
    setRowFilters((prev: Record<string, string | null>) => ({
      ...prev,
      [rowExpandKey]: type,
    }));
    setExpandedRows((prev) => ({
      ...prev,
      [rowExpandKey]: true,
    }));
  };

  return (
    <motion.tr
      ref={ref}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        x: { duration: 0.3 }
      }}
      className="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
    >
      <td className={`border-white ${isV3 ? 'py-0' : 'py-0.5'} px-1 dark:border-strokedark text-center w-[32px] align-middle`}>
        <div className={isV3 ? 'flex items-center justify-center' : ''}>
          <label htmlFor="">{element._rowIndex || indexs + 1}</label>
        </div>
      </td>
      <td className={`border-white ${isV3 ? 'py-0' : 'py-0.5'} px-1 dark:border-strokedark text-center w-[44px] align-middle`}>
        <div className={isV3 ? 'flex items-center justify-center' : ''}>
          <span className="text-sm font-bold">{element.pi_id}</span>
        </div>
      </td>
      <td className={`w-[50px] max-w-[50px] border-white ${isV3 ? 'py-0' : 'py-0.5'} px-2 dark:border-strokedark align-middle`}>
        <div className={isV3 ? 'flex items-center' : ''}>
          <div
            className="w-full truncate text-sm leading-tight"
            title={venues[element['venue_id']] || ''}
          >
            {venues[element['venue_id']] || '—'}
          </div>
        </div>
      </td>
      <td className={`text-sm text-center border-white ${isV3 ? 'py-0' : 'py-0.5'} px-4 dark:border-strokedark w-[70px] align-middle`}>
        <div className="flex flex-col items-center justify-center gap-0.5">
          {(() => {
            const storage = element?.stats?.storage || {
              used_storage: 0,
              total_storage: 0,
            };
            const total = Number(storage.total_storage) || 0;
            const used = Number(storage.used_storage) || 0;
            const pct = total ? (used / total) * 100 : 0;
            const dialSize = 48;
            const dialCenter = dialSize / 2;
            const dialRadius = 20;
            const dialCircumference = 2 * Math.PI * dialRadius;
            return (
              <>
                <div className="relative inline-flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${dialSize} ${dialSize}`}
                    className="w-12 h-12 transform -rotate-90"
                  >
                    <circle
                      cx={dialCenter}
                      cy={dialCenter}
                      r={dialRadius}
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx={dialCenter}
                      cy={dialCenter}
                      r={dialRadius}
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${dialCircumference}`}
                      strokeDashoffset={`${
                        dialCircumference * (1 - (total ? used / total : 0))
                      }`}
                      className={`transition-all duration-500 ${
                        pct <= 60
                          ? 'text-green-500'
                          : pct <= 80
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <MdOutlineSdStorage className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-[10px] font-bold dark:text-white">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-gray-600 dark:text-gray-400">
                  {used.toFixed(1)}GB / {total.toFixed(0)}GB
                </span>
              </>
            );
          })()}
        </div>
      </td>
      <td className={`border-white px-1 dark:border-strokedark ${isV3 ? 'py-0 w-[80px] align-middle' : 'py-0.5 w-[110px]'}`}>
        {isV3 ? (
          <div className="flex flex-col items-center justify-center gap-0.5 px-1 py-0.5">
            <div className="flex items-center justify-center gap-2.5">
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center"
                title={cameraOn ? 'Camera Active' : 'Camera Inactive'}
              >
                {cameraOn ? (
                  <HiVideoCamera className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <HiVideoCameraSlash className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center"
                title={micOn ? 'Mic Active' : 'Mic Inactive'}
              >
                {micOn ? (
                  <IoIosMic className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <IoIosMicOff className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                style={{ color: element['sw_version'] === '0.0' ? '#ef4444' : undefined }}
              >
                <MdSystemUpdateAlt className="h-3 w-3 flex-shrink-0" />
                <span>v{element['sw_version']}</span>
              </span>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800"
            >
              <MdNetworkWifi className="h-3.5 w-3.5 flex-shrink-0 text-sky-500" />
              <span
                className="text-[10px] font-medium"
                style={{ color: element['network_speed'] === '0' ? '#ef4444' : 'inherit' }}
              >
                {element['network_speed']} MBps
              </span>
            </div>
            <div
              className={`flex flex-wrap items-center justify-center gap-1 overflow-hidden transition-all duration-200 ${
                statusExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <span
                onClick={(e) => e.stopPropagation()}
                className={`${secondaryMetaItemClass} cursor-pointer ${
                  isAppOnline
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    isAppOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                />
                <span>App</span>
              </span>
              <span
                onClick={(e) => e.stopPropagation()}
                className={`${secondaryMetaItemClass} ${tempCls} cursor-pointer`}
              >
                <TbTemperature className="w-4 h-4 flex-shrink-0" />
                <span>
                  {temp !== null && Number.isFinite(temp) ? temp.toFixed(1) : '—'}&deg;C
                </span>
              </span>
              <span
                onClick={(e) => e.stopPropagation()}
                className={`${secondaryMetaItemClass} text-indigo-700 dark:text-indigo-300 cursor-pointer`}
              >
                <MdOutlineSdStorage className="w-4 h-4 flex-shrink-0" />
                <span>RAM {Math.round(ramPct)}%</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-0.5">
                {(element?.devices?.camera ?? 0) == 1 ? (
                  <HiVideoCamera className="w-3.5 h-3.5 text-green-500" title="Camera Active" />
                ) : (
                  <HiVideoCameraSlash className="w-3.5 h-3.5 text-red-500" title="Camera Inactive" />
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {(element?.devices?.mic ?? 0) == 1 ? (
                  <IoIosMic className="w-3.5 h-3.5 text-green-500" title="Mic Active" />
                ) : (
                  <IoIosMicOff className="w-3.5 h-3.5 text-red-500" title="Mic Inactive" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span 
                className="text-[9px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 font-medium text-blue-700 dark:text-blue-300"
                style={{ color: element['sw_version'] === '0.0' ? '#ef4444' : undefined }}
              >
                v{element['sw_version']}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span 
                className="text-[9px] font-medium"
                style={{ color: element['network_speed'] === '0' ? '#ef4444' : 'inherit' }}
              >
                {element['network_speed']} MBps
              </span>
            </div>
            {(() => {
              const tempRaw =
                element?.devices?.cpu_temperature ??
                element?.devices?.cpu_temp ??
                element?.cpu_temperature ??
                element?.cpu_temp;
              if (tempRaw === undefined || tempRaw === null || tempRaw === '') return null;
              const temp = Number(tempRaw);
              const tempCls =
                temp > 70
                  ? 'text-red-600 dark:text-red-400'
                  : temp > 60
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300';
              return (
                <div className="flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 14.76V6a2 2 0 10-4 0v8.76a4 4 0 104 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span className={`text-[9px] font-medium ${tempCls}`}>
                    {Number.isFinite(temp) ? temp.toFixed(1) : '—'}°C
                  </span>
                </div>
              );
            })()}
          </div>
        )}
      </td>
      {isV3 && (
      <td className="border-white pl-0 pr-4 dark:border-strokedark py-0 w-[700px] align-middle">
          <div className="flex flex-col justify-center py-0 gap-0.5">
            <div className="w-full rounded-md pl-0 pr-1 py-0.5 transition-colors select-none border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 leading-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateFilter('recording');
                  }}
                  className={recordingBtnClass}
                  title={recordingCount > 0 ? 'Show recording rows' : 'Show idle state'}
                >
                  <BsRecordCircle className="h-3 w-3 flex-shrink-0" />
                  <span>R:{recordingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateFilter('merging');
                  }}
                  className={mergingBtnClass}
                  title="Show merging recordings only"
                >
                  <TbArrowMerge className="h-3 w-3 flex-shrink-0" />
                  <span>M:{mergingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateFilter('uploading');
                  }}
                  className={uploadingBtnClass}
                  title="Show uploading recordings only"
                >
                  <FaCloudUploadAlt className="h-3 w-3 flex-shrink-0" />
                  <span>U:{uploadingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusExpanded((prev) => !prev);
                  }}
                  className={toggleBtnClass}
                  title={statusExpanded ? 'Hide more status' : 'Show more status'}
                  aria-label={statusExpanded ? 'Collapse extra status' : 'Expand extra status'}
                >
                  {statusExpanded ? '▴' : '▾'}
                </button>
              </div>
            </div>
            <div className="mt-0">
            <div className={isExpanded ? 'max-h-40 overflow-y-auto pr-1' : ''}>
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[160px]" />
                  <col className="w-[120px]" />
                  <col className="w-[70px]" />
                  <col className="w-[70px]" />
                  <col className="w-[180px]" />
                  <col className="w-[90px]" />
                </colgroup>
                <tbody>
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows
                    .filter((item) =>
                      item?._pending ||
                      item?._idle ||
                      item?._empty ||
                      Object.values(item).some((value) =>
                        String(value)
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()),
                      ),
                    )
                    .map((record, index) => {
                      if (record._empty) {
                        const emptyKind = record?._emptyKind === 'uploading' ? 'uploading' : 'merging';
                        const emptyLabel =
                          emptyKind === 'uploading' ? 'No item to upload' : 'No item to merge';
                        const emptyStatus =
                          emptyKind === 'uploading' ? 'Nothing uploading' : 'Nothing merging';
                        return (
                          <motion.tr
                            layout
                            custom={index}
                            variants={listRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            key={`${element.pi_id}-empty-${index}`}
                            className="h-7"
                          >
                            <td className="py-1 pl-0 pr-2 text-left align-middle">
                              <div className="flex min-h-[20px] items-center justify-start gap-1 leading-none">
                                <span
                                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                                    emptyKind === 'uploading'
                                      ? 'text-yellow-500 dark:text-yellow-300'
                                      : 'text-blue-500 dark:text-blue-300'
                                  }`}
                                >
                                  {emptyKind === 'uploading' ? (
                                    <FaCloudUploadAlt className="h-3.5 w-3.5" />
                                  ) : (
                                    <TbArrowMerge className="h-3.5 w-3.5" />
                                  )}
                                </span>
                                <span className="text-sm text-slate-400">{emptyLabel}</span>
                              </div>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">{emptyStatus}</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <div className="flex min-h-[18px] items-center justify-start">
                                <ActionsMenuNew
                                  isLast={index >= rows.length - 3}
                                  record={record}
                                  isLoading={isLoading}
                                  loaderIcon={loaderIcon}
                                  stopRecord={stopRecord}
                                  openPreviewModal={openPreviewModal}
                                  openShellModal={openShellModal}
                                  startRecord={startRecord}
                                  clearRecord={clearRecord}
                                  reboot={reboot}
                                  shutDown={shutDown}
                                  reFresh={reFresh}
                                  storageClear={storageClear}
                                  startReMerging={startReMerging}
                                  trash={trash}
                                  shell={element.shell}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                      if (record._idle) {
                        return (
                          <motion.tr
                            layout
                            custom={index}
                            variants={listRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            key={`${element.pi_id}-idle-${index}`}
                            className="h-7"
                          >
                            <td className="py-1 pl-0 pr-2 text-left align-middle">
                              <div className="flex min-h-[20px] items-center justify-start gap-1 leading-none">
                                <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                                <span className="text-sm text-slate-300">Idle</span>
                              </div>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs">Idle</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <span className="inline-flex min-h-[18px] items-center text-xs text-gray-500 dark:text-gray-400">—</span>
                            </td>
                            <td className="py-1 px-2 text-left align-middle">
                              <div className="flex min-h-[18px] items-center justify-start">
                                <ActionsMenuNew
                                  isLast={index >= rows.length - 3}
                                  record={record}
                                  isLoading={isLoading}
                                  loaderIcon={loaderIcon}
                                  stopRecord={stopRecord}
                                  openPreviewModal={openPreviewModal}
                                  openShellModal={openShellModal}
                                  startRecord={startRecord}
                                  clearRecord={clearRecord}
                                  reboot={reboot}
                                  shutDown={shutDown}
                                  reFresh={reFresh}
                                  storageClear={storageClear}
                                  startReMerging={startReMerging}
                                  trash={trash}
                                  shell={element.shell}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                      return (
                        <motion.tr
                          layout
                          custom={index}
                          variants={listRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          key={`${element.pi_id}-${record.id || record.batch_id || record.filename || record.date || 'rec'}-${index}`}
                          className="h-7"
                        >
                          <td className="py-1 pl-0 pr-2 text-left align-middle">
                            <div className="flex min-h-[20px] w-full items-center justify-start gap-1 leading-none">
                              <div className="relative inline-flex h-3.5 w-3.5 flex-shrink-0 self-center items-center justify-center">
                                <span
                                  className={`animate-ping absolute inset-0 rounded-full border-2 border-white ${
                                    record.pi_id != 0 && isRecording(record)
                                      ? 'bg-meta-7'
                                      : isUploading(record)
                                      ? 'bg-meta-6'
                                      : isMerging(record)
                                      ? 'bg-primary'
                                      : 'bg-meta-3'
                                  }`}
                                />
                                <span
                                  className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white ${
                                    record.pi_id != 0 && isRecording(record)
                                      ? 'bg-meta-7'
                                      : isUploading(record)
                                      ? 'bg-meta-6'
                                      : isMerging(record)
                                      ? 'bg-primary'
                                      : 'bg-meta-3'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1 truncate text-left text-sm leading-none">
                                {record._pending
                                  ? record.batch_id
                                  : batches[record.batch_id] || record.recording_key || record.filename || (record.batch_id ? record.batch_id : '—')}
                              </div>
                            </div>
                          </td>
                          <td className="py-1 px-2 text-left align-middle">
                            <p className="inline-flex min-h-[18px] items-center text-xs">
                              <span>{record._idle ? '—' : formatRecordDate(record.created_at || record.date)}</span>
                            </p>
                          </td>
                          <td className="py-1 px-2 text-left align-middle">
                            <motion.span
                              key={`duration-compact-${record.id ?? record.batch_id ?? record.filename ?? index}`}
                              variants={textVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              transition={{ duration: 0.5 }}
                              className="inline-flex min-h-[18px] items-center text-xs"
                            >
                              {record.duration}
                            </motion.span>
                          </td>
                          <td className="py-1 px-2 text-left align-middle">
                            <p className="inline-flex min-h-[18px] items-center text-xs">
                              {record._pending
                                ? record.status === 0
                                  ? 'Starting'
                                  : 'Stopping'
                                : isRecording(record)
                                ? 'Recording'
                                : isUploading(record)
                                ? 'Uploading'
                                : isMerging(record)
                                ? 'Merging'
                                : resolveRecordingStatus(record) === 9
                                ? 'Failed'
                                : 'Completed'}
                            </p>
                          </td>
                          <td className="py-1 px-2 text-left align-middle">
                            <div className="flex min-h-[18px] w-full flex-col justify-center gap-1">
                              {(() => {
                                if (isRecording(record)) {
                                  return <span className="text-gray-500 dark:text-gray-400">—</span>;
                                }
                                const mergePct = toPercent(record?.merge_percentage);
                                const uploadPct = toPercent(record?.upload_percentage);
                                if (mergePct === null && uploadPct === null) {
                                  return <span className="text-gray-500 dark:text-gray-400">—</span>;
                                }
                                const ProgressLine = ({
                                  label,
                                  pct,
                                  labelClass,
                                  fillClass,
                                  textClass,
                                }: {
                                  label: string;
                                  pct: number;
                                  labelClass: string;
                                  fillClass: string;
                                  textClass: string;
                                }) => (
                                  <div className="flex w-full items-center gap-1.5">
                                    <span className={`w-4 text-[10px] font-semibold ${labelClass}`}>{label}</span>
                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
                                      <motion.div
                                        className={`h-full rounded-full ${fillClass}`}
                                        style={{ width: `${pct}%` }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                      />
                                    </div>
                                    <span className={`w-8 text-right text-[10px] font-medium ${textClass}`}>{pct}%</span>
                                  </div>
                                );
                                return (
                                  <>
                                    <ProgressLine
                                      label="M"
                                      pct={mergePct ?? 0}
                                      labelClass="text-slate-700 dark:text-slate-200"
                                      fillClass="bg-blue-500"
                                      textClass="text-slate-700 dark:text-slate-200"
                                    />
                                    <ProgressLine
                                      label="U"
                                      pct={uploadPct ?? 0}
                                      labelClass="text-slate-700 dark:text-slate-200"
                                      fillClass="bg-emerald-500"
                                      textClass="text-slate-700 dark:text-slate-200"
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-1 px-2 text-left align-middle">
                            <div className="flex min-h-[18px] items-center justify-start">
                              <ActionsMenuNew
                                isLast={index >= rows.length - 3}
                                record={record}
                                isLoading={isLoading}
                                loaderIcon={loaderIcon}
                                stopRecord={stopRecord}
                                openPreviewModal={openPreviewModal}
                                openShellModal={openShellModal}
                                startRecord={startRecord}
                                clearRecord={clearRecord}
                                reboot={reboot}
                                shutDown={shutDown}
                                reFresh={reFresh}
                                storageClear={storageClear}
                                startReMerging={startReMerging}
                                trash={trash}
                                shell={element.shell}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            </div>
          </div>
      </td>
        )}
      {!isV3 && (
      <td className="py-0">
        {(() => {
          const uploadingCount = recsV3.filter((r: any) => isUploading(r)).length;
          const mergingCount = baseRecs.filter((r: any) => resolveRecordingStatus(r) === 1).length;
          const ongoingCount =
            mergingCount + baseRecs.filter((r: any) => resolveRecordingStatus(r) === 2).length;
          if (ongoingCount === 0) return null;
          return (
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => {
                  setExpandedRows((prev) => ({
                    ...prev,
                    [rowExpandKey]: !prev[rowExpandKey],
                  }));
                }}
                className="text-[10px] px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                title={isExpanded ? 'Hide ongoing details' : 'Show ongoing details'}
              >
                <span className="px-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">M:{mergingCount}</span>
                <span className="px-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">U:{uploadingCount}</span>
              </button>
            </div>
          );
        })()}
        <div className={isExpanded ? 'max-h-40 overflow-y-auto pr-1' : ''}>
          <table className="w-full table-fixed">
            <tbody>
            {rows
              .filter((item) =>
                item?._pending ||
                item?._idle ||
                Object.values(item).some((value) =>
                  String(value)
                    .toLowerCase()
                    .includes(inputValue.toLowerCase()),
                ),
              )
              .map((record, index) => {
                if (isV3 && record._idle) {
                  return (
                    <tr
                      key={`${element.pi_id}-idle-${index}`}
                      className="border-b border-gray-100 dark:border-strokedark/50 last:border-0"
                    >
                      <td colSpan={7} className="py-0.5 px-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center justify-center gap-2 flex-1 text-center">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] text-gray-300">Idle</span>
                          </div>
                          <div className="flex justify-center">
                            <ActionsMenuNew
                              isLast={index >= rows.length - 3}
                              record={record}
                              isLoading={isLoading}
                              loaderIcon={loaderIcon}
                              stopRecord={stopRecord}
                              openPreviewModal={openPreviewModal}
                              openShellModal={openShellModal}
                              startRecord={startRecord}
                              clearRecord={clearRecord}
                              reboot={reboot}
                              shutDown={shutDown}
                              reFresh={reFresh}
                              storageClear={storageClear}
                              startReMerging={startReMerging}
                              trash={trash}
                              shell={element.shell}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr
                    key={`${element.pi_id}-${record.id || record.batch_id || record.filename || record.date || 'rec'}-${index}`}
                    className="border-b border-gray-100 dark:border-strokedark/50 last:border-0"
                  >
                    <React.Fragment>
                      <td className={isV3 ? "w-[160px] py-0.5 px-2 text-center" : "w-[180px] py-0.5 px-2"}>
                        <div className={isV3 ? "flex min-h-[20px] items-center justify-center gap-1 w-full leading-none" : "flex min-h-[20px] items-center gap-2 leading-none"}>
                          <div className="relative inline-flex h-3.5 w-3.5 flex-shrink-0 self-center items-center justify-center">
                            <span
                              className={`animate-ping absolute inset-0 rounded-full inline-flex border-2 border-white ${
                                record.pi_id != 0 && isRecording(record)
                                  ? 'bg-meta-7'
                                  : isUploading(record)
                                  ? 'bg-meta-6'
                                  : isMerging(record)
                                  ? 'bg-primary'
                                  : 'bg-meta-3'
                              }`}
                            />
                            <span
                              className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white ${
                                record.pi_id != 0 && isRecording(record)
                                  ? 'bg-meta-7'
                                  : isUploading(record)
                                  ? 'bg-meta-6'
                                  : isMerging(record)
                                  ? 'bg-primary'
                                  : 'bg-meta-3'
                              }`}
                            ></span>
                          </div>
                          {(() => {
                            if (!isV3) {
                              return (
                                <div
                                  className="flex-1 truncate text-sm leading-none"
                                  data-twe-toggle="tooltip"
                                  data-twe-placement="top"
                                  data-twe-ripple-init
                                  data-twe-ripple-color="light"
                                  title={batches[record.batch_id]}
                                >
                                  {batches[record.batch_id]}
                                </div>
                              );
                            }
                            const batchLabel =
                              record._pending
                                ? record.batch_id
                                : batches[record.batch_id] ||
                                  record.recording_key ||
                                  record.filename ||
                                  (record.batch_id ? record.batch_id : '—');
                            const displayLabel =
                              record._idle || record.id === 0 ? '—' : batchLabel;
                            const segmentMeta =
                              record.last_segment_index !== undefined ||
                              record.last_segment_size_mb !== undefined
                                ? `Seg ${record.last_segment_index ?? '—'} | ${record.last_segment_size_mb ?? '—'} MB`
                                : '';
                            const line = segmentMeta
                              ? `${displayLabel} • ${segmentMeta}`
                              : displayLabel;
                            return (
                              <div
                                className={isV3 ? "w-full truncate text-center text-sm leading-none" : "flex-1 truncate text-sm leading-none"}
                                data-twe-toggle="tooltip"
                                data-twe-placement="top"
                                data-twe-ripple-init
                                data-twe-ripple-color="light"
                                title={
                                  record._idle
                                    ? 'Idle'
                                    : record._pending
                                    ? record.batch_id
                                    : line
                                }
                              >
                                {line}
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className={isV3 ? "w-[120px] py-0.5 px-2 text-center" : "w-[140px] py-0.5 px-2"}>
                        <p className={isV3 ? "text-xs" : "text-xs"}>
                          <span>{record._idle ? '—' : formatRecordDate(record.created_at || record.date)}</span>
                        </p>
                      </td>
                      <td className={isV3 ? "w-[100px] py-0.5 px-2 text-center" : "w-[120px] py-0.5 px-2"}>
                        {record._idle ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400">—</div>
                        ) : record._pending ? (
                          <div className={isV3 ? "flex items-center justify-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 animate-pulse" : "flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 animate-pulse"}>
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
                            {record.status === 0 ? 'Starting recording...' : 'Stopping recording...'}
                          </div>
                        ) : (() => {
                          const seg = record.segment_growing;
                          const ok = record.recording_ok;
                          if (!isV3) {
                            return (record.video_size || record.audio_size) ? (
                              <div className="flex flex-col gap-0.5">
                                <motion.div
                                  key={`video-${record.id ?? record.batch_id ?? record.filename ?? index}`}
                                  variants={textVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{ duration: 0.5 }}
                                  className="flex items-center gap-1"
                                >
                                  <HiVideoCamera
                                    className={`w-3 h-3 ${
                                      record.error === 1 || record.error === 3
                                        ? 'text-red-500'
                                        : 'text-blue-500'
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] ${
                                      record.error === 1 || record.error === 3
                                        ? 'text-red-500 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {record.video_size || '0MB'}
                                  </span>
                                  {(record.error === 1 || record.error === 3) && (
                                    <span
                                      className="text-red-500 text-[10px] animate-pulse"
                                      title="Video Stalled"
                                    >
                                      ⚠
                                    </span>
                                  )}
                                </motion.div>
                                <motion.div
                                  key={`audio-${record.id ?? record.batch_id ?? record.filename ?? index}`}
                                  variants={textVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{ duration: 0.5 }}
                                  className="flex items-center gap-1"
                                >
                                  <IoIosMic
                                    className={`w-3 h-3 ${
                                      record.error === 2 || record.error === 3
                                        ? 'text-red-500'
                                        : 'text-green-500'
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] ${
                                      record.error === 2 || record.error === 3
                                        ? 'text-red-500 font-semibold'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {record.audio_size || '0MB'}
                                  </span>
                                  {(record.error === 2 || record.error === 3) && (
                                    <span
                                      className="text-red-500 text-[10px] animate-pulse"
                                      title="Audio Stalled"
                                    >
                                      ⚠
                                    </span>
                                  )}
                                </motion.div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400">—</div>
                            );
                          }
                          if (seg === undefined && ok === undefined) {
                            return (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">—</div>
                            );
                          }
                          const bothZero = seg === 0 && ok === 0;
                          const anyZero = seg === 0 || ok === 0;
                          const label = bothZero ? 'Alert' : anyZero ? 'Warning' : 'Healthy';
                          const color = bothZero
                            ? 'bg-red-500 text-red-700 dark:text-red-300'
                            : anyZero
                            ? 'bg-amber-500 text-amber-700 dark:text-amber-300'
                            : 'bg-green-500 text-green-700 dark:text-green-300';
                          return (
                            <div className={isV3 ? "flex items-center justify-center gap-1 text-[10px]" : "flex items-center gap-2 text-[10px]"}>
                              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
                              <span className="font-medium">{label}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className={isV3 ? "w-[70px] py-0.5 px-2 text-center" : "w-[80px] py-0.5 px-2 text-center"}>
                        <motion.span
                            key={`duration-${record.id ?? record.batch_id ?? record.filename ?? index}`}
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.5 }}
                            className={isV3 ? "text-xs" : "text-xs"}
                          >
                          {record.duration}
                          </motion.span>
                      </td>
                      <td className={isV3 ? "w-[70px] py-0.5 px-2 text-center" : "w-[90px] py-0.5 px-2 text-center"}>
                        <p className={isV3 ? "text-xs" : "text-xs"}>
                          {' '}
                          {record._idle
                            ? 'Idle'
                            : record._pending
                            ? record.status === 0
                              ? 'Starting'
                              : 'Stopping'
                            : record.id == 0
                            ? 'Idle'
                            : isV3
                            ? isRecording(record)
                              ? 'Recording'
                              : isUploading(record)
                              ? 'Uploading'
                              : isMerging(record)
                              ? 'Merging'
                              : resolveRecordingStatus(record) === 9
                              ? 'Failed'
                              : 'Completed'
                            : resolveRecordingStatus(record) === 1
                            ? 'Merging'
                            : resolveRecordingStatus(record) === 2
                            ? 'Uploading'
                            : resolveRecordingStatus(record) === 0
                            ? 'Recording'
                            : resolveRecordingStatus(record) === 9
                            ? 'Failed'
                            : 'Completed'}
                        </p>
                      </td>
                      <td className={isV3 ? "w-[120px] py-0.5 px-1 text-center" : "w-[140px] py-0.5 px-1"}>
                        {(() => {
                          if (record._idle || record._pending || isRecording(record)) {
                            return <span className="text-[10px] text-gray-500 dark:text-gray-400">—</span>;
                          }

                          const mergePct = toPercent(record?.merge_percentage);
                          const uploadPct = toPercent(record?.upload_percentage);
                          if (mergePct === null && uploadPct === null) {
                            return <span className="text-[10px] text-gray-500 dark:text-gray-400">—</span>;
                          }

                          const ProgressLine = ({
                            label,
                            pct,
                            labelClass,
                            fillClass,
                            textClass,
                          }: {
                            label: string;
                            pct: number;
                            labelClass: string;
                            fillClass: string;
                            textClass: string;
                          }) => (
                            <div className="flex w-full items-center gap-1.5">
                              <span className={`w-4 text-[10px] font-semibold ${labelClass}`}>{label}</span>
                              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
                                <motion.div
                                  className={`h-full rounded-full ${fillClass}`}
                                  style={{ width: `${pct}%` }}
                                  transition={{ duration: 0.45, ease: 'easeOut' }}
                                />
                              </div>
                              <span className={`w-8 text-right text-[10px] font-medium ${textClass}`}>{pct}%</span>
                            </div>
                          );

                          return (
                            <div className={isV3 ? "flex flex-col items-center gap-0.5" : "flex flex-col gap-0.5"}>
                              <ProgressLine
                                label="M"
                                pct={mergePct ?? 0}
                                labelClass="text-slate-700 dark:text-slate-200"
                                fillClass="bg-blue-500"
                                textClass="text-slate-700 dark:text-slate-200"
                              />
                              <ProgressLine
                                label="U"
                                pct={uploadPct ?? 0}
                                labelClass="text-slate-700 dark:text-slate-200"
                                fillClass="bg-emerald-500"
                                textClass="text-slate-700 dark:text-slate-200"
                              />
                            </div>
                          );
                        })()}
                      </td>
                      <td className={isV3 ? "w-[90px] py-0.5 px-2 text-center" : "w-[100px] py-0.5 px-2"}>
                        <div className={isV3 ? "flex justify-center" : ""}>
                          <ActionsMenuNew
                            isLast={index >= rows.length - 3}
                            record={record}
                            isLoading={isLoading}
                            loaderIcon={loaderIcon}
                            stopRecord={stopRecord}
                            openPreviewModal={openPreviewModal}
                            openShellModal={openShellModal}
                            startRecord={startRecord}
                            clearRecord={clearRecord}
                            reboot={reboot}
                            shutDown={shutDown}
                            reFresh={reFresh}
                            storageClear={storageClear}
                            startReMerging={startReMerging}
                            trash={trash}
                            shell={element.shell}
                          />
                        </div>
                      </td>
                    </React.Fragment>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
      )}
    </motion.tr>
  );
}), (prevProps, nextProps) => {
  // Custom comparison for memoization - only re-render if these change
  return (
    prevProps.element.pi_id === nextProps.element.pi_id &&
    prevProps.element._rowIndex === nextProps.element._rowIndex &&
    prevProps.indexs === nextProps.indexs &&
    JSON.stringify(prevProps.element.recordings) === JSON.stringify(nextProps.element.recordings) &&
    (prevProps.element.devices?.camera ?? 0) === (nextProps.element.devices?.camera ?? 0) &&
    (prevProps.element.devices?.mic ?? 0) === (nextProps.element.devices?.mic ?? 0) &&
    (prevProps.element.stats?.storage?.used_storage ?? 0) ===
      (nextProps.element.stats?.storage?.used_storage ?? 0) &&
    prevProps.element.sw_version === nextProps.element.sw_version &&
    prevProps.element.network_speed === nextProps.element.network_speed &&
    !!prevProps.appChannelOnline?.[String(prevProps.element?.pi_id)] ===
      !!nextProps.appChannelOnline?.[String(nextProps.element?.pi_id)] &&
    prevProps.expandedRows[String(prevProps.element?.pi_id ?? prevProps.indexs)] ===
      nextProps.expandedRows[String(nextProps.element?.pi_id ?? nextProps.indexs)] &&
    prevProps.rowFilters?.[String(prevProps.element?.pi_id ?? prevProps.indexs)] ===
      nextProps.rowFilters?.[String(nextProps.element?.pi_id ?? nextProps.indexs)] &&
    prevProps.inputValue === nextProps.inputValue
  );
});

const Pi_Casting = () => {
  var arrayOfRecording = [];
  var allRecording = [];
  const context = useContext(SearchContext);
  const { inputValue } = context;
  if (!context) {
    throw new Error('getSearchValue must be used within a SearchProvider');
  }
  const [availablePi, setavailablePi] = useState<string[]>([]);
  const [venues, setVenues] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [isPreviewModalOpen, setisPreviewModalOpen] = useState(false);
  const [isShellModalOpen, setisShellModalOpen] = useState(false);
  const [isShellMinimized, setIsShellMinimized] = useState(false);
  const [shellUrl, setShellUrl] = useState('');
  const [shellWindowBlocked, setShellWindowBlocked] = useState(false);
  const shellWindowRef = useRef<Window | null>(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [selectedId, setSelectedId] = useState(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const timerRefs = useRef({});
  const [pages, setpages] = useState(1);
  // Track which rows have their recordings expanded (per main row index)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [rowFilters, setRowFilters] = useState<Record<string, string | null>>({});
  const allPisRef = useRef<{ [key: string]: any }>({});
  const deviceKeyAliasesRef = useRef<Record<string, string>>({});
  const lastGoodRef = useRef<Record<string, { recordingsTs?: number }>>({});
  let piBtnDisabled = {};
  const [datas, setDatas] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<Record<string, { type: 'start' | 'stop'; ts: number }>>({});
  const [appChannelOnline, setAppChannelOnline] = useState<Record<string, boolean>>({});
  const [recordings, setRecordings] = useState<{ [key: string]: any }>({});
  const [styleLoader, hideLoader] = useState('block');
  const [isLoading, setLoading] = useState(false);
  const appChannelTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  // const rowVariants = {
  //   hidden: { opacity: 0, y: 10 },
  //   visible: { opacity: 1, y: 0 },
  //   exit: { opacity: 0, y: -10 },
  // };

  const textVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: { duration: 0.2, ease: "easeInOut" },
        scale: { duration: 0.2, ease: "easeInOut" },
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  };

  const summary = useMemo(() => {
    const classify = (r: any): 'recording' | 'uploading' | 'merging' | 'other' => {
      const status = resolveRecordingStatus(r);
      if (status === 0) return 'recording';
      if (status === 1) return 'merging';
      if (status === 2) return 'uploading';

      return 'other';
    };

    let recordingTotal = 0;
    let uploadingTotal = 0;
    let mergingTotal = 0;
    let idleConnections = 0;

    datas.forEach((device: any) => {
      const recs = Array.isArray(device?.recordings) ? device.recordings : [];
      const recFromPayload = device?.recording;
      const hasPayloadCounters = recFromPayload && typeof recFromPayload === 'object';

      const fallbackRecording = recs.filter((r: any) => classify(r) === 'recording').length;
      const fallbackUploading = recs.filter((r: any) => classify(r) === 'uploading').length;
      const fallbackMerging = recs.filter((r: any) => classify(r) === 'merging').length;

      const recRecording = hasPayloadCounters
        ? recFromPayload.active === true
          ? 1
          : 0
        : fallbackRecording;
      const recUploading = hasPayloadCounters
        ? Number(recFromPayload.uploading_count ?? 0)
        : fallbackUploading;
      const recMerging = hasPayloadCounters
        ? Number(recFromPayload.merging_count ?? 0)
        : fallbackMerging;

      recordingTotal += recRecording;
      uploadingTotal += recUploading;
      mergingTotal += recMerging;

      const pending = pendingActions?.[String(device?.pi_id)];
      const hasActiveState =
        recRecording > 0 || recUploading > 0 || recMerging > 0 || !!pending;
      if (!hasActiveState) idleConnections += 1;
    });

    return {
      onlineDevices: datas.length,
      recordingTotal,
      mergingTotal,
      uploadingTotal,
      idleConnections,
    };
  }, [datas, pendingActions]);

  const selectedPi = useMemo(
    () => datas.find((item: any) => String(item?.pi_id) === String(selectedId)),
    [datas, selectedId],
  );

  const selectedPreview = useMemo(() => {
    const previewObj = selectedPi?.preview ?? {};
    const enabledRaw = previewObj?.enabled ?? selectedPi?.preview_enabled ?? 1;
    const showNoPreviewIconRaw =
      previewObj?.show_no_preview_icon ?? selectedPi?.show_no_preview_icon ?? 0;
    const previewStatus = String(
      previewObj?.status ?? selectedPi?.preview_status ?? '',
    ).toLowerCase();
    const previewMessage =
      previewObj?.message ?? selectedPi?.preview_message ?? 'Preview unavailable';
    const previewLastImageUrl =
      previewObj?.last_image_url ?? selectedPi?.preview_last_image_url ?? '';

    return {
      enabled: Number(enabledRaw) === 1 || enabledRaw === true,
      showNoPreviewIcon:
        Number(showNoPreviewIconRaw) === 1 || showNoPreviewIconRaw === true,
      status: previewStatus,
      message: previewMessage,
      lastImageUrl: previewLastImageUrl,
    };
  }, [selectedPi]);

  const previewImageSrc = useMemo(() => {
    const rawUrl =
      selectedPreview?.lastImageUrl ||
      (selectedId
        ? `https://api.tickleright.in/cam_image/image_${selectedId}.jpg`
        : '');
    if (!rawUrl) return '';
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}t=${timestamp}`;
  }, [selectedPreview?.lastImageUrl, selectedId, timestamp]);

  useEffect(() => {
    setPreviewImageFailed(false);
  }, [selectedId, isPreviewModalOpen, selectedPreview?.lastImageUrl]);

  const buildDefaultRecording = (piId: string, devices: any = {}) => ({
    id: 0,
    pi_id: piId,
    camera: devices?.camera,
    mic: devices?.mic,
    batch_id: 0,
    date: '',
    filename: '',
    video_size: '',
    audio_size: '',
    duration: '',
    file_id: null,
    recording: 0,
    merge: 0,
    merge_percentage: 0,
    upload: 0,
    upload_percentage: 0,
    sync: 0,
    created_at: '',
    modified_at: '',
  });

  const normalizeV3Recording = (
    statusObj: any = {},
    piId: string,
    devices: any = {},
    idx = 0,
  ) => {
    let state = (statusObj?.state || '').toLowerCase();
    if (!state) {
      if (statusObj?.is_uploading) state = 'uploading';
      else if (statusObj?.is_recording) state = 'recording';
    }
    const statusMap: Record<string, number> = {
      recording: 0,
      merging: 1,
      uploading: 2,
      completed: 3,
      failed: 9,
      error: 9,
    };
    const status =
      Number.isFinite(Number(statusObj?.status))
        ? Number(statusObj?.status)
        : statusMap[state] ?? resolveRecordingStatus(statusObj);
    const start = statusObj?.start_time || statusObj?.started_at;
    const parsedStart = parseToDateTime(start);
    const formattedDate = parsedStart
      ? parsedStart.toFormat('yyyy-MM-dd HH:mm:ss')
      : start
      ? String(start)
      : '';

    const createdAt = statusObj?.created_at ?? formattedDate ?? '';
    const flags = applyStatusFlags(
      {
        ...statusObj,
        merge_percentage: statusObj?.merge_percentage,
        upload_percentage: statusObj?.upload_percentage,
      },
      status,
    );

    return {
      id: statusObj?.id ?? idx ?? 0,
      pi_id: piId,
      camera: devices?.camera ?? 0,
      mic: devices?.mic ?? 0,
      batch_id: statusObj?.batch_id ?? 0,
      date: createdAt,
      filename: statusObj?.filename ?? '',
      video_size: statusObj?.video_size ?? '',
      audio_size: statusObj?.audio_size ?? '',
      duration: statusObj?.duration ?? '',
      file_id: statusObj?.file_id ?? null,
      recording: flags.recording,
      merge: flags.merge,
      merge_percentage: flags.merge_percentage,
      upload: flags.upload,
      upload_percentage: flags.upload_percentage,
      sync: flags.sync,
      status: flags.status,
      created_at: createdAt,
      modified_at: statusObj?.modified_at ?? '',
      status_text: statusObj?.status_text ?? state,
      expected_end_time: statusObj?.expected_end_time,
      state,
      error: flags.error,
      s3_key: statusObj?.s3_key,
      s3_bucket: statusObj?.s3_bucket,
    };
  };

  const normalizeRecordingEntry = (record: any = {}, piId: string, devices: any = {}) => {
    const status = resolveRecordingStatus(record);
    const flags = applyStatusFlags(record, status);

    const dateSource = record?.created_at || record?.date || record?.modified_at;

    return {
      id: record?.id ?? 0,
      pi_id: record?.pi_id ?? piId,
      camera: record?.camera ?? devices?.camera ?? 0,
      mic: record?.mic ?? devices?.mic ?? 0,
      batch_id: record?.batch_id ?? 0,
      date: dateSource ?? '',
      filename: record?.filename ?? '',
      video_size: record?.video_size ?? '',
      audio_size: record?.audio_size ?? '',
      duration: record?.duration ?? '',
      file_id: record?.file_id ?? null,
      recording: flags.recording,
      merge: flags.merge,
      merge_percentage: Math.max(
        toNum(record?.merge_percentage, 0),
        toNum(flags.merge_percentage, 0),
      ),
      upload: flags.upload,
      upload_percentage: Math.max(
        toNum(record?.upload_percentage, 0),
        toNum(flags.upload_percentage, 0),
      ),
      sync: flags.sync,
      status: flags.status,
      created_at: record?.created_at ?? dateSource ?? '',
      modified_at: record?.modified_at ?? '',
      status_text: record?.status_text ?? record?.state ?? '',
      recording_key: record?.recording_key,
      error: flags.error,
      storage_type: record?.storage_type,
      s3_key: record?.s3_key,
      s3_bucket: record?.s3_bucket,
    };
  };

  const normalizePayload = (raw: any) => {
    let message = raw?.message ?? raw?.data ?? raw?.payload ?? raw;
    if (!message) return null;

    // Handle stringified JSON payloads
    if (typeof message === 'string') {
      try {
        message = JSON.parse(message);
      } catch {
        return null;
      }
    }

    // Unwrap nested data envelopes if present
    if (message?.data) {
      let inner = message.data;
      if (typeof inner === 'string') {
        try {
          inner = JSON.parse(inner);
        } catch {
          inner = null;
        }
      }
      if (inner) message = inner;
    }

    const explicitPiId = message?.pi_id;
    const serialNo = message?.serial_no;
    const deviceId = message?.device_id;
    const piId =
      explicitPiId ??
      message?.recordings?.[0]?.pi_id ??
      serialNo ??
      message?.id ??
      deviceId ??
      null;

    if (piId) {
      message.pi_id = piId;
    }

    const isV3Payload =
      isModernSwVersion(message?.sw_version) ||
      message?.recording_status ||
      message?.recordings_status ||
      message?.recording ||
      message?.resources ||
      message?.network ||
      (message?.type === 'status' && message?.serial_no);

    if (isV3Payload) {
      const recordingSummary =
        message?.recording && typeof message.recording === 'object' ? message.recording : null;
      const groupedPriority = message?.recordings && !Array.isArray(message.recordings)
        ? Array.isArray(message.recordings.priority)
          ? message.recordings.priority
          : []
        : [];
      const groupedOther = message?.recordings && !Array.isArray(message.recordings)
        ? Array.isArray(message.recordings.other)
          ? message.recordings.other
          : []
        : [];
      const flatRecordings = Array.isArray(message?.recordings) ? message.recordings : [];
      const statusesRaw = message?.recordings_status ?? message?.recording_status ?? [];
      const statuses = Array.isArray(statusesRaw)
        ? statusesRaw.filter(Boolean)
        : statusesRaw
        ? [statusesRaw]
        : [];
      const hasDetailedRecordingPayload =
        groupedPriority.length > 0 ||
        groupedOther.length > 0 ||
        flatRecordings.length > 0 ||
        statuses.length > 0 ||
        !!message?.active_recording ||
        (Array.isArray(message?.uploading_recordings) && message.uploading_recordings.length > 0);
      const hasSummaryOnlyActiveState =
        !!recordingSummary &&
        (
          recordingSummary.active === true ||
          recordingSummary.merging === true ||
          Number(recordingSummary.uploading_count ?? 0) > 0 ||
          Number(recordingSummary.merging_count ?? 0) > 0
        );
      const inferredMinimalPayload =
        !hasDetailedRecordingPayload && hasSummaryOnlyActiveState;
      const payloadMode =
        message?.payload_mode === 'minimal' || inferredMinimalPayload ? 'minimal' : 'full';
      const deviceAliases = Array.from(
        new Set(
          [explicitPiId, piId, serialNo, deviceId]
            .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
            .map((value) => String(value)),
        ),
      );
      // Map new v3 payload shape to existing UI fields
      const mappedDevices = message?.devices
        ? {
            camera: message.devices.camera ?? (message.devices.camera_connected ? 1 : 0),
            mic: message.devices.mic ?? (message.devices.mic_connected ? 1 : 0),
            cpu_temperature:
              message.devices.cpu_temperature ??
              message.devices.cpu_temp ??
              message.devices.cpu_temp_c,
          }
        : undefined;

      const mappedStats = message?.resources
        ? {
            storage: {
              total_storage: message.resources.storage?.total_gb,
              used_storage: message.resources.storage?.used_gb,
              free_storage: message.resources.storage?.free_gb,
            },
            ram: {
              total_ram: message.resources.ram?.total_gb,
              used_ram: message.resources.ram?.used_gb,
              free_ram: message.resources.ram?.free_gb,
            },
          }
        : message?.stats;

      const mappedNetworkSpeed =
        message?.network?.speed_mbps ?? message?.network_speed ?? message?.networkSpeed;
      const wantsActiveRecording = message?.recording?.active === true;

      const base = {
        ...message,
        payload_mode: payloadMode,
        pi_id: piId,
        canonical_pi_id:
          explicitPiId !== undefined && explicitPiId !== null && String(explicitPiId).trim() !== ''
            ? String(explicitPiId)
            : null,
        device_aliases: deviceAliases,
        venue_id:
          message?.venue_id ??
          message?.venue ??
          message?.location_id ??
          message?.campus_id ??
          null,
        devices: mappedDevices ?? message?.devices,
        stats: mappedStats,
        network_speed: mappedNetworkSpeed,
        recordings: [] as any[],
        active_recording: message?.active_recording ?? null,
        uploading_recordings: message?.uploading_recordings ?? [],
        lastFullRecordings: [] as any[],
        lastRenderedRecordings: [] as any[],
        renderActiveRecording: null as any,
        renderUploadingRecordings: [] as any[],
        renderRowsSnapshot: [] as any[],
      };

      // New schema: state/recording summary
      if (message?.recording) {
        if (!message.recording.active) {
          base.active_recording = null;
        }
        if (typeof message.recording.uploading_count === 'number') {
          base.uploading_recordings = base.uploading_recordings ?? [];
        }
      }

      // New v3 schema: recordings grouped by priority/other
      if (message?.recordings && !Array.isArray(message.recordings)) {
        base.recordings = [...groupedPriority, ...groupedOther].map((rec: any) =>
          normalizeRecordingEntry(rec, piId, message?.devices),
        );
      } else if (flatRecordings.length > 0) {
        // Legacy v3 array
        base.recordings = flatRecordings.map((rec: any) =>
          normalizeRecordingEntry(rec, piId, message?.devices),
        );
      } else {
        if (statuses.length) {
          base.recordings = statuses.map((statusObj: any, idx: number) =>
            normalizeV3Recording(statusObj, piId, message?.devices, idx),
          );
        }
      }

      const hasRealRecording = base.recordings.some(
        (rec: any) => resolveRecordingStatus(rec) === 0,
      );
      if (wantsActiveRecording && !hasRealRecording) {
        const activeFlags = applyStatusFlags({}, 0);
        base.active_recording = {
          ...(base.active_recording ?? {}),
          pi_id: piId,
          id: `active-${piId}`,
          status: activeFlags.status,
          status_text: 'recording',
          state: 'recording',
          recording: activeFlags.recording,
          merge: activeFlags.merge,
          upload: activeFlags.upload,
          sync: activeFlags.sync,
          error: activeFlags.error,
        };
      } else if (hasRealRecording) {
        base.active_recording = null;
      }

      return base;
    }

    return message;
  };

  const mergeMessage = (incoming: any) => {
    if (!incoming?.pi_id) return { storeKey: '', ...incoming };
    const aliases = Array.isArray(incoming?.device_aliases)
      ? incoming.device_aliases
          .filter((value: any) => value !== undefined && value !== null && String(value).trim() !== '')
          .map((value: any) => String(value))
      : [String(incoming.pi_id)];
    const aliasHits = aliases
      .map((alias: string) => deviceKeyAliasesRef.current[alias])
      .filter(Boolean);
    const prevKey = Array.from(new Set(aliasHits)).find(
      (key) => key && allPisRef.current[key],
    );
    const storeKey =
      incoming?.canonical_pi_id && String(incoming.canonical_pi_id).trim() !== ''
        ? String(incoming.canonical_pi_id)
        : prevKey || String(incoming.pi_id);
    const prev = (prevKey && allPisRef.current[prevKey]) || allPisRef.current[storeKey] || {};
    aliases.forEach((alias: string) => {
      deviceKeyAliasesRef.current[alias] = storeKey;
    });
    if (prevKey && prevKey !== storeKey) {
      if (timerRefs.current[prevKey]) {
        clearTimeout(timerRefs.current[prevKey]);
        delete timerRefs.current[prevKey];
      }
      if (lastGoodRef.current[prevKey]) {
        lastGoodRef.current[storeKey] = {
          ...(lastGoodRef.current[storeKey] || {}),
          ...lastGoodRef.current[prevKey],
        };
        delete lastGoodRef.current[prevKey];
      }
      delete allPisRef.current[prevKey];
    }
    const now = Date.now();
    const isV3Incoming =
      isModernSwVersion(incoming?.sw_version) ||
      incoming?.active_recording !== undefined ||
      incoming?.uploading_recordings !== undefined;
    const payloadMode = incoming?.payload_mode === 'minimal' ? 'minimal' : 'full';
    const isMinimalIncoming = isV3Incoming && payloadMode === 'minimal';
    const prevLastFullRecordings = Array.isArray(prev?.lastFullRecordings)
      ? prev.lastFullRecordings
      : Array.isArray(prev?.recordings)
      ? prev.recordings
      : [];
    const prevLastRenderedRecordings = Array.isArray(prev?.lastRenderedRecordings)
      ? prev.lastRenderedRecordings
      : prevLastFullRecordings;
    const prevRenderRowsSnapshot = Array.isArray(prev?.renderRowsSnapshot)
      ? prev.renderRowsSnapshot
      : [];

    let recordings = incoming.recordings;
    if (isV3Incoming) {
      if (isMinimalIncoming) {
        recordings = prevLastFullRecordings;
      } else {
        recordings = Array.isArray(incoming.recordings) ? incoming.recordings : [];
        lastGoodRef.current[storeKey] = {
          ...lastGoodRef.current[storeKey],
          recordingsTs: now,
        };
      }
    } else if (Array.isArray(recordings) && recordings.length > 0) {
      lastGoodRef.current[storeKey] = {
        ...lastGoodRef.current[storeKey],
        recordingsTs: now,
      };
    } else if (recordings === undefined) {
      recordings = prev.recordings;
    } else if (Array.isArray(recordings) && recordings.length === 0) {
      const lastTs = lastGoodRef.current[storeKey]?.recordingsTs;
      if (lastTs && now - lastTs < 15000) {
        recordings = prev.recordings;
      }
    }

    const mergedDevices = isV3Incoming
      ? incoming.devices ?? {}
      : incoming.devices
      ? { ...(prev.devices || {}), ...incoming.devices }
      : prev.devices;
    const mergedStats = isV3Incoming
      ? incoming.stats ?? {}
      : incoming.stats
      ? {
          ...(prev.stats || {}),
          ...incoming.stats,
          storage: {
            ...(prev.stats?.storage || {}),
            ...(incoming.stats?.storage || {}),
          },
          ram: {
            ...(prev.stats?.ram || {}),
            ...(incoming.stats?.ram || {}),
          },
        }
      : prev.stats;

    if (isV3Incoming) {
      const lastFullRecordings = isMinimalIncoming ? prevLastFullRecordings : recordings;
      const lastRenderedRecordings = isMinimalIncoming
        ? prevLastRenderedRecordings
        : recordings;
      const renderActiveRecording = isMinimalIncoming
        ? prev.renderActiveRecording ?? prev.active_recording ?? incoming.active_recording ?? null
        : incoming.active_recording ?? null;
      const renderUploadingRecordings = isMinimalIncoming
        ? prev.renderUploadingRecordings ?? prev.uploading_recordings ?? incoming.uploading_recordings ?? []
        : incoming.uploading_recordings ?? [];
      const minimalSeedRows = mergeRecordingLists(
        [
          ...(renderActiveRecording ? [renderActiveRecording] : []),
          ...renderUploadingRecordings,
        ].map((rec: any) =>
          normalizeRecordingEntry(rec, String(incoming?.pi_id ?? storeKey), incoming?.devices),
        ),
        prevLastRenderedRecordings,
      );
      const renderRowsSnapshot = isMinimalIncoming
        ? prevRenderRowsSnapshot.length > 0
          ? prevRenderRowsSnapshot
          : minimalSeedRows
        : mergeRecordingLists(
            [
              ...(renderActiveRecording ? [renderActiveRecording] : []),
              ...renderUploadingRecordings,
            ].map((rec: any) =>
              normalizeRecordingEntry(rec, String(incoming?.pi_id ?? storeKey), incoming?.devices),
            ),
            lastRenderedRecordings,
          );

      return {
        storeKey,
        ...prev,
        ...incoming,
        payload_mode: payloadMode,
        devices: incoming.devices ?? prev.devices ?? {},
        stats: incoming.stats ?? prev.stats ?? {},
        network_speed: incoming.network_speed ?? prev.network_speed,
        recordings,
        lastFullRecordings,
        lastRenderedRecordings,
        active_recording: isMinimalIncoming
          ? prev.active_recording ?? incoming.active_recording ?? null
          : incoming.active_recording ?? null,
        uploading_recordings: isMinimalIncoming
          ? prev.uploading_recordings ?? incoming.uploading_recordings ?? []
          : incoming.uploading_recordings ?? [],
        renderActiveRecording,
        renderUploadingRecordings,
        renderRowsSnapshot,
      };
    }

    return {
      storeKey,
      ...(isV3Incoming ? {} : prev),
      ...incoming,
      devices: mergedDevices,
      stats: mergedStats,
      recordings,
    };
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authUrl = 'https://api.tickleright.in/api/broadcasting/auth';
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
      authorizer: (channel: any) => ({
        authorize: async (socketId: string, callback: any) => {
          try {
            if (!token) {
              callback(new Error('Missing auth token'), { auth: '' });
              return;
            }
            const response = await fetch(authUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                channel_name: channel.name,
                socket_id: socketId,
              }),
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok || !body?.auth) {
              callback(new Error(`Auth failed: ${response.status}`), body);
              return;
            }
            callback(null, body);
          } catch (error) {
            callback(error, { auth: '' });
          }
        },
      }),
    });
    const appChannelsRef: Record<string, any> = {};

    const markAppChannelAlive = (piIdRaw: string | number) => {
      const piId = String(piIdRaw);
      setAppChannelOnline((prev) =>
        prev[piId] ? prev : { ...prev, [piId]: true },
      );
      if (appChannelTimersRef.current[piId]) {
        clearTimeout(appChannelTimersRef.current[piId]);
      }
      appChannelTimersRef.current[piId] = setTimeout(() => {
        setAppChannelOnline((prev) => ({ ...prev, [piId]: false }));
      }, 15000);
    };

    const subscribeToAppChannel = (piIdRaw: string | number) => {
      const piId = String(piIdRaw);
      if (!piId || appChannelsRef[piId]) return;
      const appChannelName = `private-app_connect.${piId}`;
      const appChannel = pusher.subscribe(appChannelName);
      appChannelsRef[piId] = appChannel;

      appChannel.bind_global((eventName: string, data: any) => {
        const name = String(eventName || '');
        // Ignore transport/internal events; only real app payload events should refresh heartbeat.
        if (name.startsWith('pusher:') || name.startsWith('pusher_internal:')) return;
        console.log('[app_connect] message', { channel: appChannelName, event: name, data });
        markAppChannelAlive(piId);
      });
      appChannel.bind('pusher:subscription_error', (err: any) => {
        setAppChannelOnline((prev) => ({ ...prev, [piId]: false }));
      });
    };
    
    // Throttle state updates to batch multiple pusher events
    let updateTimeout: NodeJS.Timeout | null = null;
    const scheduleUpdate = () => {
      if (updateTimeout) return; // Already scheduled
      updateTimeout = setTimeout(() => {
        // Drop any falsy/partial items before sorting to avoid blank rows
        const sanitized = Object.values(allPisRef.current).filter(
          (item: any) => item && item.pi_id,
        );

        // Sort by pi_id in ascending order before setting state
        const sortedData = sanitized
          .sort((a: any, b: any) => {
            const idA = parseInt(a.pi_id) || 0;
            const idB = parseInt(b.pi_id) || 0;
            return idA - idB;
          })
          .map((item, idx) => ({ ...item, _rowIndex: idx + 1 }));

        setDatas(sortedData);

        // Prune expanded rows that no longer exist
        setExpandedRows((prev) => {
          const next: Record<string, boolean> = {};
          sortedData.forEach((item: any) => {
            const key = String(item?.pi_id ?? '');
            if (key && prev[key]) next[key] = true;
          });
          return next;
        });
        setRowFilters((prev) => {
          const next: Record<string, string | null> = {};
          sortedData.forEach((item: any) => {
            const key = String(item?.pi_id ?? '');
            if (key && key in prev) next[key] = prev[key];
          });
          return next;
        });

        updateTimeout = null;
      }, 100); // Batch updates every 100ms instead of on every message
    };
    
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('pi_cast');
    // Log all events to the console
    channel.bind_global(function (eventName, data) {
      let message = normalizePayload(data);
      if (!message || !message.pi_id) return;

      const piId = message.canonical_pi_id || message.pi_id;
      subscribeToAppChannel(piId);
      const mergedResult = mergeMessage(message);
      const storeKey = mergedResult?.storeKey || String(piId);
      message = mergedResult;
      clearPendingAction(String(piId));

      if (timerRefs.current[storeKey]) {
        clearTimeout(timerRefs.current[storeKey]);
      }

      // Set a new timeout to delete the pi entry after 30 seconds (no data received)
      timerRefs.current[storeKey] = setTimeout(() => {
        delete allPisRef.current[storeKey];
        delete timerRefs.current[storeKey];
        scheduleUpdate();
      }, 30000); //!wait 30 seconds

      if (isModernSwVersion(message?.sw_version)) {
        if (!Array.isArray(message.recordings)) {
          message.recordings = [];
        }
        allPisRef.current[storeKey] = message;
        scheduleUpdate();
        setLoading(false);
        return;
      }

      if (!Array.isArray(message.recordings) || message.recordings.length === 0) {
        message.recordings = [buildDefaultRecording(piId, message.devices)];
      } else {
        // Legacy payloads: keep at most one synthetic idle placeholder.
        const hasDefaultIdle = message.recordings.some(
          (r: any) =>
            r?.id === 0 &&
            !r?.batch_id &&
            !r?.filename &&
            !r?.date &&
            !r?.duration,
        );
        const noStatusZero = message.recordings.every(
          (recording) => recording.status !== 0,
        );
        if (noStatusZero && !hasDefaultIdle) {
          message.recordings.push(buildDefaultRecording(piId, message.devices));
        }
        if (!noStatusZero) {
          message.recordings = message.recordings.filter(
            (r: any) =>
              !(
                r?.id === 0 &&
                !r?.batch_id &&
                !r?.filename &&
                !r?.date &&
                !r?.duration
              ),
          );
        }
      }

      allPisRef.current[storeKey] = message;
      // Throttle updates - batch multiple messages together
      scheduleUpdate();
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      channel.unbind_all();
      channel.unsubscribe();
      Object.keys(appChannelsRef).forEach((piId) => {
        const ch = appChannelsRef[piId];
        if (ch) {
          ch.unbind_all();
          pusher.unsubscribe(`private-app_connect.${piId}`);
        }
      });
      Object.values(appChannelTimersRef.current).forEach((timer) =>
        clearTimeout(timer),
      );
      appChannelTimersRef.current = {};
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    getBatches();
    getVenues();
    getClassrooms();
  }, []);

  useEffect(() => {
    // Update the timestamp every second
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 500);

    // Clear the interval on component unmount to avoid memory leaks
    return () => clearInterval(interval);
  }, []);

  const openPreviewModal = (id) => {
    // ensure modal state change logs for debugging
    // console.log('openPreviewModal triggered for', id);
    setSelectedId(id);
    setisPreviewModalOpen(true);
  };

  const openShellModal = (id, shellId) => {
    setSelectedId(id);
    if (shellId) {
      setShellUrl(`https://connect.raspberrypi.com/devices/${shellId}/remote-shell-session`);
    }
    setShellWindowBlocked(false);
    setIsShellMinimized(false);
    setisShellModalOpen(true);
  };

  const closeShellModal = () => {
    setisShellModalOpen(false);
    setIsShellMinimized(false);
    setShellUrl('');
  };

  const restoreShellModal = () => {
    setisShellModalOpen(true);
    requestAnimationFrame(() => {
      setIsShellMinimized(false);
    });
  };

  const launchOrFocusShellWindow = () => {
    if (!shellUrl) return;
    try {
      if (shellWindowRef.current && !shellWindowRef.current.closed) {
        shellWindowRef.current.focus();
        return;
      }
      const w = window.open(
        shellUrl,
        '_blank',
        'popup=yes,width=1280,height=820,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes',
      );
      if (!w) {
        setShellWindowBlocked(true);
        return;
      }
      shellWindowRef.current = w;
      setShellWindowBlocked(false);
      w.focus();
    } catch (error) {
      setShellWindowBlocked(true);
    }
  };

  const closeShellWindow = () => {
    if (shellWindowRef.current && !shellWindowRef.current.closed) {
      shellWindowRef.current.close();
    }
    shellWindowRef.current = null;
  };

  useEffect(() => {
    if (isShellModalOpen && shellUrl) {
      launchOrFocusShellWindow();
    }
  }, [isShellModalOpen, shellUrl]);

  useEffect(() => {
    return () => {
      if (shellWindowRef.current && !shellWindowRef.current.closed) {
        shellWindowRef.current.close();
      }
    };
  }, []);

  const loaderIcon = (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
  );

  const setPendingAction = (piId: string, type: 'start' | 'stop') => {
    setPendingActions((prev) => ({
      ...prev,
      [piId]: { type, ts: Date.now() },
    }));
  };

  const clearPendingAction = (piId: string) => {
    setPendingActions((prev) => {
      if (!prev[piId]) return prev;
      const next = { ...prev };
      delete next[piId];
      return next;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPendingActions((prev) => {
        const next: Record<string, { type: 'start' | 'stop'; ts: number }> = {};
        Object.entries(prev).forEach(([key, val]) => {
          if (now - val.ts < 15000) next[key] = val;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearTimeout);
      timerRefs.current = {};
    };
  }, []);

  const stopRecord = (pi_id, batch_id) => {
    // console.log('Stop Record clicked:', pi_id, batch_id);
    setLoading(true);
    setPendingAction(String(pi_id), 'stop');
    var payload = {
      type: 'rec_stop',
      id: pi_id,
      batch_id: batch_id,
    };
    globalFunc(payload);
  };

  const startRecord = (pi_id) => {
    // console.log('Start Record clicked:', pi_id);
    setLoading(true);
    setPendingAction(String(pi_id), 'start');
    var payload = {
      type: 'rec_start',
      id: pi_id,
      batch_id: '1234',
    };
    globalFunc(payload);
  };

  const clearRecord = (pi_id) => {
    // console.log('Clear Record clicked:', pi_id);
    setLoading(true);
    var payload = {
      type: 'clear_recordings',
      id: pi_id,
    };
    globalFunc(payload);
  };

  const startReMerging = (pi_id, filename) => {
    setLoading(true);
    var payload = {
      type: 'merge',
      id: pi_id,
      filename: filename,
    };
    globalFunc(payload);
  };

  const reboot = (pi_id) => {
    setLoading(true);
    var payload = {
      type: 'reboot',
      id: pi_id,
    };
    globalFunc(payload);
  };

  const shutDown = (pi_id) => {
    setLoading(true);
    var payload = {
      type: 'shutdown',
      id: pi_id,
    };
    globalFunc(payload);
  };

  const reFresh = (pi_id) => {
    setLoading(true);
    var payload = {
      type: 'device_refresh',
      id: pi_id,
    };
    globalFunc(payload);
  };

  const trash = (pi_id, filename) => {
    setLoading(true);
    var payload = {
      type: 'trash',
      id: pi_id,
      filename: filename,
    };
    globalFunc(payload);
  };

  const storageClear = (pi_id) => {
    setLoading(true);
    var payload = {
      type: 'storage_clear',
      days: '5',
      id: pi_id,
    };
    globalFunc(payload);
  };

  const getClassrooms = () => {
    var payload = {};
    var url = 'get_classrooms';
    // api(payload,url);
  };

  const getVenues = async () => {
    try {
      const response = await get('rpi/get_venues', {});
      setVenues(JSON.parse(response.data));
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const getBatches = async () => {
    try {
      const response = await get('rpi/get_batches', {}); // Wait for the response
      setBatches(JSON.parse(response.data));
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const globalFunc = (payload) => {
    axios
      .post('https://api.tickleright.in/api/rpi/actions', payload)
      .then((response) => {
        try {
          if (response) {
            setLoading(false);
            // console.log('Successfully Going To ' + payload.type);
          } else {
            // console.log('Something went wrong is Api response');
            setLoading(false);
          }
        } catch (err) {
          // console.log('Error Occured while making an API request');
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('API request failed:', error);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="relative flex h-full gap-2 overflow-hidden rounded-lg">
      <div className="relative z-10 h-full min-h-0 flex-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/95 dark:bg-slate-950/85 px-1 pt-1 pb-2.5 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-800/60 sm:px-2.5 xl:pb-1 text-sm text-slate-800 dark:text-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* <div className="text-xs text-slate-400">
            View all Pis as a dense grid or detailed table.
          </div> */}
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900/80">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'table'
                  ? 'bg-sky-600/90 text-white'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'grid'
                  ? 'bg-sky-600/90 text-white'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
        <div
          className={`min-h-0 flex-1 overflow-x-hidden pr-1 ${
            viewMode === 'table' ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'
          }`}
        >
          <div style={{ display: styleLoader }}>{/* <Loader /> */}</div>
          {/* <div className="rounded-lg w-full overflow-x-auto">
            <table className="w-full table-auto overflow-hidden"> */}
          {viewMode === 'table' ? (
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="min-h-0 flex-1 overflow-auto no-scrollbar">
              <table className="min-w-full table-fixed rounded">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/95 text-center overflow-hidden sticky top-0 z-10 rounded-t-lg border-b border-slate-200 dark:border-slate-800">
                    <th className="w-[32px] py-1 px-1 font-medium text-slate-700 dark:text-slate-300">
                      #
                    </th>
                    <th className="w-[44px] py-1 px-1 font-medium text-slate-700 dark:text-slate-300">
                      Pi ID
                    </th>
                    <th className="w-[50px] py-1 px-2 font-medium text-slate-700 dark:text-slate-300">
                      Venue
                    </th>
                    <th className="w-[70px] py-1 px-4 font-medium text-slate-700 dark:text-slate-300">
                      Storage
                    </th>
                    <th className="w-[80px] py-1 px-1 font-medium text-slate-700 dark:text-slate-300">
                      Devices
                    </th>
                    <th className="w-[700px] py-1 pl-0 pr-4 text-left font-medium text-slate-700 dark:text-slate-300">
                      Recordings
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  <AnimatePresence mode="popLayout">
                    {datas &&
                      datas.length > 0 &&
                      datas.map((element, indexs) => (
                        <PiRow
                          key={element.pi_id}
                          element={element}
                          indexs={indexs}
                          venues={venues}
                          batches={batches}
                          expandedRows={expandedRows}
                          setExpandedRows={setExpandedRows}
                          rowFilters={rowFilters}
                          setRowFilters={setRowFilters}
                          inputValue={inputValue}
                          textVariants={textVariants}
                          isLoading={isLoading}
                          loaderIcon={loaderIcon}
                          stopRecord={stopRecord}
                          openPreviewModal={openPreviewModal}
                          openShellModal={openShellModal}
                          startRecord={startRecord}
                          clearRecord={clearRecord}
                          reboot={reboot}
                          shutDown={shutDown}
                          reFresh={reFresh}
                          storageClear={storageClear}
                          startReMerging={startReMerging}
                          trash={trash}
                          pendingActions={pendingActions}
                          appChannelOnline={appChannelOnline}
                        />
                      ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 min-h-full items-stretch">
            {datas &&
              datas.length > 0 &&
              datas.map((element) => {
                const recs = element.recordings || [];
                const mergingCount = recs.filter((r) => resolveRecordingStatus(r) === 1).length;
                const uploadingCount = recs.filter((r) => resolveRecordingStatus(r) === 2).length;
                const recordingCount = recs.filter((r) => resolveRecordingStatus(r) === 0).length;
                const recordingList = recs.filter((r) => resolveRecordingStatus(r) === 0).slice(-5);
                const mergingList = recs.filter((r) => resolveRecordingStatus(r) === 1).slice(-5);
                const uploadingList = recs.filter((r) => resolveRecordingStatus(r) === 2).slice(-5);
                const storageUsed = element['stats']?.['storage']?.['used_storage'] || 0;
                const storageTotal = element['stats']?.['storage']?.['total_storage'] || 0;
                const storagePct = storageTotal ? Math.round((storageUsed / storageTotal) * 100) : 0;
                return (
                  <motion.div
                    key={element.pi_id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-transparent text-slate-800 dark:text-slate-200 text-sm p-2.5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-100">
                        <span>Pi</span>
                        <span className="text-blue-600 dark:text-blue-300">{element.pi_id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-100">
                        v{element['sw_version']}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-700 dark:text-slate-200 truncate font-semibold" title={venues[element['venue_id']]}> 
                      {venues[element['venue_id']] || '—'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {(element?.devices?.camera ?? 0) == 1 ? (
                          <HiVideoCamera className="w-4 h-4 text-green-400" title="Camera Active" />
                        ) : (
                          <HiVideoCameraSlash className="w-4 h-4 text-red-400" title="Camera Inactive" />
                        )}
                        {(element?.devices?.mic ?? 0) == 1 ? (
                          <IoIosMic className="w-4 h-4 text-green-400" title="Mic Active" />
                        ) : (
                          <IoIosMicOff className="w-4 h-4 text-red-400" title="Mic Inactive" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                        <span>{element['network_speed']} MBps</span>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="relative group rounded-md border border-slate-200/80 bg-white/60 px-2 py-1 text-center dark:border-slate-700/80 dark:bg-slate-900/40">
                          <div className="flex justify-center text-slate-500 dark:text-gray-300">
                            <BsRecordCircle
                              className={`w-3 h-3 ${recordingCount > 0 ? 'text-red-400' : 'text-green-400'}`}
                            />
                          </div>
                          <motion.span
                            key={`rec-count-${recordingCount}`}
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={`text-xs font-semibold ${recordingCount > 0 ? 'text-red-400' : 'text-green-400'}`}
                          >
                            {recordingCount}
                          </motion.span>
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-60 rounded-md border border-slate-700 bg-slate-900 p-2 text-[11px] text-gray-100 shadow-lg z-30 text-left">
                            <div className="font-semibold mb-1 text-blue-200">Recording</div>
                            {recordingList.length === 0 ? (
                              <div className="text-gray-400">No active recordings</div>
                            ) : (
                              <ul className="space-y-1">
                                {recordingList.map((r, idx) => (
                                  <li key={`rec-${element.pi_id}-${idx}`} className="leading-tight">
                                    <div className="font-medium text-blue-100">{batches[r.batch_id] || 'Batch'}</div>
                                    <div className="text-gray-300 flex justify-between gap-2">
                                      <span>{r.duration || '—'}</span>
                                      <span>{formatRecordDate(r.created_at || r.date)}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        <div className="relative group rounded-md border border-slate-200/80 bg-white/60 px-2 py-1 text-center dark:border-slate-700/80 dark:bg-slate-900/40">
                          <div className="flex justify-center text-slate-500 dark:text-gray-300"><TbArrowMerge className="w-3 h-3 text-blue-500 dark:text-blue-300" /></div>
                          <motion.span
                            key={`mrg-count-${mergingCount}`}
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="text-xs font-semibold text-blue-300"
                          >
                            {mergingCount}
                          </motion.span>
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-60 rounded-md border border-slate-700 bg-slate-900 p-2 text-[11px] text-gray-100 shadow-lg z-30 text-left">
                            <div className="font-semibold mb-1 text-indigo-200">Merging</div>
                            {mergingList.length === 0 ? (
                              <div className="text-gray-400">No merges in progress</div>
                            ) : (
                              <ul className="space-y-1">
                                {mergingList.map((r, idx) => (
                                  <li key={`mrg-${element.pi_id}-${idx}`} className="leading-tight">
                                    <div className="font-medium text-indigo-100">{batches[r.batch_id] || 'Batch'}</div>
                                    <div className="text-gray-300 flex justify-between gap-2">
                                      <span>{r.merge_percentage ?? 0}%</span>
                                      <span>{formatRecordDate(r.created_at || r.date)}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        <div className="relative group rounded-md border border-slate-200/80 bg-white/60 px-2 py-1 text-center dark:border-slate-700/80 dark:bg-slate-900/40">
                          <div className="flex justify-center text-slate-500 dark:text-gray-300"><FaCloudUploadAlt className="w-3 h-3 text-amber-500 dark:text-amber-300" /></div>
                          <motion.span
                            key={`upl-count-${uploadingCount}`}
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="text-xs font-semibold text-amber-300"
                          >
                            {uploadingCount}
                          </motion.span>
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-60 rounded-md border border-slate-700 bg-slate-900 p-2 text-[11px] text-gray-100 shadow-lg z-30 text-left">
                            <div className="font-semibold mb-1 text-amber-200">Uploading</div>
                            {uploadingList.length === 0 ? (
                              <div className="text-gray-400">No uploads in progress</div>
                            ) : (
                              <ul className="space-y-1">
                                {uploadingList.map((r, idx) => (
                                  <li key={`upl-${element.pi_id}-${idx}`} className="leading-tight">
                                    <div className="font-medium text-amber-100">{batches[r.batch_id] || 'Batch'}</div>
                                    <div className="text-gray-300 flex justify-between gap-2">
                                      <span>{r.upload_percentage ?? 0}%</span>
                                      <span>{formatRecordDate(r.created_at || r.date)}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          storagePct <= 60
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                            : storagePct <= 80
                            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                            : 'bg-red-900/40 text-red-200'
                        }`}>
                          {storagePct}%
                        </span>
                        <span className="text-slate-500 dark:text-slate-300 mt-1 text-[11px]">
                          {storageUsed.toFixed(1)} / {storageTotal.toFixed(0)} GB
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
        </div>

        {/* Camera preview modal */}
        <Transition appear show={isPreviewModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setisPreviewModalOpen}
          >
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white rounded-lg p-6">
                  <Dialog.Title className="text-xl font-bold">
                    Preview
                  </Dialog.Title>
                  <div className="mt-4 w-[640px] h-[360px] max-w-[90vw] bg-black rounded-md overflow-hidden flex items-center justify-center">
                    {selectedPreview?.enabled &&
                    !selectedPreview?.showNoPreviewIcon &&
                    previewImageSrc &&
                    !previewImageFailed ? (
                      <img
                        src={previewImageSrc}
                        alt={`Preview for PI ${selectedId ?? ''}`}
                        className="w-full h-full object-cover"
                        onError={() => setPreviewImageFailed(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
                        <HiVideoCameraSlash className="text-white text-5xl mb-3 opacity-90" />
                        <span className="text-sm text-slate-200">
                          {selectedPreview?.message ||
                            (selectedPreview?.status
                              ? `Preview ${selectedPreview.status}`
                              : 'Preview unavailable')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setisPreviewModalOpen(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={isShellModalOpen && !isShellMinimized} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40"
            onClose={() => setIsShellMinimized(true)}
          >
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            {/* Modal container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[92vw] max-w-6xl h-[78vh] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <Dialog.Title className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Shell - Pi {selectedId ?? '—'}
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsShellMinimized(true)}
                        className="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30"
                      >
                        Minimize
                      </button>
                      <button
                        onClick={closeShellModal}
                        className="px-2 py-1 text-xs rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="h-[calc(78vh-46px)] bg-slate-950 text-slate-200 flex items-center justify-center">
                    <div className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-sm">
                      <div className="font-semibold mb-2">Shell Running In External Window</div>
                      <p className="text-slate-300 text-xs mb-3">
                        Raspberry Pi Connect blocks iframe embedding (`X-Frame-Options`), so shell opens in a popup window.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={launchOrFocusShellWindow}
                          className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Focus / Reopen Shell
                        </button>
                        <button
                          onClick={closeShellWindow}
                          className="px-3 py-1.5 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          Close Shell Window
                        </button>
                        {shellUrl && (
                          <a
                            href={shellUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            Open In New Tab
                          </a>
                        )}
                      </div>
                      {shellWindowBlocked && (
                        <div className="mt-3 text-[11px] text-amber-300">
                          Popup was blocked by browser. Allow popups for this site and click “Focus / Reopen Shell”.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden">
                    <button
                      onClick={closeShellModal}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
        {isShellModalOpen && isShellMinimized && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={restoreShellModal}
            className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-2 text-xs text-slate-100 shadow-lg hover:bg-slate-800"
            title="Restore Shell"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Shell Pi {selectedId ?? '—'}
          </button>
        )}
      </div>
      {/* <aside className="relative z-10 hidden xl:block w-72 shrink-0">
        <div className="sticky relative overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950 px-4 py-3 shadow-sm ring-1 ring-slate-800/80">
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute -inset-24 opacity-45 blur-2xl"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 15%, rgba(56,189,248,0.25), transparent 45%), radial-gradient(circle at 85% 10%, rgba(99,102,241,0.2), transparent 40%), radial-gradient(circle at 50% 85%, rgba(16,185,129,0.18), transparent 45%)',
              }}
              animate={{ x: [0, 12, -8, 0], y: [0, -10, 8, 0], scale: [1, 1.05, 0.98, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, rgba(15,23,42,0.72) 0%, rgba(2,6,23,0.9) 100%)',
              }}
            />
          </div>

        </div>
      </aside> */}
      </div>
    </>
  );
};
export default Pi_Casting;
