import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import HistoryRow from "./HistoryRow"
import { HistorySimulation } from "./types"

export default function HistoryTable({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  return (

    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">

      <Table>

        <TableHeader>

          <TableRow className="bg-muted/40">

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Date
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              Income Type
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
              Monthly Income
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
              Projected Value
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
              RSI
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">
              Status
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {simulations.map((sim) => (

            <HistoryRow
              key={sim.id}
              simulation={sim}
            />

          ))}

        </TableBody>

      </Table>

    </div>

  )
}