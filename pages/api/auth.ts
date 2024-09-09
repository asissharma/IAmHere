import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment-timezone';

// Handler function
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code } = req.body;
    console.log(generateValidationCode(0));
    // Generate valid codes for the current minute, previous minute, and next minute
    const validCodes = [
        generateValidationCode(0),  // Current minute
        generateValidationCode(-1), // Previous minute
        generateValidationCode(1)   // Next minute
    ];

    // Check if the provided code is valid
    if (validCodes.includes(code)) {
        // Set a session cookie or token here
        res.status(200).json({ message: 'Authenticated' });
    } else {
        res.status(401).json({ message: 'Invalid code' });
    }
}

// Function to generate validation code
function generateValidationCode(offset: number = 0): string {
    const nowIST = moment().tz('Asia/Kolkata').add(offset, 'minutes');

    const minutes = nowIST.minutes();
    const dayOfMonth = nowIST.date();
    const lastDigitOfDay = dayOfMonth % 10;
    const hour = nowIST.hours();
    const sumOfHourAndMinute = hour + minutes;
  
    return `${minutes}-${lastDigitOfDay}-${sumOfHourAndMinute}`;
}
