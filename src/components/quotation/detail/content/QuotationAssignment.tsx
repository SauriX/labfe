import { Form, Row, Col, Button, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import TextInput from "../../../../app/common/form/proposal/TextInput";
import { useStore } from "../../../../app/stores/store";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import views from "../../../../app/util/view";
import {
  defaultPaginationProperties,
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../../../app/common/table/utils";
import {
  IProceedingList,
  ISearchMedical,
} from "../../../../app/models/Proceeding";
import DateRangeInput from "../../../../app/common/form/proposal/DateRangeInput";
import { moneyFormatter } from "../../../../app/util/utils";

const { Link, Text } = Typography;

type QuotationAssignmentProps = {
  recordId: string | undefined;
  setRecordId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const QuotationAssignment = ({
  recordId,
  setRecordId,
}: QuotationAssignmentProps) => {
  const { quotationStore } = useStore();
  const { getRecords } = quotationStore;

  let navigate = useNavigate();

  const [form] = Form.useForm<ISearchMedical>();

  const [records, setRecords] = useState<IProceedingList[]>([]);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  useEffect(() => {
    const readRecords = async () => {
      const records = await getRecords({});
      setRecords(records);
    };

    readRecords();
  }, [getRecords]);

  const onFinish = async (values: ISearchMedical) => {
    const filter = { ...values };

    if (filter.fechaAlta && filter.fechaAlta.length > 1) {
      filter.fechaAlta[0] = filter.fechaAlta[0].utcOffset(0, true);
      filter.fechaAlta[1] = filter.fechaAlta[1].utcOffset(0, true);
    }

    const records = await getRecords(filter);
    setRecords(records);
  };

  const sharedOnCell = (_: IProceedingList, index: number | undefined) => {
    if (index === 0) {
      return { colSpan: 0 };
    }

    return {};
  };

  const columns: IColumns<IProceedingList> = [
    {
      ...getDefaultColumnProps("expediente", "Expediente", {
        searchState,
        setSearchState,
        width: "10%",
      }),
      render: (value, record, index) =>
        index === 0 ? (
          <Text type="secondary">Continuar sin expediente</Text>
        ) : (
          <Link
            onClick={() => {
              navigate(`/${views.proceeding}/${record.id}?mode=readonly`);
            }}
          >
            {value}
          </Link>
        ),
      onCell: (_, index) => ({
        colSpan: (index as number) === 0 ? 7 : 1,
      }),
    },
    {
      ...getDefaultColumnProps("nomprePaciente", "Paciente", {
        searchState,
        setSearchState,
        width: "30%",
      }),
      onCell: sharedOnCell,
    },
    {
      ...getDefaultColumnProps("genero", "Genero", {
        searchState,
        setSearchState,
        width: "10%",
      }),
      onCell: sharedOnCell,
    },
    {
      ...getDefaultColumnProps("edad", "Edad", {
        searchable: false,
        width: "10%",
      }),
      onCell: sharedOnCell,
    },
    {
      ...getDefaultColumnProps("fechaNacimiento", "Fecha de nacimiento", {
        searchable: false,
        width: "15%",
      }),
      onCell: sharedOnCell,
    },
    {
      ...getDefaultColumnProps("monederoElectronico", "Monedero", {
        searchable: false,
        width: "10%",
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
      onCell: sharedOnCell,
    },
    {
      ...getDefaultColumnProps("telefono", "Teléfono", {
        searchable: false,
        width: "10%",
      }),
      onCell: sharedOnCell,
    },
  ];

  return (
    <Row gutter={[8, 12]}>
      <Col span={24}>
        <Form<ISearchMedical> layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={[8, 12]} align="bottom">
            <Col span={5}>
              <TextInput
                formProps={{
                  name: "expediente",
                  label: "Paciente",
                }}
                placeholder="Expediente/Nombre"
                max={100}
              />
            </Col>
            <Col span={5}>
              <DateRangeInput
                formProps={{
                  label: "Fecha de alta",
                  name: "fechaAlta",
                }}
              />
            </Col>
            <Col span={5}>
              <TextInput
                formProps={{
                  name: "correo",
                  label: "Correo",
                }}
                max={100}
                type="email"
              />
            </Col>
            <Col span={5}>
              <TextInput
                formProps={{
                  name: "telfono",
                  label: "Teléfono",
                }}
                max={10}
              />
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              <Button htmlType="submit" type="primary">
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
      <Col span={24}>
        <Table<IProceedingList>
          size="small"
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={[
            {
              id: "",
              expediente: "Sin expediente",
              monederoElectronico: 0,
            } as any,
            ...records,
          ]}
          pagination={defaultPaginationProperties}
          sticky
          rowSelection={{
            type: "radio",
            selectedRowKeys: !recordId ? [""] : [recordId],
            onSelect: (record) => {
              setRecordId(record.id === "" ? undefined : record.id);
            },
          }}
          scroll={{ x: "max-content" }}
        />
      </Col>
    </Row>
  );
};
export default observer(QuotationAssignment);