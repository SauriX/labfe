import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  PageHeader,
  Row,
  Table,
} from "antd";
import React, { FC, Fragment, useEffect, useState } from "react";
import {
  defaultRecordRequestPagination,
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
import {
  IProceedingList,
  ISearchMedical,
  SearchMedicalFormValues,
} from "../../app/models/Proceeding";

import DateRangeInput from "../../app/common/form/proposal/DateRangeInput";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import TextInput from "../../app/common/form/proposal/TextInput";
import { formItemLayout } from "../../app/util/utils";
import { useForm } from "antd/lib/form/Form";
import DateInput from "../../app/common/form/proposal/DateInput";
import { IOptions } from "../../app/models/shared";
import MaskInput from "../../app/common/form/proposal/MaskInput";

type ProceedingTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};

const ProceedingTable: FC<ProceedingTableProps> = ({
  componentRef,
  printing,
}) => {
  const { procedingStore, optionStore, locationStore, profileStore } =
    useStore();
  const { expedientes, getnow, setSearch, search } = procedingStore;
  const { branchCityOptions, getBranchCityOptions } = optionStore;
  const { getCity } = locationStore;
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();
  const [cityOptions, setCityOptions] = useState<IOptions[]>([]);
  const [branchOptions, setBranchOptions] = useState<IOptions[]>([]);

  const { width: windowWidth } = useWindowDimensions();
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });
  const selectedCity = Form.useWatch("ciudad", form);

  useEffect(() => {
    getBranchCityOptions();
  }, [getBranchCityOptions]);

  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x: any) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);

  useEffect(() => {
    setBranchOptions(
      branchCityOptions.find((x: any) => selectedCity?.includes(x.value))
        ?.options ?? []
    );
    form.setFieldValue("sucursal", []);
  }, [branchCityOptions, form, selectedCity]);

  useEffect(() => {
    const readData = async () => {
      await getCity();
    };
    readData();
  }, [getCity]);

  useEffect(() => {
    const readPriceList = async () => {
      setLoading(true);
      await getnow(search!);
      setLoading(false);
    };

    readPriceList();
  }, [getnow]);

  useEffect(() => {
    onfinish(new SearchMedicalFormValues());
  }, []);

  const onfinish = async (values: ISearchMedical) => {
    setLoading(true);
    if (values.fechaNacimiento === null) {
      delete values.fechaNacimiento;
    }
    if (values.fechaNacimiento != null) {
      console.log(values.fechaNacimiento, "nacimiento");
      values.fechaNacimiento = values.fechaNacimiento!.utcOffset(0, true);
    }

    if (values.fechaAlta != null) {
      values.fechaAlta = [
        values.fechaAlta![0].utcOffset(0, true),
        values.fechaAlta![1].utcOffset(0, true),
      ];
    }
    setSearch(values);
    await getnow(values!);
    setLoading(false);
  };

  const columns: IColumns<IProceedingList> = [
    {
      ...getDefaultColumnProps("expediente", "Expediente", {
        searchState,
        setSearchState,
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value, Proceeding) => (
        <Button
          type="link"
          onClick={() => {
            navigate(
              `/${views.proceeding}/${Proceeding.id}?${searchParams}&mode=readonly`
            );
          }}
        >
          {value}
        </Button>
      ),
    },
    {
      ...getDefaultColumnProps("nomprePaciente", "Nombre del paciente", {
        searchState,
        setSearchState,
        width: "25%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("genero", "Sexo", {
        searchState,
        setSearchState,
        width: "5%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("edad", "Edad", {
        searchState,
        setSearchState,
        width: "5%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("fechaNacimiento", "Fecha de nacimiento", {
        searchState,
        setSearchState,
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("monederoElectronico", "Monedero electrónico", {
        searchState,
        setSearchState,
        width: "15%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("telefono", "Teléfono", {
        searchState,
        setSearchState,
        width: "10%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      key: "editar",
      dataIndex: "id",
      title: "Editar",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (value) => (
        <IconButton
          title="Editar Expediente"
          icon={<EditOutlined />}
          onClick={() => {
            navigate(`/${views.proceeding}/${value}?${searchParams}&mode=edit`);
          }}
        />
      ),
    },
  ];

  const PriceListTablePrint = () => {
    return (
      <div ref={componentRef}>
        <PageHeader
          ghost={false}
          title={<HeaderTitle title="Catálogo de Lista de Expedientes" />}
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
  };

  return (
    <Fragment>
      <div className="status-container">
        <Form<ISearchMedical>
          {...formItemLayout}
          form={form}
          onFinish={onfinish}
          size="small"
          initialValues={new SearchMedicalFormValues()}
          scrollToFirstError
        >
          <Row justify="space-between" gutter={[0, 12]}>
            <Col span={8}>
              <TextInput
                formProps={{
                  name: "expediente",
                  label: "Expediente/Nombre",
                }}
                autoFocus
              />
            </Col>
            <Col span={8}>
              <DateRangeInput
                formProps={{ label: "Fecha de alta", name: "fechaAlta" }}
                disableAfterDates={true}
              />
            </Col>
            <Col span={8}>
              <MaskInput
                formProps={{
                  name: "telefono",
                  label: "Teléfono",
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
                  return Promise.reject("El campo debe contener 10 dígitos");
                }}
              />
            </Col>
            <Col span={8}>
              <DateInput
                formProps={{
                  label: "Fecha nacimiento",
                  name: "fechaNacimiento",
                }}
                disableAfterDates={true}
              />
            </Col>
            <Col span={8}>
              <Form.Item label="Sucursales" className="no-error-text" help="">
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
            <Col span={8} style={{ textAlign: "right" }}>
              <Button key="clean" htmlType="reset">
                Limpiar
              </Button>
              <Button key="filter" type="primary" htmlType="submit">
                Filtrar
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <br />
      <Table<IProceedingList>
        loading={loading || printing}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={expedientes}
        pagination={defaultRecordRequestPagination}
        sticky
        scroll={{ x: windowWidth < resizeWidth ? "max-content" : "auto" }}
      />
      <div style={{ display: "none" }}>{<PriceListTablePrint />}</div>
    </Fragment>
  );
};

export default observer(ProceedingTable);
