import { IColumns, ISearch } from "../../../app/common/table/utils";
import { IReportData } from "../../../app/models/report";
import { getDefaultColumnProps } from "../../../app/common/table/utils";
import { Descriptions, Table, Typography } from "antd";
import { moneyFormatter } from "../../../app/util/utils";
import React from "react";
const { Text } = Typography;

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
      ...getDefaultColumnProps("promocion", "Promoción", {
        width: "20%",
      }),
      render: (value) => moneyFormatter.format(value),
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

export const expandablePriceConfig = {
  expandedRowRender: (item: IReportData) => (
    <div>
      <h4>Estudios</h4>
      {item.estudio.map((x) => {
        return (
          <>
            <Descriptions
              key={x.id}
              size="small"
              bordered
              style={{ marginBottom: 5, color: "black" }}
            >
              <Descriptions.Item label="Clave" style={{ maxWidth: 30 }}>
                {x.clave}
              </Descriptions.Item>
              <Descriptions.Item label="Estudio" style={{ maxWidth: 30 }}>
                {x.estudio}
              </Descriptions.Item>
              <Descriptions.Item label="Promoción Estudio" style={{ maxWidth: 30 }}>
                ${x.descuento}
              </Descriptions.Item>
              <Descriptions.Item label="Precio Estudio" style={{ maxWidth: 30 }}>
                ${x.precioFinal}
              </Descriptions.Item>
              {x.paquete != null ? (
                <>
                  <Descriptions.Item label="Paquete" style={{ maxWidth: 30 }}>
                    {x.paquete}
                  </Descriptions.Item>
                  <Descriptions.Item label="Promoción Paquete" style={{ maxWidth: 30 }}>
                    ${x.promocion}
                  </Descriptions.Item>
                </>
              ) : (
                ""
              )}
            </Descriptions>
          </>
        );
      })}
    </div>
  ),
  rowExpandable: () => true,
  defaultExpandAllRows: true,
  // expandable: {defaultExpandAllRows: true}
};

export default getCompanyStatsColumns;
