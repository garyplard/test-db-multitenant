import { Schema } from "mongoose";

const CourseSchema = new Schema({
  access: [Schema.Types.ObjectId],
  name: String,
});

export { CourseSchema };
