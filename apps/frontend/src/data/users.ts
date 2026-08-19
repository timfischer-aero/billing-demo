// src/data/users.ts
export type DemoUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export const users: DemoUser[] = [
  { id: "u1", firstName: "Dana", lastName: "Whitfield" },
  { id: "u2", firstName: "Marcus", lastName: "Reyes" },
  { id: "u3", firstName: "Priya", lastName: "Anand" },
  { id: "u4", firstName: "Tom", lastName: "Becker" },
  { id: "u5", firstName: "Tim", lastName: "Fischer" },
];