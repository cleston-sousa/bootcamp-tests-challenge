import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";



let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let user: User;
let getBalanceUseCase: GetBalanceUseCase;

describe("get balance", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

    const userAdded = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    user = await createUserUseCase.execute(userAdded);

    const statementDeposit = { user_id: user.id as string, type: OperationType.DEPOSIT, amount: 100, description: 'test' };
    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw = { user_id: user.id as string, type: OperationType.WITHDRAW, amount: 50, description: 'test' };
    await createStatementUseCase.execute(statementWithdraw);
  });


  it('givenUserId_withValidData_whenExecute_thenReturnListOfStatementAndBalance', async () => {
    const result = await getBalanceUseCase.execute({ user_id: user.id as string });
    expect(result).toHaveProperty('statement');
    expect(result).toHaveProperty('balance');
    expect(result.statement.length).toBe(2)
    expect(result.balance).toBe(50)
  });

  it('givenUserId_withInvalidId_whenExecute_thenThrowsGetBalanceError', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'banana' });
    }).rejects.toBeInstanceOf(GetBalanceError);

  });

});
