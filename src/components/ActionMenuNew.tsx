// ActionsMenuNew.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit2 } from 'react-icons/fi';
import { SiAnydesk } from 'react-icons/si';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { HiChevronDown } from 'react-icons/hi';
import { FaRegPlayCircle } from 'react-icons/fa';
import { TbArrowMerge } from 'react-icons/tb';
import { FaRegCircleStop } from 'react-icons/fa6';
import { RiShutDownLine } from 'react-icons/ri';
import { BsBootstrapReboot } from 'react-icons/bs';
import { GrPowerReset } from 'react-icons/gr';
import { LuRefreshCcwDot } from 'react-icons/lu';
import { FcCamera } from 'react-icons/fc';
import { MdCleaningServices } from 'react-icons/md';
import { MdOutlineSdStorage } from 'react-icons/md';
import { GrClearOption } from 'react-icons/gr';
import { FcStart } from 'react-icons/fc';
import { FaPlay } from 'react-icons/fa';
import { BsRecordCircle } from 'react-icons/bs';
import { TbBrandPowershell } from 'react-icons/tb';

import {
  useFloating,
  offset,
  flip,
  shift,
  limitShift,
  autoUpdate,
} from '@floating-ui/react-dom';

export default function ActionsMenuNew({
  isLast,
  record,
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
  shell,
  onEdit = () => {},
  onDeactivate = () => {},
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<any>(null);
  const floatingRef = useRef<any>(null);

  // Compact menu item styles
  const itemCls =
    "flex items-center w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors";
  const iconCls = "mr-2 h-4 w-4";

  // Floating UI setup
  const { x, y, strategy, refs, update } = useFloating({
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      // never allow the menu to escape its clipping ancestor
      shift({ limiter: limitShift() }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Merge Floating UI’s reference ref with our containerRef (for outside-click)
  const setReference = (node: any) => {
    refs.setReference(node);
    containerRef.current = node;
  };

  const setFloatingRef = (node: any) => {
    refs.setFloating(node);
    floatingRef.current = node;
  };

  // close on outside click
  useEffect(() => {
    function onClick(e: any) {
      if (
        containerRef.current &&
        floatingRef.current &&
        !containerRef.current.contains(e.target) &&
        !floatingRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // debug: confirm component mounted and record prop
  useEffect(() => {
    try {
      // lightweight info to help debugging in the browser console
      // show when the menu component mounts and what record it received
      // eslint-disable-next-line no-console
      console.log('ActionsMenuNew mounted', { pi: record?.pi_id, status: record?.status });
    } catch (e) {
      // ignore
    }
  }, [record]);

  // reposition whenever we open
  useEffect(() => {
    if (open) update();
  }, [open, update]);

  return (
    <div
      ref={setReference}
      className="relative inline-block text-left overflow-visible"
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          try {
            // eslint-disable-next-line no-console
            console.log('ActionsMenuNew trigger clicked', { pi: record?.pi_id, status: record?.status });
          } catch (e) {}
          setOpen((o) => !o);
        }}
        className="
          inline-flex items-center px-1.5 py-0.5 mb-1
          bg-blue-600 text-white text-[10px] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30
          hover:bg-blue-700 
          dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800
        "
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Actions
        <HiChevronDown className="ml-1 h-3 w-3" aria-hidden="true" />
      </button>

      {/* Dropdown */}
      {open && createPortal(
        <div
          ref={setFloatingRef}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          className="
            w-44 rounded-md shadow-lg ring-1 ring-black/10 dark:ring-white/10
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
            z-[9999] overflow-visible border border-gray-200 dark:border-slate-700
          "
        >
          <div className="py-1 divide-y divide-gray-200 dark:divide-slate-700">
            {record.status === 0 ? (
              <>
                <button
                  onClick={() => {
                    console.log('Stop button clicked');
                    stopRecord(record.pi_id, record.batch_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <FaRegCircleStop className={iconCls} />
                  {isLoading ? loaderIcon : 'Stop'}
                </button>
                <a
                  href={`https://connect.raspberrypi.com/devices/${shell}/remote-shell-session`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemCls}
                >
                  <TbBrandPowershell className={iconCls} />
                  {isLoading ? loaderIcon : ' Shell'}
                </a>
                <a
                  href={`https://connect.raspberrypi.com/devices/${shell}/screen-sharing-session`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemCls}
                >
                  <SiAnydesk className={iconCls} />
                  {isLoading ? loaderIcon : 'Screen'}
                </a>
              </>
            ) : record.id === 0 ? (
              <>
                <button
                  onClick={() => {
                    console.log('Preview button clicked');
                    openPreviewModal(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  {' '}
                  <FcCamera className={iconCls} />
                  {isLoading ? loaderIcon : ' Preview'}
                </button>
                <a
                  href={`https://connect.raspberrypi.com/devices/${shell}/remote-shell-session`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemCls}
                  onClick={() => setOpen(false)}
                >
                  <TbBrandPowershell className={iconCls} />
                  {isLoading ? loaderIcon : ' Shell'}
                </a>
                <a
                  href={`https://connect.raspberrypi.com/devices/${shell}/screen-sharing-session`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemCls}
                  onClick={() => setOpen(false)}
                >
                  <SiAnydesk className={iconCls} />
                  {isLoading ? loaderIcon : 'Screen'}
                </a>
                <div className="my-1" />
                <button
                  onClick={() => {
                    console.log('Start Record button clicked');
                    startRecord(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <BsRecordCircle className={iconCls} />
                  {isLoading ? loaderIcon : 'Start'}
                </button>
                <button
                  onClick={() => {
                    console.log('Clear Record button clicked');
                    clearRecord(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <MdCleaningServices className={iconCls} />
                  {isLoading ? loaderIcon : 'Clean'}
                </button>
                <div className="my-1" />
                <button
                  onClick={() => {
                    console.log('Reboot button clicked');
                    reboot(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <BsBootstrapReboot className={iconCls} />
                  {isLoading ? loaderIcon : 'Reboot'}
                </button>
                <button
                  onClick={() => {
                    console.log('Shutdown button clicked');
                    shutDown(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <RiShutDownLine className={iconCls} />
                  {isLoading ? loaderIcon : 'Shutdown'}
                </button>
                <button
                  onClick={() => {
                    console.log('Refresh button clicked');
                    reFresh(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <LuRefreshCcwDot className={iconCls} />
                  {isLoading ? loaderIcon : ' Refresh'}
                </button>
                <div className="my-1" />
                <button
                  onClick={() => {
                    console.log('Storage Clear button clicked');
                    storageClear(record.pi_id);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <GrClearOption className={iconCls} />
                  {isLoading ? loaderIcon : 'Clear '}
                </button>
              </>
            ) : record.status !== 0 ? (
              <>
                <button
                  onClick={() => {
                    console.log('ReMerge button clicked');
                    startReMerging(record.pi_id, record.filename);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <TbArrowMerge className={iconCls} />
                  {isLoading ? loaderIcon : 'ReMerge'}
                </button>
                <button
                  onClick={() => {
                    console.log('Trash button clicked');
                    trash(record.pi_id, record.filename);
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className={itemCls}
                >
                  <RiDeleteBin6Fill className={iconCls} />
                  {isLoading ? loaderIcon : 'Trash'}
                </button>
              </>
            ) : null}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
