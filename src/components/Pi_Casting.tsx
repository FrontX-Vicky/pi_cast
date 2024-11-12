import axios from 'axios';
import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react';
import Loader from '../common/Loader';
const Pi_Casting = () => {
  var arrayOfRecording = [];
  var allRecording = [];
  const [availablePi, setavailablePi] = useState<string[]>([]);

  // const [availablePi, setavailablePi] = useState([]);
  const [datas, setDatas] = useState<{ [key: string]: any }[]>([]);
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
        // debugger;
        if (data.message && data.message.recordings && Object.keys(data.message.recordings).length > 0) {
          var pi_id = data.message.pi_id;
          arrayOfRecording = Object.entries(data.message.recordings);
          // console.log(arrayOfRecording);
          // debugger;
          // Correctly update state with a new array
          setRecordings((prevRecordings) => {
            const updatedRecordings = { ...prevRecordings };
            arrayOfRecording.forEach(([key, value]) => {
              updatedRecordings[value.pi_id] = value;
            });
            return updatedRecordings;
          });
        } else {
          var pi_id = data.message.pi_id;

          setavailablePi((prevAvailablePi) => {
            const updatedPiArray = [...prevAvailablePi, pi_id];

            // Use Set to remove duplicates and ensure the array contains only unique values
            const uniquePiArray = [...new Set(updatedPiArray)];

            return uniquePiArray;
          });
        }
        if (recordings && Object.keys(recordings).length > 0) {
          allRecording = [];
          Object.entries(recordings).forEach(([key, record]) => {
            const pi_id = record.pi_id;  // Extract pi_id
            const existing = allRecording.find(item => item[pi_id]);  // Check if pi_id already exists

            if (!existing) {
              // Add new entry with pi_id as key
              allRecording.push({ [pi_id]: [record] });
            } else {
              // Append to the existing record
              existing[pi_id].push(record);
            }
          });
        } else {
          // console.log("No recordings available");
        }
        // Clear previous `allRecording`
        var arrayOfValues = Object.values(recordings);
        requiredObject = [];
        var requiredObject = Object.keys(recordings).reduce((obj, key) => {
          obj[key] = recordings[key];
          return obj;
        }, {});

        setDatas(recordings);
        // console.log(recordings);
        // console.log("Full eventss data: "+recordings);
      }
    });
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
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Pi Id
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Batch Id
              </th>

              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Date
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Duration
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                FileName
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Video Size
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Recording
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Upload
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Upload Percentage
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Audio Size
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {availablePi && availablePi.length > 0 && availablePi.map((availPi, index) => (
              <tr>
                <td colSpan={5} className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['batch_id']} */}
                  </h5>
                  <p className="text-sm">{availPi}</p>
                </td>
                <td colSpan={5} className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-meta-3">Pi Is On But Recording Is Off</p>
                </td>
                <td colSpan={5} className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <button
                    type="button"
                    className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                    onClick={() => startRecord(availPi)}
                  >
                    start
                  </button>
                </td>
              </tr>
            ))}

            {/* {datas && datas.length > 0 && datas.map((element, index) => ( */}
            {datas && Object.keys(datas).length > 0 && Object.values(datas).map((element, index) => (
              <tr key={element.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['batch_id']} */}
                  </h5>
                  <p className="text-sm"> {element['pi_id']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['batch_id']} */}
                  </h5>
                  <p className="text-sm"> {element['batch_id']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['date']} */}
                  </h5>
                  <p className="text-sm"> {element['date']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['duration']} */}
                  </h5>
                  <p className="text-sm"> {element['duration']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['filename']} */}
                  </h5>
                  <p className="text-sm"> {element['filename']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['video_size']} */}
                  </h5>
                  <p className="text-sm"> {element['video_size']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['recording']} */}
                  </h5>
                  <p className="text-sm">  {element['recording'] === 0 ? 'No' : 'Yes'}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['upload']} */}
                  </h5>
                  <p className="text-sm"> {element['status'] == 1 ? 'Merging' : element['status'] == 2 ? 'Uploading' : element['status'] == 0 ? 'Recording' : 'Completed'}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['upload']} */}
                  </h5>
                  <p className="text-sm"> {element['upload']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['upload_percentage']} */}
                  </h5>
                  <p className="text-sm"> {element['upload_percentage']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['audio_size']} */}
                  </h5>
                  <p className="text-sm"> {element['audio_size']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {/* {element['status'] == 0 ?
                     <button className="text-sm bg-red-500 text-white">Test Button</button>
                     : ''} */}

                    {element['status'] == 0 ?
                      <button
                        type="button" 
                        className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                        onClick={() => stopRecord(element['pi_id'], element['batch_id'])}
                      >
                        Stop
                      </button> : ''}

                  </h5>
                  {/* <p className="text-sm"> {element['audio_size']}</p> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Pi_Casting;
