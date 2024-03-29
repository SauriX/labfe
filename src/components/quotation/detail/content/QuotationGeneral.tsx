import { Form, Row, Col, Checkbox, Input, Button } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import SelectInput from "../../../../app/common/form/proposal/SelectInput";
import SelectTagInput from "../../../../app/common/form/proposal/SelectTagInput";
import TextAreaInput from "../../../../app/common/form/proposal/TextAreaInput";
import { IQuotationGeneral } from "../../../../app/models/quotation";
import { IFormError, IOptions } from "../../../../app/models/shared";
import { originOptions } from "../../../../app/stores/optionStore";
import { useStore } from "../../../../app/stores/store";
import { catalog } from "../../../../app/util/catalogs";
import { validateEmail } from "../../../../app/util/utils";

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 10 },
};

const PARTICULAR = 2;

const sendOptions = [
  { label: "Mandar via correo electronico", value: "correo" },
  { label: "Mandar via Whatsapp", value: "whatsapp" },
  { label: "Ambos", value: "ambos" },
];

type QuotationGeneralProps = {
  branchId: string | undefined;
  form: FormInstance<IQuotationGeneral>;
  onSubmit: (general: IQuotationGeneral, showLoader: boolean) => void;
};

const QuotationGeneral = ({
  branchId,
  form,
  onSubmit,
}: QuotationGeneralProps) => {
  const { optionStore, quotationStore } = useStore();
  const {
    companyOptions: CompanyOptions,
    medicOptions: MedicOptions,
    getCompanyOptions,
    getMedicOptions,
  } = optionStore;
  const {
    readonly,
    quotation,
    setStudyFilter,
    getGeneral,
    sendTestEmail,
    sendTestWhatsapp,
  } = quotationStore;

  const sendings = Form.useWatch("metodoEnvio", form);
  const doctorId = Form.useWatch("medicoId", form);
  const companyId = Form.useWatch("compañiaId", form);

  const emails = Form.useWatch("correos", form);
  const whatsapps = Form.useWatch("whatsapps", form);

  const [errors, setErrors] = useState<IFormError[]>([]);
  const [previousSendings, setPreviousSendings] = useState<string[]>([]);
  const [quotationGeneral, setQuotationGeneral] = useState<IQuotationGeneral>();
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidWhatsapp, setIsValidWhatsapp] = useState(false);

  useEffect(() => {
    getCompanyOptions();
    getMedicOptions();
  }, [getCompanyOptions, getMedicOptions]);

  useEffect(() => {
    setStudyFilter(branchId, doctorId, companyId);
  }, [branchId, companyId, doctorId, setStudyFilter]);

  useEffect(() => {
    const getQuotationGeneral = async () => {
      const quotationGeneral = await getGeneral(quotation!.cotizacionId);
      if (quotationGeneral) {
        setQuotationGeneral(quotationGeneral);
        form.setFieldsValue(quotationGeneral);
      }
    };

    if (quotation && quotation.cotizacionId) {
      getQuotationGeneral();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation]);

  useEffect(() => {
    setIsValidEmail(
      !!emails && emails.length > 0 && emails.every(validateEmail)
    );
    setIsValidWhatsapp(
      !!whatsapps &&
        whatsapps.length > 0 &&
        whatsapps.every(
          (whatsapp) =>
            (whatsapp ?? "").replaceAll("-", "").replaceAll("_", "").length ===
            10
        )
    );
  }, [emails, whatsapps]);

  const onValuesChange = (changedValues: any) => {
    const path = Object.keys(changedValues)[0];

    if (path === "metodoEnvio") {
      const sendings: string[] = changedValues[path];
      let metodoEnvio: string[] = [];

      if (previousSendings.includes("ambos") && !sendings.includes("ambos")) {
        metodoEnvio = [];
        form.setFieldsValue({ correo: undefined, whatsapp: undefined });
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

      if (!sendings.includes("correo")) {
        form.setFieldsValue({ correo: undefined });
      }
      if (!sendings.includes("whatsapp")) {
        form.setFieldsValue({ whatsapp: undefined });
      }

      form.setFieldsValue({ metodoEnvio });
      setPreviousSendings(metodoEnvio);
    }
  };

  const onFinish = (values: IQuotationGeneral) => {
    setErrors([]);
    const quotation = { ...quotationGeneral, ...values };
    quotation.correo = !isValidEmail ? undefined : emails?.join(",");
    quotation.whatsapp = !isValidWhatsapp ? undefined : whatsapps?.join(",");
    const autoSave = form.getFieldValue("guardadoAutomatico");

    onSubmit(quotation, autoSave);
  };

  const sendEmail = async () => {
    if (quotation && emails) {
      await sendTestEmail(quotation.cotizacionId, emails);
    }
  };

  const sendWhatsapp = async () => {
    if (quotation && whatsapps) {
      await sendTestWhatsapp(quotation.cotizacionId, whatsapps);
    }
  };

  const onCompanyChange = (_value: string, option: IOptions | IOptions[]) => {
    form.setFieldValue("procedencia", (option as IOptions).group);
  };

  return (
    <Form<IQuotationGeneral>
      {...formItemLayout}
      form={form}
      onFinish={onFinish}
      onFinishFailed={({ errorFields }) => {
        const errors = errorFields.map((x) => ({
          name: x.name[0].toString(),
          errors: x.errors,
        }));
        setErrors(errors);
      }}
      initialValues={{
        metodoEnvio: [],
        companyId: catalog.company.particulares,
        procedencia: PARTICULAR,
        correos: [],
        whatsapps: [],
      }}
      onValuesChange={onValuesChange}
      size="small"
    >
      <Row gutter={[0, 12]}>
        <Col span={24}>
          <SelectInput
            formProps={{
              name: "compañiaId",
              label: "Compañía",
            }}
            options={CompanyOptions}
            required
            errors={errors.find((x) => x.name === "compañiaId")?.errors}
            onChange={onCompanyChange}
            readonly={readonly}
          />
        </Col>
        <Col span={24}>
          <SelectInput
            formProps={{
              name: "procedencia",
              label: "Procedencia",
            }}
            options={originOptions}
            readonly
            required
          />
        </Col>
        <Col span={24}>
          <SelectInput
            formProps={{
              name: "medicoId",
              label: "Médico",
            }}
            options={MedicOptions}
            required
            readonly={readonly}
          />
        </Col>
        <Col span={24} style={{ textAlign: "start" }}>
          <Form.Item
            noStyle
            name="metodoEnvio"
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
          >
            <Checkbox.Group
              className={readonly ? "unclickable" : ""}
              options={sendOptions}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="E-Mail"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            className="no-error-text"
            help=""
            required={sendings?.includes("correo")}
          >
            <Input.Group>
              <Row>
                <Col span={12}>
                  <SelectTagInput
                    formProps={{
                      name: "correos",
                      label: "E-Mail",
                      noStyle: true,
                    }}
                    regex={
                      /([A-Za-z0-9_.-]+)@([\dA-Za-z.-]+)\.([A-Za-z.]{2,6})$/
                    }
                    readonly={!sendings?.includes("correo") || readonly}
                    required={sendings?.includes("correo")}
                    errors={errors.find((x) => x.name === "correos")?.errors}
                  />
                </Col>
                <Col span={12}>
                  {!readonly && (
                    <Button
                      type="primary"
                      disabled={!sendings?.includes("correo") || !isValidEmail}
                      onClick={sendEmail}
                    >
                      Prueba
                    </Button>
                  )}
                </Col>
              </Row>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Whatsapp"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            className="no-error-text"
            help=""
            required={sendings?.includes("whatsapp")}
          >
            <Input.Group>
              <Row>
                <Col span={12}>
                  <SelectTagInput
                    formProps={{
                      name: "whatsapps",
                      label: "Whatsapp",
                      noStyle: true,
                    }}
                    regex={/([0-9]{3})-?([0-9]{3})-?([0-9]{2})-?([0-9]{2})$/}
                    readonly={!sendings?.includes("whatsapp") || readonly}
                    required={sendings?.includes("whatsapp")}
                    errors={errors.find((x) => x.name === "whatsapps")?.errors}
                  />
                </Col>
                <Col span={12}>
                  {!readonly && (
                    <Button
                      type="primary"
                      disabled={
                        !sendings?.includes("whatsapp") || !isValidWhatsapp
                      }
                      onClick={sendWhatsapp}
                    >
                      Prueba
                    </Button>
                  )}
                </Col>
              </Row>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={24}>
          <TextAreaInput
            formProps={{
              name: "observaciones",
              label: "Observaciones",
              labelCol: { span: 24 },
              wrapperCol: { span: 24 },
            }}
            rows={3}
            readonly={readonly}
            errors={errors.find((x) => x.name === "observaciones")?.errors}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default observer(QuotationGeneral);
