import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";




let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let user: User;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let deposit: Statement;
let withdraw: Statement;

describe("get statement operation", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);

    const userAdded = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    user = await createUserUseCase.execute(userAdded);

    const statementDeposit = { user_id: user.id as string, type: OperationType.DEPOSIT, amount: 100, description: 'test' };
    deposit = await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw = { user_id: user.id as string, type: OperationType.WITHDRAW, amount: 50, description: 'test' };
    withdraw = await createStatementUseCase.execute(statementWithdraw);
  });


  it('givenUserId_withValidData_whenExecute_thenReturnListOfStatementAndBalance', async () => {
    {
      const result = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: deposit.id as string });
      expect(result).toBeInstanceOf(Statement)
      expect(result).toHaveProperty('amount', 100);
    }

    {
      const result = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: withdraw.id as string });
      expect(result).toBeInstanceOf(Statement)
      expect(result).toHaveProperty('amount', 50);
    }
  });

  it('givenUserId_withInvalidId_whenExecute_thenThrowsGetStatementOperationErrorUserNotFound', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: 'banana', statement_id: deposit.id as string });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);

  });

  it('givenUserId_withInvalidId_whenExecute_thenThrowsGetStatementOperationError.StatementNotFound', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: 'banana' });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });

});
