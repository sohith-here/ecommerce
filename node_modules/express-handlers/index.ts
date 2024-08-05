import ApiError from "./src/utils/apiError.utils";
import { AsyncHandler } from "./src/utils/asyncHandler.utils";
import ApiResponse from "./src/utils/apiResponse.utils";

interface TSendApiError {
  statusCode: number;
  name: string;
  errorMessage: string;
  errors: any;
}

const SendApiError = (params: TSendApiError) => {
  throw new ApiError(
    params.statusCode,
    params.name,
    params.errorMessage,
    params.errors
  );
};

interface TSendApiResponse {
  statusCode: number;
  successCode: string;
  successMessage: string;
  data?: any;
  res: Response;
}

const SendApiResponse = (params: TSendApiResponse) => {
  new ApiResponse(
    params.statusCode,
    params.successCode,
    params.successMessage,
    params.data,
    params.res
  );
};

export { AsyncHandler, SendApiError, SendApiResponse };
