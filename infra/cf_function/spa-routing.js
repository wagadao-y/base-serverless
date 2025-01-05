// フロントエンドSPAのリダイレクトを行うCloudFront Functions
function handler(event) {
  const request = event.request;
  const uri = request.uri;
  const doReplace = request.method === "GET" && uri.indexOf(".") === -1;

  if (doReplace) {
    request.uri = '/index.html';
  }

  return request;
}
