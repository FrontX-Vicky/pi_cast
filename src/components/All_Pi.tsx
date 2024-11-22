import Pusher from 'pusher-js';
import React, { useEffect, useState, useRef, useReducer } from 'react'
import { useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import axios from 'axios';
import { HiVideoCamera } from "react-icons/hi2";
import { HiVideoCameraSlash } from "react-icons/hi2";
import { IoIosMic } from "react-icons/io";
import { IoIosMicOff } from "react-icons/io";
export default function All_Pi() {

    const [activePis, addPis] = useState([]);
    const [piTable, addPiTable] = useState([]);
    const timerRef = useRef(null);

    let prevTimeouts = {};

    let piTableArray = [];
    let piArrayTemp = [];
    let piArray = [];
    const [styleLoader, hideLoader] = useState('block');
    const [activePisRec, addPisRec] = useState([]);
    const [tableData, addTableData] = useState([]);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

    // const [timeouts, setTimeouts] = useState({}); // State to store timeout IDs
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
                processData(data.message);

            } else {
                console.log("no active PIs");
            }
        });
    }, []);

    // useEffect(() => {
    //     addTableData(piTableArray);
    // }, []);

    // useEffect(() => {
    //     if (piTableArrayTemp.length > 0) {
    //         addTableData(piTableArrayTemp);
    //     }
    // }, [piTableArrayTemp]);

    const createTimeout = (id, delay, callback) => {
        // Clear the existing timeout if it exists in the previous state
        var newTimeoutId = 0;
        console.log(prevTimeouts);
        if (prevTimeouts[id]) {
            clearTimeout(prevTimeouts[id]);
            console.log(`Timeout with ID ${id} reset.`);
        }

        // Create a new timeout and store it
        if (id != undefined) {
            newTimeoutId = setTimeout(() => {
                console.log(`Timeout with ID ${id} Removed.`);
                callback(id); // Trigger the callback when timeout ends
                prevTimeouts = removeTimeout(id); // Clean up the timeout
                processData({});
                console.log(prevTimeouts);
            }, delay);
        }

        prevTimeouts = {
            ...prevTimeouts,
            [id]: newTimeoutId, // Add or update the timeout ID
        };
    };

    // Function to remove a timeout by ID
    const removeTimeout = (id) => {
        const { [id]: removed, ...rest } = prevTimeouts; // Remove the specific timeout ID
        return rest;
    };

    // Function to create a timeout
    // const createTimeout = (id, delay, callback) => {
    //     // Clear existing timeout if it exists

    //     console.log(timeouts);
    //     if (timeouts[id]) {
    //         clearTimeout(timeouts[id]);
    //         console.log(`Timeout with ID ${id} removed.`);
    //     }

    //     // Create a new timeout and store it in state
    //     const newTimeoutId = setTimeout(() => {
    //         console.log(`Timeout with ID ${id} started.`);
    //         callback(id); // Pass the ID to the callback
    //         removeTimeout(id); // Clean up the timeout
    //     }, delay);

    //     setTimeouts((prevTimeouts) => ({
    //         ...prevTimeouts,
    //         [id]: newTimeoutId,
    //     }));
    // };

    // // Function to remove a timeout by ID
    // const removeTimeout = (id) => {
    //     setTimeouts((prevTimeouts) => {
    //     const { [id]: removed, ...rest } = prevTimeouts;
    //     return rest;
    //     });
    // };

    // Example function to reset a timeout

    const processData = (data) => {
        piArray = [];
        piTableArray = [];

        createTimeout(data.pi_id, 15000, (id) => {
            // piTableArray = piTableArray.filter(obj => obj.pi_id !== id);
            piArrayTemp = piArrayTemp.filter(obj => obj.pi_id !== id);
        });
        if (Object.keys(data).length !== 0) {
            piArrayTemp[data.pi_id] = data;
            piArrayTemp.map((pi, key) => {
                if (pi['recordings'].length > 0) {
                    let recTemp = [];
                    pi['recordings'].map((recording) => {
                        recording.camera = pi['devices'].camera;
                        recording.mic = pi['devices'].mic;
                        recTemp.push(recording);
                    });

                    piArray[key] = recTemp;
                }
                else {
                    let recTemp = [{
                        "id": 0,
                        "pi_id": pi['pi_id'],
                        "camera": pi['devices'].camera,
                        "mic": pi['devices'].mic,
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
                        "status": 0,
                        "sync": 0,
                        "created_at": "",
                        "modified_at": "",
                    }];

                    piArray[key] = recTemp;
                }
            });

            piArray.map((pi) => {
                pi.map(recording => {
                    piTableArray.push(recording);
                });
            })
        }


        // createTimeout(data.pi_id, 15000, (id) => {
        //     // piTableArray = piTableArray.filter(obj => obj.pi_id !== id);
        //     piArrayTemp = piArrayTemp.filter(obj => obj.pi_id !== id);
        // });
        // signalTimerReset(data.pi_id);


        // addTableData([]);
        addTableData(piTableArray);
        // forceUpdate();
    }


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
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Status
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Pi Id
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Camera
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Mic
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Batch Id
                                </th>

                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Date
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    FileName
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Video Size
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Audio Size
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Recording Status
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Merge %
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Upload %
                                </th>
                                <th className="min-w-[50px] py-4 px-1 font-medium text-black dark:text-white">
                                    Duration
                                </th>
                                <th className="py-4 px-1 font-medium text-black dark:text-white">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData && tableData.map((item, key) => (
                                <tr className="bg-gray-2 text-center dark:bg-meta-4" key={key}>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        <td className="relative h-14 w-26 rounded-full flex items-center justify-center dark:text-white text-sm">
                                            <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                                            <span className={`absolute right-2 bottom-3 h-3.5 w-3.5 rounded-full border-2 border-white ${item.status == 0 && item.id!= 0? 'bg-meta-3' : 'bg-meta-7'}`} />
                                        </td>
                                    </td>
                                    <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.pi_id}
                                    </td>
                                    <td className="text-sm text-center align-middle border-b border-[#eee] py-5 dark:border-strokedark">
                                        {/* {item.camera == 1 ? <HiVideoCamera /> : <HiVideoCameraSlash />} */}
                                        {item.camera == 1 ? (
                                            <HiVideoCamera style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto' }} />
                                        ) : (
                                            <HiVideoCameraSlash style={{ width: '20px', height: '24px', display: 'block', margin: '0 auto' }} />
                                        )}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {/* {item.mic} */}
                                        {item.mic == 1 ? (
                                            <IoIosMic style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto' }} />
                                        ) : (
                                            <IoIosMicOff style={{ width: '22px', height: '24px', display: 'block', margin: '0 auto' }} />
                                        )}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.batch_id}
                                    </td>

                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.date}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.filename}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.video_size}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.audio_size}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.status}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.merge_percentage}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.upload_percentage}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.duration}
                                    </td>
                                    <td className="text-sm text-center border-b border-[#eee] py-5 dark:border-strokedark">
                                        {item.id != 0 && item.status == 0 ?
                                            <button
                                                type="button"
                                                className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                                                onClick={() => stopRecord(item.pi_id, item.batch_id)}
                                            >
                                                Stop
                                            </button> : ''}
                                        {item.id == 0 ?
                                            <button
                                                type="button"
                                                className="text-sm bg-bodydark text-center dark:text-white font-medium rounded-lg px-5 py-2.5 text-center me-2 mb-2"
                                                onClick={() => startRecord(item.pi_id)}
                                            >
                                                Start
                                            </button> : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )

}
