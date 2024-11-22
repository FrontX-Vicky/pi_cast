import axios from 'axios';
import Pusher from 'pusher-js';
import React, { useEffect, useRef, useState } from 'react';
import Loader from '../common/Loader';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import { HiVideoCamera } from "react-icons/hi2";
import { HiVideoCameraSlash } from "react-icons/hi2";
import { IoIosMic } from "react-icons/io";
import { IoIosMicOff } from "react-icons/io";
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
    var channel = pusher.subscribe('pi_connect');
    // Log all events to the console
    channel.bind_global(function (eventName, data) {
      if (data.message) {

        // if (timerRefs.current[data.message.pi_id]) {
        //   clearTimeout(timerRefs.current[data.message.pi_id]);
        //   console.log('clear timeout of message ' + data.message.pi_id);
        // }

        // timerRefs.current[data.message.pi_id] = setTimeout(() => {
        //   setDatas(prevDatas => {
        //     const newDatas = { ...prevDatas };
        //     delete newDatas[data.message.pi_id];
        //     return newDatas;
        //   });
        //   delete timerRefs.current[data.message.pi_id];
        // }, 15000);

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
        }, 15000);


        if (data.message.recordings.length == 0) {
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
          allPis[data.message.pi_id] = data.message;
          
        }
      }
      // console.log(allPis);
      setDatas(Object.values(allPis));
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearTimeout);
      timerRefs.current = {};
    };
  }, []);

  const stopRecord = (pi_id, batch_id) => {
    var payload = {
      "type": "rec_stop",
      "id": pi_id,
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

  const startRecord = (pi_id) => {
    var payload = {
      "type": "rec_start",
      "id": pi_id,
      "batch_id": '1234'
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        // Access the response data directly, no need for JSON.parse()
        const res = response.data;

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
  console.log(datas);
  return (

    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
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
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* {datas && Object.keys(datas).length > 0 && Object.values(datas).map((element, index) => ( */}
            {datas && datas.length > 0 && datas.map((element, index) => (
              element.recordings.map((record, index) => (
                <tr key={record.id}>
                  <td className="border-b relative rounded-full border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    {/* <td className="relative h-14 w-26 rounded-full flex items-center justify-center dark:text-white text-sm"> */}
                    <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                    <span className={`absolute right-9 bottom-4 h-3.5 w-3.5 rounded-full border-2 border-white ${record.pi_id != 0 && record.status == 0 ? 'bg-meta-3' : record.status == 1 ? 'bg-primary' : record.status == 2 ? 'bg-meta-6': 'bg-meta-7'}`} />
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.pi_id}</p>
                  </td>
                  <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                    {element['devices'].camera == 1 ? (
                      <HiVideoCamera style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto' }} />
                    ) : (
                      <HiVideoCameraSlash style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto' }} />
                    )}
                  </td>
                  <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                    {element['devices'].mic == 1 ? (
                      <IoIosMic style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto' }} />
                    ) : (
                      <IoIosMicOff style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto' }} />
                    )}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.batch_id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.date}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.audio_size}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.video_size}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.duration}</p>
                  </td>

                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.id == 0 ? '' : record.status == 1 ? 'Merging' : record.status == 2 ? 'Uploading' : record.status == 0 ? 'Recording' : 'Completed'}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.merge_percentage}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                    </h5>
                    <p className="text-sm"> {record.upload_percentage}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">


                      {record.status == 0 ?
                        <button
                          type="button"
                          className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                          onClick={() => stopRecord(record.pi_id, record.batch_id)}
                        >
                          Stop
                        </button> : record.id == 0 ? <button
                          type="button"
                          className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                          onClick={() => startRecord(record.pi_id)}
                        >
                          Start
                        </button> : ''}

                    </h5>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Pi_Casting;
