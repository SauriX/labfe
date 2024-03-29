import { Button, Input, PageHeader, Typography } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../app/common/button/ImageButton";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import { useStore } from "../../app/stores/store";
import { PlusOutlined } from "@ant-design/icons";
import PrintIcon from "../../app/common/icons/PrintIcon";
import DownloadIcon from "../../app/common/icons/DownloadIcon";
import { observer } from "mobx-react-lite";

const { Text } = Typography;

const { Search } = Input;

type RouteHeaderProps = {
  handlePrint: () => void;
  handleDownload: () => Promise<void>;
};

const RouteTrackingHeader: FC<RouteHeaderProps> = ({
  handlePrint,
  handleDownload,
}) => {
  const { routeStore, profileStore, optionStore } = useStore();
  const { scopes, getAll } = routeStore;
  const { profile } = profileStore;
  const { BranchOptions, getBranchOptions } = optionStore;

  const [currentBranch, setCurrentBranch] = useState<string | undefined>("");

  useEffect(() => {
    getBranchOptions();
  }, []);

  useEffect(() => {
    if (profile && !!BranchOptions.length) {
      const branch = BranchOptions.find((x) => x.value === profile?.sucursal);
      setCurrentBranch(branch?.label as string);
    }
  }, [BranchOptions, profile]);



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
      title={<HeaderTitle title="Seguimiento de Rutas" image="ruta" />}
      className="header-container"
      extra={[
        scopes?.imprimir && <PrintIcon key="print" onClick={handlePrint} />,
        scopes?.descargar && (
          <DownloadIcon key="doc" onClick={handleDownload} />
        ),
        <Text>
          Sucursal activa: <strong>{currentBranch}</strong>
        </Text>,
        scopes?.crear && (
          <Button
            key="new"
            type="primary"
            onClick={() => {
              navigate("new");
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

export default observer(RouteTrackingHeader);
