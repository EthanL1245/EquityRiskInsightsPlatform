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
    const [metrics, setMetrics] = useState<{
        average_return: number;
        volatility: number;
        prediction: string;
    } | null>(null); // Stores stock metrics
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
            setMetrics({
                average_return: response.average_return,
                volatility: response.volatility,
                prediction: response.prediction,
            });

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
            {metrics && <MetricsTable metrics={metrics} />}

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
