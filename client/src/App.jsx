import { Routes, Route } from 'react-router-dom';
import Sanctuary from './pages/Sanctuary';
import Offering from './pages/Offering';
import Remembrance from './pages/Remembrance';
import KeepsakeLetter from './pages/KeepsakeLetter';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Sanctuary />} />
      <Route path="/offer" element={<Offering />} />
      <Route path="/remember/:id" element={<Remembrance />} />
      <Route path="/letter/:id" element={<KeepsakeLetter />} />
    </Routes>
  );
}
