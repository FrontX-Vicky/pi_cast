import Pusher from 'pusher-js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import axios from 'axios';
import ScrollToBottomDiv from './ScrollToBottomDiv';
import StorageUsageChart from './StorageUsageChart';
import { HiVideoCamera, HiVideoCameraSlash } from 'react-icons/hi2';
import { IoIosMic, IoIosMicOff } from 'react-icons/io';
import { FaRegPlayCircle } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { TbArrowMerge } from 'react-icons/tb';
import { FaRegCircleStop } from 'react-icons/fa6';
import { RiShutDownLine } from 'react-icons/ri';
import { BsBootstrapReboot } from 'react-icons/bs';
import { LuRefreshCcwDot } from 'react-icons/lu';
import GdriveModal from './GdriveModal';
import PreviewIcon from '@mui/icons-material/Preview';
import { DateTime } from 'luxon';

type RecItem = {
  id?: number;
  pi_id?: number | string;
  batch_id?: string | number;
  date?: string;
  created_at?: string;
  filename?: string;
  file_id?: string | number | null;
  audio_size?: string | number;
  video_size?: string | number;
  duration?: string;
  status?: number;
  merge_percentage?: number;
  upload_percentage?: number;
};

const TableThree = () => {
  const [datas, recordingData] = useState<any[]>([]);
  const [styleLoader, hideLoader] = useState('none');
  const [isLoading, setLoading] = useState(false);
  const [storage, setStorage] = useState<any>(null);
  const [ram, setRam] = useState<any>(null);
  const [camera, setcamera] = useState('0');
  const [mic, setmic] = useState('0');
  const [pusherLogs, setPusherLogs] = useState<any[]>([]);
  const [cameraRecording, setCameraRecording] = useState<any[]>([]);
  const [driveUrl, setDriveUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  const piId = useParams();
  const filterPiRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });

    const channel = pusher.subscribe('pi_cast');

    channel.bind_global((_eventName: string, data: any) => {
      if (!data?.message) return;
      hideLoader('none');

      const msg = data.message;
      if (!msg?.pi_id || String(msg.pi_id) !== String(piId?.id)) return;

      if (msg?.logs?.pusher_client) {
        setPusherLogs(msg.logs.pusher_client);
      }

      const normalized = { ...msg };
      const recs: RecItem[] = Array.isArray(normalized.recordings)
        ? [...normalized.recordings]
        : [];

      if (recs.length === 0) {
        recs.push({
          id: 0,
          pi_id: normalized.pi_id,
          batch_id: 0,
          status: 3,
        });
      }

      normalized.recordings = recs;
      filterPiRef.current[String(normalized.pi_id)] = normalized;
      recordingData(Object.values(filterPiRef.current));

      const devices = normalized.devices || {};
      setcamera(String(devices.camera ?? devices.camera_connected ?? 0));
      setmic(String(devices.mic ?? devices.mic_connected ?? 0));

      const stats = normalized.stats || {};
      if (stats.storage) {
        setStorage({
          free: stats.storage.free_storage,
          total: stats.storage.total_storage,
          used: stats.storage.used_storage,
        });
      }

      if (stats.ram) {
        setRam({
          free: stats.ram.free_ram,
          total: stats.ram.total_ram,
          used: stats.ram.used_ram,
        });
      }
    });

    getCameraRecFunc();

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('pi_cast');
      pusher.disconnect();
    };
  }, [piId?.id]);

  const globalFunc = (payload: any) => {
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      if (response) setLoading(false);
    }).catch(() => setLoading(false));
  };

  const stopRecord = (pi_id: any, batch_id: any) => {
    setLoading(true);
    globalFunc({ type: 'rec_stop', id: pi_id, batch_id });
  };

  const startRecord = (pi_id: any) => {
    setLoading(true);
    globalFunc({ type: 'rec_start', id: pi_id, batch_id: '1234' });
  };

  const clearRecord = (pi_id: any) => {
    setLoading(true);
    globalFunc({ type: 'clear_recordings', id: pi_id });
  };

  const startReMerging = (pi_id: any, filename: any) => {
    setLoading(true);
    globalFunc({ type: 'merge', id: pi_id, filename });
  };

  const reboot = (pi_id: any) => {
    setLoading(true);
    globalFunc({ type: 'reboot', id: pi_id });
  };

  const shutDown = (pi_id: any) => {
    setLoading(true);
    globalFunc({ type: 'shutdown', id: pi_id });
  };

  const reFresh = (pi_id: any) => {
    setLoading(true);
    globalFunc({ type: 'refresh', id: pi_id });
  };

  const trash = (pi_id: any, filename: any) => {
    setLoading(true);
    globalFunc({ type: 'trash', id: pi_id, filename });
  };

  const getCameraRecFunc = () => {
    axios.post('https://api.tickleright.in/api/camRecData', { pi_id: piId?.id }).then((response) => {
      if (response.status === 200 && response.data?.error === 0 && Array.isArray(response.data[0])) {
        setCameraRecording(response.data[0]);
      } else {
        setCameraRecording([]);
      }
    }).catch(() => setCameraRecording([]));
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setDriveUrl('');
  };

  const viewRec = (row: any) => {
    const fileId = row?.file_id ?? row?.fileId ?? row?.original?.file_id;
    if (!fileId) return;
    setDriveUrl(String(fileId));
    handleOpenModal();
  };

  const loaderIcon = (
    <svg
      className="h-4 w-4 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
  );

  const formatDate = (value: any) => {
    if (!value) return '—';
    const iso = DateTime.fromISO(String(value));
    if (iso.isValid) return iso.toFormat('dd LLL yyyy, hh:mm a');
    const sql = DateTime.fromFormat(String(value), 'yyyy-MM-dd HH:mm:ss');
    if (sql.isValid) return sql.toFormat('dd LLL yyyy, hh:mm a');
    return String(value);
  };

  const allRows = useMemo(() => {
    if (!Array.isArray(datas)) return [];
    return datas.flatMap((pi) => (pi?.recordings || []).map((rec: RecItem) => ({ ...rec, pi_id: rec?.pi_id ?? pi?.pi_id })));
  }, [datas]);

  const getRowStatus = (rec: RecItem) => {
    const s = Number(rec?.status);
    if (s === 0) return 'Recording';
    if (s === 1) return 'Merging';
    if (s === 2) return 'Uploading';
    if (s === 9) return 'Failed';
    return 'Idle';
  };

  const getStatusDotClass = (rec: RecItem) => {
    const s = Number(rec?.status);
    if (s === 0) return 'bg-red-500';
    if (s === 1) return 'bg-blue-500';
    if (s === 2) return 'bg-amber-500';
    if (s === 9) return 'bg-rose-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 md:p-5">
      <div style={{ display: styleLoader }}>
        <Loader />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              {storage ? <StorageUsageChart data={storage} type="Storage" /> : <div className="text-sm text-slate-500 dark:text-slate-400">No storage data</div>}
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              {ram ? <StorageUsageChart data={ram} type="Ram" /> : <div className="text-sm text-slate-500 dark:text-slate-400">No RAM data</div>}
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Device Strip</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-xs dark:border-slate-700">
                  {(camera === '1' || camera === 'true') ? <HiVideoCamera className="h-4 w-4 text-emerald-500" /> : <HiVideoCameraSlash className="h-4 w-4 text-rose-500" />}
                  <span className="text-slate-700 dark:text-slate-200">Cam</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-xs dark:border-slate-700">
                  {(mic === '1' || mic === 'true') ? <IoIosMic className="h-4 w-4 text-emerald-500" /> : <IoIosMicOff className="h-4 w-4 text-rose-500" />}
                  <span className="text-slate-700 dark:text-slate-200">Mic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="h-full rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-100">Camera Recordings</div>
            <div className="max-h-[260px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full table-fixed text-xs">
                <thead className="sticky top-0 bg-slate-100/95 dark:bg-slate-900/95">
                  <tr>
                    <th className="w-[58%] px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Batch</th>
                    <th className="w-[30%] px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Date</th>
                    <th className="w-[12%] px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">View</th>
                  </tr>
                </thead>
                <tbody>
                  {cameraRecording.length > 0 ? (
                    cameraRecording.map((item: any, idx: number) => (
                      <tr key={`cam-rec-${idx}`} className="border-t border-slate-200/70 dark:border-slate-800/70">
                        <td className="truncate px-3 py-2 text-slate-700 dark:text-slate-200">{item?.batch ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(item?.date)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400"
                            onClick={() => viewRec(item)}
                            title="Preview"
                          >
                            <PreviewIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-4 text-center text-slate-500 dark:text-slate-400" colSpan={3}>No recordings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {driveUrl !== '' && (
        <GdriveModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          handleOpenModal={handleOpenModal}
          file_id={driveUrl}
        />
      )}

      <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Recording Journey</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{allRows.length} rows</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full table-fixed text-xs md:text-sm">
            <thead className="bg-slate-100/90 dark:bg-slate-900/90">
              <tr>
                <th className="w-[160px] px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Status</th>
                <th className="w-[220px] px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Batch</th>
                <th className="w-[180px] px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Date</th>
                <th className="w-[90px] px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Audio</th>
                <th className="w-[90px] px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Video</th>
                <th className="w-[90px] px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Duration</th>
                <th className="w-[100px] px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Merge %</th>
                <th className="w-[100px] px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Upload %</th>
                <th className="w-[210px] px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allRows.length > 0 ? (
                allRows.map((element: RecItem, idx: number) => (
                  <tr key={`${element?.id ?? 'r'}-${idx}`} className="border-t border-slate-200/70 dark:border-slate-800/70">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${getStatusDotClass(element)}`} />
                        <span className="text-slate-700 dark:text-slate-200">{getRowStatus(element)}</span>
                      </div>
                    </td>
                    <td className="truncate px-3 py-2 text-slate-700 dark:text-slate-200">{element?.batch_id || '—'}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(element?.created_at || element?.date)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">{element?.audio_size || '—'}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">{element?.video_size || '—'}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">{element?.duration || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="rounded bg-blue-500/15 px-2 py-1 text-blue-700 dark:text-blue-300">{Number(element?.merge_percentage ?? 0)}%</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="rounded bg-amber-500/15 px-2 py-1 text-amber-700 dark:text-amber-300">{Number(element?.upload_percentage ?? 0)}%</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-green-500/15 text-green-700 dark:text-green-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => startRecord(element.pi_id)}
                          disabled={isLoading}
                          title="Start"
                        >
                          {isLoading ? loaderIcon : <FaRegPlayCircle />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => stopRecord(element.pi_id, element.batch_id)}
                          disabled={isLoading}
                          title="Stop"
                        >
                          {isLoading ? loaderIcon : <FaRegCircleStop />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => startReMerging(element.pi_id, element.filename)}
                          disabled={isLoading}
                          title="Merge"
                        >
                          {isLoading ? loaderIcon : <TbArrowMerge />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => reFresh(element.pi_id)}
                          disabled={isLoading}
                          title="Refresh"
                        >
                          {isLoading ? loaderIcon : <LuRefreshCcwDot />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => trash(element.pi_id, element.filename)}
                          disabled={isLoading}
                          title="Delete"
                        >
                          {isLoading ? loaderIcon : <RiDeleteBin6Fill />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => reboot(element.pi_id)}
                          disabled={isLoading}
                          title="Reboot"
                        >
                          {isLoading ? loaderIcon : <BsBootstrapReboot />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-red-500/15 text-red-700 dark:text-red-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => shutDown(element.pi_id)}
                          disabled={isLoading}
                          title="Shutdown"
                        >
                          {isLoading ? loaderIcon : <RiShutDownLine />}
                        </button>
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => clearRecord(element.pi_id)}
                          disabled={isLoading}
                          title="Clear"
                        >
                          {isLoading ? loaderIcon : 'C'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500 dark:text-slate-400" colSpan={9}>No recording rows</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-100/40 p-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="px-1">
          <h4 className="text-sm font-semibold text-emerald-500">Pusher Client</h4>
        </div>
        <div className="px-1 pt-2">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800">
            <ScrollToBottomDiv items={pusherLogs} height={220} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableThree;
