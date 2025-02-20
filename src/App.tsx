import "./App.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <GoogleOAuthProvider clientId="233670441443-ubh961nm83ocs1etofnnr3vb695cmqil.apps.googleusercontent.com">
      <div className="App">{isAuthenticated ? <Home /> : <Login />}</div>
    </GoogleOAuthProvider>
  );
}

export default App;
