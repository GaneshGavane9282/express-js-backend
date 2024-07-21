export const asyncHandler = (requestHandler) => async (request, response, next) => {
    try {
        await requestHandler(request, response, next);
    } catch (error) {
        response.status(error?.code || 500).json({
            success: false,
            message: error?.message || 'Internal Server Error',
        });
    }
};
