import { body } from "express-validator";
import { AvailableTaskStatuses, AvailableUserRole } from "../utils/constants.js";

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
            .isLength({ min:8 }).withMessage("Password must be atleast 8 characters long"),
        body("fullName")
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

const addMemberToProjectValidator = () => {
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

const updateProjectValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty().withMessage("Project name is required"),
        body("description")
            .optional()
            .trim()
    ]
}

const createTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty().withMessage("Task title is required"),
        body("description")
            .optional()
            .trim(),
        body("assignedTo")
            .notEmpty().withMessage("Assigned Member is required")
            .isMongoId().withMessage("Invalid Project Member ID"),
        body("status")
            .optional()
            .isIn(AvailableTaskStatuses).withMessage("Invalid status")
    ]
}

const updateTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim(),
        body("description")
            .optional()
            .trim(),
        body("assignedTo")
            .optional()
            .isMongoId().withMessage("Invalid Project Member ID"),
        body("status")
            .optional()
            .isIn(AvailableTaskStatuses).withMessage("Invalid status")
    ]
}

const createSubtaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty().withMessage("Subtask title is required"),
    ]
}

const updateSubtaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim(),
        body("isCompleted")
            .optional()
            .isBoolean().withMessage("isCompleted must be a boolean value")
    ]
}

const updateTaskStatusValidator = () => {
    return [
        body("status")
            .trim()
            .notEmpty().withMessage("Status is required")
            .isIn(AvailableTaskStatuses).withMessage("Invalid status")
    ]
}

const updateSubtaskStatusValidator = () => {
    return [
        body("isCompleted")
            .notEmpty().withMessage("isCompleted is required")
            .isBoolean().withMessage("isCompleted must be a boolean value")
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
    addMemberToProjectValidator,
    updateMemberRoleValidator,
    updateProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubtaskValidator,
    updateSubtaskValidator,
    updateTaskStatusValidator,
    updateSubtaskStatusValidator,
};