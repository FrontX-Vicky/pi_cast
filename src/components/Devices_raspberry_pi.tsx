import { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchContext } from './SearchContext';
import { get, post } from "../helpers/api_helper";

type PiItem = { [key: string]: any };

const Devices_raspberry_pi = () => {
  const navigate = useNavigate();
  const [raspberry_pi, raspberryData] = useState<PiItem[]>([]);
  const context = useContext(SearchContext);
  const { inputValue } = (context as any) || { inputValue: '' };
  if (!context) {
    throw new Error('getSearchValue must be used within a SearchProvider');
  }
  // local UI state
  const [checkedItems, setCheckedItems] = useState<Record<string, number>>({});
  const [checkedAudio, setCheckedAudio] = useState<Record<string, number>>({});
  const [pages, setpages] = useState<number>(1);
  const [pagesLength, setpagesLength] = useState<number>(10);
  const [searchResult, setSearchResult] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<{ id: string; name: string; venue: string }>({ id: '', name: '', venue: '' });
  async function fetchRaspberryId() {
    try {
      const response = await get("rpi/respData", {});
      // response might be an array or response.data depending on helper - guard both
      const data: any[] = Array.isArray(response) ? response : (response?.data || []);

      if (data && data.length > 0) {
        raspberryData(data);
        const initialCheckedState: Record<string, number> = {};
        const initialCheckedAudio: Record<string, number> = {};
        data.forEach((item: any) => {
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
    const renderTable = (piId: number | string) => {
      navigate(`/Pi-Details/${piId}`);
    }


    const changePage = (pageIndex: number) => {
      setpages(pageIndex);
    };
    const changePageSize = (size: number) => {
      setpagesLength(size);
      setpages(1);
    };

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
      await post("rpi/send_mail", payload, {});
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
      await post("rpi/stop_audio", payload, {});
    } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

  // derived data: query, filtered list and paginated slice
    const { filtered, paginated, pageCount } = useMemo(() => {
      const q = (searchResult || inputValue || '').toLowerCase().trim();

      const applyCol = (item: Record<string, any>) => {
        const idOk = columnFilters.id.trim()
          ? String(item.id ?? '').toLowerCase().includes(columnFilters.id.trim().toLowerCase())
          : true;
        const nameOk = columnFilters.name.trim()
          ? String(item.name ?? '').toLowerCase().includes(columnFilters.name.trim().toLowerCase())
          : true;
        const venueOk = columnFilters.venue.trim()
          ? String(item.venue ?? '').toLowerCase().includes(columnFilters.venue.trim().toLowerCase())
          : true;
        return idOk && nameOk && venueOk;
      };

      let filteredList = raspberry_pi.filter(applyCol);
      if (q) {
        filteredList = filteredList.filter((item: Record<string, any>) =>
          Object.values(item).some((value) => String(value).toLowerCase().includes(q)),
        );
      }
    const start = (pages - 1) * pagesLength;
    const end = pages * pagesLength;
    const slice = filteredList.slice(start, end);
    const count = Math.max(1, Math.ceil(filteredList.length / pagesLength));
    return { filtered: filteredList, paginated: slice, pageCount: count };
    }, [raspberry_pi, inputValue, searchResult, pages, pagesLength, columnFilters]);
    return (
      <>
        <div className="tr-card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <label htmlFor="pi-search" className="sr-only">Search devices</label>
              <input
                id="pi-search"
                value={searchResult}
                onChange={(e) => { setSearchResult(e.target.value); setpages(1); }}
                placeholder="Search devices..."
                className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              />
              <span className="text-sm text-gray-500">Page size</span>
              <select
                aria-label="Page size"
                value={pagesLength}
                onChange={(e) => changePageSize(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                {pageSize.map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-slate-300">Total: {filtered.length}</div>
          </div>
          <div className=" max-w-full overflow-x-auto">
              <table className="tr-table" role="table" aria-label="Raspberry Pi devices">
                <caption className="sr-only">List of Raspberry Pi devices</caption>
              <thead>
                <tr>
                  <th scope="col" className="tr-th text-left">
                    ID
                  </th>
                  <th scope="col" className="tr-th text-left">
                    Name
                  </th>
                  <th scope="col" className="tr-th text-left">
                    Venue Name
                  </th>
                  <th scope="col" className="tr-th text-center">
                    Send Mail
                  </th>
                  <th scope="col" className="tr-th text-center">
                    Stop Songs
                  </th>
                  <th scope="col" className="tr-th text-center">
                    Assign Class Rooms
                  </th>
                  <th scope="col" className="tr-th text-center">
                    Actions
                  </th>
                </tr>
                <tr className="bg-white dark:bg-slate-900">
                  <th className="tr-td">
                    <input
                      value={columnFilters.id}
                      onChange={(e) => { setColumnFilters((p) => ({ ...p, id: e.target.value })); setpages(1); }}
                      placeholder="Filter id"
                      className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </th>
                  <th className="tr-td">
                    <input
                      value={columnFilters.name}
                      onChange={(e) => { setColumnFilters((p) => ({ ...p, name: e.target.value })); setpages(1); }}
                      placeholder="Filter name"
                      className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </th>
                  <th className="tr-td">
                    <input
                      value={columnFilters.venue}
                      onChange={(e) => { setColumnFilters((p) => ({ ...p, venue: e.target.value })); setpages(1); }}
                      placeholder="Filter venue"
                      className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </th>
                  <th className="tr-td"></th>
                  <th className="tr-td"></th>
                  <th className="tr-td"></th>
                  <th className="tr-td"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-sm text-gray-500 bg-white dark:bg-slate-900">
                      No devices found.
                    </td>
                  </tr>
                )}

                {paginated.map((respId) => (
                    <tr
                      key={respId['id']}
                      className={"tr-row"}
                    >
                      <td className="tr-td font-medium text-slate-700 dark:text-slate-200">{respId['id']}</td>
                      <td className="tr-td text-slate-700 dark:text-slate-300">{respId['name']}</td>
                      <td className="tr-td text-slate-700 dark:text-slate-300">{respId['venue']}</td>
                      <td className="tr-td text-center">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            aria-label={`Send mail for device ${respId['id']}`}
                            className="w-4 h-4 accent-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            value={respId['send_mail']}
                            checked={checkedItems[respId['id']] === 1}
                            onChange={() => handleCheckboxChange(respId['id'])}
                          />
                        </label>
                      </td>
                      <td className="tr-td text-center">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            aria-label={`Stop songs for device ${respId['id']}`}
                            className="w-4 h-4 accent-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            value={respId['send_mail']}
                            checked={checkedAudio[respId['id']] === 1}
                            onChange={() => handleCheckboxChangeAudio(respId['id'])}
                          />
                        </label>
                      </td>
                      <td className="tr-td text-center">
                        <Link
                          to={`../Pis/Batches-Venue/${respId['venue_id']}`}
                          state={{ venue: respId['venue'] }}
                          className="inline-block"
                        >
                          <button className="px-3.5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm">
                            Assign
                          </button>
                        </Link>
                      </td>
                      <td className="tr-td">
                        <div className="flex justify-center">
                        {(respId['venue_id'] ||
                          parseInt(respId['venue_id']) !== 0) &&
                          respId['venue'] != null && (
                            <button
                              type="button"
                              className="p-2.5 bg-white text-blue-600 rounded-full border border-slate-200 hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 dark:bg-slate-900 dark:border-slate-700 dark:text-blue-400"
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
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
              <div className="flex justify-between items-center gap-4">
                <span className="mt-4 block text-right text-sm" aria-live="polite">
                  Showing {filtered.length === 0 ? 0 : (pages - 1) * pagesLength + 1} to{' '}
                  {Math.min(pages * pagesLength, filtered.length)} of {filtered.length} results
                </span>

                <nav className="mt-4 flex justify-center" aria-label="Pagination">
                  <ul className="flex space-x-2 items-center">
            {(() => {
                      const windowSize = 5;
                      let start = Math.max(1, pages - 2);
                      let end = Math.min(pageCount, start + windowSize - 1);
                      if (end - start < windowSize - 1) {
                        start = Math.max(1, end - windowSize + 1);
                      }

                      return (
                        <>
                          <li>
                            <button
                              className={`px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm ${pages === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={pages === 1}
                              onClick={() => changePage(pages - 1)}
                            >
                              Previous
                            </button>
                          </li>

                          {start > 1 && (
                            <>
                              <li>
                                <button onClick={() => changePage(1)} className="px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm">1</button>
                              </li>
                              <li className="px-2 text-slate-500">...</li>
                            </>
                          )}

                          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((pageNumber) => (
                            <li key={pageNumber}>
                              <button
                                onClick={() => changePage(pageNumber)}
                                className={`px-3.5 py-2 border border-slate-200 rounded-md shadow-sm ${pages === pageNumber ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                aria-current={pages === pageNumber ? 'page' : undefined}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          ))}

                          {end < pageCount && (
                            <>
                              <li className="px-2 text-slate-500">...</li>
                              <li>
                                <button onClick={() => changePage(pageCount)} className="px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm">{pageCount}</button>
                              </li>
                            </>
                          )}

                          <li>
                            <button
                              className={`px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm ${pages >= pageCount ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={pages >= pageCount}
                              onClick={() => changePage(pages + 1)}
                            >
                              Next
                            </button>
                          </li>
                        </>
                      );
                    })()}
                  </ul>
                </nav>
              </div>
          </div>
        </div>
      </>
    );
}

export default Devices_raspberry_pi;