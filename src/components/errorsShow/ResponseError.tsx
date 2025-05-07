import React, { useEffect, useState } from 'react'

function ResponseError({ error, message }: any) {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setVisible(false)
        }, 3000)
    })

    const color = error == 0 ? 'green' : error == 1 ? 'red' : error == 2 ? 'orange' : 'blue'
    console.log(color)
    const icon = error == 0 ? "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" : error == 1 ? "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" : error == 2 ? "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" : "M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z"
    return (
        <>
            {visible &&

                <div id="toast-success" className={`fixed top-13 right-7  w-full z-50 flex justify-end pointer-events-none mt-5 px-4 items-center max-w-xs p-4 mb-4 text-${color}-500 bg-${color}-100 rounded-lg shadow-sm dark:text-${color}-400 dark:bg-${color}-800 border-t-4 border-${color}-300`} role="alert">
                    <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 text-${color}-500 bg-${color}-100 rounded-lg dark:bg-${color}-800 dark:text-${color}-200`}>
                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                            <path d={`${icon}`} />
                        </svg>
                        <span className="sr-only">Check icon</span>
                    </div>
                    <div className={`ms-3 text-sm font-bold text-black`}>{message}</div>
                    <button type="button" className={`ms-auto -mx-1.5 -my-1.5 bg-${color}-100 text-${color}-400 hover:text-${color}-900 rounded-lg focus:ring-2 focus:ring-${color}-300 p-1.5 hover:bg-${color}-100 inline-flex items-center justify-center h-8 w-8 dark:text-${color}-500 dark:hover:text-white dark:bg-${color}-800 dark:hover:bg-${color}-700`} data-dismiss-target="#toast-success" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            }

        </>
    )
}

export default ResponseError