import React, { useContext, useEffect, useState } from 'react'
import { get, post } from '../helpers/api_helper';
import { SearchContext } from './SearchContext';
import { Link, useParams } from 'react-router-dom';
import CreateClassRoom from './modal/CreateClassRoom';
import ResponseError from './errorsShow/ResponseError';
import AssignTratom from './modal/AssignTratom';

function BatchesVenue(props: any) {
    const venueDetails = props.venueDetails;
    const { id } = useParams();
    const [apiResponse, setApiResponse] = useState(null);
    const [BatchClassRoom, SetBatchClassRoom] = useState([]);
    const [openClassModal, setOpenClassModal] = useState(false);
    const [openClassModaltr, setOpenClassModaltr] = useState(false);
    const [totalClsRoom, settotalClsRoom] = useState(false);

    useEffect(() => {
        getClassRooms();
    }, [])
    const context = useContext(SearchContext);
    const { inputValue, setSharedProcessedValue }: any = context;
    useEffect(() => {
        setSharedProcessedValue('');   // safe place to clear it once
    }, []);

    const getClassRooms = async () => {
        try {
            const response = await post(`rpi/get_classrooms_batches/${id}`, {}); // Wait for the response
            SetBatchClassRoom(response.data);
            settotalClsRoom(response.total_class_rooms);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const setSelectedRoom = async (batch_id: any, classroom_id: any) => {
        const payload = {
            'batch_id': batch_id,
            'classroom_id': classroom_id
        }
        try {
            const resp = await post('rpi/update_classrooms_batches', payload); // Wait for the response
            setApiResponse(resp);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    }

    const createClassRoom = () => {
        setOpenClassModal(true)
    }

    const assignTratom = () => {
        setOpenClassModaltr(true)
    }

    return (
        <>
            {apiResponse && (
                <div className="fixed bottom-0 right-0 z-50 mx-8">
                    <ResponseError
                        error={apiResponse['error']}
                        message={apiResponse['message'] + 'kindly refersh'}
                    />
                </div>
            )}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg ring-1 ring-gray-900/5 bg-white dark:bg-slate-900">
                <button
                    className=" absolute top-2 right-2  bg-gray text-black dark:text-white dark:bg-slate-800 rounded-lg px-2 py-2"
                    onClick={() => createClassRoom()}
                >
                    Create Class
                </button>
                <button
                    className="absolute top-2 right-30 bg-gray text-black dark:text-white dark:bg-slate-800 rounded-lg px-2 py-2"
                    onClick={() => assignTratom()}
                >
                    Assign TRATOM
                </button>
                <div className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:bg-slate-900 text-black dark:text-white dark:bg-gray-800">
                    {venueDetails.venue}
                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        If you want to assign a classroom to TRATOM,{' '}
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                assignTratom();
                            }}
                            className="font-bold text-blue-600 hover:underline focus:outline-none"
                        >
                            Assign TRATOM
                        </a>
                        . If you want to create a new classroom and assign it,{' '}
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                createClassRoom();
                            }}
                            className="font-bold text-blue-600 hover:underline focus:outline-none"
                        >
                            Create &amp; Assign TRATOM
                        </a>
                        .
                    </p>

                </div>
                <div className="px-4">
                    <table className="w-full text-sm text-left rtl:text-right text-black dark:text-white ">

                        <thead className="text-sm text-slate-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Batch
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Class Room Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    PI ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-right">
                                    Assign ClassRooms
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {BatchClassRoom &&
                                BatchClassRoom.filter((item) =>
                                    Object.values(item).some((value) =>
                                        String(value)
                                            .toLowerCase()
                                            .includes(inputValue.toLowerCase()),
                                    ),
                                ).map((item, i) => (
                                    <tr
                                        key={i}
                                        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-blueGray-700 "
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-black dark:text-white">
                                            {item['batch']}
                                        </td>
                                        <td className="px-6 py-4">{item['cr_id']}</td>
                                        <td className="px-6 py-4">TRATOM - {item['rpi_pi_id']}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-wrap gap-6 justify-end">
                                                {item['classRooms_map'] &&
                                                    Object.entries(item['classRooms_map']).map(
                                                        (clsRoom, index) => (
                                                            <div key={index} className="flex gap-10">
                                                                <div className="inline-flex items-center">
                                                                    <label className="relative flex items-center cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`classroom-${item['batch']}`}
                                                                            value={clsRoom[1]}
                                                                            onChange={() =>
                                                                                setSelectedRoom(
                                                                                    item['batch_id'],
                                                                                    clsRoom[1],
                                                                                )
                                                                            }
                                                                            defaultChecked={
                                                                                clsRoom[1] === item['cr_id']
                                                                            }
                                                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                                                                            id="html"
                                                                        />
                                                                        <span className="absolute bg-slate-800 dark:bg-white w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                                                                    </label>
                                                                    <label className="ml-2 text-slate-600 cursor-pointer text-sm">
                                                                        {clsRoom[0]}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {openClassModal && (
                <CreateClassRoom
                    open={openClassModal}
                    details={{ class_rooms: totalClsRoom, venue_id: id, error: 0 }}
                    onClose={() => setOpenClassModal(false)}
                />
            )}

            {openClassModaltr && (
                <AssignTratom
                    open={openClassModaltr}
                    details={{ class_rooms: totalClsRoom, venue_id: id, error: 0 }}
                    onClose={() => setOpenClassModaltr(false)}
                />
            )}
        </>
    );
}

export default BatchesVenue