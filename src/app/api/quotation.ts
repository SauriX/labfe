import { IGeneralForm } from "../models/general";
import {
  IQuotation,
  IQuotationGeneral,
  IQuotationInfo,
  IQuotationStudyUpdate,
  IQuotationTotal,
} from "../models/quotation";
import requests from "./agent";

const Quotation = {
  getQuotations: (filter: IGeneralForm): Promise<IQuotationInfo[]> =>
    requests.post("quotation/filter", filter),
  getActive: (): Promise<IQuotationInfo[]> => requests.get("quotation/active"),
  getById: (quotationId: string): Promise<IQuotation> =>
    requests.get(`quotation/${quotationId}`),
  getGeneral: (quotationId: string): Promise<IQuotationGeneral> =>
    requests.get(`quotation/general/${quotationId}`),
  getStudies: (quotationId: string): Promise<IQuotationStudyUpdate> =>
    requests.get(`quotation/studies/${quotationId}`),
  sendTestEmail: (quotationId: string, emails: string[]): Promise<void> =>
    requests.post(`quotation/email/${quotationId}`, emails),
  sendTestWhatsapp: (quotationId: string, phones: string[]): Promise<void> =>
    requests.post(`quotation/whatsapp/${quotationId}`, phones),
  create: (quotation: IQuotation): Promise<string> =>
    requests.post("quotation", quotation),
  convertToRequest: (quotationId: string): Promise<string> =>
    requests.post(`quotation/convert/${quotationId}`, {}),
  updateGeneral: (quotation: IQuotationGeneral): Promise<void> =>
    requests.put("quotation/general", quotation),
  assignRecord: (quotationId: string, recordId?: string) =>
    requests.put(`quotation/assign/${quotationId}/${recordId ?? ""}`, {}),
  updateTotals: (quotation: IQuotationTotal): Promise<void> =>
    requests.put("quotation/totals", quotation),
  updateStudies: (
    quotation: IQuotationStudyUpdate
  ): Promise<IQuotationStudyUpdate> =>
    requests.post("quotation/studies", quotation),
  cancelQuotation: (quotationId: string): Promise<void> =>
    requests.put(`quotation/cancel/${quotationId}`, {}),
  deleteQuotation: (quotationId: string): Promise<void> =>
    requests.delete(`quotation/delete/${quotationId}`),
  deleteStudies: (quotation: IQuotationStudyUpdate): Promise<void> =>
    requests.put("quotation/studies/cancel", quotation),
  printTicket: (quotationId: string): Promise<void> =>
    requests.print(`quotation/ticket/${quotationId}`),
  getQuotePdfUrl: (id: string): Promise<string> =>
    requests.getFileUrl(`quotation/quote/${id}`, "application/pdf"),
};

export default Quotation;
