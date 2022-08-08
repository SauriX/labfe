import { IColumns, ISearch } from "../../app/common/table/utils";
import { IReportData } from "../../app/models/report";
import getStudyStatsColumns, {
  expandableStudyConfig,
} from "./columnDefinition/studyStats";
import getContactStatsColumns from "./columnDefinition/contactStats";
import getMedicalStatsColumns from "./columnDefinition/medicalStats";
import getPatientStatsColumns from "./columnDefinition/patientStats";
import getRequestByRecordColumns from "./columnDefinition/requestByRecord";
import { ExpandableConfig } from "antd/lib/table/interface";
import getUrgentStatsColumns from "./columnDefinition/urgentStats";
import getCompanyStatsColumns, {
  expandablePriceConfig,
} from "./columnDefinition/companyStats";
import getCanceledRequestColumns from "./columnDefinition/canceledRequest";
import getDescountRequestColumns from "./columnDefinition/descountRequest";
import getChargeRequestColumns from "./columnDefinition/chargeRequest";

export const getInputs = (
  reportName: string
): (
  | "sucursal"
  | "fecha"
  | "medico"
  | "metodoEnvio"
  | "compañia"
  | "urgencia"
  | "tipoCompañia"
)[] => {
  const filters: (
    | "sucursal"
    | "fecha"
    | "medico"
    | "metodoEnvio"
    | "compañia"
    | "urgencia"
    | "tipoCompañia"
  )[] = ["fecha", "sucursal"];

  if (reportName === "medicos") {
    filters.push("medico");
  } else if (reportName === "contacto") {
    filters.push("medico");
    filters.push("metodoEnvio");
  } else if (
    reportName === "estudios" ||
    reportName == "canceladas" ||
    reportName === "descuento" ||
    reportName === "cargo"
  ) {
    filters.push("medico");
    filters.push("compañia");
  } else if (reportName === "urgentes") {
    filters.push("medico");
    filters.push("urgencia");
  } else if (reportName === "empresa") {
    filters.push("medico");
    filters.push("tipoCompañia");
    filters.push("compañia");
  }

  return filters;
};

export const getReportConfig = (
  reportName: string
): {
  title: string;
  image: string;
  hasFooterRow: boolean;
  summary: boolean;
} => {
  let title = "";
  let image = "Reportes";
  let hasFooterRow = true;
  let summary = false;

  if (reportName === "expediente") {
    title = "Estadística de expedientes";
    hasFooterRow = false;
  } else if (reportName === "estadistica") {
    title = "Estadística de Pacientes";
  } else if (reportName === "medicos") {
    title = "Solicitudes por médico condensado";
    image = "doctor";
  } else if (reportName === "contacto") {
    title = "Solicitudes por contacto";
    image = "contactoos";
    hasFooterRow = false;
  } else if (reportName === "estudios") {
    title = "Relación Estudios por Paciente";
    image = "estudios-paciente";
    hasFooterRow = false;
  } else if (reportName === "urgentes") {
    title = "Relación Estudios por Paciente Urgente";
    image = "alerta";
    hasFooterRow = false;
  } else if (reportName === "empresa") {
    title = "Solicitudes por compañía";
    image = "empresa";
    hasFooterRow = false;
    summary = true;
  } else if (reportName === "canceladas") {
    title = "Solicitudes Canceladas";
    image = "cancelar";
    hasFooterRow = false;
    summary = true;
  } else if (reportName === "descuento") {
    title = "Solicitudes con Descuento";
    image = "descuento";
    hasFooterRow = false;
    summary = true;
  } else if (reportName === "cargo") {
    title = "Solicitudes con Cargo";
    image = "cargo";
    hasFooterRow = false;
    summary = true;
  }

  return { title, image, hasFooterRow, summary };
};

export const getColumns = (
  reportName: string,
  searchState: ISearch,
  setSearchState: React.Dispatch<React.SetStateAction<ISearch>>
): IColumns<IReportData> => {
  if (reportName === "expediente") {
    return getRequestByRecordColumns(searchState, setSearchState);
  } else if (reportName === "estadistica") {
    return getPatientStatsColumns(searchState, setSearchState);
  } else if (reportName === "medicos") {
    return getMedicalStatsColumns(searchState, setSearchState);
  } else if (reportName === "contacto") {
    return getContactStatsColumns(searchState, setSearchState);
  } else if (reportName === "estudios") {
    return getStudyStatsColumns(searchState, setSearchState);
  } else if (reportName === "urgentes") {
    return getUrgentStatsColumns(searchState, setSearchState);
  } else if (reportName === "empresa") {
    return getCompanyStatsColumns(searchState, setSearchState);
  } else if (reportName === "canceladas") {
    return getCanceledRequestColumns(searchState, setSearchState);
  } else if (reportName === "descuento") {
    return getDescountRequestColumns(searchState, setSearchState);
  } else if (reportName === "cargo") {
    return getChargeRequestColumns(searchState, setSearchState);
  }

  return [];
};

export const getExpandableConfig = (
  reportName: string
): ExpandableConfig<IReportData> | undefined => {
  if (reportName == "estudios" || reportName == "urgentes") {
    return expandableStudyConfig;
  } else if (reportName == "empresa" || reportName == "canceladas" || reportName == "descuento" || reportName == "cargo") {
    return expandablePriceConfig;
  }

  return undefined;
};