import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("authenticate user", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);

    const userToAdd = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    await createUserUseCase.execute(userToAdd);

  });

  it('givenEmailPassword_withValidData_whenExecute_thenReturnUserInfoAndToken', async () => {

    const userToAuthenticate = { email: 'john@doe.io', password: '1234' };

    const result = await authenticateUserUseCase.execute(userToAuthenticate);

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('user.email', userToAuthenticate.email);

    expect(result).toHaveProperty('token');
  });

  it('givenNameEmailPassword_withInvalidEmail_whenExecute_thenThrowsIncorrectEmailOrPasswordError', async () => {
    expect(async () => {
      const userToAuthenticate = { email: 'john@banana.io', password: '1234' };
      await authenticateUserUseCase.execute(userToAuthenticate);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('givenNameEmailPassword_withInvalidPassword_whenExecute_thenThrowsIncorrectEmailOrPasswordError', async () => {
    expect(async () => {
      const userToAuthenticate = { email: 'john@doe.io', password: '123456' };
      await authenticateUserUseCase.execute(userToAuthenticate);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
