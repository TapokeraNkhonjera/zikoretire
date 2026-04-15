"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react"

interface Props {
  onPDF: () => void
  onCSV: () => void
}

export default function HistoryExportCard({
  onPDF,
  onCSV
}: Props) {

  return (

    <Card className="bg-muted/30">

      <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">

        {/* ICON */}

        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">

          <Download className="w-7 h-7 text-primary" />

        </div>

        {/* TEXT */}

        <div className="flex-1">

          <h4 className="text-lg font-semibold">
            Export Your History
          </h4>

          <p className="text-sm text-muted-foreground">
            Download saved simulations for reporting or analysis.
          </p>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex gap-3">

          <Button
            variant="outline"
            onClick={onPDF}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>

          <Button
            onClick={onCSV}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>

        </div>

      </CardContent>

    </Card>

  )
}