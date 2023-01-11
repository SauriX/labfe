import {
  Spin,
  Form,
  Row,
  Col,
  Pagination,
  Button,
  PageHeader,
  Divider,
  Table,
  Input,
  Tooltip,
  Card,
  Tag,
} from "antd";
import React, { FC, useEffect, useState } from "react";
import { formItemLayout, moneyFormatter } from "../../../app/util/utils";
import { useStore } from "../../../app/stores/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../../app/common/button/ImageButton";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { observer } from "mobx-react-lite";
import views from "../../../app/util/view";
import { EditOutlined } from "@ant-design/icons";
import TextInput from "../../../app/common/form/proposal/TextInput";
import NumberInput from "../../../app/common/form/proposal/NumberInput";
import SelectInput from "../../../app/common/form/proposal/SelectInput";
import DateInput from "../../../app/common/form/proposal/DateInput";
import MaskInput from "../../../app/common/form/proposal/MaskInput";
import alerts from "../../../app/util/alerts";
import {
  getDefaultColumnProps,
  IColumns,
} from "../../../app/common/table/utils";
import { IFormError, IOptions } from "../../../app/models/shared";
import DatosFiscalesForm from "./DatosFiscalesForm";
import Concidencias from "./Concidencias";
import {
  IProceedingForm,
  ISearchMedical,
  ProceedingFormValues,
} from "../../../app/models/Proceeding";
import moment, { Moment } from "moment";
import { ITaxData } from "../../../app/models/taxdata";
import useWindowDimensions, { resizeWidth } from "../../../app/util/window";
import IconButton from "../../../app/common/button/IconButton";
import Link from "antd/lib/typography/Link";
import { IRequestInfo } from "../../../app/models/request";
import {
  AppointmentFormValues,
  IAppointmentForm,
  IAppointmentList,
  ISearchAppointment,
  ISolicitud,
  IConvertToRequest,
  SearchAppointmentValues,
} from "../../../app/models/appointmen";
import {
  IQuotation,
  IQuotationFilter,
  IQuotationGeneral,
  IQuotationInfo,
} from "../../../app/models/quotation";
import { toJS } from "mobx";

