// components/DynamicChart.jsx
import React from 'react';
import {Card} from 'antd';
import {
  LineChart,BarChart,Line,Bar,XAxis,YAxis,CartesianGrid,
  Tooltip,ResponsiveContainer
} from 'recharts';
import {useQuery} from 'react-query';

const chartComponents={
  line:LineChart,
  bar:BarChart
};

const dataComponents={
  line:Line,
  bar:Bar
};

export const DynamicChart=({title,type,endpoint,dataKey})=>{
  const {data,isLoading}=useQuery(['chart',endpoint],
    ()=>fetch(endpoint).then(r=>r.json())
  );

  if(isLoading)return <Card loading={true}/>;

  const ChartComponent=chartComponents[type];
  const DataComponent=dataComponents[type];

  const chartData=Object.entries(data[dataKey]||{}).map(([name,value])=>({
    name,value
  }));

  return(
    <Card title={title}>
      <div style={{height:300}}>
        <ResponsiveContainer>
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <DataComponent dataKey="value" fill="#8884d8"/>
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
