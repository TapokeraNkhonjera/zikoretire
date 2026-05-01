'use client';
import { useState } from 'react';

// Define what ZikoML returns
interface ZikoPrediction {
  predicted_income: number;
  currency: string;
  engine: string;
}

export default function DebugPage() {
  const [month, setMonth] = useState(1);
  const [result, setResult] = useState<ZikoPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/zikoml/predict-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month_number: month }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Connection to ZikoML failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8">
      <h1 className="mb-6 text-xl font-bold">ZikoML Testing Console</h1>
      
      <div className="max-w-md p-6 space-y-4 border shadow-sm rounded-xl">
        <div>
          <label className="block mb-2 text-sm">Month to Predict (1-12)</label>
          <input 
            type="number" 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full p-2 bg-transparent border rounded"
          />
        </div>

        <button 
          onClick={handleTest}
          disabled={isLoading}
          className="w-full p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Consulting ZikoML..." : "Get Prediction"}
        </button>

        {result && (
          <div className="p-4 mt-4 rounded-lg bg-slate-100 dark:bg-slate-800">
            <p className="text-sm text-gray-500">Engine: {result.engine}</p>
            <p className="font-mono text-2xl">
              {result.currency} {result.predicted_income.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
