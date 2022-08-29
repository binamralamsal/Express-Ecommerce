import { modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import { User } from './user.model';

@modelOptions({
  schemaOptions: { _id: false },
  options: { allowMixed: Severity.ALLOW },
})
class CustomProduct {
  @prop({ type: () => Object })
  public product!: {
    title: string;
    price: number;
    description: string;
    imageUrl: string;
  };

  @prop()
  public quantity!: number;
}

@modelOptions({ schemaOptions: { _id: false } })
class CustomUser {
  @prop()
  public email!: string;

  @prop({ ref: User })
  public userId!: Ref<User>;
}

export class Order {
  @prop({ type: () => CustomProduct })
  public products!: CustomProduct[];

  @prop({ type: () => CustomUser })
  public user!: CustomUser;
}
