import { Spin, Form, Row, Col, Pagination, Button, PageHeader, Divider, Radio, DatePicker, List, Typography, Select, Table, Checkbox, Input, Tag, InputNumber } from "antd";
import React, { FC, useEffect, useState } from "react";
import { formItemLayout } from "../../../app/util/utils";
import TextInput from "../../../app/common/form/TextInput";
import { useStore } from "../../../app/stores/store";
import { IReagentForm, ReagentFormValues } from "../../../app/models/reagent";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../../app/common/button/ImageButton";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { observer } from "mobx-react-lite";
import views from "../../../app/util/view";
import NumberInput from "../../../app/common/form/NumberInput";
import SelectInput from "../../../app/common/form/SelectInput";
import SwitchInput from "../../../app/common/form/SwitchInput";
import alerts from "../../../app/util/alerts";
import messages from "../../../app/util/messages";
import { IBranchDepartment } from "../../../app/models/branch";
import { IPackEstudioList } from "../../../app/models/packet";
import useWindowDimensions, { resizeWidth } from "../../../app/util/window";
import { getDefaultColumnProps, IColumns, ISearch } from "../../../app/common/table/utils";
import { IOptions } from "../../../app/models/shared";
import { IDias, Imedic, IPromotionBranch, IPromotionEstudioList, IPromotionForm, PromotionFormValues } from "../../../app/models/promotion";
import { IPriceListForm, ISucMedComList } from "../../../app/models/priceList";
import moment from "moment";
import PriceList from "../../../views/PriceList";
import Medics from "../../../views/Medics";
type ReagentFormProps = {
  id: string;
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};
const { Search } = Input;
const { CheckableTag } = Tag;

