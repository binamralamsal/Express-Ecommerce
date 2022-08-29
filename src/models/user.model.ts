import {
  DocumentType,
  modelOptions,
  pre,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Product } from "./product.model";
import { HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

@modelOptions({ schemaOptions: { _id: false } })
class CartItem {
  @prop({ ref: () => Product, required: true })
  public productId!: Ref<Product>;

  @prop({ type: () => Number, default: 1 })
  public quantity!: number;
}

@modelOptions({ schemaOptions: { _id: false } })
class Cart {
  @prop({ type: () => CartItem, default: [] })
  public items!: CartItem[];
}

@pre<User>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
})
export class User {
  @prop({ type: () => String })
  public email!: string;

  @prop({ type: () => String })
  public password!: string;

  @prop()
  public resetToken?: string;

  @prop({ type: () => Date })
  public resetTokenExpiration?: Date;

  @prop({
    type: () => Cart,
    required: true,
    default: {},
  })
  public cart!: Cart;

  public addToCart(
    this: DocumentType<User>,
    product: HydratedDocument<DocumentType<Product>>
  ) {
    const itemIndex = this.cart.items.findIndex(
      (item) => item.productId?.toString() === product._id.toString()
    );
    if (itemIndex >= 0) {
      this.cart.items[itemIndex].quantity++;
    } else {
      this.cart.items.push({ productId: product._id, quantity: 1 });
    }

    return this.save();
  }

  public removeFromCart(this: DocumentType<User>, _id: string) {
    this.cart.items = this.cart.items.filter(
      (item) => item.productId?.toString() !== _id
    );
    return this.save();
  }

  public clearCart(this: DocumentType<User>) {
    this.cart.items = [];
    return this.save();
  }

  public async comparePassword(this: DocumentType<User>, password: string) {
    return await bcrypt.compare(password, this.password);
  }

  public async updatePassword(this: DocumentType<User>, password: string) {
    this.password = password;
    this.resetToken = undefined;
    this.resetTokenExpiration = undefined;
    await this.save();
  }
}
