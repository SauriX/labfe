import { Button, PageHeader, Divider, Table } from "antd";
import React, { FC, Fragment, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import useWindowDimensions, { resizeWidth } from "../../../../app/util/window";
import HeaderTitle from "../../../../app/common/header/HeaderTitle";
import {
  ISearch,
  IColumns,
  getDefaultColumnProps,
  defaultPaginationProperties,
} from "../../../../app/common/table/utils";
import { ICatalogList } from "../../../../app/models/catalog";
import IconButton from "../../../../app/common/button/IconButton";
import { useStore } from "../../../../app/stores/store";
import { reports, catalogs } from "../../../../app/util/catalogs";
import { observer } from "mobx-react-lite";

type CatalogNormalTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
  catalogName: string;
};

const CatalogNormalTable: FC<CatalogNormalTableProps> = ({
  componentRef,
  printing,
  catalogName,
}) => {
  const { catalogStore } = useStore();
  const { catalogs: catalogOption, getAll } = catalogStore;

  const [searchParams] = useSearchParams();

  let navigate = useNavigate();

  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(false);

  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });


  const catalogType = (catalogName: string) => {
    switch (catalogName) {
      case "department":
        return "departamento";
      case "bank":
        return "banco";
      case "clinic":
        return "clínica";
      case "field":
        return "especialidad";
      case "paymentMethod":
        return "método de pago";
      case "payment":
        return "forma de pago";
      case "workList":
        return "lista de trabajo";
      case "delivery":
        return "paquetería";
      case "method":
        return "método";
      case "sampleType":
        return "tipo de muestra";
    }
  };

  const columns: IColumns<ICatalogList> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "20%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value, catalog) => (
        <Button
          type="link"
          onClick={() => {
            navigate(`/catalogs/${catalog.id}?${searchParams}&mode=readonly`);
          }}
        >
          {value}
        </Button>
      ),
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
      key: "activo",
      dataIndex: "activo",
      title: "Activo",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (value) => (value ? "Sí" : "No"),
    },
    {
      key: "editar",
      dataIndex: "id",
      title: "Editar",
      align: "center",
      width: windowWidth < resizeWidth ? 100 : "10%",
      render: (value) => (
        <IconButton
          title={"Editar " + catalogType(catalogName)}
          icon={<EditOutlined />}
          onClick={() => {
            navigate(`/catalogs/${value}?${searchParams}&mode=edit`);
          }}
        />
      ),
    },
  ];

  const CatalogTablePrint = () => {
    return (
      <div ref={componentRef}>
        <PageHeader
          ghost={false}
          title={<HeaderTitle title="Catálogo General" image="catalogo" />}
          className="header-container"
        ></PageHeader>
        <Divider className="header-divider" />
        <Table<any>
          size="small"
          rowKey={(record) => record.id}
          columns={columns.slice(0, 4)}
          pagination={false}
          dataSource={[...catalogOption]}
        />
      </div>
    );
  };

  return (
    <Fragment>
      <Table<ICatalogList>
        loading={loading || printing}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={[...catalogOption]}
        pagination={defaultPaginationProperties}
        sticky
        scroll={{ x: windowWidth < resizeWidth ? "max-content" : "auto" }}
      />
      <div style={{ display: "none" }}>{<CatalogTablePrint />}</div>
    </Fragment>
  );
};

export default observer(CatalogNormalTable);
