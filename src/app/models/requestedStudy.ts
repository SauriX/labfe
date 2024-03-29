import moment from "moment";

export interface IRequestedStudyList {
  id: string;
  solicitud: string;
  nombre: string;
  expedienteId: string;
  solicitudId: string;
  clavePatologica: string;
  registro: string;
  sucursal: string;
  edad: string;
  sexo: string;
  compañia: string;
  seleccion: boolean;
  observacion: string;
  estudios: IRequestedStudy[];
}

export interface IRequestedStudy {
  id: number;
  nombre: string;
  solicitudEstudioId: number;
  area: string;
  estatus: number;
  registro: string;
  entrega: string;
  seleccion: boolean;
  clave: string;
  nombreEstatus: string;
  solicitudId: string;
  fechaActualizacion: string;
  usuarioActualizacion: string;
  urgencia: number;
}

export interface IUpdate {
  solicitudId: string;
  estudioId: number[];
}

export interface IRequestedStudyForm {
  sucursalId?: string[];
  medicoId?: string[];
  compañiaId?: string[];
  fecha?: moment.Moment[];
  buscar?: string;
  procedencia?: number[];
  departamento?: number[];
  area?: number[];
  tipoSolicitud?: string[];
  estatus?: number[];
}

export interface IStudyList {
  id: number;
  nombre: string;
  area: string;
  estatus: number;
  registro: string;
  entrega: string;
  seleccion: boolean;
  clave: string;
}

export class RequestedStudyFormValues implements IRequestedStudyForm {
  sucursalId = [];
  medicoId = [];
  compañiaId = [];
  fecha = [moment(), moment()];
  buscar = "";
  procedencia = [];
  departamento = [];
  tipoSolicitud = [];
  area = [];
  estatus = [];

  constructor(init?: IRequestedStudyForm) {
    Object.assign(this, init);
  }
}
