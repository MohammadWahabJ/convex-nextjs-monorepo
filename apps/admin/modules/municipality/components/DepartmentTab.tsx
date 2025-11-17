import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import { DepartmentsTabProps } from "../types/municipality.types";

export function DepartmentsTab({
  departments,
  onAddDepartment,
}: DepartmentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Departments ({departments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments created
            </h3>
            <p className="text-sm text-gray-500">
              Create departments to organize municipal services.
            </p>
            <Button onClick={onAddDepartment} className="mt-4">
              Add Department
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {departments.map((department) => (
              <div
                key={department._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{department.name}</div>
                    <div className="text-sm text-gray-500">
                      Model: {department.model}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    Department
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
