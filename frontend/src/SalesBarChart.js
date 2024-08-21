import React from 'react';
import { BarChart, PolarisVizProvider } from "@shopify/polaris-viz";
import "@shopify/polaris-viz/build/esm/styles.css";

const SalesBarChart = ({ data }) => {
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
            
          height: 400
        }}
      >
        <BarChart data={data} theme="Light" />
      </div>
    </PolarisVizProvider>
  );
};

export default SalesBarChart;
