import { Button, PageHeader, Input, Pagination } from "antd";
import React, { FC } from "react";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ImageButton from "../../app/common/button/ImageButton";
import { useStore } from "../../app/stores/store";
import views from "../../app/util/view";
import PrintIcon from "../../app/common/icons/PrintIcon";
import DownloadIcon from "../../app/common/icons/DownloadIcon";

const { Search } = Input;

type PriceListHeaderProps = {
  handlePrint: () => void;
  handleDownload: () => Promise<void>;
};

const PriceListHeader: FC<PriceListHeaderProps> = ({
  handlePrint,
  handleDownload,
}) => {
  const { priceListStore } = useStore();
  const { scopes, getAll } = priceListStore;

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const search = async (search: string | undefined) => {
    search = search === "" ? undefined : search;

    await getAll(search ?? "all");

    if (search) {
      searchParams.set("search", search);
    } else {
      searchParams.delete("search");
    }

    setSearchParams(searchParams);
  };

  return (
    <PageHeader
      ghost={false}
      title={
        <HeaderTitle title="Catálogo de Listas de Precios" image="precio" />
      }
      className="header-container"
      extra={[
        scopes?.imprimir && <PrintIcon key="print" onClick={handlePrint} />,
        scopes?.descargar && (
          <DownloadIcon key="doc" onClick={handleDownload} />
        ),
        <Search
          key="search"
          placeholder="Buscar"
          defaultValue={searchParams.get("search") ?? ""}
          onSearch={search}
        />,
        scopes?.crear && (
          <Button
            key="new"
            type="primary"
            onClick={() => {
              navigate(`/${views.price}/new?${searchParams}&mode=edit`);
            }}
            icon={<PlusOutlined />}
          >
            Nuevo
          </Button>
        ),
      ]}
    ></PageHeader>
  );
};

export default PriceListHeader;
