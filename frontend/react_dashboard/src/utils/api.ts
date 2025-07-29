import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8001', // Base URL for FastAPI backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzePortfolio = async (portfolio: { ticker: string; weight: number }[]) => {
    try {
        const response = await apiClient.post('/analyze_portfolio', portfolio);
        return response.data;
    } catch (error) {
        console.error('Error analyzing portfolio:', error);
        throw error;
    }
};

export default apiClient;