const PromotionForm: FC<ReagentFormProps> = ({ id, componentRef, printing }) => {
  const { optionStore,promotionStore } = useStore();
  const { getPriceById, getById, getAll, create, update,promotionLists } =promotionStore;
const {priceListOptions,getPriceListOptions, getDepartmentOptions, departmentOptions,getareaOptions,areas,getMedicOptions,medicOptions} = optionStore;
const { width: windowWidth } = useWindowDimensions();
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const [lista, setLista] = useState(/* studies */);
  const [searchParams, setSearchParams] = useSearchParams();
  const [areaId, setAreaId] = useState<number>();
  const [discunt, setDiscunt] = useState<string>();
  const [branch,setBranch] = useState<IOptions[]>();
 const [medic,setMedic] = useState<IOptions[]>([]);
  const [sucursal,setSucursal] = useState<ISucMedComList>();
  const [medico, setmedico]=useState<Imedic>();
  const [sucursales,setSucursales] = useState<ISucMedComList[]>([]);
  const [estudios,setEstudios] = useState<IPromotionEstudioList[]>([]);
  const [form] = Form.useForm<IPromotionForm>();
  const [aeraSearch, setAreaSearch] = useState(areas);
  const [selectedTags, setSelectedTags] = useState<IDias[]>([]);
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const [readonly, setReadonly] = useState(searchParams.get("mode") === "readonly");
  const [values, setValues] = useState<IPromotionForm>(new PromotionFormValues());
  const [depId, setDepId] = useState<number>();
  
  const tagsData:IDias[] = [{id:1,dia:'L'}, {id:2,dia:'M'}, {id:3,dia:'M'}, {id:4,dia:'J'},{id:5,dia:'V'},{id:6,dia:'S'},{id:7,dia:'D'}];
  const radioOptions = [
    { label: 'Porcentaje', value: 'porcent' },
    { label: 'Cantidad', value: 'number' },
  ];
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });
  useEffect(()=>{
    const getMedics= async () =>{
      await getMedicOptions();
    
    }
    getMedics();
  },[getMedicOptions]);
  const setFechaInicial=(fecha:moment.Moment)=>{
console.log(fecha.toDate(),"fecha");
    console.log("fecha1");
    let estudio = estudios.map(x=> {
      let data:IPromotionEstudioList = {
        id:x.id,
        area:x.area,
        clave:x.clave,
        nombre:x.nombre,
        descuentoPorcentaje:x.descuentoPorcentaje,
        descuentoCantidad:x.descuentoPorcentaje,
        precioFinal: x.precioFinal,
        fechaInicial: fecha.toDate(),
        fechaFinal: x.fechaFinal,
        activo:x.activo,
        precio: x.precio! ,
        paquete:x.paquete,
        selectedTags:x.selectedTags,
        departamento:x.departamento
      }
    return data;
     });
      console.log(estudio,"estudio");
     setEstudios(estudio!);
     setValues((prev) => ({ ...prev, estudio: estudio!,fechaInicial:fecha.toDate() }));
  };

  const setFechaFinal=(fecha:moment.Moment)=>{

    let estudio = estudios.map(x=> {
      let data:IPromotionEstudioList = {
        id:x.id,
        area:x.area,
        clave:x.clave,
        nombre:x.nombre,
        descuentoPorcentaje:x.descuentoPorcentaje,
        descuentoCantidad:x.descuentoPorcentaje,
        precioFinal: x.precioFinal,
        fechaInicial: x.fechaInicial,
        fechaFinal: fecha.toDate(),
        activo:x.activo,
        precio: x.precio! ,
        paquete:x.paquete,
        selectedTags:x.selectedTags,
        departamento:x.departamento
      }
    return data;
     });

     setEstudios(estudio!);
     setValues((prev) => ({ ...prev, estudio: estudio!,fechaFinal:fecha.toDate() }));
  };
  const onValuesChange = async (changedValues: any) => {
    const field = Object.keys(changedValues)[0];

    if (field === "idListaPrecios") {
      const id = changedValues[field] as string;
       const priceList = await getPriceById(id);
       var sucursales:ISucMedComList[] = priceList!.sucursales;
        setSucursales(sucursales);
       var sucursalesOptions:IOptions[] = sucursales.map((x)=>({
        value: x.id,
        label: x.nombre,
       })); 
       setBranch(sucursalesOptions);
       let estudio = priceList?.estudios.map(x=> {
        let data:IPromotionEstudioList = {
          id:x.id,
          area:x.area,
          clave:x.clave,
          nombre:x.nombre,
          descuentoPorcentaje:(values.tipoDescuento=="porcent"? values.cantidad:0),
          descuentoCantidad:(values.tipoDescuento!="porcent"? values.cantidad:0),
          precioFinal: 0,
          fechaInicial: values.fechaInicial,
          fechaFinal:values.fechaFinal,
          activo:false,
          precio: x.precio! ,
          paquete:false,
          selectedTags:[],
          departamento:x.departamento
        }
      return data;
       });
       /* cambiar aqui*/
        let paquetes = priceList?.paquete.map(x=> {
        let data:IPromotionEstudioList = {
          id:x.id,
          area:x.area,
          clave:x.clave,
          nombre:x.nombre,
          descuentoPorcentaje:(values.tipoDescuento=="porcent"? values.cantidad:0),
          descuentoCantidad:(values.tipoDescuento!="porcent"? values.cantidad:0),
          precioFinal: 0,
          fechaInicial: values.fechaInicial,
          fechaFinal:values.fechaFinal,
          activo:false,
          precio: x.precioFinal!  ,
          paquete:true,
          selectedTags:[],
          departamento:x.departamento
        }

        console.log(x);
      return data;
       });

       estudio= estudio?.concat(paquetes!);
       
       setEstudios(estudio!);

       setValues((prev) => ({ ...prev, estudio: estudio! }));
       setFlag(!flag);
    }

    if (field === "cantidad") {
      const cantidad = changedValues[field] as number;
       console.log("cambio la cantidad");
       console.log(values.tipoDescuento);
       setValues((prev) => ({ ...prev, cantidad: cantidad! }));
       let estudio:IPromotionEstudioList[] = estudios!.map(x=> {
        let data:IPromotionEstudioList = {
          id:x.id,
          area:x.area,
          clave:x.clave,
          nombre:x.nombre,
          descuentoPorcentaje:(values.tipoDescuento==="porcent"? cantidad: ((cantidad*100)/x.precio)),
          descuentoCantidad:(values.tipoDescuento!=="porcent"? cantidad:((cantidad*x.precio)/100)),
          precioFinal:(values.tipoDescuento!=="porcent"? (x.precio-cantidad):x.precio-((cantidad*x.precio)/100)) ,
          fechaInicial: moment().toDate(),
          fechaFinal:moment().toDate(),
          activo:x.activo,
          precio: x.precio! ,
          paquete:x.paquete,
          selectedTags:x.selectedTags,departamento:x.departamento
        }
      return data;
       });

       setEstudios(estudio!);
       setValues((prev) => ({ ...prev, estudio: estudio! }));
       
    }

    
  };
  const editStudy = (typos:string)=>{
    var estudio:IPromotionEstudioList[] = estudios.map(x=> {
      let data:IPromotionEstudioList = {
        id:x.id,
        area:x.area,
        clave:x.clave,
        nombre:x.nombre,
        descuentoPorcentaje:(typos=="porcent"? values.cantidad: ((values.cantidad*100)/x.precio)),
        descuentoCantidad:(typos!="porcent"? values.cantidad:((values.cantidad*x.precio)/100)),
        precioFinal:(typos!="porcent"? x.precio-values.cantidad:x.precio-((values.cantidad*x.precio)/100)) ,
        fechaInicial: moment().toDate(),
        fechaFinal:moment().toDate(),
        activo:x.activo,
        precio: x.precio! ,
        paquete:x.paquete,
        selectedTags:x.selectedTags,
        departamento:x.departamento
      }
    return data;
     });

     setEstudios(estudio!);
     setValues((prev) => ({ ...prev, estudio: estudio! }));

  };
  const handleChange=(tag:IDias, checked:Boolean)=>{

// setValues({...values, [tag.dia]: checked})
console.log(tag,"el tag");
    const nextSelectedTags = checked ? [...selectedTags!, tag] : selectedTags.filter(t => t.id !== tag.id);
    console.log('You are interested in: ', nextSelectedTags);
    let estudio:IPromotionEstudioList[] = estudios!.map(x=> {
      if(x.selectedTags.length>0){
        let nextSelectedTagsInStudy = checked ? [...x.selectedTags!, tag] : x.selectedTags.filter(t => t.id !== tag.id);
        let data:IPromotionEstudioList = {
          id:x.id,
          area:x.area,
          clave:x.clave,
          nombre:x.nombre,
          descuentoPorcentaje:x.descuentoPorcentaje,
          descuentoCantidad:x.descuentoCantidad,
          precioFinal:x.precioFinal ,
          fechaInicial: x.fechaInicial,
          fechaFinal: x.fechaFinal,
          activo:x.activo,
          precio: x.precio! ,
          paquete:x.paquete,
          selectedTags:nextSelectedTagsInStudy,
          departamento:x.departamento
        }
        return data;
      }else{
        let data:IPromotionEstudioList = {
          id:x.id,
          area:x.area,
          clave:x.clave,
          nombre:x.nombre,
          descuentoPorcentaje:x.descuentoPorcentaje,
          descuentoCantidad:x.descuentoCantidad,
          precioFinal:x.precioFinal ,
          fechaInicial: x.fechaInicial,
          fechaFinal: x.fechaFinal,
          activo:x.activo,
          precio: x.precio! ,
          paquete:x.paquete,
          selectedTags:nextSelectedTags,
          departamento:x.departamento
        }
        return data;
      }

      
     });

     setEstudios(estudio!);
     setValues((prev) => ({ ...prev, estudio: estudio! }));
    setSelectedTags( nextSelectedTags! );
  };
  const setStudy = (active:boolean,item:IPromotionEstudioList,type:boolean) =>{
    console.log(item,"item");
    var index = estudios.findIndex(x=>(x.id===item.id) && (x.paquete===type));
    var list = estudios;
    item.activo=active;
    list[index]=item;
   // setLista(list); 
    var indexVal= values.estudio.findIndex(x=>(x.id===item.id) && (x.paquete===type));
    console.log(indexVal,"index");
    var val =values.estudio;
    val[indexVal]=item;
    setValues((prev) => ({ ...prev, estudio: val })); 
   
};

  const setStudyFi = (fechainical:moment.Moment,item:IPromotionEstudioList,type:boolean) =>{
    
    var index = estudios.findIndex(x=>x.id==item.id && (x.paquete===type));
    var list = estudios;
    item.fechaInicial=fechainical.toDate();
    list[index]=item;
   // setLista(list); 
    var indexVal= values.estudio.findIndex(x=>x.id==item.id && (x.paquete===type));
    var val =values.estudio;
    val[indexVal]=item;
    setValues((prev) => ({ ...prev, estudio: val })); 
       
    };
    const setStudyFf = (fechafinal:moment.Moment,item:IPromotionEstudioList,type:boolean) =>{
      var index = estudios.findIndex(x=>x.id==item.id && (x.paquete===type));
      var list = estudios;
      item.fechaFinal=fechafinal.toDate();
      list[index]=item;
     // setLista(list); 
      var indexVal= values.estudio.findIndex(x=>x.id==item.id && (x.paquete===type));
      var val =values.estudio;
      val[indexVal]=item;
      setValues((prev) => ({ ...prev, estudio: val })); 
         
      };
