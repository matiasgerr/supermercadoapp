import React, { JSX } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from '../screen/app';
import Selector from "../components/Selector";
import PanelGestion from "../components/Gestion";

const Index = (): JSX.Element => {
    return (
        <Router>
            
            <Routes>
                <Route path="/" element={<App />} />
            </Routes>
        </Router>
    );
}