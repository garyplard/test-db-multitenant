import { Connection } from "mongoose";
import { CourseSchema } from "./course";

const DEFINITIONS = [
  { modelName: "Course", schema: CourseSchema, collectionName: "course" },
];

export const generateModelsForConnection = async (
  connection: Connection,
  tenantId: string
) => {
  if (connection.modelNames().length > 0) return;

  DEFINITIONS.forEach(({ modelName, schema, collectionName }) => {
    schema.pre(/^find/, function () {
      this.where({ access: tenantId }).select("-access");
    });
    connection.model(modelName, schema, collectionName);
  });
};
