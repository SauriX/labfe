import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Form,
  MenuProps,
  Radio,
  Row,
  Space,
  Spin,
  Table,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import SelectInput from "../../../../../app/common/form/proposal/SelectInput";
import TextInput from "../../../../../app/common/form/proposal/TextInput";
import { IColumns } from "../../../../../app/common/table/utils";
import {
  IRequest,
  IRequestCheckIn,
  IRequestPayment,
} from "../../../../../app/models/request";
import { IFormError, IOptions } from "../../../../../app/models/shared";
import { ITaxData } from "../../../../../app/models/taxdata";
import { useStore } from "../../../../../app/stores/store";
import alerts from "../../../../../app/util/alerts";
import { moneyFormatter } from "../../../../../app/util/utils";
import { DownOutlined } from "@ant-design/icons";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import Request from "../../../../../app/api/request";
import { v4 as uuid } from "uuid";

interface IFormInvoice {
  serie: string;
  usoCfdi: number;
  cantidad: string;
  numeroCuenta: string;
  formaPago: string;
  configuracion: "desglozado" | "simple" | "concepto";
  metodoEnvio: string[];
}

interface IDetailInvoice {
  id: string;
  concepto: string;
  cantidad: number;
  precioFinal: number;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const sendOptions = [
  { label: "Mandar via correo electronico", value: "correo" },
  { label: "Mandar via Whatsapp", value: "whatsapp" },
  { label: "Ambos", value: "ambos" },
];

const settingsOptions: IOptions[] = [
  { label: "Desglozado por estudio", value: "desglozado", disabled: true },
  { label: "Simple", value: "simple" },
  { label: "Por concepto", value: "concepto" },
];

type ItemTypeExt = ItemType & {
  key: string;
  disabled?: boolean;
  description?: string;
};

interface MenuPropsExt extends MenuProps {
  items: ItemTypeExt[];
}

const items: MenuPropsExt["items"] = [
  {
    label: "Sucursal",
    key: "branch",
    description: "ESTUDIOS DE LABORATORIO REALIZADOS EN SUCURSAL [branch]",
  },
  {
    label: "Paciente",
    key: "patient",
    description: "PACIENTE: [patient]",
  },
  {
    label: "Copago",
    key: "cup",
    description: "COPAGO TOTAL [total]",
  },
  {
    label: "Consulta",
    key: "simple",
    description: "CONSULTA MEDICA",
  },
];

type RequestInvoiceDetailProps = {
  recordId: string;
  requestId: string;
  branchId: string;
  payments: IRequestPayment[];
  taxData: ITaxData;
};

const RequestInvoiceDetail = ({
  recordId,
  requestId,
  branchId,
  payments,
  taxData,
}: RequestInvoiceDetailProps) => {
  const { requestStore, optionStore, modalStore } = useStore();
  const { studies, packs, totals, checkInPayment } = requestStore;
  const {
    paymentOptions,
    cfdiOptions,
    invoiceSeriesOptions,
    getPaymentOptions,
    getcfdiOptions,
    getInvoiceSeriesOptions,
  } = optionStore;
  const { closeModal } = modalStore;

  const [form] = Form.useForm<IFormInvoice>();

  const configuration = Form.useWatch("configuracion", form);
  const sendings = Form.useWatch("metodoEnvio", form);

  const [request, setRequest] = useState<IRequest>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<IFormError[]>([]);
  const [previousSendings, setPreviousSendings] = useState<string[]>([]);
  const [detailData, setDetailData] = useState<IDetailInvoice[]>([]);
  const [avDetailType, setAvDetailType] = useState(settingsOptions);
  const [simpleConcept, setSimpleConcept] = useState("");
  const [paymentsTotal] = useState(
    payments.reduce((acc, obj) => acc + obj.cantidad, 0)
  );
  const [conceptItems, setConceptItems] = useState<ItemTypeExt[]>(items);

  const detailColumns: IColumns<IDetailInvoice> = [
    {
      dataIndex: "concepto",
      key: "concepto",
      title: "Concepto",
      width: "60%",
      className: "no-padding-cell",
      render: (value) => {
        if (configuration === "desglozado") return value;
        return (
          <TextArea
            value={simpleConcept}
            autoSize
            bordered={false}
            maxLength={100}
            onChange={(e) => setSimpleConcept(e.target.value)}
          />
        );
      },
    },
    {
      dataIndex: "cantidad",
      key: "cantidad",
      title: "Cantidad",
      width: "20%",
    },
    {
      dataIndex: "precioFinal",
      key: "precioFinal",
      title: "Importe final",
      width: "20%",
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
  ];

  useEffect(() => {
    getPaymentOptions();
    getcfdiOptions();
    getInvoiceSeriesOptions(branchId);
  }, [branchId, getInvoiceSeriesOptions, getPaymentOptions, getcfdiOptions]);

  const onValuesChange = (changedValues: any) => {
    const path = Object.keys(changedValues)[0];

    if (path === "metodoEnvio") {
      const sendings: string[] = changedValues[path];
      let metodoEnvio: string[] = [];

      if (previousSendings.includes("ambos") && !sendings.includes("ambos")) {
        metodoEnvio = [];
      } else if (
        !previousSendings.includes("ambos") &&
        sendings.includes("ambos")
      ) {
        metodoEnvio = ["correo", "whatsapp", "ambos"];
      } else if (sendings.length === 2 && !sendings.includes("ambos")) {
        metodoEnvio = ["correo", "whatsapp", "ambos"];
      } else {
        metodoEnvio = sendings.filter((x) => x !== "ambos");
      }

      form.setFieldsValue({ metodoEnvio });
      setPreviousSendings(metodoEnvio);
    }
  };

  useEffect(() => {
    form.setFieldValue(
      "cantidad",
      moneyFormatter.format(payments.reduce((acc, o) => acc + o.cantidad, 0))
    );
  }, [form, payments]);

  useEffect(() => {
    const totalPayment = payments.reduce((acc, obj) => acc + obj.cantidad, 0);

    if (totalPayment === totals.total) {
      setAvDetailType((prev) => [
        { label: "Desglozado por estudio", value: "desglozado" },
        ...prev.filter((x) => x.value !== "desglozado"),
      ]);
    }

    if (!studies.some((x) => (x.copago ?? 0) > 0)) {
      const items = [...conceptItems];
      items[2].disabled = true;
      setConceptItems(items);
    }

    const maxPayment = payments.reduce(
      (p, c) => (p.cantidad > c.cantidad ? p : c),
      payments[0]
    );

    form.setFieldsValue({
      formaPago: maxPayment.formaPago,
      numeroCuenta: payments
        .filter((x) => x.numeroCuenta)
        .map((x) => x.numeroCuenta)
        .filter((o, i, a) => a.indexOf(o) === i)
        .join(", "),
      configuracion: totalPayment === totals.total ? "desglozado" : "simple",
      metodoEnvio: [],
    });

    Request.getById(recordId, requestId).then((req) => setRequest(req));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (configuration === "desglozado") {
      setDetailData([
        ...studies.map((x) => ({
          id: uuid(),
          concepto: x.nombre,
          precioFinal: x.precioFinal,
          cantidad: 1,
        })),
      ]);
    } else if (configuration === "simple") {
      setSimpleConcept("ANALISIS CLINICOS");
      setDetailData([
        {
          id: uuid(),
          concepto: "ANALISIS CLINICOS",
          precioFinal: paymentsTotal,
          cantidad: 1,
        },
      ]);
    } else {
      setSimpleConcept("");
      setDetailData([
        { id: uuid(), concepto: "", precioFinal: paymentsTotal, cantidad: 1 },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  const onFinish = async (values: IFormInvoice) => {
    const use = cfdiOptions.find((x) => x.value === values.usoCfdi);

    if (!use) {
      alerts.warning("Uso de CFDI inválido");
      return;
    }

    const requestCheckIn: IRequestCheckIn = {
      expedienteId: recordId,
      solicitudId: requestId,
      serie: values.serie,
      datoFiscalId: taxData.id!,
      usoCFDI: use.label!.toString(),
      formaPago: values.formaPago,
      simple: values.configuracion.includes("simple"),
      porConcepto: values.configuracion.includes("concepto"),
      desglozado: values.configuracion.includes("desglozado"),
      envioCorreo: values.metodoEnvio.includes("correo"),
      envioWhatsapp: values.metodoEnvio.includes("whatsapp"),
      pagos: payments,
      detalle: [],
    };

    requestCheckIn.detalle = detailData.map((x) => {
      const isSimple = requestCheckIn.simple || requestCheckIn.porConcepto;

      return {
        cantidad: x.cantidad,
        clave: isSimple ? simpleConcept : x.concepto,
        descripcion: isSimple ? simpleConcept : x.concepto,
        descuento: 0,
        precio: x.precioFinal,
      };
    });

    setLoading(true);
    const checkedIn = await checkInPayment(requestCheckIn);
    setLoading(false);

    if (checkedIn.length > 0) {
      closeModal();
    } else {
      alerts.warning("No se facturó ningun pago");
    }
  };

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const item = conceptItems.find((x) => x.key === key);
    const initial = simpleConcept.length === 0 ? "" : simpleConcept + "\n";

    if (!request) return;

    let newText = "";

    if (key === "branch") {
      newText =
        initial + item?.description?.replace("[branch]", request.sucursal!);
    } else if (key === "patient") {
      newText =
        initial + item?.description?.replace("[patient]", request.paciente!);
    } else if (key === "cup") {
      newText =
        initial +
        item?.description?.replace(
          "[total]",
          moneyFormatter.format(
            studies.reduce((acc, obj) => acc + (obj.copago ?? 0), 0)
          )
        );
    } else {
      newText = initial + item?.description;
    }

    setSimpleConcept(newText);
  };

  return (
    <Spin spinning={loading}>
      <Space style={{ display: "flex" }} size="middle" direction="vertical">
        <Form<IFormInvoice>
          {...formItemLayout}
          form={form}
          name="invoice"
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => {
            const errors = errorFields.map((x) => ({
              name: x.name[0].toString(),
              errors: x.errors,
            }));
            setErrors(errors);
          }}
          onValuesChange={onValuesChange}
          scrollToFirstError
        >
          <Row gutter={[0, 12]}>
            <Col span={12}>
              <SelectInput
                formProps={{
                  name: "serie",
                  label: "Serie de Factura",
                }}
                options={invoiceSeriesOptions}
                required
                errors={errors.find((x) => x.name === "serie")?.errors}
              />
            </Col>
            <Col span={7}></Col>
            <Col span={5}>
              <TextInput
                formProps={{
                  name: "cantidad",
                  label: "Cantidad",
                  labelCol: { span: 12 },
                  wrapperCol: { span: 12 },
                }}
                readonly
              />
            </Col>
            <Col span={12}>
              <SelectInput
                formProps={{
                  name: "usoCfdi",
                  label: "Uso de CFDI",
                }}
                options={cfdiOptions}
                required
                errors={errors.find((x) => x.name === "usoCfdi")?.errors}
              />
            </Col>
            <Col span={12}></Col>
            <Col span={12}>
              <SelectInput
                formProps={{ name: "formaPago", label: "Forma de pago" }}
                options={payments
                  .map((x) => x.formaPago)
                  .filter((o, i, a) => a.map((x) => x).indexOf(o) === i)
                  .map((x) => ({
                    value: x,
                    label: x,
                  }))}
                required
                errors={errors.find((x) => x.name === "formaPago")?.errors}
              />
            </Col>
            <Col span={12}></Col>
            <Col span={24}>
              <TextInput
                formProps={{
                  name: "numeroCuenta",
                  label: "Número de cuenta",
                  labelCol: { span: 4 },
                  wrapperCol: { span: 20 },
                }}
                readonly
                errors={errors.find((x) => x.name === "numeroCuenta")?.errors}
              />
            </Col>
            <Col span={24} style={{ textAlign: "start" }}>
              <Form.Item
                noStyle
                name="configuracion"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
              >
                <Radio.Group options={avDetailType} />
              </Form.Item>
            </Col>
            <Col span={18} style={{ textAlign: "start" }}>
              <Form.Item
                noStyle
                name="metodoEnvio"
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
              >
                <Checkbox.Group options={sendOptions} />
              </Form.Item>
            </Col>
            <Col span={6} style={{ textAlign: "end" }}>
              <Button type="primary" htmlType="submit">
                Registrar
              </Button>
            </Col>
          </Row>
        </Form>
        <Table<IDetailInvoice>
          key="clave"
          rowKey={(o) => o.id}
          title={() => (
            <Row>
              <Col span={12}>Detalle</Col>
              {configuration === "concepto" && (
                <Col span={12} style={{ textAlign: "right" }}>
                  <Dropdown menu={{ items: items, onClick }}>
                    <a href="/#" onClick={(e) => e.preventDefault()}>
                      <Space>
                        Agregar concepto
                        <DownOutlined />
                      </Space>
                    </a>
                  </Dropdown>
                </Col>
              )}
            </Row>
          )}
          columns={detailColumns}
          dataSource={detailData}
          pagination={false}
          sticky
          scroll={{ y: 400 }}
        />
      </Space>
    </Spin>
  );
};

export default observer(RequestInvoiceDetail);
