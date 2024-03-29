import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable } from "mobx";
import { json } from "stream/consumers";
import Notifications from "../api/notiofications";
import { INotificationFilter } from "../models/notifications";
import { INotification } from "../models/shared";
import alerts from "../util/alerts";
import { getErrors } from "../util/utils";
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
    this.notifications = notifications;
  };
  getNotification = async  (filter:INotificationFilter)=>{
    try {
      let notifications = await Notifications.getNotification(filter);
      if(notifications){
        notifications.reverse();
        this.notifications = notifications;
      }

    } catch (error) {
      alerts.warning(getErrors(error));
      this.notifications = [];
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
        if (this.hubConnection.state === "Connected") {
          this.hubConnection.invoke("Subscribe");
          this.hubConnection.invoke("SubscribeWithName","all");
          this.hubConnection.invoke("SubscribeWithName",`${store.profileStore.profile?.rol}-${store.profileStore.profile?.sucursal}`);
        }
      } catch (error) {
      }

      this.hubConnection.onreconnected(() => {
        this.hubConnection!.invoke("Subscribe");
        this.hubConnection!.invoke("SubscribeWithName","all");
        this.hubConnection!.invoke("SubscribeWithName",`${store.profileStore.profile?.rol}-${store.profileStore.profile?.sucursal}`);
      });

      this.hubConnection.on("Notify", (notification: INotification) => {
        if (notification.esAlerta) {
          alerts.info(notification.mensaje);
        }else{
          console.log(notification);
          var notifications = [...this.notifications] 
          notifications.reverse();
          notifications.push(notification);
          notifications.reverse();
          this.notifications = notifications;
        }
      });
    } catch (error) {
    }
  };
}
