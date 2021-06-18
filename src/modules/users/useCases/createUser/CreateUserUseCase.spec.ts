import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { validate } from 'uuid';

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("create user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('givenNameEmailPassword_withValidData_whenExecute_thenReturnUser', async () => {

    const userToAdd = { name: 'John Doe', email: 'john@doe.io', password: '1234' };

    const result = await createUserUseCase.execute(userToAdd);

    expect(result).toBeInstanceOf(User);
    expect(result).toHaveProperty('id');
    expect(validate(result.id || '')).toBeTruthy();
  });

  it('givenNameEmailPassword_withDuplicatedEmail_whenExecute_thenThrowsCreateUserError', async () => {

    const firstUser = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    await createUserUseCase.execute(firstUser);

    expect(async () => {
      const userToAdd = { name: 'John Banana', email: 'john@doe.io', password: '1234' };
      await createUserUseCase.execute(userToAdd);
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
