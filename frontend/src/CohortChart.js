import React from 'react';
import HeatMapGrid from 'react-heatmap-grid';

const CohortChart = ({ data }) => {
  const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yLabels = Object.keys(data);

  const values = yLabels.map(year => data[year]);

  return (
    <div style={{ padding:60, height:400 }}>
        <h1>Cohort Analysis </h1>
      <HeatMapGrid
        xLabels={xLabels}
        yLabels={yLabels}
        data={values}
        background={(value) => `rgba(0, 151, 230, ${value / 300000})`}
        cellRender={value => value && `${value}`}
        cellStyle={(background, value, min, max, data, x, y) => ({
          background: `rgba(0, 151, 230, ${value / 300000})`,
          color: '#000',
          fontSize: '10px',
        })}
        cellHeight='2rem'
        xLabelsStyle={(index) => ({
          color: '#777',
          fontSize: '0.8rem',
        })}
        yLabelsStyle={() => ({
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          color: '#777',
        })}
        square
      />
    </div>
  );
};

export default CohortChart;
