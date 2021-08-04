import { CpuLoadAvg } from "../types";

export const fetchCpuLoadAvg = async (
  endpointUrl: string
): Promise<CpuLoadAvg> =>
  fetch(endpointUrl)
    .then((response: Response) => {
      if (response.ok && response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        const errorMessage = !response.ok
          ? "Broken Response"
          : `Http Error with status code ${response.status}`;
        throw new Error(errorMessage);
      }
    })
    .catch((error: Error) => Promise.reject(error));
