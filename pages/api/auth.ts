import type { NextApiRequest, NextApiResponse } from 'next';
import { generateValidationCode } from '../utils/generateCode';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code } = req.body;
console.log(generateValidationCode(0));
    // Allow a grace period of 1 minute before and after the current minute
    const validCodes = [
        generateValidationCode(0),  // Current minute
        generateValidationCode(-1), // Previous minute
        generateValidationCode(1)   // Next minute
    ];

    if (validCodes.includes(code)) {
        // Set a session cookie or token here
        res.status(200).json({ message: 'Authenticated' });
    } else {
        res.status(401).json({ message: 'Invalid code' });
    }
}
