import { Button, Checkbox, Col, DatePicker, Descriptions, Divider, Form, Input, InputNumber, PageHeader, Row, Select, Table, Tag } from "antd";
import React, { FC, Fragment, useEffect, useState } from "react";
import {
  defaultPaginationProperties,
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../app/common/table/utils";
import useWindowDimensions, { resizeWidth } from "../../app/util/window";
import { EditOutlined } from "@ant-design/icons";
import IconButton from "../../app/common/button/IconButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import views from "../../app/util/view";
import { IProceedingList, ISearchMedical, ProceedingFormValues, SearchMedicalFormValues } from "../../app/models/Proceeding";
import moment from "moment";
import { IsamplingForm, IsamplingList, IUpdate, samplingFormValues } from "../../app/models/sampling";
import { formItemLayout } from "../../app/util/utils";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import DateRangeInput from "../../app/common/form/proposal/DateRangeInput";
import TextAreaInput from "../../app/common/form/proposal/TextAreaInput";
import TextInput from "../../app/common/form/proposal/TextInput";
import { IReportData } from "../../app/models/report";
import { getExpandableConfig } from "../report/utils";
import { ExpandableConfig } from "antd/lib/table/interface";
import ImageButton from "../../app/common/button/ImageButton";
import { originOptions, urgencyOptions } from "../../app/stores/optionStore";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import alerts from "../../app/util/alerts";

type ProceedingTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};


const SamplingTable: FC<ProceedingTableProps> = ({ componentRef, printing }) => {
  const { procedingStore,optionStore,locationStore,samplig } = useStore();
  const { expedientes,getnow,setSearch } = procedingStore;
  const {branchCityOptions,getBranchCityOptions,areas,getareaOptions,medicOptions,getMedicOptions,CityOptions,getCityOptions,departmentOptions,getDepartmentOptions,companyOptions,getCompanyOptions}= optionStore;
  const {getAll,studys,printTicket,update}=samplig;
  const {getCity,cityOptions}=locationStore;
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<IsamplingForm>();
  let navigate = useNavigate();
  const [values, setValues] = useState<IsamplingForm>(new samplingFormValues());
  const [updateData,setUpdateDate] = useState<IUpdate>();
  const [ids,setIds]=useState<number[]>([]);
  const [solicitudesData,SetSolicitudesData]=useState<string[]>([]);
  const { width: windowWidth } = useWindowDimensions();
  const [expandable, setExpandable] = useState<ExpandableConfig<IsamplingList>>();
const hasFooterRow = true;
const [studyCont,setStudyCont] = useState(0);
const [soliCont,setSoliCont] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activiti,setActiviti]=useState<string>("");
  //const [search,SetSearch] = useState<ISearchMedical>(new SearchMedicalFormValues())
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  useEffect(()=>{

  });

  const onChange = (e: CheckboxChangeEvent,id:number,solicitud:string) => {
    var data = ids;
    var solis = solicitudesData;
    if(e.target.checked){
      data.push(id);
      setIds(data);
      let temp= solicitudesData.filter(x=> x==solicitud);
      if(temp.length<=0){
        solis.push(solicitud);
        SetSolicitudesData(solis);
      }
    }else{
      if(data.length>0){
        var temp= data.filter(x=> x!=id);
        var temps = solis.filter(x=> x!=solicitud);
        setIds(temp);
        //SetSolicitudesData();
      }
      
    }
    setUpdateDate((prev)=>({...prev,id:ids}));
  };
