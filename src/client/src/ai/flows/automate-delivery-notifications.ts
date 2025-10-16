'use server';

/**
 * @fileOverview A flow to automate sending confirmed delivery orders with customer location to a WhatsApp number.
 *
 * - automateDeliveryNotifications - A function that automates the delivery notification process.
 * - AutomateDeliveryNotificationsInput - The input type for the automateDeliveryNotifications function.
 * - AutomateDeliveryNotificationsOutput - The return type for the automateDeliveryNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomateDeliveryNotificationsInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  customerName: z.string().describe('The name of the customer.'),
  customerPhoneNumber: z.string().describe('The phone number of the customer.'),
  deliveryAddress: z.string().describe('The delivery address of the customer.'),
  orderItems: z.array(z.string()).describe('A list of items in the order.'),
  totalAmount: z.number().describe('The total amount of the order.'),
});

export type AutomateDeliveryNotificationsInput = z.infer<typeof AutomateDeliveryNotificationsInputSchema>;

const AutomateDeliveryNotificationsOutputSchema = z.object({
  messageSent: z.boolean().describe('Whether the WhatsApp message was successfully sent.'),
  messageId: z.string().optional().describe('The ID of the sent message, if available.'),
});

export type AutomateDeliveryNotificationsOutput = z.infer<typeof AutomateDeliveryNotificationsOutputSchema>;

export async function automateDeliveryNotifications(
  input: AutomateDeliveryNotificationsInput
): Promise<AutomateDeliveryNotificationsOutput> {
  return automateDeliveryNotificationsFlow(input);
}

const sendMessageTool = ai.defineTool({
  name: 'sendWhatsAppMessage',
  description: 'Sends a message to a WhatsApp number using the WhatsApp Business API.',
  inputSchema: z.object({
    phoneNumber: z.string().describe('The phone number to send the message to (including country code).'),
    message: z.string().describe('The message to send.'),
  }),
  outputSchema: z.object({
    messageSent: z.boolean().describe('Whether the message was successfully sent.'),
    messageId: z.string().optional().describe('The ID of the sent message, if available.'),
  }),
},
async (input) => {
    // This is a mock implementation.  In a real application, this would call the WhatsApp Business API.
    console.log(`Sending WhatsApp message to ${input.phoneNumber}: ${input.message}`);
    return {
      messageSent: true,
      messageId: 'mock-message-id-' + Math.random().toString(36).substring(7),
    };
  }
);

const automateDeliveryNotificationsPrompt = ai.definePrompt({
  name: 'automateDeliveryNotificationsPrompt',
  tools: [sendMessageTool],
  input: {schema: AutomateDeliveryNotificationsInputSchema},
  prompt: `You are an assistant that automates sending delivery notifications to a restaurant's WhatsApp number.

  A new delivery order has been confirmed. The details are as follows:

  Order ID: {{orderId}}
  Customer Name: {{customerName}}
  Customer Phone Number: {{customerPhoneNumber}}
  Delivery Address: {{deliveryAddress}}
  Order Items: {{orderItems}}
  Total Amount: {{totalAmount}} DA

  Send a WhatsApp message to the restaurant with these details, so they can process the order.
  Use the provided tool to send the message to the restaurant's WhatsApp number. The restaurant's phone number is +213555123456.
  `,
});

const automateDeliveryNotificationsFlow = ai.defineFlow(
  {
    name: 'automateDeliveryNotificationsFlow',
    inputSchema: AutomateDeliveryNotificationsInputSchema,
    outputSchema: AutomateDeliveryNotificationsOutputSchema,
  },
  async input => {
    const promptResult = await automateDeliveryNotificationsPrompt(input);
    // Extract the relevant information from the prompt result
    // and return it in the expected output format.
    return {messageSent: true, messageId: '123'};
  }
);
