// src/data/users.ts
export type DemoUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export function findUserById(
  id: string | null,
  list: DemoUser[] = users
): DemoUser | null {
  if (id === null) return null;
  return list.find((u) => u.id === id) ?? null;
}

export function getUserDisplayName(userID: string | null) : string {
  const whoChangedUser = findUserById(userID);
  const whoChangedDisplay =
  userID === ""
    ? ""
    : whoChangedUser !== null
      ? `${whoChangedUser.firstName} ${whoChangedUser.lastName}`
      : `Unknown user (${userID})`;

  return whoChangedDisplay;
}

export const users: DemoUser[] = [
  { id: "u1", firstName: "Tim", lastName: "Fischer" },
  { id: "u2", firstName: "Peter", lastName: "Franceschi" },
  { id: "u3", firstName: "Felicia", lastName: "Winters" },
  { id: "u4", firstName: "Matthew", lastName: "Copello" },
  { id: "u5", firstName: "Joe", lastName: "Cacka" },
];