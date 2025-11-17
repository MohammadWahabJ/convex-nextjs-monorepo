'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';

interface NewKnowledgebaseItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, sourceType: 'single-url' | 'entire-website' | 'sitemap-url' | 'page-sublinks' | 'document', data: File | string) => Promise<void>;
}

// Validation patterns for different URL types
const validationPatterns = {
  "single-url": {
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:en|de)?)?(?:\/(?:[\w\/_.-])*(?:\?(?:[\w&=%.-])*)?(?:\#(?:[\w.-])*)?)?$/,
    message: "Please enter a valid single URL"
  },
  "sitemap-url": {
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:en|de)?)?\/.*(?:sitemap|robots).*\.(?:xml|txt)$/i,
    message: "Please enter a valid sitemap or robots.txt URL"
  },
  "entire-website": {
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:en|de)?)?(?:\/)?$/,
    message: "Please enter a valid website base URL"
  },
  "page-sublinks": {
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:en|de)?)?(?:\/(?:[\w\/_.-])*)?$/,
    message: "Please enter a valid page URL"
  }
};

// Validation schemas for URL-based tabs
const createUrlSchema = (tabType: keyof typeof validationPatterns) => z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  url: z.string()
    .min(1, { message: 'URL is required' })
    .url({ message: 'Invalid URL format' })
    .refine((url) => validationPatterns[tabType].pattern.test(url), {
      message: validationPatterns[tabType].message,
    }),
});

const documentSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  file: z.instanceof(File, { message: 'File is required' }),
});


export function NewKnowledgebaseItemDialog({ isOpen, onClose, onSave }: NewKnowledgebaseItemDialogProps) {
  const [activeTab, setActiveTab] = useState<'single-url' | 'entire-website' | 'sitemap-url' | 'page-sublinks' | 'document'>('single-url');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for Single URL tab
  const singleUrlForm = useForm<z.infer<ReturnType<typeof createUrlSchema>>>({
    resolver: zodResolver(createUrlSchema('single-url')),
    defaultValues: {
      title: '',
      url: '',
    },
    mode: 'onChange',
  });

  // Form for Entire Website tab
  const entireWebsiteForm = useForm<z.infer<ReturnType<typeof createUrlSchema>>>({
    resolver: zodResolver(createUrlSchema('entire-website')),
    defaultValues: {
      title: '',
      url: '',
    },
    mode: 'onChange',
  });

  // Form for Sitemap URL tab
  const sitemapUrlForm = useForm<z.infer<ReturnType<typeof createUrlSchema>>>({
    resolver: zodResolver(createUrlSchema('sitemap-url')),
    defaultValues: {
      title: '',
      url: '',
    },
    mode: 'onChange',
  });

  // Form for Page Sublinks tab
  const pageSublinksForm = useForm<z.infer<ReturnType<typeof createUrlSchema>>>({
    resolver: zodResolver(createUrlSchema('page-sublinks')),
    defaultValues: {
      title: '',
      url: '',
    },
    mode: 'onChange',
  });

  // Form for Document tab
  const documentForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      file: undefined,
    },
    mode: 'onChange',
  });

  // Reset forms when dialog closes
  useEffect(() => {
    if (!isOpen) {
      singleUrlForm.reset();
      entireWebsiteForm.reset();
      sitemapUrlForm.reset();
      pageSublinksForm.reset();
      documentForm.reset();
      setActiveTab('single-url');
    }
  }, [isOpen, singleUrlForm, entireWebsiteForm, sitemapUrlForm, pageSublinksForm, documentForm]);

  const handleUrlSubmit = async (
    data: z.infer<ReturnType<typeof createUrlSchema>>,
    sourceType: 'single-url' | 'entire-website' | 'sitemap-url' | 'page-sublinks'
  ) => {
    setIsSubmitting(true);
    try {
      await onSave(data.title, sourceType, data.url);
      toast.success('URL added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding URL:', error);
      toast.error('Failed to add URL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentSubmit = async (data: z.infer<typeof documentSchema>) => {
    setIsSubmitting(true);
    try {
      await onSave(data.title, 'document', data.file);
      toast.success('Document added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      documentForm.setValue('file', e.target.files[0], { 
        shouldValidate: true,
        shouldDirty: true 
      });
    }
  };

  const tabDescriptions: Record<string, string> = {
    "single-url": "Add a single webpage URL to your knowledgebase.",
    "entire-website": "Add an entire website by providing its base URL.",
    "sitemap-url": "Add URLs from a sitemap.xml or robots.txt file.",
    "page-sublinks": "Add a page and all its sublinks to your knowledgebase.",
    "document": "Upload a document to add to your knowledgebase.",
  };

  const renderUrlForm = (
    form: ReturnType<typeof useForm<z.infer<ReturnType<typeof createUrlSchema>>>>,
    sourceType: 'single-url' | 'entire-website' | 'sitemap-url' | 'page-sublinks',
    placeholder: string
  ) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => handleUrlSubmit(data, sourceType))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter title"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  placeholder={placeholder}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>New Knowledgebase Item</DialogTitle>
          <DialogDescription>
            Add a new item to your knowledgebase by providing a URL or uploading a document.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="single-url">Single URL</TabsTrigger>
            <TabsTrigger value="entire-website">Entire Website</TabsTrigger>
            <TabsTrigger value="sitemap-url">Sitemap URL</TabsTrigger>
            <TabsTrigger value="page-sublinks">Page Sublinks</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>
          
          {/* Single URL Tab */}
          <TabsContent value="single-url" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{tabDescriptions["single-url"]}</p>
            {renderUrlForm(singleUrlForm, 'single-url', 'https://example.com/page')}
          </TabsContent>

          {/* Entire Website Tab */}
          <TabsContent value="entire-website" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{tabDescriptions["entire-website"]}</p>
            {renderUrlForm(entireWebsiteForm, 'entire-website', 'https://example.com')}
          </TabsContent>

          {/* Sitemap URL Tab */}
          <TabsContent value="sitemap-url" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{tabDescriptions["sitemap-url"]}</p>
            {renderUrlForm(sitemapUrlForm, 'sitemap-url', 'https://example.com/sitemap.xml')}
          </TabsContent>

          {/* Page Sublinks Tab */}
          <TabsContent value="page-sublinks" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{tabDescriptions["page-sublinks"]}</p>
            {renderUrlForm(pageSublinksForm, 'page-sublinks', 'https://example.com/page')}
          </TabsContent>

          {/* Document Tab */}
          <TabsContent value="document" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{tabDescriptions["document"]}</p>
            <Form {...documentForm}>
              <form onSubmit={documentForm.handleSubmit(handleDocumentSubmit)} className="space-y-4">
                <FormField
                  control={documentForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter title"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={documentForm.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!documentForm.formState.isValid || isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
