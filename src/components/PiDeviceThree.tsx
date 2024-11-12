import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import axios from 'axios';
const TableThree = () => {
  const [datas, recordingData] = useState([]);
  const [styleLoader, hideLoader] = useState('none');
  const piId = useParams();
  useEffect(() => {
    var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
      cluster: 'mt1',
      wsHost: 'api.tickleright.in',
      wsPort: 443,
      wssPort: 443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
    // debugger;
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('pi_connect');
    // Log all events to the console
    channel.bind_global(function (eventName, data) {
      console.log('Full event data:', data);
      if (data.message.pi_id != '' && data.message.pi_id != null && data) {
        const filterData = data.message.pi_id == piId['id'] ? data.message : '';
        console.log(filterData);
        if (filterData && filterData.recordings) {
          hideLoader('none');
          recordingData(filterData.recordings);
        } else {
          // hideLoader('block');
          console.log('Recording data is missing or undefined');
        }
      } else {
        // hideLoader('block');
      }
    });
  }, []);
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
            {datas.map((element) => (

              <tr key={element.id}>
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
                        onClick={() => stopRecord(element['batch_id'])}
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

export default TableThree;
