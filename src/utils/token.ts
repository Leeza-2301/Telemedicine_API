import jwt from 'jsonwebtoken';

// Function to create a token
export const createToken = (id: unknown, role: string): string => {
    try {
        // Create a payload with user id and role
        const payload = {
            id,
            role,
        };

        // Sign the token with a secret key and an expiration time
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' }); // Expires in 1 hour

        return token;
    } catch (error) {
        console.error("Error creating token:", error); // Log the error for debugging
        return ''; // Return an empty string or a default value on error
    }
};
