import { getOrden } from "@/app/api/functions/orden"
import { getResumenInversion, getResumenInversionAcum } from "@/app/api/functions/resumen" 
import { getDepartamentos } from "@/app/api/functions/departamentos"
import InversionClient from "./inversion-client"

export default async function InversionPage() {
  const orden = await getOrden()
  const departamentos = await getDepartamentos()
  
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const mesActual = meses[new Date().getMonth()]
  const año = new Date().getFullYear()
  
  const inversionesPorDepartamento = {}
  const inversionesAcumPorDepartamento = {}
  
  for (const dep of departamentos) {
    const inversionData = await getResumenInversion(dep.id_Departamento, año)
    inversionesPorDepartamento[dep.id_Departamento] = inversionData
    
    const inversionAcumData = await getResumenInversionAcum(dep.id_Departamento)
    inversionesAcumPorDepartamento[dep.id_Departamento] = inversionAcumData
  }

  return (
    <InversionClient
      initialOrden={orden}
      initialDepartamentos={departamentos}
      inversionesPorDepartamento={inversionesPorDepartamento}
      inversionesAcumPorDepartamento={inversionesAcumPorDepartamento}
      mesActual={mesActual}
      año={año}
    />
  )
}
