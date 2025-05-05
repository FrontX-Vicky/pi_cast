import React, { useEffect, useState } from 'react'
import ResponseError from '../errorsShow/ResponseError'
import { post } from '../../helpers/api_helper';
import { useParams } from 'react-router-dom';

function AssignTratom({ open, details, onClose }: any) {
    const [apiResponse, setApiResponse] = useState(null);
    const [UnasssignedPi, setUnasssignedPi] = useState([]);
    const [UnasssignedCls, setUnasssignedCls] = useState([]);
    const [selectedPi, setSelectedPi] = useState('');
    const [selectedCls, setSelectedCls] = useState('');
    const venue_id = useParams().id;

    async function fetchRaspberryId() {
        const payload = {
            "venue_id": venue_id
        }
        try {
            const response = await post("rpi/get_unassigned_details", payload);
            if (response.error == 0) {
                setUnasssignedPi(response.data.pi);
                setUnasssignedCls(response.data.classroom);
            } else {

                setUnasssignedCls([]);
            }
        } catch (err) {
            console.log(err)
            setUnasssignedCls([]);
        }
    }
    useEffect(() => {
        fetchRaspberryId();
    }, []);

    const handleAssign = async () => {
        const payload = {
            "tratom_id": selectedPi,
            "cls_id": selectedCls,
            "venue_id": venue_id
        }
        try {
            const res = await post("rpi/assign_tratom_cls", payload);
            if (res.error == 0) {
                setApiResponse(res);
                setTimeout(() => {
                    onClose();
                }, 1000)
            } else {
                setApiResponse(res);
            }
        } catch (err) {
            console.log(err)
            setUnasssignedCls([]);
        }
    }

    return (
        <>
            {apiResponse && (
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
                        <h3 className="text-xl font-semibold">Assign TRATOM to ClassRoom</h3> <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                            ×
                        </button></div>
                    <p></p>
                    <form>
                        <div className="grid gap-6 mb-6 md:grid-cols-1">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 bg-white dark:bg-black dark:text-white">Select TRATOM</label>
                                <select id="pis" value={selectedPi} onChange={(e) => setSelectedPi(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 bg-white dark:bg-black  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value="" disabled>
                                        Choose a TRATOM
                                    </option>
                                    {UnasssignedPi.length > 0 && UnasssignedPi.map((item) => (
                                        <option key={item['id']} value={item['id']}>TRATOM - {item['id']}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 bg-white dark:bg-black dark:text-white">Select Class Room</label>
                                <select id="tr_id" value={selectedCls} onChange={(e) => setSelectedCls(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 bg-white dark:bg-black  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value="" disabled>
                                        Choose a class room
                                    </option>
                                    {UnasssignedCls.length > 0 && UnasssignedCls.map((item) => (
                                        <option key={item['id']} value={item['id']}>{item['id']}</option>
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
                        <button className="px-4 py-2 bg-slate-500 ring-1 ring-gray-900/5 text-white rounded hover:bg-gray-700" onClick={() => handleAssign()}>
                            Assign
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AssignTratom