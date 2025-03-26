import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GamePage from "./pages/GamePage/GamePage.jsx";
import MenuScreen from "./pages/MenuPage/MenuPage.jsx";


function App() {
  return (
    <>          
      <BrowserRouter>
        <Routes>
          <Route path="/game" element={ <GamePage/>   } />
          <Route path="/homepage" element={ <MenuScreen/>   } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
