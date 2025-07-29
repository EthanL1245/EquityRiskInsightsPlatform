import React, { useState } from 'react';
import PortfolioForm from '../components/PortfolioForm';
import MetricsTable from '../components/MetricsTable';
import Charts from '../components/Charts';
import { analyzePortfolio } from '../utils/api';

export default function Home() {
    const [metrics, setMetrics] = useState<{
        portfolio_returns: number;
        portfolio_volatility: number;
        sharpe_ratio: number;
        max_drawdown: number;
    } | null>(null); // Stores portfolio metrics
    const [chartData, setChartData] = useState<number[]>([]); // Stores chart data (e.g., portfolio returns)
    const [chartLabels, setChartLabels] = useState<string[]>([]); // Stores chart labels (e.g., dates)

    const handleAnalyzePortfolio = async (portfolio: { ticker: string; weight: number }[]) => {
        try {
            const response = await analyzePortfolio(portfolio);

            // Update metrics and chart data
            setMetrics({
                portfolio_returns: response.portfolio_returns,
                portfolio_volatility: response.portfolio_volatility,
                sharpe_ratio: response.sharpe_ratio,
                max_drawdown: response.max_drawdown,
            });

            // Update chart data (e.g., daily returns)
            setChartData(response.portfolio_daily_returns || []);
            setChartLabels(response.dates || []);
        } catch (error) {
            console.error('Error analyzing portfolio:', error);
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