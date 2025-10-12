// NOTE: This component requires @react-oauth/google to be installed
// Run: npm install @react-oauth/google

import { GoogleLogin } from "@react-oauth/google";
import { CardContent } from "../components/ui/card";
import React from "react";

export function GoogleLoginComponent({
  handleLoginSuccess,
  handleLoginError,
}: {
  handleLoginSuccess: (response: any) => void;
  handleLoginError: (error: any) => void;
}) {
  return (
    <CardContent className="w-full h-full flex justify-center items-center">
      <GoogleLogin
        onSuccess={(response) => {
          try {
            console.log("Login success:", response);
            handleLoginSuccess(response);
          } catch (err) {
            console.error("Login error:", err);
            handleLoginError(err);
          }
        }}
        onError={() => {
          handleLoginError("Login failed, please try again.");
        }}
        containerProps={{
          style: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
        text="signin_with"
        theme="filled_blue"
        shape="pill"
        size="large"
        width="320"
      />
    </CardContent>
  );
}
