const statusCodeConstant = require('../constants/error_statuscode_constant');

exports.errorHandlingMiddleware = function (err, res, req, next) {
    const statusCode = statusCodeConstant || 400;

    switch (statusCode) {
        case statusCode.BAD_REQUEST:
            res.json({
                title: "BAD_REQUEST",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.UNAUTHORIZED:
            res.json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.FORBIDDEN:
            res.json({
                title: "FORBIDDEN",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.NOT_FOUND:
            res.json({
                title: "NOT_FOUND",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.METHOD_NOT_ALLOWED:
            res.json({
                title: "METHOD_NOT_ALLOWED",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.INTERNAL_SERVER_ERROR:
            res.json({
                title: "INTERNAL_SERVER_ERROR",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.SERVICE_UNAVAILABLE:
            res.json({
                title: "SERVICE_UNAVAILABLE",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        case statusCode.GATEWAY_TIMEOUT:
            res.json({
                title: "GATEWAY_TIMEOUT",
                message: err.message,
                stackTrace: err.stack
            });
            break;

        default:
            res.json({
                title: "BAD_REQUEST",
                message: err.message,
                stackTrace: err.stack
            });
            break;
    }
}; 