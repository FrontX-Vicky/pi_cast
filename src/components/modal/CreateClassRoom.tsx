import React, { useEffect, useState } from 'react'
import { get, post } from '../../helpers/api_helper';
import { useParams } from 'react-router-dom';
import ResponseError from '../errorsShow/ResponseError';

function CreateClassRoom({ open, details, onClose }: any) {
    const id = useParams().id;
    const [UnasssignedPi, setUnasssignedPi] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedPi, setSelectedPi] = useState('');

    async function fetchRaspberryId() {
        try {
            const response = await get("rpi/get_unassigned_pi", {});
            if (response.error == 0) {
                setUnasssignedPi(response.data);
            } else {

                setUnasssignedPi([]);
            }
        } catch (err) {
            console.log(err)
            setUnasssignedPi([]);
        }
    }
    useEffect(() => {
        fetchRaspberryId();
    }, []);

    const handleAssignClassRoom = async () => {
        const payload = {
            pi_id: selectedPi,
            venue_id: details.venue_id,
            class_room_number: details.class_rooms + 1
        }
        try {
            const response = await post('rpi/assign_class_room', payload);
            if (response.error == 0) {
                setApiResponse(response);
                setTimeout(() => {
                    onClose();
                    setApiResponse(null);
                    fetchRaspberryId();
                }, 3000)
            } else {

                setApiResponse(response);
                setTimeout(() => {
                    setApiResponse(null);
                }, 4000)

            }
        } catch (err) {
            setUnasssignedPi([]);
        }
    }

    return (
        <>
            {apiResponse!=null && apiResponse && (
                <div className="fixed bottom-0 right-0 z-50">
                    <ResponseError
                        error={apiResponse['error']}
                        message={apiResponse['message']}
                    /></div>
            )}
            <div
                aria-hidden={!open}
                className={`fixed inset-0 z-50 flex items-center justify-center 
        bg-black bg-opacity-50 transition-opacity
        ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Modal box */}
                <div className="bg-white dark:bg-black ring-2 ring-gray-900/5 rounded-lg shadow-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Create a Classroom</h3> <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                            ×
                        </button></div>
                    <p>Your last classroom for this venue was {details.class_rooms}, and now it has moved to the new one, which is {details.class_rooms + 1}.</p>
                    <form>
                        <div className="grid gap-6 mb-6 md:grid-cols-1">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 bg-white dark:bg-black  dark:text-white">Number</label>
                                <input type="text" id="first_name" value={details.class_rooms + 1} className="bg-gray-50 border bg-white dark:bg-black  border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John" readOnly />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 bg-white dark:bg-black dark:text-white">Assign TRATOM to Class Room</label>
                                <select id="countries" value={selectedPi} onChange={(e) => setSelectedPi(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 bg-white dark:bg-black  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value="" disabled>
                                        Choose a class room
                                    </option>
                                    {UnasssignedPi.length > 0 && UnasssignedPi.map((item, index) => (
                                        <option key={item['id']} value={item['id']}>TRATOM - {item['id']}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>
                    <div className="mt-6 text-right">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mr-2"
                        >
                            Cancel
                        </button>
                        <button className="px-4 py-2 bg-slate-500 ring-1 ring-gray-900/5 text-white rounded hover:bg-gray-700" onClick={() => handleAssignClassRoom()}>
                            Assign
                        </button>
                    </div>
                </div>
            </div></>
    )
}

export default CreateClassRoom