import axios from "axios";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const downloadBlobFile = (
  data,
  fileName,
  mimeType = EXCEL_MIME_TYPE,
) => {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const exportExcelReport = async ({
  url,
  params = {},
  axiosConfig = {},
  fileName,
}) => {
  const { params: configParams, ...restConfig } = axiosConfig;

  const response = await axios.get(url, {
    ...restConfig,
    params: cleanParams({
      ...configParams,
      ...params,
    }),
    responseType: "blob",
  });

  downloadBlobFile(response.data, fileName);

  return response;
};
