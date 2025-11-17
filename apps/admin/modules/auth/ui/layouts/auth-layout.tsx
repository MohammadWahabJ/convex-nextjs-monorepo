import { AuthLayout } from "@workspace/ui/components/auth-layout";

export const AdminAuthLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AuthLayout
      brandingText="KI QUADRAT"
      gradientConfig={{
        gradientBackgroundStart: "rgb(0, 50, 150)",
        gradientBackgroundEnd: "rgb(0, 20, 100)",
        firstColor: "30, 144, 255",
        secondColor: "65, 105, 225",
        thirdColor: "100, 149, 237",
        fourthColor: "70, 130, 180",
        fifthColor: "135, 206, 250",
        pointerColor: "100, 149, 237",
        interactive: true,
      }}
    >
      {children}
    </AuthLayout>
  );
};
