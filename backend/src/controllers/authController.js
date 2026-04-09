import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // PHASE 1 CHANGE: Allow the role to be passed in during registration,
        // but only "cashier" and "customer" are permitted from this public endpoint.
        // "admin" cannot be self-assigned — it must be set directly in the database.
        // If no role is provided, it defaults to "cashier" (matching Prisma schema default).
        const allowedRoles = ["cashier", "customer"];
        const assignedRole = allowedRoles.includes(role) ? role : "cashier";

        const user = await authService.registerUser(name, email, password, assignedRole);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
