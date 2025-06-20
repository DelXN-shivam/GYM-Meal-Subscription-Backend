// middleware/adminAuth.js
import jwt from 'jsonwebtoken';

export function verifyAdminToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid token format' });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid token' });

            if (decoded.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied: Admins only' });
            }

            // Attach admin info to request object
            req.admin = decoded;

            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
