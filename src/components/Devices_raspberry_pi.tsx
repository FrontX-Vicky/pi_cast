import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rpi from '../images/logo/raspberry-pi-icon-transparent.png';
import { SearchContext } from './SearchContext';
import { del, get, post, put } from "../helpers/api_helper";
const Devices_raspberry_pi = () => {
    const navigate = useNavigate();
    const [raspberry_pi, raspberryData] = useState([]);
    const context = useContext(SearchContext);
    const { inputValue } = context;
    if (!context) {
        throw new Error('getSearchValue must be used within a SearchProvider');
    }
    const [openDropDown, setOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: number }>({});
    const [checkedAudio, setCheckedAudio] = useState<{ [key: string]: number }>({});
    const [pages, setpages] = useState(1);
    const [pagesLength, setpagesLength] = useState(10);
    const [searchResult, setSearchResult] = useState<string>("");
    async function fetchRaspberryId() {
        try {
            const response = await get("rpi/respData", {}); // Wa

            if (response.length > 0) {
                raspberryData(response);
                const initialCheckedState = {};
                const initialCheckedAudio = {};
                response.forEach((item) => {
                    initialCheckedState[item.id] = item.send_mail;
                    initialCheckedAudio[item.id] = item.list_song;
                });
                setCheckedItems(initialCheckedState);
                setCheckedAudio(initialCheckedAudio);
            } else {
                raspberryData([]);
            }

        } catch (err) {
            raspberryData([]);
        }
    }
    useEffect(() => {
        fetchRaspberryId();
    }, []);

    const pageSize = [10, 20, 50];
    const renderTable = (piId) => {
        navigate(`/Pi-Details/${piId}`);
    }


    const changePage = (pageIndex) => {
        setpages(pageIndex);
    };
    const changePageSize = (pageSize) => {
        setOpen(false);
        setpagesLength(pageSize);
    };

    const openDD = () => {
        setOpen(true);
    }

    const handleCheckboxChange = async (id: string) => {
        const mailValue = checkedItems[id] === 1 ? 0 : 1;
        setCheckedItems(prev => ({
            ...prev,
            [id]: mailValue
        }));
        var payload = {
            "id": id,
            "mail": mailValue
        };
        try {
            const response = await post("rpi/send_mail", payload, {});
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };
    const handleCheckboxChangeAudio = async (id: string) => {
        const audioValue = checkedAudio[id] === 1 ? 0 : 1;
        setCheckedAudio(prev => ({
            ...prev,
            [id]: audioValue
        }));
        var payload = {
            "id": id,
            "audio": audioValue
        };
        try {
            const response = await post("rpi/stop_audio", payload, {});
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };
    return (
      <>
        <div className="rounded-lg border-1 border-stroke dark:border-blueGray-700 ring-1 ring-gray-900/5 bg-white px-5 pt-6 pb-2.5 shadow-default dark:bg-slate-900  sm:px-7.5 xl:pb-1">
          <div className="relative flex justify-end pr-7 mb-4">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              className="focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  dark:hover:bg-slate-700 dark:focus:ring-slate-800  text-white dark:text-white hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 bg-slate-500 dark:bg-slate-800"
              type="button"
              onClick={() => {
                openDD();
              }}
            >
              Page Size : {pagesLength}
            </button>
          </div>
          <div className="flex justify-end">
            {openDropDown && (
              <div
                id="dropdown"
                className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-30 dark:bg-slate-900 "
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {pageSize.map((num) => (
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:bg-slate-300"
                        onClick={() => {
                          changePageSize(num);
                        }}
                      >
                        {num}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className=" max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-100 text-center dark:bg-slate-800">
                  {/* <th className="min-w-[100px] py-4 font-medium text-black dark:text-white">
                    Status
                  </th> */}
                  <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                    ID
                  </th>
                  <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                    Name
                  </th>
                  <th className="min-w-[150px] py-4 font-medium text-black dark:text-white">
                    Venue Name
                  </th>

                  <th className="min-w-[120px] py-4 font-medium text-black dark:text-white">
                    Send Mail
                  </th>
                  <th className="min-w-[120px] py-4 font-medium text-black dark:text-white">
                    Stop Songs
                  </th>
                  <th className="py-4 font-medium text-black dark:text-white">
                    Assign Class Rooms
                  </th>
                  <th className="py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-100 text-center dark:bg-slate-900 ">
                {raspberry_pi
                  .filter((item) =>
                    Object.values(item).some((value) =>
                      String(value)
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()),
                    ),
                  )
                  .slice((pages - 1) * pagesLength, pages * pagesLength)
                  .map((respId) => (
                    <tr
                      key={respId['id']}
                      className="border-b border-slate-200 dark:border-blueGray-700 bg-white dark:bg-slate-900  text-black dark:text-gray"
                    >
                      {/* <td className="py-1">
                        <div className="flex justify-center">
                          <img src={rpi} alt="User" className="h-9 w-8" />
                        </div>
                      </td> */}
                      <td className="py-2 text-sm">{respId['id']}</td>
                      <td className="py-2 text-sm">{respId['name']}</td>
                      <td className="py-2 text-sm">{respId['venue']}</td>
                      <td className="py-2 text-sm">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          value={respId['send_mail']}
                          checked={checkedItems[respId['id']] === 1}
                          onChange={() => handleCheckboxChange(respId['id'])}
                        />
                      </td>
                      <td className="py-2 text-sm">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          value={respId['send_mail']}
                          checked={checkedAudio[respId['id']] === 1}
                          onChange={() =>
                            handleCheckboxChangeAudio(respId['id'])
                          }
                        />
                      </td>
                      <td className="text-center">
                        <button className="px-4 py-2 rounded-lg text-black dark:text-white hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 bg-slate-500 dark:bg-slate-800">
                          <Link
                            to={`../Pis/Batches-Venue/${respId['venue_id']}`}
                            state={{
                              venue: respId['venue'],
                            }}
                            className="text-sm text-white hover:underline "
                          >
                            Assign
                          </Link>
                        </button>
                      </td>
                      <td className="py-2 flex justify-center">
                        {(respId['venue_id'] ||
                          parseInt(respId['venue_id']) !== 0) &&
                          respId['venue'] != null && (
                            <button
                              type="button"
                              className="p-2.5 bg-slate-500 dark:bg-slate-800 text-white rounded-full hover:bg-slate-700 focus:ring-4 focus:ring-slate-300"
                              onClick={() => renderTable(respId['id'])}
                            >
                              <svg
                                className="w-4 h-4"
                                aria-hidden="true"
                                fill="none"
                                viewBox="0 0 14 10"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                              </svg>
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-between">
              <span className="mt-4 block text-right text-sm">
                Showing {(pages - 1) * pagesLength + 1} to{' '}
                {Math.min(pages * pagesLength, raspberry_pi.length)} of{' '}
                {raspberry_pi.length} results
              </span>

              <nav className="mt-4 flex justify-center">
                <ul className="flex space-x-1">
                  {/* Previous Button */}
                  <li>
                    <button
                      className={`px-4 py-2 border rounded-l-lg text-gray-500 hover:bg-gray-100 ${
                        pages === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={pages === 1}
                      onClick={() => changePage(pages - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {/* First Page Button */}
                  {pages > 3 && (
                    <li>
                      <button
                        onClick={() => changePage(1)}
                        className="px-4 py-2 border text-gray-500 hover:bg-gray-100"
                      >
                        1
                      </button>
                    </li>
                  )}
                  {pages > 3 && <li className="px-2 text-gray-500">...</li>}

                  {/* Page Numbers */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const pageNumber = pages - 2 + i;
                    if (
                      pageNumber > 0 &&
                      pageNumber <= Math.ceil(raspberry_pi.length / pagesLength)
                    ) {
                      return (
                        <li key={pageNumber}>
                          <button
                            onClick={() => changePage(pageNumber)}
                            className={`px-4 py-2 border text-gray-500 rounded-full hover:bg-gray-100 ${
                              pages === pageNumber
                                ? 'bg-slate-500 text-white'
                                : 'bg-white'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    }
                    return null;
                  })}

                  {/* Last Page Button */}
                  {pages < Math.ceil(raspberry_pi.length / pagesLength) - 2 && (
                    <>
                      <li className="px-2 text-gray-500">...</li>
                      <li>
                        <button
                          onClick={() =>
                            changePage(
                              Math.ceil(raspberry_pi.length / pagesLength),
                            )
                          }
                          className="px-4 py-2 border text-gray-500 hover:bg-gray-100"
                        >
                          {Math.ceil(raspberry_pi.length / pagesLength)}
                        </button>
                      </li>
                    </>
                  )}

                  {/* Next Button */}
                  <li>
                    <button
                      className={`px-4 py-2 border rounded-r-lg text-gray-500 hover:bg-gray-100 ${
                        pages >= Math.ceil(raspberry_pi.length / pagesLength)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={
                        pages >= Math.ceil(raspberry_pi.length / pagesLength)
                      }
                      onClick={() => changePage(pages + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </>
    );
}

export default Devices_raspberry_pi;