import React from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Toastify(type, message) {
  type === "s" ? toast.success(message) : toast.error(message);
}

export default Toastify;
