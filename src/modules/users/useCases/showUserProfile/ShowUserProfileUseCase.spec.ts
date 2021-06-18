import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let userId: string;
let userAdded: ICreateUserDTO;

describe("show user profile", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);

    userAdded = { name: 'John Doe', email: 'john@doe.io', password: '1234' };
    const result = await createUserUseCase.execute(userAdded);
    userId = result.id || '';
  });

  it('givenUserId_withValidData_whenExecute_thenReturnUserInfo', async () => {
    const result = await showUserProfileUseCase.execute(userId);
    expect(result).toHaveProperty('email', userAdded.email);
  });

  it('givenUserId_withInvalidId_whenExecute_thenThrowsIncorrectEmailOrPasswordError', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('banana');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
