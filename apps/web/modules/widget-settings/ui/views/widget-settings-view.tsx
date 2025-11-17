"use client";

import { useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";

// Shadcn UI imports
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";

// Local imports
import { widgetSettingsSchema } from "../../schemas";
import { FormSchema } from "../../types";
import { Switch } from "@workspace/ui/components/switch";

export const WidgetSettingsView = () => {
  const t = useTranslations("widget_settings");
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const widgetSettings = useQuery(
    api.widget.settings.getWidgetSettings,
    organizationId ? { organizationId } : "skip"
  );

  const departments = useQuery(
    api.web.department.getAllDepartments,
    organizationId ? { organizationId } : "skip"
  );

  const saveWidgetSettings = useMutation(
    api.widget.settings.saveWidgetSettings
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      logoUrl: "",
      title: "",
      welcomeTitle: "",
      welcomeDescription: "",
      aiNotice: "",
      faqTitle: "",
      privacyPolicyText: "",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      mutedTextColor: "#888888",
      borderColor: "#333333",
      buttonBackgroundColor: "#000000",
      faqs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  useEffect(() => {
    if (widgetSettings) {
      form.reset({
        ...widgetSettings,
        enabledDepartments: widgetSettings.enabledDepartments || [],
      });
    }
  }, [widgetSettings, form]);

  const handleDepartmentToggle = (departmentId: string, enabled: boolean) => {
    const currentDepartments = form.getValues("enabledDepartments") || [];
    const updatedDepartments = enabled
      ? [...currentDepartments, departmentId]
      : currentDepartments.filter((id) => id !== departmentId);
    form.setValue("enabledDepartments", updatedDepartments);
  };

  const onSubmit = async (values: FormSchema) => {
    if (!organizationId) return;
    try {
      await saveWidgetSettings({
        organizationId,
        ...values,
      });
      toast.success(t("settings_saved"));
    } catch (error) {
      console.error(error);
      toast.error(t("error_saving"));
    }
  };

  if (widgetSettings === undefined || departments === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  const enabledDepartments = form.watch("enabledDepartments") || [];

  return (
    <div className="p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-4xl">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("general")}</CardTitle>
                <CardDescription>{t("general_description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Left Column - General Settings */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("logo_url")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("logo_url_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("title_label")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("title_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("departments")}</CardTitle>
                <CardDescription>
                  {t("departments_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Right Column - Departments */}
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {departments.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        {t("no_departments")}
                      </p>
                    ) : (
                      departments.map((department) => (
                        <div
                          key={department._id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <span className="text-sm font-medium truncate flex-1 mr-2">
                            {department.name}
                          </span>
                          <Switch
                            checked={enabledDepartments.includes(
                              department._id
                            )}
                            onCheckedChange={(checked) =>
                              handleDepartmentToggle(department._id, checked)
                            }
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("welcome_screen")}</CardTitle>
              <CardDescription>
                {t("welcome_screen_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="welcomeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("welcome_title")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("welcome_title_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="welcomeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("welcome_description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("welcome_description_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("content")}</CardTitle>
              <CardDescription>{t("content_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aiNotice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ai_notice")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("ai_notice_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privacyPolicyText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("privacy_policy")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("privacy_policy_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("faqs")}</CardTitle>
              <CardDescription>{t("faqs_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-4">
                  <div className="space-y-2 flex-1">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("question")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("question_placeholder")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-8"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ id: crypto.randomUUID(), question: "" })
                }
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("add_faq")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>{t("appearance_description")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("background_color")}</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("text_color")}</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mutedTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("muted_text_color")}</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="borderColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("border_color")}</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buttonBackgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("button_background_color")}</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button disabled={form.formState.isSubmitting} type="submit">
              {t("save_settings")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
