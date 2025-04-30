// ActionsMenuNew.jsx
import { useState, useRef, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { HiChevronDown } from 'react-icons/hi'; import { FaRegPlayCircle } from "react-icons/fa";
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
import {
    useFloating,
    offset,
    flip,
    shift,
    limitShift,
    autoUpdate
} from '@floating-ui/react-dom';

export default function ActionsMenuNew({ isLast,
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
    trash,
    onEdit = () => { },
    onDeactivate = () => { }
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Floating UI setup
    const { x, y, strategy, refs, update } = useFloating({
        placement: 'bottom-start',
        middleware: [
            offset(8),
            flip(),
            // never allow the menu to escape its clipping ancestor
            shift({ limiter: limitShift() })
        ],
        whileElementsMounted: autoUpdate
    });

    // Merge Floating UI’s reference ref with our containerRef (for outside-click)
    const setReference = node => {
        refs.setReference(node);
        containerRef.current = node;
    };

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
                onClick={() => setOpen(o => !o)}
                className="
          inline-flex items-center px-2 py-1 mb-1
          bg-blue-600 text-white text-sm  rounded-md shadow
          hover:bg-blue-700 
          dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800
        "
            >
                Actions
                <HiChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    ref={refs.setFloating}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0
                    }}
                    className="
            w-48
            rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
            bg-white dark:bg-gray-800
            z-50 overflow-visible
          "
                >
                    <div className="py-1">
                        {record.status === 0 ? (
                            <button
                                onClick={() => stopRecord(record.pi_id, record.batch_id)}
                                disabled={isLoading}
                                className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "
                            ><FaRegCircleStop className="mr-3 h-5 w-5" />{isLoading ? loaderIcon : 'Stop'}
                            </button>
                        ) : record.id === 0 ? (
                            <>
                                <button onClick={() => openModal(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "> <FcCamera className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : ' Preview'}
                                </button>
                                <button onClick={() => startRecord(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><BsRecordCircle className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : 'Start'}
                                </button>
                                <button onClick={() => clearRecord(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><MdCleaningServices className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : 'Clean'}
                                </button>
                                <button onClick={() => reboot(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><BsBootstrapReboot className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : 'Reboot'}
                                </button>
                                <button onClick={() => shutDown(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><RiShutDownLine className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : 'Shutdown'}
                                </button>
                                <button onClick={() => reFresh(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><LuRefreshCcwDot className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : ' Refresh'}
                                </button>
                                <button onClick={() => storageClear(record.pi_id)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              "><GrClearOption className="mr-3 h-5 w-5" />
                                    {isLoading ? loaderIcon : 'Clear '}
                                </button>
                            </>
                        ) : record.status !== 0 ? (
                            <>
                                <button onClick={() => startReMerging(record.pi_id, record.filename)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              ">
                                    <TbArrowMerge className="mr-3 h-5 w-5" />{isLoading ? loaderIcon : 'ReMerge'}
                                </button>
                                <button onClick={() => trash(record.pi_id, record.filename)} disabled={isLoading} className="
                flex items-center w-full px-4 py-2 text-sm
              text-black bg-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-gray
              ">
                                    <RiDeleteBin6Fill className="mr-3 h-5 w-5" />{isLoading ? loaderIcon : 'Trash'}

                                </button>
                            </>
                        ) : null}

                    </div>
                </div>
            )}
        </div>
    );
}
