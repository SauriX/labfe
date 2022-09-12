import { Button, Col, Row, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { observer } from "mobx-react-lite";
import React from "react";
import { Fragment, useState } from "react";
import { IUpdate } from "../../app/models/requestedStudy";
import { useStore } from "../../app/stores/store";
import alerts from "../../app/util/alerts";
import RequestedStudyColumns, {
  RequestedStudyExpandable,
} from "./columnDefinition/requestedStudy";
import RequestedStudyFilter from "./RequestedStudyFilter";
import RequestedStudyTable from "./RequestedStudyTable";

type RSDefaultProps = {
  printing: boolean;
};

const RequestedStudyBody = ({ printing }: RSDefaultProps) => {
  const { requestedStudyStore } = useStore();
  const { data, update, printOrder } = requestedStudyStore;
  const [updateForm, setUpdateForm] = useState<IUpdate[]>([]);
  const [activity, setActivity] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onChange = (e: CheckboxChangeEvent, id: number, solicitud: string) => {
    const index = updateForm.findIndex((x) => x.solicitudId == solicitud);
    if (e.target.checked) {
      if (index > -1) {
        const request = { ...updateForm[index] };
        if (!request.estudioId.includes(id)) {
          request.estudioId.push(id);
        }
        setUpdateForm((prev) => [
          ...prev.filter((x) => x.solicitudId != solicitud),
          request,
        ]);
      } else {
        const request = { solicitudId: solicitud, estudioId: [id] };
        setUpdateForm((prev) => [...prev, request]);
      }
    } else {
      if (index > -1) {
        const request = { ...updateForm[index] };
        request.estudioId = request.estudioId.filter((x) => x != id);
        if (request.estudioId.length === 0) {
          setUpdateForm((prev) =>
            prev.filter((x) => x.solicitudId != solicitud)
          );
        } else {
          setUpdateForm((prev) => [
            ...prev.filter((x) => x.solicitudId != solicitud),
            request,
          ]);
        }
      }
    }
  };

  const updateData = async () => {
    setLoading(true);
    var success = await update(updateForm!);
    if (success) {
      setLoading(false);
      {
        activity == "register"
          ? alerts.confirm(
              "",
              `Se han enviado ${
                updateForm.flatMap((x) => x.estudioId).length
              } estudios de ${
                updateForm.length
              } solicitud(es) a estatus Solicitado de manera exitosa `,
              async () => {
                setUpdateForm([]);
              }
            )
          : alerts.confirm(
              "",
              `Se han enviado ${
                updateForm.flatMap((x) => x.estudioId).length
              } estudios de ${
                updateForm.length
              } solicitud(es) a estatus Toma de Muestra de manera exitosa `,
              async () => {
                setUpdateForm([]);
              }
            );
      }
      setActivity("");
    } else {
      setLoading(false);
      setActivity("");
    }
  };

  const register = () => {
    setActivity("register");
  };

  const cancel = () => {
    setActivity("cancel");
  };

  return (
    <Fragment>
      <RequestedStudyFilter />
      <Spin spinning={loading || printing} tip={printing ? "Descargando" : ""}>
        <Row style={{ marginBottom: 10 }}>
          <Col span={24}>
            <Row justify="start" gutter={[0, 4]}>
              <Col span={8}>
                <Button
                  type={activity == "register" ? "primary" : "ghost"}
                  onClick={register}
                >
                  Solicitar Estudio
                </Button>
                <Button
                  type={activity == "cancel" ? "primary" : "ghost"}
                  onClick={cancel}
                >
                  Cancelar Solicitud
                </Button>
              </Col>
              {activity == "register" ? (
                <Col span={8} style={{ textAlign: "right" }} offset={8}>
                  <Button
                    type="primary"
                    disabled={updateForm.length <= 0}
                    onClick={() => {
                      updateData();
                    }}
                  >
                    Aceptar Registro
                  </Button>
                </Col>
              ) : (
                ""
              )}
              {activity == "cancel" ? (
                <Col span={8} style={{ textAlign: "right" }} offset={8}>
                  <Button
                    type="primary"
                    disabled={updateForm.length <= 0}
                    onClick={() => {
                      updateData();
                    }}
                  >
                    Cancelar Registro
                  </Button>
                </Col>
              ) : (
                ""
              )}
            </Row>
          </Col>
        </Row>
        <RequestedStudyTable
          data={data}
          columns={RequestedStudyColumns()}
          expandable={RequestedStudyExpandable({
            activity,
            onChange,
            printOrder,
          })}
        />
      </Spin>
    </Fragment>
  );
};

export default observer(RequestedStudyBody);