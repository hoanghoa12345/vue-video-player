import { ClientPluginContext, useMutation } from "villus";
import { useStorage } from "@vueuse/core";
import { ref } from 'vue'

export function authPluginWithRefresh({
  opContext,
  afterQuery,
}: ClientPluginContext) {
  const isRetry = ref<boolean>(false);
  const tokenState = useStorage("access_token", "");

  opContext.headers.Authorization = `Bearer ${tokenState.value}`;

  const RefreshToken = `
    mutation refreshToken($token: String) {
        refreshToken (token: $token)
    }
  `;
  const { execute } = useMutation(RefreshToken);

  afterQuery((result, { response }) => {

    // if no response, then the fetch plugin failed with a fatal error
    if (!response) {
      return;
    }
    if (result.error && result.error.response.status === 401 && !isRetry.value) {
      console.log("401 Unauthorized");
      isRetry.value = true;

      // Update the access token
      execute({ token: localStorage.getItem("refresh_token") }).then(
        ({ data, error }: any) => {
          if (error) {
            console.error('Error when refreshing token: ', error);
          }
        }
      );
    }

    const { refreshToken }: any = result.data;
    if (refreshToken) {
      tokenState.value = refreshToken;
      opContext.headers.Authorization = `Bearer ${tokenState.value}`;
    }

    const { login }: any = result.data;
    if (login) {
      tokenState.value = login?.token;
      opContext.headers.Authorization = `Bearer ${tokenState.value}`;
    }
  });
}
