import { makeAutoObservable, intercept, reaction } from "mobx";
import PriceList from "../api/priceList";
import Request from "../api/request";
import { IPriceListInfoFilter } from "../models/priceList";
import {
  IRequest,
  IRequestFilter,
  IRequestGeneral,
  IRequestInfo,
  IRequestPack,
  IRequestPartiality,
  IRequestStudy,
  IRequestStudyUpdate,
  IRequestTotal,
  RequestStudyUpdate,
  RequestTotal,
} from "../models/request";
import alerts from "../util/alerts";
import { status } from "../util/catalogs";
import history from "../util/history";
import messages from "../util/messages";
import { getErrors } from "../util/utils";

export default class RequestStore {
  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.studies.slice(),
      (studies) => {
        console.log(studies);
        this.calculateTotals();
      }
    );

    reaction(
      () => this.packs.slice(),
      (packs) => {
        console.log(packs);
        this.calculateTotals();
      }
    );
  }

  studyFilter: IPriceListInfoFilter = {};
  requests: IRequestInfo[] = [];
  request?: IRequest;
  totals: IRequestTotal = new RequestTotal();
  studies: IRequestStudy[] = [];
  packs: IRequestPack[] = [];

  get studyUpdate() {
    if (this.request) {
      const data: IRequestStudyUpdate = {
        expedienteId: this.request.expedienteId,
        solicitudId: this.request.solicitudId!,
        paquetes: this.packs,
        estudios: this.studies,
        total: {
          ...this.totals,
          expedienteId: this.request.expedienteId,
          solicitudId: this.request.solicitudId!,
        },
      };
      return data;
    }
    return new RequestStudyUpdate();
  }

  get allStudies() {
    const packStudies = this.packs
      .flatMap((x) => x.estudios)
      .map((x) => {
        x.type = "pack";
        return x;
      });
    const studies = this.studies.map((x) => {
      x.type = "study";
      return x;
    });

    return [...studies, ...packStudies];
  }

  isPack(obj: IRequestStudy | IRequestPack): obj is IRequestPack {
    return obj.type === "pack";
  }

  isStudy(obj: IRequestStudy | IRequestPack): obj is IRequestStudy {
    return obj.type === "study";
  }

  calculateTotals = () => {
    const total =
      this.studies.reduce((acc, obj) => acc + obj.precio, 0) +
      this.packs.reduce((acc, obj) => acc + obj.precio, 0);

    const desc =
      this.totals.descuentoTipo === 1
        ? ((this.studies.filter((x) => x.aplicaDescuento).reduce((acc, obj) => acc + obj.precio, 0) +
            this.packs.filter((x) => x.aplicaDescuento).reduce((acc, obj) => acc + obj.precio, 0)) *
            this.totals.descuento) /
          100
        : this.totals.descuento;

    const char =
      this.totals.cargoTipo === 1
        ? ((this.studies.filter((x) => x.aplicaCargo).reduce((acc, obj) => acc + obj.precio, 0) +
            this.packs.filter((x) => x.aplicaCargo).reduce((acc, obj) => acc + obj.precio, 0)) *
            this.totals.cargo) /
          100
        : this.totals.cargo;

    const cop =
      this.totals.copagoTipo === 1
        ? ((this.studies.filter((x) => x.aplicaCopago).reduce((acc, obj) => acc + obj.precio, 0) +
            this.packs.filter((x) => x.aplicaCopago).reduce((acc, obj) => acc + obj.precio, 0)) *
            this.totals.copago) /
          100
        : this.totals.copago;

    const finalTotal = total - desc + char - cop;

    this.totals = {
      ...this.totals,
      totalEstudios: total,
      total: finalTotal,
    };
  };

  setStudyFilter = (branchId?: string, doctorId?: string, companyId?: string) => {
    this.studyFilter = {
      sucursalId: branchId,
      medicoId: doctorId,
      compañiaId: companyId,
    };
  };

  setStudy = (study: IRequestStudy) => {
    const index = this.studies.findIndex((x) => x.estudioId === study.estatusId);

    if (index > -1) {
      this.studies[index] = study;
    }

    this.packs = this.packs.map((x) => {
      const index = x.estudios.findIndex((x) => x.estudioId === study.estatusId);
      if (index > -1) {
        x.estudios[index] = study;
      }
      return x;
    });
  };

  setPack = (pack: IRequestPack) => {
    const index = this.packs.findIndex((x) => x.paqueteId === pack.paqueteId);

    if (index > -1) {
      this.packs[index] = pack;
    }
  };

  setPartiality = (apply: boolean) => {
    if (this.request) {
      this.request.parcialidad = apply;
    }
  };

  setTotals = (totals: IRequestTotal) => {
    this.totals = totals;
    this.calculateTotals();
  };

  getById = async (recordId: string, requestId: string) => {
    try {
      const request = await Request.getById(recordId, requestId);
      this.request = request;
    } catch (error) {
      alerts.warning(getErrors(error));
      history.push("/notFound");
    }
  };

  getRequests = async (filter: IRequestFilter) => {
    try {
      const requests = await Request.getRequests(filter);
      this.requests = requests;
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  getGeneral = async (recordId: string, requestId: string) => {
    try {
      const request = await Request.getGeneral(recordId, requestId);
      request.metodoEnvio = [];
      if (request.correo) request.metodoEnvio.push("correo");
      if (request.whatsapp) request.metodoEnvio.push("whatsapp");
      if (request.metodoEnvio.length === 2) request.metodoEnvio.push("ambos");
      return request;
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  getStudies = async (recordId: string, requestId: string) => {
    try {
      const data = await Request.getStudies(recordId, requestId);
      if (data.paquetes && data.paquetes.length > 0) {
        this.packs = data.paquetes;
      }
      this.studies = data.estudios;
      this.totals = data.total ?? new RequestTotal();
      this.calculateTotals();
      return data;
    } catch (error) {
      alerts.warning(getErrors(error));
      return [];
    }
  };

  getPriceStudy = async (studyId: number, filter: IPriceListInfoFilter) => {
    try {
      filter.estudioId = studyId;
      const price = await PriceList.getPriceStudy(filter);

      const study: IRequestStudy = {
        ...price,
        type: "study",
        estatusId: status.requestStudy.pendiente,
        aplicaCargo: false,
        aplicaCopago: false,
        aplicaDescuento: false,
        nuevo: true,
      };

      console.log(study);

      const repeated = this.studies.filter(function (itm) {
        return itm.parametros
          .map((x) => x.id)
          .filter((x) => study.parametros.map((y) => y.id).indexOf(x) !== -1);
      });

      if (repeated && repeated.length > 0) {
        alerts.confirm(
          "Coincidencias en estudios",
          "Se encuentran coincidencias en parámetros de solicitud, en estudios: " +
            repeated.map((x) => x.clave).join(", "),
          async () => {
            this.studies.unshift(study);
          }
        );
      } else {
        this.studies.unshift(study);
      }

      return true;
    } catch (error) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  getPricePack = async (packId: number, filter: IPriceListInfoFilter) => {
    try {
      filter.paqueteId = packId;
      const price = await PriceList.getPricePack(filter);

      const pack: IRequestPack = {
        ...price,
        type: "pack",
        aplicaCargo: false,
        aplicaCopago: false,
        aplicaDescuento: false,
        nuevo: true,
        estudios: price.estudios.map((x) => ({
          ...x,
          type: "study",
          estatusId: status.requestStudy.pendiente,
          aplicaCargo: false,
          aplicaCopago: false,
          aplicaDescuento: false,
          nuevo: true,
        })),
      };

      console.log(pack);
      this.packs.unshift(pack);
      return true;
    } catch (error) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  sendTestEmail = async (recordId: string, requestId: string, email: string) => {
    try {
      await Request.sendTestEmail(recordId, requestId, email);
      alerts.info("El correo se está enviando");
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  sendTestWhatsapp = async (recordId: string, requestId: string, phone: string) => {
    try {
      await Request.sendTestWhatsapp(recordId, requestId, phone);
      alerts.info("El whatsapp se está enviando");
    } catch (error) {
      alerts.warning(getErrors(error));
    }
  };

  create = async (request: IRequest) => {
    try {
      const id = await Request.create(request);
      return id;
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  updateGeneral = async (request: IRequestGeneral) => {
    try {
      await Request.updateGeneral(request);
      alerts.success(messages.updated);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  updateTotals = async (request: IRequestTotal) => {
    try {
      await Request.updateTotals(request);
      alerts.success(messages.updated);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  updateStudies = async (request: IRequestStudyUpdate) => {
    try {
      await Request.updateStudies(request);
      alerts.success(messages.updated);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  deleteStudy = async (id: number) => {
    this.studies = this.studies.filter((x) => x.estudioId !== id);
  };

  deletePack = async (id: number) => {
    this.packs = this.packs.filter((x) => x.paqueteId !== id);
  };

  cancelStudies = async (request: IRequestStudyUpdate) => {
    try {
      await Request.cancelStudies(request);
      alerts.success(messages.updated);

      const ids = request.estudios.map((x) => x.estudioId);

      this.studies = this.studies.map((x) => {
        x.estatusId = ids.includes(x.estudioId) ? status.requestStudy.cancelado : x.estatusId;
        return x;
      });

      this.packs = this.packs.map((x) => {
        x.estudios = x.estudios.map((y) => {
          y.estatusId = ids.includes(y.estudioId) ? status.requestStudy.cancelado : y.estatusId;
          return y;
        });
        return x;
      });

      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  sendStudiesToSampling = async (request: IRequestStudyUpdate) => {
    try {
      await Request.sendStudiesToSampling(request);
      alerts.success(messages.updated);

      const ids = request.estudios.map((x) => x.estudioId);

      this.studies = this.studies.map((x) => {
        x.estatusId = ids.includes(x.estudioId) ? status.requestStudy.tomaDeMuestra : x.estatusId;
        return x;
      });

      this.packs = this.packs.map((x) => {
        x.estudios = x.estudios.map((y) => {
          y.estatusId = ids.includes(y.estudioId) ? status.requestStudy.tomaDeMuestra : y.estatusId;
          return y;
        });
        return x;
      });

      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  sendStudiesToRequest = async (request: IRequestStudyUpdate) => {
    try {
      await Request.sendStudiesToRequest(request);
      alerts.success(messages.updated);

      const ids = request.estudios.map((x) => x.estudioId);

      this.studies = this.studies.map((x) => {
        x.estatusId = ids.includes(x.estudioId) ? status.requestStudy.solicitado : x.estatusId;
        return x;
      });

      this.packs = this.packs.map((x) => {
        x.estudios = x.estudios.map((y) => {
          y.estatusId = ids.includes(y.estudioId) ? status.requestStudy.solicitado : y.estatusId;
          return y;
        });
        return x;
      });

      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  addPartiality = async (request: IRequestPartiality) => {
    try {
      await Request.addPartiality(request);
      alerts.success(messages.updated);
      return true;
    } catch (error: any) {
      alerts.warning(getErrors(error));
      return false;
    }
  };

  printTicket = async (recordId: string, requestId: string) => {
    try {
      await Request.printTicket(recordId, requestId);
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  getOrderPdfUrl = async (recordId: string, requestId: string) => {
    try {
      const url = await Request.getOrderPdfUrl(recordId, requestId);
      return url;
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  saveImage = async (request: FormData) => {
    try {
      await Request.saveImage(request);
      return true;
    } catch (error) {
      alerts.warning(getErrors(error));
      return false;
    }
  };
}
