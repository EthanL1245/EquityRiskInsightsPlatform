import React from 'react';
import { Tooltip } from 'react-tooltip';

interface MetricsTableProps {
    metrics: Record<string, number | string | boolean | null | object> | null;
    metricDescriptions?: Record<string, string>; // Optional descriptions for metrics
}

const MetricsTable = ({ metrics, metricDescriptions }: MetricsTableProps) => {
    if (!metrics) return null;

    return (
        <>
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
                            <td>
                                {key}
                                {metricDescriptions && metricDescriptions[key] && (
                                    <>
                                        <span
                                            data-tooltip-id={`tooltip-${key}`}
                                            data-tooltip-content={metricDescriptions[key]}
                                            style={{ marginLeft: '5px', cursor: 'pointer' }}
                                        >
                                            ℹ️
                                        </span>
                                        <Tooltip id={`tooltip-${key}`} />
                                    </>
                                )}
                            </td>
                            <td>{typeof value === 'object' && value !== null ? JSON.stringify(value) : value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default MetricsTable;
