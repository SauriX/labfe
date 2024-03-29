import { Button, Col, Form, Input, Row } from "antd";
import { useForm } from "antd/lib/form/Form";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import DateRangeInput from "../../app/common/form/proposal/DateRangeInput";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import TextInput from "../../app/common/form/proposal/TextInput";
import { IGeneralForm } from "../../app/models/general";
import { IOptions } from "../../app/models/shared";
import {
  originOptions,
  studyStatusOptions,
  urgencyOptions,
} from "../../app/stores/optionStore";
import { useStore } from "../../app/stores/store";
import { formItemLayout } from "../../app/util/utils";

const ClinicResultsFilter = () => {
  const {
    requestStore,
    optionStore,
    clinicResultsStore,
    profileStore,
    generalStore,
  } = useStore();
  const { lastViewedFrom } = requestStore;
  const { getAll } = clinicResultsStore;
  const { generalFilter, setGeneralFilter } = generalStore;
  const {
    branchCityOptions,
    medicOptions,
    companyOptions,
    studiesOptions,
    getMedicOptions,
    getCompanyOptions,
    getStudiesOptions,
    areaByDeparmentOptions,
    getAreaByDeparmentOptions,
  } = optionStore;
  const { profile } = profileStore;
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [studyFilter, setStudyFilter] = useState<any[]>(studiesOptions);

  const selectedCity = Form.useWatch("ciudad", form);
  const selectedDepartment = Form.useWatch("departamento", form);
  const [cityOptions, setCityOptions] = useState<IOptions[]>([]);
  const [branchOptions, setBranchOptions] = useState<IOptions[]>([]);
  const [areaOptions, setAreaOptions] = useState<IOptions[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    const update = async () => {
      getMedicOptions();
      getCompanyOptions();
      getAreaByDeparmentOptions();
      await getStudiesOptions();
      setStudyFilter(studiesOptions);
    };
    update();
  }, [
    getMedicOptions,
    getCompanyOptions,
    getStudiesOptions,
    getAreaByDeparmentOptions,
  ]);

  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);

  useEffect(() => {
    setCityOptions(
      branchCityOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [branchCityOptions]);

  useEffect(() => {
    setBranchOptions(
      branchCityOptions
        .filter((x) => selectedCity?.includes(x.value as string))
        .flatMap((x) => x.options ?? [])
    );
  }, [branchCityOptions, form, selectedCity]);

  useEffect(() => {
    setDepartmentOptions(
      areaByDeparmentOptions.map((x) => ({ value: x.value, label: x.label }))
    );
  }, [areaByDeparmentOptions]);

  useEffect(() => {
    setAreaOptions(
      areaByDeparmentOptions
        .filter((x) => selectedDepartment?.includes(x.value as number))
        .flatMap((x) => x.options ?? [])
    );
  }, [areaByDeparmentOptions, form, selectedDepartment]);

  useEffect(() => {
    const defaultCode = !lastViewedFrom
      ? undefined
      : lastViewedFrom.from === "results"
      ? undefined
      : lastViewedFrom.code;

    if (!profile || !profile.sucursal || branchCityOptions.length === 0) return;
    const profileBranch = profile.sucursal;
    const userCity = branchCityOptions
      .find((x) => x.options!.some((y) => y.value === profileBranch))
      ?.value?.toString();

    const filter = {
      ...generalFilter,
      buscar: defaultCode ?? generalFilter.buscar,
      ciudad: !generalFilter.cargaInicial
        ? generalFilter.ciudad
        : [userCity as string],
      sucursalId: !generalFilter.cargaInicial
        ? generalFilter.sucursalId
        : [profileBranch],
    };
    form.setFieldsValue(filter);
    filter.cargaInicial = false;

    setGeneralFilter(filter);
    getAll(filter);
  }, [branchCityOptions]);

  const onFinish = async (newFormValues: IGeneralForm) => {
    setLoading(true);

    setGeneralFilter(newFormValues);
    await getAll(newFormValues);

    setLoading(false);
  };

  return (
    <div className="status-container">
      <Form<IGeneralForm>
        {...formItemLayout}
        form={form}
        name="clinicResults"
        onFinish={onFinish}
        initialValues={{
          fecha: [moment(), moment()],
          buscar:
            lastViewedFrom?.from === "results"
              ? undefined
              : lastViewedFrom?.code,
        }}
        scrollToFirstError
      >
        <Row justify="space-between" gutter={[0, 12]}>
          <Col span={8}>
            <DateRangeInput
              formProps={{ label: "Fecha", name: "fecha" }}
              required={true}
              disableAfterDates
            />
          </Col>
          <Col span={8}>
            <TextInput
              formProps={{
                name: "buscar",
                label: "Buscar",
              }}
              autoFocus
            />
          </Col>
          <Col span={8}>
            <SelectInput
              form={form}
              formProps={{
                name: "procedencia",
                label: "Procedencia",
              }}
              multiple
              options={originOptions}
            ></SelectInput>
          </Col>
          <Col span={8}>
            <SelectInput
              form={form}
              formProps={{
                name: "tipoSolicitud",
                label: "Tipo solicitud",
              }}
              multiple
              options={urgencyOptions}
            ></SelectInput>
          </Col>
          <Col span={8}>
            <SelectInput
              form={form}
              formProps={{
                name: "estatus",
                label: "Estatus",
              }}
              multiple
              options={studyStatusOptions}
            ></SelectInput>
          </Col>
          <Col span={8}>
            <Form.Item label="Áreas" className="no-error-text" help="">
              <Input.Group>
                <Row gutter={8}>
                  <Col span={12}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "departamento",
                        label: "Departamento",
                        noStyle: true,
                      }}
                      multiple
                      options={departmentOptions}
                    />
                  </Col>
                  <Col span={12}>
                    <SelectInput
                      form={form}
                      formProps={{
                        name: "area",
                        label: "Área",
                        noStyle: true,
                      }}
                      multiple
                      options={areaOptions}
                    />
                  </Col>
                </Row>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <SelectInput
              form={form}
              formProps={{
                name: "estudio",
                label: "Estudio",
              }}
              multiple
              options={studyFilter}
            ></SelectInput>
          </Col>
          <Col span={8}>
            <SelectInput
              form={form}
              formProps={{
                name: "medicoId",
                label: "Médico",
              }}
              multiple
              options={medicOptions}
            ></SelectInput>
          </Col>
          <Col span={8}>
            <Form.Item label="Sucursal" className="no-error-text" help="">
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
                        name: "sucursalId",
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
            <SelectInput
              form={form}
              formProps={{
                name: "compañiaId",
                label: "Compañía",
              }}
              multiple
              options={companyOptions}
            ></SelectInput>
          </Col>
          <Col span={16} style={{ textAlign: "right" }}>
            <Button key="clean" htmlType="reset">
              Limpiar
            </Button>
            <Button key="filter" type="primary" htmlType="submit">
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default observer(ClinicResultsFilter);
