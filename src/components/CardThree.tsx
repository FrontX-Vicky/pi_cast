const CardThree = (props: any) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      <svg viewBox="0 -2 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#586edf" stroke="#586edf"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>camera_minus [#586edf]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-258.000000, -3999.000000)" fill="#586edf"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M202,3857 L208,3857 L208,3855 L202,3855 L202,3857 Z M214,3854.5 C212.897,3854.5 212,3853.603 212,3852.5 C212,3851.397 212.897,3850.5 214,3850.5 C215.103,3850.5 216,3851.397 216,3852.5 C216,3853.603 215.103,3854.5 214,3854.5 L214,3854.5 Z M214,3848.5 C211.791,3848.5 210,3850.291 210,3852.5 C210,3854.709 211.791,3856.5 214,3856.5 C216.209,3856.5 218,3854.709 218,3852.5 C218,3850.291 216.209,3848.5 214,3848.5 L214,3848.5 Z M211,3843 L217,3843 L217,3841 L211,3841 L211,3843 Z M223,3843 L223,3841 L221,3841 L221,3843 L219,3843 L219,3839 L209,3839 L209,3843 L204,3843 L204,3851 L206,3851 L206,3845 L222,3845 L222,3855 L220,3855 L220,3857 L224,3857 L224,3843 L223,3843 Z" id="camera_minus-[#586edf]"> </path> </g> </g> </g> </g></svg>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          {props.count != '' && <h4 className="text-title-md font-bold text-black dark:text-white">
            {props.count.total_recordings}
          </h4>}
          <span className="text-sm font-medium">Total Recordings</span>
        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
          2.59%
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

export default CardThree;
