import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useStore } from "../app/stores/store";
import IndicationHeader from "../components/indication/IndicationHeader";
import IndicationTable from "../components/indication/IndicationTable";

const Indication = () => {
  const { indicationStore } = useStore();
  const { scopes, access, clearScopes } = indicationStore;

  const [printing, setPrinting] = useState(false);

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
    return () => {
      clearScopes();
    };
  }, [clearScopes]);

  return (
    <Fragment>
      <IndicationHeader handlePrint={handlePrint} />
      <Divider className="header-divider" />
      <IndicationTable componentRef={componentRef} printing={printing} />
    </Fragment>
  );
};

export default observer(Indication);
