import { makeAutoObservable } from "mobx";
import { IScopes } from "../models/shared";
import alerts from "../util/alerts";
import history from "../util/history";
import messages from "../util/messages";
import { getErrors } from "../util/utils";
import Sampling from "../api/sampling";
import { ISamplingList, IUpdate } from "../models/sampling";
import { status } from "../util/catalogs";
import { IRequestedStudy } from "../models/requestedStudy";
import { IGeneralForm } from "../models/general";

export default class SamplingStore {
  constructor() {
    makeAutoObservable(this);
  }

  scopes?: IScopes;
  data: ISamplingList[] = [];
  studies: IRequestedStudy[] = [];
  loadingStudies: boolean = false;

  clearScopes = () => {
    this.scopes = undefined;
  };

  clearStudy = () => {
    this.data = [];
  };

  access = async () => {
    try {
      const scopes = await Sampling.access();
      this.scopes = scopes;
    } catch (error) {
      alerts.warning(getErrors(error));
      history.push("/forbidden");
    }
  };

  getAll = async (search: IGeneralForm) => {
    try {
      this.loadingStudies = true;
      const study = await Sampling.getAll(search);
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
      await Sampling.update(study);
      alerts.success(messages.updated);

      this.data = this.data.map((x) => {
        x.estudios = x.estudios.map((z) => {
          const updated = study.find(
            (y) => y.solicitudId === x.id && y.estudioId.includes(z.id)
          );
          if (updated) {
            z.estatus =
              z.estatus === status.requestStudy.pendiente
                ? status.requestStudy.tomaDeMuestra
                : status.requestStudy.pendiente;
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
      await Sampling.getOrderPdf(recordId, requestId);
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  exportList = async (search: IGeneralForm) => {
    try {
      await Sampling.exportList(search);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };
}