const setStudydiscunt = (decuento:number,item:IPromotionEstudioList,type:boolean) =>{
  
      var index = estudios.findIndex(x=>x.id===item.id && x.paquete===type);
      var list = estudios;
      item.descuentoPorcentaje=decuento;
      item.descuentoCantidad=(item.precio*decuento/100);
      item.precioFinal = item.precio-item.descuentoCantidad;
      list[index]=item;
     // setLista(list); 
      var indexVal= values.estudio.findIndex(x=>x.id==item.id && x.paquete===type);
      var val =values.estudio;
      val[indexVal]=item;
      setValues((prev) => ({ ...prev, estudio: val })); 
     
  };

  const setStudydiscuntc = (decuento:number,item:IPromotionEstudioList,type:boolean) =>{
    var index = estudios.findIndex(x=>x.id===item.id&& x.paquete===type);
    var list = estudios;
    item.descuentoPorcentaje=(100*decuento/item.precio);
    item.descuentoCantidad=decuento;
    item.precioFinal= item.precio-decuento;
    list[index]=item;
   // setLista(list); 
    var indexVal= values.estudio.findIndex(x=>x.id===item.id && x.paquete===type);
    var val =values.estudio;
    val[indexVal]=item;
    setValues((prev) => ({ ...prev, estudio: val })); 
       
    };
    const setStudyPricefinal = (preciofinal:number,item:IPromotionEstudioList,type:boolean) =>{
      var index = estudios.findIndex(x=>x.id==item.id  && x.paquete===type);
      var list = estudios;
      item.descuentoCantidad=preciofinal-item.precio;
      item.descuentoPorcentaje=(100*item.descuentoCantidad/item.precio);
      item.precioFinal= preciofinal;
      list[index]=item;
     // setLista(list); 
      var indexVal= values.estudio.findIndex(x=>x.id==item.id  && x.paquete===type);
      var val =values.estudio;
      val[indexVal]=item;
      setValues((prev) => ({ ...prev, estudio: val })); 
         
      };

      const setStudyday= (item:IPromotionEstudioList,checked:boolean,tag:IDias,type:boolean) =>{
        
        var index = estudios.findIndex(x=>x.id==item.id && (x.paquete===type));
        var list = estudios;

        const nextSelectedTags = checked ? [...item.selectedTags!, tag] : item.selectedTags.filter(t => t.id !== tag.id);
        console.log('You are interested in: ', nextSelectedTags);
        item.selectedTags  = nextSelectedTags;
        list[index]=item;
       // setLista(list); 
        var indexVal= values.estudio.findIndex(x=>x.id==item.id && (x.paquete===type));
        var val =values.estudio;
        val[indexVal]=item;
        setValues((prev) => ({ ...prev, estudio: val })); 
           
        };
  useEffect(()=>{
    const readPriceList = async ()=>{
      await getPriceListOptions();
    }
    readPriceList();
  },[getPriceListOptions]);
  useEffect(() => {
    const readDepartaments = async () =>{
      var departaments= await getDepartmentOptions();
    }
    readDepartaments();
  }, [getDepartmentOptions]);
  useEffect(()=> {
    const areareader = async () => {
    await getareaOptions(0);
    setAreaSearch(areas);
    }
      areareader();
  }, [ getareaOptions]);
  const columnsEstudios: IColumns<IPromotionEstudioList> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: 100,
        windowSize: windowWidth,
      }),
      fixed:"left"
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre", {
        searchState,
        setSearchState,
        width: 200,
        windowSize: windowWidth,
      }),
    },
    {
      key: "editarp",
      dataIndex: "id",
      title: "Desc %",
      align: "center",
      width:  100,
      render: (value,item) => (
        <InputNumber type={"number"} min={0}  value={item.descuentoPorcentaje}  onChange={(value)=>setStudydiscunt(value,item,item.paquete!)}></InputNumber>
      ),
    },
    {
      key: "editarc",
      dataIndex: "id",
      title: "Desc cantidad",
      align: "center",
      width:  100 ,
      render: (value,item) => (
        <InputNumber type={"number"} min={0}  value={item.descuentoCantidad}  onChange={(value)=>setStudydiscuntc(value,item,item.paquete!)}></InputNumber>
      ),
    },
    {
      key: "editarc",
      dataIndex: "id",
      title: "Precio final",
      align: "center",
      width:  100 ,
      render: (value,item) => (
        <InputNumber type={"number"} min={0} value={item.precioFinal}  onChange={(value)=>setStudyPricefinal(value,item,item.paquete)}></InputNumber>
      ),
    },
    {
        ...getDefaultColumnProps("area", "Área", {
          searchState,
          setSearchState,
          width: 100,
          windowSize: windowWidth,
        }),
    },

    {
      key: "editarc",
      dataIndex: "id",
      title: "Fecha inicio",
      align: "center",
      width: 200,
      render: (value,item) => (
        <DatePicker style={{marginLeft:"10px"}} value={moment(item.fechaInicial)} onChange={(value)=>{setStudyFi(value!,item,item.paquete)}} />
      ),
    },    {
      key: "editarc",
      dataIndex: "id",
      title: "Fecha final",
      align: "center",
      width: 200,
      render: (value,item) => (
        <DatePicker style={{marginLeft:"10px"}} value={moment(item.fechaFinal)} onChange={(value)=>{setStudyFf(value!,item,item.paquete)}} />
      ),
    },
    {
      key: "editar",
      dataIndex: "id",
      title: "Activo",
      align: "center",
      width:  100 ,
      render: (value,item) => (
        <Checkbox
          name="activo"
          checked={item.activo}
          onChange={(value)=>{ console.log(value.target.checked); var active= false; if(value.target.checked){ console.log("here"); active= true;}setStudy(active,item,item.paquete)}}
        />
      ),
    },
    {
      ...getDefaultColumnProps("precio", "Precio", {
        searchState,
        setSearchState,
        width: 100,
        windowSize: windowWidth,
      }),
  },    {
    key: "editar",
    dataIndex: "id",
    title: "Dias",
    align: "center",
    width:  200 ,
    render: (value,item) => (
      <>
                {tagsData.map(tag => (
                  <CheckableTag
                    key={tag.id}
                    checked={item.selectedTags.filter((x:IDias) =>x.id===tag.id).length>0}
                    onChange={checked => setStudyday(item,checked,tag,item.paquete)}
                  >
                    {tag.dia}
                  </CheckableTag>
                ))}
              </>
    ),
  },
  ];
  const filterByDepartament = async (departament:number) => {
    if(departament){
    var departamento=departmentOptions.filter(x=>x.value===departament)[0].label;
    var areaSearch=await getareaOptions(departament);

    var estudio = estudios!.filter((x:IPromotionEstudioList) =>x.departamento === departamento) ;
    console.log(estudios,"estudios");
    console.log(departamento,"2depa");
    console.log(estudio,"estudios");
    console.log(estudio);
    setValues((prev) => ({ ...prev, estudio: estudio })); 
    setAreaSearch(areaSearch!);
  }else{
      var estudi = estudios!.filter(x=>x.activo === true);
      setValues((prev) => ({ ...prev, estudio: estudi })); 
     
    }
    
  };
  const filterByArea = (area?:number) => {
    if (area) {
      var areaActive = areas.filter((x) => x.value === area)[0].label;
      var estudi = estudios.filter((x) => x.area === areaActive);
      setValues((prev) => ({ ...prev, estudio: estudi }));
    } else {
      const dep = departmentOptions.find((x) => x.value === depId)?.label;
      estudi = estudios.filter((x) => x.departamento === dep);
      setValues((prev) => ({ ...prev, estudio: estudi }));
    }
  };
  const filterBySearch = (search:string)=>{
   
     var estudio = estudios.filter(x=>x.clave.toUpperCase().includes(search.toUpperCase()) || x.nombre.toUpperCase().includes(search.toUpperCase()))
     console.log(estudio);
    setValues((prev) => ({ ...prev, estudio: estudio })); 
  };
   useEffect(() => {
    const readReagent = async (id: number) => {
      setLoading(true);

      const reagent = await getById(id);
      console.log("el promotion");
      console.log(reagent);
      const priceList = await getPriceById(reagent?.idListaPrecios!);
      var sucursales:ISucMedComList[] = priceList!.sucursales;
       setSucursales(sucursales);
      var sucursalesOptions:IOptions[] = sucursales.map((x)=>({
       value: x.id,
       label: x.nombre,
      })); 
      setBranch(sucursalesOptions);
      form.setFieldsValue(reagent!);
      setValues(reagent!);
      setSelectedTags(reagent?.dias!);
      setLoading(false);
      setDiscunt(reagent?.tipoDescuento!);
      setEstudios(reagent?.estudio!);
    };
    console.log("el id");
    console.log(id);
    if (id) {
      console.log(id,"id");
      readReagent(Number(id));
    }else{
      setDiscunt("porcent");
      setValues((prev)=>({...prev,tipoDescuento:"porcent"}))
    }
  }, [form, getById, id]);
 
   useEffect(() => {
    if (promotionLists.length === 0) {
      getAll(searchParams.get("search") ?? "all");
    }
  }, [getAll, promotionLists.length, searchParams]); 
  const deleteClinic = (id: string) => {
     const clinics = values.branchs.filter((x) => x.id !== id);

    setValues((prev) => ({ ...prev, branchs: clinics })); 
  };
  const deletemedico = (id: string) => {
    const clinics = values.medics.filter((x) => x.id !== id);

   setValues((prev) => ({ ...prev, medics: clinics })); 
 };
  const addClinic = () => {
     if (sucursal) {
      if (values.branchs.findIndex((x) => x.id === sucursal.id) > -1) {
        alerts.warning("Ya esta agregada este departamento");
        return;
      }

      const branchs: ISucMedComList[] = [
        ...values.branchs,
        {
          id: sucursal.id,
          clave: sucursal.clave,
          nombre: sucursal.nombre,
          area:sucursal.area,
          activo: sucursal.activo,
          departamento: sucursal.departamento,
        },
      ];

      setValues((prev) => ({ ...prev, branchs: branchs }));
      console.log(values);
    } 
  };
  const addmedic = () => {
    console.log(medico,"medico");
    if (medico) {
     if (values.medics!.findIndex((x) => x.id === medico.id) > -1) {
       alerts.warning("Ya esta agregada este departamento");
       return;
     }
      console.log(medico);
     const branchs: Imedic[] = [
       ...values.medics,
       {
        id : medico.id,
        clave : medico.clave,
        activo : medico.activo,
        nombre :medico.nombre
       },
     ];

     setValues((prev) => ({ ...prev, medics: branchs }));
     console.log(values);
   } 
 };
  const onFinish = async (newValues: IPromotionForm) => {
    setLoading(true);

    const reagent = { ...values, ...newValues };

    var counter =0;
    values.estudio.forEach(x=>{if(x.precioFinal==0){ counter++}})
    if(counter>0){
      alerts.warning("El precio final debe ser mayor a 0");
      setLoading(false);
      return
    }
    reagent.dias= selectedTags; 
    console.log(reagent,"en el onfish")
    console.log(reagent);
    let success = false;

    if (!reagent.id) {
      success = await create(reagent);
    } else {
      success = await update(reagent);
    }

    setLoading(false);

    if (success) {
      goBack();
    }
  };

  const goBack = () => {
    searchParams.delete("mode");
    setSearchParams(searchParams);
    navigate(`/${views.promo}?${searchParams}`);
  };

  const setEditMode = () => {
    navigate(`/${views.promo}/${id}?${searchParams}&mode=edit`);
    setReadonly(false);
  };
