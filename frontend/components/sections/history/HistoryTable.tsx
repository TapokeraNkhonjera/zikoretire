import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import HistoryRow from "./HistoryRow"

import {
  HistorySimulation
} from "./types"

export default function HistoryTable({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  return (

    <div className="overflow-x-auto border rounded-xl">

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>
              Date
            </TableHead>

            <TableHead>
              Monthly Income
            </TableHead>

            <TableHead>
              Projected Value
            </TableHead>

            <TableHead>
              RSI Score
            </TableHead>

            <TableHead>
              Status
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {simulations.map(
            (sim) => (

              <HistoryRow
                key={sim.id}
                simulation={sim}
              />

            )
          )}

        </TableBody>

      </Table>

    </div>

  )
}