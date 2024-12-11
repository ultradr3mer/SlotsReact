import { Navigate } from "react-router-dom";
import React from 'react';

const AuthRequired = ({isAuth, children}) => {
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};
export default AuthRequired;