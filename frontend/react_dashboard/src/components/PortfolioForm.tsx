import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface Stock {
    ticker: string;
    weight: number;
}

interface PortfolioFormProps {
    onAnalyze: (portfolio: Stock[]) => void;
}

const PortfolioForm = ({ onAnalyze }: PortfolioFormProps) => {
    const [portfolio, setPortfolio] = useState<Stock[]>([{ ticker: '', weight: 0 }]); // Initialize with one empty stock
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

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

    const handleInputChange = (index: number, field: keyof Stock, value: string | number) => {
        const updatedPortfolio = [...portfolio];
        const updatedStock = { ...updatedPortfolio[index] };
        if (field === 'ticker' && typeof value === 'string') {
            updatedStock.ticker = value;
        } else if (field === 'weight' && typeof value === 'number') {
            updatedStock.weight = value / 100; // Convert percentage to decimal
        }
        updatedPortfolio[index] = updatedStock;
        setPortfolio(updatedPortfolio);
    };

    const handleTickerChange = (index: number, selectedOption: { label: string; value: string } | null) => {
        if (selectedOption) {
            const updatedPortfolio = [...portfolio];
            updatedPortfolio[index].ticker = selectedOption.value;
            setPortfolio(updatedPortfolio);
        }
    };

    const getFilteredOptions = (index: number) => {
        const selectedTickers = portfolio.map((stock) => stock.ticker);
        return options.filter((option) => !selectedTickers.includes(option.value) || option.value === portfolio[index].ticker);
    };

    const addRow = () => {
        setPortfolio([...portfolio, { ticker: '', weight: 0 }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure weights sum to 1 (100%)
        const totalWeight = portfolio.reduce((sum, stock) => sum + stock.weight, 0);
        if (Math.abs(totalWeight - 1) > 0.01) { // Allow small floating-point error
            alert("The total weight must equal 100%.");
            return;
        }

        // Ensure all tickers are selected
        const unselectedTickers = portfolio.some((stock) => !stock.ticker);
        if (unselectedTickers) {
            alert("All stocks must have a selected ticker.");
            return;
        }

        onAnalyze(portfolio); // Pass the portfolio to the parent component
    };

    return (
        <form onSubmit={handleSubmit}>
            {portfolio.map((stock, index) => (
                <div key={index}>
                    <Select
                        options={getFilteredOptions(index)}
                        placeholder="Select a stock"
                        value={options.find((option) => option.value === stock.ticker)}
                        onChange={(selectedOption: { label: string; value: string } | null) => handleTickerChange(index, selectedOption)}
                    />
                    <input
                        type="number"
                        placeholder="Weight"
                        value={stock.weight * 100} // Convert decimal to percentage for display
                        onChange={(e) => handleInputChange(index, 'weight', parseFloat(e.target.value))}
                    />
                </div>
            ))}
            <button type="button" onClick={addRow}>Add Stock</button>
            <button type="submit">Analyze Portfolio</button>
        </form>
    );
};

export default PortfolioForm;
