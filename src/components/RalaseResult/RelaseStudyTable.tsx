import { Checkbox, Table, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useState } from "react";
import PrintIcon from "../../app/common/icons/PrintIcon";
import { EyeOutlined } from "@ant-design/icons";
import {
  IColumns,
  ISearch,
  getDefaultColumnProps,
} from "../../app/common/table/utils";
import { IUpdate } from "../../app/models/requestedStudy";

import { useNavigate } from "react-router";
import {
  checked,
  Irelacelist,
  IrelaceStudyList,
} from "../../app/models/relaseresult";
const { Link, Text } = Typography;

type expandableProps = {
  activiti: string;
  onChange: (e: CheckboxChangeEvent, id: number, solicitud: string) => void;
  viewTicket: (recordId: any) => Promise<void>;
  visto: checked[];
  setvisto: React.Dispatch<React.SetStateAction<checked[]>>;
  updateData: IUpdate[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type tableProps = {
  printTicket: (recordId: string, requestId: string) => Promise<void>;
};

const RelaseStudyColumns = ({ printTicket }: tableProps) => {
  const [searchState, setSearchState] = useState<ISearch>({
    searchedText: "",
    searchedColumn: "",
  });
  const navigate = useNavigate();
  const columns: IColumns<Irelacelist> = [
    {
      ...getDefaultColumnProps("solicitud", "Clave", {
        searchState,
        setSearchState,
        width: "15%",
      }),
      render: (_value, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link
            onClick={() => {
              navigate(`/clinicResultsDetails/${record?.order}/${record?.id}`);
            }}
          >
            {record.solicitud}
          </Link>
        </div>
      ),
    },
    {
      ...getDefaultColumnProps("nombre", "Nombre del Paciente", {
        searchState,
        setSearchState,
        width: "30%",
      }),
      render: (value, item) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text style={{ fontWeight: "bolder", marginBottom: -5 }}>{value}</Text>
          {item.sucursal} {item.edad} años {item.sexo}
        </div>
      ),
    },
    {
      ...getDefaultColumnProps("registro", "Registro", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
    {
      ...getDefaultColumnProps("compañia", "Compañía", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
    {
      key: "parcialidad",
      dataIndex: "parcialidad",
      title: "Parcialidad",
      align: "center",
      width: "10%",
      render: (_value, record) => <>{_value ? "Si" : "No"}</>,
    },
    {
      key: "imprimir",
      dataIndex: "imprimir",
      title: "Imprimir orden",
      align: "center",
      width: "10%",
      render: (_value, record) => (
        <>
          <PrintIcon
            key="imprimir"
            onClick={() => {
              printTicket(record.order, record.id);
            }}
          />
        </>
      ),
    },
  ];
  return columns;
};

export const ValidationStudyExpandable = ({
  activiti,
  onChange,
  viewTicket,
  visto,
  setvisto,
  updateData,
  setLoading,
}: // cambiar
  expandableProps) => {
  const [ver, setver] = useState<boolean>(false);
  const [cambio, stcambio] = useState<boolean>(false);
  const nestedColumns: IColumns<IrelaceStudyList> = [
    {
      ...getDefaultColumnProps("clave", "Estudio", {
        width: "50%",
      }),
      render: (_value, record) => record.study,
    }, {
      ...getDefaultColumnProps("nombreEstatus", "Estatus", {
        width: "1%",
      }),
      render: (_value, record) => (<div>        <>
        {((record.estatus === 5 &&
          visto.find(
            (x) =>
              x.idSolicitud == record.solicitudId && x.idstudio == record.id
          ) != undefined) ||
          (ver &&
            visto.find(
              (x) =>
                x.idSolicitud == record.solicitudId && x.idstudio == record.id
            ) != undefined &&
            record.estatus === 5)) && (
            <Checkbox
              onChange={(e) => {
                onChange(e, record.id, record.solicitudId);
                stcambio(!cambio);
              }}
              checked={
                updateData
                  .find((x) => x.solicitudId == record.solicitudId)
                  ?.estudioId.includes(record.id) ||
                (cambio &&
                  updateData
                    .find((x) => x.solicitudId == record.solicitudId)
                    ?.estudioId.includes(record.id))
              }
              disabled={!(activiti == "register")}
            ></Checkbox>
          )}
        {updateData
          .find((x) => x.solicitudId == record.solicitudId)
          ?.estudioId.includes(record.id) ||
          (cambio &&
            updateData
              .find((x) => x.solicitudId == record.solicitudId)
              ?.estudioId.includes(record.id))
          ? ""
          : ""}
        {record.estatus === 6 && activiti == "cancel" && (
          <Checkbox
            style={{ marginLeft: 50 }}
            onChange={(e) => {
              {
                onChange(e, record.id, record.solicitudId);
                stcambio(!cambio);
              }
            }}
            checked={
              updateData
                .find((x) => x.solicitudId == record.solicitudId)
                ?.estudioId.includes(record.id) ||
              (cambio &&
                updateData
                  .find((x) => x.solicitudId == record.solicitudId)
                  ?.estudioId.includes(record.id))
            }
            disabled={!(activiti == "cancel")}
          ></Checkbox>
        )}

        {record.estatus === 5 && activiti == "register" && (
          <EyeOutlined
            style={{ marginLeft: "20%" }}
            key="imprimir"
            onClick={async () => {
              setLoading(true);
              const sendFiles = {
                mediosEnvio: ["selectSendMethods"],
                estudios: [
                  {
                    solicitudId: record.solicitudId,
                    EstudiosId: [{ EstudioId: record.id }],
                  },
                ],
              };
              var vistos = visto;
              vistos.push({
                idSolicitud: record.solicitudId,
                idstudio: record.id,
              });

              await viewTicket(sendFiles);
              setvisto(vistos);
              setver(!ver);
              setLoading(false);
            }}
          />
        )}
      </>
        {record.status}
      </div>),
    },
    {
      ...getDefaultColumnProps("nombreEstatus", "Estatus", {
        width: "10%",
      }),
      render: (_value, record) => (<div>
        {record.status}
      </div>),
    },
    {
      key: "registro",
      dataIndex: "Registro",
      title: "Registro",
      align: "center",
      width: "10%",
      render: (_value, record) => (
        <Typography>
          <Text style={!record.tipo ? { color: "red" } : {}}>
            {record.registro}
          </Text>
        </Typography>
      ),
    },

    {
      ...getDefaultColumnProps("entrega", "Entrega", {
        width: "10%",
      }),
      render: (_value, record) => record.entrega,
    },

  ];

  return {
    expandedRowRender: (item: Irelacelist, index: any) => (
      <Table
        columns={nestedColumns}
        dataSource={item.estudios}
        pagination={false}
        className="header-expandable-table"
        showHeader={false}
      />
    ),
    rowExpandable: () => true,
    defaultExpandAllRows: true,
  };
};

export default RelaseStudyColumns;
