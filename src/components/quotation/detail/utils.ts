import { FormInstance } from "antd";
import { IQuotationGeneral } from "../../../app/models/quotation";
import alerts from "../../../app/util/alerts";

export const submitGeneral = async (
  formGeneral: FormInstance<IQuotationGeneral>
) => {
  try {
    await formGeneral.validateFields();
    formGeneral.submit();
    return true;
  } catch (error: any) {
    if (error && error.hasOwnProperty("errorFields")) {
      alerts.warning("Por favor complete los campos correctamente");
    } else {
      alerts.warning(error.message);
    }
    return false;
  }
};

export const onSubmitGeneral = (
  general: IQuotationGeneral,
  updateGeneral: (quotation: IQuotationGeneral) => Promise<boolean>
) => {
  return updateGeneral(general);
};
