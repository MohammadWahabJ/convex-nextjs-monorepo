"use client";

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { PdfMarkdown } from "./pdf-markdown";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 12,
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
  },
  userMessage: {
    fontSize: 10,
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 5,
  },
  assistantMessage: {
    fontSize: 10,
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 5,
  },
  messageRole: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
  },
});

interface ChatDocumentProps {
  messages: any[]; // Replace with actual message type
  user: any; // Replace with actual user type
  orgId: string | null | undefined;
  title: string;
}

// Create Document Component
export function ChatDocument({ messages, user, orgId, title }: ChatDocumentProps) {
  const renderMessageContent = (content: any) => {
    // Handle content being an array of parts (the common case)
    if (Array.isArray(content)) {
      return content
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("\n"); // Join multiple text parts with a newline
    }

    // Handle simple string content, just in case
    if (typeof content === "string") {
      return content;
    }

    // Fallback for truly unknown formats
    if (content === null || content === undefined) {
      return "";
    }
    return `[Unsupported content: ${JSON.stringify(content)}]`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{title}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.userInfo}>
            User: {user?.fullName ?? "N/A"}
          </Text>
          <Text style={styles.userInfo}>
            Organization ID: {orgId ?? "N/A"}
          </Text>
        </View>
        <View style={styles.section}>
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageContainer}>
              {msg.message.role === "user" ? (
                <View style={styles.userMessage}>
                  <PdfMarkdown>{renderMessageContent(msg.message.content)}</PdfMarkdown>
                </View>
              ) : (
                <View style={styles.assistantMessage}>
                  <Text style={styles.messageRole}>
                    {msg.agentName ?? "Assistant"}
                  </Text>
                  <PdfMarkdown>{renderMessageContent(msg.message.content)}</PdfMarkdown>
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
