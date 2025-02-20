import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export function Login() {
  const responseMessage = (response: CredentialResponse) => {
    if (response.credential) {
      const credentialsDecoded = jwtDecode(response.credential);
      console.log("Credentials Decoded:", credentialsDecoded);
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
