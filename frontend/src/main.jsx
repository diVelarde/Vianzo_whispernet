import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Layout from "./layout";
import Feed from "./pages/Feed";
import Compose from "./pages/Compose";
import Search from "./pages/Search";
import Rankings from "./pages/Rankings";
import Profile from "./pages/Profile";
import LoginPage from "./pages/login";
import HomePage from "./pages/homepage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Feed />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/compose" element={<Compose />} />
        <Route path="/search" element={<Search />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);
