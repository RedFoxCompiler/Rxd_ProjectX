
'use server';

import { ai } from '@/ai/init';
import { z } from 'genkit';

// Input schema for the calculator tool
const CalculatorInputSchema = z.object({
  expression: z.string().describe('The mathematical expression to evaluate. e.g., "2 + 2" or "(5 - 2) * 3".'),
});

// Define the calculator tool
export const calculatorTool = ai.defineTool(
  {
    name: 'calculatorTool',
    description: 'Evaluates a mathematical expression and returns the result. Use this for any math calculations. The user\'s natural language query must be converted to a valid mathematical expression before being passed to this tool.',
    input: { schema: CalculatorInputSchema },
    output: { schema: z.number().describe('The numerical result of the calculation.') },
  },
  async ({ expression }) => {
    // A safe way to evaluate math expressions without using eval()
    try {
        // Sanitize the expression to handle natural language variations
        let safeExpression = String(expression)
            .toLowerCase()
            .replace(/pi/g, 'Math.PI')
            .replace(/sqrt\(/g, 'Math.sqrt(') // Handle square root
            .replace(/ elevado a /g, '**')
            .replace(/\^/g, '**');


        // Regex to validate that the expression contains only safe characters after sanitization.
        // This is a crucial security step.
        const validationRegex = /^[0-9+\-/*().\sMathPIsqrt]*$/;

        if (!validationRegex.test(safeExpression)) {
            throw new Error('Invalid characters in expression. Only numbers, basic operators, Math.PI, and Math.sqrt are allowed.');
        }

        // Using the Function constructor is safer than a direct eval call.
        const result = new Function(`return ${safeExpression}`)();

        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid calculation result.');
        }
        
        // Return the number directly, matching the new output schema
        return result;

    } catch (error) {
        console.error("Calculator tool error:", error);
        // Throw an error to let the model know the tool failed, instead of returning a string.
        throw new Error(`The calculation for "${expression}" failed. Please inform the user that the calculation could not be performed as requested.`);
    }
  }
);
