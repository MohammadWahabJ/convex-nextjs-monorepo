"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Loader2, FileText } from "lucide-react";
import { generatePromptTemplate } from "../utils/promptTemplete";

interface AddMunicipalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (organization: { id: string; name: string }) => void;
}

export function AddMunicipalityModal({
  open,
  onOpenChange,
  onSuccess,
}: AddMunicipalityModalProps) {
  const createOrganization = useAction(
    api.superadmin.organization.createOrganization
  );

  // Get countries using the role-based action
  const getCountriesByRole = useQuery(api.superadmin.country.getAllCountries);

  const [name, setName] = useState("");
  const [maxAllowedMemberships, setMaxAllowedMemberships] =
    useState<number>(10);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [collectionName, setCollectionName] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [helpDesk, setHelpDesk] = useState<boolean>(false);
  const [websiteLink, setWebsiteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate collection name when municipality name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Automatically set collection name to municipality name with spaces converted to underscores
    setCollectionName(newName.replace(/\s+/g, "_"));
  };

  // Set default prompt template
  const handleSetDefaultTemplate = () => {
    if (name.trim() && collectionName.trim()) {
      const defaultTemplate = generatePromptTemplate(
        name,
        "General Services", // Default department
        collectionName
      );
      setPromptTemplate(defaultTemplate);
    } else {
      // If no name/collection yet, set with placeholder
      const defaultTemplate = generatePromptTemplate(
        "{{municipality_name}}",
        "General Services",
        "{{collection_name}}"
      );
      setPromptTemplate(defaultTemplate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Handle different return types from getAllCountries query
      let countriesData: Array<{
        _id: string;
        code: string;
        name: string;
        shortName?: string;
      }> = [];

      if (getCountriesByRole) {
        if (Array.isArray(getCountriesByRole)) {
          // Direct array of countries (successful response)
          countriesData = getCountriesByRole;
        } else if (
          "success" in getCountriesByRole &&
          "countries" in getCountriesByRole
        ) {
          // Error response object
          setError(getCountriesByRole.error || "Failed to load countries");
          setLoading(false);
          return;
        }
      }

      const selectedCountry = countriesData.find(
        (country) => country._id === selectedCountryId
      );

      if (!selectedCountry) {
        setError("Please select a valid country");
        setLoading(false);
        return;
      }

      const result = await createOrganization({
        name,
        maxAllowedMemberships,
        collectionName,
        countryCode: selectedCountry.code, // Use country.code instead of _id
        promptTemplete: promptTemplate,
        helpDesk,
        websiteLink: helpDesk ? websiteLink : undefined,
      });

      if (result.success && result.organizationId && result.name) {
        setName("");
        setMaxAllowedMemberships(10);
        setSelectedCountryId("");
        setCollectionName("");
        setPromptTemplate("");
        setHelpDesk(false);
        setWebsiteLink("");
        onOpenChange(false);
        onSuccess?.({ id: result.organizationId, name: result.name });
      } else {
        setError(result.error || "Failed to create municipality");
      }
    } catch (err) {
      console.error("Error creating municipality:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setName("");
    setMaxAllowedMemberships(10);
    setSelectedCountryId("");
    setCollectionName("");
    setPromptTemplate("");
    setHelpDesk(false);
    setWebsiteLink("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="min-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-1 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Add Municipality
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter the details for the municipality you'd like to add.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 mt-4 p-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Municipality Name Input Field */}
                <div className="space-y-2">
                  <Label htmlFor="municipality-name">Municipality Name</Label>
                  <Input
                    id="municipality-name"
                    placeholder="e.g. Springfield"
                    value={name}
                    onChange={handleNameChange}
                    required
                    className="
                      border border-input
                      focus-visible:ring-2 
                      focus-visible:ring-primary 
                      focus-visible:ring-offset-2
                      transition-all
                    "
                  />
                </div>

                {/* Max Allowed Members and Country in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Max Allowed Members Input Field */}
                  <div className="space-y-2">
                    <Label htmlFor="max-allowed-members">
                      Max Allowed Members
                    </Label>
                    <Input
                      id="max-allowed-members"
                      type="number"
                      placeholder="10"
                      min="1"
                      max="100"
                      value={maxAllowedMemberships}
                      onChange={(e) =>
                        setMaxAllowedMemberships(Number(e.target.value))
                      }
                      required
                      className="
                        border border-input
                        focus-visible:ring-2 
                        focus-visible:ring-primary 
                        focus-visible:ring-offset-2
                        transition-all
                      "
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={selectedCountryId}
                      onValueChange={setSelectedCountryId}
                      required
                    >
                      <SelectTrigger
                        id="country"
                        className="
                          border border-input
                          focus-visible:ring-2 
                          focus-visible:ring-primary 
                          focus-visible:ring-offset-2
                          transition-all
                        "
                        disabled={getCountriesByRole === undefined}
                      >
                        <SelectValue
                          placeholder={
                            getCountriesByRole === undefined
                              ? "Loading countries..."
                              : "Select a country"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getCountriesByRole === undefined && (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading countries...</span>
                            </div>
                          </SelectItem>
                        )}
                        {getCountriesByRole &&
                          Array.isArray(getCountriesByRole) &&
                          getCountriesByRole.length > 0 &&
                          getCountriesByRole.map(
                            (country: {
                              _id: string;
                              code: string;
                              name: string;
                              shortName?: string;
                            }) => (
                              <SelectItem key={country._id} value={country._id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {country.code}
                                  </span>
                                  <span>{country.name}</span>
                                  {country.shortName && (
                                    <span className="text-muted-foreground">
                                      ({country.shortName})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          )}
                        {getCountriesByRole &&
                          Array.isArray(getCountriesByRole) &&
                          getCountriesByRole.length === 0 && (
                            <SelectItem value="no-countries-available" disabled>
                              No countries available
                            </SelectItem>
                          )}
                        {getCountriesByRole &&
                          !Array.isArray(getCountriesByRole) && (
                            <SelectItem value="error" disabled>
                              {(getCountriesByRole as any)?.error ||
                                "Error loading countries"}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Collection Name Input Field */}
                <div className="space-y-2">
                  <Label htmlFor="collection-name">
                    Database Collection Name
                  </Label>
                  <Input
                    id="collection-name"
                    placeholder="collection-name"
                    disabled
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    required
                    className="
                      border border-input
                      focus-visible:ring-2 
                      focus-visible:ring-primary 
                      focus-visible:ring-offset-2
                      transition-all
                    "
                  />
                </div>

                {/* Help Desk Section - Full Width Row */}
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Help Desk Switch */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="help-desk"
                          className="text-base font-medium"
                        >
                          Public Help Desk
                        </Label>
                        <Switch
                          id="help-desk"
                          checked={helpDesk}
                          onCheckedChange={setHelpDesk}
                        />
                      </div>
                      {/* Website Link Input Field - Only visible when helpDesk is true */}
                      {helpDesk && (
                        <div className="space-y-2">
                          <Label htmlFor="website-link">Website Link</Label>
                          <Input
                            id="website-link"
                            placeholder="https://example.com"
                            value={websiteLink}
                            onChange={(e) => setWebsiteLink(e.target.value)}
                            className="
                        border border-input
                        focus-visible:ring-2 
                        focus-visible:ring-primary 
                        focus-visible:ring-offset-2
                        transition-all
                      "
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Prompt Template Input Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt-template">Prompt Template</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSetDefaultTemplate}
                      className="h-8 px-3 text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Use Default Template
                    </Button>
                  </div>
                  <Textarea
                    id="prompt-template"
                    placeholder="Click 'Use Default Template' to load a comprehensive prompt template, or write your own custom prompt..."
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    required
                    rows={8}
                    className="
                      focus-visible:ring-2 
                      focus-visible:ring-primary 
                      focus-visible:ring-offset-2
                      transition-all
                      resize-none
                      max-h-[300px]
                      overflow-y-auto
                      min-h-[200px]
                      scrollbar-thin
                      scrollbar-track-transparent
                      scrollbar-thumb-gray-300
                      hover:scrollbar-thumb-gray-400
                    "
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {promptTemplate.length}/5000 characters
                    </p>
                    {promptTemplate.length > 5000 && (
                      <p className="text-xs text-red-500 font-medium">
                        Exceeds character limit
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm font-medium text-center">
                {error}
              </p>
            )}

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-end space-x-2 pt-4 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !name.trim() ||
                  maxAllowedMemberships < 1 ||
                  !selectedCountryId ||
                  !collectionName.trim() ||
                  !promptTemplate.trim() ||
                  promptTemplate.length > 5000 ||
                  (helpDesk && !websiteLink.trim())
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Municipality"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
