"use client"

import { useEffect, useState } from "react"
import HistoryHeader from "./HistoryHeader"
import HistoryStats from "./HistoryStats"
import HistoryTable from "./HistoryTable"
import ExportInfoCard from "./HistoryExportCard"
import { usePriorityUpdates } from "@/hooks/usePriorityUpdates"

import {
  HistorySimulation
} from "./types"

export default function HistoryClient({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  const { lastPriorityChange } = usePriorityUpdates()

  // Listen for priority changes and update local state
  useEffect(() => {
    if (lastPriorityChange) {
      console.log("HistoryClient: Priority changed, updating UI:", lastPriorityChange)
      // Could trigger a re-render or state update here if needed
      window.location.reload() // Simple refresh for now
    }
  }, [lastPriorityChange])

  function handlePDF() {
    // Generate PDF content
    const pdfContent = generatePDFContent(simulations);
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zikoretire-history-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleCSV() {
    // Generate CSV content
    const csvContent = generateCSVContent(simulations);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zikoretire-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function generatePDFContent(data: HistorySimulation[]) {
    // Simple PDF content generation
    let content = 'ZikoRetire Simulation History\n\n';
    content += 'Generated on: ' + new Date().toLocaleDateString() + '\n\n';
    
    data.forEach((sim, index) => {
      content += `Simulation ${index + 1}\n`;
      content += `Date: ${new Date(sim.createdAt).toLocaleDateString()}\n`;
      content += `Monthly Income: MWK ${sim.monthlyIncome.toLocaleString()}\n`;
      content += `Income Type: ${sim.incomeType}\n`;
      content += `Projected Value: MWK ${sim.result?.projectedValue?.toLocaleString() || 'N/A'}\n`;
      content += `RSI Score: ${sim.result?.rsiScore || 'N/A'}\n`;
      content += `Readiness Level: ${sim.result?.readinessLevel || 'N/A'}\n`;
      content += '----------------------------------------\n\n';
    });
    
    return content;
  }

  function generateCSVContent(data: HistorySimulation[]) {
    // Generate CSV content
    const headers = ['Date', 'Monthly Income', 'Income Type', 'Projected Value', 'RSI Score', 'Readiness Level'];
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(sim => {
      const row = [
        new Date(sim.createdAt).toLocaleDateString(),
        sim.monthlyIncome,
        sim.incomeType,
        sim.result?.projectedValue || '',
        sim.result?.rsiScore || '',
        sim.result?.readinessLevel || ''
      ];
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    return csvContent;
  }

  return (

    <div className="p-6 space-y-8">

      <HistoryHeader
        onPDF={handlePDF}
        onCSV={handleCSV}
      />

      <HistoryStats
        simulations={simulations}
      />

      <HistoryTable
        simulations={simulations}
      />

      <ExportInfoCard
        onPDF={handlePDF}
        onCSV={handleCSV}
      />

    </div>

  )
}