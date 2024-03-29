import { Button, Col, Form, notification, Row, Space, Spin, Tabs } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { IQuotationGeneral } from "../../../app/models/quotation";
import { useStore } from "../../../app/stores/store";
import alerts from "../../../app/util/alerts";
import QuotationAssignment from "./content/QuotationAssignment";
import QuotationGeneral from "./content/QuotationGeneral";
import QuotationIndication from "./content/QuotationIndication";
import QuotationStudy from "./content/QuotationStudy";
import QuotationInvoice from "./QuotationInvoice";
import QuotationPrint from "./content/QuotationPrint";
import { onSubmitGeneral, submitGeneral } from "./utils";

type QuotationTabProps = {
  branchId: string | undefined;
  recordId: string | undefined;
  setRecordId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type keys = "general" | "studies" | "indications" | "assignment" | "report";

type Tab = {
  key: string;
  label: string;
  children: JSX.Element;
};

const showAutoSaveMessage = () => {
  notification.info({
    key: "auto-not",
    message: `Guardado automatico`,
    placement: "bottomRight",
    icon: "",
  });
};

const QuotationTab = ({
  branchId,
  recordId,
  setRecordId,
}: QuotationTabProps) => {
  const { quotationStore } = useStore();
  const {
    readonly,
    quotation,
    studyUpdate,
    loadingTabContent,
    allStudies,
    getStudies,
    updateGeneral,
    updateStudies,
    assignRecord,
    cancelQuotation,
  } = quotationStore;

  const [formGeneral] = Form.useForm<IQuotationGeneral>();

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [currentKey, setCurrentKey] = useState<keys>("general");

  const onChangeTab = async (key: string) => {
    if (currentKey !== "indications" && currentKey !== "report") {
      submit(true);
    }

    setCurrentKey(key as keys);
  };

  const submit = async (autoSave: boolean = false) => {
    if (currentKey === "general") {
      const ok = await submitGeneral(formGeneral, autoSave);
      if (!ok) {
        setCurrentKey("general");
        return;
      }
    } else if (currentKey === "studies") {
      const ok = await updateStudies(studyUpdate, autoSave);
      if (!ok) {
        return;
      }
    } else if (currentKey === "assignment") {
      const ok = await assignRecord(
        quotation!.cotizacionId,
        autoSave,
        recordId
      );
      if (!ok) {
        return;
      }
    }

    if (autoSave) {
      showAutoSaveMessage();
    }
  };

  const cancel = () => {
    alerts.confirm(
      "Cancelar cotización",
      `¿Desea cancelar la cotización?, esta acción no se puede deshacer`,
      async () => {
        if (quotation) {
          await cancelQuotation(quotation.cotizacionId);
        }
      }
    );
  };

  useEffect(() => {
    const readData = () => {
      if (quotation) {
        setRecordId(quotation.expedienteId);
        getStudies(quotation.cotizacionId);
      }
    };

    readData();
  }, [getStudies, quotation, setRecordId]);

  const tabRender = useCallback(
    (tabName: string) => {
      let component = (
        <QuotationGeneral
          branchId={branchId}
          form={formGeneral}
          onSubmit={(quotation, showLoader) => {
            onSubmitGeneral(quotation, showLoader, updateGeneral).then((ok) => {
              if (!ok) setCurrentKey("general");
            });
          }}
        />
      );

      if (tabName === "studies") {
        component = <QuotationStudy />;
      } else if (tabName === "indications") {
        component = <QuotationIndication />;
      } else if (tabName === "assignment") {
        component = (
          <QuotationAssignment recordId={recordId} setRecordId={setRecordId} />
        );
      } else if (tabName === "report") {
        component = <QuotationPrint />;
      }

      return (
        <Row gutter={8}>
          <Col span={18}>{component}</Col>
          <Col span={6}>
            <QuotationInvoice />
          </Col>
        </Row>
      );
    },
    [branchId, formGeneral, recordId, setRecordId, updateGeneral]
  );

  useEffect(() => {
    let tabs = [
      {
        key: "general",
        label: "Generales",
        children: tabRender("general"),
      },
      {
        key: "studies",
        label: "Estudios",
        children: tabRender("studies"),
      },
      {
        key: "indications",
        label: "Indicaciones",
        children: tabRender("indications"),
        disabled: allStudies.length === 0,
      },
      {
        key: "assignment",
        label: "Expediente",
        children: tabRender("assignment"),
        disabled: allStudies.length === 0,
      },
      {
        key: "report",
        label: "Recibo",
        children: tabRender("report"),
        disabled: allStudies.length === 0,
      },
    ];

    if (readonly) tabs = tabs.filter((x) => x.key !== "assignment");

    setTabs(tabs);
  }, [readonly, tabRender, allStudies.length]);

  const operations = (
    <Space>
      {!readonly && (
        <>
          <Button key="cancel" size="small" ghost danger onClick={cancel}>
            Cancelar
          </Button>
          <Button
            key="save"
            size="small"
            type="primary"
            onClick={() => submit()}
          >
            Guardar
          </Button>
          <Button key="create" size="small" style={{ backgroundColor: " #18AC50" }} type="primary">
            Convertir en solicitud
          </Button>
        </>
      )}
    </Space>
  );

  if (!branchId) {
    return <p>Por favor selecciona una sucursal.</p>;
  }

  return (
    <Spin spinning={loadingTabContent}>
      <Tabs
        activeKey={currentKey}
        tabBarExtraContent={operations}
        onChange={onChangeTab}
        items={tabs}
      />
    </Spin>
  );
};

export default observer(QuotationTab);
