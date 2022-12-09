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
  Table,
  Tag,
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
import {

  IUpdate,

} from "../../app/models/sampling";
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

import moment from "moment";
import ValidationTableStudy from "./RelaseTableStudy";
import ValidationStudyColumns, {
  ValidationStudyExpandable,
} from "./RelaseStudyTable";
import { IOptions } from "../../app/models/shared";
import { checked, Irelacelist, ISearchRelase, searchrelase } from "../../app/models/relaseresult";
import RelaseTableStudy from "./RelaseTableStudy";
const { Panel } = Collapse;
type ProceedingTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};
/* const studys =[{
  id:"string",
  solicitud:"string",
  nombre:"string",
  registro:"string",
  sucursal:"string",
  edad:"string",
  sexo:"string",
  compañia:"string",
  estudios:[{
      id:1,
      study:"string",
      area:"string",
      status:"string",
      registro:"string",
      entrega:"string",
      estatus :4,
      solicitudId:"string",
  }],
  order: "string",
  parcialidad:true
}] */
const RelaseResultTable: FC<ProceedingTableProps> = ({
  componentRef,
  printing,
}) => {
  const {
    procedingStore,
    optionStore,
    locationStore,
    resultValidationStore,
    relaseResultStore
  } = useStore();
  const { expedientes, getnow } = procedingStore;
  const {
    branchCityOptions,
    getBranchCityOptions,
    areas,
    getareaOptions,
    medicOptions,
    getMedicOptions,
    CityOptions,
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
  } = relaseResultStore;
  const [departmentOptions, setDepartmentOptions] = useState<IOptions[]>([]);
  const { getCity,  } = locationStore;
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<ISearchRelase>();
  let navigate = useNavigate();
  const [values, setValues] = useState<ISearchRelase>(new searchrelase());
  const [updateData, setUpdateDate] = useState<IUpdate[]>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [solicitudesData, SetSolicitudesData] = useState<string[]>([]);
  const { width: windowWidth } = useWindowDimensions();
  const [expandable, setExpandable] =
    useState<ExpandableConfig<Irelacelist>>();
  const [expandedRowKeys, setexpandedRowKeys] = useState<string[]>([]);
  const [visto, setvisto] = useState<checked[]>([]);
  const hasFooterRow = true;
  const [activar, setActivar] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [activiti, setActiviti] = useState<string>("");
  const [openRows, setOpenRows] = useState<boolean>(false);
  //const [search,SetSearch] = useState<ISearchMedical>(new SearchMedicalFormValues())
  const selectedDepartment = Form.useWatch("departament", form);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });
  useEffect(() => {

    getDepartmentAreaOptions();
  }, [

    getDepartmentAreaOptions,
  ]);
  const selectedCity = Form.useWatch("ciudad", form);
  useEffect(() => {
    const readStudy = async () => {
      await getStudiesOptions();
    };
    readStudy();
  }, [getStudiesOptions]);
  useEffect(() => {
    console.log(studiesOptions, "estudios");
  }, [studiesOptions]);
  const togleRows = () => {
    if (openRows) {
      setOpenRows(false);
      setexpandedRowKeys([]);
    } else {
      setOpenRows(true);
      setexpandedRowKeys(studys!.map((x) => x.id));
    }
  };
  useEffect(() => {
    setexpandedRowKeys(studys!.map((x) => x.id));
    setOpenRows(true);
  }, [studys]);

  const onChange = (e: CheckboxChangeEvent, id: number, solicitud: string) => {
    console.log("onchange");
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
    console.log(dataupdate.length, "onchange");
    if (dataupdate.length <= 0) {
      console.log("if");
      setActivar(false);
    } else {
      console.log("else");
      setActivar(true);
    }

    setUpdateDate(dataupdate);
  };
  const updatedata = async () => {
    setLoading(true);
    
    
      setLoading(false);
      alerts.confirm(
        "",
        `Se ha(n) enviado ${ids.length} estudio(s) de ${
          solicitudesData.length
        } solicitud(es) a estatus ${
          activiti == "register" ? "liberado" : "validado"
        } de manera exitosa `,
        async () => {
          var succes = await update(updateData!);
          if (succes) {
          await getAll(values);
          setUpdateDate([]);
          setIds([]);
          setActivar(false);
          SetSolicitudesData([]);
        } else {
          setLoading(false);
        }
        },
        ()=>{
          setLoading(false);
        }
      );
      setIds([]);
      SetSolicitudesData([]);

  };

  const expandableStudyConfig = {
    expandedRowRender: (item: Irelacelist) => (
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
  const [areaOptions, setAreaOptions] = useState<IOptions[]>([]);
  useEffect(() => {
    setDepartmentOptions(
      departmentAreaOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [departmentAreaOptions]);
  console.log("Table");
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
    console.log("here");
    const readPriceList = async () => {
      setLoading(true);
      let studios = [];
      var datas = await getAll(values!);

      console.log(datas, "daata");
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
    console.log(expandableStudyConfig, "config");
    setExpandable(expandableStudyConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAll]);
  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);
  useEffect(() => {
    setAreaOptions(
      departmentAreaOptions.find((x) => x.value === selectedDepartment)?.options ?? []
    );
    form.setFieldValue("sucursalId", []);
  }, [departmentAreaOptions, form, selectedDepartment]);
  useEffect(() => {
    setBranchOptions(
      branchCityOptions.find((x) => x.value === selectedCity)?.options ?? []
    );
    form.setFieldValue("sucursal", []);
  }, [branchCityOptions, form, selectedCity]);
  const onExpand = (isExpanded: boolean, record: Irelacelist) => {
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
    console.log(activiti, "useffect");
    setExpandable(expandableStudyConfig);
  }, [activiti]);
  const onFinish = async (newValues: ISearchRelase) => {
    setLoading(true);

    const reagent = { ...values, ...newValues };
    setValues(reagent);
    setSearch(reagent);
    var data = await getAll(reagent);
    let studios = [];
    console.log(data, "daata");
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
  const columns: IColumns<Irelacelist> = [
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

  /*   const PriceListTablePrint = () => {
    return (
      <div ref={componentRef}>
        <PageHeader
          ghost={false}
          title={<HeaderTitle title="Catálogo de Lista de Expedientes"  />}
          className="header-container"
        ></PageHeader>
        <Divider className="header-divider" />
        <Table<IProceedingList>
          size="small"
          rowKey={(record) => record.id}
          columns={columns.slice(0, 7)}
          pagination={false}
          dataSource={[...expedientes]}
        />
      </div>
    );
  }; */

  return (
    <Fragment>
      <div style={{ marginBottom: "5px", marginLeft: "90%" }}>
      <Button
          key="filter"
          type="primary"
          onClick={(e) => {
            e.stopPropagation();
            form.submit();
          }}
          style={{ marginLeft: "10%" }}
        >
          Filtrar
        </Button>
        <Button
          key="clean"
          onClick={(e) => {
           
            form.setFieldsValue(new searchrelase() );
            setValues(new searchrelase());
            e.stopPropagation();
            form.resetFields();
          }}
          style={{ marginLeft: "10%" }}
        >
          Limpiar
        </Button>

      </div>
      <div
        className="status-container"
        style={{
          // backgroundColor: "#F2F2F2",
          height: "auto",
          borderStyle: "solid",
          borderColor: "#CBC9C9",
          borderWidth: "1px",
          borderRadius: "10px",
          padding: "10px",
        }}
      >
<Form<ISearchRelase>
          {...formItemLayout}
          form={form}
          name="sampling"
          initialValues={values}
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
                  />
                </Col>
                <Col span={8}>
                  <SelectInput
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
                    formProps={{
                      name: "estatus",
                      label: "Estatus",
                    }}
                    multiple
                    options={[
                     
                      { value: 5, label: "Validado" },
                      { value: 6, label: "Liberado" },
                      { value: 7, label: "Enviado" },
                    ]}
                  ></SelectInput>
                </Col>
                <Col span={8}>
                  {/* <SelectInput
                    formProps={{
                      name: "departamento",
                      label: "Departamento",
                    }}
                    multiple
                    options={departmentAreaOptions}
                  ></SelectInput> */}
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
                    formProps={{
                      name: "medico",
                      label: "Médico",
                    }}
                    multiple
                    options={medicOptions}
                  ></SelectInput>
                </Col>
                <Col span={8}>
                  <Form.Item label="Sucursal" className="no-error-text" help="">
                    <Input.Group>
                      <Row gutter={8}>
                        <Col span={12}>
                          <SelectInput
                            formProps={{
                              name: "ciudad",
                              label: "Ciudad",
                              noStyle: true,
                            }}
                            options={cityOptions}
                          />
                        </Col>
                        <Col span={12}>
                          <SelectInput
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
            style={{ marginTop: "10px", marginBottom: "10px" }}
            type={activiti == "register" ? "primary" : "ghost"}
            onClick={register}
          >
            Registrar Liberación  
          </Button>
          <Button
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              marginLeft: "10px",
            }}
            type={activiti == "cancel" ? "primary" : "ghost"}
            onClick={cancel}
          >
            Cancelar Liberación  
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
              Aceptar Liberación  
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
              Cancelar Liberación  
            </Button>
          ) : (
            ""
          )}
        </Col>
      </Row>
      <Fragment>
        <RelaseTableStudy
          data={studys}
          columns={ValidationStudyColumns({ printTicket })}
          expandable={ValidationStudyExpandable({
            activiti,
            onChange,
            viewTicket,
            visto,
            setvisto,
            updateData,
          })}
        />
      </Fragment>
    </Fragment>
  );
};

export default observer(RelaseResultTable);