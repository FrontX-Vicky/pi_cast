import axios from 'axios';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import GdriveModal from './GdriveModal';
import PreviewIcon from '@mui/icons-material/Preview';
import { MaterialReactTable, useMaterialReactTable, } from 'material-react-table';
import { Box, createTheme, ThemeProvider, IconButton } from '@mui/material';
import useColorMode from '../hooks/useColorMode';
import { SearchContext } from './SearchContext';
// import classNames from 'classnames';

function All_Pi() {
    const [Filter, SetFilter] = ('');
    const context = useContext(SearchContext);
    const { inputValue } = context;
    if (!context) {
        throw new Error('getSearchValue must be used within a SearchProvider');
    }
    // useEffect(() => {
    //     console.log('Search Input Value:', context.inputValue);
    //     SetFilter(context.inputValue)
    // }, []);

    const [openDropDown, setOpen] = useState(false);

    const [camData, setCamData] = useState([]);
    const [colorMode, setColorMode] = useColorMode();
    const [driveUrl, setDriveUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [theme, setTheme] = useState('light');
    const [pages, setpages] = useState(1);
    const [pagesLength, setpagesLength] = useState(5);
    const [searchResult, setSearchResult] = useState<string>("");

    async function fetchRecordingData() {
        try {
            await axios.get('https://api.tickleright.in/api/allCamRecData').then(response => {
                if (response.status == 200) {
                    setCamData(response.data[0]);
                } else {
                    setCamData([]);
                }
            });
        } catch (err) {
            setCamData([]);
        }
    }
    useEffect(() => {
        fetchRecordingData();
    }, []);
    const pageSize = [10, 20, 50];
    const viewRec = (file_data) => {
        handleOpenModal();
        let file_id = file_data;
        // let file_id = file_data['original']['file_id'];
        setDriveUrl(file_id);
    }

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setDriveUrl('');
    };

    const columns = useMemo(
        () => [
            {
                header: "Sr.No",
                Header: <b style={{ color: "green" }}>SR.no</b> //optional custom markup
            },
            {
                accessorKey: "batch_id", //simple recommended way to define a column
                header: "Batch Id",
                Header: <b style={{ color: "green" }}>Batch Id</b> //optional custom markup
            },
            {
                accessorKey: "batch", //simple recommended way to define a column
                header: "Batch Name",
                Header: <b style={{ color: "green" }}>Batch Name</b> //optional custom markup
            },
            {
                accessorFn: (row) => row.date, //alternate way
                id: "date", //id required if you use accessorFn instead of accessorKey
                header: "Date",
                Header: <b style={{ color: "blue" }}>Date</b> //optional custom markup
            }
        ],
        []
    );

    // console.log(colorMode);
    const table = useMaterialReactTable({
        columns,
        data: camData,
        enableFullScreenToggle: false,
        enableDensityToggle: false,
        enableColumnActions: false,
        enableHiding: false,
        positionGlobalFilter: 'right',
        positionPagination: 'bottom',
        positionActionsColumn: 'last',
        columnFilterDisplayMode: 'popover',
        enableRowActions: true,
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton color="warning" onClick={() => viewRec(row)}>
                    <PreviewIcon />
                </IconButton>
            </Box>
        ),
        initialState: {
            showColumnFilters: true,
            density: 'compact',
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true,
        },
        muiPaginationProps: {
            color: 'primary',
            shape: 'rounded',
            showRowsPerPage: true,
            variant: 'outlined',
        },
        paginationDisplayMode: 'pages',


        muiTableBodyCellProps: ({ table }) => {
            const localMode = localStorage.getItem('color-theme');
            const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark', cleanedMode === 'dark');
            }

            return {
                className: "rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1",
            };
        },
        muiTableHeadCellProps: ({ table }) => {
            const localMode = localStorage.getItem('color-theme');
            const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

            const isDarkMode = cleanedMode === 'dark';

            return {
                style: {
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#d1d5db' : '#374151',
                },
            };
        },

        muiTableFooterCellProps: ({ table }) => {
            const localMode = localStorage.getItem('color-theme');
            const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

            const isDarkMode = cleanedMode === 'dark';

            return {
                style: {
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#d1d5db' : '#374151',
                },
            };
        },

    });

    const changePage = (pageIndex) => {
        setpages(pageIndex);
        // console.log('Updated page:', pageIndex);
    };
    const changePageSize = (pageSize) => {
        setOpen(false);
        setpagesLength(pageSize);
        // console.log('Updated page:', pageIndex);
    };

    const openDD = () => {
        setOpen(true);
    }
    return (
        <>
            {/* <MaterialReactTable table={table} columns={columns} data={camData} />
            {driveUrl != '' && (<GdriveModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                handleOpenModal={handleOpenModal}
                file_id={driveUrl}
            />)} */}
            <div className='flex justify-end pr-7'>
                <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className="text-white bg-slate-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" onClick={() => { openDD() }}>{pagesLength}
                </button></div><div className='flex justify-end'>
                {openDropDown && <div id="dropdown" className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-30 dark:bg-gray-700">
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                        {pageSize.map((num) => (
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => { changePageSize(num) }}>{num}</a>
                            </li>
                        ))}

                    </ul>
                </div>}
            </div>
            <div className="p-6">
                <table className="table-auto border-collapse border border-transparent w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-100 px-4 py-2">Sr.no</th>
                            <th className="border border-gray-100 px-4 py-2">Batch</th>
                            <th className="border border-gray-100 px-4 py-2">Batch ID</th>
                            <th className="border border-gray-100 px-4 py-2">Date</th>
                            <th className="border border-gray-100 px-4 py-2">File ID</th>
                            <th className="border border-gray-100 px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {camData
                            .filter((item) =>
                                Object.values(item).some((value) =>
                                    String(value).toLowerCase().includes(inputValue.toLowerCase())
                                )
                            )
                            .slice(
                                (pages - 1) * pagesLength, // Start index
                                Math.min(pages * pagesLength, camData.length) // End index within bounds
                            )
                            .map((item, index) => (
                                <tr key={index} className="">
                                    <td className="border border-gray-100 px-4 py-2">{(pages - 1) * pagesLength + index + 1}</td>
                                    <td className="border border-gray-100 px-4 py-2">{item.batch}</td>
                                    <td className="border border-gray-100 px-4 py-2">{item.batch_id}</td>
                                    <td className="border border-gray-100 px-4 py-2">{item.date}</td>
                                    <td className="border border-gray-100 px-4 py-2">{item.file_id}</td>
                                    <td className="border border-gray-100 px-4 py-2">
                                        <button onClick={() => viewRec(item.file_id)}><button type="button" className="text-white bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-slate-300 dark:focus:ring-slate-800 shadow-lg shadow-slate-500/50 dark:shadow-lg dark:shadow-slate-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ">View</button></button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>

                </table>
                {driveUrl != '' && (<GdriveModal
                    showModal={showModal}
                    handleCloseModal={handleCloseModal}
                    handleOpenModal={handleOpenModal}
                    file_id={driveUrl}
                />)}
                <span className='mt-4 text-right '>Showing {pages} to {pages * pagesLength} of {camData.length} results</span>
                <nav className="mt-4">
                    <ul className="flex items-center-space-x-px h-10 text-base justify-center ">
                        <li className='bg-white dark:bg-boxdark '>
                            <a href="#" className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 dark:bg-boxdark border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" ${pages > 1 ? '' : 'cursor-not-allowed'
                                }`} onClick={(e) => {
                                    if (pages > 1) {
                                        changePage(pages - 1);
                                    } else {
                                        e.preventDefault();
                                    }
                                }}>

                                <span className="sr-only">Previous</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                                </svg>
                            </a>
                        </li>
                        {camData?.length > 0 &&
                            [...Array(Math.ceil(camData.length / pagesLength) || 0)].map((_, i) => {
                                return (
                                    <li key={i}>
                                        <a
                                            href="#"
                                            className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500  dark:bg-boxdark border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${pages == i + 1 ? "bg-slate-500 text-white dark:bg-slate-500 dark:text-black" : ""
                                                }`}
                                            onClick={() => changePage(i + 1)}
                                        >
                                            {i + 1}
                                        </a>
                                    </li>
                                );
                            })
                        }

                        <li>
                            <a
                                href="#"
                                className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white dark:bg-boxdark border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${pages < camData.length / pagesLength ? '' : 'cursor-not-allowed'
                                    }`}
                                onClick={(e) => {
                                    if (pages < camData.length / pagesLength) {
                                        changePage(pages + 1);
                                    } else {
                                        e.preventDefault(); // Prevent the default action when disabled
                                    }
                                }}
                            >
                                <span className="sr-only">Next</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>

            </div>

        </>
    )
}
export default All_Pi