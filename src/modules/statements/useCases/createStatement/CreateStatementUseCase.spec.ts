import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let user: User;

describe("create statement", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

    const userAdded = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    user = await createUserUseCase.execute(userAdded);
  });

  it('givenStatement_withValidData_whenExecute_thenReturnStatement', async () => {
    {
      const statementDeposit = { user_id: user.id as string, type: OperationType.DEPOSIT, amount: 100, description: 'test' };
      const result = await createStatementUseCase.execute(statementDeposit);
      expect(result).toBeInstanceOf(Statement);
    }
    {
      const statementWithdraw = { user_id: user.id as string, type: OperationType.WITHDRAW, amount: 50, description: 'test' };
      const result = await createStatementUseCase.execute(statementWithdraw);
      expect(result).toBeInstanceOf(Statement);
    }
  });

  it('givenStatement_withValidData_whenExecute_thenThrowsCreateStatementErrorUserNotFound', async () => {
    const statement = { user_id: 'banana', type: OperationType.DEPOSIT, amount: 100, description: 'test' };
    expect(async () => {
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('givenStatement_withValidData_whenExecute_thenThrowsCreateStatementErrorInsufficientFunds', async () => {
    const statement = { user_id: user.id as string, type: OperationType.WITHDRAW, amount: 500, description: 'test' };
    expect(async () => {
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
