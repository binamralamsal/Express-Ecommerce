import { prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

export class Product {
  @prop({ type: () => String, required: true })
  public title!: string;

  @prop({ type: () => Number, required: true })
  public price!: number;

  @prop({ type: () => String, required: true })
  public description!: string;

  @prop({ type: () => String, required: true })
  public imageUrl!: string;

  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>;
}
