import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants";

const registerValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLowercase().withMessage("Username should be in lowercase")
            .isLength({ min:3 }).withMessage("Username must be atleast 3 characters long"),
        body("password")
            .trim()
            .isLength({ min:6 }).withMessage("Password must be atleast 6 characters long"),
        body("fullname")
            .optional()
            .trim()
    ]
}

const resendVerificationTokenValidator = () =>{
    return[
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("password")
            .trim()
            .isLength({ min:6 }).withMessage("Password must be atleast 6 characters long"),
    ]
}

const forgotPasswordValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid")
    ]
}

const userChangeCurrentPasswordValidator = ()=>{
    return [
        body("oldPassword")
            .trim()
            .notEmpty().withMessage("Old Password is required")
            .isLength({ min:6 }).withMessage("Password must be atleast 6 characters long"),
        body("newPassword")
            .trim()
            .notEmpty().withMessage("New Password is required")
            .isLength({ min:6 }).withMessage("Password must be atleast 6 characters long"),
    ]
}

const userChangeForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
            .trim()
            .notEmpty().withMessage("New Password is required")
            .isLength({ min:6 }).withMessage("Password must be atleast 6 characters long"),
    ]
}

const createProjectValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Project name is required"),
        body("description")
            .optional()
            .trim()
    ]
}

const addMembersToProjectValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("role")
            .trim()
            .notEmpty().withMessage("Role is required")
            .isIn(AvailableUserRole).withMessage("Invalid role")
    ]
}

const updateMemberRoleValidator = () => {
    return [
        body("role")
            .trim()
            .notEmpty().withMessage("Role is required")
            .isIn(AvailableUserRole).withMessage("Invalid role")
    ]
}

export {
    registerValidator,
    resendVerificationTokenValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    forgotPasswordValidator,
    userChangeForgotPasswordValidator,
    createProjectValidator,
    addMembersToProjectValidator,
    updateMemberRoleValidator
};