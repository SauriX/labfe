import "./css/changeStatus.less";
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Descriptions,
  Form,
  Input,
  Row,
  Spin,
} from "antd";
import React, { FC, Fragment, useEffect, useState } from "react";
import {
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../app/common/table/utils";
import useWindowDimensions from "../../app/util/window";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import { IUpdate } from "../../app/models/sampling";
import { formItemLayout } from "../../app/util/utils";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import DateRangeInput from "../../app/common/form/proposal/DateRangeInput";
import TextInput from "../../app/common/form/proposal/TextInput";
import { getExpandableConfig } from "../report/utils";
import { ExpandableConfig } from "antd/lib/table/interface";
import ImageButton from "../../app/common/button/ImageButton";
import { originOptions, urgencyOptions } from "../../app/stores/optionStore";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import alerts from "../../app/util/alerts";
import PrintIcon from "../../app/common/icons/PrintIcon";
import {
  ISearchValidation,
  Ivalidationlist,
  searchValues,
} from "../../app/models/resultValidation";
import moment from "moment";
import ValidationTableStudy from "./ValidationTableStudy";
import ValidationStudyColumns, {
  ValidationStudyExpandable,
} from "./ValidationStudyTable";
import { IOptions } from "../../app/models/shared";
import { checked } from "../../app/models/relaseresult";
const { Panel } = Collapse;
type ProceedingTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};

