import React from "react";
import ReactDOM from "react-dom";
import { Provider as AuthProvider} from './Context/AuthContext';
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <AuthProvider>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </AuthProvider>,
    document.getElementById("root")
);