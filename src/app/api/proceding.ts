import { IGeneralForm } from "../models/general";
import { IProceedingForm, IProceedingList } from "../models/Proceeding";
import { IQuotationFilter, IQuotationInfo } from "../models/quotation";
import { IScopes } from "../models/shared";
import { ITaxData } from "../models/taxdata";
import requests from "./agent";

const Proceding = {
  access: (): Promise<IScopes> => requests.get("scopes/medic"),
  getAll: (search: string): Promise<IProceedingList[]> =>
    requests.get(`MedicalRecord/all`),
  getNow: (search: IGeneralForm): Promise<IProceedingList[]> =>
    requests.post(`medicalRecord/now`, search ?? {}),
  getNowQ: (search: IQuotationFilter): Promise<IQuotationInfo[]> =>
    requests.post(`quotation/filter`, search ?? {}),
  getcoincidencia: (search: IProceedingForm): Promise<IProceedingList[]> =>
    requests.post(`medicalRecord/coincidencias`, search ?? {}),
  getTaxData: (recordId: string): Promise<ITaxData[]> =>
    requests.get(`MedicalRecord/taxData/${recordId}`),
  getById: (id: string): Promise<IProceedingForm> =>
    requests.get(`MedicalRecord/${id}`),
  //getPermission: (): Promise<IRolePermission[]> => requests.get(`Rol/permisos`), */
  create: (pack: IProceedingForm): Promise<IProceedingList> =>
    requests.post("/MedicalRecord", pack),
  updateWallet: (
    id: string,
    saldo: number,
    activo: boolean
  ): Promise<boolean> =>
    requests.post("/MedicalRecord/updateWallet", { id, saldo, activo }),
  createTaxData: (taxData: ITaxData): Promise<string> =>
    requests.post("/MedicalRecord/taxData", taxData),
  update: (pack: IProceedingForm): Promise<IProceedingList> =>
    requests.put("/MedicalRecord", pack),
  updateTaxData: (taxData: ITaxData): Promise<void> =>
    requests.put("/MedicalRecord/taxData", taxData),
  setDefaultTaxData: (taxDataId: string): Promise<void> =>
    requests.put("/MedicalRecord/taxData/default", taxDataId),
  updateObservation: (observation: any): Promise<void> =>
    requests.put("/MedicalRecord/observations", observation),
  exportList: (search: IGeneralForm): Promise<void> =>
    requests.download(`MedicalRecord/export/list`, search), //, "Catálogo de Sucursales.xlsx"
  exportForm: (id: string): Promise<void> =>
    requests.download(`MedicalRecord/export/form/${id}`), //, `Catálogo de Sucursales (${clave}).xlsx`
};

export default Proceding;
