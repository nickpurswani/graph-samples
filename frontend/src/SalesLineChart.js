import React from 'react';
import { LineChart, PolarisVizProvider } from "@shopify/polaris-viz";
import "@shopify/polaris-viz/build/esm/styles.css";

const SalesLineChart = ({ data }) => {
  // Format function for x-axis labels
  
  return (
    <PolarisVizProvider
      themes={{
        Light: {
          legend: {
            backgroundColor: "white"
          }
        }
      }}
    >
      <div
        style={{
            
          height: 400,
          padding:60
        }}
      >
        <LineChart data={data} theme="Light" />
      </div>
    </PolarisVizProvider>
  );
};

export default SalesLineChart;
