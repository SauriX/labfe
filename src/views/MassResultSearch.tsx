import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../app/stores/store";
import MassSearchForm from "../components/massResultSearch/MassSearchForm";
import MassSearchHeader from "../components/massResultSearch/MassSearchHeader";
import MassSearchTable from "../components/massResultSearch/MassSearchTable";

const MassResultSearch = () => {
  const { massResultSearchStore } = useStore();
  const { results, area, printPdf, search } = massResultSearchStore;
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await printPdf(search);
    setLoading(false);
  };

  return (
    <>
      <MassSearchHeader handleDownload={handleDownload} />
      <Divider className="header-divider" />
      <MassSearchForm />
      <Divider orientation="right">
        Area: {area.length > 0 ? area : "Sin selecccionar"} - Total de
        solicitudes: {results.length}
      </Divider>

      <MassSearchTable printing={loading} />
    </>
  );
};

export default observer(MassResultSearch);
