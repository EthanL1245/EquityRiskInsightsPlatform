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

type AnalyzePortfolioResponse = {
    portfolio_returns: number;
    portfolio_volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
    portfolio_daily_returns: number[];
    dates?: string[];
};

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8001', // Base URL for FastAPI backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzePortfolio = async (portfolio: { ticker: string; weight: number }[]) => {
    try {
        const response = await apiClient.post<AnalyzePortfolioResponse>('/analyze_portfolio', portfolio);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error('Validation Error:', (error.response.data as { detail?: string }).detail);
        } else {
            console.error('Error analyzing portfolio:', error);
        }
        throw error;
    }
};

export default apiClient;
