import { Form, Row, Col, Button, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import DateInput from "../../app/common/form/proposal/DateInput";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import SwitchInput from "../../app/common/form/proposal/SwitchInput";
import TimeRangeInput from "../../app/common/form/proposal/TimeRangeInput";
import { ICashRegisterFilter } from "../../app/models/cashRegister";
import { IOptions } from "../../app/models/shared";
import { useStore } from "../../app/stores/store";
import { formItemLayout } from "../../app/util/utils";

const typeCompanyOptions: IOptions[] = [
  {
    value: 1,
    label: "Convenio",
  },
  {
    value: 2,
    label: "Todas",
  },
];

const CashRegisterFilter = () => {
  const { cashRegisterStore, optionStore, profileStore } = useStore();
  const { filter, setFilter, getByFilter, setShowChart } = cashRegisterStore;
  const { branchCityOptions, getMedicOptions, getCompanyOptions } = optionStore;
  const { profile } = profileStore;

  const [form] = Form.useForm<ICashRegisterFilter>();
  const [loading, setLoading] = useState(false);
  const chartValue = Form.useWatch("grafica", form);

  useEffect(() => {
    getMedicOptions();
    getCompanyOptions();
  }, [getMedicOptions, getCompanyOptions]);

  useEffect(() => {
    const profileBranch = profile?.sucursal;

    const getPayments = async (profileBranch: string) => {
      setLoading(true);
      await getByFilter({ ...filter, sucursalId: [profileBranch] });
      setLoading(false);
    };

    if (profileBranch) {
      form.setFieldsValue({ ...filter, sucursalId: [profileBranch] });
      getPayments(profileBranch);
    }
  }, [branchCityOptions]);

  useEffect(() => {
    setShowChart(chartValue);
  }, [chartValue]);

  const onFinish = async (filter: ICashRegisterFilter) => {
    setLoading(true);
    await getByFilter(filter);
    setFilter(filter);
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <div className="status-container">
        <Form<ICashRegisterFilter>
          {...formItemLayout}
          form={form}
          name="cash"
          initialValues={filter}
          onFinish={onFinish}
        >
          <Row justify="space-between" gutter={[12, 12]}>
            <Col span={8}>
              <DateInput
                formProps={{ label: "Fecha", name: "fechaIndividual" }}
                required={true}
              />
            </Col>
            <Col span={8}>
              <TimeRangeInput
                formProps={{ label: "Hora", name: "hora" }}
                required={true}
              />
            </Col>
            <Col span={8}>
              <SelectInput
                form={form}
                formProps={{ name: "sucursalId", label: "Sucursales" }}
                multiple
                options={branchCityOptions}
              />
            </Col>
            <Col span={8}>
              <SelectInput
                form={form}
                formProps={{ name: "tipoCompañia", label: "Convenio" }}
                multiple
                options={typeCompanyOptions}
              />
            </Col>
            <Col span={8}>
              {/* <SwitchInput name="grafica" label="Gráfica" /> */}
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Button key="new" type="primary" htmlType="submit">
                Mostrar listado
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Spin>
  );
};

export default observer(CashRegisterFilter);
