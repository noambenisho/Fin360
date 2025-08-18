import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { 
  getAllUsers, deleteUser, updateUserRole,
  getAllProfiles, deleteProfile
} from "../controllers/adminController.js";

const router = express.Router();

// User management
router.get("/users", authMiddleware, authorizeRoles("admin"), (req, res, next) => {
  console.log("Admin /users route hit");
  next();
}, getAllUsers);

//router.get("/users", authMiddleware, authorizeRoles("admin"), getAllUsers);
router.delete("/users/:id", authMiddleware, authorizeRoles("admin"), deleteUser);
router.patch("/users/:id/role", authMiddleware, authorizeRoles("admin"), updateUserRole);

// Profile management
router.get("/profiles", authMiddleware, authorizeRoles("admin"), getAllProfiles);
router.delete("/profiles/:id", authMiddleware, authorizeRoles("admin"), deleteProfile);

export default router;
