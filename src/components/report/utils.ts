import { IColumns, ISearch } from "../../app/common/table/utils";
import { IReportData } from "../../app/models/report";
import getStudyStatsColumns, {
  expandableStudyConfig,
} from "./columnDefinition/studyStats";
import getContactStatsColumns from "./columnDefinition/contactStats";
import getMedicalStatsColumns from "./columnDefinition/medicalStats";
import getMedicalBreakdownStatsColumns, {
  expandableMedicalBreakdownConfig,
} from "./columnDefinition/medicalBreakdownStats";
import getPatientStatsColumns from "./columnDefinition/patientStats";
import getRequestByRecordColumns from "./columnDefinition/requestByRecord";
import { ExpandableConfig } from "antd/lib/table/interface";
import getUrgentStatsColumns from "./columnDefinition/urgentStats";
import getCompanyStatsColumns, {
  expandableCompanyConfig,
} from "./columnDefinition/companyStats";

export type reportType =
  | "medicos"
  | "medicos-desglosado"
  | "contacto"
  | "estudios"
  | "urgentes"
  | "empresa"
  | "estadistica"
  | "expediente"
  | undefined;

export const getInputs = (
  reportName: reportType
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

  if (reportName === "medicos" || reportName === "medicos-desglosado") {
    filters.push("medico");
  } else if (reportName === "contacto") {
    filters.push("medico");
    filters.push("metodoEnvio");
  } else if (reportName === "estudios") {
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
  reportName: reportType
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
  } else if (reportName === "medicos-desglosado") {
    title = "Solicitudes por médico desglosado";
    image = "doctor";
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
  } else if (reportName === "medicos-desglosado") {
    return getMedicalBreakdownStatsColumns(searchState, setSearchState);
  }

  return [];
};

export const getExpandableConfig = (
  reportName: reportType
): ExpandableConfig<IReportData> | undefined => {
  if (reportName === "estudios" || reportName === "urgentes") {
    return expandableStudyConfig;
  } else if (reportName == "empresa") {
    return expandableCompanyConfig;
  } else if (reportName === "medicos-desglosado") {
    return expandableMedicalBreakdownConfig;
  }

  return undefined;
};
