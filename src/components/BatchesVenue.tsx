import { useContext, useEffect, useMemo, useState } from 'react'
import { post } from '../helpers/api_helper';
import { SearchContext } from './SearchContext';
import { useParams } from 'react-router-dom';
import CreateClassRoom from './modal/CreateClassRoom';
import ResponseError from './errorsShow/ResponseError';
import AssignTratom from './modal/AssignTratom';

type BatchItem = { [key: string]: any };

function BatchesVenue(props: any) {
    const venueDetails = props.venueDetails;
    const { id } = useParams();
    const [apiResponse, setApiResponse] = useState(null);
    const [batchClassRoom, setBatchClassRoom] = useState<BatchItem[]>([]);
    const [openClassModal, setOpenClassModal] = useState(false);
    const [openClassModaltr, setOpenClassModaltr] = useState(false);
    const [totalClsRoom, settotalClsRoom] = useState(false);
    const [pages, setPages] = useState<number>(1);
    const [pagesLength, setPagesLength] = useState<number>(15);
    const [searchResult, setSearchResult] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<{ batch: string; cr_id: string; pi_id: string }>({ 
        batch: '', 
        cr_id: '', 
        pi_id: '' 
    });

    useEffect(() => {
        getClassRooms();
    }, [openClassModal, openClassModaltr]);

    const context = useContext(SearchContext as any);
    const { inputValue, setSharedProcessedValue } = (context as any) || { inputValue: '', setSharedProcessedValue: () => {} };
    useEffect(() => {
        setSharedProcessedValue('');
    }, []);

    const getClassRooms = async () => {
        try {
            const response: any = await post(`rpi/get_classrooms_batches/${id}`, {});
            let list: any[] = [];
            if (Array.isArray(response)) list = response;
            else if (Array.isArray(response?.data)) list = response.data;
            else if (Array.isArray((response as any)?.[0])) list = (response as any)[0];
            else if (Array.isArray((response as any)?.['0'])) list = (response as any)['0'];
            setBatchClassRoom(list);
            settotalClsRoom(response.total_class_rooms);
        } catch (error) {
            setBatchClassRoom([]);
        }
    };

    const changePage = (pageIndex: number) => setPages(pageIndex);
    const changePageSize = (size: number) => { setPagesLength(size); setPages(1); };

    const { filtered, paginated, pageCount } = useMemo(() => {
        const q = (searchResult || inputValue || '').toLowerCase().trim();
        const applyCol = (item: BatchItem) => {
            const batchOk = columnFilters.batch.trim() ? String(item.batch ?? '').toLowerCase().includes(columnFilters.batch.trim().toLowerCase()) : true;
            const crOk = columnFilters.cr_id.trim() ? String(item.cr_id ?? '').toLowerCase().includes(columnFilters.cr_id.trim().toLowerCase()) : true;
            const piOk = columnFilters.pi_id.trim() ? String(item.rpi_pi_id ?? '').toLowerCase().includes(columnFilters.pi_id.trim().toLowerCase()) : true;
            return batchOk && crOk && piOk;
        };
        let filteredList = batchClassRoom.filter(applyCol);
        if (q) {
            filteredList = filteredList.filter((item) => Object.values(item).some((v) => String(v).toLowerCase().includes(q)));
        }
        const start = (pages - 1) * pagesLength;
        const end = pages * pagesLength;
        return {
            filtered: filteredList,
            paginated: filteredList.slice(start, end),
            pageCount: Math.max(1, Math.ceil(filteredList.length / pagesLength)),
        };
    }, [batchClassRoom, inputValue, searchResult, pages, pagesLength, columnFilters]);

    const setSelectedRoom = async (batch_id: any, classroom_id: any) => {
        const payload = {
            'batch_id': batch_id,
            'classroom_id': classroom_id
        }
        try {
            const resp = await post('rpi/update_classrooms_batches', payload); // Wait for the response
            setApiResponse(resp);
            setTimeout(() => {
                setApiResponse(null);
                getClassRooms();
            }, 3000)
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
            {apiResponse != null && apiResponse && (
                <div className="fixed bottom-0 right-0 z-50 mx-8">
                    <ResponseError
                        error={apiResponse['error']}
                        message={apiResponse['message']}
                    />
                </div>
            )}
            <div className="tr-card">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="batch-search" className="sr-only">Search batches</label>
                        <input
                            id="batch-search"
                            value={searchResult}
                            onChange={(e) => { setSearchResult(e.target.value); setPages(1); }}
                            placeholder="Search batches..."
                            className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                        />
                        <span className="text-sm text-gray-500">Page size</span>
                        <select
                            aria-label="Page size"
                            value={pagesLength}
                            onChange={(e) => changePageSize(parseInt(e.target.value, 10))}
                            className="px-2 py-1 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                        >
                            {[10, 15, 20, 50].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="px-3.5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm"
                            onClick={() => assignTratom()}
                        >
                            Assign TRATOM
                        </button>
                        <button
                            className="px-3.5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm"
                            onClick={() => createClassRoom()}
                        >
                            Create Class
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{venueDetails.venue}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Total: {filtered.length} batches. You can{' '}
                        <button
                            onClick={() => assignTratom()}
                            className="font-bold text-blue-600 hover:underline focus:outline-none"
                        >
                            Assign TRATOM
                        </button>
                        {' '}or{' '}
                        <button
                            onClick={() => createClassRoom()}
                            className="font-bold text-blue-600 hover:underline focus:outline-none"
                        >
                            Create &amp; Assign
                        </button>
                        .
                    </p>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <table className="tr-table" role="table" aria-label="Batches table">
                        <caption className="sr-only">List of Batches and Classrooms</caption>
                        <thead>
                            <tr>
                                <th scope="col" className="tr-th text-left">Batch</th>
                                <th scope="col" className="tr-th text-left">Class Room ID</th>
                                <th scope="col" className="tr-th text-left">PI ID</th>
                                <th scope="col" className="tr-th text-center">Assign ClassRooms</th>
                            </tr>
                            <tr className="bg-white dark:bg-slate-900">
                                <th className="tr-td">
                                    <input
                                        value={columnFilters.batch}
                                        onChange={(e) => { setColumnFilters((p) => ({ ...p, batch: e.target.value })); setPages(1); }}
                                        placeholder="Filter batch"
                                        className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                </th>
                                <th className="tr-td">
                                    <input
                                        value={columnFilters.cr_id}
                                        onChange={(e) => { setColumnFilters((p) => ({ ...p, cr_id: e.target.value })); setPages(1); }}
                                        placeholder="Filter room id"
                                        className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                </th>
                                <th className="tr-td">
                                    <input
                                        value={columnFilters.pi_id}
                                        onChange={(e) => { setColumnFilters((p) => ({ ...p, pi_id: e.target.value })); setPages(1); }}
                                        placeholder="Filter pi id"
                                        className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                </th>
                                <th className="tr-td"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-sm text-gray-500 bg-white dark:bg-slate-900">No batches found.</td>
                                </tr>
                            )}
                            {paginated.map((item: any, i: number) => (
                                <tr key={i} className="tr-row">
                                    <td className="tr-td font-medium text-slate-700 dark:text-slate-200">{item.batch}</td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">{item.cr_id}</td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">TRATOM - {item.rpi_pi_id}</td>
                                    <td className="tr-td">
                                        <div className="flex flex-wrap gap-6 justify-center">
                                            {item.classRooms_map &&
                                                Object.entries(item.classRooms_map).map(
                                                    (clsRoom: any, index: number) => (
                                                        <div key={index} className="flex gap-10">
                                                            <div className="inline-flex items-center">
                                                                <label className="relative flex items-center cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={`classroom-${item.batch}`}
                                                                        value={clsRoom[1]}
                                                                        onChange={() =>
                                                                            setSelectedRoom(
                                                                                item.batch_id,
                                                                                clsRoom[1],
                                                                            )
                                                                        }
                                                                        defaultChecked={
                                                                            clsRoom[1] === item.cr_id
                                                                        }
                                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                                                                    />
                                                                    <span className="absolute bg-slate-800 dark:bg-white w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                                                                </label>
                                                                <label className="ml-2 text-slate-600 dark:text-slate-400 cursor-pointer text-sm">
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

                    <div className="flex justify-between items-center gap-4">
                        <span className="mt-4 block text-right text-sm" aria-live="polite">
                            Showing {filtered.length === 0 ? 0 : (pages - 1) * pagesLength + 1} to {Math.min(pages * pagesLength, filtered.length)} of {filtered.length} results
                        </span>
                        <nav className="mt-4 flex justify-center" aria-label="Pagination">
                            <ul className="flex space-x-2 items-center">
                                {(() => {
                                    const windowSize = 5;
                                    let start = Math.max(1, pages - 2);
                                    let end = Math.min(pageCount, start + windowSize - 1);
                                    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
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
                                                    <li><button onClick={() => changePage(1)} className="px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm">1</button></li>
                                                    <li className="px-2 text-slate-500">...</li>
                                                </>
                                            )}
                                            {Array.from({ length: end - start + 1 }, (_, k) => start + k).map((n) => (
                                                <li key={n}>
                                                    <button
                                                        onClick={() => changePage(n)}
                                                        className={`px-3.5 py-2 border border-slate-200 rounded-md shadow-sm ${pages === n ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                                        aria-current={pages === n ? 'page' : undefined}
                                                    >
                                                        {n}
                                                    </button>
                                                </li>
                                            ))}
                                            {end < pageCount && (
                                                <>
                                                    <li className="px-2 text-slate-500">...</li>
                                                    <li><button onClick={() => changePage(pageCount)} className="px-3.5 py-2 border border-slate-200 rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm">{pageCount}</button></li>
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