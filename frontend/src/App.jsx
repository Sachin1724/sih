import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Carousel from './pages/Carousel';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Carousel />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/4532224pls" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
