"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { useEffect, useState } from "react"
import HistoryHeader from "./HistoryHeader"
import HistoryStats from "./HistoryStats"
import HistoryTable from "./HistoryTable"
import ExportInfoCard from "./HistoryExportCard"
import { usePriorityUpdates } from "@/hooks/usePriorityUpdates"
import { useToast } from "@/hooks/use-toast"

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

  const { toast } = useToast()

  function handlePDF() {
    const doc = new jsPDF()
    
    doc.setFontSize(16)
    doc.text('ZikoRetire Simulation History', 14, 20)
    
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = simulations.map(sim => [
      new Date(sim.createdAt).toLocaleDateString(),
      sim.incomeType,
      `MWK ${sim.result?.monthlyIncome?.toLocaleString() || 'N/A'}`,
      `MWK ${sim.result?.projectedValue?.toLocaleString() || 'N/A'}`,
      `${sim.result?.rsiScore?.toFixed(1) || 'N/A'}%`,
      sim.result?.readinessLevel || 'N/A'
    ])

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Income Type', 'Monthly Income', 'Projected Value', 'RSI Score', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    })
    
    doc.save(`zikoretire-history-${new Date().toISOString().split('T')[0]}.pdf`)
    
    toast({
      title: "PDF Downloaded",
      description: "Your simulation history report has been successfully downloaded."
    })
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
    
    toast({
      title: "CSV Exported",
      description: "Your simulation history data has been exported successfully."
    })
  }

  function generateCSVContent(data: HistorySimulation[]) {
    // Generate CSV content
    const headers = ['Date', 'Income Type', 'Monthly Income', 'Projected Value', 'RSI Score', 'Readiness Level'];
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(sim => {
      const row = [
        new Date(sim.createdAt).toLocaleDateString(),
        sim.incomeType,
        sim.result?.monthlyIncome || '',
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