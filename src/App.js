import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import CrudModule from './components/CrudModule';
import React from 'react';
import config from './config/appConfig.json'; // Adjust the path if necessary

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout config={config.app} />}>
          {/* Dashboard route */}
          <Route path="/" element={<div>Dashboard</div>} />
          
          {/* Module routes */}
          {Object.entries(config.modules).map(([key, module]) => (
            <Route
              key={key}
              path={`/${key}`}
              element={<CrudModule module={module} />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;