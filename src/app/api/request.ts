import { IGeneralForm } from "../models/general";
import {
  IRequest,
  IRequestGeneral,
  IRequestInfo,
  IRequestPartiality,
  IRequestStudyUpdate,
  IRequestTag,
  IRequestTotal,
  IRequestPayment,
  IRequestToken,
  IRequestCheckIn,
} from "../models/request";
import {
  IWeeAssignment,
  IWeeTokenValidation,
  IWeeTokenVerification,
} from "../models/weeClinic";
import requests from "./agent";

const Request = {
  getRequests: (filter: IGeneralForm): Promise<IRequestInfo[]> =>
    requests.post("request/filter", filter),
  getById: (recordId: string, requestId: string): Promise<IRequest> =>
    requests.get(`request/${recordId}/${requestId}`),
  getGeneral: (recordId: string, requestId: string): Promise<IRequestGeneral> =>
    requests.get(`request/general/${recordId}/${requestId}`),
  getStudies: (
    recordId: string,
    requestId: string
  ): Promise<IRequestStudyUpdate> =>
    requests.get(`request/studies/${recordId}/${requestId}`),
  getPayments: (
    recordId: string,
    requestId: string
  ): Promise<IRequestPayment[]> =>
    requests.get(`request/payments/${recordId}/${requestId}`),
  getTags: (recordId: string, requestId: string): Promise<IRequestTag[]> =>
    requests.get(`request/tags/${recordId}/${requestId}`),
  getImages: (recordId: string, requestId: string): Promise<string[]> =>
    requests.get(`request/images/${recordId}/${requestId}`),
  getNextPaymentCode: (serie: string): Promise<string> =>
    requests.get(`request/nextPaymentCode/${serie}`),
  sendTestEmail: (
    recordId: string,
    requestId: string,
    emails: string[]
  ): Promise<void> =>
    requests.post(`request/email/${recordId}/${requestId}`, emails),
  sendTestWhatsapp: (
    recordId: string,
    requestId: string,
    phones: string[]
  ): Promise<void> =>
    requests.post(`request/whatsapp/${recordId}/${requestId}`, phones),
  create: (request: IRequest): Promise<string> =>
    requests.post("request", request),
  createWeeClinic: (request: IRequest): Promise<string> =>
    requests.post("request/weeClinic", request),
  createPayment: (request: IRequestPayment): Promise<IRequestPayment> =>
    requests.post("request/payment", request),
  checkInPayment: (request: IRequestCheckIn): Promise<IRequestPayment[]> =>
    requests.post("request/payment/checkin", request),
  updateSeries: (request: IRequest): Promise<number> =>
    requests.put("request/series", request),
  updateGeneral: (request: IRequestGeneral): Promise<void> =>
    requests.put("request/general", request),
  updateTotals: (request: IRequestTotal): Promise<void> =>
    requests.put("request/totals", request),
  updateStudies: (request: IRequestStudyUpdate): Promise<IRequestStudyUpdate> =>
    requests.post("request/studies", request),
  updateTags: (
    recordId: string,
    requestId: string,
    tags: IRequestTag[]
  ): Promise<IRequestTag[]> =>
    requests.post(`request/tags/${recordId}/${requestId}`, tags),
  cancelRequest: (recordId: string, requestId: string): Promise<void> =>
    requests.put(`request/cancel/${recordId}/${requestId}`, {}),
  deleteRequest: (recordId: string, requestId: string): Promise<void> =>
    requests.delete(`request/delete/${recordId}/${requestId}`),
  cancelStudies: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/cancel", request),
  cancelPayments: (
    recordId: string,
    requestId: string,
    payments: IRequestPayment[]
  ): Promise<IRequestPayment[]> =>
    requests.put(`request/payment/cancel/${recordId}/${requestId}`, payments),
  sendStudiesToSampling: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/sampling", request),
  sendStudiesToRequest: (request: IRequestStudyUpdate): Promise<void> =>
    requests.put("request/studies/request", request),
  addPartiality: (request: IRequestPartiality): Promise<void> =>
    requests.put("request/partiality", request),
  printTicket: (recordId: string, requestId: string): Promise<void> =>
    requests.print(`request/ticket/${recordId}/${requestId}`),
  getOrderPdfUrl: (recordId: string, requestId: string): Promise<string> =>
    requests.getFileUrl(
      `request/order/${recordId}/${requestId}`,
      "application/pdf"
    ),
  printTags: (
    recordId: string,
    requestId: string,
    tags: IRequestTag[]
  ): Promise<void> =>
    requests.print(`request/print/tags/${recordId}/${requestId}`, tags),
  printIndications: (recordId: string, requestId: string): Promise<void> =>
    requests.download(`request/print/indications/${recordId}/${requestId}`),
  saveImage: (formData: FormData): Promise<string> =>
    requests.put("request/images", formData),
  deleteImage: (
    recordId: string,
    requestId: string,
    code: string
  ): Promise<void> =>
    requests.delete(`request/image/${recordId}/${requestId}/${code}`),
  sendWeeToken: (request: IRequestToken): Promise<IWeeTokenValidation> =>
    requests.post("request/wee/sendToken", request),
  compareWeeToken: (request: IRequestToken): Promise<IWeeTokenValidation> =>
    requests.post("request/wee/compareToken", request),
  verifyWeeToken: (request: IRequestToken): Promise<IWeeTokenVerification> =>
    requests.post("request/wee/verifyToken", request),
  assignWeeServices: (
    recordId: string,
    requestId: string
  ): Promise<IWeeAssignment[]> =>
    requests.put(`request/wee/assignServices/${recordId}/${requestId}`, {}),
};

export default Request;
