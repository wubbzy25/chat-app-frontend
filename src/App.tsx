import "./App.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  return (
    <GoogleOAuthProvider clientId="233670441443-ubh961nm83ocs1etofnnr3vb695cmqil.apps.googleusercontent.com">
      <div className="App">{isAuthenticated ? <Home /> : <Login />}</div>
    </GoogleOAuthProvider>
  );
}

export default App;
