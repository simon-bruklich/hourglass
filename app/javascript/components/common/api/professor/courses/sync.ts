import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  synced: boolean;
}

export function useResponse(courseId: number): ApiResponse<Response> {
  return useApiResponse(
    `/api/professor/courses/${courseId}/sync`,
    {
      method: 'POST',
    },
  );
}
