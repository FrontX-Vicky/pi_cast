const CardTwo = ( props : any) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      <svg fill="#586edf" width="30px" height="30px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" stroke="#586edf" strokeWidth="0.00024000000000000003"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,7a4,4,0,1,0,4,4A4,4,0,0,0,12,7Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,13Zm6.5,2v1.5H20a1,1,0,0,1,0,2H18.5V20a1,1,0,0,1-2,0V18.5H15a1,1,0,0,1,0-2h1.5V15a1,1,0,0,1,2,0Zm3.438-4.345a.987.987,0,0,1,0,.69,13.339,13.339,0,0,1-1.08,2.264,1,1,0,1,1-1.715-1.028A11.3,11.3,0,0,0,19.928,11C18.451,7.343,15.373,5,12,5S5.549,7.343,4.072,11a9.315,9.315,0,0,0,6.167,5.787,1,1,0,1,1-.478,1.942,11.393,11.393,0,0,1-7.7-7.383.99.99,0,0,1,0-.691C3.773,6,7.674,3,12,3S20.227,6,21.938,10.655Z"></path></g></svg>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          {props.count != '' && <h4 className="text-title-md font-bold text-black dark:text-white">
            {props.count.active_assign_tratom}
          </h4>}
          <span className="text-sm font-medium">Assigned Tratom</span>
        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
          4.35%
          <svg
            className="fill-meta-3"
            width="10"
            height="11"
            viewBox="0 0 10 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
              fill=""
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default CardTwo;
