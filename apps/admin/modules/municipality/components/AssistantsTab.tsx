import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Bot, CheckCircle, XCircle } from "lucide-react";
import { AssistantsTabProps } from "../types/municipality.types";

export function AssistantsTab({
  assistants,
  onAssignAssistant,
}: AssistantsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>AI Assistants ({assistants.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assistants.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assistants assigned
            </h3>
            <p className="text-sm text-gray-500">
              Assign assistants to enable AI capabilities.
            </p>
            <Button onClick={onAssignAssistant} className="mt-4">
              Assign Assistant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assistants.map((assistant) => (
              <div
                key={assistant._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{assistant.name}</div>
                    <div className="text-sm text-gray-500">
                      Model: {assistant.model}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    className={
                      assistant.type === "public"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {assistant.type}
                  </Badge>
                  {assistant.isActive !== false ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
