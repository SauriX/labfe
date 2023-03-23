import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable } from "mobx";
import { json } from "stream/consumers";
import { INotification } from "../models/shared";
import alerts from "../util/alerts";
import { store } from "./store";

export default class NotificationStore {
  constructor() {
    makeAutoObservable(this);
  }

  hubConnection: HubConnection | null = null;
  notifications:INotification[]=[];
  updateNotification = (notification:INotification)=>{
    var notifications = [...this.notifications] 
    notifications=notifications.filter(x=>x != notification);
    var notificationString = "";
    notifications.forEach(element => {
      notificationString += `${JSON.stringify(element)}-`
    });
window.localStorage.setItem("notifications", notificationString );
    this.notifications = notifications;
  };
  getNotification = ()=>{
    var notofications = window.localStorage.getItem("notifications")?.split("-");
    if(notofications){
      
       notofications.pop();
       var notifications:INotification[] = notofications.map(x=>JSON.parse(x));
       this.notifications = notifications;
       

    }
    
  };
  createHubConnection = async () => {
    try {
      const hubUrl = process.env.REACT_APP_NOTIFICATION_URL;
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl!, {
          accessTokenFactory: () => store.profileStore.token!,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Debug)
        .build();

      try {
        await this.hubConnection.start();
        console.log("mensaje");
        if (this.hubConnection.state === "Connected") {
          console.log("mensaje","conectado");
          this.hubConnection.invoke("Subscribe");
          this.hubConnection.invoke("SubscribeWithName","all");
          this.hubConnection.invoke("SubscribeWithName",store.profileStore.profile?.sucursal);
          this.hubConnection.invoke("SubscribeWithName",store.profileStore.profile?.rol);
        }
      } catch (error) {
        console.log("Error al conectar con SignalR: ", error);
      }

      this.hubConnection.onreconnected(() => {
        console.log("mensaje","reconectado");
        this.hubConnection!.invoke("Subscribe");
        this.hubConnection!.invoke("SubscribeWithName","all");
        this.hubConnection!.invoke("SubscribeWithName",store.profileStore.profile?.sucursal);
        this.hubConnection!.invoke("SubscribeWithName",store.profileStore.profile?.rol);
      });

      this.hubConnection.on("Notify", (notification: INotification) => {
        console.log(notification,"mensaje");
        if (notification.esAlerta) {
          alerts.info(notification.mensaje);
        }else{
          var notifications = [...this.notifications] 
          notifications.push(notification);
         
           var notificationString = "";
              notifications.forEach(element => {
                notificationString += `${JSON.stringify(element)}-`
              });
          window.localStorage.setItem("notifications", notificationString );
         
        }
      });
    } catch (error) {
      console.log("Error con SignalR: ", error);
    }
  };
}
