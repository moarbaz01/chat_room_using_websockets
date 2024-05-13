import "./App.css";
import { Route, Routes } from "react-router-dom";
import Rooms from "./pages/Rooms";
import Home from "./pages/Home";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
      </Routes>
    </div>
  );
}

export default App;
