import { Schema, model, models } from "mongoose";

const TenantSchema = new Schema({
  slug: String,
});

export const Tenant = models.Tenant || model("Tenant", TenantSchema, "tenant");
