import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DeletedId {
  @Field(() => ID)
  id: string;
}
