import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from '../../pages/Dashboard';
import DDS from '../../pages/DDS';
import Geolocations from '../../pages/Geolocations';
import Products from '../../pages/Products';
import OwnGoods from '../../pages/OwnGoods';
import RiskAssessments from '../../pages/RiskAssessments';
import RiskAssessmentDetail from '../../pages/RiskAssessmentDetail';
import RiskAssessmentEdit from '../../pages/RiskAssessmentEdit';
import Suppliers from '../../pages/Suppliers';
import SupplyChains from '../../pages/SupplyChains';
import Surveys from '../../pages/Surveys';
import Settings from '../../pages/Settings';
import Production from '../../pages/Production';
import PackagingLabelling from '../../pages/PackagingLabelling';
import Integrations from '../../pages/Integrations';

// Simple fade animation variants
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.15,
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Routes location={location}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/own-goods" element={<OwnGoods />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/risk-assessments" element={<RiskAssessments />} />
          <Route
            path="/risk-assessments/:id"
            element={<RiskAssessmentDetail />}
          />
          <Route
            path="/risk-assessments/:id/edit"
            element={<RiskAssessmentEdit />}
          />
          <Route path="/dds" element={<DDS />} />
          <Route path="/supply-chains" element={<SupplyChains />} />
          <Route path="/geolocations" element={<Geolocations />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/production" element={<Production />} />
          <Route path="/packaging-labelling" element={<PackagingLabelling />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
