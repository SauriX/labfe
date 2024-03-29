import { Button, Descriptions, Table, Tag } from "antd";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect, useState } from "react";
import { defaultPaginationProperties, IColumns } from "../../app/common/table/utils";
import { InvoiceData, IReportData } from "../../app/models/report";
import { ExpandableConfig } from "antd/lib/table/interface";
import { useSearchParams } from "react-router-dom";
import getInvoiceDataColumns from "./columnDefinition/invoiceData";

type ReportTableProps = {
  loading: boolean;
  data: IReportData[];
  columns: IColumns<IReportData>;
  hasFooterRow?: boolean;
  expandable?: ExpandableConfig<IReportData> | undefined;
  summary?: boolean;
};

let totalEstudios = 0;
let totalDescuentos = 0;
let total = 0;
let IVA = total * 0.16;
let subtotal = total - IVA;
let auxTotalDescuentosPorcentual = 0;
let totalDescuentosPorcentual = 0;

const ReportTable = ({
  loading,
  data,
  columns,
  hasFooterRow,
  expandable,
  summary,
}: ReportTableProps) => {
  const [report, setReport] = useState<string>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [openRows, setOpenRows] = useState<boolean>(false);
  const [params] = useSearchParams();

  useEffect(() => {
    setReport(params.get("report") ?? undefined);
  }, [params.get("report")]);

  useEffect(() => {
    setExpandedRowKeys(data.map((x) => x.id));
    setOpenRows(true);
  }, [data]);

  totalDescuentos = 0;
  totalEstudios = 0;
  {
    data.forEach((x) => {
      totalEstudios += x.precioEstudios;
      report == "cargo"
        ? (totalDescuentos += x.cargo)
        : (totalDescuentos += x.descuento);
    });
  }
  auxTotalDescuentosPorcentual = (totalDescuentos / totalEstudios) * 100;
  totalDescuentosPorcentual =
    Math.round(auxTotalDescuentosPorcentual * 100) / 100;
  report == "cargo"
    ? (total = totalEstudios + totalDescuentos)
    : (total = totalEstudios - totalDescuentos);
  IVA = total * 0.16;
  subtotal = total - IVA;

  const dataInvoice: InvoiceData[] = [
    {
      key: "1",
      totalEstudios: totalEstudios == 0 ? 0 : totalEstudios,
      totalDescuentoPorcentual: isNaN(totalDescuentosPorcentual)
        ? 0
        : totalDescuentosPorcentual,
      totalDescuentos: totalDescuentos,
      subtotal: Math.round(subtotal * 100) / 100,
      iva: Math.round(IVA * 100) / 100,
      total: total,
    },
  ];

  const toggleRow = () => {
    if (openRows) {
      setOpenRows(false);
      setExpandedRowKeys([]);
    } else {
      setOpenRows(true);
      setExpandedRowKeys(data.map((x) => x.id));
    }
  };

  const onExpand = (isExpanded: boolean, record: IReportData) => {
    let expandRows: string[] = expandedRowKeys;
    if (isExpanded) {
      expandRows.push(record.id);
    } else {
      const index = expandRows.findIndex((x) => x === record.id);
      if (index > -1) {
        expandRows.splice(index, 1);
      }
    }
    setExpandedRowKeys(expandRows);
  };

  return (
    <Fragment>
      {data.length > 0 &&
        (report == "cargo" ||
          report == "presupuestos" ||
          report == "empresa" ||
          report == "medicos-desglosado" ||
          report == "maquila_interna" ||
          report == "maquila_externa" ||
          report == "canceladas") && (
          <div style={{ textAlign: "right", marginBottom: 10 }}>
            <Button
              type="primary"
              onClick={toggleRow}
              style={{ marginRight: 10 }}
            >
              {!openRows ? "Abrir tabla" : "Cerrar tabla"}
            </Button>
          </div>
        )}
      <Table<IReportData>
        loading={loading}
        size="small"
        rowKey={(record) => record.id}
        columns={columns}
        pagination={defaultPaginationProperties}
        dataSource={[...data]}
        scroll={{ y: 400 }}
        rowClassName={(item) =>
          item.claveMedico == "Total" || item.paciente === "Total"
            ? "Resumen Total"
            : ""
        }
        expandable={{
          ...expandable,
          onExpand: onExpand,
          expandedRowKeys: expandedRowKeys,
        }}
      />
      <div style={{ textAlign: "right", marginTop: 10, marginBottom: 10 }}>
        <Tag color="lime">
          {!hasFooterRow ? data.length : Math.max(data.length - 1, 0)} Registros
        </Tag>
      </div>
      {summary ? (
        <>
          <Table
            columns={getInvoiceDataColumns(report as string)}
            dataSource={dataInvoice}
            pagination={false}
          />
        </>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default observer(ReportTable);
