import React, { useEffect, useState } from 'react';
import SalesLineChart from './SalesLineChart';
import SalesBarChart from './SalesBarChart';
import SalesStackedAreaChart from './SalesStackedAreaChart';
import CustomerHeat from './CustomerHeat';
import './App.css';
import CohortChart from './CohortChart';
const App = () => {
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [interval, setInterval] = useState('monthly'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesResponse, growthResponse, customerResponse, geoDataResponse, cohortDataResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/analytics/sales-over-time?interval=${interval}`),
          fetch(`http://localhost:5000/api/analytics/sales-growth-rate`),
          fetch(`http://localhost:5000/api/analytics/customer-data?interval=${interval}`),
          fetch(`http://localhost:5000/api/analytics/geographical-distribution`),
          fetch(`http://localhost:5000/api/analytics/customer-lifetime-value`)
        ]);

        const salesData = await salesResponse.json();
        const growthData = await growthResponse.json();
        const customerData = await customerResponse.json();
        const geoData= await geoDataResponse.json(); 
        const cohortData = await cohortDataResponse.json();
        // console.log("Sales Data:", salesData);
        // console.log("Growth Data:", growthData);
        // console.log("Customer Data:", customerData); 
        setData(salesData);
        setData1(growthData);
        setData2(customerData);
        setData3(geoData);
        setData4(cohortData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };
    fetchData();
  }, [interval]);

  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
  };
  
  return (
    <div className='App'>
      <h1>Sales Over Time</h1>
      <div className="interval-selector">
        <label htmlFor="interval">Select Interval:</label>
        <select id="interval" value={interval} onChange={handleIntervalChange}>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <SalesLineChart data={data} />

      <h1>Sales Growth</h1>
      <SalesBarChart data={data1} />

      <h1>Returning Customer Rate</h1>
      <SalesStackedAreaChart data={data2} />
      <CustomerHeat data={data3}></CustomerHeat>
      <CohortChart data={data4} />
    
    </div>
  );
};

export default App;
