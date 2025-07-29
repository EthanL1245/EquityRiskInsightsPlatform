import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartsProps {
    data: number[];
    labels: string[];
    legendLabel: string;
}

const Charts = ({ data, labels, legendLabel }: ChartsProps) => {
    const chartData = {
        labels,
        datasets: [
            {
                label: legendLabel,
                data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    return <Line data={chartData} />;
};

export default Charts;
