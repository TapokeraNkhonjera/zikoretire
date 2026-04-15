"use client"

import { Button } from "@/components/ui/button"
import {
  FileText,
  FileSpreadsheet
} from "lucide-react"

interface Props {
  onPDF: () => void
  onCSV: () => void
}

export default function HistoryHeader({
  onPDF,
  onCSV
}: Props) {

  return (

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h2 className="text-2xl font-bold">
          Simulation History
        </h2>

        <p className="text-muted-foreground">
          View and export your retirement simulations
        </p>

      </div>

      <div className="flex gap-3">

        <Button
          variant="outline"
          onClick={onPDF}
        >
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </Button>

        <Button
          onClick={onCSV}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

      </div>

    </div>

  )
}