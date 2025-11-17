import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { History, Mail, Minimize2, ArrowLeft } from "lucide-react";
import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog";
import Image from "next/image";
import { useAtom } from "jotai";
import { historyPageAtom } from "../../atoms/widget-atoms";

interface WidgetHeaderProps {
  logoUrl?: string;
  logoAlt?: string;
  title?: string;
  onEmailClick?: () => void;
  onMinimizeClick?: () => void;
  onCloseClick?: () => void;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export const WidgetHeader = ({
  title = "Helpdesk",
  onEmailClick,
  onMinimizeClick,
  onCloseClick,
  className,
  backgroundColor,
  textColor,
  borderColor,
}: WidgetHeaderProps) => {
  const [isHistoryPage, setIsHistoryPage] = useAtom(historyPageAtom);

  const handleHistoryClick = () => {
    setIsHistoryPage(true);
  };

  const handleBackClick = () => {
    setIsHistoryPage(false);
  };

  const onEmailClickHandler = () => {
    console.log("Email button clicked");
  }

  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b",
        className
      )}
      style={{
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={"font-semibold text-lg"}
            style={{ color: textColor }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center gap-2">
        {!isHistoryPage && (
          <>
            <ConfirmationDialog
              title="Send Transcript via Email"
              description="Do you want to send the transcript in email?"
              onConfirm={onEmailClickHandler}
              confirmText="Send"
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Mail className={`h-4 w-4 hover:${backgroundColor}`} />
                <span className={`hidden sm:inline hover:${backgroundColor}`}>Send via Email</span>
              </Button>
            </ConfirmationDialog>
            <Button
              variant="ghost"
              size="icon"
              className="hover:opacity-"
              onClick={onMinimizeClick}
            >
              <Minimize2 className={`h-4 w-4 hover:${backgroundColor}`} />
            </Button>
            {/* History page Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHistoryClick}
            >
              <History className={`h-4 w-4 hover:${backgroundColor}`} />
            </Button>
          </>
        )}
        {isHistoryPage && (
          <>
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4" style={{ color: textColor }} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseClick}
              style={{ color: textColor }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default WidgetHeader;
