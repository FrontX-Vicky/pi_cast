import axios from 'axios';
import { del, get, post, put } from '../helpers/api_helper';
import Pusher from 'pusher-js';
import React, {
  useContext,
  useEffect,
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
import { FaRegPlayCircle } from 'react-icons/fa';
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
import { GrClearOption } from 'react-icons/gr';
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
  const [timestamp, setTimestamp] = useState(Date.now());
  const [selectedId, setSelectedId] = useState(null);
  const timerRefs = useRef({});
  const [pages, setpages] = useState(1);
  let allPis = {};
  let piBtnDisabled = {};
  const [datas, setDatas] = useState([]);
  const [recordings, setRecordings] = useState<{ [key: string]: any }>({});
  const [styleLoader, hideLoader] = useState('block');
  const [isLoading, setLoading] = useState(false);
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
  
  useEffect(() => {
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('pi_cast');
    // Log all events to the console
    channel.bind_global(function (eventName, data) {
      if (data.message) {
        if (timerRefs.current[data.message.pi_id]) {
          clearTimeout(timerRefs.current[data.message.pi_id]);
        }

        // Set a new timeout to delete the data.message.pi_id after 15 seconds
        timerRefs.current[data.message.pi_id] = setTimeout(() => {
          delete allPis[data.message.pi_id];
          delete timerRefs.current[data.message.pi_id];
          // Update the state after deletion
          setDatas(Object.values(allPis));
        }, 30000); //!wait 10 seconds

        if (data.message && data.message.recordings.length == 0) {
          let recordings = [
            {
              id: 0,
              pi_id: data.message.pi_id,
              camera: data.message.devices.camera,
              mic: data.message.devices.mic,
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
            },
          ];
          data.message.recordings = recordings;
          allPis[data.message.pi_id] = data.message;
        } else {
          const noStatusZero = data.message.recordings.every(
            (recording) => recording.status !== 0,
          );
          if (noStatusZero) {
            // Add default recording
            data.message.recordings.push({
              id: 0,
              pi_id: data.message.pi_id,
              camera: data.message.devices.camera,
              mic: data.message.devices.mic,
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
          }
          allPis[data.message.pi_id] = data.message;
        }
      }
      setDatas(Object.values(allPis));
      setLoading(false);
    });
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
    setSelectedId(id);
    setisPreviewModalOpen(true);
  };

  const openShellModal = (id) => {
    setSelectedId(id);
    setisShellModalOpen(true);
  };

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

  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearTimeout);
      timerRefs.current = {};
    };
  }, []);

  const stopRecord = (pi_id, batch_id) => {
    setLoading(true);
    var payload = {
      type: 'rec_stop',
      id: pi_id,
      batch_id: batch_id,
    };
    globalFunc(payload);
  };

  const startRecord = (pi_id) => {
    setLoading(true);
    var payload = {
      type: 'rec_start',
      id: pi_id,
      batch_id: '1234',
    };
    globalFunc(payload);
  };

  const clearRecord = (pi_id) => {
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
            // setLoading(false);
            console.log('Successfully Going To ' + payload.type);
          } else {
            console.log('Something went wrong is Api response');
          }
        } catch (err) {
          console.log('Error Occured while making an API request');
        }
      });
  };

  return (
    <>
      <div className="h-full flex-1 rounded-lg border border-stroke bg-warmGray-200 px-1 pt-1 pb-2.5 shadow-default dark:border-strokedark shadow-sm ring-1 ring-gray-900/5 dark:bg-slate-900 sm:px-2.5 xl:pb-1 text-sm overflow-auto">
        <div style={{ display: styleLoader }}>{/* <Loader /> */}</div>
        {/* <div className="rounded-lg w-full overflow-x-auto">
          <table className="w-full table-auto overflow-hidden"> */}
        <div className="rounded-lg min-h-203">
          <table className="min-w-full table-fixed rounded">
            <thead>
              <tr className="bg-gray-200 text-center dark:bg-slate-800 overflow-hidden sticky top-0 z-10 rounded-t-lg">
                <th className="min-w-[10px] py-1 px-4 font-medium text-black dark:text-warmGray-50">
                  #
                </th>
                <th className="min-w-[80px] py-1 px-2 font-medium text-black dark:text-white">
                  Pi ID
                </th>
                <th className="min-w-[120px] py-1 px-2 font-medium text-black dark:text-white">
                  Venue
                </th>
                <th className="min-w-[60px] py-1 px-4 font-medium text-black dark:text-white">
                  Storage
                </th>
                <th className="min-w-[50px] py-1 px-1 font-medium text-black dark:text-white">
                  Devices
                </th>
                <th className="min-w-[250px] py-1 px-4 font-medium text-black dark:text-white">
                  Recordings
                  <br />
                  {/* <table>
                    <thead>
                      <th className="min-w-[130px] py-2 px-4 text-black dark:text-white">
                        Batch
                      </th>
                      <th className="min-w-[130px] py-2 px-4 text-black dark:text-white">
                        Date
                      </th>
                      <th className="min-w-[120px] py-2 px-4 font-medium text-black dark:text-white">
                        Video/Audio Size
                      </th>
                      <th className="min-w-[120px] py-2 px-4 font-medium text-black dark:text-white">
                        Duration
                      </th>
                      <th className="min-w-[120px] py-2 px-4 font-medium text-black dark:text-white">
                        Status
                      </th>
                      <th className="min-w-[120px] py-2 px-4 font-medium text-black dark:text-white">
                        Percentage
                      </th>
                      <th className="min-w-[220px] py-2 px-4 font-medium text-black dark:text-white">
                        Actions
                      </th>
                    </thead>
                  </table> */}
                </th>
              </tr>
            </thead>
            <tbody className="">
              <AnimatePresence >
                {datas &&
                  datas.length > 0 &&
                  datas.map((element, indexs) => {
                    return (
                      <tr
                        key={indexs}
                        className="border-b border-[#eee] dark:border-strokedark"
                      >
                        <td className="border-white py-0.5 px-2 dark:border-strokedark text-center">
                          <label htmlFor="">{indexs + 1}</label>
                        </td>
                        <td className="border-white py-0.5 px-2 dark:border-strokedark text-center">
                          <span className="text-sm font-bold">{element.pi_id}</span>
                        </td>
                        <td className="max-w-[200px] border-white py-0.5 px-2 dark:border-strokedark">
                          <div className="inline-block w-full overflow-hidden relative">
                            <span className="inline-block whitespace-nowrap animate-marquee text-sm">
                              {venues[element['venue_id']]}
                              <span className="ml-8">{venues[element['venue_id']]}</span>
                            </span>
                          </div>
                        </td>
                        <td className="text-sm text-center border-white py-0.5 px-2 dark:border-strokedark w-[100px]">
                          <div className="flex flex-col items-center gap-0.5">
                            {/* Compact Storage Display */}
                            <div className="relative inline-flex items-center justify-center">
                              <svg className="w-12 h-12 transform -rotate-90">
                                {/* Background Circle */}
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                                {/* Progress Circle */}
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="20"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  strokeDashoffset={`${
                                    2 * Math.PI * 20 * (1 - (element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']))
                                  }`}
                                  className={`transition-all duration-500 ${
                                    ((element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']) * 100) <= 60
                                      ? 'text-green-500'
                                      : ((element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']) * 100) <= 80
                                      ? 'text-yellow-500'
                                      : 'text-red-500'
                                  }`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              {/* Center Content */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <MdOutlineSdStorage className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                <span className="text-[10px] font-bold dark:text-white">
                                  {Math.round((element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']) * 100)}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Storage Size */}
                            <span className="text-[9px] text-gray-600 dark:text-gray-400">
                              {element['stats']['storage']['used_storage'].toFixed(1)}GB / {element['stats']['storage']['total_storage'].toFixed(0)}GB
                            </span>
                          </div>
                        </td>
                        <td className="border-white py-0.5 px-2 dark:border-strokedark w-[110px]">
                          <div className="flex flex-col gap-0.5">
                            {/* Row 1: Camera & Mic */}
                            <div className="flex items-center justify-center gap-2.5">
                              <div className="flex items-center gap-0.5">
                                {element['devices'].camera == 1 ? (
                                  <HiVideoCamera className="w-3.5 h-3.5 text-green-500" title="Camera Active" />
                                ) : (
                                  <HiVideoCameraSlash className="w-3.5 h-3.5 text-red-500" title="Camera Inactive" />
                                )}
                              </div>
                              <div className="flex items-center gap-0.5">
                                {element['devices'].mic == 1 ? (
                                  <IoIosMic className="w-3.5 h-3.5 text-green-500" title="Mic Active" />
                                ) : (
                                  <IoIosMicOff className="w-3.5 h-3.5 text-red-500" title="Mic Inactive" />
                                )}
                              </div>
                            </div>
                            
                          
                            {/* Row 3: Version */}
                            <div className="flex items-center justify-center">
                              <span 
                                className="text-[9px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 font-medium text-blue-700 dark:text-blue-300"
                                style={{ color: element['sw_version'] === '0.0' ? '#ef4444' : undefined }}
                              >
                                v{element['sw_version']}
                              </span>
                            </div>
                              {/* Row 2: Network Speed */}
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
                            
                          </div>
                        </td>
                        <td className="py-0">
                          <table className="w-full table-fixed">
                            <tbody>
                              {element.recordings
                                .filter((item) =>
                                  Object.values(item).some((value) =>
                                    String(value)
                                      .toLowerCase()
                                      .includes(inputValue.toLowerCase()),
                                  ),
                                )
                                .map((record, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100 dark:border-strokedark/50 last:border-0"
                                    >
                                      {/* <td className="min-w-[130px] py-0 px-4 border-white pt-2 dark:border-strokedark">
                                    {/* <td colSpan={2} /> */}
                                      <React.Fragment key={index}>
                                        <td className="w-[180px] py-0.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <div className="relative flex-shrink-0">
                                              <span
                                                key={index} // force animate on change
                                              
                                                className={`animate-ping absolute h-3.5 w-3.5 rounded-full  inline-flex border-2 border-white ${
                                                  record.pi_id != 0 &&
                                                  record.status == 0
                                                    ? 'bg-meta-7'
                                                    : record.status == 1
                                                    ? 'bg-primary'
                                                    : record.status == 2
                                                    ? 'bg-meta-6'
                                                    : 'bg-meta-3'
                                                }`}
                                              />
                                              <span
                                                key={index} // force animate on change
                                               
                                                className={`relative  h-3.5 w-3.5  inline-flex rounded-full border-2 border-white ${
                                                  record.pi_id != 0 &&
                                                  record.status == 0
                                                    ? 'bg-meta-7'
                                                    : record.status == 1
                                                    ? 'bg-primary'
                                                    : record.status == 2
                                                    ? 'bg-meta-6'
                                                    : 'bg-meta-3'
                                                }`}
                                              ></span>
                                            </div>
                                            {/* Error Indicator */}
                                            {/* {record.error !== undefined && record.error !== 0 && (
                                              <div 
                                                className="relative flex-shrink-0"
                                                title={
                                                  record.error === 1 
                                                    ? 'Video Stalled' 
                                                    : record.error === 2 
                                                    ? 'Audio Stalled' 
                                                    : record.error === 3 
                                                    ? 'Both Video & Audio Stalled' 
                                                    : 'Error'
                                                }
                                              >
                                                <span className="relative h-3.5 w-3.5 inline-flex rounded-full border-2 border-white bg-red-500 animate-pulse">
                                                  <span className="text-white text-[8px] font-bold leading-none flex items-center justify-center w-full h-full">
                                                    !
                                                  </span>
                                                </span>
                                              </div>
                                            )} */}
                                            <div
                                              className="text-sm truncate flex-1"
                                              data-twe-toggle="tooltip"
                                              data-twe-placement="top"
                                              data-twe-ripple-init
                                              data-twe-ripple-color="light"
                                              title={batches[record.batch_id]}
                                            >
                                              {batches[record.batch_id]}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="w-[140px] py-0.5 px-2">
                                          <p className="text-xs">
                                            <span>
                                              {record.date &&
                                                DateTime.fromFormat(
                                                  record.date,
                                                  'yyyy-MM-dd HH:mm:ss',
                                                ).toFormat('d MMM h:mm a')}
                                            </span>
                                          </p>
                                        </td>
                                        <td className="w-[120px] py-0.5 px-2">
                                          {(record.video_size || record.audio_size) && (
                                            <div className="flex flex-col gap-0.5">
                                              {/* Video Size */}
                                              <motion.div
                                                key={record.video_size}
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
                                              
                                              {/* Audio Size */}
                                              <motion.div
                                                key={record.audio_size}
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
                                          )}
                                        </td>
                                        <td className="w-[80px] py-0.5 px-2 text-center">
                                          <motion.span
                                              key={record.duration}
                                              variants={textVariants}
                                              initial="initial"
                                              animate="animate"
                                              exit="exit"
                                              transition={{ duration: 0.5 }}
                                              className="text-xs"
                                            >
                                            {record.duration}
                                            </motion.span>
                                        </td>
                                        <td className="w-[90px] py-0.5 px-2 text-center">
                                          <p className="text-xs">
                                            {' '}
                                            {record.id == 0
                                              ? 'Idle'
                                              : record.status == 1
                                              ? 'Merging'
                                              : record.status == 2
                                              ? 'Uploading'
                                              : record.status == 0
                                              ? 'Recording'
                                              : 'Completed'}
                                          </p>
                                        </td>
                                        <td className="w-[140px] py-0.5 px-1">
                                          {record.status !== 0 &&
                                            record.status !== undefined && (
                                              <div className="flex flex-col gap-0.5">
                                                {/* Progress Bar with Label */}
                                                <div className="flex items-center gap-1">
                                                  <span className={`text-[9px] font-semibold uppercase tracking-wide ${
                                                    record.status === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'
                                                  }`}>
                                                    {record.status === 1 ? 'M' : 'U'}
                                                  </span>
                                                  <div className="flex-1 relative">
                                                    {/* Custom Progress Bar */}
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                                      <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ 
                                                          width: `${record.status === 1 ? (record.merge_percentage || 0) : (record.upload_percentage || 0)}%` 
                                                        }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className={`h-full rounded-full relative ${
                                                          record.status === 1 
                                                            ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                                                            : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                        }`}
                                                        style={{
                                                          boxShadow: record.status === 1 
                                                            ? '0 0 8px rgba(59, 130, 246, 0.5)' 
                                                            : '0 0 8px rgba(234, 179, 8, 0.5)'
                                                        }}
                                                      >
                                                        {/* Shimmer effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                                                      </motion.div>
                                                    </div>
                                                    {/* Percentage inside bar */}
                                                    <motion.span
                                                      key={record.merge_percentage + record.upload_percentage}
                                                      variants={textVariants}
                                                      initial="initial"
                                                      animate="animate"
                                                      exit="exit"
                                                      transition={{ duration: 0.5 }}
                                                      className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-white drop-shadow-sm"
                                                    >
                                                      {record.status === 1
                                                        ? (record.merge_percentage || 0)
                                                        : (record.upload_percentage || 0)}%
                                                    </motion.span>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                        </td>
                                        <td className="w-[100px] py-0.5 px-2">
                                          <ActionsMenuNew
                                            isLast={
                                              index >=
                                              element.recordings.length - 3
                                            }
                                            // isLast={indexs >= datas.length - 1}
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
                                          {/* <ActionMenu   
                                      isLast={index >= element.recordings.length - 3}
                                      // isLast={indexs >= datas.length - 1}
                                      record={record}
                                      isLoading={isLoading}
                                      loaderIcon={loaderIcon}
                                      stopRecord={stopRecord}
                                      openPreviewModal={openPreviewModal}
                                      startRecord={startRecord}
                                      clearRecord={clearRecord}
                                      reboot={reboot}
                                      shutDown={shutDown}
                                      reFresh={reFresh}
                                      storageClear={storageClear}
                                      startReMerging={startReMerging}
                                      trash={trash}
                                    /> */}
                                        </td>
                                      </React.Fragment>
                                    </tr>
                                ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    );
                  })}
              </AnimatePresence>
            </tbody>
          </table>
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
                  <div className="mt-4">
                    <img
                      src={`https://api.tickleright.in/cam_image/image_${selectedId}.jpg?t=${timestamp}`}
                      alt="Dynamic"
                    />
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

        <Transition appear show={isShellModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setisShellModalOpen}
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
                    Shell
                  </Dialog.Title>
                  <div className="mt-4"></div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setisShellModalOpen(false)}
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
      </div>
    </>
  );
};
export default Pi_Casting;
