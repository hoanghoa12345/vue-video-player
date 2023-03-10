import { ClientPluginContext, useMutation } from "villus";
import { useStorage } from "@vueuse/core";

let retryCount = 0;
// let token = localStorage.getItem("access_token") || "";

export function authPluginWithRefresh({
  opContext,
  afterQuery,
}: ClientPluginContext) {
  const tokenState = useStorage("access_token", "");

  opContext.headers.Authorization = `Bearer ${tokenState.value}`;

  const RefreshToken = `
    mutation refreshToken($token: String) {
        refreshToken (token: $token)
    }
  `;
  const { execute } = useMutation(RefreshToken);

  afterQuery((result, { response }) => {
    console.log("response", response);
    console.log("result", result);

    // if no response, then the fetch plugin failed with a fatal error
    if (!response) {
      return;
    }
    console.log("retry count: ", retryCount);

    // Update the access token
    if (
      response.ok === false &&
      response.body?.errors[0].message === "jwt expired" &&
      retryCount < 1
    ) {
      console.log("jwt expired");
      retryCount += 1;
      execute({ token: localStorage.getItem("refresh_token") }).then(
        ({ data, error }: any) => {
          console.log(error, data);
          // router.push('/login')
        }
      );
    }
    const { refreshToken }: any = response.body?.data;
    if (refreshToken) {
      tokenState.value = refreshToken;
      localStorage.setItem("access_token", refreshToken);
      opContext.headers.Authorization = `Bearer ${tokenState.value}`;
    }

    const { login }: any = response.body?.data;
    if (login) {
      tokenState.value = login?.token;
      opContext.headers.Authorization = `Bearer ${tokenState.value}`;
    }
    console.log("token");
  });
}
