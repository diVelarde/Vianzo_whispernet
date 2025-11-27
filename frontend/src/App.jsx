import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Feed from "./pages/Feed";
import Compose from "./pages/Compose";
import Search from "./pages/Search";
import Rankings from "./pages/Rankings";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/search" element={<Search />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
