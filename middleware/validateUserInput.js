import { userSchema } from "../schema/user.schema.js"
/*
    user input validation using zod library
    used for validating the user input at the time of register
*/
export const validate = async (req, res, next) => {
    try {
        const validationResult = userSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid inputs",
                errors: validationResult.error.errors 
            });
        }
        req.body =  validationResult.data
        await next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error during validation"
        });
    }
};
