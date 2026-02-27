import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Gateway } from './pages/Gateway';
import { StreamerApp } from './pages/StreamerApp';
import { ListenerApp } from './pages/ListenerApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gateway />} />
        <Route path="/streamer" element={<StreamerApp />} />
        <Route path="/listener" element={<ListenerApp />} />
        <Route path="*" element={<Gateway />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
