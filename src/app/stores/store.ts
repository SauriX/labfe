import { configure } from "mobx";
import { createContext, useContext } from "react";
import ProfileStore from "./profileStore";
import ReagentStore from "./reagentStore";
import MedicsStore from "./medicsStore";
import UserStore from "./userStore";
import IndicationStore from "./indicationStore";
import EquipmentStore from "./equipmentStore";
import CatalogStore from "./catalogStore";
import OptionStore from "./optionStore";
import RoleStore from "./roleStore";
import LocationStore from "./locationStore";
import BranchStore from "./brancStore";
import CompanyStore from "./companyStore";
import ParameterStore from "./parameterStore";
import MaquiladorStore from "./maquiladorStore";
import StudyStore from "./studyStore";
import PriceListStore from "./priceListStore";
import PackStore from "./packStore";
import PromotionStore from "./promotionStore";
import LoyaltyStore from "./loyaltyStore";
import ModalStore from "./modalStore";
import DrawerStore from "./drawerStore";
import RouteStore from "./routeStore";
import ConfigurationStore from "./configurationStore";
import ProcedingStore from "./procedingStore";
import QuotationStore from "./quotationStore";
import ReportStore from "./reportStore";
import RequestStore from "./requestStore";
import AppointmentStore from "./appointmentStore";
import { IReportData } from "../models/report";
import NotificationStore from "./notificationStore";
import SamplingStore from "./samplingStore";
import CashRegisterStore from "./cashRegisterStore";
import RequestedStudyStore from "./requestedStudyStore";
import EquipmentMantainStore from "./EquipentMantainStore";
import TrackingOrderStore from "./trackingOrderStore";
import RouteTrackingStore from "./routeTracking"

configure({
  enforceActions: "never",
});

interface Store {
  modalStore: ModalStore;
  drawerStore: DrawerStore;
  profileStore: ProfileStore;
  optionStore: OptionStore;
  configurationStore: ConfigurationStore;
  userStore: UserStore;
  reagentStore: ReagentStore;
  medicsStore: MedicsStore;
  companyStore: CompanyStore;
  indicationStore: IndicationStore;
  equipmentStore: EquipmentStore;
  trackingOrderStore: TrackingOrderStore;
  catalogStore: CatalogStore;
  roleStore: RoleStore;
  locationStore: LocationStore;
  branchStore: BranchStore;
  parameterStore: ParameterStore;
  maquiladorStore: MaquiladorStore;
  studyStore: StudyStore;
  priceListStore: PriceListStore;
  packStore: PackStore;
  promotionStore: PromotionStore;
  loyaltyStore: LoyaltyStore;
  routeStore: RouteStore;
  procedingStore: ProcedingStore;
  quotationStore: QuotationStore;
  reportStore: ReportStore;
  cashRegisterStore: CashRegisterStore;
  requestStore: RequestStore;
  appointmentStore: AppointmentStore;
  notificationStore: NotificationStore;
  samplig: SamplingStore;
  requestedStudyStore: RequestedStudyStore;
  equipmentMantainStore: EquipmentMantainStore;
  routeTrackingStore:RouteTrackingStore;
}

export const store: Store = {
  modalStore: new ModalStore(),
  drawerStore: new DrawerStore(),
  profileStore: new ProfileStore(),
  optionStore: new OptionStore(),
  configurationStore: new ConfigurationStore(),
  userStore: new UserStore(),
  reagentStore: new ReagentStore(),
  medicsStore: new MedicsStore(),
  companyStore: new CompanyStore(),
  indicationStore: new IndicationStore(),
  equipmentStore: new EquipmentStore(),
  trackingOrderStore: new TrackingOrderStore(),
  catalogStore: new CatalogStore(),
  roleStore: new RoleStore(),
  locationStore: new LocationStore(),
  branchStore: new BranchStore(),
  parameterStore: new ParameterStore(),
  maquiladorStore: new MaquiladorStore(),
  studyStore: new StudyStore(),
  priceListStore: new PriceListStore(),
  packStore: new PackStore(),
  promotionStore: new PromotionStore(),
  loyaltyStore: new LoyaltyStore(),
  routeStore: new RouteStore(),
  procedingStore: new ProcedingStore(),
  quotationStore: new QuotationStore(),
  reportStore: new ReportStore(),
  cashRegisterStore: new CashRegisterStore(),
  requestStore: new RequestStore(),
  appointmentStore: new AppointmentStore(),
  notificationStore: new NotificationStore(),
  samplig: new SamplingStore(),
  requestedStudyStore: new RequestedStudyStore(),
  equipmentMantainStore: new EquipmentMantainStore(),
  routeTrackingStore: new RouteTrackingStore(),
};

export const StoreContext = createContext(store);

export function useStore() {
  return useContext(StoreContext);
}
