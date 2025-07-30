import React, { useState } from 'react';
import Link from 'next/link';
import PortfolioForm from '../components/PortfolioForm';
import MetricsTable from '../components/MetricsTable';
import Charts from '../components/Charts';
import { analyzePortfolio } from '../utils/api';

export default function PortfolioManager() {
    const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null); // Stores portfolio metrics
    const [chartData, setChartData] = useState<number[]>([]); // Stores chart data (e.g., portfolio returns)
    const [chartLabels, setChartLabels] = useState<string[]>([]); // Stores chart labels (e.g., dates)
    const [cumulativeChartData, setCumulativeChartData] = useState<number[]>([]); // Stores cumulative returns data

    const handleAnalyzePortfolio = async (portfolio: { ticker: string; weight: number }[]) => {
        try {
            const response = await analyzePortfolio(portfolio);

            // Update metrics and chart data
            setMetrics({
                "Portfolio Returns": response.portfolio_returns,
                "Portfolio Volatility": response.portfolio_volatility,
                "Sharpe Ratio": response.sharpe_ratio,
                "Max Drawdown": response.max_drawdown,
            });

            // Update chart data (e.g., daily returns)
            setChartData(response.portfolio_daily_returns || []);
            setChartLabels(response.dates || []);

            // Calculate cumulative returns
            const cumulativeReturns = response.portfolio_daily_returns.reduce((acc: number[], curr: number, index: number) => {
                const lastValue = acc[index - 1] || 1; // Start with 1 (no gain/loss)
                acc.push(lastValue * (1 + curr));
                return acc;
            }, []);
            setCumulativeChartData(cumulativeReturns);
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
            {metrics && (
                <MetricsTable 
                    metrics={metrics} 
                    metricDescriptions={{
                        'Portfolio Returns': 'The average daily gain or loss of the portfolio. Higher values are better.',
                        'Portfolio Volatility': 'How much the portfolio value fluctuates. Lower values indicate more stability.',
                        'Sharpe Ratio': 'A measure of risk-adjusted returns. Values above 1 are considered good.',
                        'Max Drawdown': 'The largest drop in portfolio value from a peak. Smaller drawdowns are better.'
                    }}
                />
            )}

            {/* Charts */}
            {chartData.length > 0 && <Charts legendLabel="Portfolio Returns" data={chartData} labels={chartLabels} />}
            {cumulativeChartData.length > 0 && <Charts legendLabel="Cumulative Returns" data={cumulativeChartData} labels={chartLabels} />}

            {/* Back to Main Menu Button */}
            <div>
                <Link href="/">
                    <button>Back to Main Menu</button>
                </Link>
            </div>
        </div>
    );
}