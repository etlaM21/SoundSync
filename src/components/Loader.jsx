import React from "react";
import IconZoomIn from "../assets/icons/zoom-in-icon.svg";
import IconZoomOut from "../assets/icons/zoom-out-icon.svg";
import IconReload from "../assets/icons/reload-icon.svg";

export default function Loader({ text = "" }) {
    return (
        <div id="loader">
            <h1>Loading ...</h1>
            <p>{text}</p>
        </div>
    );
}