import {
  TrackingOrderFormValues,
  TrackingOrderListValues,
} from "./../models/trackingOrder";
import Search from "antd/lib/transfer/search";
import { makeAutoObservable } from "mobx";
import { getParsedCommandLineOfConfigFile } from "typescript";
import TrackingOrder from "../api/trackingOrder";
import {
  ITrackingOrderForm,
  ITrackingOrderList,
  IEstudiosList,
} from "../models/trackingOrder";
import { IScopes } from "../models/shared";
import alerts from "../util/alerts";
import history from "../util/history";
import messages from "../util/messages";
import responses from "../util/responses";
import { getErrors } from "../util/utils";

export default class TrackingOrdertStore {
  constructor() {
    makeAutoObservable(this);
  }

  scopes?: IScopes;
  trackingOrder: IEstudiosList[] = [];
  estudios: IEstudiosList[] = [];

  TranckingOrderSend: ITrackingOrderForm = new TrackingOrderFormValues();

  setSendData = (tranckingOrderSend: ITrackingOrderForm) => {
    this.TranckingOrderSend = tranckingOrderSend;
  };

  confirmarRecoleccionSend = async () => {
    try {
      await TrackingOrder.confirmarRecoleccion(this.OrderId);

      alerts.success("Se confirmo exitosmente la orden: " + this.OrderCreated);
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };
  cancelarRecoleccionSend = async () => {
    try {
      await TrackingOrder.cancelarRecoleccion(this.OrderId);
      alerts.success("Se cancelo exitosmente la orden: " + this.OrderCreated);
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };
  setEscaneado = (escaneado: boolean, id: string) => {
    try {
      const estudios = this.trackingOrder.map((estudio) => {
        let a = new TrackingOrderListValues(estudio);
        if (a.id === id) {
          a.escaneado = escaneado;
        }
        return a;
      });
      this.trackingOrder = estudios;
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };
  setTemperature = (temperature: number, id: string | null = null) => {
    try {
      if (id) {
        const index = this.trackingOrder.findIndex((x) => x.id === id);
        if (index !== -1) {
          const trackingOrder = this.trackingOrder[index];
          this.trackingOrder[index] = {
            ...trackingOrder,
            temperatura: temperature,
          };
        }
      } else {
        const estudios = this.trackingOrder.map((estudio) => {
          estudio.temperatura = temperature;
          return estudio;
        });
        this.trackingOrder = estudios;
      }
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  getStudiesByStudiesRoute = async (studyId: number[]) => {
    try {
      const studies = await TrackingOrder.findStudies(studyId);

      this.trackingOrder = studies.map((x) => {
        let a = new TrackingOrderListValues(x);

        return a;
      });
    } catch (error) {
      alerts.warning(getErrors(error));
      this.trackingOrder = [];
    }
  };
  clearScopes = () => {
    this.scopes = undefined;
  };

  clearTrackingOrders = () => {
    this.trackingOrder = [];
  };

  access = async () => {
    try {
      const scopes = await TrackingOrder.access();
      this.scopes = scopes;
    } catch (error) {
      alerts.warning(getErrors(error));
      history.push("/forbidden");
    }
  };

  getAll = async (search: string) => {
    try {
      const trackingOrder = await TrackingOrder.getAll(search);
      this.trackingOrder = trackingOrder;
    } catch (error) {
      alerts.warning(getErrors(error));
      this.trackingOrder = [];
    }
  };

  getById = async (id: number) => {
    try {
      const trackingOrder = await TrackingOrder.getById(id);
      return trackingOrder;
    } catch (error) {
      console.log(error);
      alerts.warning(getErrors(error));
    }
  };
  OrderCreated = "";
  OrderId = "";
  create = async (trackingOrder: ITrackingOrderForm) => {
    try {
      const orderCreated = await TrackingOrder.create(trackingOrder);
      this.OrderCreated = orderCreated.clave;
      console.log("OrderCreated", this.OrderCreated);
      this.OrderId = orderCreated.id;
      console.log("OrderId", this.OrderId);
      alerts.success("Se creo exitosmente la orden: " + this.OrderCreated);
      return true;
    } catch (error) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  update = async (trackingOrder: ITrackingOrderForm) => {
    try {
      await TrackingOrder.update(trackingOrder);
      alerts.success(messages.updated);
      return true;
    } catch (error) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  exportList = async () => {
    try {
      console.log("export this.OrderId", this.OrderId);
      if (!!this.OrderId) {
        await TrackingOrder.exportList(this.TranckingOrderSend);
      }
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  exportForm = async (id: number) => {
    try {
      await TrackingOrder.exportForm(id);
    } catch (error: any) {
      if (error.status === responses.notFound) {
        history.push("/notFound");
      } else {
        alerts.warning(getErrors(error));
      }
    }
  };
}