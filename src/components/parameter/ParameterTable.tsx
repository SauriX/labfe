import { Button, Divider, PageHeader, Spin, Table,Form, Row, Col,  Modal,  } from "antd";
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import {
  defaultPaginationProperties,
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../app/common/table/utils";
import { formItemLayout } from "../../app/util/utils";
import { IParameterList} from "../../app/models/parameter";
import useWindowDimensions, { resizeWidth } from "../../app/util/window";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import IconButton from "../../app/common/button/IconButton";
import { useNavigate,useSearchParams } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import HeaderTitle from "../../app/common/header/HeaderTitle";
type ParameterTableProps = {
    componentRef: React.MutableRefObject<any>;
    printing: boolean;
};
const ParameterTable:FC<ParameterTableProps> = ({  componentRef,  printing }) => {
    const {parameterStore } = useStore();
    const { getAll,parameters } = parameterStore;
    let navigate = useNavigate();
    let id="";
    const { width: windowWidth } = useWindowDimensions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [searchState, setSearchState] = useState<ISearch>({
      searchedText: "",
      searchedColumn: "",
    });
    console.log("Table");
    useEffect(() => {
      const readUsers = async () => {
        setLoading(true);
        await getAll(searchParams.get("search") ?? "all");
        setLoading(false);
      };

      readUsers();
    }, [getAll,  searchParams]);
    const columns: IColumns<IParameterList> = [
      //clave
      {
        ...getDefaultColumnProps("clave", "Clave", {
          searchState,
          setSearchState,
          width: "10%",
          minWidth: 150,
          windowSize: windowWidth,
        }),
        render: (value, parameter) => (
          <Button
            type="link"
            onClick={() => {
              navigate(`/parameters/${parameter.id}?mode=ReadOnly&search=${searchParams.get("search") ?? "all"}`);
            }}
          >
            {value}
          </Button>
        ),
      },
      //nombre
      {
        ...getDefaultColumnProps("nombre", "Nombre", {
          searchState,
          setSearchState,
          width: "15%",
          minWidth: 150,
          windowSize: windowWidth,
        }),
      },
      //nombre corto
      {
        ...getDefaultColumnProps("nombreCorto", "Nombre corto", {
          searchState,
          setSearchState,
          width: "15%",
          minWidth: 150,
          windowSize: windowWidth,
        }),
      },
      //area
      {
        ...getDefaultColumnProps("area", "Área", {
          searchState,
          setSearchState,
          width: "20%",
          minWidth: 150,
          windowSize: windowWidth,
        }),
      },
      //departamento 
      {
        ...getDefaultColumnProps("departamento", "Departamento", {
          searchState,
          setSearchState,
          width: "15%",
          minWidth: 150,
          windowSize: windowWidth,
        }),
      },
      {
        key: "activo",
        dataIndex: "activo",
        title: "Activo",
        align: "center",
        width: windowWidth < resizeWidth ? 100 : "10%",
        render: (value) => (value ? "Sí" : "No"),
      },
      //editar
      {
        key: "editar",
        dataIndex: "id",
        title: "Editar",
        align: "center",
        width: windowWidth < resizeWidth ? 100 : "10%",
        render: (value,parameter) => (
          <IconButton
            title="Editar usuario"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(`/parameters/${parameter.id}?search=${searchParams.get("search") ?? "all"}`);
            }}
          />
        ),
      },
    ];

  const ParameterTablePrint = () =>{
    return(
      <div ref={componentRef}>
          <PageHeader
            ghost={false}
            title={<HeaderTitle title="Catálogo de Parametros" image="parameters" />}
            className="header-container"
          ></PageHeader>
          <Divider className="header-divider" />
          <Table<IParameterList>
            size="large"
            rowKey={(record) => record.id}
            columns={columns.slice(0, 6)}
            pagination={false}
            dataSource={[...parameters]}
          />
      </div>
    );
  }

  return(
    <Fragment>
      <Table<IParameterList>
        loading={loading}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={[...parameters]}
        pagination={defaultPaginationProperties}
        sticky
        scroll={{ x: windowWidth < resizeWidth ? "max-content" : "auto" }}
      />
      <div style={{ display: "none" }}>{< ParameterTablePrint  />}</div>
    </Fragment>
  );
}

export default observer(ParameterTable);