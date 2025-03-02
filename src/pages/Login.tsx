import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { DecodedToken } from "../interfaces/DecodeTokenLoginInterface";

export function Login() {
  const responseMessage = async (response: CredentialResponse) => {
    if (response.credential) {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(
        response.credential
      );

      const responseLogin = await fetch(
        "https://chat-app-backend-9q4s.onrender.com/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: decoded?.name,
            email: decoded?.email,
            picture: decoded?.picture,
          }),
        }
      );
      const dataLogin = await responseLogin.json();
      const token = dataLogin.token;
      Cookies.set("token", token, { expires: 7 });
      window.location.reload();
    } else {
      console.error("Credential is undefined");
    }
  };
  const errorMessage = () => {
    console.log("error message");
  };
  return (
    <main className="flex justify-center items-center h-screen bg-gray-800 ">
      <div className="bg-white shadow-2xl max-w-sm p-10 flex flex-col gap-10 justify-center items-center rounded-xl h-auto">
        <h1 className="text-5xl">Sign In</h1>
        <GoogleLogin
          auto_select={true}
          useOneTap={true}
          onSuccess={responseMessage}
          onError={errorMessage}
        />
      </div>
    </main>
  );
}
