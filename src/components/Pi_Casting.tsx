import axios from 'axios';
import Pusher from 'pusher-js';
import React, { useContext, useEffect, useRef, useState , Fragment} from 'react';
import Loader from '../common/Loader';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import { HiVideoCamera } from "react-icons/hi2";
import { HiVideoCameraSlash } from "react-icons/hi2";
import { IoIosMic } from "react-icons/io";
import { IoIosMicOff } from "react-icons/io";
import { FaRegPlayCircle } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { TbArrowMerge } from "react-icons/tb";
import { FaRegCircleStop } from "react-icons/fa6";
import { RiShutDownLine } from "react-icons/ri";
import { BsBootstrapReboot } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
import { LuRefreshCcwDot } from "react-icons/lu";
import { FcCamera  } from "react-icons/fc";
import { MdCleaningServices } from "react-icons/md";
import { MdOutlineSdStorage } from "react-icons/md";
import { GrClearOption } from "react-icons/gr";
import { DateTime } from 'luxon';
import TypoGraphy from './TypoGraphy';
import { SearchContext } from './SearchContext';
import { Dialog, Transition } from "@headlessui/react";

const Pi_Casting = () => {
  var arrayOfRecording = [];
  var allRecording = [];
  const context = useContext(SearchContext);
  const { inputValue } = context;
  if (!context) {
    throw new Error('getSearchValue must be used within a SearchProvider');
  }
  const [availablePi, setavailablePi] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
  useEffect(() => {
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true
    });
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('pi_cast');
    // Log all events to the console
    channel.bind_global(function (eventName, data) {
      if (data.message) {

        if (timerRefs.current[data.message.pi_id]) {
          clearTimeout(timerRefs.current[data.message.pi_id]);
          // console.log('Cleared timeout for data.message.pi_id: ' + data.message.pi_id);
        }

        // Set a new timeout to delete the data.message.pi_id after 15 seconds
        timerRefs.current[data.message.pi_id] = setTimeout(() => {
          delete allPis[data.message.pi_id];
          delete timerRefs.current[data.message.pi_id];
          // Update the state after deletion
          setDatas(Object.values(allPis));
          // console.log('Deleted data.message.pi_id after 15 seconds: ' + data.message.pi_id);
        }, 15000); //!wait 10 seconds


        if (data.message && data.message.recordings.length == 0) {
          let recordings = [{
            "id": 0,
            "pi_id": data.message.pi_id,
            "camera": data.message.devices.camera,
            "mic": data.message.devices.mic,
            "batch_id": 0,
            "date": "",
            "filename": "",
            "video_size": "",
            "audio_size": "",
            "duration": "",
            "file_id": null,
            "recording": 0,
            "merge": 0,
            "merge_percentage": 0,
            "upload": 0,
            "upload_percentage": 0,
            "sync": 0,
            "created_at": "",
            "modified_at": "",
          }];
          data.message.recordings = recordings;
          allPis[data.message.pi_id] = data.message;
        } else {
          const noStatusZero = data.message.recordings.every(recording => recording.status !== 0);
          if (noStatusZero) {
            // Add default recording
            data.message.recordings.push({
              "id": 0,
              "pi_id": data.message.pi_id,
              "camera": data.message.devices.camera,
              "mic": data.message.devices.mic,
              "batch_id": 0,
              "date": "",
              "filename": "",
              "video_size": "",
              "audio_size": "",
              "duration": "",
              "file_id": null,
              "recording": 0,
              "merge": 0,
              "merge_percentage": 0,
              "upload": 0,
              "upload_percentage": 0,
              "sync": 0,
              "created_at": "",
              "modified_at": "",
            });
          }
          allPis[data.message.pi_id] = data.message;

        }
      }
      // console.log(allPis);
      setDatas(Object.values(allPis));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Update the timestamp every second
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 500);
 
    // Clear the interval on component unmount to avoid memory leaks
    return () => clearInterval(interval);
  }, []);

  const openModal = (id) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const loaderIcon = <svg
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
    ></path></svg>

  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearTimeout);
      timerRefs.current = {};
    };
  }, []);


  const stopRecord = (pi_id, batch_id) => {
    setLoading(true);
    var payload = {
      "type": "rec_stop",
      "id": pi_id,
      "batch_id": batch_id
    }
    globalFunc(payload);
  };

  const startRecord = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "rec_start",
      "id": pi_id,
      "batch_id": '1234'
    }
    globalFunc(payload);
  };

  const clearRecord = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "clear_recordings",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const startReMerging = (pi_id, filename) => {
    setLoading(true);
    var payload = {
      "type": "merge",
      "id": pi_id,
      "filename": filename,
    }
    globalFunc(payload);
  }

  const reboot = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "reboot",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const shutDown = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "shutdown",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const reFresh = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "refresh",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const trash = (pi_id, filename) => {
    setLoading(true);
    var payload = {
      "type": "trash",
      "id": pi_id,
      "filename": filename,
    }
    globalFunc(payload);
  }

  const storageClear = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "storage_clear",
      "days": "10",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const globalFunc = (payload) => {
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      console.log(response);
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
  }

  // console.log(datas);

  return (

    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 overflow-hidden">
        <div style={{ display: styleLoader }}>
          {/* <Loader /> */}
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto overflow-hidden">
            <thead>
              <tr className="bg-gray-2 text-center dark:bg-meta-4">
                {/* <th className="min-w-[110px] max-h-242.5 py-4 px-4 font-medium text-black dark:text-white">
                  Sr.No
                </th> */}
                <th className="min-w-[110px] max-h-242.5 py-4 px-4 font-medium text-black dark:text-white">
                  Rec Status
                </th>
                <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                  Pi Id
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Storage
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Ram
                </th>
                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                  Devices
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Batch Id
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Video/Audio Size
                </th>

                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Duration
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Merge Percentage
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Upload Percentage
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {datas && datas.length > 0 && datas.map((element, indexs) => (
                element.recordings.filter((item) =>
                  Object.values(item).some((value) =>
                    String(value).toLowerCase().includes(inputValue.toLowerCase())
                  )
                ).map((record, index) => (
                  <tr key={record.id}>
                    {/* <td className="border-b border-[#eee] py-5 dark:border-strokedark ">
                      <p className="text-sm text-center"> {indexs + 1}</p>
                    </td> */}
                    <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <div className='h-10'>
                        <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                        <span className={`animate-ping absolute right-7.5 bottom-8 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        <span className={`absolute right-7.5 bottom-8 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 dark:border-strokedark ">
                      <p className="text-sm text-center"> {record.pi_id}</p>
                    </td>
                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                      <span className="text-sm text-center">
                        <TypoGraphy percentage={((element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']) * 100)} total={element['stats']['storage']['total_storage']} type='storage' />
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <span className="text-sm text-center">
                        <TypoGraphy percentage={((element['stats']['ram']['used_ram'] / element['stats']['ram']['total_ram']) * 100)} total={element['stats']['ram']['total_ram']} type='storage' />
                      </span>
                    </td>
                    <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                      {element['devices'].camera == 1 ? (
                        <HiVideoCamera style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#34e37d' }} />
                      ) : (
                        <HiVideoCameraSlash style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#d63c49' }} />
                      )}
                      {element['devices'].mic == 1 ? (
                        <IoIosMic style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto', color: '#34e37d' }} />
                      ) : (
                        <IoIosMicOff style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto', color: '#d63c49' }} />
                      )}
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.batch_id}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center">
                        {record.date && DateTime.fromFormat(record.date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd-MM-yyyy HH:mm:ss a')}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.video_size}/{record.audio_size}</p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.duration}</p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.id == 0 ? 'Idle' : record.status == 1 ? 'Merging' : record.status == 2 ? 'Uploading' : record.status == 0 ? 'Recording' : 'Completed'}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <span className="text-sm text-center"> <TypoGraphy percentage={record.merge_percentage} total={record.merge_percentage} type='upload' />
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <span className="text-sm text-center"> <TypoGraphy percentage={record.upload_percentage} total={record.upload_percentage} type='upload' /></span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      {/* <h5 className="font-medium text-black dark:text-white"> */}

                        {record.status == 0 ?
                          <button
                            type="button"
                            className={`text-black bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            data-twe-toggle="tooltip" onClick={() => stopRecord(record.pi_id, record.batch_id)} disabled={isLoading}
                            data-twe-placement="top"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            title="Stop">
                            {isLoading ? (
                              loaderIcon
                            ) : (
                              <FaRegCircleStop />
                            )}
                          </button> : record.id == 0 ? 
                          <div>
                            <button
                              type="button"
                              className={`text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white  rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              data-twe-toggle="tooltip"  onClick={() => openModal(record.pi_id)}
                              disabled={isLoading}
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Start">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <FcCamera  />
                              )}
                            </button>
                            <button
                            type="button"
                            className={`text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            data-twe-toggle="tooltip" onClick={() => startRecord(record.pi_id)} disabled={isLoading}
                            data-twe-placement="top"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            title="Start">
                            {isLoading ? (
                              loaderIcon
                            ) : (
                              <FaRegPlayCircle />
                            )}
                          </button><button
                            type="button"
                            className={`text-black bg-orange-400 border-b-orange-900 border-b-2 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => clearRecord(record.pi_id)} disabled={isLoading}
                            data-twe-toggle="tooltip"
                            data-twe-placement="top"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            title="Clean">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <MdCleaningServices />
                              )}
                            </button> <button
                              type="button"
                              className={`text-black bg-cyan-500 border-b-cyan-800 border-b-2 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-1 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => reboot(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Reboot">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <BsBootstrapReboot />
                              )}
                            </button>
                            <button
                              type="button"
                              className={`bg-red-400 border-b-red-900 text-black border-b-2 dark:text-white font-bold rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => shutDown(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Shutdown">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <RiShutDownLine />
                              )}
                            </button> <button
                              type="button"
                              className={`border-b-2 bg-blue-200 border-b-blue-700 dark:text-white rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => reFresh(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Refresh">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <LuRefreshCcwDot />
                              )}
                            </button> <button
                              type="button"
                              className={`border-b-2 bg-pink-200 border-b-pink-900 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => storageClear(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Clear Storage">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                // <MdOutlineSdStorage />
                                <GrClearOption />
                              )}
                            </button> </div> : record.status != 0 ? <div><button
                              type="button"
                              className={`text-black bg-blue-400 border-blue-900 border-b-2 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => startReMerging(record.pi_id, record.filename)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="ReMerge">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <TbArrowMerge />
                              )}
                            </button> <br /><button
                              type="button"
                              className={`border-b-2 bg-red-400 border-b-red-900 dark:text-white font-medium rounded-lg px-2 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => trash(record.pi_id, record.filename)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Trash">
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <RiDeleteBin6Fill />
                                )}
                              </button> </div> : record.status == 1 ? '' : ''}
                      {/* </h5> */}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>

        {/* Camera preview modal */}
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
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
                      onClick={() => setIsOpen(false)}
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
