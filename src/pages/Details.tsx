import Breadcrumb from '../components/Breadcrumb';
import TableThree from '../components/PiDeviceThree';

const Details = () => {
  return (
    <>
      {/* <Breadcrumb pageName="Tables" /> */}

      <div className="flex flex-col gap-10">
        {/* <TableOne />
        <TableTwo /> */}
        <TableThree />
      </div>
    </>
  );
};

export default Details;

