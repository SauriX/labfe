import moment from "moment";

export interface IClinicResultList {
  id: string;
  solicitud: string;
  nombre: string;
  order: string;
  registro: string;
  sucursal: string;
  sucursalNombre: string;
  nombreMedico: string;
  edad: string;
  sexo: string;
  compañia: string;
  seleccion: boolean;
  estudios: IClinicStudy[];
  procedencia: number;
}

export interface IClinicStudy {
  id: number;
  nombre: string;
  area: string;
  status: number;
  registro: string;
  entrega: string;
  seleccion: boolean;
  clave: string;
  nombreEstatus: string;
}

export interface IClinicResultForm {
  sucursalId: string[];
  medicoId: string[];
  compañiaId: string[];
  fecha: moment.Moment[];
  buscar: string;
  procedencia: number[];
  departamento: number[];
  area: number[];
  tipoSolicitud: string[];
  estatus: number[];
  estudio: number[];
}

export interface IStudyList {
  id: number;
  nombre: string;
  area: string;
  status: number;
  registro: string;
  entrega: string;
  seleccion: boolean;
  clave: string;
}

export class ClinicResultsFormValues implements IClinicResultForm {
  sucursalId = [];
  medicoId = [];
  compañiaId = [];
  fecha = [
    moment(Date.now()).utcOffset(0, true),
    moment(Date.now()).utcOffset(0, true).add(1, "day"),
  ];
  buscar = "";
  procedencia = [];
  departamento = [];
  tipoSolicitud = [];
  area = [];
  estatus = [];
  estudio = [];

  constructor(init?: IClinicResultForm) {
    Object.assign(this, init);
  }
}