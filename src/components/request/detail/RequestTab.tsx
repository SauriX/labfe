import { Button, Col, Form, notification, Row, Space, Spin, Tabs } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { Tab } from "rc-tabs/lib/interface";
import { useCallback, useEffect, useState } from "react";
import { useKeyPress } from "../../../app/hooks/useKeyPress";
import { IRequestGeneral } from "../../../app/models/request";
import { useStore } from "../../../app/stores/store";
import alerts from "../../../app/util/alerts";
import ProceedingObservations from "../../proceedings/details/ProceedingObservations";
import RequestGeneral from "./content/RequestGeneral";
import RequestImage from "./content/RequestImage";
import RequestIndication from "./content/RequestIndication";
import RequestPrint from "./content/RequestPrint";
import RequestRegister from "./content/RequestRegister";
import RequestRequest from "./content/RequestRequest";
import RequestSampler from "./content/RequestSampler";
import RequestStudy from "./content/RequestStudy";
import RequestInvoice from "./RequestInvoice";
import { onSubmitGeneral, submitGeneral } from "./utils";

type RequestTabProps = {
  recordId: string;
  branchId: string | undefined;
};

type keys =
  | "general"
  | "studies"
  | "indications"
  | "register"
  | "sampler"
  | "print"
  | "request"
  | "images";

const showAutoSaveMessage = () => {
  notification.info({
    key: "auto-not",
    message: `Guardado automatico`,
    placement: "bottomRight",
    icon: "",
  });
};

const RequestTab = ({ recordId, branchId }: RequestTabProps) => {
  const { requestStore, procedingStore, loyaltyStore } = useStore();
  const {
    request,
    studyUpdate,
    loadingTabContent,
    allStudies,
    tags,
    getStudies,
    getPayments,
    getTags,
    updateGeneral,
    updateStudies,
    updateTags,
    cancelRequest,
    studyFilter,
    totals,
    totalsOriginal,
    setOriginalTotal,
  } = requestStore;
  const { activateWallet, getById } = procedingStore;
  const { getActive, getByDate } = loyaltyStore;

  const [formGeneral] = Form.useForm<IRequestGeneral>();

  const [currentKey, setCurrentKey] = useState<keys>("general");
  const [tabs, setTabs] = useState<Tab[]>([]);

  const onChangeTab = async (key: string) => {
    if (
      currentKey === "general" ||
      currentKey === "studies" ||
      currentKey === "request" ||
      currentKey === "print"
    ) {
      submit(true);
    }

    setCurrentKey(key as keys);
  };

  useEffect(() => {
    getActive();
  }, [getActive]);

  const modificarSaldo = async () => {
    const loyal = await getByDate(moment().toDate());
    const contieneMedico = loyal?.precioLista.some((l) => l === "Medicos");
    const expediente = await getById(request?.expedienteId!);
    const fechaCreaccionSolicitud = moment(request?.registro);
    const fechaActivacionMonedero = moment(expediente?.fechaActivacionMonedero);
    if (
      expediente?.hasWallet &&
      !studyFilter.compañiaId &&
      contieneMedico &&
      fechaCreaccionSolicitud.isSameOrAfter(fechaCreaccionSolicitud)
    ) {
      if (loyal?.tipoDescuento === "Porcentaje") {
        const bonoActual = (loyal?.cantidadDescuento! * totals.total) / 100;
        const bonoAnterior =
          (loyal?.cantidadDescuento! * totalsOriginal.total) / 100;

        let bonoFinal: number;
        bonoFinal =
          expediente.wallet > 0
            ? expediente.wallet - bonoAnterior + bonoActual
            : expediente.wallet + bonoActual;

        setOriginalTotal(totals);

        await activateWallet(request?.expedienteId!, bonoFinal);
      } else {
        await activateWallet(
          request?.expedienteId!,
          expediente.wallet - loyal?.cantidadDescuento!
        );
      }
    }
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
    } else if (currentKey === "request") {
      const ok = await updateStudies(studyUpdate, autoSave);
      if (!ok) {
        return;
      }
    }
    if (currentKey === "print" || currentKey === "studies") {
      const ok = await updateTags(
        request!.expedienteId,
        request!.solicitudId!,
        tags,
        autoSave
      );
      if (!ok) {
        return;
      }
    }

    if (autoSave) {
      showAutoSaveMessage();
    }
  };

  useKeyPress("L", submit);

  const cancel = () => {
    alerts.confirm(
      "Cancelar solicitud",
      `¿Desea cancelar la solicitud?, esta acción no se puede deshacer`,
      async () => {
        if (request) {
          const ok = await cancelRequest(
            request.expedienteId,
            request.solicitudId!
          );
          if (ok) {
            await modificarSaldo();
          }
        }
      }
    );
  };

  useEffect(() => {
    const readData = async () => {
      if (request) {
        await getStudies(request.expedienteId, request.solicitudId!);
        getPayments(request.expedienteId, request.solicitudId!);
        getTags(request.expedienteId, request.solicitudId!);
      }
    };

    readData();
  }, [getStudies, getPayments, request, getTags]);

  const operations = (
    <Space>
      <Button key="cancel" size="small" ghost danger onClick={cancel}>
        Cancelar
      </Button>
      <Button key="save" size="small" type="primary" onClick={() => submit()}>
        Guardar
      </Button>
    </Space>
  );

  const tabRender = useCallback(
    (tabName: string) => {
      let component = (
        <RequestGeneral
          branchId={branchId}
          form={formGeneral}
          onSubmit={async (request, showLoader) => {
            const ok = await onSubmitGeneral(
              request,
              showLoader,
              updateGeneral
            );
            if (!ok) setCurrentKey("general");
          }}
        />
      );

      if (tabName === "studies") {
        component = <RequestStudy />;
      } else if (tabName === "indications") {
        component = <RequestIndication />;
      } else if (tabName === "register") {
        component = <RequestRegister />;
      } else if (tabName === "sampler") {
        component = <RequestSampler />;
      } else if (tabName === "print") {
        component = <RequestPrint />;
      } else if (tabName === "request") {
        component = <RequestRequest formGeneral={formGeneral} />;
      } else if (tabName === "images") {
        component = <RequestImage />;
      } else if (tabName === "observaciones") {
        component = <ProceedingObservations proceedingId={recordId} />;
      }

      return (
        <Row gutter={16}>
          <Col span={18}>{component}</Col>
          <Col span={6} style={{ borderLeft: "1px solid lightgray" }}>
            <RequestInvoice />
          </Col>
        </Row>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branchId, formGeneral, updateGeneral]
  );

  useEffect(() => {
    setTabs([
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
        key: "register",
        label: "Caja",
        children: tabRender("register"),
        disabled: allStudies.length === 0,
      },
      {
        key: "sampler",
        label: "Registro de toma",
        children: tabRender("sampler"),
        disabled: allStudies.length === 0,
      },
      {
        key: "print",
        label: "Imprimir",
        children: tabRender("print"),
        disabled: allStudies.length === 0,
      },
      {
        key: "request",
        label: "Solicitar Estudio",
        children: tabRender("request"),
        disabled: allStudies.length === 0,
      },
      {
        key: "images",
        label: "Imágenes",
        children: tabRender("images"),
      },
      {
        key: "observaciones",
        label: "Observaciones expediente",
        children: tabRender("observaciones"),
      },
    ]);
  }, [allStudies.length, tabRender]);

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

export default observer(RequestTab);