type ProceedingFormProps = {
  id: string;
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
  isPrinting: boolean;
};
const ProceedingForm: FC<ProceedingFormProps> = ({
  id,
  componentRef,
  printing,
  isPrinting,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const navigate = useNavigate();
  const {
    modalStore,
    procedingStore,
    locationStore,
    optionStore,
    profileStore,
    requestStore,
    appointmentStore,
    quotationStore,
  } = useStore();
  const { getQuotations, quotations, convertToRequest, cancelQuotation } =
    quotationStore;
  const {
    getAllDom,
    getAllLab,
    sucursales,
    getByIdDom,
    getByIdLab,
    sucursal,
    updateDom,
    updateLab,
    createsolictud,
    convertirASolicitud,
  } = appointmentStore;
  // const { createsolictud } = quotationStore;
  const { loadingRequests, requests, getRequests: getByFilter } = requestStore;
  const {
    getById,
    update,
    create,
    coincidencias,
    getnow,
    setTax,
    clearTax,
    expedientes,
    search,
    tax,
    activateWallet,
    getAllQ,
    quotatios,
    getByIdQ,
  } = procedingStore;
  const { profile } = profileStore;
  const { BranchOptions, getBranchOptions } = optionStore;
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [readonly, setReadonly] = useState(
    searchParams.get("mode") === "readonly"
  );
  const [citas, SetCitas] = useState<IAppointmentList[]>([]);
  const [form] = Form.useForm<IProceedingForm>();
  const [values, setValues] = useState<IProceedingForm>(
    new ProceedingFormValues()
  );
  const [errors, setErrors] = useState<IFormError[]>([]);
  const { getColoniesByZipCode } = locationStore;
  const { openModal, closeModal } = modalStore;
  const [colonies, setColonies] = useState<IOptions[]>([]);
  const [continuar, SetContinuar] = useState<boolean>(true);
  const goBack = () => {
    searchParams.delete("mode");
    setSearchParams(searchParams);
    navigate(`/${views.proceeding}?${searchParams}`);
    clearTax();
    closeModal();
  };
  const convertSolicitud = (dataC: IAppointmentForm) => {
    var request: ISolicitud = {
      Id: dataC.id,
      ExpedienteId: dataC.expedienteid!,
      SucursalId: profile?.sucursal!,
      Clave: dataC.nomprePaciente,
      ClavePatologica: "",
      UsuarioId: "00000000-0000-0000-0000-000000000000",
      General: {
        solicitudId: "00000000-0000-0000-0000-000000000000",
        expedienteId: dataC.expedienteid!,
        procedencia: 0,
        compañiaId: dataC.generales?.compañia!,
        medicoId: dataC.generales?.medico!,
        afiliacion: "",
        urgencia: 0,
        metodoEnvio: [],
        correo: dataC.generales?.email!,
        whatsapp: dataC.generales?.whatssap!,
        observaciones: dataC.generales?.observaciones!,
      },
      Estudios: dataC.estudy!,
    };
    createsolictud(request);
  };
  const convertSolicitudCot = (
    dataC: IQuotationInfo,
    dataG: IQuotationGeneral
  ) => {
    var request: ISolicitud = {
      Id: dataC.cotizacionId,
      ExpedienteId: values.expediente,
      SucursalId: profile?.sucursal!,
      Clave: dataC.paciente,
      ClavePatologica: "",
      UsuarioId: "00000000-0000-0000-0000-000000000000",
      General: {
        solicitudId: "00000000-0000-0000-0000-000000000000",
        expedienteId: values.expediente!,
        procedencia: 0,
        compañiaId: dataG.compañiaId,
        medicoId: dataG.medicoId,
        afiliacion: "",
        urgencia: 0,
        metodoEnvio: [],
        correo: dataG.correo,
        whatsapp: dataG.whatsapp,
        observaciones: dataG.observaciones,
      },
      Estudios: [],
    };
    createsolictud(request);
  };
  const clearLocation = () => {
    form.setFieldsValue({
      estado: undefined,
      municipio: undefined,
      colonia: undefined,
    });
    setColonies([]);
  };

  useEffect(() => {
    const readExpedinte = async (id: string) => {
      setLoading(true);

      var expediente = await getById(id);
      var searchQ: IQuotationFilter = {
        expediente: expediente?.expediente,
      };
      var searchC: ISearchAppointment = {
        expediente: expediente?.expediente!,
        nombre: "",
        fecha: [],
        tipo: "laboratorio",
      };
      var citaslab = await getAllLab(searchC);
      var citasdom = await getAllDom(searchC);
      var citasall = citaslab?.concat(citasdom!);
      SetCitas(citasall!);
      await getAllQ(searchQ);
      await getByFilter({
        expediente: expediente?.expediente,
      });
      await getQuotations({
        expediente: expediente?.expediente,
      });
      const location = await getColoniesByZipCode(expediente?.cp!);
      if (location) {
        setColonies(
          location.colonias.map((x) => ({
            value: x.id,
            label: x.nombre,
          }))
        );
      } else {
        clearLocation();
      }
      form.setFieldsValue({
        ...expediente!,
        fechaNacimiento: moment(expediente?.fechaNacimiento),
      });
      console.log("expediente", toJS(expediente));
      setTax(expediente?.taxData!);
      setValues(expediente!);
      setLoading(false);
    };

    if (id) {
      readExpedinte(id);
    }
  }, [id, getById]);

  useEffect(() => {
    console.log(searchParams.get("mode"));
    if (!profile?.admin) {
      form.setFieldsValue({ sucursal: profile?.sucursal });
    }
  });

  useEffect(() => {
    const readData = async (search: ISearchMedical) => {
      await getnow(search);
    };

    readData(search);
  }, [search, getnow]);
  useEffect(() => {
    const readData = async (_search: ISearchMedical) => {
      await getBranchOptions();
    };

    readData(search);
  }, [getBranchOptions]);
  const setEditMode = () => {
    navigate(`/${views.proceeding}/${id}?${searchParams}&mode=edit`);
    setReadonly(false);
  };
  const calcularEdad = (fecha: Moment) => {
    var hoy = new Date();
    var cumpleanos = fecha.toDate();
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    // form.setFieldsValue({ edad: edad });
    return edad;
  };

  const onValuesChange = async (changedValues: any) => {
    setErrors([]);
    const field = Object.keys(changedValues)[0];
    if (field == "edad") {
      const edad = changedValues[field] as number;
      var hoy = new Date();
      var cumpleaños = hoy.getFullYear() - edad;
      hoy.setFullYear(cumpleaños);
      form.setFieldsValue({ fechaNacimiento: moment(hoy) });
    }
    if (field == "fechaNacimiento") {
      const edad = changedValues[field];
      // calcularEdad(edad);
      form.setFieldsValue({ edad: "" + calcularEdad(edad) });
    }
    if (field === "cp") {
      const zipCode = changedValues[field] as string;

      if (zipCode && zipCode.trim().length === 5) {
        const location = await getColoniesByZipCode(zipCode);
        if (location) {
          form.setFieldsValue({
            estado: location.estado,
            municipio: location.ciudad,
          });
          setColonies(
            location.colonias.map((x) => ({
              value: x.id,
              label: x.nombre,
            }))
          );
        } else {
          clearLocation();
        }
      } else {
        clearLocation();
      }
    }
  };

  const setPage = (page: number) => {
    const priceList = expedientes[page - 1];
    navigate(`/${views.proceeding}/${priceList.id}?${searchParams}`);
  };
  const getPage = (id: string) => {
    return expedientes.findIndex((x) => x.id === id) + 1;
  };
  const continues = async (cont: boolean) => {
    SetContinuar(cont);
  };
  const activarMonedero = async () => {
    // setMonedero(true);
    if (values.id) {
      setLoading(true);
      await activateWallet(values.id);
      setLoading(false);
    }
  };
  const onFinish = async (newValues: IProceedingForm) => {
    setLoading(true);
    var coincidencia = await coincidencias(newValues);
    const reagent = { ...values, ...newValues };

    if (reagent.nombre == "" || reagent.apellido == "" || reagent.sexo == "") {
      alerts.warning("El nombre y sexo no pueden estar vacíos");
    }
    console.log("REAGENT NEW ", toJS(reagent));
    if (reagent.colonia) {
    }
    if (coincidencia.length > 0 && !reagent.id!) {
      openModal({
        title: "Se encuentran coincidencias con los siguientes expedientes",
        body: (
          <Concidencias
            handle={async () => {
              setLoading(true);
              let success = false;
              console.log(tax, "tax");
              var taxdata: ITaxData[] = [];

              for (let element of tax) {
                if (!element.id || element.id.startsWith("tempId")) {
                  delete element.id;
                  taxdata.push(element);
                } else {
                  taxdata.push(element);
                }
              }
              reagent.taxData = taxdata;
              console.log("taxData", taxdata);

              if (!reagent.id) {
                success = (await create(reagent)) != null;
              } else {
                success = await update(reagent);
              }
              setLoading(false);
              if (success) {
                goBack();
              }
            }}
            expedientes={coincidencia}
            handleclose={async () => {
              setReadonly(true);

              setLoading(false);
            }}
            printing={false}
          ></Concidencias>
        ),

        closable: true,
        width: "55%",
        onClose() {
          setLoading(false);
        },
      });
    } else {
      let success = false;
      var taxdata: ITaxData[] = [];

      for (let element of tax) {
        if (!element.id || element.id.startsWith("tempId")) {
          delete element.id;
          taxdata.push(element);
        } else {
          taxdata.push(element);
        }
      }
      console.log("taxData", toJS(tax));
      reagent.taxData = taxdata;
      console.log("taxData", taxdata);
      if (!reagent.id) {
        success = (await create(reagent)) != null;
      } else {
        success = await update(reagent);
      }
      setLoading(false);
      if (success) {
        goBack();
      }
    }
  };

  const columnsP: IColumns<IQuotationInfo> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        width: 200,
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value, cotizacion) => (
        <Button
          type="link"
          onClick={() => {
            navigate(
              `/${views.quotation}/${cotizacion.cotizacionId}?${searchParams}&mode=readonly`
            );
          }}
        >
          {value}
        </Button>
      ),
    },
    {
      ...getDefaultColumnProps("paciente", "Nombre del paciente", {
        width: 200,
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("estudios", "Estudios", {
        width: 150,
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value, record, index) => (
        <Row align="middle">
          {value.map((x: any, i: any) => (
            <Col
              key={x.clave + "-" + x.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              <ContainerBadge color={"grey"} text={x.clave} />
            </Col>
          ))}
        </Row>
      ),
    },
    {
      ...getDefaultColumnProps("correo", "Email", {
        width: 150,
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("whatsapp", "Whatsapp", {
        width: 100,
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("fecha", "Fecha", {
        width: 200,
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },

    {
      ...getDefaultColumnProps("expediente", "Expediente", {
        width: 100,
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },

    {
      key: "editar",
      dataIndex: "id",
      title: "Editar",
      align: "center",
      width: 200,
      render: (_value, cotizacion) => (
        <IconButton
          disabled={readonly}
          title="Editar Expediente"
          icon={<EditOutlined />}
          onClick={() => {
            navigate(
              `/${views.quotation}/${cotizacion.cotizacionId}?${searchParams}&mode=edit`
            );
          }}
        />
      ),
    },
    {
      key: "convertir",
      dataIndex: "id",
      title: "Convertir",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (_value, item) => (
        <Button
          type="primary"
          title=""
          onClick={async () => {
            console.log("item", toJS(item));
            await convertToRequest(item.cotizacionId);
            await cancelQuotation(item.cotizacionId);
            await getByFilter({
              expediente: item?.expediente,
            });
            await getQuotations({
              expediente: item?.expediente,
            });
          }}
          disabled={!item?.activo}
        >
          Convertir a solicitud
        </Button>
      ),
    },
  ];

  const columns: IColumns<IRequestInfo> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        width: 150,
      }),
      render: (value, item) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button
            type="link"
            onClick={() => {
              navigate(
                `/${views.request}/${item.expedienteId}/${item.solicitudId}`
              );
            }}
          >
            {value}
          </Button>

          <small>{item.clavePatologica}</small>
        </div>
      ),
    },
    {
      ...getDefaultColumnProps("afiliacion", "Afiliación", {
        width: 180,
      }),
    },
    {
      ...getDefaultColumnProps("paciente", "Paciente", {
        width: 240,
      }),
      ellipsis: {
        showTitle: false,
      },
    },
    {
      ...getDefaultColumnProps("compañia", "Compañia", {
        width: 180,
      }),
      ellipsis: {
        showTitle: false,
      },
    },
    {
      ...getDefaultColumnProps("procedencia", "Procedencia", {
        width: 180,
      }),
      ellipsis: {
        showTitle: false,
      },
    },
    {
      ...getDefaultColumnProps("importe", "Importe", {
        width: 120,
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
    {
      ...getDefaultColumnProps("descuento", "Descuento", {
        width: 120,
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
    {
      ...getDefaultColumnProps("total", "Total", {
        width: 120,
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
    {
      ...getDefaultColumnProps("saldo", "Saldo", {
        width: 120,
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
  ];
  const columnsC: IColumns<any> = [
    {
      ...getDefaultColumnProps("noSolicitud", "Solicitud de cita", {
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (_value, _item) => (
        <div></div>
        /*         <Link
                  draggable
          onDragStart={() => {
            SetCita(item);
          }} 
        >
          {value}
        </Link> */
      ),
    },
    {
      ...getDefaultColumnProps("expediente", "Expediente", {
        width: "10%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("fecha", "Fecha", {
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value) => moment(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      ...getDefaultColumnProps("direccion", "Dirección", {
        width: "20%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre", {
        width: "20%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("info", "Datos", {
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (_, data) => (
        <div>{`${data.edad} años, ${data.sexo.substring(0, 1)}`}</div>
      ),
    },
    {
      key: "editar",
      dataIndex: "id",
      title: "Editar",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (value, item) => (
        <IconButton
          title="Editar cita"
          icon={<EditOutlined />}
          disabled={readonly}
          onClick={() => {
            navigate(
              `/${views.appointment}/${value}?type=${item.type}&mode=edit`
            );
          }}
        />
      ),
    },
    {
      key: "editar",
      dataIndex: "id",
      title: "Editar",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (_value, item) => (
        <Button
          type="primary"
          title=""
          disabled={readonly}
          onClick={async () => {
            if (item.type == "laboratorio") {
              // const convert: IConvertToRequest = {
              //   id: item.id,
              //   type: "Laboratorio",
              // };
              // convertirASolicitud(convert);
              var citas = await getByIdLab(item.id);
              convertSolicitud(citas!);
            } else {
              // const convert: IConvertToRequest = {
              //   id: item.id,
              //   type: "Dom",
              // };
              // convertirASolicitud(convert);
              var citas = await getByIdDom(item.id);
              convertSolicitud(citas!);
            }
          }}
        >
          Convertir a solicitud
        </Button>
      ),
    },
  ];
  const spinnerText = () => {
    return isPrinting ? "Imprimiendo..." : "Cargando...";
  };

  return (
    <Spin spinning={loading || printing} tip={printing ? spinnerText() : ""}>
      <Row style={{ marginBottom: 24 }}>
        {!!id && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "left" }}>
            <Pagination
              size="small"
              total={expedientes?.length ?? 0}
              pageSize={1}
              current={getPage(id)}
              onChange={setPage}
            />
          </Col>
        )}
        {!readonly && (
          <Col md={id ? 12 : 24} sm={24} xs={12} style={{ textAlign: "right" }}>
            <Button onClick={goBack}>Cancelar</Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                form.submit();
              }}
            >
              Guardar
            </Button>
          </Col>
        )}
        {readonly && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "right" }}>
            <ImageButton
              key="edit"
              title="Editar"
              image="editar"
              onClick={setEditMode}
            />
          </Col>
        )}
      </Row>
      <div style={{ display: printing ? "" : "none", height: 300 }}></div>
      <div style={{ display: printing ? "none" : "" }}>
        <div ref={componentRef}>
          {printing && (
            <PageHeader
              ghost={false}
              title={<HeaderTitle title="Expediente" />}
              className="header-container"
            ></PageHeader>
          )}
          {printing && <Divider className="header-divider" />}
          <Form<IProceedingForm>
            {...formItemLayout}
            onFinish={onFinish}
            onValuesChange={onValuesChange}
            form={form}
            size="small"
            onFinishFailed={({ errorFields }) => {
              const errors = errorFields.map((x) => ({
                name: x.name[0].toString(),
                errors: x.errors,
              }));
              setErrors(errors);
            }}
          >
            <Row gutter={[0, 12]}>
              <Col span={12}>
                <Form.Item
                  label="Nombre"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  className="no-error-text"
                  help=""
                  required
                >
                  <Input.Group>
                    <Row gutter={8}>
                      <Col span={12}>
                        <TextInput
                          formProps={{
                            name: "nombre",
                            label: "Nombre(s)",
                            noStyle: true,
                          }}
                          max={500}
                          showLabel
                          readonly={readonly}
                          required
                        />
                      </Col>
                      <Col span={12}>
                        <TextInput
                          formProps={{
                            name: "apellido",
                            label: "Apellido(s)",
                            noStyle: true,
                          }}
                          max={500}
                          showLabel
                          readonly={readonly}
                          required
                        />
                      </Col>
                    </Row>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col span={8}>
                <TextInput
                  formProps={{
                    name: "correo",
                    label: "E-Mail",
                    labelCol: { span: 6 },
                    wrapperCol: { span: 18 },
                  }}
                  type="email"
                  max={100}
                  errors={errors.find((x) => x.name === "correo")?.errors}
                  readonly={readonly}
                />
              </Col>
              <Col span={4}>
                <TextInput
                  formProps={{
                    name: "expediente",
                    label: "Exp",
                  }}
                  max={500}
                  // readonly={readonly}
                  readonly={true}
                />
              </Col>
              <Col span={4}>
                <SelectInput
                  formProps={{
                    name: "sexo",
                    label: "Sexo",
                    labelCol: { span: 12 },
                    wrapperCol: { span: 12 },
                  }}
                  options={[
                    { label: "F", value: "F" },
                    { label: "M", value: "M" },
                  ]}
                  readonly={readonly}
                  required
                />
              </Col>
              <Col span={8}>
                <DateInput
                  formProps={{
                    name: "fechaNacimiento",
                    label: "Fecha Nacimiento",
                    labelCol: { span: 12 },
                    wrapperCol: { span: 12 },
                  }}
                  disableAfterDates={true}
                  readonly={readonly}
                  required
                />
              </Col>
              <Col span={4}>
                <TextInput
                  formProps={{
                    name: "edad",
                    label: "Edad",
                    labelCol: { span: 12 },
                    wrapperCol: { span: 12 },
                  }}
                  max={3}
                  suffix="años"
                  readonly={readonly}
                  required
                />
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Contacto"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  help=""
                  className="no-error-text"
                >
                  <Input.Group>
                    <Row gutter={8}>
                      <Col span={12}>
                        <MaskInput
                          formProps={{
                            name: "telefono",
                            label: "Teléfono",
                            noStyle: true,
                          }}
                          mask={[
                            /[0-9]/,
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                          ]}
                          validator={(_, value: any) => {
                            if (!value || value.indexOf("_") === -1) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              "El campo debe contener 10 dígitos"
                            );
                          }}
                          readonly={readonly}
                        />
                      </Col>
                      <Col span={12}>
                        <MaskInput
                          formProps={{
                            name: "celular",
                            label: "Celular",
                          }}
                          mask={[
                            /[0-9]/,
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                            "-",
                            /[0-9]/,
                            /[0-9]/,
                          ]}
                          validator={(_, value: any) => {
                            if (!value || value.indexOf("_") === -1) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              "El campo debe contener 10 dígitos"
                            );
                          }}
                          readonly={readonly}
                        />
                      </Col>
                    </Row>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Dirección"
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 22 }}
                  help=""
                  className="no-error-text"
                >
                  <Input.Group>
                    <Row gutter={8}>
                      <Col span={2}>
                        <TextInput
                          formProps={{
                            name: "cp",
                            label: "CP",
                            noStyle: true,
                          }}
                          max={5}
                          min={5}
                          onChange={(e) => {
                            let valu = e.target.value;
                            if (!Number(valu)) {
                              form.setFieldValue(
                                "cp",
                                valu.substring(0, valu.length - 1)
                              );

                              return;
                            }
                            form.setFieldValue("cp", valu);
                          }}
                          showLabel
                          readonly={readonly}
                          errors={errors.find((x) => x.name === "cp")?.errors}
                        />
                      </Col>
                      <Col span={4}>
                        <TextInput
                          formProps={{
                            name: "estado",
                            label: "Estado",
                            noStyle: true,
                          }}
                          max={500}
                          showLabel
                          readonly={readonly}
                        />
                      </Col>
                      <Col span={5}>
                        <TextInput
                          formProps={{
                            name: "municipio",
                            label: "Municipio",
                            noStyle: true,
                          }}
                          max={500}
                          showLabel
                          readonly={readonly}
                        />
                      </Col>
                      <Col span={6}>
                        <SelectInput
                          formProps={{
                            name: "colonia",
                            label: "Colonia",
                            noStyle: true,
                          }}
                          showLabel
                          options={colonies}
                          readonly={readonly}
                        />
                      </Col>
                      <Col span={7}>
                        <TextInput
                          formProps={{
                            name: "calle",
                            label: "Calle",
                            noStyle: true,
                          }}
                          max={500}
                          showLabel
                          readonly={readonly}
                        />
                      </Col>
                    </Row>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col span={16} style={{ textAlign: "end" }}>
                <Button
                  onClick={() =>
                    openModal({
                      title: "Seleccionar o Ingresar Datos Fiscales",
                      body: <DatosFiscalesForm />,
                      width: 900,
                    })
                  }
                  style={{
                    backgroundColor: "#6EAA46",
                    color: "white",
                    borderColor: "#6EAA46",
                  }}
                  disabled={readonly}
                >
                  Datos Fiscales
                </Button>
              </Col>
              <Col span={8}>
                <SelectInput
                  formProps={{
                    name: "sucursal",
                    label: "Sucursal",
                    labelCol: { span: 6 },
                    wrapperCol: { span: 18 },
                  }}
                  options={BranchOptions}
                  required
                  readonly={readonly}
                />
              </Col>
            </Row>
          </Form>
          {searchParams.get("mode") === "edit" ||
          searchParams.get("mode") === "readonly" ? (
            <div>
              <Row>
                <Col span={6}>
                  <Button
                    style={{
                      marginTop: "20px",
                      marginLeft: "70%",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      navigate(`/requests/${id}`);
                    }}
                    type="primary"
                    disabled={readonly}
                  >
                    Agregar solicitud
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    style={{
                      marginTop: "20px",
                      marginLeft: "70%",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      navigate(`/cotizacion/new?&mode=edit&exp=${id}`);
                    }}
                    type="primary"
                    disabled={readonly}
                  >
                    Agregar cotización
                  </Button>
                </Col>
                <Col span={6}>
                  <Button
                    style={{
                      marginTop: "20px",
                      marginLeft: "70%",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      navigate(`/appointments`);
                    }}
                    type="primary"
                    disabled={readonly}
                  >
                    Agregar cita
                  </Button>
                </Col>
                <Col span={6}>
                  {values.hasWallet ? (
                    <Card
                      style={{
                        marginTop: "20px",
                        marginLeft: "10%",
                        marginBottom: "20px",
                      }}
                      bodyStyle={{
                        backgroundColor: "rgba(255, 255, 0, 1)",
                        border: 0,
                      }}
                    >
                      <p>Monedero Electronico: {values.wallet}</p>
                    </Card>
                  ) : (
                    ""
                  )}
                  <Button
                    style={{
                      marginTop: "20px",
                      marginLeft: "30%",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      activarMonedero();
                    }}
                    type="primary"
                    disabled={values.hasWallet || readonly}
                  >
                    Activar monedero
                  </Button>
                </Col>
              </Row>
              <Divider orientation="left">Solicitud</Divider>
              <Table<IRequestInfo>
                rowKey={(record) => record.solicitudId}
                loading={loading || printing}
                size="small"
                columns={columns}
                dataSource={[...requests]}
                /*    pagination={defaultPaginationProperties} */
                sticky
                scroll={{
                  x: windowWidth < resizeWidth ? "max-content" : "auto",
                }}
              />
              <Divider orientation="left">Presupuestos</Divider>
              <Table<IQuotationInfo>
                loading={loading || printing}
                size="small"
                rowKey={(record) => record.clave}
                columns={columnsP}
                dataSource={quotations}
                /*    pagination={defaultPaginationProperties} */
                sticky
                scroll={{
                  x: windowWidth < resizeWidth ? "max-content" : "auto",
                }}
              />
              <Divider orientation="left">Cita</Divider>
              <Table<any>
                loading={loading || printing}
                size="small"
                rowKey={(record) => record.id}
                columns={columnsC}
                dataSource={citas}
                sticky
                scroll={{
                  x: windowWidth < resizeWidth ? "max-content" : "auto",
                }}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </Spin>
  );
};

const ContainerBadge = ({ color, text }: { color: string; text?: string }) => {
  return <Tag color={color}>{text}</Tag>;
};

export default observer(ProceedingForm);
