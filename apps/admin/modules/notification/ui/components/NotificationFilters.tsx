import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Search, X } from "lucide-react";
import { Organization, NotificationFilters } from "../../types";
import { truncateText, getOrganizationDisplayName } from "../../utils";
import { UI_CONSTANTS } from "../../constants";

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: Partial<NotificationFilters>) => void;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  hasActiveFilters: boolean;
}

interface ActiveFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: Partial<NotificationFilters>) => void;
  organizations: Organization[];
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onFiltersChange,
  organizations,
}) => {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {filters.searchTerm && (
        <Badge variant="secondary" className="max-w-[200px]">
          <span className="truncate">
            Search:{" "}
            {truncateText(
              filters.searchTerm,
              UI_CONSTANTS.TRUNCATE_LENGTH.SEARCH_TERM
            )}
          </span>
          <X
            className="ml-1 h-3 w-3 cursor-pointer flex-shrink-0"
            onClick={() => onFiltersChange({ searchTerm: "" })}
          />
        </Badge>
      )}

      {filters.typeFilter !== "all" && (
        <Badge variant="secondary">
          Type: {filters.typeFilter}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => onFiltersChange({ typeFilter: "all" })}
          />
        </Badge>
      )}

      {filters.organizationFilter !== "all" && (
        <Badge variant="secondary" className="max-w-[250px]">
          <span className="truncate">
            Organization:{" "}
            {filters.organizationFilter === "unassigned"
              ? "Unassigned"
              : getOrganizationDisplayName(
                  organizations,
                  filters.organizationFilter,
                  UI_CONSTANTS.TRUNCATE_LENGTH.FILTER_ORG_NAME
                )}
          </span>
          <X
            className="ml-1 h-3 w-3 cursor-pointer flex-shrink-0"
            onClick={() => onFiltersChange({ organizationFilter: "all" })}
          />
        </Badge>
      )}
    </div>
  );
};

export const NotificationFiltersComponent: React.FC<
  NotificationFiltersProps
> = ({
  filters,
  onFiltersChange,
  organizations,
  isLoadingOrganizations,
  hasActiveFilters,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notifications..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type Filter */}
        <Select
          value={filters.typeFilter}
          onValueChange={(value) => onFiltersChange({ typeFilter: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
          </SelectContent>
        </Select>

        {/* Organization Filter */}
        <Select
          value={filters.organizationFilter}
          onValueChange={(value) =>
            onFiltersChange({ organizationFilter: value })
          }
          disabled={isLoadingOrganizations}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoadingOrganizations ? "Loading..." : "Organization"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <span className="truncate" title={org.name}>
                  {truncateText(
                    org.name,
                    UI_CONSTANTS.TRUNCATE_LENGTH.ORGANIZATION_NAME
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          organizations={organizations}
        />
      )}
    </>
  );
};
