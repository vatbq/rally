import { getConversationAction } from "@/app/_actions/conversations";
import { ConversationView } from "@/app/_components/conversations/ConversationView";
import { notFound } from "next/navigation";

interface ConversationPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { threadId } = await params;
  const emails = await getConversationAction(threadId);

  if (!emails || emails.length === 0) {
    notFound();
  }

  return <ConversationView threadId={threadId} initialEmails={emails} />;
}
