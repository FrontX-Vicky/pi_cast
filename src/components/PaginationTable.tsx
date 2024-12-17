import React, { useState } from 'react'

function PaginationTable(props) {
  // const [pages, setpages] = useState(1);
  const [openDropDown, setOpen] = useState(false);
  const changePage = (pageIndex) => {
    props.setpages(pageIndex);
    // console.log('Updated page:', pageIndex);
  };

  const changePageSize = (pageSizes) => {
    setOpen(false);
    props.setpagesLength(pageSizes);
    // console.log('Updated page:', pageIndex);
  };

  const openDD = () => {
    setOpen(true);
  }

  return (
    <>{
      props.tData && props.tData.length > 0 ? (

        <div>
          <div className='flex justify-end pr-7'>
            <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className="text-white bg-slate-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" onClick={() => { openDD() }}>{props.pagesLength}
            </button></div><div className='flex justify-end'>
            {openDropDown && <div id="dropdown" className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-30 dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                {props.pageSize.map((num) => (
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => { changePageSize(num) }}>{num}</a>
                  </li>
                ))}

              </ul>
            </div>}
          </div>
          {/* Showing Results */}
          <span className="mt-4 text-right block">
            Showing {Math.min((props.pages - 1) * 10 + 1, props.tData.length)} to{" "}
            {Math.min(props.pages * 10, props.tData.length)} of {props.tData.length} results
          </span>

          {/* Pagination Controls */}
          <nav className="mt-4">
            <ul className="flex items-center space-x-1 justify-center">
              {/* Previous Button */}
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${props.pages > 1 ? "" : "cursor-not-allowed opacity-50"
                    }`}
                  onClick={(e) => {
                    if (props.pages > 1) {
                      changePage(props.pages - 1);
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-3 h-3 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 1 1 5l4 4"
                    />
                  </svg>
                </a>
              </li>

              {/* Page Numbers */}
              {Array.from({ length: Math.ceil(props.tData.length / 10) }, (_, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${props.pages === i + 1
                        ? "bg-slate-500 text-white dark:bg-slate-500"
                        : ""
                      }`}
                    onClick={() => changePage(i + 1)}
                  >
                    {i + 1}
                  </a>
                </li>
              ))}

              {/* Next Button */}
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${props.pages < Math.ceil(props.tData.length / 10) ? "" : "cursor-not-allowed opacity-50"
                    }`}
                  onClick={(e) => {
                    if (props.pages < Math.ceil(props.tData.length / 10)) {
                      changePage(props.pages + 1);
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-3 h-3 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        ""
      )
    }

      {/* <h1>no data found</h1> */}
    </>
  )
}

export default PaginationTable