import { userSchema } from "../schema/user.schema"

export const validate = async (req, res, next) => {
    try {
        const validationResult = userSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid inputs",
                errors: validationResult.error.errors 
            });
        }

        await next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error during validation"
        });
    }
};
