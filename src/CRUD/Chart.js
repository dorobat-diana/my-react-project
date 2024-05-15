import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import UserService,{socket} from '../Service/Service';
import styled from 'styled-components';

const ChartContainer = styled.div`
  position: relative;
  margin: auto;
  height: 80vh;
  width: 80vw;
`;

function Charts() {
  const [data, setData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const users = await UserService.getAllUsersForChart();
      setData(users);
    }
    socket.addEventListener('message', (event) => {
      const message = event.data;
      if (message === 'new user added') {
        // If message is 'new_user_added', fetch new data
        fetchData();
      }});

    return () => {
      socket.removeEventListener('message', null);
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('myChart');
    if (!ctx) {
      console.error("Could not find canvas element with id 'myChart'");
      return;
    }

    const ageGroups = {
      '< 18': 0,
      '18 - 50': 0,
      '> 50': 0
    };

    data.forEach((user) => {
      if (user._id < 18) {
        ageGroups['< 18']=ageGroups['< 18']+user.count;
      } else if (user._id >= 18 && user._id <= 50) {
        ageGroups['18 - 50']=ageGroups['18 - 50']+user.count;
      } else {
        ageGroups['> 50']=ageGroups['> 50']+user.count;
      }
    });

    const labels = Object.keys(ageGroups);
    const counts = Object.values(ageGroups);

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Users',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'User Age Groups'
          }
        }
      }
    });

    // Cleanup function to destroy the chart
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };

  }, [data]);

  return (
    <ChartContainer>
      <canvas id="myChart"></canvas>
    </ChartContainer>
  );
}

export default Charts;
