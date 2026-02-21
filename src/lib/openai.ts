import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Please add your OpenAI API Key to .env.local');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
