import { Spin, Form, Row, Col, Pagination, Button, PageHeader, Divider } from "antd";
import React, { FC, useEffect, useState } from "react";
import { formItemLayout } from "../../../app/util/utils";
import TextInput from "../../../app/common/form/TextInput";
import { useStore } from "../../../app/stores/store";
import { IReagentForm, ReagentFormValues } from "../../../app/models/reagent";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageButton from "../../../app/common/button/ImageButton";
import HeaderTitle from "../../../app/common/header/HeaderTitle";
import { observer } from "mobx-react-lite";
import { IBranchForm } from "../../../app/models/branch";
import { ILocation } from "../../../app/models/location";
import { IOptions } from "../../../app/models/shared";
import NumberInput from "../../../app/common/form/NumberInput";
import SwitchInput from "../../../app/common/form/SwitchInput";
import SelectInput from "../../../app/common/form/SelectInput";
import alerts from "../../../app/util/alerts";
import messages from "../../../app/util/messages";

type BranchFormProps = {

  componentRef: React.MutableRefObject<any>;
  printing: boolean;
};

const BranchForm: FC<BranchFormProps> = ({ componentRef, printing }) => {
  const { locationStore } = useStore();
  const { getColoniesByZipCode } = locationStore;
  const [searchParams] = useSearchParams();
  const [readonly, setReadonly] = useState(
    searchParams.get("mode") === "ReadOnly"
  );
  const navigate = useNavigate();
  const [form] = Form.useForm<IBranchForm>();

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [colonies, setColonies] = useState<IOptions[]>([]);
  const [values, setValues] = useState<IBranchForm>();

  const clearLocation = () => {
    form.setFieldsValue({
      estado: undefined,
      ciudad: undefined,
      coloniaId: undefined,
    });
    setColonies([]);
  };

  const onValuesChange = async (changedValues: any) => {
    const field = Object.keys(changedValues)[0];

    if (field === "codigoPostal") {
      const zipCode = changedValues[field] as string;

      if (zipCode && zipCode.trim().length === 5) {
        const location = await getColoniesByZipCode(zipCode);
        if (location) {
          form.setFieldsValue({
            estado: location.estado,
            ciudad: location.ciudad,
          });
          setColonies(
            location.colonias.map((x) => ({
              value: x.id,
              label: x.nombre,
            }))
          );
        } else {
          clearLocation();
        }
      } else {
        clearLocation();
      }
    }
  };

  return (
    <Spin spinning={loading || printing} tip={printing ? "Imprimiendo" : ""}>
      <Row style={{ marginBottom: 24 }}>
        <Col md={12} sm={24} style={{ textAlign: "left" }}>
          <Pagination size="small" total={50} pageSize={1} current={9} />
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button onClick={() => {}}>Cancelar</Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={disabled}
            onClick={() => {
              form.submit();
            }}
          >
            Guardar
          </Button>
        </Col>
      </Row>
      <div style={{ display: printing ? "none" : "" }}>
        <div ref={componentRef}>
          {printing && (
            <PageHeader
              ghost={false}
              title={<HeaderTitle title="Sucursales" image="reagent" />}
              className="header-container"
            ></PageHeader>
          )}
          {printing && <Divider className="header-divider" />}
          <Form<IBranchForm>
            {...formItemLayout}
            form={form}
            name="reagent"
            initialValues={values}
            onFinish={() => {}}
            scrollToFirstError
            onFieldsChange={() => {
              setDisabled(
                !form.isFieldsTouched() ||
                  form.getFieldsError().filter(({ errors }) => errors.length).length > 0
              );
            }}
            onValuesChange={onValuesChange}
          >
            <Row>
            <Col md={12} sm={24}>
              <TextInput
                formProps={{
                  name: "clave",
                  label: "Clave",
                }}
                max={100}
                required
                readonly={readonly}
              />
            
              <TextInput
                formProps={{
                  name: "nombre",
                  label: "Nombre",
                }}
                max={100}
                required
                readonly={readonly}
              />
                <TextInput
                  formProps={{
                    name: "codigoPostal",
                    label: "Codigo postal",
                  }}
                  max={100}
                  readonly={readonly}
                />
                <TextInput
                  formProps={{
                    name: "estado",
                    label: "Estado",
                  }}
                  max={100}
                  required
                  readonly={readonly}
                />
                <TextInput
                  formProps={{
                    name: "ciudad",
                    label: "Ciudad",
                  }}
                  max={100}
                  required
                  readonly={readonly}
                />
                <SelectInput
                  formProps={{
                    name: "coloniaId",
                    label: "Colonia",
                  }}
                  required
                  options={colonies}
                  readonly={readonly}
                />
              
              <NumberInput
                  formProps={{
                    name: "numeroInterior",
                    label: "Número interior",
                  }}
                  max={9999999999}
                  min={1}
                  readonly={readonly}
                />
                <TextInput
                  formProps={{
                    name: "calle",
                    label: "Calle",
                  }}
                  max={100}
                  required
                   readonly={readonly}
                />
                <SelectInput
                  formProps={{
                    name: "coloniaId",
                    label: "Colonia",
                  }}
                  required
                  readonly={readonly}
                  options={colonies}
                  />
                  </Col>
                  <Col md={12} sm={24} xs={12}>
                  <TextInput
                  formProps={{
                    name: "correo",
                    label: "Correo",
                  }}
                  max={100}
                  required
                  readonly={readonly}
                  type="email"
                />
                <NumberInput
                  formProps={{
                    name: "telefono",
                    label: "Teléfono",
                  }}
                  max={9999999999}
                  min={1111111111}
                  readonly={readonly}

                />
                <TextInput
                  formProps={{
                    name: "clinicos",
                    label: "Clinicos",
                  }}
                  max={100}
                  readonly={readonly}
                  required
                />
                <TextInput
                  formProps={{
                    name: "presupuestos",
                    label: "Presupuestos",
                  }}
                  max={100}
                  readonly={readonly}
                  required
                />
                <TextInput
                  formProps={{
                    name: "facturacion",
                    label: "Facturacion",
                  }}
                  max={100}
                  readonly={readonly}
                  required
                />
                <SwitchInput
                  name="activo"
                  onChange={(value) => {
                    if (value) {
                      alerts.info(messages.confirmations.enable);
                    } else {
                      alerts.info(messages.confirmations.disable);
                    }
                  }}
                  label="Activo"
                  readonly={readonly}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default observer(BranchForm);