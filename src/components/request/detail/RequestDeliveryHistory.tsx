import { Button, Col, Divider, Form, List, Row, Skeleton } from "antd";
import { observer } from "mobx-react-lite";
import { useForm } from "antd/lib/form/Form";
import { formItemLayout } from "../../../app/util/utils";
import TextInput from "../../../app/common/form/proposal/TextInput";
import { useStore } from "../../../app/stores/store";
import { useEffect, useState } from "react";

const RequestDeliveryHistory = () => {
  const { clinicResultsStore, requestStore } = useStore();
  const { getDeliveryHistory, createNoteDeliveryHistory } = clinicResultsStore;
  const { request } = requestStore;
  const [historial, setHistorial] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const consultarHistorial = async () => {
      setLoading(true);
      if (request) {
        const h = await getDeliveryHistory(request?.solicitudId!);
        setHistorial(h);
      }

      setLoading(false);
    };
    consultarHistorial();
  }, [request]);

  const [form] = useForm();
  return (
    <>
      <Row>
        <Col span={18}>
          <Form<any>
            {...formItemLayout}
            form={form}
            name="clinicResults"
            onFinish={async (newFormValues: any) => {
              const nota = {
                ...newFormValues,
                solicitudId: request?.solicitudId!,
              };
              setLoading(true);
              const h = await createNoteDeliveryHistory(nota);
              setHistorial(h);
              form.resetFields();
              setLoading(false);
            }}
            scrollToFirstError
          >
            <Row justify="space-around">
              <Col span={10}>
                <TextInput
                  formProps={{
                    name: "descripcion",
                    label: "Nota",
                  }}
                  required
                ></TextInput>
              </Col>
              <Col span={8}>
                <Button
                  type="primary"
                  onClick={() => {
                    form.submit();
                  }}
                >
                  Agregar nota
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      <Row style={{ paddingTop: 10 }}>
        <Col span={18}>
          <div
            id="scrollableDiv"
            style={{
              height: 400,
              overflow: "auto",
            }}
          >
            <List
              header={<div>Historial de envíos de resultados</div>}
              className="demo-loadmore-list"
              itemLayout="horizontal"
              dataSource={historial}
              bordered
              renderItem={(item) => (
                <List.Item>
                  <Skeleton avatar title={false} loading={loading} active>
                    <List.Item.Meta
                      title={
                        <>
                          <a href="#">{item.fecha}</a>
                          <a href="#"> Usuario:{item.usuario}</a>
                        </>
                      }
                      description={item.descripcion}
                    />

                    <div>{item.correo}</div>
                    <Divider type="vertical"></Divider>
                    <div>{item.numero}</div>
                  </Skeleton>
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default observer(RequestDeliveryHistory);
