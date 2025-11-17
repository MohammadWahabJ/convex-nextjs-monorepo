"use client";

import {
  useQuery,
  Authenticated,
  Unauthenticated,
  useMutation,
} from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Loader2,
  Search,
  X,
  User,
  UserCheck,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

function FeedbacksContent() {
  const allFeedbacks = useQuery(api.superadmin.feedback.getAllFeedbacks, {});
  const createFeedback = useMutation(
    api.superadmin.feedback.createSuperadminFeedback
  );

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");

  // Create feedback modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState("admin-created");
  const [createForm, setCreateForm] = useState({
    feedbackType: "bug" as "bug" | "feature" | "improvement" | "general",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Filter and search logic
  const feedbacks = useMemo(() => {
    if (!allFeedbacks) return allFeedbacks;

    return allFeedbacks.filter((feedback) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.assignedTo &&
          feedback.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "all" || feedback.status === statusFilter;

      // Priority filter
      const matchesPriority =
        priorityFilter === "all" || feedback.priority === priorityFilter;

      // Type filter
      const matchesType =
        typeFilter === "all" || feedback.feedbackType === typeFilter;

      // Assigned to filter
      const matchesAssignedTo =
        assignedToFilter === "all" ||
        (assignedToFilter === "unassigned" && !feedback.assignedTo) ||
        (assignedToFilter === "assigned" && feedback.assignedTo) ||
        feedback.assignedTo === assignedToFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesType &&
        matchesAssignedTo
      );
    });
  }, [
    allFeedbacks,
    searchTerm,
    statusFilter,
    priorityFilter,
    typeFilter,
    assignedToFilter,
  ]);

  // Get unique assigned users for filter dropdown
  const assignedUsers = useMemo(() => {
    if (!allFeedbacks) return [];
    const users = new Set(
      allFeedbacks.filter((f) => f.assignedTo).map((f) => f.assignedTo)
    );
    return Array.from(users);
  }, [allFeedbacks]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setAssignedToFilter("all");
  };

  // Handle create feedback
  const handleCreateFeedback = async () => {
    if (!createForm.title || !createForm.description) {
      return;
    }

    setIsCreating(true);
    try {
      await createFeedback({
        customerId: customerId,
        feedbackType: createForm.feedbackType,
        title: createForm.title,
        description: createForm.description,
        priority: createForm.priority,
      });

      // Reset form and close modal
      setCreateForm({
        feedbackType: "bug",
        title: "",
        description: "",
        priority: "medium",
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create feedback:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    typeFilter !== "all" ||
    assignedToFilter !== "all";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "in-progress":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedbacks</h1>
          <p className="text-muted-foreground">
            Manage customer feedback and support requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Feedback
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search feedbacks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            {/* Assigned To Filter */}
            <Select
              value={assignedToFilter}
              onValueChange={setAssignedToFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                {assignedUsers.map((user) => (
                  <SelectItem key={user} value={user!}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary">
                  Status: {statusFilter}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {priorityFilter !== "all" && (
                <Badge variant="secondary">
                  Priority: {priorityFilter}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setPriorityFilter("all")}
                  />
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary">
                  Type: {typeFilter}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setTypeFilter("all")}
                  />
                </Badge>
              )}
              {assignedToFilter !== "all" && (
                <Badge variant="secondary">
                  Assigned: {assignedToFilter}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => setAssignedToFilter("all")}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {allFeedbacks === undefined ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold">Loading feedbacks...</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we fetch the feedback data
            </p>
          </CardContent>
        </Card>
      ) : feedbacks && feedbacks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              All Feedbacks ({feedbacks.length}
              {allFeedbacks &&
                feedbacks.length !== allFeedbacks.length &&
                ` of ${allFeedbacks.length}`}
              )
            </CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? "Filtered list of customer feedback and support requests"
                : "Complete list of customer feedback and support requests"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback._id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {feedback.feedbackType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">
                        {feedback.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {feedback.description.slice(0, 30)}
                        {feedback.description.length > 30 && "..."}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPriorityColor(feedback.priority)}
                        className="capitalize"
                      >
                        {feedback.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(feedback.status)}
                        <Badge
                          variant={getStatusColor(feedback.status)}
                          className="capitalize"
                        >
                          {feedback.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{feedback.customerId}</div>
                    </TableCell>
                    <TableCell>
                      {feedback.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feedback.assignedTo}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(feedback._creationTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/feedbacks/${feedback._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {hasActiveFilters
                ? "No feedbacks match your filters"
                : "No feedbacks found"}
            </h3>
            <p className="text-muted-foreground text-center">
              {hasActiveFilters
                ? "Try adjusting your search criteria or clear filters to see all feedbacks"
                : "No customer feedback has been submitted yet"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Feedback Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Feedback</DialogTitle>
            <DialogDescription>
              Create a new feedback entry for the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerId" className="text-right">
                Customer ID
              </Label>
              <Input
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="col-span-3"
                placeholder="Enter customer ID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedbackType" className="text-right">
                Type
              </Label>
              <Select
                value={createForm.feedbackType}
                onValueChange={(
                  value: "bug" | "feature" | "improvement" | "general"
                ) => setCreateForm({ ...createForm, feedbackType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={createForm.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setCreateForm({ ...createForm, priority: value })
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
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter feedback title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter feedback description"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFeedback}
              disabled={
                isCreating ||
                !customerId ||
                !createForm.title ||
                !createForm.description
              }
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Feedback"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Page() {
  return (
    <>
      <Authenticated>
        <FeedbacksContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Feedbacks</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default Page;
