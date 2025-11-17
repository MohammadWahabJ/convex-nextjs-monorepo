"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

interface UrlTabsProps {
  singleUrl: string;
  sitemapUrl: string;
  websiteUrl: string;
  isSubmittingUrl: boolean;
  selectedAssistant: string;
  onSingleUrlChange: (value: string) => void;
  onSitemapUrlChange: (value: string) => void;
  onWebsiteUrlChange: (value: string) => void;
  onUrlSubmit: (type: string, url: string) => void;
}

export function UrlTabs({
  singleUrl,
  sitemapUrl,
  websiteUrl,
  isSubmittingUrl,
  selectedAssistant,
  onSingleUrlChange,
  onSitemapUrlChange,
  onWebsiteUrlChange,
  onUrlSubmit,
}: UrlTabsProps) {
  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="single">Single URL</TabsTrigger>
        <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        <TabsTrigger value="website">Website</TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="space-y-3">
        <Label htmlFor="single-url">Single URL</Label>
        <Input
          id="single-url"
          placeholder="https://example.com/page"
          value={singleUrl}
          onChange={(e) => onSingleUrlChange(e.target.value)}
        />
        <Button
          onClick={() => onUrlSubmit("single", singleUrl)}
          className="w-full"
          disabled={!singleUrl.trim() || !selectedAssistant || isSubmittingUrl}
        >
          {isSubmittingUrl ? "Submitting..." : "Add Single URL"}
        </Button>
      </TabsContent>

      <TabsContent value="sitemap" className="space-y-3">
        <Label htmlFor="sitemap-url">Sitemap URL</Label>
        <Input
          id="sitemap-url"
          placeholder="https://example.com/sitemap.xml"
          value={sitemapUrl}
          onChange={(e) => onSitemapUrlChange(e.target.value)}
        />
        <Button
          onClick={() => onUrlSubmit("sitemap", sitemapUrl)}
          className="w-full"
          disabled={!sitemapUrl.trim() || !selectedAssistant || isSubmittingUrl}
        >
          {isSubmittingUrl ? "Submitting..." : "Add Sitemap"}
        </Button>
      </TabsContent>

      <TabsContent value="website" className="space-y-3">
        <Label htmlFor="website-url">Website URL</Label>
        <Input
          id="website-url"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={(e) => onWebsiteUrlChange(e.target.value)}
        />
        <Button
          onClick={() => onUrlSubmit("website", websiteUrl)}
          className="w-full"
          disabled={!websiteUrl.trim() || !selectedAssistant || isSubmittingUrl}
        >
          {isSubmittingUrl ? "Submitting..." : "Crawl Website"}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
