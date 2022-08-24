import { PageHeader } from "antd";
import React, { FC, useEffect } from "react";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import ImageButton from "../../../app/common/button/ImageButton";
import { useNavigate,useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../../../app/stores/store";
type UserFormHeaderProps = {
  handlePrint: () => void;
  handleDownload:()=>void;
};
type UrlParams = {
  id: string;
};
const UserFormHeader: FC<UserFormHeaderProps> = ({ handlePrint,handleDownload }) => {
  let { id } = useParams<UrlParams>();
  let navigate = useNavigate();
  return (
    <PageHeader
      ghost={false}
      title={<HeaderTitle title="Catálogo usuarios" image="usuario" />}
      className="header-container"
      extra={[
        id?<ImageButton key="print" title="Imprimir" image="print" onClick={handlePrint} />:"",
        id?<ImageButton key="doc" title="Informe" image="doc"  onClick={handleDownload}/>:"",
        <ImageButton
          key="back"
          title="Regresar"
          image="back"
          onClick={() => {
            navigate("/users");
          }}
        />,
      ]}
    ></PageHeader>
  );
};

export default UserFormHeader;
