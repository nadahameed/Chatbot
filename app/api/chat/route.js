import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a chatbot designed to help people find a job. Here are some responsibilities: The job search assistant chatbot is designed to streamline and enhance the job-seeking process. It assists users in creating and refining their resumes and cover letters by offering industry-specific advice and keyword suggestions. The chatbot also matches users with relevant job opportunities and provides personalized recommendations and alerts for new openings. To help users prepare for interviews, it offers tips on common questions, communication, and professional attire. Additionally, the chatbot helps users organize and track their job applications, sending reminders for deadlines and follow-ups. It also provides personalized career guidance, suggesting relevant skills, courses, and insights into various career paths. The chatbot encourages professional networking by offering LinkedIn tips and suggesting industry events and webinars. Furthermore, it provides valuable company research, helping users prepare for interviews by offering insights into potential employers and industry trends. The chatbot also guides users on salary research and negotiation, explaining factors that influence salary ranges. For those facing job search challenges, such as career changes or employment gaps, the chatbot offers resources and support to overcome these obstacles. Finally, it collects feedback to improve its performance and regularly updates users with new features and resources."
  });

  try {
    // 'data' is the messages array from page.js
    // This array contains the entire chat history:
    // it contains objects, and each object has a role and content
    // property. The role is either 'user' or 'assistant', and the
    // content is the text that the user or the assistant has typed.
    const data = await req.json();

    // Construct the conversation history:
    const conversationHistory = data.map(message => message.content).join("\n\n");

    // Combine the system instruction with the conversation history
    const prompt = `${model.systemInstruction}\n\nHere's what has been discussed so far:\n${conversationHistory}\n`;

    // Send user's prompt and get assistant's response:
    const result = await model.generateContentStream(prompt);

    // Assuming `result` is an object and its `response` property contains the generated content as a string.
    const response = await result.response; // Directly use result.response if it's a string
    const text = response.text()

    // Return the assistant's response:
    return new Response(text);
  } catch (error) {
    console.error("Error in API Call:", error.message);
    console.error("Full Error Details:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}
