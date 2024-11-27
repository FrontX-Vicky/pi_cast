import axios from 'axios';
import Pusher from 'pusher-js';
import React, { useEffect, useRef, useState } from 'react';
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

import { MdCleaningServices } from "react-icons/md";
import { DateTime } from 'luxon';

import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
const Pi_Casting = () => {
  var arrayOfRecording = [];
  var allRecording = [];

  const [availablePi, setavailablePi] = useState<string[]>([]);
  const timerRefs = useRef({});
  // const [availablePi, setavailablePi] = useState([]);
  let allPis = {};
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
          console.log('Cleared timeout for data.message.pi_id: ' + data.message.pi_id);
        }

        // Set a new timeout to delete the data.message.pi_id after 15 seconds
        timerRefs.current[data.message.pi_id] = setTimeout(() => {
          delete allPis[data.message.pi_id];
          delete timerRefs.current[data.message.pi_id];
          // Update the state after deletion
          setDatas(Object.values(allPis));
          console.log('Deleted data.message.pi_id after 15 seconds: ' + data.message.pi_id);
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
    });
  }, []);

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
  ></path>
</svg>

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
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          setLoading(false);
          console.log('Successfully stopped');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  };

  const startRecord = (pi_id) => {
    setLoading(true);
    var payload = {
      "type": "rec_start",
      "id": pi_id,
      "batch_id": '1234'
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        // Access the response data directly, no need for JSON.parse()
        const res = response.data;
        setLoading(false);
        if (res && res['serial_no']) {
          // Use filter to remove the pi_id from availablePi
          setavailablePi((prevAvailablePi) => {
            const filteredPiArray = prevAvailablePi.filter((id) => id !== pi_id);

            // Step 2: After removing, add the pi_id back to the array
            return [...filteredPiArray, pi_id];
          });
          console.log('Successfully stopped');
        } else {
          console.log('Something went wrong in the API response');
        }
      } catch (err) {
        console.log('Error occurred while processing the response:', err);
      }
    }).catch((error) => {
      console.log('Error occurred while making the API request:', error);
    });

  };

  const clearRecord = (pi_id) => {
    var payload = {
      "type": "clear_recordings",
      "id": pi_id
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Clear');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occurred while making an API request');
      }

    });
  }

  const startMerging = (pi_id, filename) => {
    var payload = {
      "type": "merge",
      "id": pi_id,
      "filename": filename,
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Merging Start');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  }

  const reboot = (pi_id) => {
    var payload = {
      "type": "reboot",
      "id": pi_id
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Reboot');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  }

  const shutDown = (pi_id) => {
    var payload = {
      "type": "shutdown",
      "id": pi_id
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully ShutDown');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  }

  const reFresh = (pi_id)=>{
    var payload = {
      "type": "refresh",
      "id": pi_id
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Pi refresh');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  }

  const trash = (pi_id, filename) => {
    var payload = {
      "type": "trash",
      "id": pi_id,
      "filename": filename,
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Going To Trash');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  }
  // console.log(datas);

  const globalFunc = (payload)=>{
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully Going To '+  payload.action.toupperCase()); 
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
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 ">
        <div style={{ display: styleLoader }}>
          {/* <Loader /> */}
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-center dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Rec Status
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Pi Id
                </th>
                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                  Camera
                </th>
                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                  Mic
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Batch Id
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Video Size
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Audio Size
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
              {/* {datas && Object.keys(datas).length > 0 && Object.values(datas).map((element, index) => ( */}
              {datas && datas.length > 0 && datas.map((element, index) => (
                element.recordings.map((record, index) => (
                  <tr key={record.id}>
                    <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <div className='h-10'>
                        <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                        <span className={`animate-ping absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                        <span className={`absolute right-10 bottom-6 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6' : 'bg-meta-7'}`} />
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 dark:border-strokedark ">
                      <p className="text-sm text-center"> {record.pi_id}</p>
                    </td>
                    <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                      {element['devices'].camera == 1 ? (
                        <HiVideoCamera style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#34e37d' }} />
                      ) : (
                        <HiVideoCameraSlash style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#d63c49' }} />
                      )}
                    </td>
                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
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
                      <p className="text-sm text-center"> {record.video_size}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.audio_size}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.duration}</p>
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <p className="text-sm text-center"> {record.id == 0 ? '' : record.status == 1 ? 'Merging' : record.status == 2 ? 'Uploading' : record.status == 0 ? 'Recording' : 'Completed'}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <span className="text-sm text-center"> {<Box sx={{ width: '80%', textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            className="font-medium text-black dark:text-white"
                            variant="determinate"
                            value={record.merge_percentage}
                            size={50} // Adjust the size as needed
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

                              {`${Math.round(record.merge_percentage)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      {/* <p className="text-sm text-center">{record.status != 0 && record.id != 0 && <progress value={record.upload_percentage} max="100"></progress>}</p> */}
                      <span className="text-sm text-center"> {<Box sx={{ width: '80%', textAlign: 'center' }}>
                        <Typography variant="body1" gutterBottom>
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            className="font-medium text-black dark:text-white"
                            variant="determinate"
                            value={record.upload_percentage}
                            size={50} // Adjust the size as needed
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
                              {`${Math.round(record.upload_percentage)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>}</span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      <h5 className="font-medium text-black dark:text-white">
                        {record.status == 0 ?
                          <button
                            type="button"
                            // className="text-sm text-black bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2"
                            className={`text-sm text-black bg-orange-300 border-b-2 border-orange-800 text-center dark:text-white font-medium rounded-lg px-4 py-2 me-2 mb-2 ${isLoading? "opacity-50 cursor-not-allowed" : ""}`}
                            
                            onClick={() => stopRecord(record.pi_id, record.batch_id)} disabled={isLoading}
                          >{isLoading ? (
                            loaderIcon
                          ) : (
                            <FaRegCircleStop className="mr-2" />
                          )}
                            {/* <FaRegCircleStop /> */}
                          </button> : record.id == 0 ? <div><button
                            type="button"
                            className={`text-sm text-black bg-green-400 border-b-green-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2 ${isLoading? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => startRecord(record.pi_id)} disabled={isLoading}
                          >
                            {isLoading ? (
                            loaderIcon
                          ) : (
                            <FaRegPlayCircle className="mr-2" />
                          )}
                            {/* <FaRegPlayCircle /> */}
                          </button><button
                            type="button"
                            className="text-sm text-black bg-orange-400 border-b-orange-900 border-b-2 w-12 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => clearRecord(record.pi_id)}
                          ><MdCleaningServices /></button><button
                            type="button"
                            className="text-sm text-black bg-red-300 border-b-red-700 border-b-2 w-12 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => reboot(record.pi_id)}>
                              <BsBootstrapReboot />
                              </button>
                            <button
                              type="button"
                              className="text-sm bg-red-400 border-b-red-900 text-black border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                              onClick={() => shutDown(record.pi_id)}
                            ><RiShutDownLine /></button><button
                              type="button"
                              className="text-sm border-b-2 bg-blue-200 border-b-blue-700 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                              onClick={() => reFresh(record.pi_id)}
                            >
                              <GrPowerReset />
                            </button></div>  : record.status != 0 ? <div><button
                            type="button"
                            className="text-sm text-black bg-blue-400 border-blue-900 border-b-2 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                            onClick={() => startMerging(record.pi_id, record.filename)}
                          >
                            <TbArrowMerge />
                          </button><button
                              type="button"
                              className="text-sm border-b-2 bg-red-200 border-b-red-700 dark:text-white font-medium rounded-lg px-4 py-2 text-center me-2 mb-2"
                              onClick={() => trash(record.pi_id, record.filename)}
                            >
                              <RiDeleteBin6Fill />
                            </button></div> : record.status == 1 ? '' : ''}
                      </h5>
                      {/* <tr> */}

                      {/* </tr> */}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
};
export default Pi_Casting;
