import { useState, useRef, useEffect } from 'react';
import { FaRegPlayCircle } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { TbArrowMerge } from "react-icons/tb";
import { FaRegCircleStop } from "react-icons/fa6";
import { RiShutDownLine } from "react-icons/ri";
import { BsBootstrapReboot } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
import { LuRefreshCcwDot } from "react-icons/lu";
import { FcCamera } from "react-icons/fc";
import { MdCleaningServices } from "react-icons/md";
import { MdOutlineSdStorage } from "react-icons/md";
import { GrClearOption } from "react-icons/gr";
import { FcStart } from "react-icons/fc";
import { FaPlay } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";
export function ActionMenu({isLast,
  record,
  isLoading,
  loaderIcon,
  stopRecord,
  openModal,
  startRecord,
  clearRecord,
  reboot,
  shutDown,
  reFresh,
  storageClear,
  startReMerging,
  trash
}) {

  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  // close on outside click
  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="bg-warmGray-300 text-black font-bold rounded px-2 py-1 hover:bg-grey-600"
      >
        Actions
      </button>

      {open && (
        <div className={`
            absolute left-0 w-30 text-sm bg-white dark:bg-black text-black dark:text-white rounded shadow-lg z-10 p-2 space-y-2
            ${isLast ? 'bottom-full mb-2' : 'mt-2'}
          `}>
          {record.status === 0 ? (
            <button
              onClick={() => stopRecord(record.pi_id, record.batch_id)}
              disabled={isLoading}
              className="w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 bg-orange-300  border-orange-800 dark:hover:bg-gray-600"
            ><FaRegCircleStop />{isLoading ? loaderIcon : 'Stop'}
            </button>
          ) : record.id === 0 ? (
            <>
              <button onClick={() => openModal(record.pi_id)} disabled={isLoading} className="bg-green-300 border-b-2 border-green-800 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"> <FcCamera />
                {isLoading ? loaderIcon : ' Preview'}
              </button>
              <button onClick={() => startRecord(record.pi_id)} disabled={isLoading} className="bg-green-400 border-b-green-900 border-b-2 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><BsRecordCircle />
                {isLoading ? loaderIcon : 'Start'}
              </button>
              <button onClick={() => clearRecord(record.pi_id)} disabled={isLoading} className="bg-orange-400 border-b-orange-900 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><MdCleaningServices />
                {isLoading ? loaderIcon : 'Clean'}
              </button>
              <button onClick={() => reboot(record.pi_id)} disabled={isLoading} className="bg-cyan-500 border-b-cyan-800 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><BsBootstrapReboot />
                {isLoading ? loaderIcon : 'Reboot'}
              </button>
              <button onClick={() => shutDown(record.pi_id)} disabled={isLoading} className="bg-red-400 border-b-red-900 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><RiShutDownLine />
                {isLoading ? loaderIcon : 'Shutdown'}
              </button>
              <button onClick={() => reFresh(record.pi_id)} disabled={isLoading} className="bg-blue-200 border-b-blue-700 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><LuRefreshCcwDot />
                {isLoading ? loaderIcon : ' Refresh'}
              </button>
              <button onClick={() => storageClear(record.pi_id)} disabled={isLoading} className="bg-pink-200 border-b-pink-900 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"><GrClearOption />
                {isLoading ? loaderIcon : 'Clear '}
              </button>
            </>
          ) : record.status !== 0 ? (
            <>
              <button onClick={() => startReMerging(record.pi_id, record.filename)} disabled={isLoading} className="bg-blue-400 border-blue-900 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600">
              <TbArrowMerge />{isLoading ? loaderIcon : 'ReMerge'}
              </button>
              <button onClick={() => trash(record.pi_id, record.filename)} disabled={isLoading} className="bg-red-400 border-b-red-900 w-18 flex items-center space-x-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600">
              <RiDeleteBin6Fill />{isLoading ? loaderIcon : 'Trash'}
              
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
