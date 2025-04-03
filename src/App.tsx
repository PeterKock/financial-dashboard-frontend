import { useEffect, useState } from 'react'
import './styles/App.css'

function App() {
    const [data, setData] = useState<{ symbol: string; price: string; time: string } | null>(null)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:4000')

        socket.onmessage = (event) => {
            const incoming = JSON.parse(event.data)
            setData(incoming)
        }

        socket.onerror = (error) => {
            console.error("WebSocket error:", error)
        }

        return () => {
            socket.close()
        }
    }, [])

    return (
        <div className="app-container">
            <h1 className="app-title">📡 Live Financial Data</h1>
            {data ? (
                <>
                    <p className="app-symbol">Symbol: {data.symbol}</p>
                    <p className="app-price">Price: ${data.price}</p>
                    <p className="app-time">Last updated: {new Date(data.time).toLocaleTimeString()}</p>
                </>
            ) : (
                <p className="app-loading">Waiting for live data...</p>
            )}
        </div>
    )
}

export default App
