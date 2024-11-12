import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
const Devices_raspberry_pi = () => {
    const navigate = useNavigate();
    const [raspberry_pi, raspberryData] = useState([]);
    async function fetchRaspberryId() {
        try {
            await axios.get('https://api.tickleright.in/api/respData').then(response => {
                if (response.status == 200) {
                    raspberryData(response.data);
                } else {
                    raspberryData([]);
                }
            });
        } catch (err) {
            raspberryData([]);
        }
    }
    useEffect(() => {
        fetchRaspberryId();
    }, []);

    const renderTable = (id) => {
        navigate(`/Pi-Details/${id}`);
    }
    // fetchRaspberryId();
    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-center dark:bg-meta-4">
                            <th className="min-w-[100px] py-4 font-medium text-black dark:text-white">
                                Status
                            </th>
                            <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                                ID
                            </th>
                            <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                                Name
                            </th>
                            <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                                venue_id
                            </th>
                            <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                                ip_address
                            </th>
                            <th className="min-w-[120px] py-4 font-medium text-black dark:text-white">
                                mac_address
                            </th>
                            <th className="py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-2 text-center dark:bg-meta-4">
                        {raspberry_pi.map((respId) => (
                            <tr key={respId.id}>
                                <td className="relative h-14 w-26 rounded-full flex items-center justify-center dark:text-white text-sm">
                                    <img src={rpi} alt="User" style={{ height: '48px', width: '40px' }} />
                                    <span className={`absolute right-2 bottom-3 h-3.5 w-3.5 rounded-full border-2 border-white ${respId['venue_id'] !== null ? 'bg-meta-3' : 'bg-meta-7'}`} />
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                    <p className="text-sm"> {respId['id']}</p>
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                    <p className="text-sm"> {respId['name']}</p>
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                    <p className="text-sm"> {respId['venue_id']}</p>
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                    <p className="text-sm"> {respId['ip_address']}</p>
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark">
                                    <p className="text-sm"> {respId['mac_address']}</p>
                                </td>
                                <td className="border-b border-[#eee] py-5 dark:border-strokedark flex justify-center">
                                    {respId['venue_id'] != null ? (
                                        <button
                                            type="button"
                                            style={{ display: 'inline-block', backgroundColor: '#007BFF', padding: '10px' }}
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            onClick={() => renderTable(respId['id'])}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 14 10"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                                />
                                            </svg>
                                            <span className="sr-only">Icon description</span>
                                        </button>
                                    ) : (
                                        ' '
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}

export default Devices_raspberry_pi;