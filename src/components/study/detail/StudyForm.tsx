import {
  Spin,
  Form,
  Row,
  Col,
  Tooltip,
  Tag,
  Pagination,
  Button,
  Divider,
  PageHeader,
  Table,
  InputRef,
  Input,
  Typography,
} from "antd";
import React, { FC, useEffect, useRef, useState } from "react";
import { formItemLayout } from "../../../app/util/utils";
import TextInput from "../../../app/common/form/TextInput";
import SwitchInput from "../../../app/common/form/SwitchInput";
import SelectInput from "../../../app/common/form/SelectInput";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../../../app/stores/store";
import ImageButton from "../../../app/common/button/ImageButton";
import alerts from "../../../app/util/alerts";
import messages from "../../../app/util/messages";
import { observer } from "mobx-react-lite";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { PlusOutlined } from "@ant-design/icons";
import {
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../../app/common/table/utils";
import useWindowDimensions, { resizeWidth } from "../../../app/util/window";
import { IStudyForm, StudyFormValues } from "../../../app/models/study";
import NumberInput from "../../../app/common/form/NumberInput";
import { IParameterList } from "../../../app/models/parameter";
import { IIndicationList } from "../../../app/models/indication";
import { IPacketList } from "../../../app/models/packet";
import views from "../../../app/util/view";
import { ParameterModal } from "./modals/ParameterModal";
import { IndicationModal } from "./modals/IndicationModal";
import { MenuOutlined } from "@ant-design/icons";
import type { SortableContainerProps, SortEnd } from "react-sortable-hoc";
import {
  SortableHandle,
  SortableElement,
  SortableContainer,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import TextAreaInput from "../../../app/common/form/proposal/TextAreaInput";

const { Link } = Typography;

type StudyFormProps = {
  componentRef: React.MutableRefObject<any>;
  load: boolean;
};
type UrlParams = {
  id: string;
};

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
));

