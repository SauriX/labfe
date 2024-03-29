import { Button, Col, Form, Input, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import DateInput from "../../app/common/form/proposal/DateInput";
import DateRangeInput from "../../app/common/form/proposal/DateRangeInput";
import MaskInput from "../../app/common/form/proposal/MaskInput";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import TextInput from "../../app/common/form/proposal/TextInput";
import { IInvoiceCatalogFilter } from "../../app/models/invoiceCatalog";
import { IQuotationFilter } from "../../app/models/quotation";
import { IFormError, IOptions } from "../../app/models/shared";
import { useStore } from "../../app/stores/store";
import { formItemLayout } from "../../app/util/utils";
import "./css/index.css";

const InvoiceCatalogFilter = () => {
  const {  optionStore,invoiceCatalogStore,profileStore } = useStore();
  const { branchCityOptions, getBranchCityOptions } = optionStore;
  const {search,setSearch,getAll } = invoiceCatalogStore;
  const {profile}= profileStore;
  const [form] = useForm<IInvoiceCatalogFilter>();

  const selectedCity = Form.useWatch("ciudad", form);

  const [errors, setErrors] = useState<IFormError[]>([]);
  const [cityOptions, setCityOptions] = useState<IOptions[]>([]);
  const [branchOptions, setBranchOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    getBranchCityOptions();
  }, [getBranchCityOptions]);

  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);
  useEffect(() => {
    if(selectedCity!=undefined && selectedCity !=null){
      var branhces =branchCityOptions.filter((x) => selectedCity.includes(x.value.toString()))
    var  options = branhces.flatMap(x=> (x.options== undefined?[]:x.options ));
      setBranchOptions(
        options
      );
    }
    form.setFieldValue("sucursalId", []);
  }, [branchCityOptions, form, selectedCity]);


  const onFinish = (values: IInvoiceCatalogFilter) => {
    setErrors([]);
    const filter = { ...values };



    setSearch(filter);
    getAll(filter); 
  };

  return (
    <div className="status-container" style={{ marginBottom: 12 }}>
      <Form<IInvoiceCatalogFilter>
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
        size="small"
        initialValues={search}
      >
        <Row gutter={[0, 12]}>
          <Col span={8}>
            <DateRangeInput
              formProps={{ name: "fecha", label: "Fecha" }}
              disableAfterDates
            />
          </Col>
          <Col span={8}>
            <TextInput
              formProps={{
                name: "buscar",
                label: "Buscar",
              }}
              placeholder="Buscar"
              autoFocus
            />
          </Col>
          <Col span={8}>
            <Form.Item label="Sucursales" className="no-error-text" help="">
              <Input.Group>
                <Row gutter={8}>
                  <Col span={12}>
                    <SelectInput
                    form={form}
                      formProps={{
                        name: "ciudad",
                        label: "Ciudad",
                        noStyle: true,
                      }}
                      multiple
                      options={cityOptions}
                    />
                  </Col>
                  <Col span={12}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "sucursal",
                        label: "Sucursales",
                        noStyle: true,
                      }}
                      multiple
                      options={branchOptions}
                    />
                  </Col>
                </Row>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
          <Form.Item label="Tipo" className="no-error-text" help="">
            <SelectInput
              form={form}
              formProps={{
                name: "tipo",
                label: "Tipo",
                noStyle: true,
              }}
              multiple
              options={[{label:"Factura",value:"FAC"},{label:"Recibo",value:"REC"}]}
            />
            </Form.Item>
          </Col>
          <Col span={16} style={{ textAlign: "right" }}>
            <Button key="clean" htmlType="reset">
              Limpiar
            </Button>
            <Button key="filter" type="primary" htmlType="submit">
              Filtrar
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default observer(InvoiceCatalogFilter);
