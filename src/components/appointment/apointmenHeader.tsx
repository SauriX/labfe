import { Button, PageHeader, Input } from "antd";
import React, { FC } from "react";
import HeaderTitle from "../../app/common/header/HeaderTitle";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../app/common/button/ImageButton";
import { useStore } from "../../app/stores/store";

const { Search } = Input;
type UserHeaderProps = {
  handlePrint: () => void;
  handleList: () => void;
};
const  ApointmenHeader: FC<UserHeaderProps> = ({ handlePrint, handleList }) => {
  let navigate = useNavigate();
  return (
    <PageHeader
      ghost={false}
      title={<HeaderTitle title="Cita Laboratorio" image="" />}
      className="header-container"
      extra={[
        <ImageButton key="print" title="Imprimir" image="print" onClick={handlePrint} />,
        <ImageButton key="doc" title="Informe" image="doc" onClick={handleList} />,
      ]}
    ></PageHeader>
  );
};

export default ApointmenHeader;
