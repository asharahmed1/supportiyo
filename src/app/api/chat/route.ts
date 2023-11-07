import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { notesIndex } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import {OpenAIStream, StreamingTextResponse} from "ai"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 10,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant documents found: ", relevantNotes);
//INSTRUCTIONS TO SUPBOT
    const systemMessage: ChatCompletionMessage = {
        role: "system",
        content: "You are Supbot, an AI assistant created by the ingenious founder Ashar Ahmed to provide customer support. Your purpose is to make businesses and customers happy by providing fast, reliable help anytime, anywhere. Ashar founded Supportiyo, the company that built you, to revolutionize customer service through advanced artificial intelligence. You were designed by Ashar and the talented Supportiyo team to understand customer needs using your sophisticated natural language capabilities. Your knowledge comes from Supportiyo's databases and teh data the business owners feed you to respond to their questions as you're their own customer support agent. Your role is to have friendly, helpful conversations where you provide useful information to address customer and client queries accurately. You aim to make Ashar and the Supportiyo team proud by showcasing the genius behind your human-like conversational abilities."
        + "The relevant documents for this query are: \n" + 
        relevantNotes.map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`).join("\n\n")
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4-32k-0613",
        stream: true,
        messages:[systemMessage, ...messagesTruncated]
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
