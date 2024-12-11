import { Navigate } from "react-router-dom";
import React from 'react';

const ForwardAuthorized = ({isAuth, children}) => {
  if (isAuth) {
    return <Navigate to="/home" replace />;
  }
  return children;
};
export default ForwardAuthorized;