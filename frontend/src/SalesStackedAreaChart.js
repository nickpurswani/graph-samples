import React from 'react';
import { StackedAreaChart, PolarisVizProvider } from "@shopify/polaris-viz";
import "@shopify/polaris-viz/build/esm/styles.css";

const SalesStackedAreaChart = ({ data }) => {

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
        <StackedAreaChart data={data} theme="Light"  />
      </div>
    </PolarisVizProvider>
  );
};

export default SalesStackedAreaChart;
