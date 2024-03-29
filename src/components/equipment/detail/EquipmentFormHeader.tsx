import { Button, PageHeader, Input } from "antd";
import React, { FC } from "react";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { PlusOutlined } from "@ant-design/icons";
import ImageButton from "../../../app/common/button/ImageButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../../app/stores/store";
import PrintIcon from "../../../app/common/icons/PrintIcon";
import DownloadIcon from "../../../app/common/icons/DownloadIcon";
import GoBackIcon from "../../../app/common/icons/GoBackIcon";

const { Search } = Input;
type EquipmentFormHeaderProps = {
  handlePrint: () => void;
  id: number;
};

const EquipmentFormHeader: FC<EquipmentFormHeaderProps> = ({
  id,
  handlePrint,
}) => {
  const { equipmentStore } = useStore();
  const { exportForm } = equipmentStore;

  const navigate = useNavigate();

  const download = () => {
    exportForm(id);
  };

  return (
    <PageHeader
      ghost={false}
      title={<HeaderTitle title="Configuración de Equipo" image="equipo" />}
      className="header-container"
      extra={[
        id != 0 ? <PrintIcon key="print" onClick={handlePrint} /> : "",
        id != 0 ? <DownloadIcon key="doc" onClick={download} /> : "",
        <GoBackIcon
          key="back"
          onClick={() => {
            navigate("/equipment");
          }}
        />,
      ]}
    ></PageHeader>
  );
};

export default EquipmentFormHeader;
