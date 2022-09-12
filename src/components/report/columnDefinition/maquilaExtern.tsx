import { IColumns, ISearch } from "../../../app/common/table/utils";
import { IReportData } from "../../../app/models/report";
import { getDefaultColumnProps } from "../../../app/common/table/utils";
import { Descriptions } from "antd";
import "../css/report.less";

const getMaquilaExternColumns = (
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
      ...getDefaultColumnProps("edad", "Edad", {
        searchState,
        setSearchState,
        width: "15%",
      }),
    },
    {
      ...getDefaultColumnProps("sexo", "Sexo", {
        searchState,
        setSearchState,
        width: "15%",
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
      ...getDefaultColumnProps("fechaEntrega", "Fecha de Entrega", {
        searchState,
        setSearchState,
        width: "20%",
      }),
    },
  ];

  return columns;
};

export const expandableMaquilaExternConfig = {
  expandedRowRender: (item: IReportData) => (
    <div>
      <h4>Estudios</h4>
      <Descriptions
        key={item.id}
        size="small"
        bordered
        style={{ marginBottom: 5 }}
      >
        <Descriptions.Item label="Clave" style={{ maxWidth: 50 }} className="description-content">
          {item.claveEstudio}
        </Descriptions.Item>
        <Descriptions.Item label="Estudio" style={{ maxWidth: 50 }} className="description-content">
          {item.nombreEstudio}
        </Descriptions.Item>
        <Descriptions.Item label="Estatus" style={{ maxWidth: 50 }} className="description-content">
          {item.estatus}
        </Descriptions.Item>
        <Descriptions.Item label="Maquilador" style={{ maxWidth: 50 }} className="description-content">
          {item.maquila}
        </Descriptions.Item>
      </Descriptions>
    </div>
  ),
  rowExpandable: () => true,
  defaultExpandAllRows: true,
};

export default getMaquilaExternColumns;