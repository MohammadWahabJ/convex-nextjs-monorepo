"use client";

import {
  useQuery,
  useMutation,
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
// Note: Using console.log for notifications - replace with your toast system
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Edit,
  User,
  UserCheck,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Tag,
  Flag,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@workspace/backend/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

function FeedbackDetailContent({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();

  const feedback = useQuery(
    api.superadmin.feedback.getFeedbackById,
    feedbackId ? { id: feedbackId as Id<"portalFeedback"> } : "skip"
  );

  const updateFeedback = useMutation(
    api.superadmin.feedback.updatePortalFeedback
  );

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    priority: "",
    assignedTo: "",
    adminResponse: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditDialog = () => {
    if (feedback) {
      setEditForm({
        status: feedback.status,
        priority: feedback.priority,
        assignedTo: feedback.assignedTo || "",
        adminResponse: feedback.adminResponse || "",
      });
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!feedback) return;

    setIsSaving(true);
    try {
      const updates = {
        id: feedback._id,
        status: editForm.status as
          | "open"
          | "in-progress"
          | "resolved"
          | "closed",
        priority: editForm.priority as "low" | "medium" | "high",
        assignedTo: editForm.assignedTo || undefined,
        adminResponse: editForm.adminResponse || undefined,
        resolvedBy: editForm.status === "resolved" ? "Admin" : undefined,
      };

      await updateFeedback(updates);
      console.log("Success: Feedback updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error: Failed to update feedback", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (
    priority: string
  ): "destructive" | "default" | "secondary" =>
    (({ high: "destructive", medium: "default", low: "secondary" })[priority] ||
      "secondary") as "destructive" | "default" | "secondary";

  const getStatusColor = (
    status: string
  ): "destructive" | "default" | "secondary" | "outline" =>
    (({
      open: "destructive",
      "in-progress": "default",
      resolved: "secondary",
      closed: "outline",
    })[status] || "secondary") as
      | "destructive"
      | "default"
      | "secondary"
      | "outline";

  const getStatusIcon = (status: string) => {
    const iconClass = "h-5 w-5";
    const icons = {
      open: <AlertCircle className={iconClass} />,
      "in-progress": <Clock className={iconClass} />,
      resolved: <CheckCircle className={iconClass} />,
      closed: <CheckCircle className={iconClass} />,
    };
    return (
      icons[status as keyof typeof icons] || (
        <MessageSquare className={iconClass} />
      )
    );
  };

  const getPriorityIcon = (priority: string) => {
    const iconClass = "h-4 w-4";
    const icons = {
      high: <AlertTriangle className={`${iconClass} text-red-500`} />,
      medium: <Flag className={`${iconClass} text-yellow-500`} />,
      low: <Flag className={`${iconClass} text-green-500`} />,
    };
    return (
      icons[priority as keyof typeof icons] || <Flag className={iconClass} />
    );
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const ErrorState = ({
    title,
    message,
    onBack,
  }: {
    title: string;
    message: string;
    onBack: () => void;
  }) => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feedbacks
        </Button>
      </div>
    </div>
  );

  // Loading state
  if (feedback === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Loading feedback...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  // Not found state
  if (feedback === null) {
    return (
      <ErrorState
        title="Feedback not found"
        message="The feedback you're looking for doesn't exist or has been deleted."
        onBack={() => router.push("/feedbacks")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="pl-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feedbacks
          </Button>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenEditDialog}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Feedback</DialogTitle>
              <DialogDescription>
                Make changes to the feedback status, priority, assignment, and
                response.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">
                  Assign To
                </Label>
                <Input
                  id="assignedTo"
                  value={editForm.assignedTo}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  className="col-span-3"
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="adminResponse" className="text-right mt-2">
                  Response
                </Label>
                <Textarea
                  id="adminResponse"
                  value={editForm.adminResponse}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      adminResponse: e.target.value,
                    }))
                  }
                  className="col-span-3"
                  placeholder="Add your response to the customer..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feedback Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      <Tag className="mr-1 h-3 w-3" />
                      {feedback.feedbackType}
                    </Badge>
                    <Badge
                      variant={
                        getPriorityColor(feedback.priority) as
                          | "destructive"
                          | "default"
                          | "secondary"
                      }
                      className="capitalize"
                    >
                      {getPriorityIcon(feedback.priority)}
                      <span className="ml-1">{feedback.priority}</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{feedback.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(feedback.status)}
                  <Badge
                    variant={
                      getStatusColor(feedback.status) as
                        | "destructive"
                        | "default"
                        | "secondary"
                        | "outline"
                    }
                    className="capitalize"
                  >
                    {feedback.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {feedback.description}
                  </p>
                </div>

                {feedback.screenshots && feedback.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Screenshots ({feedback.screenshots.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {feedback.screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center"
                        >
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Response */}
          {feedback.adminResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Admin Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="leading-relaxed">{feedback.adminResponse}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {feedback.customerId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Customer ID</p>
                  <p className="text-sm text-muted-foreground">
                    {feedback.customerId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assigned To:</span>
                {feedback.assignedTo ? (
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feedback.assignedTo}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(feedback._creationTime)}
                  </span>
                </div>

                {feedback.resolvedAt && feedback.resolvedBy && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resolved By:</span>
                      <span className="text-sm">{feedback.resolvedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resolved At:</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(feedback.resolvedAt)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Feedback ID:</span>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {feedback._id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Screenshots:</span>
                <span className="text-sm font-semibold">
                  {feedback.screenshots?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  const feedbackId = resolvedParams.id;

  return (
    <>
      <Authenticated>
        <FeedbackDetailContent feedbackId={feedbackId} />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Feedback Details</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default Page;
