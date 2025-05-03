import axios from 'axios';
import { del, get, post, put } from "../helpers/api_helper";
import Pusher from 'pusher-js';
import React, { useContext, useEffect, useRef, useState, Fragment } from 'react';
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
import { FcCamera } from "react-icons/fc";
import { MdCleaningServices } from "react-icons/md";
import { MdOutlineSdStorage } from "react-icons/md";
import { GrClearOption } from "react-icons/gr";
import { DateTime } from 'luxon';
import TypoGraphy from './TypoGraphy';
import { SearchContext } from './SearchContext';
import { Dialog, Transition } from "@headlessui/react";
// icons

import { FcStart } from "react-icons/fc";
import { FaPlay } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";
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
        }

        // Set a new timeout to delete the data.message.pi_id after 15 seconds
        timerRefs.current[data.message.pi_id] = setTimeout(() => {
          delete allPis[data.message.pi_id];
          delete timerRefs.current[data.message.pi_id];
          // Update the state after deletion
          setDatas(Object.values(allPis));
        }, 30000); //!wait 10 seconds


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
      "type": "device_refresh",
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
      "days": "5",
      "id": pi_id
    }
    globalFunc(payload);
  }

  const getClassrooms = () => {
    var payload = {}
    var url = 'get_classrooms';
    // api(payload,url);
  }

  const getVenues = async () => {
    try {
      const response = await get("rpi/get_venues", {});
      setVenues(JSON.parse(response.data));
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  }

  const getBatches = async () => {
    try {
      const response = await get("rpi/get_batches", {}); // Wait for the response
      setBatches(JSON.parse(response.data));
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };


  const globalFunc = (payload) => {
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
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

  return (

    <>
      <div className="rounded-lg border border-stroke bg-warmGray-200 px-1 pt-1 pb-2.5 min-h-fit shadow-default dark:border-strokedark  shadow-sm ring-1 ring-gray-900/5 dark:bg-slate-900 sm:px-2.5 xl:pb-1 text-sm flex-grow">
        <div style={{ display: styleLoader }}>
          {/* <Loader /> */}
        </div>
        {/* <div className="rounded-lg w-full overflow-x-auto">
          <table className="w-full table-auto overflow-hidden"> */}
            <div className="rounded-lg min-h-203">
          <table className="min-w-full table-fixed rounded">
            <thead>
              <tr className="bg-gray-2 text-center dark:bg-slate-800 overflow-hidden">
                <th className="min-w-[10px] py-2 px-4 font-medium text-black dark:text-warmGray-50">
                  #
                </th>
                <th className="min-w-[200px] py-2 px-4 font-medium text-black dark:text-white">
                  Pi Id - Venue
                </th>
                <th className="min-w-[60px] py-2 px-4 font-medium text-black dark:text-white">
                  Storage
                </th>
                <th className="min-w-[50px] py-2 px-1 font-medium text-black dark:text-white">
                  Devices
                </th>
                <th className="min-w-[250px] py-2 px-4 font-medium text-black dark:text-white">
                  Recordings<br />
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
            <tbody className=''>
              {datas && datas.length > 0 && datas.map((element, indexs) => {
                return (
                  <tr
                    key={element.id}
                    className="border-b border-[#eee] dark:border-strokedark "
                  >
                    <td className=" border-white pt-2 dark:border-strokedark text-center">
                      <label htmlFor="">{indexs + 1}</label>
                    </td>
                    <td className="max-w-[200px] border-white pt-2 dark:border-strokedark ">
                      <p className="text-sm font-bold dark:border-strokedark text-center">
                        <span>{element.pi_id}</span>
                        <br /> {venues[element['venue_id']]}
                      </p>
                    </td>
                    <td className="text-sm text-center  border-white pt-2 dark:border-strokedark">
                      <span className="text-sm text-center">
                        <TypoGraphy
                          percentage={
                            (element['stats']['storage']['used_storage'] /
                              element['stats']['storage']['total_storage']) *
                            100
                          }
                          total={element['stats']['storage']['total_storage']}
                          type="storage"
                        />
                      </span>
                    </td>
                    <td className="max-w-[200px]  text-sm text-center border-white pt-2 dark:border-strokedark">
                      {element['devices'].camera == 1 ? (
                        <HiVideoCamera
                          style={{
                            width: '18px',
                            height: '18px',
                            display: 'block',
                            margin: '0 auto',
                            color: '#34e37d',
                          }}
                        />
                      ) : (
                        <HiVideoCameraSlash
                          style={{
                            width: '18px',
                            height: '18px',
                            display: 'block',
                            margin: '0 auto',
                            color: '#d63c49',
                          }}
                        />
                      )}
                      {element['devices'].mic == 1 ? (
                        <IoIosMic
                          style={{
                            width: '18px',
                            height: '18px',
                            display: 'block',
                            margin: '0 auto',
                            color: '#34e37d',
                          }}
                        />
                      ) : (
                        <IoIosMicOff
                          style={{
                            width: '18px',
                            height: '18px',
                            display: 'block',
                            margin: '0 auto',
                            color: '#d63c49',
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <table>
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
                              <tr>
                                {/* <td colSpan={2} /> */}
                                <React.Fragment key={index}>
                                  <td className="min-w-[300px] py-0 px-4 border-white pt-2 pl-9 dark:border-strokedark">
                                    <div className="flex items-center justify-evenly">
                                      <div className="relative flex-shrink-0">
                                        <span
                                          className={`animate-ping absolute h-3.5 w-3.5 rounded-full  inline-flex border-2 border-white ${record.pi_id != 0 &&
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
                                          className={`relative  h-3.5 w-3.5  inline-flex rounded-full border-2 border-white ${record.pi_id != 0 &&
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
                                      <label
                                        className="text-sm text-center truncate w-48"
                                        data-twe-toggle="tooltip"
                                        data-twe-placement="top"
                                        data-twe-ripple-init
                                        data-twe-ripple-color="light"
                                        title={batches[record.batch_id]}
                                      >
                                        {batches[record.batch_id]}
                                      </label>
                                    </div>
                                  </td>
                                  <td className="w-[350px] py-0 px-4">
                                    <p className="text-sm text-center">
                                      {record.date &&
                                        DateTime.fromFormat(
                                          record.date,
                                          'yyyy-MM-dd HH:mm:ss',
                                        ).toFormat('d LLLL h:mm a')}
                                    </p>
                                  </td>
                                  <td className="w-[300px] py-0 px-4">
                                    <p className="text-sm text-center">
                                      {record.video_size}/{record.audio_size}
                                    </p>
                                  </td>
                                  <td className="w-[300px] py-0 px-4">
                                    <p className="text-sm text-center">
                                      {' '}
                                      {record.duration}
                                    </p>
                                  </td>
                                  <td className="w-[300px] py-0 px-4">
                                    <p className="text-sm text-center">
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
                                  <td className="w-[300px] py-0 px-4">
                                    {/* {record.status != 0 ? record.status == 1 ? <span className="text-sm text-center"> <TypoGraphy percentage={record.merge_percentage} total={record.merge_percentage} type='upload' />
                            </span> : <span className="text-sm text-center"> <TypoGraphy percentage={record.upload_percentage} total={record.upload_percentage} type='upload' /></span> : <span></span>} */}
                                    {record.status !== 0 && (
                                      <span className="flex items-center text-sm space-x-2">
                                        <LinearProgress
                                          variant="determinate"
                                          value={record.status === 1 ? record.merge_percentage : record.upload_percentage}
                                          className="w-24 h-2 inline-block rounded bg-blue-200 dark:bg-white"   sx={{
                                            '& .MuiLinearProgress-bar': { backgroundColor: '#4ade80' }, // e.g. Tailwind green-400
                                          }}
                                        />
                                        <span>
                                          {record.status === 1 ? record.merge_percentage : record.upload_percentage}%
                                        </span>
                                      </span>
                                    )}

                                  </td>
                                  <td className="min-w-[100px] py-0 px-4">
                                    <ActionsMenuNew
                                      isLast={
                                        index >= element.recordings.length - 3
                                      }
                                      // isLast={indexs >= datas.length - 1}
                                      record={record}
                                      isLoading={isLoading}
                                      loaderIcon={loaderIcon}
                                      stopRecord={stopRecord}
                                      openModal={openModal}
                                      startRecord={startRecord}
                                      clearRecord={clearRecord}
                                      reboot={reboot}
                                      shutDown={shutDown}
                                      reFresh={reFresh}
                                      storageClear={storageClear}
                                      startReMerging={startReMerging}
                                      trash={trash}
                                    />
                                    {/* <ActionMenu   
                                      isLast={index >= element.recordings.length - 3}
                                      // isLast={indexs >= datas.length - 1}
                                      record={record}
                                      isLoading={isLoading}
                                      loaderIcon={loaderIcon}
                                      stopRecord={stopRecord}
                                      openModal={openModal}
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
            </tbody>



            {/* <tbody>
              {datas && datas.length > 0 && datas.map((element, indexs) => (
                
                element.recordings.filter((item) =>
                  Object.values(item).some((value) =>
                    String(value).toLowerCase().includes(inputValue.toLowerCase())
                  )
                ).map((record, index) => (
                  <tr key={record.id}>
                    <td className="border-b border-[#eee] py-2 dark:border-strokedark ">
                      <p className="text-sm text-center"> {indexs + 1}</p>
                    </td>
                    <td className="border-b relative rounded-full border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <div className='h-10 relative'>
                        <img src={rpi} alt="User" style={{ height: '40px', width: '38px' }} />
                        <span className={`animate-ping absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        <span className={`absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                      </div>
                    </td>
                    <td className="border-b border-[#eee] pt-2 dark:border-strokedark ">
                      <p className="text-md font-bold dark:border-strokedark text-center"> <span>{record.pi_id}</span><br/> {venues[element['venue_id']]}</p>
                    </td>
                    <td className="text-sm text-center border-b border-[#eee] pt-2 dark:border-strokedark">
                      <span className="text-sm text-center">
                        <TypoGraphy percentage={((element['stats']['storage']['used_storage'] / element['stats']['storage']['total_storage']) * 100)} total={element['stats']['storage']['total_storage']} type='storage' />
                      </span>
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <span className="text-sm text-center">
                        <TypoGraphy percentage={((element['stats']['ram']['used_ram'] / element['stats']['ram']['total_ram']) * 100)} total={element['stats']['ram']['total_ram']} type='storage' />
                      </span>
                    </td>
                    <td className="text-sm text-center align-middle border-b border-[#eee] pt-2 dark:border-strokedark">
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

                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {batches[record.batch_id]}</p>
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center">
                        {record.date && DateTime.fromFormat(record.date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd-MM-yyyy HH:mm:ss a')}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.video_size}/{record.audio_size}</p>
                    </td>

                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.duration}</p>
                    </td>

                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.id == 0 ? 'Idle' : record.status == 1 ? 'Merging' : record.status == 2 ? 'Uploading' : record.status == 0 ? 'Recording' : 'Completed'}</p>
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">

                    {record.status != 0 ? record.status == 1? <span className="text-sm text-center"> <TypoGraphy percentage={record.merge_percentage} total={record.merge_percentage} type='upload' />
                    </span> : <span className="text-sm text-center"> <TypoGraphy percentage={record.upload_percentage} total={record.upload_percentage} type='upload' /></span>:<span></span>}

                   
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                      
                    </td>
                    <td className="border-b border-[#eee] pt-2 px-4 pl-9 dark:border-strokedark">
                        {record.status == 0 ?
                          <button
                            type="button"
                            className={`text-black bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            data-twe-toggle="tooltip" onClick={() => stopRecord(record.pi_id, record.batch_id)} disabled={isLoading}
                            data-twe-placement="top"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            title="Stop Recording">
                            {isLoading ? (
                              loaderIcon
                            ) : (
                              <FaRegCircleStop />
                            )}
                          </button> : record.id == 0 ? 
                          <div>
                            <button
                              type="button"
                              className={`text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white  rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              data-twe-toggle="tooltip"  onClick={() => openModal(record.pi_id)}
                              disabled={isLoading}
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Camera Preview">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <FcCamera  />
                              )}
                            </button>
                            <button
                            type="button"
                            className={`text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            data-twe-toggle="tooltip" onClick={() => startRecord(record.pi_id)} disabled={isLoading}
                            data-twe-placement="top"
                            data-twe-ripple-init
                            data-twe-ripple-color="light"
                            title="Start Recording">
                            {isLoading ? (
                              loaderIcon
                            ) : (
                              <BsRecordCircle />
                            )}
                            </button>
                            <button
                            type="button"
                            className={`text-black bg-orange-400 border-b-orange-900 border-b-2 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            </button> 
                            <button
                              type="button"
                              className={`text-black bg-cyan-500 border-b-cyan-800 border-b-2 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-1 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                              className={`bg-red-400 border-b-red-900 text-black border-b-2 dark:text-white font-bold rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            </button> 
                            <button
                              type="button"
                              className={`border-b-2 bg-blue-200 border-b-blue-700 dark:text-white rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => reFresh(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Device Refresh">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <LuRefreshCcwDot />
                              )}
                            </button> 
                            <button
                              type="button"
                              className={`border-b-2 bg-pink-200 border-b-pink-900 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => storageClear(record.pi_id)} disabled={isLoading}
                              data-twe-toggle="tooltip"
                              data-twe-placement="top"
                              data-twe-ripple-init
                              data-twe-ripple-color="light"
                              title="Clear Storage">
                              {isLoading ? (
                                loaderIcon
                              ) : (
                          
                                <GrClearOption />
                              )}
                            </button> 
                          </div> : record.status != 0 ? <div>
                            <button
                              type="button"
                              className={`text-black bg-blue-400 border-blue-900 border-b-2 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            </button> <br />
                            <button
                              type="button"
                              className={`border-b-2 bg-red-400 border-b-red-900 dark:text-white font-medium rounded-lg px-1 py-1 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            </button> 
                          </div> : record.status == 1 ? '' : ''}
                    </td>
                  </tr>
                ))
              ))}
            </tbody> */}


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
