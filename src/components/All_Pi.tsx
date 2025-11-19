import { useContext, useEffect, useMemo, useState } from 'react'
import GdriveModal from './GdriveModal';
import { SearchContext } from './SearchContext';
import { get } from "../helpers/api_helper";

type RecItem = { [key: string]: any };

function All_Pi() {
    const context = useContext(SearchContext as any);
    const { inputValue } = (context as any) || { inputValue: '' };
    if (!context) {
        throw new Error('getSearchValue must be used within a SearchProvider');
    }

    const [rows, setRows] = useState<RecItem[]>([]);
    const [pages, setPages] = useState<number>(1);
    const [pagesLength, setPagesLength] = useState<number>(15);
    const [searchResult, setSearchResult] = useState<string>('');
    const [driveUrl, setDriveUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
        const [columnFilters, setColumnFilters] = useState<{ batch_id: string; batch: string; date: string }>({
            batch_id: '',
            batch: '',
            date: '',
        });

    useEffect(() => {
        const fetchRecordingData = async () => {
            try {
                    const response: any = await get('rpi/allCamRecData', {});
                    // Accept multiple common backend shapes: array, {data:[]}, {0:[]}, etc.
                    let list: any[] = [];
                    if (Array.isArray(response)) {
                        list = response;
                    } else if (Array.isArray(response?.data)) {
                        list = response.data;
                    } else if (Array.isArray((response as any)?.[0])) {
                        list = (response as any)[0];
                    } else if (Array.isArray((response as any)?.['0'])) {
                        list = (response as any)['0'];
                    } else if (Array.isArray(response?.rows)) {
                        list = response.rows;
                    } else if (Array.isArray(response?.result)) {
                        list = response.result;
                    } else if (Array.isArray(response?.results)) {
                        list = response.results;
                    }
                    setRows(list);
            } catch (e) {
                setRows([]);
            }
        };
        fetchRecordingData();
    }, []);

    const changePage = (pageIndex: number) => setPages(pageIndex);
    const changePageSize = (size: number) => { setPagesLength(size); setPages(1); };

        const { filtered, paginated, pageCount, startIndex } = useMemo(() => {
            const q = (searchResult || inputValue || '').toLowerCase().trim();

            const applyCol = (item: RecItem) => {
                const idOk = columnFilters.batch_id.trim()
                    ? String(item.batch_id ?? '').toLowerCase().includes(columnFilters.batch_id.trim().toLowerCase())
                    : true;
                const batchOk = columnFilters.batch.trim()
                    ? String(item.batch ?? '').toLowerCase().includes(columnFilters.batch.trim().toLowerCase())
                    : true;
                const dateOk = columnFilters.date.trim()
                    ? String(item.date ?? '').toLowerCase().includes(columnFilters.date.trim().toLowerCase())
                    : true;
                return idOk && batchOk && dateOk;
            };

            let filteredList = rows.filter(applyCol);
            if (q) {
                filteredList = filteredList.filter((item) =>
                    Object.values(item).some((v) => String(v).toLowerCase().includes(q)),
                );
            }
        const start = (pages - 1) * pagesLength;
        const end = pages * pagesLength;
        const slice = filteredList.slice(start, end);
        const count = Math.max(1, Math.ceil(filteredList.length / pagesLength));
        return { filtered: filteredList, paginated: slice, pageCount: count, startIndex: start };
    }, [rows, inputValue, searchResult, pages, pagesLength]);

    return (
        <>
            <div className="tr-card">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="pi-search" className="sr-only">Search recordings</label>
                        <input
                            id="pi-search"
                            value={searchResult}
                            onChange={(e) => { setSearchResult(e.target.value); setPages(1); }}
                            placeholder="Search recordings..."
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
                    <div className="text-sm text-gray-600 dark:text-slate-300">Total: {filtered.length}</div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <table className="tr-table" role="table" aria-label="Recordings table">
                        <caption className="sr-only">List of recordings</caption>
                        <thead>
                            <tr>
                                <th scope="col" className="tr-th">#</th>
                                <th scope="col" className="tr-th text-left">Batch ID</th>
                                <th scope="col" className="tr-th text-left">Batch Name</th>
                                <th scope="col" className="tr-th text-left">Date</th>
                                <th scope="col" className="tr-th text-center">Actions</th>
                            </tr>
                                        <tr className="bg-white dark:bg-slate-900">
                                            <th className="tr-td"></th>
                                            <th className="tr-td">
                                                <input
                                                    value={columnFilters.batch_id}
                                                    onChange={(e) => { setColumnFilters((p) => ({ ...p, batch_id: e.target.value })); setPages(1); }}
                                                    placeholder="Filter id"
                                                    className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                                />
                                            </th>
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
                                                    value={columnFilters.date}
                                                    onChange={(e) => { setColumnFilters((p) => ({ ...p, date: e.target.value })); setPages(1); }}
                                                    placeholder="Filter date"
                                                    className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                                />
                                            </th>
                                            <th className="tr-td"></th>
                                        </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-sm text-gray-500 bg-white dark:bg-slate-900">No data found.</td>
                                </tr>
                            )}
                            {paginated.map((item, i) => (
                                <tr key={(item as any).id ?? `${i}-${item.batch_id}`} className="tr-row">
                                    <td className="tr-td font-medium text-slate-700 dark:text-slate-200">{startIndex + i + 1}</td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">{item.batch_id}</td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">{item.batch}</td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">{item.date}</td>
                                    <td className="tr-td">
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                className="px-3.5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm"
                                                onClick={() => { setShowModal(true); setDriveUrl(item.file_id || ''); }}
                                            >
                                                Preview
                                            </button>
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

                {driveUrl !== '' && (
                    <GdriveModal
                        showModal={showModal}
                        handleCloseModal={() => { setShowModal(false); setDriveUrl(''); }}
                        handleOpenModal={() => setShowModal(true)}
                        file_id={driveUrl}
                    />
                )}
            </div>
        </>
    );
}

export default All_Pi