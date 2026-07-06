export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
    currency: String!
    createdAt: String
  }

  type Transaction {
    id: ID!
    userId: ID!
    title: String!
    amount: Float!
    type: String!
    categoryId: String!
    date: String!
    note: String
    createdAt: String
  }

  type Budget {
    id: ID!
    userId: ID!
    categoryId: String!
    amount: Float!
    period: String!
    createdAt: String
  }

  type ActionResponse {
    success: Boolean!
    message: String
  }

  type AuthResponse {
    success: Boolean!
    message: String
    user: User
  }

  type Query {
    me: User
    transactions: [Transaction!]!
    budgets: [Budget!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    logout: ActionResponse!
    updateProfile(name: String, currency: String): User!
    changePassword(currentPassword: String!, newPassword: String!): ActionResponse!
    deleteAccount(password: String!): ActionResponse!
    forgotPassword(email: String!): ActionResponse!
    resetPassword(token: String!, newPassword: String!): AuthResponse!
    
    addTransaction(
      title: String!
      amount: Float!
      type: String!
      categoryId: String!
      date: String!
      note: String
    ): Transaction!

    updateTransaction(
      id: ID!
      title: String
      amount: Float
      type: String
      categoryId: String
      date: String
      note: String
    ): Transaction!

    deleteTransaction(id: ID!): ActionResponse!

    updateBudget(
      categoryId: String!
      amount: Float!
    ): Budget!
  }
`;
