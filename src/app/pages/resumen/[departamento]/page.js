import { getDepartamentos } from "@/app/api/functions/departamentos"
import { getResumenPresupuesto, getResumenInversion, getResumenOrden } from "@/app/api/functions/resumen"
import ResumenClient from './resumen-client'

export default async function Resumen({ params }) {
    const awaitedParams = await params;
    const departamento = awaitedParams?.departamento ? decodeURIComponent(awaitedParams.departamento) : '';
    
    const departamentos = await getDepartamentos();
    const departamentoInfo = departamentos.find(d => d.Nombre === departamento) || {};
    const añoActual = new Date().getFullYear();
    
    const resumenprep = await getResumenPresupuesto(departamentoInfo.id_Departamento, añoActual);
    const resumeninv = await getResumenInversion(departamentoInfo.id_Departamento, añoActual);
    const resumenord = await getResumenOrden(departamentoInfo.id_Departamento);

    return (
        <ResumenClient
            departamento={departamento}
            departamentoId={departamentoInfo.id_Departamento}
            resumenprep={resumenprep}
            resumeninv={resumeninv}
            resumenord={resumenord}
        />
    );
}
