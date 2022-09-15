import { Button, PageHeader, Input } from "antd";
import React, { FC } from "react";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../app/common/button/ImageButton";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import views from "../../app/util/view";
import PrintIcon from "../../app/common/icons/PrintIcon";
import DownloadIcon from "../../app/common/icons/DownloadIcon";

const { Search } = Input;

type QuotationHeaderProps = {
  handlePrint: () => void;
  handleDownload: () => Promise<void>;
};

const QuotationHeader: FC<QuotationHeaderProps> = ({
  handlePrint,
  handleDownload,
}) => {
  /*   const {  } = useStore();
  const { scopes, getAll, exportList } = ; */

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const search = async (search: string | undefined) => {
    search = search === "" ? undefined : search;

    /*   await getAll(search ?? "all"); */

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
      title={<HeaderTitle title="Catálogo de Cotizaciones" />}
      className="header-container"
      extra={[
        /* scopes?.imprimir && */ <PrintIcon
          key="print"
          onClick={handlePrint}
        />,
        /* scopes?.descargar && */ <DownloadIcon
          key="doc"
          onClick={handleDownload}
        />,
        /* scopes?.crear && */ <Button
          key="new"
          type="primary"
          onClick={() => {
            navigate(`/${views.quotatiion}/new?${searchParams}&mode=edit`);
          }}
          icon={<PlusOutlined />}
        >
          Nuevo
        </Button>,
      ]}
    ></PageHeader>
  );
};

export default QuotationHeader;
