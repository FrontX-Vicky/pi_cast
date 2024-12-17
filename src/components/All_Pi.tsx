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
    const viewRec = (file_data) => {
        handleOpenModal();
        let file_id = file_data;
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