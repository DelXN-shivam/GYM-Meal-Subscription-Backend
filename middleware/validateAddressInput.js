import { addressSchema } from "../schema/user.address.schema.js"

export const validateAddress = async (req , res , next) => {
    try {
        const validationRes = addressSchema.safeParse(req.body)

        if(!validationRes.success){
            return res.json({
                message : "Send valid inputs",
                errors: validationRes.error.errors 
            })
        }
        req.body = validationRes.data;
        await next()
    }
    catch (err){
        console.error("Error while adding address" , err)
        return res.json(500, {
            message : "error in address inputs"
        })
    }
}