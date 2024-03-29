import { IReportFilter, IReportData, IReportContactData } from "../models/report";
import { IScopes } from "../models/shared";
import requests from "./agent";

const Report = {
  access: (): Promise<IScopes> => requests.get("scopes/report"),
  getByFilter: (
    report: string,
    filter: IReportFilter
  ): Promise<IReportData[]> => requests.post(`report/${report}/filter`, filter),
  getByChart: <T extends unknown>(
    report: string,
    filter: IReportFilter
  ): Promise<T[]> =>
    requests.post(`report/${report}/chart/filter`, filter),
    getByTable: <T extends unknown>(
      report: string,
      filter: IReportFilter
    ): Promise<T[]> =>
      requests.post(`report/${report}/table/filter`, filter),
  printPdf: (report: string, filter: IReportFilter): Promise<void> =>
    requests.download(`report/${report}/download/pdf`, filter),
};

export default Report;
