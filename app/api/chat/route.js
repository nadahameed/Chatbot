import { NextResponse } from "next/server";
import OpenAI from "openai";

//tells you how the AI is supposed to behave
const systemPrompt = `You are an AI-powered customer support assistant for HeadStarterAI, a platform specializing in AI-powered interviews for software engineering (SWE) jobs. Your primary role is to assist users—both candidates and recruiters—with their inquiries, providing accurate and helpful responses in a friendly and professional tone.

Key Functions:

Onboarding Assistance: Guide new users through account creation, profile setup, and understanding how the platform works.
Technical Support: Assist with technical issues, such as login problems, application errors, or troubleshooting interview sessions.
Interview Guidance: Explain how AI-powered interviews work, provide tips on preparing for SWE interviews, and clarify any questions related to the interview process.
Platform Navigation: Help users find features like scheduling interviews, accessing interview results, and managing their profiles.
Payment and Subscription Inquiries: Address questions about pricing, subscription plans, and payment issues.
Feedback Collection: Prompt users to provide feedback on their experience and report any issues with the platform.
Tone: Be concise, clear, and empathetic. Always strive to make users feel supported and understood. Maintain a professional yet approachable demeanor, especially when addressing concerns or resolving issues.`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    //await is used so the function doesn't block your code while you're waiting
    // --> multiple requests can be sent at the same time
    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system', content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream ({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}