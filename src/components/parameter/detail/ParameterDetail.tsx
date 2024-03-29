import { Divider } from "antd";
import React, { Fragment, useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useStore } from "../../../app/stores/store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import ParameterHeaderForm from "./ParameterHeaderForm";
import ParameterForm from "./ParameterForm";

type UrlParams = {
  id: string;
};

const ParameterDetail = () => {
  const [loading, setLoading] = useState(false);
  const componentRef = useRef<any>();
  const { parameterStore } = useStore();
  const { getById, exportForm, parameter } = parameterStore;
  let { id } = useParams<UrlParams>();

  useEffect(() => {
    const readuser = async (idUser: string) => {
      await getById(idUser);
    };
    if (id) {
      readuser(id);
    }
  }, [getById, id]);
  const handleDownload = async () => {
    setLoading(true);
    const succes = await exportForm(id!);

    if (succes) {
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <ParameterHeaderForm
        handleDownload={handleDownload}
      ></ParameterHeaderForm>
      <Divider className="header-divider" />
      <ParameterForm componentRef={componentRef} load={loading}></ParameterForm>
    </Fragment>
  );
};
export default observer(ParameterDetail);
