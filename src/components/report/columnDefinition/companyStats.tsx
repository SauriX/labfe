import { IColumns, ISearch } from "../../../app/common/table/utils";
import { IReportData } from "../../../app/models/report";
import { getDefaultColumnProps } from "../../../app/common/table/utils";
import { Descriptions, Table, Typography } from "antd";
import { moneyFormatter } from "../../../app/util/utils";
import React from "react";
const { Text } = Typography;

type companySummary = {
  totalEstudios: number;
  totalDescuentos: number;
  total: number;
  IVA: number;
  subtotal: number;
  auxTotalDescuentosPorcentual: number;
  totalDescuentosPorcentual: number;
}

const getCompanyStatsColumns = (
  searchState: ISearch,
  setSearchState: React.Dispatch<React.SetStateAction<ISearch>>
) => {
  const columns: IColumns<IReportData> = [
    {
      ...getDefaultColumnProps("solicitud", "Clave", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
    {
      ...getDefaultColumnProps("paciente", "Nombre del Paciente", {
        searchState,
        setSearchState,
        width: "35%",
      }),
    },
    {
      ...getDefaultColumnProps("medico", "Nombre del Médico", {
        searchState,
        setSearchState,
        width: "35%",
      }),
    },
    {
      ...getDefaultColumnProps("precioEstudios", "Estudios", {
        width: "20%",
      }),
      render: (value) => moneyFormatter.format(value),
    },
    {
      ...getDefaultColumnProps("descuentoPorcentual", "Desc. %", {
        width: "20%",
      }),
      render: (value) => Math.round(value * 100) / 100 + "%",
    },
    {
      ...getDefaultColumnProps("descuento", "Desc.", {
        width: "20%",
      }),
      render: (value) => moneyFormatter.format(value),
    },
    {
      ...getDefaultColumnProps("totalEstudios", "Total", {
        width: "20%",
      }),
      render: (value) => moneyFormatter.format(value),
    },
  ];

  return columns;
};

export const expandableCompanyConfig = {
  expandedRowRender: (item: IReportData) => (
    <div>
      <h4>Estudios</h4>
      {item.estudio.map((x) => {
        return (
          <>
            <Descriptions
              size="small"
              bordered
              labelStyle={{ fontWeight: "bold" }}
              contentStyle={{ background: "#fff" }}
              style={{ marginBottom: 5 }}
            >
              <Descriptions.Item label="Clave" style={{ maxWidth: 30 }}>
                {x.clave}
              </Descriptions.Item>
              <Descriptions.Item label="Estudio" style={{ maxWidth: 30 }}>
                {x.estudio}
              </Descriptions.Item>
              <Descriptions.Item label="Precio" style={{ maxWidth: 30 }}>
                ${x.precio}
              </Descriptions.Item>
            </Descriptions>
          </>
        );
      })}
    </div>
  ),
  rowExpandable: () => true,
};

export default getCompanyStatsColumns;
