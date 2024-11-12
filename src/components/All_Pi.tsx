import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import axios from 'axios';

export default function All_Pi() {

    const [activePis, addPis] = useState([]);
    let CopyAddPis = {};
    let CopyAddPisRec = {};
    const [styleLoader, hideLoader] = useState('block');
    const [activePisRec, addPisRec] = useState([]);

    const piId = useParams();
    useEffect(() => {
        var pusher = new Pusher('i0fxppvqjbvvfcrxzwhz', {
            cluster: 'mt1',
            wsHost: 'api.tickleright.in',
            wsPort: 443,
            wssPort: 443,
            enabledTransports: ['ws', 'wss'],
            forceTLS: true,
            // userAuthentication: {
            //     headers: { "X-CSRF-Token": "2|XlEmArwPPGBCLQwhftxfFSoNkSUJ0pVHwc5iAw7Re4b5e1da" },
            // },
        });
        var channel = pusher.subscribe('pi_connect');
        channel.bind_global(function (eventName, data) {
            if (data.message) {
                console.log(CopyAddPis);
                // if (CopyAddPis.length <= 0) {
                if (data.message.recordings.length > 0) {
                    if (CopyAddPisRec.length > 0) {
                        CopyAddPisRec[data.message.pi_id] = data.message.recordings;
                    } else {
                        CopyAddPisRec[data.message.pi_id] = data.message.recordings;
                    }
                    addPisRec(Object.values(CopyAddPisRec));
                    console.log(CopyAddPisRec);
                } else {
                    if (Object.keys(CopyAddPis).length === 0) {
                        CopyAddPis[data.message.pi_id] = data.message;
                    } else {
                        // if (Array.isArray(CopyAddPis[data.message.pi_id])) {
                        if (CopyAddPis[data.message.pi_id]) {
                            CopyAddPis[data.message.pi_id] = data.message;
                        } else {
                            CopyAddPis[data.message.pi_id] = data.message;
                        }
                    }

                    addPis(Object.values(CopyAddPis));
                }

                if (Object.keys(CopyAddPis).length < 3) {
                    // debugger;
                    console.log("CopyAddPis has less than 3 items.");
                } else {
                    console.log("CopyAddPis has 3 or more items.");
                }
                // console.log(activePis);

            } else {
                console.log("no active PIs");
            }
        });
    }, []);


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
                    const updatedPis = activePis.filter((item) => item.pi_id !== pi_id);
                    
                    // Update the state with the filtered array
                    addPis(updatedPis);
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
                    const updatedPisRec = activePisRec.map((pis) => {
                        // Filter out items in each sub-array (`pis`) that match the pi_id
                        return pis.filter((data) => data.pi_id !== pi_id);
                    });
                    
                    // Update the state with the modified array
                    addPisRec(updatedPisRec);
                } else {
                    console.log('Something went wrong is Api response');
                }
            } catch (err) {
                console.log('Error Occured while making an API request');
            }

        });
    };

    const clearRecords = (pi_id) => {
        var payload = {
            "type": "clear_recordings",
            "id": pi_id
        }
        axios.post('https://api.tickleright.in/api/rpi/actions', payload).then((response) => {
            try {
                if (response) {

                    const updatedPisRec = activePisRec
                    .map((pis) => {
                        // Filter out items in each sub-array (`pis`) that match the pi_id
                        return pis.filter((data) => data.pi_id !== pi_id);
                    })
                    // Filter out any sub-arrays that are now empty
                    .filter((pis) => pis.length > 0);
                
                // Update the state with the modified array
                addPisRec(updatedPisRec);
                    console.log('Successfully Clear');
                } else {
                    console.log('Something went wrong is Api response');
                }
            } catch (err) {
                console.log('Error Occurred while making an API request');
            }

        });
    }
    return (
        <>
            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div style={{ display: styleLoader }}>
                    {/* <Loader /> */}
                </div>
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-center dark:bg-meta-4">
                                <th className="min-w-[150px] py-4 px-2 font-medium text-black dark:text-white">
                                    Status
                                </th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                    Pi Id
                                </th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                    Status
                                </th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                    Camera
                                </th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                    Mic
                                </th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePis.map((element) => (
                                <tr key={element.pi_id}>
                                    <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                        <div className="relative h-14 w-38 rounded-full flex items-center justify-center dark:text-white text-sm">
                                            <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                                            <span className={`absolute right-25 bottom-2 h-3.5 w-3.5 rounded-full border-2 border-white ${element['devices']['camera'] == 1 && element['devices']['mic'] == 1 ? 'bg-meta-3' : 'bg-meta-7'}`} />
                                        </div>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                        <h5 className="font-medium text-black dark:text-white">
                                        </h5>
                                        <p className="text-sm text-center"> {element['pi_id']}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                        <h5 className="font-medium text-black dark:text-white">

                                            <p className="text-sm text-center">recording is off</p>
                                        </h5>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                        <h5 className="font-medium text-black dark:text-white">
                                            <p className="text-sm text-center"> {element['devices']['camera'] == 0 ? 'Off' : 'On'}</p>
                                        </h5>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                        <h5 className="font-medium text-black dark:text-white">
                                            <p className="text-sm text-center"> {element['devices']['mic'] == 0 ? 'Off' : 'On'}</p>

                                        </h5>
                                    </td>
                                    <td colSpan={5} className="border-b border-[#eee] text-center py-5 px-4 dark:border-strokedark">
                                        <button
                                            type="button"
                                            className="text-sm bg-secondary border-s-meta-1 rounded-xl text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                                            onClick={() => startRecord(element['pi_id'])}
                                        >
                                            start
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="w-full bg-success">
                                <td colSpan={6}></td>
                            </tr>

                        </tbody>
                    </table>
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
                            {activePisRec.map((element) => (
                                element.map((data) => (
                                    <tr key={data['pi_id']}>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                            </h5>
                                            <p className="text-sm"> {data['pi_id']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                            </h5>
                                            <p className="text-sm"> {data['batch_id']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['date']} */}
                                            </h5>
                                            <p className="text-sm"> {data['date']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['duration']} */}
                                            </h5>
                                            <p className="text-sm"> {data['duration']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['filename']} */}
                                            </h5>
                                            <p className="text-sm"> {data['filename']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['video_size']} */}
                                            </h5>
                                            <p className="text-sm"> {data['video_size']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['recording']} */}
                                            </h5>
                                            <p className="text-sm">  {data['recording'] === 0 ? 'No' : 'Yes'}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['upload']} */}
                                            </h5>
                                            <p className="text-sm"> {data['status'] == 1 ? 'Merging' : data['status'] == 2 ? 'Uploading' : data['status'] == 0 ? 'Recording' : 'Completed'}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['upload']} */}
                                            </h5>
                                            <p className="text-sm"> {data['upload']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['upload_percentage']} */}
                                            </h5>
                                            <p className="text-sm"> {data['upload_percentage']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {/* {data['audio_size']} */}
                                            </h5>
                                            <p className="text-sm"> {data['audio_size']}</p>
                                        </td>
                                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                            <h5 className="font-medium text-black dark:text-white">
                                                {data['status'] == 0 ?
                                                    <button
                                                        type="button"
                                                        className="text-sm bg-danger font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                                                        onClick={() => stopRecord(data['pi_id'], data['batch_id'])}
                                                    >
                                                        Stop
                                                    </button> : ''}
                                                {data['audio_size'] == 0 ?
                                                    <button
                                                        type="button"
                                                        className="text-sm bg-warning font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                                                        onClick={() => clearRecords(data['pi_id'])}
                                                    >
                                                        Clear
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
        </>
    )
}
