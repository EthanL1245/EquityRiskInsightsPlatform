import React from 'react';

interface MetricsTableProps {
    metrics: Record<string, number | string | boolean | null> | null;
}

const MetricsTable = ({ metrics }: MetricsTableProps) => {
    if (!metrics) return null;

    return (
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(metrics).map(([key, value]) => (
                    <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MetricsTable;
