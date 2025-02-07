import Pusher from 'pusher-js';
import { lazy, useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import axios from 'axios';
import ReactPlayer from 'react-player'
import StorageUsageChart from './StorageUsageChart';
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
import { DateTime } from 'luxon';
import TypoGraphy from './TypoGraphy';
import { LuRefreshCcwDot } from "react-icons/lu";
import { MdCleaningServices } from "react-icons/md";
import GdriveModal from './GdriveModal';
import PreviewIcon from '@mui/icons-material/Preview';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, IconButton } from '@mui/material';
const TableThree = () => {
  const [datas, recordingData] = useState([]);
  const [allPiDatas, piData] = useState([]);
  const [startAction, recStartAction] = useState(true);
  const [styleLoader, hideLoader] = useState('none');
  let TimerPiId = '';
  const [isLoading, setLoading] = useState(false);
  // let storage = {};
  // let ram = {};
  const [storage, setStorage] = useState([]);
  const [ram, setRam] = useState([]);
  const [camera, setcamera] = useState('0');
  const [mic, setmic] = useState('');
  const [recodStats, setrecodStats] = useState('0');
  const [noStatusZero, setNoStatusZero] = useState('');
  const [cameraRecording, setCameraRecording] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  let stats = '';
  let devices = '';
  let filterPi = {};
  const piId = useParams();
  // useEffect(() =>{
  //   getCameraRecFunc();
  // })
  useEffect(() => {
    // var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
    //   cluster: 'mt1',
    //   wsHost: 'api.tickleright.in',
    //   wsPort: 443,
    //   wssPort: 443,
    //   enabledTransports: ['ws', 'wss'],
    //   forceTLS: true,
    //   authEndpoint: 'https://api.tickleright.in/api/broadcasting/auth',
    //   auth: {
    //     "headers": { "Authorization": 'Bearer 4|itKZrhvOFxpBMbP2wSJF8VvTTwMHh4BmtSo4hAMP137f2928' }
    //   }
    // });
    // var channel = pusher.subscribe('private-app_connect.4');
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true
    });
    var channel = pusher.subscribe('pi_cast');
    // debugger;
    // Subscribe to a channel and log incoming events
    // Log all events to the console
    // channel.bind_global(function (eventName = 'AppConnect', data) {
    channel.bind_global(function (eventName, data) {
      // console.log('Full event data:', data);
      // debugger;
      if (data != undefined && data.message) {
        hideLoader('none');
        // console.log(data.message.pi_id);
        if (data && data.message.pi_id != '' && data.message.pi_id != null) {
          const filterData = data.message.pi_id == piId['id'] ? data.message : '';
          if (filterData != '') {
            // TimerPiId =  TimerSet(filterData.pi_id)
            // if (TimerPiId != '') {
            //   delete filterPi[TimerPiId];
            // }
            if (filterData && filterData.recordings.length == 0) {
              setrecodStats('0');
              let recordings = [{
                "id": 0,
                "pi_id": filterData.pi_id,
                "camera": filterData.devices.camera,
                "mic": filterData.devices.mic,
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
              filterData.recordings = recordings;
              filterPi[filterData.pi_id] = filterData;
            } else {
              setrecodStats('1');
              const noStatusZero = filterData.recordings.every(recording => recording.status !== 0);
              setNoStatusZero(noStatusZero);
              if (noStatusZero) {
                // Add default recording
                filterData.recordings.push({
                  "id": 0,
                  "pi_id": filterData.pi_id,
                  "camera": filterData.devices.camera,
                  "mic": filterData.devices.mic,
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
              filterPi[filterData.pi_id] = filterData;
              
            }
          } else {
            // hideLoader('block');
          }
        }
        recordingData(Object.values(filterPi));
        // console.log(data);
        if(Object.keys(filterPi).length>0){
          devices = data['message']['devices'];
          setcamera(devices['camera']);
          setmic(devices['mic']);
          
          stats = data['message']['stats'];
          const storageData = {
            free: stats['storage']['free_storage'],
            total: stats['storage']['total_storage'],
            used: stats['storage']['used_storage'],
          };
       
          const ramData = {
            free: stats['ram']['free_ram'],
            total: stats['ram']['total_ram'],
            used: stats['ram']['used_ram'],
          };
  
          setStorage(storageData);
          setRam(ramData);
        }
    
        // Extract RAM data
        
      }
    });
    getCameraRecFunc();
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

  const globalFunc = (payload) => {
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      console.log(response);

      try {
        if (response) {
          // setLoading(false);
          console.log('Successfully ' + payload.type);
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }
    });
  }

  const getCameraRecFunc = () => {
    var payload = {
      pi_id: piId['id']
    };
    axios.post('https://api.tickleright.in/api/camRecData', payload).then((response) => {
      if (response.status === 200) {
        if (response.data.error == 0) {
          setCameraRecording(response.data[0]);
        } else {
          setCameraRecording('');
        }
      } else {
        setCameraRecording('');
      }
    });
  }

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDriveUrl('');
  };

  const viewRec = (file_data) => {
    handleOpenModal();
    let file_id = file_data['original']['file_id'];
    setDriveUrl(file_id);
  }

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

  const columns = useMemo(
    () => [
      {
        accessorKey: "batch", //simple recommended way to define a column
        header: "Batch Id",
        Header: <b style={{ color: "green" }}>Batch Id</b> //optional custom markup
      },
      {
        accessorFn: (row) => row.date, //alternate way
        id: "date", //id required if you use accessorFn instead of accessorKey
        header: "Date",
        Header: <b style={{ color: "blue" }}>Date</b> //optional custom markup
      }
    ],
    []
  );
  // debugger;

  var localMode = localStorage.getItem('color-theme');
  var cleanedMode = localMode.replace(/^"|"$/g, ""); // Remove the surrounding quotes
  console.log(cleanedMode); // Should print "light"
  console.log(cleanedMode.length);
  // var text_color = cleanedMode == "light" ? 'text-black' : 'text-white'
  var bg_color = cleanedMode == "light" ? '#FFFFFF' : '#000000';  // For background color (light -> white, dark -> black)
  var text_color = cleanedMode == "light" ? '#000000' : '#FFFFFF';  // For text color (light -> black, dark -> white)

  const table = useMaterialReactTable({
    columns,
    data: cameraRecording,
    muiTableProps: {
      className: "rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ", // Apply the class to the table
    },
    muiTableHeadCellProps: {
      className: "rounded-tl-sm rounded-tr-sm  dark:border-strokedark dark:bg-boxdark", // You can also add specific classes for header cells if needed
    },
    muiTableBodyRowProps: {
      className: "custom-row-class  dark:border-strokedark dark:bg-boxdark", // Apply custom class to rows
    },
    muiTableFooterRowProps: {
      className: "custom-footer-class  dark:border-strokedark dark:bg-boxdark", // Apply custom class to footer rows
    },
    muiTableFooterCellProps: {
      className: "custom-footer-cell-class  dark:border-strokedark dark:bg-boxdark", // Apply custom class to footer cells
    },

    muiTableBodyCellProps: ({ table }) => {
      const localMode = localStorage.getItem('color-theme');
      const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', cleanedMode === 'dark');
      }
      // console.log(localStorage.getItem('color-theme'));
      return {
        className: "border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:text-white dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1",
      };
    },
    muiTableHeadCellProps: ({ table }) => {
      const localMode = localStorage.getItem('color-theme');
      const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

      const isDarkMode = cleanedMode === 'dark';

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', cleanedMode === 'dark');
      }
      return {
        className: "dark:text-white dark:border-strokedark dark:bg-boxdark"
      };
    },

    muiTableFooterCellProps: ({ table }) => {
      const localMode = localStorage.getItem('color-theme');
      const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

      const isDarkMode = cleanedMode === 'dark';

      return {
        className: "dark:text-white dark:border-strokedark dark:bg-boxdark"
      };
    },
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    positionGlobalFilter: 'right',
    positionPagination: 'bottom',
    positionActionsColumn: 'last',
    columnFilterDisplayMode: 'popover',
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton color="warning" onClick={() => viewRec(row)}>

          <PreviewIcon />
        </IconButton>
      </Box>
    ),
    initialState: {
      showColumnFilters: true,
      density: 'compact',
      pagination: { pageSize: 4, pageIndex: 0 },
      showGlobalFilter: true,
    },
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      showRowsPerPage: false,
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
  });
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div style={{ display: styleLoader }}>
          <Loader />
        </div>
        <div className='flex flex-row'>
          <div className='basis-1/4 text-green-800 font-bold'>
            {storage && storage != '' ?
              <StorageUsageChart data={storage} type='Storage' />
              : 'No Data Found'}
          </div>
          <div className='basis-1/4 mx-6 text-green-800 font-bold'>
            {ram && ram != '' ?
              <StorageUsageChart data={ram} type='Ram' />
              : 'No Data Found'}</div>

          <div className=''>
            <div className='box h-28 w-28 p-4 mt-4 shadow-6'>
              {camera && camera == '1' ?
                <HiVideoCamera style={{ width: '70px', height: '70px', display: 'block', margin: '0 auto', color: '#34e37d' }} /> : <HiVideoCameraSlash style={{ width: '70px', height: '70px', display: 'block', margin: '0 auto', color: '#e7344c' }} />
              }
            </div>
            <div className='box h-28 w-28 p-4 mt-9 shadow-6'>
              {mic && mic == '1' ?
                <IoIosMic style={{ width: '70px', height: '70px', display: 'block', margin: '0 auto', color: '#34e37d' }} /> : <IoIosMicOff style={{ width: '70px', height: '70px', display: 'block', margin: '0 auto', color: '#e7344c' }} />
              }
            </div>
          </div>
          <div className='basis-2/4 max-h-60 px-4'>
            <MaterialReactTable table={table} columns={columns} data={cameraRecording} />
          </div>

        </div>
        {driveUrl != '' && (<GdriveModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          handleOpenModal={handleOpenModal}
          file_id={driveUrl}
        />)}

        <div className="flex py-4">
          <div className='basis-1/2 text-sm text-center'>
            {recodStats && <table className="w-100 table-auto shadow-6">
              <thead className=''>
                <tr className="bg-gray-2 text-center dark:bg-meta-4">
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Rec Status
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Batch Id
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Date
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {datas && datas.map((record) => (
                  record.recordings.map((element) => (
                    element['id'] == 0 && <tr key={element['id']}>
                      <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <div className='h-10'>
                          <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                          <span className={`animate-ping absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                          <span className={`absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        </div>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center"> {element.batch_id}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center">
                          {element.date && DateTime.fromFormat(element.date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd-MM-yyyy HH:mm:ss a')}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                          <button
                            type="button"
                            className={`text-sm text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => startRecord(record.pi_id)} disabled={isLoading}
                          >
                            {isLoading ? (
                              loaderIcon
                            ) : (
                              <FaRegPlayCircle />
                            )}
                          </button>
                        </h5>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>}
          </div>
          <div className='basis-1/2'>
            {recodStats && <table className="w-125 table-auto shadow-6">
              <thead>
                <tr className="bg-gray-2 text-center dark:bg-meta-4">
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Rec Status
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Batch Id
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Date
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Audio Size
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Video Size
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Duration
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Merge Percentage
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Upload Percentage
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {datas && datas.map((record) => (
                  record.recordings.map((element) => (
                    record.status != 0 && element['id'] != 0 &&
                    <tr key={element['id']}>
                      <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <div className='h-10'>
                          <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                          <span className={`animate-ping absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                          <span className={`absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        </div>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center"> {element.batch_id}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center">
                          {element.date && DateTime.fromFormat(element.date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd-MM-yyyy HH:mm:ss a')}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center"> {element.audio_size}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center"> {element.video_size}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                        </h5>
                        <p className="text-sm text-center"> {element.duration}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <span className="text-sm text-center"> <TypoGraphy percentage={element.merge_percentage} total={element.merge_percentage} type='upload' />
                        </span>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <span className="text-sm text-center"> <TypoGraphy percentage={element.upload_percentage} total={element.upload_percentage} type='upload' /></span>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                        <h5 className="font-medium text-black dark:text-white">
                          {element.status == 0 ?
                            <button
                              type="button"
                              className={`text-sm text-black bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}

                              onClick={() => stopRecord(element.pi_id, element.batch_id)} disabled={isLoading}
                            >{isLoading ? (
                              loaderIcon
                            ) : (
                              <FaRegCircleStop />
                            )}
                            </button> : element.id == 0 ? <div><button
                              type="button"
                              className={`text-sm text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => startRecord(element.pi_id)} disabled={isLoading}
                            >
                              {isLoading ? (
                                loaderIcon
                              ) : (
                                <FaRegPlayCircle />
                              )}
                            </button><button
                              type="button"
                              className={`text-sm text-black bg-orange-400 border-b-orange-900 border-b-2 w-12 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() => clearRecord(element.pi_id)} disabled={isLoading}
                            >
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <MdCleaningServices />
                                )}

                              </button><button
                                type="button"
                                className={`text-sm text-black bg-cyan-500 border-b-cyan-800 border-b-2 w-12 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => reboot(element.pi_id)} disabled={isLoading}>
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <BsBootstrapReboot />
                                )}
                              </button>
                              <button
                                type="button"
                                className={`text-sm bg-red-400 border-b-red-900 text-black border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => shutDown(element.pi_id)} disabled={isLoading}
                              >
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <RiShutDownLine />
                                )}
                              </button><button
                                type="button"
                                className={`text-sm border-b-2 bg-blue-200 border-b-blue-700 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => reFresh(element.pi_id)} disabled={isLoading}
                              >
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <LuRefreshCcwDot />
                                )}
                              </button></div> : element.status != 0 ? <div><button
                                type="button"
                                className={`text-sm text-black bg-blue-400 border-blue-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => startReMerging(element.pi_id, element.filename)} disabled={isLoading}
                              >
                                {isLoading ? (
                                  loaderIcon
                                ) : (
                                  <TbArrowMerge />
                                )}
                              </button><br /><button
                                type="button"
                                className={`text-sm border-b-2 bg-red-400 border-b-red-900 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => trash(element.pi_id, element.filename)} disabled={isLoading}
                              >
                                  {isLoading ? (
                                    loaderIcon
                                  ) : (
                                    <RiDeleteBin6Fill />
                                  )}
                                </button></div> : element.status == 1 ? '' : ''}
                        </h5>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>}
          </div>
        </div>
        {/* <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-center dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Rec Status
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Batch Id
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Audio Size
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Video Size
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
                <th className="min-w-[170px] py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {datas && datas.map((record) => (
                record.recordings.map((element) => (
                  <tr key={element['id']}>
                    <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <div className='h-10'>
                        <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                        <span className={`animate-ping absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        <span className={`absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center"> {record.batch_id}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center">
                        {record.date && DateTime.fromFormat(record.date, 'yyyy-MM-dd HH:mm:ss').toFormat('dd-MM-yyyy HH:mm:ss a')}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center"> {record.audio_size}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center"> {record.video_size}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center"> {record.duration}</p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      <p className="text-sm text-center"> {record.id == 0 ? '' : record.status == 1 ? 'Merging' : record.status == 2 ? 'Uploading' : record.status == 0 ? 'Recording' : 'Completed'}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      {<Box sx={{ width: '80%', textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            className="font-medium text-black dark:text-white"
                            variant="determinate"
                            value={record['merge_percentage']}
                            size={50}
                            color='primary'
                            thickness={4.6}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary" className='dark:text-white'>

                              {`${Math.round(record['merge_percentage'])}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                      </h5>
                      {<Box sx={{ width: '80%', textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            className="font-medium text-black dark:text-white"
                            variant="determinate"
                            value={record['upload_percentage']}
                            size={50}
                            color='warning'
                            thickness={4.6}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary" className='dark:text-white'>
                              {`${Math.round(record['upload_percentage'])}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {record['status'] == 0 ?
                          <button
                            type="button"
                            className="text-sm bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2"
                            onClick={() => stopRecord(record['pi_id'], record['batch_id'])}
                          >
                            <FaRegCircleStop style={{ width: '15px', height: '15px', display: 'block', margin: '0 auto' }} />
                          </button> : record.id == 0 ? <button
                            type="button"
                            className="text-sm bg-green-400 border-green-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => startRecord(record.pi_id)}
                          >
                            <FaRegPlayCircle style={{ width: '15px', height: '15px', display: 'block', margin: '0 auto' }} />
                          </button> : record.status != 0 ? <div><button
                            type="button"
                            className="text-sm bg-blue-400 border-blue-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => startMerging(record.pi_id, record.filename)}
                          >
                            <TbArrowMerge style={{ width: '15px', height: '15px', display: 'block', margin: '0 auto' }} />
                          </button><button
                            type="button"
                            className="text-sm bg-red-400 border-r-red-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => trash(record.pi_id, record.filename)}
                          >
                              <RiDeleteBin6Fill style={{ width: '15px', height: '15px', display: 'block', margin: '0 auto' }} />
                            </button> </div> : record.status == 1 ? '' : ''}
                      </h5>
                    </td>
                  </tr>
                ))
              ))}

            </tbody>
          </table>
        </div> */}
      </div>
    </>
  );
};

export default TableThree;
