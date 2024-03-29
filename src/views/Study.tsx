import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useStore } from "../app/stores/store";
import StudyHeader from "../components/study/StudyHeader";
import StudyTable from "../components/study/StudyTable";
const Study = () => {
  const { studyStore } = useStore();
  const { scopes, access, clearScopes, exportList } = studyStore;
  const [printing, setPrinting] = useState(false);
  const [accessing, setAccessing] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
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
  useEffect(() => {
    const checkAccess = async () => {
      await access();
      setAccessing(false);
    };

    checkAccess();
  }, [access]);
  useEffect(() => {
    return () => {
      clearScopes();
    };
  }, [clearScopes]);
  useEffect(() => {
    return () => {
      setAccessing(true);
    };
  }, []);
  if (!scopes?.acceder) return null;

  const handleDownload = async () => {
    setPrinting(true);
    var succes = true;
    await exportList(searchParams.get("search") ?? "all");
    if (succes) {
      setPrinting(false);
    }
  };

  return (
    <Fragment>
      <StudyHeader
        handlePrint={handlePrint}
        handleList={handleDownload}
      ></StudyHeader>
      <Divider className="header-divider" />
      <StudyTable componentRef={componentRef} printing={printing}></StudyTable>
    </Fragment>
  );
};

export default Study;
