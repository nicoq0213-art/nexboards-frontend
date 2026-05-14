import React from "react";
import { LOGO_SRC } from "../constants";

export default function LoadingScreen({ text = "Cargando datos…" }) {
  return (
    <div className="loader-screen">
      <img src={LOGO_SRC} alt="Logo" className="loader-logo" />
      <div className="loader-ring" />
      <p className="loader-text">{text}</p>
    </div>
  );
}
