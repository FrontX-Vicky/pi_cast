import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface StorageUsageChartProps {
  data: {
    free: number;
    total: number;
    used: number;
  };
  type: string;
}

const StorageUsageChart: React.FC<StorageUsageChartProps> = ({ data, type }) => {
  // Check for valid data.total to avoid division by zero
  const total = data.total || 1; // Default to 1 if total is 0 or undefined

  // Calculate percentages
  const usedPercentage = Math.round((data.used / total) * 100);
  const freePercentage = Math.round((data.free / total) * 100);

  // Log values for debugging
  // console.log(`Rendering ${type} chart`);
  // console.log("Data:", data);
  // console.log("Used Percentage:", usedPercentage);
  // console.log("Free Percentage:", freePercentage);

  // Compute the series directly
  const series = [usedPercentage, freePercentage];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 250,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    labels: [`Used ${type.toUpperCase()}`, `Free ${type.toUpperCase()}`],
    colors: ["#8ebae9", "#e4a774"],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(2)}%`,
        style: {
          colors: ['#02070d'], // Set the text color
          fontSize: '14px',    // Change the font size
          fontFamily: 'Arial, sans-serif', // Change the font family
          fontWeight: 'bold',  // Set the font weight
        },
        dropShadow: {
          enabled: false, // Disable the shadow effect on data labels
        },
      },
      
    legend: {
      show: true,
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div>
        <h3 className="text-xl font-semibold text-black dark:text-white text-center mb-4">
          {type} Usage Analytics
        </h3>
      </div>
      <div className="mb-2">
        <div id="chartFour" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

export default StorageUsageChart;
