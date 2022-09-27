import {
  Spin,
  Form,
  Row,
  Col,
  Pagination,
  Button,
  Divider,
  PageHeader,
  Table,
} from "antd";
import React, { FC, useEffect, useState } from "react";
import { formItemLayout } from "../../../app/util/utils";
import TextInput from "../../../app/common/form/proposal/TextInput";
import SwitchInput from "../../../app/common/form/proposal/SwitchInput";
import SelectInput from "../../../app/common/form/proposal/SelectInput";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../../../app/stores/store";
import ImageButton from "../../../app/common/button/ImageButton";
import alerts from "../../../app/util/alerts";
import messages from "../../../app/util/messages";
import { observer } from "mobx-react-lite";
import {
  IParameterForm,
  ParameterFormValues,
} from "../../../app/models/parameter";
import ValorType from "./ValorType/ValorType";
import { IOptions } from "../../../app/models/shared";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { IStudyList } from "../../../app/models/study";
import {
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../../app/common/table/utils";
import useWindowDimensions, { resizeWidth } from "../../../app/util/window";
import NumberInput from "../../../app/common/form/NumberInput";
import { IReagentList } from "../../../app/models/reagent";
import { ParameterReagentModal } from "../ParameterReagentModal";
type ParameterFormProps = {
  componentRef: React.MutableRefObject<any>;
  load: boolean;
};
type UrlParams = {
  id: string;
};

const functionOptions: IOptions[] = [
  { label: "ROUND()", value: "ROUND([VALOR])" },
  { label: "FORMAT()", value: "FORMAT([VALOR])" },
];

const ParameterForm: FC<ParameterFormProps> = ({ componentRef, load }) => {
  const { parameterStore, optionStore } = useStore();
  const {
    getAll,
    parameters,
    getById,
    create,
    update,
    reagentsSelected,
    setReagentSelected,
  } = parameterStore;
  const {
    getDepartmentOptions,
    departmentOptions,
    getareaOptions,
    areas,
    getReagentOptions,
    reagents,
    getPrintFormatsOptions,
    printFormat,
    getParameterOptions,
    getUnitOptions,
    UnitOptions,
  } = optionStore;
  const [form] = Form.useForm<IParameterForm>();
  const [flag, setFlag] = useState(0);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const { width: windowWidth } = useWindowDimensions();
  let navigate = useNavigate();
  const [values, setValues] = useState<IParameterForm>(
    new ParameterFormValues()
  );
  const [ValueType, setValueType] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursorPosition, setCursorPosition] = useState(0);
  let { id } = useParams<UrlParams>();
  const tipodeValorList: IOptions[] = [
    { value: 0, label: "Sin valor" },
    { value: 1, label: "Numérico" },
    { value: 2, label: "Numérico por sexo" },
    { value: 3, label: "Numérico por edad" },
    { value: 4, label: "Numérico por edad y sexo" },
    { value: 5, label: "Opción múltiple" },
    { value: 6, label: "Numérico con una columna" },
    { value: 7, label: "Texto" },
    { value: 8, label: "Párrafo" },
    { value: 9, label: "Etiqueta" },
    { value: 10, label: "Observación" },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const readuser = async (idUser: string) => {
      setLoading(true);

      const parameter = await getById(idUser);
      setReagentSelected(parameter!.reactivos);
      await getareaOptions(parameter?.areaId);
      let val = parameter!.tipoValor | 0;
      setValueType(val);
      form.setFieldsValue(parameter!);
      setValues(parameter!);
      setLoading(false);
    };
    if (id) {
      readuser(id);
    }
  }, [form, getById, id]);
  useEffect(() => {
    const readdepartments = async () => {
      await getDepartmentOptions();
    };
    readdepartments();
  }, [getDepartmentOptions]);

  useEffect(() => {
    const readdepartments = async () => {
      await getUnitOptions();
    };
    readdepartments();
  }, [getUnitOptions]);
  useEffect(() => {
    const readReagents = async () => {
      await getReagentOptions();
    };
    readReagents();
  }, [getareaOptions]);
  useEffect(() => {
    const readPrint = async () => {
      await getPrintFormatsOptions();
    };

    readPrint();
  }, [getPrintFormatsOptions]);
  useEffect(() => {
    const readUsers = async () => {
      setLoading(true);
      await getAll(searchParams.get("search") ?? "all");
      setLoading(false);
    };
    readUsers();
  }, [getAll, searchParams]);
  useEffect(() => {
    const read = async () => {
      await getParameterOptions();
    };
    read();
  }, [getParameterOptions]);
  const CheckReadOnly = () => {
    let result = false;
    const mode = searchParams.get("mode");
    if (mode == "ReadOnly") {
      result = true;
    }
    return result;
  };
  const actualParameter = () => {
    if (id) {
      const index = parameters.findIndex((x) => x.id === id);
      return index + 1;
      return 1;
    }
    return 0;
  };
  const siguienteParameter = (index: number) => {
    console.log(id);
    const parameter = parameters[index];

    navigate(
      `/parameters/${parameter?.id}?mode=${searchParams.get("mode")}&search=${
        searchParams.get("search") ?? "all"
      }`
    );
  };
  const onFinish = async (newValues: IParameterForm) => {
    setLoading(true);
    console.log("sumit");
    console.log(newValues);
    const Parameter = { ...values, ...newValues };
    Parameter.reactivos = [...reagentsSelected];
    console.log(Parameter);
    Parameter.tipoValor = Parameter.tipoValor.toString();
    let success = false;
    if (!Parameter.id) {
      console.log("create");
      success = await create(Parameter);
    } else {
      console.log("update");
      success = await update(Parameter);
    }
    setLoading(false);
    if (success && flag == 0) {
      setReagentSelected([]);
      navigate(`/parameters?search=${searchParams.get("search") || "all"}`);
    }
  };
  const onValuesChange = async (changeValues: any, values: any) => {
    const fields = Object.keys(changeValues)[0];
    if (fields === "tipoValor") {
      const value = changeValues[fields];
      values.tipoValor = value;
      values.id = id;
      setValueType(value);

      setValues(values);
      console.log("values");
      console.log(values);
      setFlag(1);
    }
    if (fields === "departamentoId") {
      const value = changeValues[fields];
      await getareaOptions(value);
    }
    if (fields === "funciones") {
      console.log("Formula");
      const value = changeValues[fields];
      const original = values.formula.split("");
      original.splice(cursorPosition, 0, value);
      const newString = original.join("");
      form.setFieldsValue({ formula: newString, funciones: undefined });
    }

    if (fields === "parametros") {
      console.log("Formula");
      const value = changeValues[fields];
      const original = values.formula.split("");
      original.splice(cursorPosition, 0, value);
      const newString = original.join("");
      form.setFieldsValue({ formula: newString, parametros: undefined });
    }
  };
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  const columns: IColumns<IStudyList> = [
    {
      ...getDefaultColumnProps("id", "Clave Estudio", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("nombre", "Estudio", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
  ];

  const columnsReagent: IColumns<IReagentList> = [
    {
      ...getDefaultColumnProps("nombre", "Reactivo", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("claveSistema", "Clave Contpaq", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("nombreSistema", "Nombre Contpaq", {
        searchState,
        setSearchState,
        width: "30%",
        windowSize: windowWidth,
      }),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const deleteReagent = () => {
    const filterList = reagentsSelected.filter(
      (x) => !selectedRowKeys.includes(x.id)
    );
    setReagentSelected(filterList);
  };

  return (
    <Spin spinning={loading || load}>
      <Row style={{ marginBottom: 24 }}>
        {id && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "left" }}>
            <Pagination
              size="small"
              total={parameters.length}
              pageSize={1}
              current={actualParameter()}
              onChange={(value) => {
                siguienteParameter(value - 1);
              }}
            />
          </Col>
        )}
        {!CheckReadOnly() && (
          <Col md={id ? 12 : 24} sm={24} xs={12} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                navigate(`/parameters`);
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
        {CheckReadOnly() && (
          <Col md={12} sm={24} xs={12} style={{ textAlign: "right" }}>
            <ImageButton
              key="edit"
              title="Editar"
              image="editar"
              onClick={() => {
                navigate(
                  `/parameters/${id}?mode=edit&search=${
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
              title={
                <HeaderTitle title="Catálogo Parámetros" image="parametro" />
              }
              className="header-container"
            ></PageHeader>
          )}
          <Form<IParameterForm>
            {...formItemLayout}
            form={form}
            name="parameter"
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            scrollToFirstError
            onFieldsChange={() => {
              setDisabled(
                !form.isFieldsTouched() ||
                  form.getFieldsError().filter(({ errors }) => errors.length)
                    .length > 0
              );
            }}
          >
            <Row>
              <Col span={24}>
                <Row justify="space-between" gutter={[0, 12]}>
                  <Col span={8}>
                    <TextInput
                      formProps={{
                        name: "clave",
                        label: "Clave",
                      }}
                      max={100}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      formProps={{
                        name: "departamentoId",
                        label: "Departamento",
                      }}
                      options={departmentOptions}
                      readonly={CheckReadOnly()}
                      required
                    />
                  </Col>
                  <Col span={8}>
                    <TextInput
                      formProps={{
                        name: "nombre",
                        label: "Nombre",
                      }}
                      max={100}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      formProps={{ name: "areaId", label: "Área" }}
                      options={areas}
                      readonly={CheckReadOnly()}
                      required
                    />
                  </Col>
                  <Col span={8}>
                    <TextInput
                      formProps={{
                        name: "nombreCorto",
                        label: "Nombre corto",
                      }}
                      max={100}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      formProps={{
                        name: "unidades",
                        label: "Unidades",
                      }}
                      options={UnitOptions}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      formProps={{
                        name: "unidadSi",
                        label: "Unidad SI",
                      }}
                      options={UnitOptions}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SelectInput
                      formProps={{
                        name: "formatoImpresionId",
                        label: "Formato de impresión",
                      }}
                      options={printFormat}
                      readonly={CheckReadOnly()}
                      required
                    />
                  </Col>
                  {id && (
                    <>
                      <Col span={8}>
                        <SelectInput
                          formProps={{
                            name: "tipoValor",
                            label: "Tipo de valor",
                          }}
                          options={tipodeValorList}
                          readonly={CheckReadOnly()}
                          required
                        />
                      </Col>
                      <Col span={8}>
                        <TextInput
                          formProps={{
                            name: "formula",
                            label: "Fórmula",
                          }}
                          max={100}
                          required
                          readonly={CheckReadOnly()}
                          onClick={(e: any) => {
                            const position = e.target.selectionStart ?? 0;
                            setCursorPosition(position);
                          }}
                          onKeyUp={(e: any) => {
                            const position = e.target.selectionStart ?? 0;
                            setCursorPosition(position);
                          }}
                        />
                      </Col>
                      <Col span={8}>
                        <SelectInput
                          formProps={{ name: "funciones", label: "Funciones" }}
                          options={functionOptions}
                          readonly={CheckReadOnly()}
                        />
                      </Col>
                    </>
                  )}
                  <Col span={8}>
                    <TextInput
                      formProps={{
                        name: "fcsi",
                        label: "FCSI",
                      }}
                      max={100}
                      required
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <NumberInput
                      formProps={{
                        name: "valorInicial",
                        label: "Valor Inicial",
                      }}
                      min={1}
                      required
                      readonly={CheckReadOnly()}
                      max={99999999999999999999999}
                    />
                  </Col>
                  <Col span={8}>
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
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                  <Col span={8}>
                    <SwitchInput
                      name="requerido"
                      label="Requerido"
                      onChange={(value) => {
                        if (value) {
                          alerts.info(messages.confirmations.required);
                        } else {
                          alerts.info(messages.confirmations.unrequired);
                        }
                      }}
                      readonly={CheckReadOnly()}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
          <ValorType form={values} value={ValueType}></ValorType>
          <Row>
            <Col
              md={24}
              sm={12}
              style={{ marginRight: 20, textAlign: "center" }}
            >
              <PageHeader
                ghost={false}
                title={
                  <HeaderTitle title="Estudios donde se encuentra el parámetro" />
                }
                className="header-container"
              ></PageHeader>
              <Divider className="header-divider" />
              <Table<IStudyList>
                size="small"
                rowKey={(record) => record.id}
                columns={columns.slice(0, 3)}
                pagination={false}
                dataSource={[...(values.estudios ?? [])]}
                scroll={{
                  x: windowWidth < resizeWidth ? "max-content" : "auto",
                }}
              />
              <br />
              <PageHeader
                ghost={false}
                title={
                  <HeaderTitle title="Reactivos donde se encuentra el parámetro" />
                }
                className="header-container"
                extra={[
                  reagentsSelected.length > 0 && selectedRowKeys.length > 0 ? (
                    <Button type="primary" danger onClick={deleteReagent}>
                      Eliminar
                    </Button>
                  ) : (
                    ""
                  ),
                  <Button
                    type="primary"
                    onClick={async () => {
                      await ParameterReagentModal(
                        reagentsSelected.map((x) => x.id)
                      );
                    }}
                  >
                    Buscar
                  </Button>,
                ]}
              ></PageHeader>
              <Divider className="header-divider" />
              <Table<IReagentList>
                size="small"
                rowKey={(record) => record.id}
                columns={columnsReagent}
                pagination={false}
                dataSource={[...reagentsSelected]}
                scroll={{
                  x: windowWidth < resizeWidth ? "max-content" : "auto",
                }}
                rowSelection={rowSelection}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Spin>
  );
};
export default observer(ParameterForm);
