import React, { useContext, useEffect, useState } from 'react'
import { get } from '../helpers/api_helper';
import { SearchContext } from './SearchContext';
import { Link } from 'react-router-dom';

function ClassRooms() {
    const [ClassRoom, SetClassRoom] = useState([]);

    useEffect(() => {
        getClassRooms();
    }, [])
    const context = useContext(SearchContext);
    const { inputValue } = context;
    const getClassRooms = async () => {
        try {
            const response = await get("rpi/get_classrooms", {}); // Wait for the response
            SetClassRoom(response.data);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };
    var tratom = '  TARTOM - ';
    return (
        <>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:bg-black text-black dark:text-white dark:bg-gray-800">
                        All Actives Venues
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                PI ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Venue Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-right">
                            Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ClassRoom && ClassRoom.filter((item) =>
                            Object.values(item).some((value) =>
                                String(value)
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase()),
                            ),
                        ).map((item,i) => (
                            <tr key={i} className="bg-white dark:bg-black text-black dark:text-gray border-b dark:bg-gray-800 dark:border-warmGray-500 border-gray">
                              
                                <td className="px-6 py-4 font-normal">
                                {item.pi_id != null && tratom}
                                {item.pi_id}
                                </td>
                                <td className="px-6 py-4">
                                    {item.classroom_venue_name}
                                </td>
                                
                                <td className="px-6 py-4 text-right">
                                    <Link to={`../Pis/Batches-Venue/${item.venue_id}`} state={{venue: item['classroom_venue_name']}} className="font-medium bg-trueGray-400 rounded-lg px-2 py-2 text-white dark:text-gray hover:underline">Action</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </>
    )
}

export default ClassRooms