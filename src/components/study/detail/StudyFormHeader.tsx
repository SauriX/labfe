import { Button, PageHeader, Input } from "antd";
import React, { FC } from "react";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import {  PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import ImageButton from "../../../app/common/button/ImageButton";
type StudyFormHeaderProps = {
  handlePrint: () => void;
  handleList:() => void;
};
type UrlParams = {
    id: string;
};
const StudyFormHeader: FC<StudyFormHeaderProps> = ({ handlePrint,handleList }) => {
    let { id } = useParams<UrlParams>();
    let navigate = useNavigate();
    return (
      <PageHeader
        ghost={false}
        title={<HeaderTitle title="Catálogo Estudios" image="estudios" />}
        className="header-container"
        extra={[
            <ImageButton key="print" title="Imprimir" image="print" onClick={handlePrint} />,
            id?<ImageButton key="doc" title="Informe" image="doc" onClick={handleList }/>:"",
            <ImageButton
                key="back"
                title="Regresar"
                image="back"
                onClick={() => {
                    navigate("/study");
                }}
            />,
        ]}
      ></PageHeader>
    );
}
export default StudyFormHeader;