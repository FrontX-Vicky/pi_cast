import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import axios from 'axios';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import { HiVideoCamera } from "react-icons/hi2";
import { HiVideoCameraSlash } from "react-icons/hi2";
import { IoIosMic } from "react-icons/io";
import { IoIosMicOff } from "react-icons/io";
import { FaRegPlayCircle } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { TbArrowMerge } from "react-icons/tb";
import { FaRegCircleStop } from "react-icons/fa6";
import { DateTime } from 'luxon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TimerSet from './TimerSet';
import TimerFnc from '../pages/TimerFnc';
const TableThree = () => {
  const [datas, recordingData] = useState([]);
  const [allPiDatas, piData] = useState([]);
  const [startAction, recStartAction] = useState(true);
  const [styleLoader, hideLoader] = useState('none');

  let filterPi = {};
  const piId = useParams();
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
    var channel = pusher.subscribe('pi_connect');
    // debugger;
    // Subscribe to a channel and log incoming events
    // Log all events to the console
    // channel.bind_global(function (eventName = 'AppConnect', data) {
      channel.bind_global(function (eventName, data) {
      // console.log('Full event data:', data);
      if (data != undefined && data.message) {
        hideLoader('none');
        // console.log(data.message.pi_id);
        if (data && data.message.pi_id != '' && data.message.pi_id != null) {
          const filterData = data.message.pi_id == piId['id'] ? data.message : '';
          // debugger;
          if (filterData != '') {
            const TimerPiId = <TimerFnc pi_id={filterData.pi_id} />
            // const TimerPiId = <TimerSet pi_id={filterData.pi_id} />
            if (TimerPiId != '') {
              delete filterPi[TimerPiId];
            }
            if (filterData && filterData.recordings.length == 0) {
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
              const noStatusZero = filterData.recordings.every(recording => recording.status !== 0);
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
      }
    });
  }, []);

  const startRecord = () => {
    var payload = {
      "type": "rec_start",
      "id": piId['id'],
      "batch_id": '1234'
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        // Access the response data directly, no need for JSON.parse()
        const res = response.data;

        if (res && res['serial_no']) {
          recStartAction(false);
          console.log('Successfully Start');
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

  const stopRecord = (batch_id) => {
    var payload = {
      "type": "rec_stop",
      "id": piId['id'],
      "batch_id": batch_id
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        if (response) {
          console.log('Successfully stopped');
        } else {
          console.log('Something went wrong is Api response');
        }
      } catch (err) {
        console.log('Error Occured while making an API request');
      }

    });
  };
  // debugger;
  return (

    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div style={{ display: styleLoader }}>
        <Loader />
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
                  <td className="border-b border-[#eee] py-5 dark:border-strokedark ">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm text-center"> {record.pi_id}</p>
                  </td>
                  <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                    {record['devices'].camera == 1 ? (
                      <HiVideoCamera style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#34e37d' }} />
                    ) : (
                      <HiVideoCameraSlash style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto', color: '#d63c49' }} />
                    )}
                  </td>
                  <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                    {record['devices'].mic == 1 ? (
                      <IoIosMic style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto', color: '#34e37d' }} />
                    ) : (
                      <IoIosMicOff style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto', color: '#d63c49' }} />
                    )}
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

                            {`${Math.round(record['merge_percentage'])}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    {/* <p className="text-sm text-center">{record.status != 0 && record.id != 0 && <progress value={record.upload_percentage} max="100"></progress>}</p> */}
                   {<Box sx={{ width: '80%', textAlign: 'center' }}>
                      <Typography variant="body1" gutterBottom>
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          className="font-medium text-black dark:text-white"
                          variant="determinate"
                          value={record['upload_percentage']}
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
      </div>
    </div >
  );
};

export default TableThree;