const  updatedata=async ()=>{
  
  setLoading(true);
  var succes=await update(updateData!);
  if(succes){
    setLoading(false);
    alerts.confirm("",`Se han enviado ${ids.length} estudios de ${solicitudesData.length} solicitud a estatus pendiente de manera exitosa `,async ()=>{ await getAll(values);});
    setIds([]);
    SetSolicitudesData([]);
  }else{
    setLoading(false);
  }

  
}

  const expandableStudyConfig = {
    expandedRowRender: (item: IsamplingList) => (
      <div>
          <h4>Estudios</h4>
        {item.studys.map((x) => {
          return (
            <>
              <Descriptions size="small" bordered labelStyle={{fontWeight: "bold"}} contentStyle={{background: "#fff"}} style={{marginBottom: 5}}>
                <Descriptions.Item label="Clave" style={{maxWidth: 30}}>{x.clave}</Descriptions.Item>
                <Descriptions.Item label="Estudio" style={{maxWidth: 30}}>{x.nombre}</Descriptions.Item>
                <Descriptions.Item label="Estatus" style={{maxWidth: 30}}>{x.status==1?"Pendiente":"Toma de muestra"}</Descriptions.Item>
                <Descriptions.Item label="Registro" style={{maxWidth: 30}}>{x.registro}</Descriptions.Item>
                <Descriptions.Item label="Entrega" style={{maxWidth: 30}}>{x.entrega}</Descriptions.Item>
                <Descriptions.Item label="" style={{maxWidth: 30}}>{x.status==1&& activiti=="register" &&<Checkbox onChange={(e)=>onChange(e,x.id,item.id)}>Selecciona</Checkbox>}{x.status==2&& activiti=="cancel" &&<Checkbox onChange={(e)=>onChange(e,x.id,item.id)}>Selecciona</Checkbox>}<ImageButton title="Imprimir" image="print" onClick={(()=>{printTicket(item.order,item.id)})}></ImageButton></Descriptions.Item>
              </Descriptions>
            </>
          );
        })}
      </div>
    ),
    rowExpandable: () => true,
  };
  console.log("Table");
  useEffect(()=>{
    const readData = async()=>{
      await getBranchCityOptions();
      await getareaOptions(0);
      await getMedicOptions();
      await getCityOptions();
      await getDepartmentOptions();
      await getCompanyOptions();
    }

    readData();
  },[getBranchCityOptions]);
  useEffect(()=>{
    const readData = async()=>{
      await getCity();
    }
    readData();
  },[getCity])
  useEffect(() => {
    const readPriceList = async () => {
      setLoading(true);
      let studios = [];
      var datas=await getAll(values!);
      console.log(datas,"daata");
      setSoliCont(datas?.length!);
      datas?.forEach(x=> studios.push( x.studys));
      setStudyCont(studios.length);
      setLoading(false);
    };
    
    if (expedientes.length === 0) {
        readPriceList();
    }
    console.log(getExpandableConfig("estudios"),"config");
    setExpandable(expandableStudyConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAll]);

  useEffect(()=>{
    console.log(activiti,"useffect");
    setExpandable(expandableStudyConfig);
  },[activiti])
  const onFinish = async (newValues: IsamplingForm) => {
    setLoading(true);
    
    const reagent = { ...values, ...newValues };
      getAll(reagent);
      setLoading(false);
  };

  const register=()=>{
    setActiviti("register");
  }
  const cancel=()=>{
    setActiviti("cancel");
  }
  const columns: IColumns<IsamplingList> = [
    {
      ...getDefaultColumnProps("solicitud", "Clave", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre del Paciente", {
        searchState,
        setSearchState,
        width: "35%",
      }),
    },
    {
      ...getDefaultColumnProps("registro", "Registro", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },    {
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
        width: "15%",
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

      <div style={{backgroundColor:"#F2F2F2",height:"20%",borderStyle:"solid",borderColor:"#CBC9C9",borderWidth:"1px",borderRadius:"10px"}}>
        <br />
        <Form<IsamplingForm>
            {...formItemLayout}
            form={form}
            name="sampling"
            initialValues={values}
            onFinish={onFinish}
            scrollToFirstError
            /* onValuesChange={onValuesChange} */
          >
            <Row gutter={[0, 12]}>
                <Col sm={6}> 
                    <DateRangeInput
                        formProps={{ label: "Fechas", name: "fecha" ,
                        //style:{marginTop:"10px",width:"350px"}
                        }}
                    />
                </Col> 
                <Col sm={6}> 
                    <TextInput
                        formProps={{
                        name: "buscar",
                        label: "Buscar",
                        }}

                       // errors={errors.find((x) => x.name === "observaciones")?.errors}
                    />
                </Col> 
                <Col sm={6}> 
                <Button type="primary" /* style={{marginTop:"5px"}} */ onClick={()=>{form.submit()}}>Buscar</Button>
                </Col>
                <Col sm={6}> </Col>
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "procedencia",
                            label: "Procedencia",
                                    
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={originOptions}
                    ></SelectInput>
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "tipoSolicitud",
                            label: "Tipo solicitud",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={urgencyOptions}
                    ></SelectInput>
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "status",
                            label: "Status",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={[{value:1,label:"Pendiente"},{value:2,label:"Toma"}]}
                    ></SelectInput>
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "departamento",
                            label: "Departamento",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={departmentOptions}
                    ></SelectInput>
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "area",
                            label: "Área",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={areas}
                    ></SelectInput>
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "medico",
                            label: "Médico",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={medicOptions}
                    ></SelectInput>
                </Col> 

                <Col sm={6}> 
                <SelectInput
                    formProps={{ name: "sucursalId", label: "Sucursales" }}
                    multiple
                    options={branchCityOptions}
                  />
                </Col> 
                <Col sm={6}> 
                    <SelectInput
                        formProps={{
                            name: "compañia",
                            label: "Compañía",
                                        
                        }}
                        multiple
                        //errors={errors.find((x) => x.name === "nombre")?.errors}
                        options={companyOptions}
                    ></SelectInput>
                </Col> 
            </Row>
          </Form>
          </div>
          <Button style={{marginTop:"10px",marginBottom:"10px"}} type={activiti=="register"?"primary":"ghost"} onClick={register}>Registrar Toma</Button>
          <Button style={{marginTop:"10px",marginBottom:"10px", marginLeft:"10px"}} type={activiti=="cancel"?"primary":"ghost"} onClick={cancel}>Cancelar Registro</Button>
          {activiti=="register"?<Button style={{marginTop:"10px",marginBottom:"10px", marginLeft:"70%"}} type="primary" disabled={ids.length<=0} onClick={()=>{updatedata()}}>Aceptar Registro</Button>:""}
          {activiti=="cancel"?<Button style={{marginTop:"10px",marginBottom:"10px", marginLeft:"70%"}} type="primary" disabled={ids.length<=0} onClick={()=>{updatedata()}}>Cancelar Registro</Button>:""}
          <br />
          Solicitudes:{soliCont}&nbsp;&nbsp;&nbsp; Estudios: {studyCont}
          <br />
          <br />
          <Fragment >
          <Table<IsamplingList>
        loading={loading}
        size="small"
        rowKey={(record) => record.solicitud}
        columns={columns}
        pagination={false}
        dataSource={[...studys]}
        scroll={{ y: 500 }}
        //(rowClassName={(item) => (item.claveMedico == "Total" || item.paciente === "Total" ? "Resumen Total" : "")}
        expandable={expandable}
      />
      <div style={{ textAlign: "right", marginTop: 10 }}>
        <Tag color="lime">{!hasFooterRow ? studys.length : Math.max(studys.length - 1, 0)} Registros</Tag>
      </div>
        </Fragment>
    </Fragment>
  );
};

export default observer(SamplingTable);