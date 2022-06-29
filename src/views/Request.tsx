import { Divider } from "antd";
import { Fragment } from "react";
import RequestHeader from "../components/request/RequestHeader";
import RequestRecord from "../components/request/RequestRecord";
import RequestTab from "../components/request/RequestTab";
import "../components/request/css/index.less";

const Request = () => {
  return (
    <Fragment>
      <RequestHeader />
      <Divider className="header-divider" />
      <RequestRecord />
      <RequestTab />
    </Fragment>
  );
};

export default Request;
