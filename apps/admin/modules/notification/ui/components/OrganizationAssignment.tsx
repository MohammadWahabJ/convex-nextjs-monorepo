import React from "react";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Plus } from "lucide-react";
import { Organization, NotificationFormData } from "../../types";
import { UI_CONSTANTS, ACCESS_ROLES } from "../../constants";
import { useCountries, useOrganizationsByCountry } from "../../hooks";

interface OrganizationAssignmentProps {
  formData: NotificationFormData;
  onFormDataChange: (data: Partial<NotificationFormData>) => void;
  organizations?: Organization[]; // Made optional since we'll fetch by country
}

export const OrganizationAssignment: React.FC<OrganizationAssignmentProps> = ({
  formData,
  onFormDataChange,
  organizations: propOrganizations,
}) => {
  // Get countries data
  const { countries, loading: countriesLoading } = useCountries();

  // Find selected country details
  const selectedCountry = countries.find(
    (country) => country._id === formData.selectedCountryId
  );

  // Get organizations by selected country (using country code)
  const { organizations: countryOrganizations, loading: organizationsLoading } =
    useOrganizationsByCountry(selectedCountry?.code);

  // Use country-filtered organizations if a country is selected, otherwise use prop organizations
  const organizations = selectedCountry
    ? countryOrganizations
    : propOrganizations || [];

  const handleOrganizationToggle = (organizationId: string) => {
    const currentSelected = formData.selectedOrganizations;
    const newSelected = currentSelected.includes(organizationId)
      ? currentSelected.filter((id) => id !== organizationId)
      : [...currentSelected, organizationId];

    onFormDataChange({ selectedOrganizations: newSelected });
  };

  const handleAssignToAllChange = (checked: boolean) => {
    onFormDataChange({
      assignToAll: checked,
      selectedOrganizations: checked ? [] : formData.selectedOrganizations,
    });
  };

  const handleCountryChange = (countryId: string) => {
    // Clear selected organizations when country changes
    onFormDataChange({
      selectedCountryId: countryId,
      selectedOrganizations: [],
      assignToAll: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Organization Assignment</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="accessRole" className="text-sm whitespace-nowrap">
              Access Role:
            </Label>
            <Select
              value={formData.accessRole}
              onValueChange={(value: "org:admin" | "org:member") =>
                onFormDataChange({ accessRole: value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="countrySelect"
              className="text-sm whitespace-nowrap"
            >
              Country:
            </Label>
            <Select
              value={formData.selectedCountryId || ""}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue
                  placeholder={
                    countriesLoading
                      ? "Loading countries..."
                      : "Select a country"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countriesLoading && (
                  <SelectItem value="loading" disabled>
                    Loading countries...
                  </SelectItem>
                )}
                {countries.length > 0 &&
                  countries.map((country) => (
                    <SelectItem key={country._id} value={country._id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{country.code}</span>
                        <span>{country.name}</span>
                        {country.shortName && (
                          <span className="text-muted-foreground">
                            ({country.shortName})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                {countries.length === 0 && !countriesLoading && (
                  <SelectItem value="no-countries" disabled>
                    No countries available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {formData.selectedCountryId && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assignToAll"
                checked={formData.assignToAll}
                onCheckedChange={handleAssignToAllChange}
              />
              <Label
                htmlFor="assignToAll"
                className="text-sm whitespace-nowrap"
              >
                Assign to all organizations in{" "}
                {selectedCountry?.name || "selected country"}
              </Label>
            </div>
          </div>
        </div>
      )}

      {!formData.assignToAll && (
        <div className="border rounded-lg overflow-hidden">
          {!formData.selectedCountryId ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Please select a country first</p>
            </div>
          ) : organizationsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Loading organizations...</p>
            </div>
          ) : organizations.length > 0 ? (
            <div
              className={`${UI_CONSTANTS.ORGANIZATION_LIST_MAX_HEIGHT} overflow-y-auto`}
            >
              {organizations.map((org: Organization, index: number) => (
                <div
                  key={org.id}
                  className={`flex items-center space-x-3 px-3 py-2 hover:bg-muted/50 transition-colors ${
                    index !== organizations.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <Checkbox
                    id={`org-${org.id}`}
                    checked={formData.selectedOrganizations.includes(org.id)}
                    onCheckedChange={() => handleOrganizationToggle(org.id)}
                    className="flex-shrink-0"
                  />
                  <Label
                    htmlFor={`org-${org.id}`}
                    className="text-sm cursor-pointer flex-1 min-w-0 leading-5"
                    title={org.name}
                  >
                    <span className="block truncate">{org.name}</span>
                    {selectedCountry && (
                      <span className="text-xs text-muted-foreground">
                        {selectedCountry.code}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No organizations available for{" "}
                {selectedCountry?.name || "selected country"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
