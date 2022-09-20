import "./css/containerInfo.less";
import {
  Col,
  Form,
  Row,
  Spin,
  Typography,
  Checkbox,
  Divider,
  Button,
} from "antd";
import { observer } from "mobx-react-lite";
import DateInput from "../../app/common/form/proposal/DateInput";
import SelectInput from "../../app/common/form/SelectInput";
import TextAreaInput from "../../app/common/form/TextAreaInput";
import TextInput from "../../app/common/form/TextInput";
import { FC, useState } from "react";
import ClinicalResultsForm from "./ClinicalResultsForm";
import { useNavigate } from "react-router";
import ClinicalResultsHeader from "./ClinicalResultsHeader";

const { Text } = Typography;
type ClinicalFormProps = {
  id: string;
  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};
const ClinicalResultsInfo: FC<ClinicalFormProps> = ({
  id,
  componentRef,
  printing,
}) => {
  const [loading, setLoading] = useState(false);
  const getPage = (id: string) => {
    // return clinicalResult.findIndex((x) => x.id === id) + 1;
    // return [].findIndex((x) => x.id === id) + 1;
    return 1;
  };
  const setPage = (page: number) => {
    // const loyalty = loyaltys[page - 1];
    // navigate(`/${views.loyalty}/${studie.id}?${searchParams}`);
  };
  const getBack = () => {
    // navigate(`/${views.request}`);
  };
  const navigate = useNavigate();
  const plainOptions = ["Imprimir logos", "Desmarcar todos", "Marcar todos"];

  return (
    <Spin spinning={loading || printing} tip={printing ? "Imprimiendo" : ""}>
      {/* <Row justify="space-between" align="middle">
        <Col span={6} style={{ textAlign: "left" }}>
          <Pagination
            size="small"
            total={[].length}
            pageSize={1}
            current={getPage(id)}
            onChange={setPage}
          />
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Text>
            Solicitud: <Text strong></Text>
          </Text>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Text>
            Registro: <Text strong></Text>
          </Text>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <GoBackIcon key="back" onClick={getBack} />
        </Col>
      </Row> */}
      <ClinicalResultsHeader id={""} printing={false} />
      <Divider orientation="left"></Divider>
      <div className="status-container">
        <Form>
          <Row>
            <Col span={24}>
              <Row justify="space-between" gutter={[12, 4]}>
                <Col span={10}>
                  <TextInput formProps={{ name: "nombre", label: "Nombre" }} />
                </Col>
                <Col span={7}>
                  <DateInput
                    formProps={{
                      name: "fechaNacimiento",
                      label: "Fecha de Nacimiento",
                    }}
                  />
                </Col>
                <Col span={7} style={{ alignItems: "left" }}>
                  <Text key="expediente">
                    Expediente: <Text strong></Text>
                  </Text>
                </Col>
                <Col span={6}>
                  <SelectInput
                    formProps={{ name: "genero", label: "Genero" }}
                    options={[]}
                  />
                </Col>
                <Col span={6}>
                  <TextInput formProps={{ name: "edad", label: "Edad" }} />
                </Col>
                <Col span={6}>
                  <TextInput
                    formProps={{ name: "telefono", label: "Teléfono" }}
                  />
                </Col>
                <Col span={6}>
                  <TextInput
                    formProps={{ name: "celular", label: "Celular" }}
                  />
                </Col>
                <Col span={12}>
                  <TextInput
                    formProps={{ name: "compania", label: "Compañía" }}
                  />
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <TextInput formProps={{ name: "medico", label: "Médico" }} />
                </Col>
                <Col span={24}>
                  <TextAreaInput
                    formProps={{
                      name: "observaciones",
                      label: "Observaciones",
                    }}
                    rows={3}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
      <Divider orientation="left"></Divider>
      <Row>
        <Col span={12}>
          <Checkbox.Group
            // options={plainOptions}
            onChange={(value) => {
              console.log("value checkbox", value);
            }}
            style={{
              width: "100%",
            }}
          >
            <Row>
              <Col span={8}>
                <Checkbox value="logos">Imprimir logos</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="marked">Desmarcar todos</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="unmarked">Marcar todos</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Col>
        <Col span={6}>
          <Button
            style={{ marginLeft: "45%", marginBottom: "5%" }}
            type="primary"
            onClick={() => {
              navigate("#");
            }}
          >
            Imagen
          </Button>
        </Col>
        <Col span={6}>
          <Button
            style={{
              marginLeft: "45%",
              marginBottom: "5%",
              backgroundColor: "#B4C7E7",
              // color: "white",
            }}
            type="default"
            onClick={() => {
              navigate("#");
            }}
          >
            Imprimir
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <ClinicalResultsForm />
        </Col>
      </Row>
    </Spin>
  );
};
export default observer(ClinicalResultsInfo);
