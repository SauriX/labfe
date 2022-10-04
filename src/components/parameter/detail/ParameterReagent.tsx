import { Form, Row, Col, Button, Typography, Table } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import TextInput from "../../../app/common/form/TextInput";
import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { IReagentList } from "../../../app/models/reagent";
import { store, useStore } from "../../../app/stores/store";
import { useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  ISearch,
  IColumns,
  getDefaultColumnProps,
} from "../../../app/common/table/utils";
import useWindowDimensions, { resizeWidth } from "../../../app/util/window";

const { Paragraph } = Typography;

type Props = {
  getResult: (isAdmin: boolean) => any;
  selectedReagent: React.Key[];
};

const ParameterReagent = ({ getResult, selectedReagent }: Props) => {
  const { reagentStore, parameterStore } = useStore();
  const { getAll, reagents } = reagentStore;
  const { setReagentSelected, getReagentSelected } = parameterStore;
  const { openModal, closeModal } = store.modalStore;
  const [form] = Form.useForm<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSelectedRowKeys(selectedReagent);
  }, []);

  useEffect(() => {
    const readReagents = async () => {
      setLoading(true);
      await getAll("all");
      setLoading(false);
    };

    if (reagents.length === 0) {
      readReagents();
    }
  }, []);

  const search = async (search: string | undefined) => {
    search = search === "" ? undefined : search;
    await getAll(form.getFieldValue("search") ?? "all");
    setSearchParams(searchParams);
  };

  const columns: IColumns<IReagentList> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "20%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre", {
        searchState,
        setSearchState,
        width: "30%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
    },
    {
      ...getDefaultColumnProps("claveSistema", "Clave Contpaq", {
        searchState,
        setSearchState,
        width: "30%",
        minWidth: 150,
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

  const acceptChanges = () => {
    const filterList = reagents.filter((x) =>
      selectedRowKeys.includes(x.id)
    );
    setReagentSelected(filterList);
    closeModal();
  }

  return (
    <Fragment>
      <Row gutter={[12, 12]}>
        <Col span={24} style={{ textAlign: "center" }}>
          <ExclamationCircleOutlined
            style={{ color: "orange", fontSize: 48 }}
          />
        </Col>
        <Col span={24}>
          <Paragraph>
            Favor de ingresar el nombre o clave del reactivo.
          </Paragraph>
        </Col>
        <Col span={24}>
          <Form<any>
            form={form}
            name="searchReagent"
            className="login-form"
            onFinish={search}
          >
            <Row gutter={[12, 12]}>
              <Col md={12} xs={24}>
                <TextInput
                  formProps={{ name: "search" }}
                  max={200}
                  placeholder="Nombre / Clave"
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit">
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      <Table<IReagentList>
        loading={loading}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={[...reagents]}
        sticky
        scroll={{ x: windowWidth < resizeWidth ? "max-content" : "auto" }}
        rowSelection={rowSelection}
      />
      <Button
        type="primary"
        onClick={acceptChanges}
      >
        Aceptar
      </Button>
    </Fragment>
  );
};

export default observer(ParameterReagent);