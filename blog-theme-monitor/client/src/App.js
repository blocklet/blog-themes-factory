import React from "react";
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";

// 组件
import Header from "./components/Header";
import Footer from "./components/Footer";
import ThemesList from "./pages/ThemesList";
import ThemeDetail from "./pages/ThemeDetail";
import NotFound from "./pages/NotFound";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
`;

function App() {
  return (
    <AppContainer>
      <Header />
      <MainContent className="container">
        <Routes>
          <Route path="/" element={<ThemesList />} />
          <Route path="/themes/:id" element={<ThemeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

export default App;
