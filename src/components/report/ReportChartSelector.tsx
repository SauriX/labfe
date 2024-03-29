import { observer } from "mobx-react-lite";
import { ICommonData } from "../../app/models/cashRegister";
import {
  IReportRequestData,
  IMedicalBreakdownData,
  IReportCompanyData,
  IReportContactData,
  IReportData,
  IReportStudyData,
  IMaquilaData,
  IBudgetData,
} from "../../app/models/report";
import ReportChart from "./ReportChart";

type ReportChartSelectorProps = {
  report: string;
  data: any[];
};

const ReportChartSelector = ({ report, data }: ReportChartSelectorProps) => {
  if (report === "expediente") {
    return (
      <ReportChart<IReportData>
        data={data as IReportData[]}
        serieX={"expediente"}
        series={[
          { title: "Cantidad de Solicitudes", dataIndex: "noSolicitudes" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "estadistica") {
    return (
      <ReportChart<IReportData>
        data={data as IReportData[]}
        serieX={"paciente"}
        series={[
          { title: "Cantidad de Solicitudes", dataIndex: "noSolicitudes" },
          { title: "Total de Solicitudes", dataIndex: "total" },
        ]}
        axisLabel={{ interval: 0, rotate: 30 }}
      />
    );
  } else if (report === "medicos") {
    return (
      <ReportChart<IReportData>
        data={data as IReportData[]}
        serieX={"claveMedico"}
        series={[
          { title: "Total en pesos mexicanos", dataIndex: "total" },
          { title: "Cantidad de Solicitudes", dataIndex: "noSolicitudes" },
          { title: "Cantidad de Pacientes", dataIndex: "noPacientes" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "contacto") {
    return (
      <ReportChart<IReportContactData>
        data={data as IReportContactData[]}
        serieX={"fecha"}
        series={[
          { title: "Cantidad de Solicitudes", dataIndex: "solicitudes" },
          { title: "Cantidad de WhatsApp", dataIndex: "cantidadTelefono" },
          { title: "Cantidad de Correo", dataIndex: "cantidadCorreo" },
          { title: "Total Medios de Contacto", dataIndex: "total" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "estudios" || report === "urgentes") {
    return (
      <ReportChart<IReportStudyData>
        data={data as IReportStudyData[]}
        serieX={"estatus"}
        series={[{ title: "", dataIndex: "cantidad" }]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "empresa") {
    return (
      <ReportChart<IReportCompanyData>
        data={data as IReportCompanyData[]}
        serieX={"compañia"}
        series={[
          { title: "Solicitudes por Compañía", dataIndex: "noSolicitudes" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (
    report === "canceladas" ||
    report === "descuento" ||
    report === "cargo"
  ) {
    return (
      <ReportChart<IReportRequestData>
        data={data as IReportRequestData[]}
        serieX={"sucursal"}
        series={[{ title: "Solicitudes por Sucursal", dataIndex: "cantidad" }]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "medicos-desglosado") {
    return (
      <ReportChart<IMedicalBreakdownData>
        data={data as IMedicalBreakdownData[]}
        serieX={"claveMedico"}
        series={[
          { title: "Cantidad de Solicitudes", dataIndex: "noSolicitudes" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "maquila_interna" || report === "maquila_externa") {
    return (
      <ReportChart<IMaquilaData>
        data={data as IMaquilaData[]}
        serieX={"maquila"}
        series={[
          { title: "Cantidad de Solicitudes", dataIndex: "noSolicitudes" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "presupuestos") {
    return (
      <ReportChart<IBudgetData>
        data={data as IBudgetData[]}
        serieX={"sucursal"}
        series={[{ title: "Presupuesto por Sucursal", dataIndex: "total" }]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  } else if (report === "corte_caja") {
    return (
      <ReportChart<ICommonData>
        data={data as ICommonData[]}
        serieX={"efectivo"}
        series={[
          { title: "Total de Solicitudes", dataIndex: "total" },
        ]}
        axisLabel={{ interval: 0, rotate: 0 }}
      />
    );
  }

  return null;
};

export default observer(ReportChartSelector);