const ResultValidationTable: FC<ProceedingTableProps> = ({
  componentRef,
  printing,
}) => {
  const {
    procedingStore,
    optionStore,
    locationStore,
    resultValidationStore,
  } = useStore();

  const { expedientes } = procedingStore;
  const {
    branchCityOptions,
    getBranchCityOptions,
    getareaOptions,
    medicOptions,
    getMedicOptions,
    getCityOptions,
    getDepartmentOptions,
    companyOptions,
    getCompanyOptions,
    studiesOptions,
    getStudiesOptions,
    departmentAreaOptions,
    getDepartmentAreaOptions,
  } = optionStore;

  const {
    getAll,
    studys,
    printTicket,
    update,
    setSoliCont,
    setStudyCont,
    soliCont,
    studyCont,
    viewTicket,
    setSearch,
    clearFilter,
    search,
  } = resultValidationStore;

  const [departmentOptions, setDepartmentOptions] = useState<IOptions[]>([]);
  const { getCity } = locationStore;
  const [form] = Form.useForm<ISearchValidation>();
  const selectedDepartment = Form.useWatch("departament", form);

  const [updateData, setUpdateDate] = useState<IUpdate[]>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [solicitudesData, SetSolicitudesData] = useState<string[]>([]);

  const [expandable, setExpandable] =
    useState<ExpandableConfig<Ivalidationlist>>();
  const [expandedRowKeys, setexpandedRowKeys] = useState<string[]>([]);
  const [visto, setvisto] = useState<checked[]>([]);
  const [activar, setActivar] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [activiti, setActiviti] = useState<string>("");
  const [openRows, setOpenRows] = useState<boolean>(false);
  const [areaOptions, setAreaOptions] = useState<IOptions[]>([]);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  useEffect(() => {
    getDepartmentAreaOptions();
  }, [getDepartmentAreaOptions]);
  const selectedCity = Form.useWatch("ciudad", form);

  useEffect(() => {
    setDepartmentOptions(
      departmentAreaOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [departmentAreaOptions]);

  useEffect(() => {
    setAreaOptions(
      departmentAreaOptions.find((x) => x.value === selectedDepartment)
        ?.options ?? []
    );
    form.setFieldValue("sucursalId", []);
  }, [departmentAreaOptions, form, selectedDepartment]);

  useEffect(() => {
    const readStudy = async () => {
      await getStudiesOptions();
    };
    readStudy();
  }, [getStudiesOptions]);

  useEffect(() => {}, [studiesOptions]);

  useEffect(() => {
    setexpandedRowKeys(studys?.map((x) => x.id) ?? []);
    setOpenRows(true);
  }, [studys]);

  const onChange = (e: CheckboxChangeEvent, id: number, solicitud: string) => {
    var data = ids;
    var solis = solicitudesData;
    var dataid: number[] = [];
    var dataupdate = updateData;
    if (e.target.checked) {
      data.push(id);
      dataid.push(id);
      setIds(data);
      let temp = solicitudesData.filter((x) => x == solicitud);
      let temp2 = dataupdate!.filter((x) => x.solicitudId == solicitud);
      if (temp2.length <= 0) {
        let datatoupdate: IUpdate = {
          solicitudId: solicitud,
          estudioId: dataid,
        };
        dataupdate?.push(datatoupdate);
      } else {
        let solicitudtoupdate = dataupdate?.filter(
          (x) => x.solicitudId == solicitud
        )[0];
        let count = solicitudtoupdate?.estudioId!.filter((x) => x == id);
        if (count!.length <= 0) {
          solicitudtoupdate?.estudioId.push(id);
          let indexsoli = dataupdate?.findIndex(
            (x) => x.solicitudId == solicitud
          );
          dataupdate[indexsoli!] = solicitudtoupdate;
        }
      }
      if (temp.length <= 0) {
        solis.push(solicitud);
        SetSolicitudesData(solis);
      }
    } else {
      if (data.length > 0) {
        var temp = data.filter((x) => x != id);
        var temps = solis.filter((x) => x != solicitud);
        setIds(temp);
        //SetSolicitudesData();
      }
      let solicitudtoupdate = dataupdate?.filter(
        (x) => x.solicitudId == solicitud
      )[0];
      if (solicitudtoupdate.estudioId.length == 1) {
        dataupdate = dataupdate.filter((x) => x.solicitudId != solicitud);
      } else {
        let count = solicitudtoupdate?.estudioId!.filter((x) => x == id);
        if (count!.length > 0) {
          let estudios = solicitudtoupdate?.estudioId.filter((x) => x != id);
          solicitudtoupdate.estudioId = estudios;
          let indexsoli = dataupdate?.findIndex(
            (x) => x.solicitudId == solicitud
          );
          dataupdate[indexsoli!] = solicitudtoupdate;
        }
      }
    }

    if (dataupdate.length <= 0) {
      setActivar(false);
    } else {
      setActivar(true);
    }

    setUpdateDate(dataupdate);
  };
 const alerta = (e: CheckboxChangeEvent, id: number, solicitud: string)=>{

  alerts.confirm(
    "",
    `“Al liberar este estudio se realizará el envío automático por lo cual no puede cancelarse su liberación, ¿Esta de acuerdo con la liberación?`,
    async () => {
        onChange(e,id,solicitud);
    },
    () => {
      
    }
  );
 }
 const verfiy  = (e: CheckboxChangeEvent, id: number, solicitud: string) =>{
  let request =  studys.find(x => x.solicitud === solicitud);
  let updatedata = updateData.find(x=>x.solicitudId === request?.id);
  let totalStudios = request?.estudios.length;
  let estudiosxliberar = request?.estudios.filter(x=>x.estatus !== 4 && x.estatus !== 7).length;
  if(activiti=="cancel"){
    onChange(e,id,solicitud);
  }else{
    
    if(updatedata != null || updatedata != undefined){
      if((updatedata?.estudioId.length + 1) === totalStudios){
        alerta(e,id,solicitud);
      }else{
        if(estudiosxliberar === (updatedata?.estudioId.length + 1)){
          alerta(e,id,solicitud);
        }else{
          onChange(e,id,solicitud);
        }
        
      }    
    }else{
      if(totalStudios ===1 ){
        alerta(e,id,solicitud);
      }else{
      onChange(e,id,solicitud);}
    }
  }




}

  const updatedata = async () => {
    setLoading(true);

    setLoading(false);
    alerts.confirm(
      "",
      `Se ha(n) enviado ${ids.length} estudio(s) de ${
        solicitudesData.length
      } solicitud(es) a estatus ${
        activiti == "register" ? "validado" : "capturado"
      } de manera exitosa `,
      async () => {
        var succes = await update(updateData!);
        if (succes) {
          await getAll(search);
          setUpdateDate([]);
          setIds([]);
          setActivar(false);
          SetSolicitudesData([]);
        } else {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );
    setIds([]);
    SetSolicitudesData([]);
  };

  const expandableStudyConfig = {
    expandedRowRender: (item: Ivalidationlist) => (
      <div>
        <h4>Estudios</h4>

        {item.estudios.map((x) => {
          return (
            <>
              <Descriptions
                size="small"
                bordered
                layout="vertical"
                style={{ marginBottom: 5 }}
                column={7}
              >
                <Descriptions.Item
                  label="Estudio"
                  style={{ maxWidth: 30, color: "#000000" }}
                >
                  {x.study}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Estatus"
                  style={{ maxWidth: 30, color: "#000000" }}
                >
                  {x.status == "1" ? "Pendiente" : "Toma de muestra"}
                </Descriptions.Item>
                <Descriptions.Item label="Registro" style={{ maxWidth: 30 }}>
                  {moment(x.registro).format("DD/MM/YYYY-h:mmA")}
                </Descriptions.Item>
                <Descriptions.Item label="Entrega" style={{ maxWidth: 30 }}>
                  {moment(x.entrega).format("DD/MM/YYYY-h:mmA")}
                </Descriptions.Item>
                <Descriptions.Item label="" style={{ maxWidth: 30 }}>
                  {x.status == "4" && activiti == "register" && (
                    <Checkbox onChange={(e) => onChange(e, x.id, item.id)}>
                      Selecciona
                    </Checkbox>
                  )}
                  {x.status == "5" && activiti == "cancel" && (
                    <Checkbox onChange={(e) => onChange(e, x.id, item.id)}>
                      Selecciona
                    </Checkbox>
                  )}
                  <PrintIcon
                    key="print"
                    onClick={() => {
                      printTicket(item.order, item.id);
                    }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </>
          );
        })}
      </div>
    ),
    rowExpandable: () => true,
  };
  const [branchOptions, setBranchOptions] = useState<IOptions[]>([]);
  const [cityOptions, setCityOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    const readData = async () => {
      await getBranchCityOptions();
      await getareaOptions(0);
      await getMedicOptions();
      await getCityOptions();
      await getDepartmentOptions();
      await getCompanyOptions();
    };

    readData();
  }, [getBranchCityOptions]);
  useEffect(() => {
    const readData = async () => {
      await getCity();
    };
    readData();
  }, [getCity]);

  useEffect(() => {
    const readPriceList = async () => {
      setLoading(true);
      let studios = [];
      var datas = await getAll(search!);

      setSoliCont(datas?.length!);
      datas?.forEach((x) =>
        x.estudios.forEach((x: any) => {
          studios.push(x);
        })
      );
      setStudyCont(studios.length);
      setStudyCont(studios.length);
      setLoading(false);
    };

    if (expedientes.length === 0) {
      readPriceList();
    }

    setExpandable(expandableStudyConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAll]);

  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);

  useEffect(() => {
    if (selectedCity != undefined && selectedCity != null) {
      var branhces = branchCityOptions.filter((x) =>
        selectedCity.includes(x.value.toString())
      );
      var options = branhces.flatMap((x) =>
        x.options == undefined ? [] : x.options
      );
      setBranchOptions(options);
    }
    form.setFieldValue("sucursalId", []);
  }, [branchCityOptions, form, selectedCity]);

  const onExpand = (isExpanded: boolean, record: Ivalidationlist) => {
    let expandRows: string[] = expandedRowKeys;
    if (isExpanded) {
      expandRows.push(record.id);
    } else {
      const index = expandRows.findIndex((x) => x === record.id);
      if (index > -1) {
        expandRows.splice(index, 1);
      }
    }
    setexpandedRowKeys(expandRows);
  };
  useEffect(() => {
    setExpandable(expandableStudyConfig);
  }, [activiti]);

  const onFinish = async (newValues: ISearchValidation) => {
    setLoading(true);

    const searchValidation = { ...search, ...newValues };
    setSearch(searchValidation);
    var data = await getAll(searchValidation);
    let studios = [];

    setSoliCont(data?.length!);
    data?.forEach((x) =>
      x.estudios.forEach((x: any) => {
        studios.push(x);
      })
    );
    setStudyCont(studios.length);
    setLoading(false);
  };

  const register = () => {
    setActiviti("register");
    setUpdateDate([]);
    setIds([]);
    setActivar(false);
  };
  const cancel = () => {
    setActiviti("cancel");
    setUpdateDate([]);
    setIds([]);
    setActivar(false);
  };
  const columns: IColumns<Ivalidationlist> = [
    {
      ...getDefaultColumnProps("solicitud", "Clave", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre", {
        searchState,
        setSearchState,
        width: "30%",
      }),
    },
    {
      ...getDefaultColumnProps("registro", "Registro", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
    {
      ...getDefaultColumnProps("sucursal", "Sucursal", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },
    {
      ...getDefaultColumnProps("edad", "Edad", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },
    {
      ...getDefaultColumnProps("sexo", "Sexo", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },

    {
      ...getDefaultColumnProps("compañia", "Compañia", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
  ];

  return (
    <Fragment>
      <Spin spinning={loading} tip={printing ? "Imprimiendo" : ""}>
        <Row justify="end" gutter={[24, 12]} className="filter-buttons">
          <Col span={24}>
            <Button
              key="clean"
              onClick={(e) => {
                clearFilter();
                form.setFieldsValue(new searchValues());
              }}
            >
              Limpiar
            </Button>
            <Button
              key="filter"
              type="primary"
              onClick={(e) => {
                form.submit();
              }}
            >
              Filtrar
            </Button>
          </Col>
        </Row>
        <div className="status-container">
          <Form<ISearchValidation>
            {...formItemLayout}
            form={form}
            name="sampling"
            initialValues={search}
            onFinish={onFinish}
            scrollToFirstError
          >
            <Row>
              <Col span={24}>
                <Row justify="space-between" gutter={[12, 12]}>
                  <Col span={8}>
                    <DateRangeInput
                      formProps={{ label: "Fecha", name: "fecha" }}
                    />
                  </Col>
                  <Col span={8}>
                    <TextInput
                      formProps={{
                        name: "search",
                        label: "Buscar",
                      }}
                      autoFocus
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "tipoSoli",
                        label: "Tipo solicitud",
                      }}
                      multiple
                      options={urgencyOptions}
                    ></SelectInput>
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "estudio",
                        label: "Estudios",
                      }}
                      multiple
                      options={studiesOptions}
                    ></SelectInput>
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "estatus",
                        label: "Estatus",
                      }}
                      multiple
                      options={[
                        { value: 5, label: "Validado" },
                        { value: 4, label: "Capturado" },
                        { value: 7, label: "Enviado" },
                      ]}
                    ></SelectInput>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Áreas" className="no-error-text" help="">
                      <Input.Group>
                        <Row gutter={8}>
                          <Col span={12}>
                            <SelectInput
                              formProps={{
                                name: "departament",
                                label: "Departamento",
                                noStyle: true,
                              }}
                              options={departmentOptions}
                            />
                          </Col>
                          <Col span={12}>
                            <SelectInput
                              formProps={{
                                name: "area",
                                label: "Área",
                                noStyle: true,
                              }}
                              options={areaOptions}
                            />
                          </Col>
                        </Row>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "medico",
                        label: "Médico",
                      }}
                      multiple
                      options={medicOptions}
                    ></SelectInput>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Sucursal"
                      className="no-error-text"
                      help=""
                    >
                      <Input.Group>
                        <Row gutter={8}>
                          <Col span={12}>
                            <SelectInput
                              form={form}
                              formProps={{
                                name: "ciudad",
                                label: "Ciudad",
                                noStyle: true,
                              }}
                              multiple
                              options={cityOptions}
                            />
                          </Col>
                          <Col span={12}>
                            <SelectInput
                              form={form}
                              formProps={{
                                name: "sucursal",
                                label: "Sucursales",
                                noStyle: true,
                              }}
                              multiple
                              options={branchOptions}
                            />
                          </Col>
                        </Row>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "compañia",
                        label: "Compañía",
                      }}
                      multiple
                      options={companyOptions}
                    ></SelectInput>
                  </Col>
                  <Col span={8}></Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
        <Row>
          <Col md={8}>
            <Button
              style={{ marginTop: "5px", marginBottom: "10px" }}
              type={activiti == "register" ? "primary" : "ghost"}
              onClick={register}
            >
              Registrar Validación
            </Button>
            <Button
              style={{
                marginTop: "5px",
                marginBottom: "10px",
                marginLeft: "10px",
              }}
              type={activiti == "cancel" ? "primary" : "ghost"}
              onClick={cancel}
            >
              Cancelar Validación
            </Button>
          </Col>
          <Col md={13}></Col>
          <Col md={3}>
            {activiti == "register" ? (
              <Button
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  marginLeft: "34%",
                }}
                type="primary"
                disabled={!activar}
                onClick={() => {
                  updatedata();
                }}
              >
                {activar ? "" : " "}
                Aceptar Validación
              </Button>
            ) : (
              ""
            )}
            {activiti == "cancel" ? (
              <Button
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  marginLeft: "30%",
                }}
                type="primary"
                disabled={!activar}
                onClick={() => {
                  updatedata();
                }}
              >
                {activar ? "" : " "}
                Cancelar Validación
              </Button>
            ) : (
              ""
            )}
          </Col>
        </Row>
        <Fragment>
          <ValidationTableStudy
            data={studys}
            columns={ValidationStudyColumns({ printTicket })}
            expandable={ValidationStudyExpandable({
              activiti,
              verfiy,
              viewTicket,
              visto,
              setvisto,
              updateData,
            })}
          />
        </Fragment>
      </Spin>
    </Fragment>
  );
};

export default observer(ResultValidationTable);
