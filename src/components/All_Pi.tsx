import axios from 'axios';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import GdriveModal from './GdriveModal';
import PreviewIcon from '@mui/icons-material/Preview';
import { MaterialReactTable, useMaterialReactTable, } from 'material-react-table';
import { Box, createTheme, ThemeProvider, IconButton } from '@mui/material';
import useColorMode from '../hooks/useColorMode';
import { SearchContext } from './SearchContext';

import { del, get, post, put } from "../helpers/api_helper";
// import classNames from 'classnames';

function All_Pi() {
    const [Filter, SetFilter] = ('');
    const context = useContext(SearchContext);
    const { inputValue } = context;
    if (!context) {
        throw new Error('getSearchValue must be used within a SearchProvider');
    }


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
            // await axios.get('https://api.tickleright.in/api/allCamRecData').then(response => {
                const response = await get("rpi/allCamRecData", {});
              
                if (response.error == 0) {
                    setCamData(response[0]);
                } else {
                    setCamData([]);
                }
            // });
        } catch (err) {
            setCamData([]);
        }
    }
    useEffect(() => {
        fetchRecordingData();
    }, []);
    const viewRec = (file_data) => {
        handleOpenModal();
        // let file_id = file_data;
        let file_id = file_data['original']['file_id'];
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
            
            // {
            //     accessorKey: sr_no+1,
            //     header: "Sr.No",
            //     Header: <b style={{ color: "green" }}>SR.no</b> //optional custom markup
            // },
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
    const table = useMaterialReactTable({
        columns,
        data: camData,
        enableFullScreenToggle: false,
        enableDensityToggle: false,
        enableColumnActions: false,
        enableRowNumbers : true,
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
            pagination: { pageSize: 15, pageIndex: 0 },
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
                className: "border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:text-white dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1",
            };
        },
        muiTableHeadCellProps: ({ table }) => {
            const localMode = localStorage.getItem('color-theme');
            const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

            const isDarkMode = cleanedMode === 'dark';

            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark', cleanedMode === 'dark');
            }
            return {
                className: "dark:text-white dark:border-strokedark dark:bg-boxdark"
            };
        },

        muiTableFooterCellProps: ({ table }) => {
            const localMode = localStorage.getItem('color-theme');
            const cleanedMode = localMode?.replace(/^"|"$/g, "") || 'light';

            const isDarkMode = cleanedMode === 'dark';

            return {
                className: "dark:text-white dark:border-strokedark dark:bg-boxdark"
            };
        }

    });

    return (
        <>
            <MaterialReactTable table={table} columns={columns} data={camData} />
            {driveUrl != '' && (<GdriveModal
                showModal={showModal}
                handleCloseModal={handleCloseModal}
                handleOpenModal={handleOpenModal}
                file_id={driveUrl}
            />)}



        </>
    )
}
export default All_Pi