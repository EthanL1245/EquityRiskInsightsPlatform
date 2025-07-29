import Link from 'next/dist/client/link';

export default function Home() {
    return <nav>
            <ul>
                <li><Link href="/PortfolioManager">Portfolio Manager</Link></li>
                <li><Link href="/StockAnalysis">Stock Analysis</Link></li>
            </ul>
        </nav>;
}