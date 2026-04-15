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

    <div className="flex justify-end gap-3">

      <Button
        variant="outline"
        onClick={onPDF}
        className="h-10"
      >
        <FileText className="w-4 h-4 mr-2" />
        Download PDF
      </Button>

      <Button
        onClick={onCSV}
        className="h-10"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export CSV
      </Button>

    </div>

  )
}