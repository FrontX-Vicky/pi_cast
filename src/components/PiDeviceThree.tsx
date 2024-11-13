import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import axios from 'axios';
const TableThree = () => {
  const [datas, recordingData] = useState([]);
  const [allPiDatas, piData] = useState([]);
  const [startAction, recStartAction] = useState(false);
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
      authEndpoint: 'https://api.tickleright.in/api/broadcasting/auth',
      auth: {
        "headers": { "Authorization": 'Bearer 4|itKZrhvOFxpBMbP2wSJF8VvTTwMHh4BmtSo4hAMP137f2928' }
      }
    });
    // debugger;
    // Subscribe to a channel and log incoming events
    var channel = pusher.subscribe('private-app_connect.4');
    // Log all events to the console
    channel.bind_global(function (eventName = 'AppConnect', data) {
      console.log('Full event data:', data);
      if (data != undefined && data.message) {


        if (data && data.message.pi_id != '' && data.message.pi_id != null) {
          const filterData = data.message.pi_id == piId['id'] ? data.message : '';
          console.log(filterData);
          if (filterData && filterData.recordings) {
            hideLoader('none');
            recordingData(filterData.recordings);
            if (Array.isArray(filterData.recordings) && filterData.recordings.some((recStatus) => recStatus.status != 0)) {
              recStartAction(true);
              console.log('recStartAction set to true');
          } else {
              console.log('No recordings with status != 0');
          }
          } else {
            piData(filterData);
            // hideLoader('block');
            console.log('Recording data is missing or undefined');
          }
        } else {
          // hideLoader('block');
        }

      }
    });
  }, []);

  const startRecord = () => {
    var payload = {
      "type": "rec_start",
      "id": piId,
      "batch_id": '1234'
    }
    axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
      try {
        // Access the response data directly, no need for JSON.parse()
        const res = response.data;

        if (res && res['serial_no']) {

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
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Batch Id
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Date
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
                  </h5>
                  <p className="text-sm"> {element['date']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                  </h5>
                  <p className="text-sm"> {element['status'] == 1 ? 'Merging' : element['status'] == 2 ? 'Uploading' : element['status'] == 0 ? 'Recording' : 'Completed'}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                  </h5>
                  <p className="text-sm"> {element['upload']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                  </h5>
                  <p className="text-sm"> {element['upload_percentage']}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {element['status'] == 0 ?
                      <button
                        type="button"
                        className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                        onClick={() => stopRecord(element['batch_id'])}
                      >
                        Stop
                      </button> : ''}

                  </h5>
                </td>
              </tr>
            ))}
            {startAction && (
              <tr  className="w-full bg-gray">
                <td colSpan={5} className='text-center text-success'>
                  Start New Rec
                </td>
                <td>
                  <h5 className="font-medium text-black dark:text-white">

                    <button
                      type="button"
                      className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                      onClick={() => startRecord()}
                    >
                      Start
                    </button>

                  </h5>
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div >
  );
};

export default TableThree;
