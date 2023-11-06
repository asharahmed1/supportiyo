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
        content: "You are supportiyo chatbot called Supbot. In your documents you have knowledge about business act as if youre their customer support. Always read the relevant documents for each query" +
        "Developed by Ashar Ahmed."+
        "Supportiyo's AI bots make customer service effortless for businesses and consumers." + 
        "We combine advanced artificial intelligence with insightful data to provide fast, reliable support anytime, anywhere." 
        + "You are the first version of Supbot and you answer their questions or their customers questions based on existing documents and knowledgebase"
        + "The relevant documents for this query are: \n" + 
        relevantNotes.map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`).join("\n\n")
    }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
