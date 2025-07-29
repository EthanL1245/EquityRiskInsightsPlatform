import React, { useState } from 'react';
import PortfolioForm from '../components/PortfolioForm';
import MetricsTable from '../components/MetricsTable';
import Charts from '../components/Charts';
import axios from 'axios';

type AxiosError<T = unknown> = {
    isAxiosError: boolean;
    response?: {
        data: T;
    };
};

function isAxiosError<T = unknown>(error: unknown): error is AxiosError<T> {
    return typeof error === 'object' && error !== null && (error as AxiosError<T>).isAxiosError === true;
}

export default function Home() {
    const [metrics, setMetrics] = useState<{
        portfolio_returns: number;
        portfolio_volatility: number;
        sharpe_ratio: number;
        max_drawdown: number;
    } | null>(null); // Stores portfolio metrics
    const [chartData, setChartData] = useState<number[]>([]); // Stores chart data (e.g., portfolio returns)
    const [chartLabels, setChartLabels] = useState<string[]>([]); // Stores chart labels (e.g., dates)

    type AnalyzePortfolioResponse = {
        portfolio_returns: number;
        portfolio_volatility: number;
        sharpe_ratio: number;
        max_drawdown: number;
        portfolio_daily_returns: number[];
        dates?: string[];
    };

    const handleAnalyzePortfolio = async (portfolio: { ticker: string; weight: number }[]) => {
        try {
            // Call the FastAPI backend
            const response = await axios.post<AnalyzePortfolioResponse>('http://127.0.0.1:8001/analyze_portfolio', portfolio);

            // Update metrics and chart data
            setMetrics({
                portfolio_returns: response.data.portfolio_returns,
                portfolio_volatility: response.data.portfolio_volatility,
                sharpe_ratio: response.data.sharpe_ratio,
                max_drawdown: response.data.max_drawdown,
            });

            // Update chart data (e.g., daily returns)
            setChartData(response.data.portfolio_daily_returns || []);
            setChartLabels(response.data.dates || []);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                console.error('Validation Error:', (error.response.data as { detail?: string }).detail);
            } else {
                console.error('Error analyzing portfolio:', error);
            }
        }
    };

    return (
        <div>
            <h1>Equity Risk Insights Platform</h1>
            <p>Welcome to the dashboard!</p>

            {/* Portfolio Input Form */}
            <PortfolioForm onAnalyze={handleAnalyzePortfolio} />

            {/* Metrics Table */}
            {metrics && <MetricsTable metrics={metrics} />}

            {/* Charts */}
            {chartData.length > 0 && <Charts data={chartData} labels={chartLabels} />}
        </div>
    );
}