function GdriveModal(props) {
  return (
    <div className="p-4">
      {props.showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        // onClick={props.handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-3xl rounded shadow-lg overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={props.handleCloseModal}
              className="absolute top-2 right-2 h-15 w-16 bg-white text-gray-600 hover:text-black z-[70]"
            >
              ✕
            </button>
            <div className="relative w-full h-0" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://drive.google.com/file/d/${props.file_id}/preview`}
                width="100%"
                height="100%"
                allow="autoplay"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default GdriveModal