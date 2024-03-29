import { Button, Divider, PageHeader, Table } from "antd";
import React, { FC, Fragment, useEffect, useState } from "react";
import {
  defaultPaginationProperties,
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../app/common/table/utils";
import useWindowDimensions, { resizeWidth } from "../../app/util/window";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IReagentList } from "../../app/models/reagent";
import { useStore } from "../../app/stores/store";
import { observer } from "mobx-react-lite";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import views from "../../app/util/view";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import FontIconButton from "../../app/common/button/FontIconButton";

type ReagentTableProps = {
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};

const ReagentTable: FC<ReagentTableProps> = ({ componentRef, printing }) => {
  const { reagentStore } = useStore();
  const { reagents, getAll } = reagentStore;

  const [searchParams] = useSearchParams();

  let navigate = useNavigate();

  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(false);

  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  useEffect(() => {
    const readReagents = async () => {
      setLoading(true);
      await getAll(searchParams.get("search") ?? "all");
      setLoading(false);
    };

    if (reagents.length === 0) {
      readReagents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: IColumns<IReagentList> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "20%",
        minWidth: 150,
        windowSize: windowWidth,
      }),
      render: (value, reagent) => (
        <Button
          type="link"
          onClick={() => {
            navigate(
              `/${views.reagent}/${reagent.id}?${searchParams}&mode=readonly`
            );
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
      ...getDefaultColumnProps("claveSistema", "Clave Contpaq", {
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
        <FontIconButton
          title="Editar reactivo"
          icon={faPencil}
          onClick={() => {
            navigate(`/${views.reagent}/${value}?${searchParams}&mode=edit`);
          }}
        />
      ),
    },
  ];

  const ReagentTablePrint = () => {
    return (
      <div ref={componentRef}>
        <PageHeader
          ghost={false}
          title={<HeaderTitle title="Catálogo de Reactivos" image="reactivo" />}
          className="header-container"
        ></PageHeader>
        <Divider className="header-divider" />
        <Table<IReagentList>
          size="small"
          rowKey={(record) => record.id}
          columns={columns.slice(0, 4)}
          pagination={false}
          dataSource={[...reagents]}
        />
      </div>
    );
  };

  return (
    <Fragment>
      <Table<IReagentList>
        loading={loading || printing}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={[...reagents]}
        pagination={defaultPaginationProperties}
        sticky
        scroll={{ x: windowWidth < resizeWidth ? "max-content" : "auto" }}
      />
      <div style={{ display: "none" }}>{<ReagentTablePrint />}</div>
    </Fragment>
  );
};

export default observer(ReagentTable);