useEffect(()=>{
  if(values.tipoDescuento=="porcent"){
    values.estudio.forEach(x=>{setStudydiscunt(x.descuentoPorcentaje,x,x.paquete!);})
  }else{
    values.estudio.forEach(x=>{setStudydiscuntc(x.descuentoCantidad,x,x.paquete!);});
  }
    selectedTags.forEach(x=>{handleChange(x, true)});
},[flag]);
  const getPage = (id: string) => {
    return promotionLists.findIndex((x) => x.id === Number(id)) + 1;
  };

  const setPage = (page: number) => {
    const reagent = promotionLists[page - 1];
    setAreaId(undefined);
     setDepId(undefined);
    navigate(`/${views.promo}/${reagent.id}?${searchParams}`);
  };

  return (
    <Spin spinning={loading || printing} tip={printing ? "Imprimiendo" : ""}>
      <Row style={{ marginBottom: 24 }}>
        {id && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "left" }}>
             <Pagination
              size="small"
              total={promotionLists?.length ?? 0}
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
            <ImageButton key="edit" title="Editar" image="editar" onClick={setEditMode} />
          </Col>
        )}
      </Row>
      <div style={{ display: printing ? "" : "none", height: 300 }}></div>
      <div style={{ display: printing ? "none" : "" }}>
        <div ref={componentRef}>
          {printing && (
            <PageHeader
              ghost={false}
              title={<HeaderTitle title="Catálogo de Promociones en listas de precios" image="promocion" />}
              className="header-container"
            ></PageHeader>
          )}
          {printing && <Divider className="header-divider" />}
          <Form<IPromotionForm>
            {...formItemLayout}
            form={form}
            name="reagent"
            initialValues={values}
            onFinish={onFinish}
            scrollToFirstError
            onValuesChange={onValuesChange}
          >
            <Row>
              <Col md={12} sm={24} xs={12}>
                <TextInput
                  formProps={{
                    name: "clave",
                    label: "Clave",
                  }}
                  max={100}
                  required
                  readonly={readonly}
                />
              </Col>
              <Col md={12} sm={24} xs={12}>
                <SelectInput
                    formProps={{
                      name: "idListaPrecios",
                      label: "Lista de precios",
                    }}
                    required
                    options={priceListOptions}
                    readonly={readonly}
                  />
              </Col>
              <Col md={12} sm={24} xs={12}>
                <TextInput
                  formProps={{
                    name: "nombre",
                    label: "Nombre",
                  }}
                  max={100}
                  required
                  readonly={readonly}
                />
              </Col>
              <Col md={12} sm={24} xs={12}>
              <SwitchInput
                  name="activo"
                  onChange={(value) => {
                    if (value) {
                      alerts.info(messages.confirmations.enable);
                    } else {
                      alerts.info(messages.confirmations.disable);
                    }
                  }}
                  label="Activo"
                  readonly={readonly}
                />
              </Col>
              <Col md={12} sm={24} xs={12}>
                <div style={{marginLeft:"85px",marginBottom:"20px"}}>
                  Tipo de descuento: 
                  <Radio.Group  style={{marginLeft:"10px"}}
                    options={radioOptions}
                    onChange={(e) => {
                      setValues((prev) => ({ ...prev, tipoDescuento: e.target.value }));
                      setDiscunt(e.target.value);
                      console.log(values.cantidad);
                    if(values.cantidad!==0){
                      console.log("cambio de tipo");
                    editStudy(e.target.value);}
                    }}
                    value={discunt}
                    
                  />
                </div>
              </Col>
              <Col md={12} sm={24} xs={12}></Col>
              <Col md={12} sm={24} xs={12}>
                  <NumberInput
                      formProps={{
                        name: "cantidad",
                        label: "Descuento",
                      }}
                      max={100}
                      min={0}
                      required
                      readonly={readonly}
                  ></NumberInput>
              </Col>
              <Col md={12} sm={24} xs={12}>

              </Col>
              <Col md={12} sm={24} xs={12}>
              <div style={{marginLeft:"98px",marginBottom:"20px"}}>
                Descuento entre: 
                <DatePicker style={{marginLeft:"10px"}} value={moment(values.fechaInicial)} onChange={(value)=>{setFechaInicial(value!)}} />
                <DatePicker style={{marginLeft:"10px"}} value={moment(values.fechaFinal)} onChange={(value)=>{setFechaFinal(value!)}} />
              </div>
              </Col>
              <Col md={12} sm={24} xs={12}>
              <div style={{marginLeft:"125px",marginBottom:"20px"}}>
                <span style={{ marginRight: 8 }}>Aplicar dias:</span>
                {tagsData.map(tag => (
                  <CheckableTag
                    key={tag.id}
                    checked={selectedTags.filter(x=>x.id===tag.id).length>0}
                    onChange={checked => handleChange(tag, checked) }
                  >
                    {tag.dia}
                  </CheckableTag>
                ))}
              </div>
              </Col>
            </Row>
          </Form>
          <div>
        <div></div>
      </div>
      <Divider orientation="left">Sucursales</Divider>
      <List<ISucMedComList>
        header={
          <div>
            <Col md={12} sm={24} style={{ marginRight: 20 }}>
            Clave/Nombre:
              <Select
                options={branch}
                onChange={(value, option: any) => {
                  if (value) {
                    var sucursal = sucursales.filter(x=>x.id==value);
                    setSucursal(sucursal[0]);
                  } else {
                    setSucursal(undefined);
                  }
                }}
                style={{ width: 240, marginRight: 20, marginLeft: 10 }}
              />
              {!readonly && !printing&& (
                <ImageButton
                  key="agregar"
                  title="Agregar "
                  image="agregar-archivo"
                  onClick={addClinic}
                />
              )}
            </Col>
          </div>
        }
        footer={<div></div>}
        bordered
        dataSource={values.branchs}
        renderItem={(item) => (
          <List.Item>
            <Col md={12} sm={24} style={{ textAlign: "left" }}>
              <Typography.Text mark></Typography.Text>
              {item.nombre}
            </Col>
            <Col md={12} sm={24} style={{ textAlign: "left" }}>
      {!readonly && !printing&&        <ImageButton
                key="Eliminar"
                title="Eliminar"
                image="Eliminar_Clinica"
                onClick={() => {
                  deleteClinic(item.id);
                }}
              />}
            </Col>
          </List.Item>
        )}
      />
      <Divider orientation="left">Médicos</Divider>
      <List<ISucMedComList>
        header={
          <div>
            <Col md={12} sm={24} style={{ marginRight: 20 }}>
            Clave/Nombre:
              <Select
                options={medicOptions}
                onChange={(value, option: any) => {
                  console.log(medicOptions,"optios");
                  setMedic([...medicOptions]);
                  if(medic.length==0){
                      setMedic([...medicOptions]);
                      console.log(medic,"MEDIC");
                  }
                  if (value) {  
                    console.log(value);
                    var sucursal = medicOptions.filter(x=>x.value==value);
                    console.log("SUCURSAL",sucursal);
                    setMedic(prev=>[...prev,sucursal[0]]);
                    var medics:Imedic = sucursal.map(x=> ({
                      id : x.value.toString(),
                      clave : "",
                      activo : true,
                      nombre : x.label?.toString()!
                    }))[0];
                    setmedico(medics);
                  } else {
                    setMedic([]);
                  }
                }}
                style={{ width: 240, marginRight: 20, marginLeft: 10 }}
              />
              {!readonly && !printing&& (
                <ImageButton
                  key="agregar"
                  title="Agregar "
                  image="agregar-archivo"
                  onClick={addmedic}
                />
              )}
            </Col>
          </div>
        }
        footer={<div></div>}
        bordered
        dataSource={values.medics}
        renderItem={(item) => (
          <List.Item>
            <Col md={12} sm={24} style={{ textAlign: "left" }}>
              <Typography.Text mark></Typography.Text>
              {item.nombre}
            </Col>
            <Col md={12} sm={24} style={{ textAlign: "left" }}>
      {!readonly && !printing&&        <ImageButton
                key="Eliminar"
                title="Eliminar"
                image="Eliminar_Clinica"
                onClick={() => {
                  deletemedico(item.id);
                }}
              />}
            </Col>
          </List.Item>
        )}
      />
      <Divider orientation="left">Estudios</Divider>
          <Row>
          <Col md={4} sm={24} xs={12}>
          Búsqueda por :   
          </Col>
          <Col md={9} sm={24} xs={12}>
          <SelectInput 
                formProps={{ name: "departamentoSearch", label: "Departamento" }}
                options={departmentOptions}
                readonly={readonly}
                value={depId} 
                onChange={(value)=>{setAreaId(undefined); setDepId(value); filterByDepartament(value)}}
              />

              </Col> 
              <Col md={2} sm={24} xs={12}></Col>
              <Col md={9} sm={24} xs={12}>
                <label htmlFor="">Área: </label>
                <Select
                /* formProps={{ name: "areaSearch", label: "Área" }} */
                options={aeraSearch}
                disabled={readonly}
                onChange={(value)=>{ setAreaId(value); filterByArea(value)}}
                value={areaId}
                allowClear
                onClear={() => {
                  setAreaId(undefined);
                  filterByArea();
                }}
                style={{width:"400px"}}
              />
              </Col>
              <Col md={15} sm={24} xs={12}></Col>
              <Col md={9} sm={24} xs={12}>
              <Search
          key="search"
          placeholder="Buscar"
          onSearch={(value: string) => {
           filterBySearch(value)
          }}
        />,</Col>
            <Col md={24} sm={12} style={{ marginRight: 20, textAlign: "center" }}>
                <Table<IPromotionEstudioList>
                size="small"
                rowKey={(record) => record.id}
                columns={columnsEstudios}
                pagination={false}
                dataSource={[...( values.estudio)]}
                scroll={{ x: "max-content" }}
                />
            </Col>
          </Row>
        </div>
      </div>
    </Spin>
  );
};

export default observer(PromotionForm);
