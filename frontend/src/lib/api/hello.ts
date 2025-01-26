import { apiClient } from '$lib/api/client';
import { hashPayload } from '$lib/util/postLambdaUrl';

export const getHello = async () => {
  const res = await apiClient.api.public.hello.$get();
  console.log(res);
};

export const postHello = async () => {
  const res = await apiClient.api.public.hello.$post(
    {},
    {
      headers: {
        'x-amz-content-sha256': await hashPayload('')
      }
    }
  );
  console.log(res);
};

export const getValidateTest = async () => {
  const payload = {
    username: 'test',
    password: 'test'
  };

  const res = await apiClient.api.public['validate-test'].$post(
    {
      json: payload
    },
    {
      headers: {
        'x-amz-content-sha256': await hashPayload(JSON.stringify(payload))
      }
    }
  );
  console.log(res);
};

export const getValidateHello = async () => {
  const payload = {
    username: 'test',
    password: 'password'
  };

  const res = await apiClient.api.public['validate-hello'].$get(
    {
      query: payload
    },
    {
      headers: {
        'x-amz-content-sha256': await hashPayload(JSON.stringify(payload))
      }
    }
  );
  console.log(res);
};
