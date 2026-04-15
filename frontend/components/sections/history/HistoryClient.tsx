"use client"

import HistoryHeader from "./HistoryHeader"
import HistoryStats from "./HistoryStats"
import HistoryTable from "./HistoryTable"
import ExportInfoCard from "./HistoryExportCard"

import {
  HistorySimulation
} from "./types"

export default function HistoryClient({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  function handlePDF() {
    alert("PDF download would be triggered here")
  }

  function handleCSV() {
    alert("CSV export triggered")
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