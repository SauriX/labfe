import { Input, PageHeader } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import DownloadIcon from "../../../app/common/icons/DownloadIcon";
import GoBackIcon from "../../../app/common/icons/GoBackIcon";
import PrintIcon from "../../../app/common/icons/PrintIcon";
import { useStore } from "../../../app/stores/store";
import views from "../../../app/util/view";
import { observer } from "mobx-react-lite";

type ShipmentTrackingProps = {
  handlePrint: () => void;
  handleDownload: () => Promise<void>;
};

const ReceiveTrackingHeader: FC<ShipmentTrackingProps> = ({
  handlePrint,
  handleDownload,
}) => {
  const { routeStore } = useStore();
  const { scopes } = routeStore;

  const navigate = useNavigate();

  const getBack = () => {
    navigate(`/${views.routeTracking}`);
  };

  return (
    <PageHeader
      ghost={false}
      title={
        <HeaderTitle title="Detalle de seguimiento de entrega" image="entrega" />
      }
      className="header-container"
      extra={[
        scopes?.imprimir && <PrintIcon key="print" onClick={handlePrint} />,
        <GoBackIcon key="back" onClick={getBack} />,
        <DownloadIcon key="doc" onClick={handleDownload} />,
      ]}
    ></PageHeader>
  );
};

export default observer(ReceiveTrackingHeader);
