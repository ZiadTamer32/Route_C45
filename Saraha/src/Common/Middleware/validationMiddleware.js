import { badRequest } from "../Response/response.js";

function validation(schema) {
  return (req, res, next) => {
    const validationErrors = {};
    for (const key of Object.keys(schema)) {
      const { value, error } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((err) => {
          validationErrors[err.path.join(".")] = err.message;
        });
      } else {
        req[key] = value;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequest(res, validationErrors);
    }

    next();
  };
}

export default validation;
