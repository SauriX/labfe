import {
  IRequest,
  IRequestGeneral,
  IRequestPartiality,
  IRequestStudy,
  IRequestStudyUpdate,
  IRequestTotal,
} from "../models/request";
import requests from "./agent";

const Request = {
  getById: (recordId: string, requestId: string): Promise<IRequest> =>
    requests.get(`request/${recordId}/${requestId}`),
  getGeneral: (recordId: string, requestId: string): Promise<IRequestGeneral> =>
    requests.get(`request/general/${recordId}/${requestId}`),
  getStudies: (recordId: string, requestId: string): Promise<IRequestStudyUpdate> =>
    requests.get(`request/studies/${recordId}/${requestId}`),
  sendTestEmail: (recordId: string, requestId: string, email: string): Promise<void> =>
    requests.get(`request/email/${recordId}/${requestId}/${email}`),
  sendTestWhatsapp: (recordId: string, requestId: string, phone: string): Promise<void> =>
    requests.get(`request/whatsapp/${recordId}/${requestId}/${phone}`),
  create: (request: IRequest): Promise<string> => requests.post("request", request),
  updateGeneral: (request: IRequestGeneral): Promise<void> => requests.put("request/general", request),
  updateTotals: (request: IRequestTotal): Promise<void> => requests.put("request/totals", request),
  updateStudies: (request: IRequestStudyUpdate): Promise<void> => requests.post("request/studies", request),
  cancelStudies: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/cancel", request),
  sendStudiesToSampling: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/sampling", request),
  sendStudiesToRequest: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/request", request),
  addPartiality: (request: IRequestPartiality): Promise<void> => requests.put("request/partiality", request),
  printTicket: (recordId: string, requestId: string): Promise<void> =>
    requests.print(`request/ticket/${recordId}/${requestId}`),
  getOrderPdfUrl: (recordId: string, requestId: string): Promise<string> =>
    requests.getFileUrl(`request/order/${recordId}/${requestId}`, "application/pdf"),
  saveImage: (formData: FormData): Promise<void> => requests.put("request/images", formData),
};

export default Request;