const SortableItem = SortableElement(
  (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
);
const SortableBody = SortableContainer(
  (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />
);

const StudyForm: FC<StudyFormProps> = ({ componentRef, load }) => {
  const { optionStore, studyStore } = useStore();
  const {
    getDepartmentOptions,
    departmentOptions,
    getAreaOptions: getareaOptions,
    areaOptions: areas,
    getPrintFormatsOptions,
    getMaquiladorOptions,
    MaquiladorOptions,
    getMethodOptions,
    MethodOptions,
    getsampleTypeOptions,
    sampleTypeOptions,
    getworkListOptions2,
    getParameterOptions,
    getIndication,
    getReagentOptions,
    getTaponOption,
    taponOption,
  } = optionStore;
  const [selectedRowKeysp, setSelectedRowKeysp] = useState<React.Key[]>([]);
  const [selectedRowKeysi, setSelectedRowKeysi] = useState<React.Key[]>([]);

  const {
    getById,
    getAll,
    study,
    update,
    create,
    parameterSelected,
    setParameterSelected,
    indicationSelected,
    setIndicationSelected,
  } = studyStore;
  const [form] = Form.useForm<IStudyForm>();
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  const [values, setValues] = useState<IStudyForm>(new StudyFormValues());
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState<boolean>(false);
  let { id } = useParams<UrlParams>();
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  const [parameterSelectedSource, setParameterSelectedSource] =
    useState(parameterSelected);

  useEffect(() => {
    setParameterSelectedSource(
      parameterSelected.map((x, i) => ({ ...x, index: i }))
    );
  }, [parameterSelected]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    setTags(newTags);
    setEditInputIndex(-1);
    setInputValue("");
  };

  const [disabled, setDisabled] = useState(() => {
    let result = false;
    const mode = searchParams.get("mode");
    if (mode == "ReadOnly") {
      result = true;
    }
    return result;
  });

  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  const columnsParameter: IColumns<IParameterList> = [
    {
      ...getDefaultColumnProps("nombre", "Parametro", {
        searchState,
        setSearchState,
        width: "40%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "40%",
        windowSize: windowWidth,
      }),
      render: (value: any, row: any) => {
        return (
          <>
            <Link
              onClick={() => {
                navigate(
                  `/parameters/${row?.id}?mode=${searchParams.get(
                    "mode"
                  )}&search=${searchParams.get("search") ?? "all"}`
                );
              }}
            >
              {value}
            </Link>
          </>
        );
      },
    },
    {
      title: "Aparición",
      dataIndex: "i",
      width: "10%",
      render: (_value, _item, i) => i + 1,
    },
    {
      title: "Orden",
      dataIndex: "sort",
      width: "10%",
      className: "drag-visible",
      render: () => <DragHandle />,
    },
  ];

  const columnsIndication: IColumns<IIndicationList> = [
    {
      ...getDefaultColumnProps("nombre", "Indicación", {
        searchState,
        setSearchState,
        width: "45%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "45%",
        windowSize: windowWidth,
      }),
    },
  ];
  useEffect(() => {
    form.setFieldValue("activo", true);
  }, []);

  useEffect(() => {
    const readStudy = async (id: number) => {
      setLoading(true);
      const all = await getAll("all");
      const user = await getById(id);
      await getareaOptions(user?.departamento!);
      if (user?.workLists != "" && user?.workLists != null) {
        var tags = user.workLists.split("-");
        setTags(tags);
      }
      setParameterSelected(user?.parameters!);
      setIndicationSelected(user?.indicaciones!);
      form.setFieldsValue(user!);
      setValues(user!);

      setLoading(false);
    };
    if (id) {
      readStudy(Number(id));
    }
  }, [form, getById, id]);
  useEffect(() => {
    const readDepartments = async () => {
      await getDepartmentOptions();
    };
    readDepartments();
  }, [getDepartmentOptions]);

  useEffect(() => {
    const readTapon = async () => {
      await getTaponOption();
    };
    readTapon();
  }, [getTaponOption]);
  useEffect(() => {
    const readPrint = async () => {
      await getPrintFormatsOptions();
    };

    readPrint();
  }, [getPrintFormatsOptions]);
  useEffect(() => {
    const readPrint = async () => {
      await getMethodOptions();
    };

    readPrint();
  }, [getMethodOptions]);
  useEffect(() => {
    const readMaquilador = async () => {
      await getMaquiladorOptions();
    };
    readMaquilador();
  }, [getMaquiladorOptions]);
  useEffect(() => {
    const readsampleType = async () => {
      await getsampleTypeOptions();
    };
    readsampleType();
  }, [getsampleTypeOptions]);
  useEffect(() => {
    const readWorkList = async () => {
      await getworkListOptions2();
    };
    readWorkList();
  }, [getworkListOptions2]);
  useEffect(() => {
    const readParameter = async () => {
      await getParameterOptions();
    };
    readParameter();
  }, [getParameterOptions]);
  useEffect(() => {
    const readIndication = async () => {
      await getIndication();
    };
    readIndication();
  }, [getIndication]);
  useEffect(() => {
    const readReagent = async () => {
      await getReagentOptions();
    };
    readReagent();
  }, [getReagentOptions]);
  const actualStudy = () => {
    if (id) {
      const index = study.findIndex((x) => x.id === Number(id));
      return index + 1;
    }
    return 0;
  };
  const siguienteStudy = (index: number) => {
    const estudio = study[index];

    navigate(
      `/${views.study}/${estudio?.id}?mode=${searchParams.get("mode")}&search=${
        searchParams.get("search") ?? "all"
      }`
    );
  };
  const onFinish = async (newValues: IStudyForm) => {
    setLoading(true);
    const User = { ...values, ...newValues };
    User.parameters = [...parameterSelectedSource];
    User.indicaciones = [...indicationSelected];
    let success = false;
    var worklist = "";
    for (var i = 0; i < tags.length; i++) {
      if (i == 0) {
        worklist += tags[i];
      } else {
        worklist += `-${tags[i]}`;
      }
    }
    User.workLists = worklist;
    if (!User.id) {
      success = await create(User);
    } else {
      success = await update(User);
    }

    if (success) {
      navigate(`/${views.study}?search=${searchParams.get("search") || "all"}`);
    }
    setLoading(false);
  };
  const onValuesChange = async (changeValues: any) => {
    const fields = Object.keys(changeValues)[0];
    if (fields === "departamento") {
      const value = changeValues[fields];
      await getareaOptions(value);
    }
    if (fields === "diasrespuesta") {
      const value = changeValues[fields];
      let horas = value * 24;
      horas = Math.round(horas * 100) / 100;
      form.setFieldsValue({ tiemporespuesta: horas });
    }
    if (fields === "tiemporespuesta") {
      const value = changeValues[fields];
      let dias = value / 24;
      if (dias < 1) {
        dias = 0;
      } else {
        dias = Math.round(dias * 100) / 100;
      }

      form.setFieldsValue({ diasrespuesta: dias });
    }
  };

  const deleteParameter = () => {
    const filterList = parameterSelectedSource.filter(
      (x) => !selectedRowKeysp.includes(x.index!)
    );
    setParameterSelectedSource(filterList);
    setSelectedRowKeysp([]);
  };

  const deleteIndicacion = () => {
    const filterList = indicationSelected.filter(
      (x) => !selectedRowKeysi.includes(x.id)
    );
    setIndicationSelected(filterList);
    setSelectedRowKeysi([]);
  };

  const onSelectChangep = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeysp(newSelectedRowKeys);
  };
  const rowSelectionp = {
    selectedRowKeysp,
    onChange: onSelectChangep,
  };
  const onSelectChangei = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeysi(newSelectedRowKeys);
  };
  const rowSelectioni = {
    selectedRowKeysi,
    onChange: onSelectChangei,
  };
  const columns: IColumns<IPacketList> = [
    {
      ...getDefaultColumnProps("id", "Id", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("nombre", "Paquete", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
  ];

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        parameterSelectedSource.slice(),
        oldIndex,
        newIndex
      ).filter((el: IParameterList) => !!el);
      setParameterSelectedSource(newData);
    }
  };

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow: React.FC<any> = ({
    className,
    style,
    ...restProps
  }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = parameterSelectedSource.findIndex(
      (x) => x.index === restProps["data-row-key"]
    );
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <Spin spinning={loading || load}>
      <Row style={{ marginBottom: 24 }}>
        <Col md={12} sm={24} xs={12} style={{ textAlign: "left" }}>
          {id && (
            <Pagination
              size="small"
              total={study.length}
              pageSize={1}
              current={actualStudy()}
              onChange={(value) => {
                siguienteStudy(value - 1);
              }}
              showSizeChanger={false}
            />
          )}
        </Col>
        {!disabled && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                navigate(`/${views.study}`);
              }}
            >
              Cancelar
            </Button>
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
        {disabled && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "right" }}>
            <ImageButton
              key="edit"
              title="Editar"
              image="editar"
              onClick={() => {
                setDisabled(false);
                navigate(
                  `/${views.study}/${id}?mode=edit&search=${
                    searchParams.get("search") ?? "all"
                  }`
                );
              }}
            />
          </Col>
        )}
      </Row>
      <div style={{ display: load ? "none" : "" }}>
        <div ref={componentRef}>
          {load && (
            <PageHeader
              ghost={false}
              title={<HeaderTitle title="Catálogo Estudios" image="estudio" />}
              className="header-container"
            ></PageHeader>
          )}
          {load && <Divider className="header-divider" />}
          <Form<IStudyForm>
            {...formItemLayout}
            form={form}
            name="study"
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            scrollToFirstError
          >
            <Row gutter={[30,12]}>
              <Col md={8} sm={24} xs={8}>
                <TextInput
                  formProps={{
                    name: "clave",
                    label: "Clave",
                  }}
                  max={100}
                  required
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <SelectInput
                  formProps={{ name: "departamento", label: "Departamento" }}
                  options={departmentOptions.filter((x) => x.value != 1)}
                  readonly={disabled}
                  required
                />
              </Col>
             {/* <Col md={8} xs={8}>
                <SelectInput
                  formProps={{ name: "tapon", label: "Etiqueta" }}
                  options={taponOption}
                  readonly={disabled}
                  required
                />
                </Col>*/}

              <Col md={8} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "orden",
                    label: "Orden",
                  }}
                  max={99999999}
                  min={0}
                  required
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <SelectInput
                  formProps={{ name: "area", label: "Área" }}
                  options={areas}
                  readonly={disabled}
                  required
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "cantidad",
                    label: "Cantidad",
                  }}
                  min={1}
                  max={999999}
                  readonly={disabled}
                  required
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <TextInput
                  formProps={{
                    name: "nombre",
                    label: "Nombre",
                  }}
                  max={100}
                  required
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <SelectInput
                  formProps={{ name: "maquilador", label: "Maquilador" }}
                  options={MaquiladorOptions}
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <SelectInput
                  formProps={{ name: "tipomuestra", label: "Tipo de muestra" }}
                  options={sampleTypeOptions}
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <TextInput
                  formProps={{
                    name: "titulo",
                    label: "Titulo",
                  }}
                  max={100}
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}>
                <SelectInput
                  formProps={{ name: "metodo", label: "Método" }}
                  options={MethodOptions}
                  readonly={disabled}
                />
              </Col>
              <Col md={8} xs={8}>
                <NumberInput
                  formProps={{
                    name: "diasrespuesta",
                    label: "Días de respuesta",
                    
                  }}
                  min={0}
                  max={9}
                  readonly={disabled}
                />
              </Col>

              <Col md={8} sm={24} xs={8}>
                <TextInput
                  formProps={{
                    name: "nombreCorto",
                    label: "Nombre corto",
                    labelCol:{xs:8}
                  }}
                  max={100}
                  readonly={disabled}
                />
              </Col>

              <Col md={8} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "tiemporespuesta",
                    label: "Tiempo de respuesta",
                  }}
                  min={1}
                  max={999999}
                  readonly={disabled}
                />
              </Col>

              <Col md={8} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "diasRefrigeracion",
                    label: "Días de refrigeración",
                  }}
                  min={0}
                  max={999999}
                  readonly={disabled}
                />
              </Col>
              <Col md={4} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "dias",
                    label: "Días",
                  }}
                  min={0}
                  max={9999999999999999}
                  readonly={!visible || disabled}
                />
              </Col>

              <Col md={4} sm={24} xs={6}>
                <SwitchInput
                  name="prioridad"
                  label="Prioridad"
                  readonly={disabled}
                />
              </Col>

              <Col md={12} sm={24} xs={8}>
                <NumberInput
                  formProps={{
                    name: "diasEstabilidad",
                    label: "Días de estabilidad en refrigeración",
                  }}
                  min={0}
                  max={999999}
                  readonly={disabled}
                />
              </Col>
              <Col md={4} xs={6}>
                <SwitchInput
                  name="urgencia"
                  label="Urgencia"
                  readonly={disabled}
                />
              </Col>
              <Col md={4} sm={24} xs={6}>
                <SwitchInput
                  name="visible"
                  label="Visible"
                  onChange={(values) => {
                    setVisible(values);
                  }}
                  readonly={disabled}
                />
              </Col>

              <Col md={4} sm={24} xs={6}>
                <SwitchInput
                  name="activo"
                  label="Activo"
                  onChange={(value) => {
                    if (value) {
                      alerts.info(messages.confirmations.enable);
                    } else {
                      alerts.info(messages.confirmations.disable);
                    }
                  }}
                  readonly={disabled}
                />
              </Col>
              <Col md={8} sm={24} xs={8}></Col>
              <Col md={8} sm={24} xs={8}>
                <TextAreaInput
                  formProps={{
                    name: "instrucciones",
                    label: "Instrucciones",
                  }}
                  rows={6}
                />
              </Col>
            </Row>
          </Form>
          <div></div>
          <PageHeader
            ghost={false}
            title={<HeaderTitle title="Listas de trabajo" />}
            className="header-container"
          ></PageHeader>
          {tags.map((tag, index) => {
            if (editInputIndex === index) {
              return (
                <Input
                  ref={editInputRef}
                  key={tag}
                  size="small"
                  className="tag-input"
                  value={editInputValue}
                  onChange={handleEditInputChange}
                  onBlur={handleEditInputConfirm}
                  onPressEnter={handleEditInputConfirm}
                />
              );
            }

            const isLongTag: boolean = tag.length > 20;

            const tagElem = (
              <Tag
                className="edit-tag"
                key={tag}
                closable={true}
                onClose={() => handleClose(tag)}
              >
                <span
                  onDoubleClick={(e) => {
                    if (index !== 0) {
                      setEditInputIndex(index);
                      setEditInputValue(tag);
                      e.preventDefault();
                    }
                  }}
                >
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </span>
              </Tag>
            );
            return isLongTag ? (
              <Tooltip title={tag} key={tag}>
                {tagElem}
              </Tooltip>
            ) : (
              tagElem
            );
          })}
          {inputVisible && (
            <Input
              ref={inputRef}
              type="text"
              size="small"
              className="tag-input"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <Tag className="site-tag-plus" onClick={showInput}>
              <PlusOutlined /> Nueva
            </Tag>
          )}
          <Divider className="header-divider" />
          <PageHeader
            ghost={false}
            title={<HeaderTitle title="Parámetros del estudio" />}
            className="header-container"
            extra={[
              selectedRowKeysp.length > 0 ? (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    deleteParameter();
                  }}
                >
                  Eliminar
                </Button>
              ) : (
                ""
              ),
              <Button
                type="primary"
                onClick={async () => {
                  await ParameterModal(parameterSelected);
                }}
              >
                Buscar
              </Button>,
            ]}
          ></PageHeader>
          <Divider className="header-divider" />
        </div>
        <Table<IParameterList>
          size="small"
          rowKey={(record) => record.index ?? -1}
          columns={columnsParameter}
          pagination={false}
          dataSource={[...parameterSelectedSource]}
          scroll={{
            x: windowWidth < resizeWidth ? "max-content" : "auto",
          }}
          rowSelection={rowSelectionp}
          components={{
            body: {
              wrapper: DraggableContainer,
              row: DraggableBodyRow,
            },
          }}
        />
        <br />

        <PageHeader
          ghost={false}
          title={<HeaderTitle title="Indicaciones del estudio" />}
          className="header-container"
          extra={[
            selectedRowKeysi.length > 0 ? (
              <Button type="primary" danger onClick={deleteIndicacion}>
                Eliminar
              </Button>
            ) : (
              ""
            ),
            <Button
              type="primary"
              onClick={async () => {
                await IndicationModal(indicationSelected);
              }}
            >
              Buscar
            </Button>,
          ]}
        ></PageHeader>
        <Divider className="header-divider" />
      </div>
      <Table<IIndicationList>
        size="small"
        rowKey={(record) => record.id}
        columns={columnsIndication}
        pagination={false}
        dataSource={[...indicationSelected]}
        scroll={{
          x: windowWidth < resizeWidth ? "max-content" : "auto",
        }}
        rowSelection={rowSelectioni}
      />
      <Row>
        <Col md={24} sm={12} style={{ marginRight: 20, textAlign: "center" }}>
          <PageHeader
            ghost={false}
            title={
              <HeaderTitle title="Paquete donde se encuentra el estudio" />
            }
            className="header-container"
          ></PageHeader>
          <Divider className="header-divider" />
          <Table<IPacketList>
            size="small"
            columns={columns.slice(0, 3)}
            pagination={false}
            dataSource={[...(values.paquete ?? [])]}
            scroll={{
              x: windowWidth < resizeWidth ? "max-content" : "auto",
            }}
          />
        </Col>
      </Row>
    </Spin>
  );
};
export default observer(StudyForm);
// function SortableHandle(arg0: () => JSX.Element) {
//   throw new Error("Function not implemented.");
// }
