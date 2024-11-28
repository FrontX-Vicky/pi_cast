import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

interface ChartFourState {
  series: number[]; // Array of values for the circular chart
}

const StorageUsageChart: React.FC = () => {
  const [state, setState] = useState<ChartFourState>({
    series: [55, 30, 15], // Example data: percentages for Used, Free, and Other
  });

  const options: ApexOptions = {
    chart: {
      type: "donut", // Change type to "donut" for a circular chart
      height: 350,
    },
    labels: ["Used RAM", "Free RAM", "Other"], // Add meaningful labels
    colors: ["#3C50E0", "#00E396", "#FF4560"], // Customize colors for segments
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      position: "top",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`, // Add percentage suffix
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h3 className="text-xl font-semibold text-black dark:text-white">
          RAM Usage Analytics
        </h3>
      </div>

      <div className="mb-2">
        <div id="chartFour" className="-ml-5">
          <ReactApexChart
            options={options}
            series={state.series}
            type="donut" // Circular chart type
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default StorageUsageChart;
