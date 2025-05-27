import { useEffect, useState } from 'react';
import CardFour from '../../components/CardFour.tsx';
import CardOne from '../../components/CardOne.tsx';
import CardThree from '../../components/CardThree.tsx';
import CardTwo from '../../components/CardTwo.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import ChartThree from '../../components/ChartThree.tsx';
import ChartTwo from '../../components/ChartTwo.tsx';
import ChatCard from '../../components/ChatCard.tsx';
import MapOne from '../../components/MapOne.tsx';
import TableOne from '../../components/TableOne.tsx';
import { get } from '../../helpers/api_helper.tsx';
import Maps from '../../components/Maps.tsx';

const ECommerce = () => {
  const [home, setHome] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      let res: any = await get('home/dashboard', {});
      if (res['data'].error == 0) {
        let response = res['data'];
        setHome(response)
      }
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <>
      <div className="grid grid-flow-col grid-rows-3 gap-4 ">
        <div className="row-span-5 col-span-10">
          <Maps />
        </div>
        <div className="col-span-2 col-2 grid grid-cols-2 gap-5">
          <CardOne count={home} />
          <CardTwo count={home} />
          <CardThree count={home} />
          <CardFour />
        </div>
        <div className="col-span-2 row-span-2">
        <ChartThree />
         </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
        {/* <MapOne /> */}
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <ChatCard />
      </div>
    </>
  );
};

export default ECommerce;
