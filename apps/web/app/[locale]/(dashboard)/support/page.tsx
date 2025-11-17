"use client";

import {
  Mail,
  Phone,
  Upload,
  Bot,
  List,
  History,
  Download,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function SupportPage() {
  const t = useTranslations("support");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t("title")}
        </h1>

        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-12">
          {t("need_help")}
        </p>

        {/* Using the Chatbot Assistant */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">
              {t("using_assistant")}
            </h2>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow">
            <p className="mb-4 text-base leading-relaxed">
              {t("using_assistant_description")}
            </p>
          </div>
        </section>

        {/* Knowledgebase Upload */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">{t("knowledgebase")}</h2>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow">
            <p className="mb-4 text-base leading-relaxed">
              {t("knowledgebase_description")}
            </p>
          </div>
        </section>

        {/* Chat History */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">{t("chat_history")}</h2>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow">
            <p className="mb-4 text-base leading-relaxed">
              {t("chat_history_description")}
            </p>
          </div>
        </section>

        {/* Data Privacy */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">
              {t("data_privacy")}
            </h2>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow">
            <p className="mb-4 text-base leading-relaxed">
              {t("data_privacy_description")}
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <List className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">{t("contact_support")}</h2>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>
                {t("email")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>{t("phone")}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
