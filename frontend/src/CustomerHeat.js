import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import mapDataWorld from './mapDataWorld';
require('highcharts/modules/map')(Highcharts);
const CustomerHeat = ({data}) => {
  
  console.log(data)
  
  const mapOptions = {
    title: {
      text: ''
    },
    colorAxis: {
      min: 0,
      stops: [[0.4, '#ffff00'], [0.65, '#bfff00'], [1, '	#40ff00']]
    },
  
    series: [
      {
        mapData: mapDataWorld,
        name: 'world',
        data: data
      }
    ]
  };

  return (
    <div>
    <h1>Geographical Distribution of Customers:</h1>

    <HighchartsReact
      options={mapOptions}
      constructorType={'mapChart'}
      highcharts={Highcharts}
    />
  </div>
  );
};

export default CustomerHeat;
