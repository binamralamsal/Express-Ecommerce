import { User as UserClass } from "./user.model";
import { Product as ProductClass } from "./product.model";
import { getModelForClass } from "@typegoose/typegoose";
import { Order as OrderClass } from "./order.model";

export const User = getModelForClass(UserClass);
export const Product = getModelForClass(ProductClass);
export const Order = getModelForClass(OrderClass);
