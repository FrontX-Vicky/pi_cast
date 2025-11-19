import { useContext, useEffect, useMemo, useState } from 'react';
import { get } from '../helpers/api_helper';
import { SearchContext } from './SearchContext';
import { Link } from 'react-router-dom';

type ClassroomItem = { [key: string]: any };

function ClassRooms() {
    const [classRooms, setClassRooms] = useState<ClassroomItem[]>([]);
    const [pages, setPages] = useState<number>(1);
    const [pagesLength, setPagesLength] = useState<number>(15);
    const [searchResult, setSearchResult] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<{ pi_id: string; venue: string }>({ pi_id: '', venue: '' });

    useEffect(() => {
        getClassRooms();
    }, []);
    const context = useContext(SearchContext as any);
    const { inputValue, setSharedProcessedValue } = (context as any) || { inputValue: '', setSharedProcessedValue: () => { } };
    useEffect(() => { setSharedProcessedValue(''); }, []);
    const getClassRooms = async () => {
        try {
            const response: any = await get("rpi/get_classrooms", {});
            let list: any[] = [];
            if (Array.isArray(response)) list = response;
            else if (Array.isArray(response?.data)) list = response.data;
            else if (Array.isArray((response as any)?.[0])) list = (response as any)[0];
            else if (Array.isArray((response as any)?.['0'])) list = (response as any)['0'];
            setClassRooms(list);
        } catch (error) {
            setClassRooms([]);
        }
    };

    const changePage = (pageIndex: number) => setPages(pageIndex);
    const changePageSize = (size: number) => { setPagesLength(size); setPages(1); };

    const { filtered, paginated, pageCount } = useMemo(() => {
        const q = (searchResult || inputValue || '').toLowerCase().trim();
        const applyCol = (item: ClassroomItem) => {
            const idOk = columnFilters.pi_id.trim() ? String(item.pi_id ?? '').toLowerCase().includes(columnFilters.pi_id.trim().toLowerCase()) : true;
            const venueOk = columnFilters.venue.trim() ? String(item.classroom_venue_name ?? '').toLowerCase().includes(columnFilters.venue.trim().toLowerCase()) : true;
            return idOk && venueOk;
        };
        let filteredList = classRooms.filter(applyCol);
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
    }, [classRooms, inputValue, searchResult, pages, pagesLength, columnFilters]);

    const tratomPrefix = 'TARTOM - ';
    return (
        <>

            <div className="tr-card">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="classroom-search" className="sr-only">Search classrooms</label>
                        <input
                            id="classroom-search"
                            value={searchResult}
                            onChange={(e) => { setSearchResult(e.target.value); setPages(1); }}
                            placeholder="Search classrooms..."
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
                    <table className="tr-table" role="table" aria-label="Classrooms table">
                        <caption className="sr-only">List of Classrooms/Venues</caption>
                        <thead>
                            <tr>
                                <th scope="col" className="tr-th text-left">PI ID</th>
                                <th scope="col" className="tr-th text-left">Venue Name</th>
                                <th scope="col" className="tr-th text-center">Action</th>
                            </tr>
                            <tr className="bg-white dark:bg-slate-900">
                                <th className="tr-td">
                                    <input
                                        value={columnFilters.pi_id}
                                        onChange={(e) => { setColumnFilters((p) => ({ ...p, pi_id: e.target.value })); setPages(1); }}
                                        placeholder="Filter id"
                                        className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                </th>
                                <th className="tr-td">
                                    <input
                                        value={columnFilters.venue}
                                        onChange={(e) => { setColumnFilters((p) => ({ ...p, venue: e.target.value })); setPages(1); }}
                                        placeholder="Filter venue"
                                        className="w-full px-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                </th>
                                <th className="tr-td"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-6 text-sm text-gray-500 bg-white dark:bg-slate-900">No classrooms found.</td>
                                </tr>
                            )}
                            {paginated.map((item: any, i: number) => (
                                <tr key={item.venue_id ?? i} className="tr-row">
                                    <td className="tr-td font-medium text-slate-700 dark:text-slate-200">
                                        {item.pi_id ? `${tratomPrefix}${item.pi_id}` : item.pi_id}
                                    </td>
                                    <td className="tr-td text-slate-700 dark:text-slate-300">{item.classroom_venue_name}</td>
                                    <td className="tr-td">
                                        <div className="flex justify-center">
                                            <Link
                                                to={`../Pis/Batches-Venue/${item.venue_id}`}
                                                state={{ venue: item.classroom_venue_name }}
                                                className="inline-block"
                                            >
                                                <button className="px-3.5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm">
                                                    Action
                                                </button>
                                            </Link>
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

        </>
    )
}

export default ClassRooms