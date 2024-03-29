import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useStore } from "../app/stores/store";
import ParameterTable from "../components/parameter/ParameterTable";
import ParameterHeader from "../components/parameter/ParameterHeader";

const Parameter = () => {
  const { parameterStore } = useStore();
  const { exportList } = parameterStore;
  const [printing, setPrinting] = useState(false);
  const [accessing, setAccessing] = useState(true);
  const [searchParams] = useSearchParams();
  const handleDownload = async () => {
    setPrinting(true);
    var succes = await exportList(searchParams.get("search") ?? "all");
    if (succes) {
      setPrinting(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      //await access();
      setAccessing(false);
    };

    checkAccess();
  });

  useEffect(() => {
    return () => {
      setAccessing(true);
    };
  }, []);
  const componentRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      setPrinting(true);
    },
    onAfterPrint: () => {
      setPrinting(false);
    },
  });
  if (accessing) return null;

  return (
    <Fragment>
      <ParameterHeader handleList={handleDownload}></ParameterHeader>
      <Divider className="header-divider" />
      <ParameterTable></ParameterTable>
    </Fragment>
  );
};

export default observer(Parameter);
