import { getDepartamentos } from "@/app/api/functions/departamentos"
import InformesClient from "./informes-client"

export default async function InformesPage() {
  const departamentos = await getDepartamentos()

  return (
    <InformesClient initialDepartamentos={departamentos} />
  )
}
