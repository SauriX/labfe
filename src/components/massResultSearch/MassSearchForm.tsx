import { Button, Col, Form, Row } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import DateRangeInput from "../../app/common/form/DateRangeInput";
import SelectInput from "../../app/common/form/proposal/SelectInput";
import TextInput from "../../app/common/form/TextInput";
import { IMassSearch } from "../../app/models/massResultSearch";
import { IOptions } from "../../app/models/shared";
import { useStore } from "../../app/stores/store";
import { formItemLayout } from "../../app/util/utils";

const AreasFilter = [5, 34, 23, 44, 28, 17, 41, 9, 20];

const MassSearchForm = () => {
  const [form] = Form.useForm();

  const { optionStore, massResultSearchStore } = useStore();

  const [filteredAreas, setFilteredAreas] = useState<IOptions[]>([]);
  const [studiesFilteredByArea, setStudiesFilteredByArea] = useState<any[]>([]);

  const {
    branchCityOptions,
    getBranchCityOptions,
    areas,
    getareaOptions,
    studiesOptions,
    getStudiesOptions,
  } = optionStore;

  const { setAreas, getRequestResults } = massResultSearchStore;

  useEffect(() => {
    loadInit();
  }, []);

  useEffect(() => {
    setFilteredAreas(areas.filter((a) => AreasFilter.includes(+a.value)));
  }, [areas]);
  useEffect(() => {
    setStudiesFilteredByArea(studiesOptions);
  }, [studiesOptions]);

  const loadInit = async () => {
    await getBranchCityOptions();
    await getareaOptions(0);
    await getStudiesOptions();
  };

  const onFinish = async (values: IMassSearch) => {
    await getRequestResults(values);
  };

  return (
    <>
      <Row justify="end" style={{ marginBottom: 10 }}>
        <Col>
          <Button
            key="clean"
            onClick={(e) => {
              e.stopPropagation();
              form.resetFields();
            }}
          >
            Limpiar
          </Button>
          ,
          <Button
            key="filter"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              form.submit();
            }}
          >
            Filtrar
          </Button>
        </Col>
      </Row>
      <div className="status-container">
        <Form<IMassSearch> {...formItemLayout} form={form} onFinish={onFinish}>
          <Row>
            <Col span={24}>
              <Row justify="space-between" gutter={[12, 12]}>
                <Col span={8}>
                  <DateRangeInput
                    formProps={{ label: "Fecha", name: "fechas" }}
                  />
                </Col>
                <Col span={8}>
                  <SelectInput
                    formProps={{ label: "Área", name: "area" }}
                    options={filteredAreas}
                    onChange={(value: any, option: any) => {
                      console.log("areas", value, option);
                      setStudiesFilteredByArea(
                        studiesOptions.filter((s) => s.area === +value)
                      );

                      setAreas(option.label);
                    }}
                  />
                </Col>
                <Col span={8}>
                  <TextInput
                    formProps={{ label: "Buscar", name: "busqueda" }}
                  />
                </Col>
                <Col span={8}>
                  <SelectInput
                    formProps={{ label: "Sucursal", name: "sucursales" }}
                    multiple
                    options={branchCityOptions}
                  />
                </Col>
                <Col span={8}>
                  <SelectInput
                    formProps={{ label: "Estudio", name: "estudios" }}
                    multiple
                    options={studiesFilteredByArea}
                  />
                </Col>
                <Col span={8} style={{ paddingLeft: "140px" }}></Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default observer(MassSearchForm);