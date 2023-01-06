import { Space, Typography } from "antd";
import { store } from "../../../app/stores/store";
import Indicators from "./Indicators";
import { SettingFilled } from "@ant-design/icons";

const { Text } = Typography;

export const IndicatorsModal = () => {
  const { openModal, closeModal } = store.modalStore;

  return new Promise((resolve) => {
    openModal({
      title: (
        <Space size="middle">
          <SettingFilled color="#108ee9" />
          <Text>Configuración de parámetros</Text>
        </Space>
      ),
      body: (
        <Indicators
          getResult={(data) => {
            resolve(data);
            closeModal();
          }}
        />
      ),
      onClose: () => {
        resolve(undefined);
      },
      width: "50%",
    });
  });
};
