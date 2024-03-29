import { isFocusable } from "@testing-library/user-event/dist/utils";
import { Button, Checkbox, Col, Row, Select, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  defaultPaginationProperties,
  getDefaultColumnProps,
  IColumns,
  ISearch,
} from "../../../../app/common/table/utils";
import { IRequestPack, IRequestStudy } from "../../../../app/models/request";
import { IOptions } from "../../../../app/models/shared";
import { useStore } from "../../../../app/stores/store";
import alerts from "../../../../app/util/alerts";
import { moneyFormatter } from "../../../../app/util/utils";

const { Link } = Typography;

type RequestStudyProps = {
  data: IRequestStudy[];
  total: number;
  setData: React.Dispatch<React.SetStateAction<IRequestStudy[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
};

const RequestStudy: FC<RequestStudyProps> = ({
  data,
  setData,
  setTotal,
  total,
}) => {
  const { priceListStore, optionStore, appointmentStore } = useStore();
  const {
    getPricePacks,
    getPriceStudys,
    isStudy,
    isPack,
    packs,
    studies,
    setStudyFilter,
    studyFilter,
  } = appointmentStore;
  const {
    studyOptions,
    packOptions,
    getStudyOptions,
    getPackOptions,
    appointmentStudyOptions,
    getAppointmentStudyOptions,
    appointmentPackOptions,
    getAppointmentPackOptions
  } = optionStore;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<IRequestStudy[]>([]);

  const [options, setOptions] = useState<IOptions[]>([]);
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });

  useEffect(() => {
    const getdata = async () => {
      if (searchParams.get("type") == "laboratorio") {
        await getAppointmentStudyOptions("IMAGENOLOGÍA");
        await getAppointmentPackOptions("IMAGENOLOGÍA");
      } else {
        await getStudyOptions();
        await getPackOptions();
      }
    };

    getdata();
  }, [
    getPackOptions,
    getStudyOptions,
    getAppointmentStudyOptions,
    getAppointmentPackOptions,
  ]);

  useEffect(() => {
    if (searchParams.get("type") === "laboratorio") {
      const options: IOptions[] = [
        {
          value: "study",
          label: "Estudios",
          options: appointmentStudyOptions,
        },
        {
          value: "pack",
          label: "Paquetes",
          options: appointmentPackOptions,
        },
      ];
      setOptions(options);
    } else {
      const options: IOptions[] = [
        {
          value: "study",
          label: "Estudios",
          options: studyOptions,
        },
        {
          value: "pack",
          label: "Paquetes",
          options: packOptions,
        },
      ];
      setOptions(options);
    }
  }, [studyOptions, packOptions, appointmentStudyOptions, appointmentPackOptions]);

  const columns: IColumns<IRequestStudy | IRequestPack> = [
    {
      ...getDefaultColumnProps("clave", "Clave", {
        searchState,
        setSearchState,
        width: "10%",
      }),
      render: (value) => <Link>{value}</Link>,
    },
    {
      ...getDefaultColumnProps("nombre", "Estudio", {
        searchState,
        setSearchState,
        width: "30%",
      }),
      render: (value, item) => {
        if (isStudy(item)) {
          return `${value} (${item.parametros.map((x) => x.clave).join(", ")})`;
        } else {
          return `${value} (${item.estudios
            .flatMap((x) => x.parametros)
            .map((x) => x.clave)
            .join(", ")})`;
        }
      },
    },
    {
      key: "n",
      dataIndex: "n",
      title: "",
      align: "center",
      width: "5%",
      render: (value) => "N",
    },
    {
      ...getDefaultColumnProps("precio", "Precio", {
        searchable: false,
        width: "10%",
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
    {
      key: "cargo",
      dataIndex: "Cargo",
      title: "C",
      align: "center",
      width: "5%",
      render: (value) => <Checkbox />,
    },
    {
      key: "cargo",
      dataIndex: "Cargo",
      title: "D",
      align: "center",
      width: "5%",
      render: (value) => <Checkbox />,
    },
    {
      ...getDefaultColumnProps("dias", "Días", {
        searchable: false,
        width: "10%",
      }),
    },
    {
      ...getDefaultColumnProps("precioFinal", "Precio Final", {
        searchable: false,
        width: "15%",
      }),
      align: "right",
      render: (value) => moneyFormatter.format(value),
    },
    {
      key: "contenedor",
      dataIndex: "contenedor",
      title: "",
      width: "5%",
      align: "center",
      render: () => <ContainerBadge color="#108ee9" />,
    },
    Table.SELECTION_COLUMN,
  ];

  const addStudy = async (option: IOptions) => {
    const value = parseInt(option.value.toString().split("-")[1]);

    if (isNaN(value)) return;

    if (option.group === "study") {
      const study = await getPriceStudys(studyFilter, value);
      if (study == null) {
        return;
      }
      setTotal(study.precio + total);
    }

    if (option.group === "pack") {
      const pack = await getPricePacks(studyFilter, value);
      if (pack == null) {
        return;
      }
    }

    setOptions((prev) => {
      let studies = [...prev.find((x) => x.value === "study")!.options!];
      let packs = [...prev.find((x) => x.value === "pack")!.options!];

      if (option.group === "study") {
        studies = studies.filter((x) => x.value !== option.value);
      } else if (option.group === "pack") {
        packs = packs.filter((x) => x.value !== option.value);
      }

      return [
        {
          value: "study",
          label: "Estudios",
          options: studies,
        },
        {
          value: "pack",
          label: "Paquetes",
          options: packs,
        },
      ];
    });
  };
  const [selectedStudies, setSelectedStudies] = useState<IRequestStudy[]>([]);

  return (
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <Select
          showSearch
          value={[]}
          mode="multiple"
          placeholder="Buscar Estudios"
          optionFilterProp="children"
          style={{ width: "65%" }}
          onChange={(_, option) => {
            addStudy((option as IOptions[])[0]);
          }}
          filterOption={(input: any, option: any) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          options={options}
        />
        {/* <DebounceSelect
          fetchOptions={fetch}
          style={{ width: "100%" }}
          mode="multiple"
          value={[]}
          placeholder="Buscar Estudios"
          onChange={(newValue) => {
            // setValue(newValue as UserValue[]);
          }}
          maxTagCount={0}
          maxTagPlaceholder={null}
          tagRender={() => <div>Hola</div>}
          // style={{ width: '100%' }}
        /> */}
      </Col>
      <Col span={24}>
        <Table<IRequestStudy | IRequestPack>
          size="small"
          rowKey={(record) => record.type + "-" + record.clave}
          columns={columns}
          dataSource={[...studies, ...packs]}
          pagination={false}
          rowSelection={{
            onSelect: (_item, _selected, c) => {
              const studies = [
                ...c
                  .filter((x) => x.type === "study")
                  .map((x) => x as IRequestStudy),
                ...c
                  .filter((x) => x.type === "pack")
                  .flatMap((x) => (x as IRequestPack).estudios),
              ];
              setSelectedStudies(studies);
            },
            getCheckboxProps: (item) => ({
              disabled: false,
            }),
          }}
          sticky
          scroll={{ x: "auto" }}
        />
      </Col>
      <Col span={24}>
        <Button
          style={{
            borderColor: "#87CEFA",
            marginTop: "40px",
            marginLeft: "400px",
            width: "700px;",
          }}
          onClick={() => {
            setData([]);
          }}
        >
          Remover estudios
        </Button>
      </Col>
    </Row>
  );
};

const ContainerBadge = ({ color }: { color: string }) => {
  return (
    <div className="badge-container" style={{ backgroundColor: color }}></div>
  );
};

export default observer(RequestStudy);
