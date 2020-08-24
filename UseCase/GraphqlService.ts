import { Router } from 'https://deno.land/x/oak/mod.ts';
import { applyGraphQL, gql } from 'https://deno.land/x/oak_graphql/mod.ts';
import GraphqlResolver from './GraphqlResolver.ts'
import { Service, Inject } from 'https://deno.land/x/di@v0.1.1/mod.ts';

@Service()
export default class GraphqlService {

  constructor(
    @Inject(GraphqlResolver) private readonly graphqlResolver: GraphqlResolver
  ) {}

  public async getRouter(): Promise<Router> {
    const schema = await Deno.readTextFile('./UseCase/GraphqlSchema.graphql');
    const typeDefs = gql(schema);
    return applyGraphQL<Router>({
      typeDefs,
      resolvers: {
        Query: {
          getTodoList: this.graphqlResolver.getTodoList.bind(this.graphqlResolver),
          getTodo: this.graphqlResolver.getTodo.bind(this.graphqlResolver),
        },
        Mutation: {
          createTodoList: this.graphqlResolver.createTodoList.bind(this.graphqlResolver),
          updateTodoList: this.graphqlResolver.updateTodoList.bind(this.graphqlResolver),
          createTodo: this.graphqlResolver.createTodo.bind(this.graphqlResolver),
          updateTodo: this.graphqlResolver.updateTodo.bind(this.graphqlResolver),
        },
        Date: this.graphqlResolver.createDateScalarParser(),
      },
      Router,
    });
  }
}
