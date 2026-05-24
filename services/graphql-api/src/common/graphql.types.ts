import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => Float)
  price!: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  stockQuantity!: number;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class OrderItemType {
  @Field()
  name!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id!: string;

  @Field()
  orderNumber!: string;

  @Field()
  customerEmail!: string;

  @Field()
  status!: string;

  @Field(() => Float)
  totalAmount!: number;

  @Field(() => [OrderItemType])
  items!: OrderItemType[];
}

@ObjectType()
export class TenantType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  subdomain!: string;

  @Field()
  status!: string;
}
