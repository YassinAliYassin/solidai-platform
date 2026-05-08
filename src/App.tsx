/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SolidLLM from "./pages/SolidLLM";
import SolidAIAbout from "./pages/SolidAIAbout";
import SolidAI from "./pages/SolidAI";
import SolidAIDocs from "./pages/SolidAIDocs";
import Documentation from "./pages/Documentation";
import BetaAccess from "./pages/BetaAccess";
import ComingSoon from "./pages/ComingSoon";
import PictureGallery from "./pages/PictureGallery";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solid-llm" element={<SolidLLM />} />
        <Route path="/solid-llm/about" element={<SolidAIAbout />} />
        <Route path="/solidai" element={<SolidAI />} />
        <Route path="/solidai/docs" element={<SolidAIDocs />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/beta" element={<BetaAccess />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/gallery" element={<PictureGallery />} />
      </Routes>
    </BrowserRouter>
  );
}

