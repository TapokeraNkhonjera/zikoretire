import { Badge } from "@/components/ui/badge"

interface Props {

  readinessLevel: string

}

export default function HistoryStatusBadge({
  readinessLevel
}: Props) {

  const variant =

    readinessLevel === "Ready"
      ? "default"
      : readinessLevel === "Moderate"
      ? "secondary"
      : "destructive"

  return (

    <Badge variant={variant}>

      {readinessLevel}

    </Badge>

  )

}