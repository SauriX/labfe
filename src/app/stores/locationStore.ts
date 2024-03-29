import { makeAutoObservable } from "mobx";
import Location from "../api/location";
import { IOptions } from "../models/shared";
import alerts from "../util/alerts";
import { getErrors } from "../util/utils";

export default class LocationStore {
  constructor() {
    makeAutoObservable(this);
  }

  cityOptions:IOptions[]=[];
  getColoniesByZipCode = async (zipCode: string) => {
    try {
      const colonies = await Location.getColoniesByZipCode(zipCode);
      return colonies;
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };

  getCity= async () => {
    try {
      const citys= await Location.getCities()
      var ciudades = citys.filter(x=>x.ciudad == "Ciudad Obregón"||x.ciudad == "Navojoa"||x.ciudad == "Hermosillo"||x.ciudad == "Nogales"||x.ciudad == "Guaymas"||x.ciudad=="Monterrey"||x.ciudad=="San Pedro Garza García");
      this.cityOptions=  ciudades.map((x)=>({
        value:x.ciudad, 
        label:x.ciudad
      }));
    } catch (error: any) {
      alerts.warning(getErrors(error));
    }
  };
}
