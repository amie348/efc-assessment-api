import { Request, Response, NextFunction } from "express";
import Joi from "joi"; // Import Joi if it's used for validation
import VALIDATION_ATTRIBUTES from "@utils/constants";
import { ValidationParamEnums } from "@utils/enums";

const validateInput = (
  schema: Joi.ObjectSchema,
  validationParam: ValidationParamEnums
) => {
  /**
   *
   * @param {Joi.ObjectSchema} schema The Joi validation schema
   * @param {ValidationParam} validationParam The parameter that needs validation (BODY, PARAMS, QUERY, NONE)
   * @returns A middleware function for validating the input
   */
  const applyValidation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      /**
       * Getting the object to be validated based on the validation parameter.
       */
      let validationObject;
      if (validationParam === ValidationParamEnums.BODY) {
        validationObject = req.body;
      } else if (validationParam == ValidationParamEnums.PARAMS) {
        validationObject = req.params;
      } else if (validationParam == ValidationParamEnums.QUERY) {
        validationObject = req.query;
      } else {
        return next();
      }

      try {
        // If validationParam is "QUERY" and there is no data, move to next
        if (
          validationParam === "QUERY" &&
          !Object.keys(validationObject).length
        ) {
          return next();
        }
      } catch (error) {
        throw error;
      }

      /**
       * Applying the Joi schema validation.
       * On success, it calls the next middleware.
       */
      await schema.validateAsync(validationObject);

      // If validation is successful, move to the next middleware
      next();
    } catch (error) {
      /** 
        This means the validation failed and we will return a bad request error.
      */
      res.status(400).json({
        message: "Request Validation Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  };

  return applyValidation;
};

export default validateInput;
