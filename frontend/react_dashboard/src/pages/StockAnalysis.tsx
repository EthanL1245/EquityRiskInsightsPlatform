import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Charts from '../components/Charts';
import MetricsTable from '../components/MetricsTable';
import { analyzeStock } from '../utils/api';
import Link from 'next/link';

export default function StockAnalysis() {
    const [ticker, setTicker] = useState(''); // Stores the stock ticker input
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]); // Stores stock options
    const [chartSelectedOptionLabel, setChartSelectedOption] = useState<string>(''); // Stores selected stock option label
    const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null); // Stores stock metrics
    const [chartData, setChartData] = useState<number[]>([]); // Stores historical price data
    const [chartLabels, setChartLabels] = useState<string[]>([]); // Stores dates for the chart

    useEffect(() => {
        // Fetch tickers from the FastAPI backend
        const fetchTickers = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8001/tickers'); // FastAPI endpoint
                const data = await response.json();
                const formattedData = data.map((item: { symbol: string; name: string }) => ({
                    label: `${item.name} (${item.symbol})`,
                    value: item.symbol,
                }));
                setOptions(formattedData);
            } catch (error) {
                console.error('Error fetching tickers:', error);
            }
        };
        fetchTickers();
    }, []);

    const handleAnalyzeStock = async () => {
        // Ensure ticker is selected
        if (!ticker) {
            alert("Please select a stock ticker before analyzing.");
            return;
        }

        try {
            const response = await analyzeStock(ticker);

            // Update metrics and chart data
            const extendedMetrics = {
                'Average Return': response.average_return,
                'Volatility': response.volatility,
                'Bollinger Band Upper': response.bollinger_bands.upper[response.bollinger_bands.upper.length - 1],
                'Bollinger Band Lower': response.bollinger_bands.lower[response.bollinger_bands.lower.length - 1],
                'Latest MACD': response.macd[response.macd.length - 1],
                'Signal Line': response.signal_line[response.signal_line.length - 1],
                'Beta': response.beta,
                'Value at Risk (VaR)': response.value_at_risk,
                'Conditional VaR': response.conditional_var,
                'Prediction': response.prediction,
            };

            setMetrics(extendedMetrics);

            setChartData(response.historical_prices || []);
            setChartLabels(response.dates || []);
            setChartSelectedOption(ticker ? `${ticker}` : '');
        } catch (error) {
            console.error('Error analyzing stock:', error);
        }
    };

    return (
        <div>
            <h1>Stock Analysis Tool</h1>
            <p>Analyze individual stocks for historical trends and predictions.</p>

            {/* Input Form */}
            <div>
                <Select
                    options={options}
                    placeholder="Select a stock"
                    value={options.find((option) => option.value === ticker)}
                    onChange={(selectedOption: { label: string; value: string } | null) => {
                        setTicker(selectedOption ? selectedOption.value : '');
                    }}
                />
                <button onClick={handleAnalyzeStock}>Analyze Stock</button>
            </div>

            {/* Metrics Table */}
            {metrics && (
                <MetricsTable
                    metrics={metrics}
                    metricDescriptions={{
                        'Average Return': 'The average daily return over the selected period. Positive means gains, negative means losses.',
                        'Volatility': 'The standard deviation of daily returns — higher values mean the price is more volatile.',
                        'Bollinger Band Upper': 'Upper bound of the expected price range based on volatility. Prices near this band may indicate overbought conditions.',
                        'Bollinger Band Lower': 'Lower bound of the expected price range based on volatility. Prices near this band may indicate oversold conditions.',
                        'Latest MACD': 'A momentum indicator that shows the difference between short-term and long-term trends. Positive suggests upward momentum, negative suggests downward.',
                        'Signal Line': 'A smoothed version of MACD used to confirm trends. A crossover above is bullish, below is bearish.',
                        'Beta': 'A measure of how much the stock moves relative to the market. Above 1 means more volatile than the market; below 1 means less volatile.',
                        'Value at Risk (VaR)': 'The worst expected daily loss with 95% confidence. Useful for understanding downside risk.',
                        'Conditional VaR': 'The average loss on the worst 5% of days — shows potential severity beyond normal risk levels.',
                        'Prediction': 'The model\'s forecast for the stock\'s movement tomorrow: up or down based on recent indicators.'
                    }}
                />
            )}

            {/* Charts */}
            {chartData.length > 0 && <Charts legendLabel={`${chartSelectedOptionLabel} Prices`} data={chartData} labels={chartLabels} />}

            {/* Back to Main Menu Button */}
            <div>
                <Link href="/">
                    <button>Back to Main Menu</button>
                </Link>
            </div>
        </div>
    );
}
