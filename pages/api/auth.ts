import type { NextApiRequest, NextApiResponse } from 'next';

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
  const now = new Date();
  now.setMinutes(now.getMinutes() + offset); // Adjust for offset

  const minutes = now.getMinutes();
  const dayOfMonth = now.getDate();
  const lastDigitOfDay = dayOfMonth % 10;
  const hour = now.getHours();
  const sumOfHourAndMinute = (hour + minutes);

  return `${minutes}-${lastDigitOfDay}-${sumOfHourAndMinute}`;
}
