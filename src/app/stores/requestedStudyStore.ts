import { makeAutoObservable } from "mobx";
import RequestedStudy from "../api/requestedStudy";
import {
  IRequestedStudyForm,
  IRequestedStudyList,
  IRequestedStudy,
  IUpdate,
  RequestedStudyFormValues,
} from "../models/requestedStudy";
import { IScopes } from "../models/shared";
import alerts from "../util/alerts";
import history from "../util/history";
import messages from "../util/messages";
import { getErrors } from "../util/utils";
import { status } from "../util/catalogs";
import moment from "moment";

export default class RequestedStudyStore {
  constructor() {
    makeAutoObservable(this);
  }

  scopes?: IScopes;
  data: IRequestedStudyList[] = [];
  studies: IRequestedStudy[] = [];
  formValues: IRequestedStudyForm = new RequestedStudyFormValues();
  loadingStudies: boolean = false;
  clear: boolean = false;

  clearScopes = () => {
    this.scopes = undefined;
  };

  clearStudy = () => {
    this.data = [];
  };

  setFormValues = (newFormValues: IRequestedStudyForm) => {
    this.formValues = newFormValues;
  };

  clearFilter = () => {
    const emptyFilter: IRequestedStudyForm = {
      sucursalId: [],
      medicoId: [],
      compañiaId: [],
      fecha: [
        moment(Date.now()).utcOffset(0, true),
        moment(Date.now()).utcOffset(0, true).add(1, "day"),
      ],
      buscar: "",
      procedencia: [],
      departamento: [],
      tipoSolicitud: [],
      area: [],
      estatus: [],
    };
    this.data = [];
    this.formValues = emptyFilter;
    this.clear = !this.clear;
  };

  access = async () => {
    try {
      const scopes = await RequestedStudy.access();
      this.scopes = scopes;
    } catch (error) {
      alerts.warning(getErrors(error));
      history.push("/forbidden");
    }
  };

  getAll = async (search: IRequestedStudyForm) => {
    try {
      this.loadingStudies = true;
      const study = await RequestedStudy.getAll(search);
      this.data = study;
      return study;
    } catch (error) {
      alerts.warning(getErrors(error));
      this.data = [];
    } finally {
      this.loadingStudies = false;
    }
  };

  update = async (study: IUpdate[]) => {
    try {
      console.log(study);
      await RequestedStudy.update(study);
      alerts.success(messages.updated);

      // const ids = study.estudioId;

      this.data = this.data.map((x) => {
        x.estudios = x.estudios.map((z) => {
          const updated = study.find(
            (y) => y.solicitudId === x.id && y.estudioId.includes(z.id)
          );
          if (updated) {
            z.status =
              z.status === status.requestStudy.tomaDeMuestra
                ? status.requestStudy.solicitado
                : status.requestStudy.tomaDeMuestra;
          }

          return z;
        });
        return x;
      });

      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  printOrder = async (recordId: string, requestId: string) => {
    try {
      await RequestedStudy.getOrderPdf(recordId, requestId);
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  exportList = async (search: IRequestedStudyForm) => {
    try {
      await RequestedStudy.exportList(search);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };
}